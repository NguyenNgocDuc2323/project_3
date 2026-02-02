using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/banners")]
    public class BannerController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BannerController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Banner>>> GetBanners([FromQuery] bool? activeOnly = true)
        {
            var query = _context.Banners.AsNoTracking().AsQueryable();
            if (activeOnly == true)
                query = query.Where(b => b.IsActive);
            var list = await query.OrderBy(b => b.SortOrder).ThenBy(b => b.Id).ToListAsync();
            return Ok(list);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<Banner>> GetBanner(int id)
        {
            var banner = await _context.Banners.FindAsync(id);
            if (banner == null)
                return NotFound();
            return Ok(banner);
        }

        [HttpPost]
        [Authorize(Roles = "1")]
        public async Task<ActionResult<Banner>> CreateBanner([FromBody] Banner banner)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value?.Errors.Count > 0)
                    .Select(x => new { Field = x.Key, Errors = x.Value?.Errors.Select(e => e.ErrorMessage) })
                    .ToList();
                return BadRequest(new { message = "Validation failed", errors });
            }

            banner.Id = 0;
            if (string.IsNullOrWhiteSpace(banner.Link))
                banner.Link = null;
            banner.CreatedAt = DateTime.UtcNow;

            try
            {
                _context.Banners.Add(banner);
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(GetBanner), new { id = banner.Id }, banner);
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, new { message = "Database error occurred", error = ex.InnerException?.Message ?? ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating the banner", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "1")]
        public async Task<IActionResult> UpdateBanner(int id, [FromBody] Banner banner)
        {
            if (id != banner.Id)
                return BadRequest(new { message = "ID mismatch" });

            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value?.Errors.Count > 0)
                    .Select(x => new { Field = x.Key, Errors = x.Value?.Errors.Select(e => e.ErrorMessage) })
                    .ToList();
                return BadRequest(new { message = "Validation failed", errors });
            }

            var existing = await _context.Banners.FindAsync(id);
            if (existing == null)
                return NotFound(new { message = "Banner not found" });

            existing.Title = banner.Title;
            existing.ImageUrl = banner.ImageUrl;
            existing.Link = string.IsNullOrWhiteSpace(banner.Link) ? null : banner.Link;
            existing.SortOrder = banner.SortOrder;
            existing.IsActive = banner.IsActive;
            existing.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, new { message = "Database error occurred", error = ex.InnerException?.Message ?? ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the banner", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "1")]
        public async Task<IActionResult> DeleteBanner(int id)
        {
            var banner = await _context.Banners.FindAsync(id);
            if (banner == null)
                return NotFound(new { message = "Banner not found" });
            _context.Banners.Remove(banner);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
