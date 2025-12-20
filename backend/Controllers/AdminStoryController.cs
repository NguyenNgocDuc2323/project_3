using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using System;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/admin/stories")]
    [Authorize(Roles = "1")] // 1 = Admin
    public class AdminStoryController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminStoryController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Story>>> GetAllStories()
        {
            try
            {
                var stories = await _context.Stories
                    .OrderByDescending(s => s.CreatedAt)
                    .ToListAsync();

                return Ok(stories);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving stories", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Story>> GetStory(int id)
        {
            var story = await _context.Stories.FindAsync(id);

            if (story == null)
            {
                return NotFound(new { message = "Story not found" });
            }

            return Ok(story);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Story>> UpdateStory(int id, [FromBody] Story story)
        {
            if (id != story.Id)
            {
                return BadRequest(new { message = "ID mismatch" });
            }

            var existingStory = await _context.Stories.FindAsync(id);
            if (existingStory == null)
            {
                return NotFound(new { message = "Story not found" });
            }

            existingStory.Title = story.Title;
            existingStory.Author = story.Author;
            existingStory.Description = story.Description;
            existingStory.ImageUrl = story.ImageUrl;
            existingStory.Category = story.Category;
            existingStory.IsFeatured = story.IsFeatured;
            existingStory.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(existingStory);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStory(int id)
        {
            var story = await _context.Stories.FindAsync(id);
            if (story == null)
            {
                return NotFound(new { message = "Story not found" });
            }

            _context.Stories.Remove(story);
            await _context.SaveChangesAsync();

            return NoContent();
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
                var featuredCount = await _context.Stories.CountAsync(s => s.IsFeatured);

                return Ok(new
                {
                    totalStories,
                    totalViews,
                    totalLikes,
                    totalUsers,
                    featuredCount
                });
            }
            catch
            {
                return Ok(new
                {
                    totalStories = 0,
                    totalViews = 0,
                    totalLikes = 0,
                    totalUsers = 0,
                    featuredCount = 0
                });
            }
        }
    }
}

