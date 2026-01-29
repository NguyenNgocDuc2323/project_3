using System.Security.Claims;
using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/orders")]
    [Authorize]
    public class OrderController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OrderController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<ActionResult<OrderDto>> CreateOrder([FromBody] CreateOrderRequest request)
        {
            var userId = GetUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            // Get cart items
            var cart = await _context.Carts
                .FirstOrDefaultAsync(c => c.UserId == userId.Value);
            
            if (cart == null)
            {
                return BadRequest(new { message = "Cart is empty" });
            }

            var cartItems = await _context.CartItems
                .Include(ci => ci.Product)
                .Where(ci => ci.CartId == cart.Id)
                .ToListAsync();

            if (cartItems == null || cartItems.Count == 0)
            {
                return BadRequest(new { message = "Cart is empty" });
            }

            // Calculate totals
            decimal subtotal = 0;
            foreach (var cartItem in cartItems)
            {
                var price = cartItem.Product?.OriginalPrice ?? cartItem.Product?.MRP ?? 0;
                subtotal += price * cartItem.Quantity;
            }
            decimal shipping = subtotal > 0 ? 10 : 0; // $10 shipping fee
            decimal total = subtotal + shipping;

            // Create order
            var order = new Order
            {
                UserId = userId.Value,
                Status = "Pending",
                Subtotal = subtotal,
                Total = total,
                ShippingAddress = request.ShippingAddress,
                PaymentMethod = request.PaymentMethod,
                CreatedAt = DateTime.UtcNow
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Create order items
            foreach (var cartItem in cartItems)
            {
                var price = cartItem.Product?.OriginalPrice ?? cartItem.Product?.MRP ?? 0;
                var orderItem = new OrderItem
                {
                    OrderId = order.Id,
                    ProductId = cartItem.ProductId,
                    Quantity = cartItem.Quantity,
                    UnitPrice = price,
                    TotalPrice = price * cartItem.Quantity
                };
                _context.OrderItems.Add(orderItem);
            }

            // Create payment record
            var payment = new Payment
            {
                OrderId = order.Id,
                UserId = userId.Value,
                Amount = total,
                Currency = "USD",
                Status = request.PaymentMethod == "cod" ? "Pending" : "Pending",
                Method = request.PaymentMethod,
                Provider = request.PaymentMethod == "vnpay" ? "VNPay" : null,
                CreatedAt = DateTime.UtcNow
            };

            _context.Payments.Add(payment);

            // Clear cart
            _context.CartItems.RemoveRange(cartItems);

            await _context.SaveChangesAsync();

            // Handle VNPay payment
            string? paymentUrl = null;
            if (request.PaymentMethod == "vnpay")
            {
                // TODO: Generate VNPay payment URL
                // For now, return order with payment info
                paymentUrl = $"/payment/vnpay/{order.Id}";
            }

            return Ok(new OrderDto
            {
                Id = order.Id,
                Status = order.Status,
                Subtotal = order.Subtotal,
                Total = order.Total,
                ShippingAddress = order.ShippingAddress,
                PaymentMethod = order.PaymentMethod,
                CreatedAt = order.CreatedAt,
                PaymentUrl = paymentUrl
            });
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetOrders()
        {
            var userId = GetUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            var orders = await _context.Orders
                .Where(o => o.UserId == userId.Value)
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new OrderDto
                {
                    Id = o.Id,
                    Status = o.Status,
                    Subtotal = o.Subtotal,
                    Total = o.Total,
                    ShippingAddress = o.ShippingAddress,
                    PaymentMethod = o.PaymentMethod,
                    CreatedAt = o.CreatedAt
                })
                .ToListAsync();

            return Ok(orders);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<OrderDetailDto>> GetOrder(int id)
        {
            var userId = GetUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            var order = await _context.Orders
                .Include(o => o.Items)
                .ThenInclude(oi => oi.Product)
                .Where(o => o.Id == id && o.UserId == userId.Value)
                .FirstOrDefaultAsync();

            if (order == null)
            {
                return NotFound(new { message = "Order not found" });
            }

            return Ok(new OrderDetailDto
            {
                Id = order.Id,
                Status = order.Status,
                Subtotal = order.Subtotal,
                Total = order.Total,
                ShippingAddress = order.ShippingAddress,
                PaymentMethod = order.PaymentMethod,
                CreatedAt = order.CreatedAt,
                Items = order.Items.Select(oi => new OrderItemDto
                {
                    Id = oi.Id,
                    ProductId = oi.ProductId,
                    ProductName = oi.Product?.Name ?? "",
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    TotalPrice = oi.TotalPrice,
                    Product = oi.Product != null ? new ProductDto
                    {
                        Id = oi.Product.Id,
                        Name = oi.Product.Name,
                        ImageUrl = oi.Product.ImageUrl
                    } : null
                }).ToList()
            });
        }

        private int? GetUserId()
        {
            var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (int.TryParse(userIdValue, out var userId))
            {
                return userId;
            }
            return null;
        }
    }

    public class CreateOrderRequest
    {
        public string ShippingAddress { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public decimal Subtotal { get; set; }
        public decimal Total { get; set; }
        public List<OrderItemRequest> Items { get; set; } = new List<OrderItemRequest>();
    }

    public class OrderItemRequest
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }

    public class OrderDto
    {
        public int Id { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal Subtotal { get; set; }
        public decimal Total { get; set; }
        public string? ShippingAddress { get; set; }
        public string? PaymentMethod { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? PaymentUrl { get; set; }
    }

    public class OrderDetailDto
    {
        public int Id { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal Subtotal { get; set; }
        public decimal Total { get; set; }
        public string? ShippingAddress { get; set; }
        public string? PaymentMethod { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<OrderItemDto> Items { get; set; } = new List<OrderItemDto>();
    }

    public class OrderItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public ProductDto? Product { get; set; }
    }

    public class ProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
    }
}

