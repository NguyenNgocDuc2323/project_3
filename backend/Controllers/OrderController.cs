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

        public OrderController(ApplicationDbContext context, IPaymentService paymentService)
        {
            _context = context;
            _paymentService = paymentService;
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

            var subtotal = cartItems.Sum(ci => ci.Product.MRP * ci.Quantity);
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
                var m when m.Contains("zalopay") => "ZaloPay",
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
                    UnitPrice = item.Product.MRP,
                    TotalPrice = item.Product.MRP * item.Quantity
                };
                _context.OrderItems.Add(orderItem);
            }

            await _context.SaveChangesAsync();

            string? paymentUrl = null;
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";

            switch (orderDto.PaymentMethod.ToLower())
            {
                case string method when method.Contains("vnpay"):
                    paymentUrl = _paymentService.CreateVnpayPaymentUrl(order.Id, total, ipAddress);
                    break;
                case string method when method.Contains("zalopay"):
                    paymentUrl = await _paymentService.CreateZalopayPaymentUrl(order.Id, total);
                    break;
                case "bank":
                    paymentUrl = $"https://img.vietqr.io/image/970422-123456789-compact2.jpg?amount={total}&addInfo=Thanh%20toan%20don%20hang%20{order.Id}";
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

        public class CreateOrderDto
        {
            public string ShippingAddress { get; set; } = string.Empty;
            public string? ShippingMethod { get; set; } = "standard";
            public string PaymentMethod { get; set; } = string.Empty;
            public string? Phone { get; set; }
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
