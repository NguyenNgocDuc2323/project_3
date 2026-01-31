using System.Security.Claims;
using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/favorites")]
    [Authorize]
    public class FavoritesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public FavoritesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<FavoriteDto>>> GetFavorites()
        {
            var userId = GetUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            var favorites = await _context.Favorites
                .Where(item => item.UserId == userId.Value)
                .OrderByDescending(item => item.CreatedAt)
                .Select(item => new FavoriteDto
                {
                    Id = item.Id,
                    ProductId = item.ProductId,
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

            return Ok(favorites);
        }

        [HttpGet("contains/{productId}")]
        public async Task<ActionResult<FavoriteContainsDto>> Contains(int productId)
        {
            var userId = GetUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            var exists = await _context.Favorites
                .AnyAsync(item => item.UserId == userId.Value && item.ProductId == productId);

            return Ok(new FavoriteContainsDto { IsFavorite = exists });
        }

        [HttpGet("count/{productId}")]
        [AllowAnonymous]
        public async Task<ActionResult<FavoriteCountDto>> GetCount(int productId)
        {
            var count = await _context.Favorites
                .Where(item => item.ProductId == productId)
                .CountAsync();

            return Ok(new FavoriteCountDto { Count = count });
        }

        [HttpPost]
        public async Task<ActionResult<FavoriteContainsDto>> AddFavorite([FromBody] FavoriteRequest request)
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

            var existing = await _context.Favorites
                .FirstOrDefaultAsync(item => item.UserId == userId.Value && item.ProductId == request.ProductId);

            if (existing == null)
            {
                var favorite = new Favorite
                {
                    UserId = userId.Value,
                    ProductId = request.ProductId,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Favorites.Add(favorite);
                await _context.SaveChangesAsync();
            }

            return Ok(new FavoriteContainsDto { IsFavorite = true });
        }

        [HttpDelete("{productId}")]
        public async Task<IActionResult> RemoveFavorite(int productId)
        {
            var userId = GetUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            var existing = await _context.Favorites
                .FirstOrDefaultAsync(item => item.UserId == userId.Value && item.ProductId == productId);

            if (existing == null)
            {
                return NotFound();
            }

            _context.Favorites.Remove(existing);
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

        public class FavoriteRequest
        {
            public int ProductId { get; set; }
        }

        public class FavoriteDto
        {
            public int Id { get; set; }
            public int ProductId { get; set; }
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

        public class FavoriteContainsDto
        {
            public bool IsFavorite { get; set; }
        }

        public class FavoriteCountDto
        {
            public int Count { get; set; }
        }
    }
}
