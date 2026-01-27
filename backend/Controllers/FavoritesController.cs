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
                .Include(item => item.Product)
                .ThenInclude(product => product.Category)
                .OrderByDescending(item => item.CreatedAt)
                .Select(item => new FavoriteDto
                {
                    Id = item.Id,
                    ProductId = item.ProductId,
                    CreatedAt = item.CreatedAt,
                    Product = item.Product
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
            public Product? Product { get; set; }
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
