using System.Security.Claims;
using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/cart")]
    [Authorize]
    public class CartController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CartController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CartItemDto>>> GetCartItems()
        {
            try
            {
                var userId = GetUserId();
                if (userId == null)
                {
                    return Unauthorized();
                }

                // Load cart items with products and categories
                var items = await _context.CartItems
                    .Where(item => item.UserId == userId.Value)
                    .Include(item => item.Product!)
                        .ThenInclude(product => product.Category)
                    .OrderByDescending(item => item.CreatedAt)
                    .ToListAsync();

                // Map to DTO, handling null products
                var result = items.Select(item => new CartItemDto
                {
                    Id = item.Id,
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    CreatedAt = item.CreatedAt,
                    Product = item.Product // Can be null if product was deleted
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                // Log the exception for debugging
                Console.WriteLine($"Error in GetCartItems: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                
                // Return empty list instead of 500 error
                return Ok(new List<CartItemDto>());
            }
        }

        [HttpGet("count")]
        public async Task<ActionResult<CartCountDto>> GetCartCount()
        {
            var userId = GetUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            var count = await _context.CartItems
                .Where(item => item.UserId == userId.Value)
                .Select(item => (int?)item.Quantity)
                .SumAsync() ?? 0;

            return Ok(new CartCountDto { Count = count });
        }

        [HttpGet("contains/{productId}")]
        public async Task<ActionResult<CartContainsDto>> Contains(int productId)
        {
            var userId = GetUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            var exists = await _context.CartItems
                .AnyAsync(item => item.UserId == userId.Value && item.ProductId == productId);

            return Ok(new CartContainsDto { InCart = exists });
        }

        [HttpPost("add")]
        public async Task<ActionResult<CartItemDto>> AddToCart([FromBody] CartItemRequest request)
        {
            if (request.ProductId <= 0)
            {
                return BadRequest("ProductId is required.");
            }

            var userId = GetUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            var productExists = await _context.Products.AnyAsync(product => product.Id == request.ProductId);
            if (!productExists)
            {
                return NotFound("Product not found.");
            }

            var quantityToAdd = request.Quantity > 0 ? request.Quantity : 1;

            var existingItem = await _context.CartItems
                .FirstOrDefaultAsync(item => item.UserId == userId.Value && item.ProductId == request.ProductId);

            if (existingItem != null)
            {
                existingItem.Quantity += quantityToAdd;
                existingItem.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                existingItem = new CartItem
                {
                    UserId = userId.Value,
                    ProductId = request.ProductId,
                    Quantity = quantityToAdd,
                    CreatedAt = DateTime.UtcNow
                };
                _context.CartItems.Add(existingItem);
            }

            await _context.SaveChangesAsync();

            var finalItem = await _context.CartItems
                .Include(item => item.Product!)
                .ThenInclude(product => product.Category)
                .FirstAsync(item => item.Id == existingItem.Id);

            return Ok(new CartItemDto
            {
                Id = finalItem.Id,
                ProductId = finalItem.ProductId,
                Quantity = finalItem.Quantity,
                CreatedAt = finalItem.CreatedAt,
                Product = finalItem.Product
            });
        }

        [HttpPut("{productId}")]
        public async Task<IActionResult> UpdateQuantity(int productId, [FromBody] CartItemUpdateRequest request)
        {
            var userId = GetUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            var existingItem = await _context.CartItems
                .FirstOrDefaultAsync(item => item.UserId == userId.Value && item.ProductId == productId);

            if (existingItem == null)
            {
                return NotFound();
            }

            if (request.Quantity <= 0)
            {
                _context.CartItems.Remove(existingItem);
                await _context.SaveChangesAsync();
                return NoContent();
            }

            existingItem.Quantity = request.Quantity;
            existingItem.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("clear")]
        public async Task<IActionResult> ClearCart()
        {
            var userId = GetUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            var userCartItems = await _context.CartItems
                .Where(item => item.UserId == userId.Value)
                .ToListAsync();

            if (userCartItems.Count == 0)
            {
                return NoContent();
            }

            _context.CartItems.RemoveRange(userCartItems);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{productId}")]
        public async Task<IActionResult> RemoveFromCart(int productId)
        {
            var userId = GetUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            var existingItem = await _context.CartItems
                .FirstOrDefaultAsync(item => item.UserId == userId.Value && item.ProductId == productId);

            if (existingItem == null)
            {
                return NotFound();
            }

            _context.CartItems.Remove(existingItem);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("update-order")]
        public async Task<IActionResult> UpdateOrder([FromBody] CartOrderUpdateRequest request)
        {
            var userId = GetUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            if (request.ItemOrders == null || request.ItemOrders.Count == 0)
            {
                return BadRequest("ItemOrders is required.");
            }

            // Validate all items belong to the user
            var itemIds = request.ItemOrders.Select(io => io.ItemId).ToList();
            var userItems = await _context.CartItems
                .Where(item => item.UserId == userId.Value && itemIds.Contains(item.Id))
                .ToListAsync();

            if (userItems.Count != itemIds.Count)
            {
                return BadRequest("Some items do not belong to the user.");
            }

            // Update UpdatedAt for each item (SortOrder not used)
            foreach (var itemOrder in request.ItemOrders)
            {
                var item = userItems.FirstOrDefault(i => i.Id == itemOrder.ItemId);
                if (item != null)
                {
                    item.UpdatedAt = DateTime.UtcNow;
                }
            }

            await _context.SaveChangesAsync();

            return NoContent();
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

        public class CartItemRequest
        {
            public int ProductId { get; set; }
            public int Quantity { get; set; } = 1;
        }

        public class CartItemUpdateRequest
        {
            public int Quantity { get; set; }
        }

        public class CartItemDto
        {
            public int Id { get; set; }
            public int ProductId { get; set; }
            public int Quantity { get; set; }
            public DateTime CreatedAt { get; set; }
            public Product? Product { get; set; }
        }

        public class CartOrderUpdateRequest
        {
            public List<CartItemOrder> ItemOrders { get; set; } = new List<CartItemOrder>();
        }

        public class CartItemOrder
        {
            public int ItemId { get; set; }
            public int SortOrder { get; set; }
        }

        public class CartCountDto
        {
            public int Count { get; set; }
        }

        public class CartContainsDto
        {
            public bool InCart { get; set; }
        }
    }
}
