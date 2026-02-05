using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/admin/orders")]
    [Authorize(Roles = "1")] // Admin
    public class AdminOrderController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminOrderController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AdminOrderListItemDto>>> GetAllOrders(
            [FromQuery] string? status = null,
            [FromQuery] string? q = null,
            [FromQuery] string? paymentMethod = null,
            [FromQuery] DateTimeOffset? from = null,
            [FromQuery] DateTimeOffset? to = null
        )
        {
            if (from.HasValue && to.HasValue && from.Value > to.Value)
            {
                return BadRequest(new { message = "From date must be earlier than (or equal to) To date" });
            }

            var query = _context.Orders
                .AsNoTracking()
                .Include(o => o.User)
                .OrderByDescending(o => o.CreatedAt)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(status))
            {
                var normalizedStatus = status.Trim();
                query = query.Where(o => o.Status == normalizedStatus);
            }

            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = q.Trim();

                if (int.TryParse(term, out var orderId))
                {
                    query = query.Where(o => o.Id == orderId);
                }
                else
                {
                    var like = $"%{term}%";
                    query = query.Where(o =>
                        o.User != null && (
                            EF.Functions.Like(o.User.Username ?? "", like) ||
                            EF.Functions.Like(o.User.Email ?? "", like) ||
                            EF.Functions.Like(o.User.FullName ?? "", like) ||
                            EF.Functions.Like(o.User.Phone ?? "", like)
                        )
                    );
                }
            }

            if (!string.IsNullOrWhiteSpace(paymentMethod))
            {
                var pm = (paymentMethod ?? "").Trim().ToLowerInvariant();
                var pmCompact = pm.Replace(" ", "").Replace("-", "");

                // Case-insensitive + tolerant matching:
                // normalize stored value with trim/lower + compact (remove spaces/dashes)
                query = pmCompact switch
                {
                    "bank" => query.Where(o =>
                        ((o.PaymentMethod ?? "").Trim().ToLower()).Contains("bank") ||
                        ((o.PaymentMethod ?? "").Trim().ToLower()).Contains("vietqr") ||
                        ((o.PaymentMethod ?? "").Trim().ToLower()).Contains("qr") ||
                        ((o.PaymentMethod ?? "").Trim().ToLower().Replace(" ", "").Replace("-", "")).Contains("vietqr")
                    ),
                    "vnpay" => query.Where(o =>
                        ((o.PaymentMethod ?? "").Trim().ToLower()).Contains("vnpay") ||
                        ((o.PaymentMethod ?? "").Trim().ToLower().Replace(" ", "").Replace("-", "")).Contains("vnpay")
                    ),
                    "zalopay" => query.Where(o =>
                        ((o.PaymentMethod ?? "").Trim().ToLower()).Contains("zalopay") ||
                        ((o.PaymentMethod ?? "").Trim().ToLower().Replace(" ", "").Replace("-", "")).Contains("zalopay")
                    ),
                    "cod" => query.Where(o =>
                        ((o.PaymentMethod ?? "").Trim().ToLower()).Contains("cod") ||
                        ((o.PaymentMethod ?? "").Trim().ToLower()).Contains("cash") ||
                        ((o.PaymentMethod ?? "").Trim().ToLower().Replace(" ", "").Replace("-", "")).Contains("cod")
                    ),
                    _ => query.Where(o =>
                        ((o.PaymentMethod ?? "").Trim().ToLower()).Contains(pm) ||
                        ((o.PaymentMethod ?? "").Trim().ToLower().Replace(" ", "").Replace("-", "")).Contains(pmCompact)
                    )
                };
            }

            if (from.HasValue)
            {
                var fromUtc = from.Value.UtcDateTime;
                query = query.Where(o => o.CreatedAt >= fromUtc);
            }

            if (to.HasValue)
            {
                var toUtc = to.Value.UtcDateTime;
                query = query.Where(o => o.CreatedAt <= toUtc);
            }

            // NOTE:
            // Avoid "top N items per parent" projections that can generate LATERAL joins
            // on some MySQL/MariaDB setups. We do 2 queries and stitch in memory.
            var orders = await query
                .Select(o => new AdminOrderListItemDto
                {
                    Id = o.Id,
                    UserId = o.UserId,
                    Status = o.Status,
                    Subtotal = o.Subtotal,
                    Total = o.Total,
                    ShippingAddress = o.ShippingAddress,
                    PaymentMethod = o.PaymentMethod,
                    CreatedAt = o.CreatedAt,
                    UpdatedAt = o.UpdatedAt,
                    User = o.User == null ? null : new AdminUserBriefDto
                    {
                        Id = o.User.Id,
                        Username = o.User.Username,
                        Email = o.User.Email,
                        FullName = o.User.FullName,
                        Phone = o.User.Phone
                    },
                    ItemCount = 0
                })
                .ToListAsync();

            var orderIds = orders.Select(o => o.Id).ToList();
            if (orderIds.Count == 0)
            {
                return Ok(orders);
            }

            var counts = await _context.OrderItems
                .AsNoTracking()
                .Where(oi => orderIds.Contains(oi.OrderId))
                .GroupBy(oi => oi.OrderId)
                .Select(g => new { OrderId = g.Key, Count = g.Count() })
                .ToListAsync();

            var countByOrderId = counts.ToDictionary(x => x.OrderId, x => x.Count);

            var thumbs = await (
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
                    ImageUrl = p != null ? p.ImageUrl : null
                }
            ).ToListAsync();

            // Fallback: if main Product.ImageUrl is empty, try ProductImages (sorted by SortOrder).
            var productIdsNeedingImages = thumbs
                .Where(t => t.ProductId > 0 && string.IsNullOrWhiteSpace(t.ImageUrl))
                .Select(t => t.ProductId)
                .Distinct()
                .ToList();

            Dictionary<int, string> productImageFallbackByProductId = new();
            if (productIdsNeedingImages.Count > 0)
            {
                var productImages = await _context.ProductImages
                    .AsNoTracking()
                    .Where(pi => productIdsNeedingImages.Contains(pi.ProductId))
                    .OrderBy(pi => pi.SortOrder)
                    .ThenBy(pi => pi.Id)
                    .Select(pi => new { pi.ProductId, pi.ImageUrl })
                    .ToListAsync();

                productImageFallbackByProductId = productImages
                    .GroupBy(pi => pi.ProductId)
                    .ToDictionary(
                        g => g.Key,
                        g => g.FirstOrDefault(x => !string.IsNullOrWhiteSpace(x.ImageUrl))?.ImageUrl ?? ""
                    );
            }

            if (productImageFallbackByProductId.Count > 0)
            {
                for (var i = 0; i < thumbs.Count; i++)
                {
                    if (string.IsNullOrWhiteSpace(thumbs[i].ImageUrl) &&
                        productImageFallbackByProductId.TryGetValue(thumbs[i].ProductId, out var fallback) &&
                        !string.IsNullOrWhiteSpace(fallback))
                    {
                        thumbs[i] = new
                        {
                            thumbs[i].OrderId,
                            thumbs[i].ProductId,
                            thumbs[i].ProductName,
                            ImageUrl = fallback
                        };
                    }
                }
            }

            var thumbByOrderId = thumbs
                .GroupBy(t => t.OrderId)
                .ToDictionary(
                    g => g.Key,
                    g =>
                    {
                        var firstWithImage = g.FirstOrDefault(x => !string.IsNullOrWhiteSpace(x.ImageUrl));
                        var first = firstWithImage ?? g.FirstOrDefault();
                        return new
                        {
                            ThumbUrl = first?.ImageUrl,
                            FirstProductName = first?.ProductName
                        };
                    }
                );

            foreach (var o in orders)
            {
                if (countByOrderId.TryGetValue(o.Id, out var c))
                {
                    o.ItemCount = c;
                }
                if (thumbByOrderId.TryGetValue(o.Id, out var t))
                {
                    o.ThumbUrl = t.ThumbUrl;
                    o.FirstProductName = t.FirstProductName;
                }
            }

            return Ok(orders);
        }

        public class AdminOrderListItemDto
        {
            public int Id { get; set; }
            public int UserId { get; set; }
            public string? Status { get; set; }
            public decimal Subtotal { get; set; }
            public decimal Total { get; set; }
            public string? ShippingAddress { get; set; }
            public string? PaymentMethod { get; set; }
            public DateTime CreatedAt { get; set; }
            public DateTime? UpdatedAt { get; set; }
            public AdminUserBriefDto? User { get; set; }
            public string? ThumbUrl { get; set; }
            public string? FirstProductName { get; set; }
            public int ItemCount { get; set; }
        }

        public class AdminUserBriefDto
        {
            public int Id { get; set; }
            public string? Username { get; set; }
            public string? Email { get; set; }
            public string? FullName { get; set; }
            public string? Phone { get; set; }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetOrderDetail(int id)
        {
            var order = await _context.Orders
                .AsNoTracking()
                .Include(o => o.User)
                .Include(o => o.Payments)
                .Include(o => o.Items)
                    .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound(new { message = "Order not found" });
            }

            return Ok(new
            {
                order.Id,
                order.UserId,
                order.Status,
                order.Subtotal,
                order.Total,
                order.ShippingAddress,
                order.PaymentMethod,
                order.CreatedAt,
                order.UpdatedAt,
                User = order.User == null ? null : new
                {
                    order.User.Id,
                    order.User.Username,
                    order.User.Email,
                    order.User.FullName,
                    order.User.Phone,
                    order.User.Address
                },
                Items = order.Items.Select(i => new
                {
                    i.Id,
                    i.ProductId,
                    Product = i.Product == null ? null : new
                    {
                        i.Product.Id,
                        i.Product.Name,
                        i.Product.ImageUrl
                    },
                    i.Quantity,
                    i.UnitPrice,
                    i.TotalPrice
                }),
                Payments = order.Payments.Select(p => new
                {
                    p.Id,
                    p.Amount,
                    p.Currency,
                    p.Status,
                    p.Provider,
                    p.Method,
                    p.Reference,
                    p.CreatedAt
                })
            });
        }

        [HttpPut("{id}/status")]
        public async Task<ActionResult<object>> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Status))
            {
                return BadRequest(new { message = "Status is required" });
            }

            var normalized = NormalizeStatus(dto.Status);
            if (normalized == null)
            {
                return BadRequest(new
                {
                    message = "Invalid status",
                    allowed = AllowedStatuses
                });
            }

            var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == id);
            if (order == null)
            {
                return NotFound(new { message = "Order not found" });
            }

            order.Status = normalized;
            order.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                order.Id,
                order.Status,
                order.UpdatedAt
            });
        }

        private static readonly string[] AllowedStatuses = new[]
        {
            "Pending",
            "Paid",
            "Processing",
            "Shipped",
            "Completed",
            "Cancelled"
        };

        private static string? NormalizeStatus(string input)
        {
            var trimmed = (input ?? "").Trim();
            if (trimmed.Length == 0) return null;

            foreach (var s in AllowedStatuses)
            {
                if (string.Equals(s, trimmed, StringComparison.OrdinalIgnoreCase))
                {
                    return s;
                }
            }

            return null;
        }

        public class UpdateOrderStatusDto
        {
            public string Status { get; set; } = string.Empty;
        }
    }
}

