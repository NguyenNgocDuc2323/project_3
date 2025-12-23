using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using System;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class StoryController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public StoryController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Story>>> GetStories([FromQuery] bool? featured = null)
        {
            try
            {
                var query = _context.Stories.AsQueryable();
                
                if (featured.HasValue && featured.Value)
                {
                    query = query.Where(s => s.IsFeatured);
                }

                var stories = await query
                    .OrderByDescending(s => s.CreatedAt)
                    .ToListAsync();

                return Ok(stories);
            }
            catch (Exception)
            {
                return Ok(new List<Story>());
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Story>> GetStory(int id)
        {
            var story = await _context.Stories.FindAsync(id);

            if (story == null)
            {
                return NotFound();
            }

            story.Views++;
            await _context.SaveChangesAsync();

            return Ok(story);
        }

        [HttpGet("popular")]
        public async Task<ActionResult<IEnumerable<Story>>> GetPopularStories([FromQuery] int limit = 5)
        {
            var stories = await _context.Stories
                .OrderByDescending(s => s.Views)
                .ThenByDescending(s => s.Likes)
                .Take(limit)
                .ToListAsync();

            return Ok(stories);
        }

        [HttpGet("stats")]
        public async Task<ActionResult<object>> GetStats()
        {
            try
            {
                var totalStories = await _context.Stories.CountAsync();
                var totalViews = await _context.Stories.SumAsync(s => (long?)s.Views) ?? 0L;
                var totalLikes = await _context.Stories.SumAsync(s => (long?)s.Likes) ?? 0L;
                var totalUsers = await _context.Users.CountAsync();

                return Ok(new
                {
                    totalStories,
                    totalViews,
                    totalLikes,
                    totalUsers
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Error retrieving stats",
                    error = ex.Message,
                    totalStories = 0,
                    totalViews = 0,
                    totalLikes = 0,
                    totalUsers = 0
                });
            }
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Story>> CreateStory([FromBody] Story story)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            story.CreatedAt = DateTime.UtcNow;
            _context.Stories.Add(story);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetStory), new { id = story.Id }, story);
        }
    }
}

