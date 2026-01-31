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
<<<<<<< Updated upstream
                return Unauthorized();
            }

            var items = await _context.CartItems
                .Include(item => item.Product)
                .ThenInclude(product => product!.Category)
                .Where(item => item.UserId == userId.Value)
                .OrderByDescending(item => item.CreatedAt)
                .Select(item => new CartItemDto
=======
                var userId = GetUserId();
                if (userId == null)
>>>>>>> Stashed changes
                {
                    return Unauthorized();
                }

                var items = await _context.CartItems
                    .Where(item => item.UserId == userId.Value)
                    .OrderByDescending(item => item.CreatedAt)
                    .Select(item => new CartItemDto
                    {
                        Id = item.Id,
                        ProductId = item.ProductId,
                        Quantity = item.Quantity,
                        CreatedAt = item.CreatedAt,
                        Product = item.Product != null ? new ProductDto
                        {
                            Id = item.Product.Id,
                            Name = item.Product.Name,
                            StyleCode = item.Product.StyleCode,
                            ProductType = item.Product.ProductType,
                            Brand = item.Product.Brand,
                            GoldCarat = item.Product.GoldCarat,
                            MRP = item.Product.MRP,
                            OriginalPrice = item.Product.OriginalPrice,
                            ImageUrl = item.Product.ImageUrl,
                            Views = item.Product.Views,
                            Likes = item.Product.Likes,
                            CategoryId = item.Product.CategoryId,
                            Category = item.Product.Category != null ? new CategoryDto
                            {
                                Id = item.Product.Category.Id,
                                Name = item.Product.Category.Name,
                                Description = item.Product.Category.Description
                            } : null,
                            IsFeatured = item.Product.IsFeatured,
                            CreatedAt = item.Product.CreatedAt
                        } : null
                    })
                    .ToListAsync();

                return Ok(items);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while loading cart items.", error = ex.Message });
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
                .SumAsync(item => (int?)item.Quantity) ?? 0;

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
            try
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

                var itemWithProduct = await _context.CartItems
                    .Include(item => item.Product)
                    .ThenInclude(product => product!.Category)
                    .FirstAsync(item => item.Id == existingItem.Id);

                return Ok(new CartItemDto
                {
                    Id = itemWithProduct.Id,
                    ProductId = itemWithProduct.ProductId,
                    Quantity = itemWithProduct.Quantity,
                    CreatedAt = itemWithProduct.CreatedAt,
                    Product = itemWithProduct.Product
                });
            }
<<<<<<< Updated upstream
            catch (Exception ex)
            {
                // Log the full exception for debugging
                Console.WriteLine($"Error in AddToCart: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                return StatusCode(500, new { message = "An error occurred while adding item to cart", error = ex.Message });
            }
=======

            await _context.SaveChangesAsync();

            var itemWithProduct = await _context.CartItems
                .Where(item => item.Id == existingItem.Id)
                .Select(item => new CartItemDto
                {
                    Id = item.Id,
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    CreatedAt = item.CreatedAt,
                    Product = item.Product != null ? new ProductDto
                    {
                        Id = item.Product.Id,
                        Name = item.Product.Name,
                        StyleCode = item.Product.StyleCode,
                        ProductType = item.Product.ProductType,
                        Brand = item.Product.Brand,
                        GoldCarat = item.Product.GoldCarat,
                        MRP = item.Product.MRP,
                        OriginalPrice = item.Product.OriginalPrice,
                        ImageUrl = item.Product.ImageUrl,
                        Views = item.Product.Views,
                        Likes = item.Product.Likes,
                        CategoryId = item.Product.CategoryId,
                        Category = item.Product.Category != null ? new CategoryDto
                        {
                            Id = item.Product.Category.Id,
                            Name = item.Product.Category.Name,
                            Description = item.Product.Category.Description
                        } : null,
                        IsFeatured = item.Product.IsFeatured,
                        CreatedAt = item.Product.CreatedAt
                    } : null
                })
                .FirstAsync();

            return Ok(itemWithProduct);
>>>>>>> Stashed changes
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

        [HttpDelete("clear")]
        public async Task<IActionResult> ClearCart()
        {
            var userId = GetUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            var cartItems = await _context.CartItems
                .Where(item => item.UserId == userId.Value)
                .ToListAsync();

            _context.CartItems.RemoveRange(cartItems);
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
            public ProductDto? Product { get; set; }
        }

        public class ProductDto
        {
            public int Id { get; set; }
            public string Name { get; set; } = string.Empty;
            public string StyleCode { get; set; } = string.Empty;
            public string ProductType { get; set; } = string.Empty;
            public string Brand { get; set; } = string.Empty;
            public string GoldCarat { get; set; } = string.Empty;
            public decimal MRP { get; set; }
            public decimal OriginalPrice { get; set; }
            public string ImageUrl { get; set; } = string.Empty;
            public int Views { get; set; }
            public int Likes { get; set; }
            public int? CategoryId { get; set; }
            public CategoryDto? Category { get; set; }
            public bool IsFeatured { get; set; }
            public DateTime CreatedAt { get; set; }
        }

        public class CategoryDto
        {
            public int Id { get; set; }
            public string Name { get; set; } = string.Empty;
            public string? Description { get; set; }
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
