using System.Security.Claims;
using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/reviews")]
    public class ReviewsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReviewsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("product/{productId}")]
        public async Task<ActionResult<IEnumerable<ReviewDto>>> GetByProduct(int productId)
        {
            var reviews = await _context.Reviews
                .Where(review => review.ProductId == productId)
                .Include(review => review.User)
                .OrderByDescending(review => review.CreatedAt)
                .Select(review => new ReviewDto
                {
                    Id = review.Id,
                    ProductId = review.ProductId,
                    UserId = review.UserId,
                    Username = review.User != null ? review.User.Username : "User",
                    Rating = review.Rating,
                    Comment = review.Comment,
                    CreatedAt = review.CreatedAt
                })
                .ToListAsync();

            return Ok(reviews);
        }

        [HttpGet("product/{productId}/stats")]
        public async Task<ActionResult<ReviewStatsDto>> GetProductStats(int productId)
        {
            var reviews = _context.Reviews.Where(review => review.ProductId == productId);

            var count = await reviews.CountAsync();
            var average = count == 0
                ? 0
                : await reviews.AverageAsync(review => review.Rating);

            return Ok(new ReviewStatsDto
            {
                Count = count,
                Average = Math.Round(average, 1)
            });
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<ReviewStatsDto>> AddReview([FromBody] ReviewRequest request)
        {
            if (request.ProductId <= 0)
            {
                return BadRequest("ProductId is required.");
            }

            if (request.Rating < 1 || request.Rating > 5)
            {
                return BadRequest("Rating must be between 1 and 5.");
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

            var existing = await _context.Reviews
                .FirstOrDefaultAsync(review => review.UserId == userId.Value && review.ProductId == request.ProductId);

            if (existing == null)
            {
                existing = new Review
                {
                    UserId = userId.Value,
                    ProductId = request.ProductId,
                    Rating = request.Rating,
                    Comment = request.Comment?.Trim(),
                    CreatedAt = DateTime.UtcNow
                };
                _context.Reviews.Add(existing);
            }
            else
            {
                existing.Rating = request.Rating;
                existing.Comment = request.Comment?.Trim();
            }

            await _context.SaveChangesAsync();

            var count = await _context.Reviews.Where(review => review.ProductId == request.ProductId).CountAsync();
            var average = count == 0
                ? 0
                : await _context.Reviews.Where(review => review.ProductId == request.ProductId)
                    .AverageAsync(review => review.Rating);

            return Ok(new ReviewStatsDto
            {
                Count = count,
                Average = Math.Round(average, 1)
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

        public class ReviewRequest
        {
            public int ProductId { get; set; }
            public int Rating { get; set; }
            public string? Comment { get; set; }
        }

        public class ReviewDto
        {
            public int Id { get; set; }
            public int ProductId { get; set; }
            public int UserId { get; set; }
            public string Username { get; set; } = string.Empty;
            public int Rating { get; set; }
            public string? Comment { get; set; }
            public DateTime CreatedAt { get; set; }
        }

        public class ReviewStatsDto
        {
            public int Count { get; set; }
            public double Average { get; set; }
        }
    }
}
