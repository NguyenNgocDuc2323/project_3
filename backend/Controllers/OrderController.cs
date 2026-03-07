using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Backend.Models;
using Backend.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/orders")]
    [Authorize]
    public class OrderController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IPaymentService _paymentService;
        private readonly IConfiguration _configuration;

        public OrderController(ApplicationDbContext context, IPaymentService paymentService, IConfiguration configuration)
        {
            _context = context;
            _paymentService = paymentService;
            _configuration = configuration;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderSummaryDto>>> GetOrders()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
            var userId = int.Parse(userIdStr);

            // NOTE:
            // MariaDB (and some MySQL versions) don't support LATERAL joins which EF may generate
            // when projecting "top N items per parent". We avoid that by doing 2 queries:
            // 1) load orders, 2) load item previews and stitch in memory.
            var orders = await _context.Orders
                .AsNoTracking()
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new OrderSummaryDto
                {
                    Id = o.Id,
                    Status = o.Status,
                    Subtotal = o.Subtotal,
                    Total = o.Total,
                    ShippingAddress = o.ShippingAddress,
                    PaymentMethod = o.PaymentMethod,
                    CreatedAt = o.CreatedAt,
                    UpdatedAt = o.UpdatedAt,
                    ItemCount = _context.OrderItems.Count(oi => oi.OrderId == o.Id),
                    ItemsPreview = new List<OrderItemPreviewDto>()
                })
                .ToListAsync();

            var orderIds = orders.Select(o => o.Id).ToList();
            if (orderIds.Count == 0)
            {
                return Ok(orders);
            }

            var previews = await (
                from oi in _context.OrderItems.AsNoTracking()
                where orderIds.Contains(oi.OrderId)
                join p in _context.Products.AsNoTracking() on oi.ProductId equals p.Id into pj
                from p in pj.DefaultIfEmpty()
                orderby oi.OrderId, oi.Id
                select new
                {
                    oi.OrderId,
                    oi.ProductId,
                    ProductName = p != null ? p.Name : null,
                    ImageUrl = p != null ? p.ImageUrl : null,
                    oi.Quantity,
                    oi.UnitPrice,
                    oi.TotalPrice
                }
            ).ToListAsync();

            var previewsByOrderId = previews
                .GroupBy(p => p.OrderId)
                .ToDictionary(
                    g => g.Key,
                    g => g
                        .Select(i => new OrderItemPreviewDto
                        {
                            ProductId = i.ProductId,
                            ProductName = i.ProductName,
                            ImageUrl = i.ImageUrl,
                            Quantity = i.Quantity,
                            UnitPrice = i.UnitPrice,
                            TotalPrice = i.TotalPrice
                        })
                        .ToList()
                );

            foreach (var o in orders)
            {
                if (previewsByOrderId.TryGetValue(o.Id, out var list))
                {
                    o.ItemsPreview = list;
                }
            }

            return Ok(orders);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Order>> GetOrder(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var order = await _context.Orders
                .Include(o => o.Items)
                .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

            if (order == null)
            {
                return NotFound();
            }

            return Ok(order);
        }

        [HttpPost]
        public async Task<ActionResult<Order>> CreateOrder([FromBody] CreateOrderDto orderDto)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
            var userId = int.Parse(userIdStr);

            var phone = (orderDto.Phone ?? "").Trim();
            if (phone.Length > 0 && !System.Text.RegularExpressions.Regex.IsMatch(phone, @"^\d{10}$"))
            {
                return BadRequest(new { message = "Phone number must be exactly 10 digits" });
            }

            var cartItems = await _context.CartItems
                .Include(ci => ci.Product)
                .Where(ci => ci.UserId == userId)
                .ToListAsync();

            if (cartItems.Count == 0)
            {
                return BadRequest("Cart is empty");
            }

            var subtotal = cartItems.Sum(ci => (ci.Product?.MRP ?? 0m) * ci.Quantity);
            var shippingFee = string.Equals((orderDto.ShippingMethod ?? "standard").Trim(), "express", StringComparison.OrdinalIgnoreCase)
                ? 25000m
                : 0m;
            var paymentFee = (orderDto.PaymentMethod ?? "").Trim().Equals("cod", StringComparison.OrdinalIgnoreCase)
                ? 15000m
                : 0m;
            var total = subtotal + shippingFee + paymentFee;

            var order = new Order
            {
                UserId = userId,
                Status = "Pending",
                Subtotal = subtotal,
                Total = total,
                ShippingAddress = orderDto.ShippingAddress,
                PaymentMethod = orderDto.PaymentMethod,
                CreatedAt = DateTime.UtcNow
            };

            _context.Orders.Add(order);

            // Persist phone to user profile (so admin list can show it).
            if (!string.IsNullOrWhiteSpace(phone))
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
                if (user != null && string.IsNullOrWhiteSpace(user.Phone))
                {
                    user.Phone = phone;
                    user.UpdatedAt = DateTime.UtcNow;
                }
            }

            await _context.SaveChangesAsync();

            var paymentMethodNormalized = (orderDto.PaymentMethod ?? "").Trim();
            var provider = paymentMethodNormalized.ToLowerInvariant() switch
            {
                var m when m.Contains("vnpay") => "VNPay",
                "bank" => "VietQR",
                "cod" => "COD",
                _ => paymentMethodNormalized
            };

            var payment = new Payment
            {
                OrderId = order.Id,
                UserId = userId,
                Amount = total,
                Currency = "VND",
                Status = "Pending",
                Provider = provider,
                Method = paymentMethodNormalized,
                Reference = $"ORDER-{order.Id}",
                CreatedAt = DateTime.UtcNow
            };
            _context.Payments.Add(payment);

            foreach (var item in cartItems)
            {
                var orderItem = new OrderItem
                {
                    OrderId = order.Id,
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = item.Product?.MRP ?? 0m,
                    TotalPrice = (item.Product?.MRP ?? 0m) * item.Quantity
                };
                _context.OrderItems.Add(orderItem);
            }

            await _context.SaveChangesAsync();

            string? paymentUrl = null;
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";

            var paymentMethodLower = (orderDto.PaymentMethod ?? "").ToLowerInvariant();
            switch (paymentMethodLower)
            {
                case string method when method.Contains("vnpay"):
                    paymentUrl = _paymentService.CreateVnpayPaymentUrl(order.Id, total, ipAddress);
                    break;
                case "bank":
                    paymentUrl = BuildBankQrUrl(total, order.Id);
                    break;
                case "cod":
                    break;
            }

            return Ok(new
            {
                order,
                paymentUrl,
                pricing = new
                {
                    subtotal,
                    shippingFee,
                    paymentFee,
                    total
                }
            });
        }

        [HttpPost("buy-now")]
        public async Task<ActionResult<Order>> BuyNow([FromBody] BuyNowOrderDto orderDto)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
            var userId = int.Parse(userIdStr);

            if (orderDto.ProductId <= 0 || orderDto.Quantity <= 0)
            {
                return BadRequest(new { message = "Invalid product or quantity" });
            }

            var phone = (orderDto.Phone ?? "").Trim();
            if (phone.Length > 0 && !System.Text.RegularExpressions.Regex.IsMatch(phone, @"^\d{10}$"))
            {
                return BadRequest(new { message = "Phone number must be exactly 10 digits" });
            }

            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == orderDto.ProductId);
            if (product == null)
            {
                return NotFound(new { message = "Product not found" });
            }

            var subtotal = product.MRP * orderDto.Quantity;
            var shippingFee = string.Equals((orderDto.ShippingMethod ?? "standard").Trim(), "express", StringComparison.OrdinalIgnoreCase)
                ? 25000m
                : 0m;
            var paymentFee = (orderDto.PaymentMethod ?? "").Trim().Equals("cod", StringComparison.OrdinalIgnoreCase)
                ? 15000m
                : 0m;
            var total = subtotal + shippingFee + paymentFee;

            var order = new Order
            {
                UserId = userId,
                Status = "Pending",
                Subtotal = subtotal,
                Total = total,
                ShippingAddress = orderDto.ShippingAddress,
                PaymentMethod = orderDto.PaymentMethod,
                CreatedAt = DateTime.UtcNow
            };

            _context.Orders.Add(order);

            // Persist phone to user profile (so admin list can show it).
            if (!string.IsNullOrWhiteSpace(phone))
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
                if (user != null && string.IsNullOrWhiteSpace(user.Phone))
                {
                    user.Phone = phone;
                    user.UpdatedAt = DateTime.UtcNow;
                }
            }

            await _context.SaveChangesAsync();

            var paymentMethodNormalized = (orderDto.PaymentMethod ?? "").Trim();
            var provider = paymentMethodNormalized.ToLowerInvariant() switch
            {
                var m when m.Contains("vnpay") => "VNPay",
                "bank" => "VietQR",
                "cod" => "COD",
                _ => paymentMethodNormalized
            };

            var payment = new Payment
            {
                OrderId = order.Id,
                UserId = userId,
                Amount = total,
                Currency = "VND",
                Status = "Pending",
                Provider = provider,
                Method = paymentMethodNormalized,
                Reference = $"ORDER-{order.Id}",
                CreatedAt = DateTime.UtcNow
            };
            _context.Payments.Add(payment);

            var orderItem = new OrderItem
            {
                OrderId = order.Id,
                ProductId = product.Id,
                Quantity = orderDto.Quantity,
                UnitPrice = product.MRP,
                TotalPrice = product.MRP * orderDto.Quantity
            };
            _context.OrderItems.Add(orderItem);

            await _context.SaveChangesAsync();

            string? paymentUrl = null;
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
            var paymentMethodLower = (orderDto.PaymentMethod ?? "").ToLowerInvariant();

            switch (paymentMethodLower)
            {
                case string method when method.Contains("vnpay"):
                    paymentUrl = _paymentService.CreateVnpayPaymentUrl(order.Id, total, ipAddress);
                    break;
                case "bank":
                    paymentUrl = BuildBankQrUrl(total, order.Id);
                    break;
                case "cod":
                    break;
            }

            return Ok(new
            {
                order,
                paymentUrl,
                pricing = new
                {
                    subtotal,
                    shippingFee,
                    paymentFee,
                    total
                }
            });
        }

        [HttpPost("confirm-payment")]
        public async Task<ActionResult<object>> ConfirmPayment([FromBody] ConfirmPaymentDto dto)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
            var userId = int.Parse(userIdStr);

            if (dto.OrderId <= 0)
            {
                return BadRequest(new { message = "OrderId is required" });
            }

            var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == dto.OrderId && o.UserId == userId);
            if (order == null)
            {
                return NotFound(new { message = "Order not found" });
            }

            order.Status = "Paid";
            order.UpdatedAt = DateTime.UtcNow;

            var payment = await _context.Payments
                .Where(p => p.OrderId == order.Id)
                .OrderByDescending(p => p.CreatedAt)
                .FirstOrDefaultAsync();

            if (payment != null)
            {
                payment.Status = "Paid";
                payment.PaidAt = DateTime.UtcNow;
                payment.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                order.Id,
                order.Status,
                order.UpdatedAt
            });
        }

        [HttpPost("{id}/confirm-delivery")]
        public async Task<ActionResult<object>> ConfirmDelivery(int id)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
            var userId = int.Parse(userIdStr);

            var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);
            if (order == null)
                return NotFound(new { message = "Order not found" });

            var current = (order.Status ?? "").Trim();
            if (current != "Paid" && current != "Shipped")
            {
                return BadRequest(new
                {
                    message = "Chỉ có thể xác nhận đã nhận hàng khi đơn ở trạng thái Đã thanh toán (Paid) hoặc Đang giao (Shipped).",
                    currentStatus = order.Status
                });
            }

            order.Status = "Completed";
            order.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                order.Id,
                order.Status,
                order.UpdatedAt
            });
        }

        public class CreateOrderDto
        {
            public string ShippingAddress { get; set; } = string.Empty;
            public string? ShippingMethod { get; set; } = "standard";
            public string PaymentMethod { get; set; } = string.Empty;
            public string? Phone { get; set; }
        }

        public class BuyNowOrderDto
        {
            public int ProductId { get; set; }
            public int Quantity { get; set; } = 1;
            public string ShippingAddress { get; set; } = string.Empty;
            public string? ShippingMethod { get; set; } = "standard";
            public string PaymentMethod { get; set; } = string.Empty;
            public string? Phone { get; set; }
        }

        public class ConfirmPaymentDto
        {
            public int OrderId { get; set; }
            public string? Provider { get; set; }
        }

        private string BuildBankQrUrl(decimal total, int orderId)
        {
            var template = _configuration["BankTransfer:QrUrlTemplate"]
                ?? "https://img.vietqr.io/image/TCB-8886189630-compact2.png?amount={amount}&addInfo={addInfo}";
            var amountValue = ((long)decimal.Round(total, 0, MidpointRounding.AwayFromZero)).ToString();
            var addInfoValue = Uri.EscapeDataString($"ORDER-{orderId}");

            return template
                .Replace("{amount}", amountValue)
                .Replace("{addInfo}", addInfoValue);
        }

        public class OrderSummaryDto
        {
            public int Id { get; set; }
            public string Status { get; set; } = "Pending";
            public decimal Subtotal { get; set; }
            public decimal Total { get; set; }
            public string? ShippingAddress { get; set; }
            public string? PaymentMethod { get; set; }
            public DateTime CreatedAt { get; set; }
            public DateTime? UpdatedAt { get; set; }
            public int ItemCount { get; set; }
            public List<OrderItemPreviewDto> ItemsPreview { get; set; } = new List<OrderItemPreviewDto>();
        }

        public class OrderItemPreviewDto
        {
            public int ProductId { get; set; }
            public string? ProductName { get; set; }
            public string? ImageUrl { get; set; }
            public int Quantity { get; set; }
            public decimal UnitPrice { get; set; }
            public decimal TotalPrice { get; set; }
        }
    }
}
