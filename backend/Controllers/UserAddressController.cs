using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/addresses")]
    [Authorize]
    public class UserAddressController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UserAddressController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserAddress>>> GetAddresses()
        {
            var userId = GetUserId();
            var addresses = await _context.UserAddresses
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.IsDefault)
                .ThenByDescending(a => a.CreatedAt)
                .ToListAsync();

            return Ok(addresses);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserAddress>> GetAddress(int id)
        {
            var userId = GetUserId();
            var address = await _context.UserAddresses
                .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

            if (address == null)
            {
                return NotFound();
            }

            return Ok(address);
        }

        [HttpPost]
        public async Task<ActionResult<UserAddress>> CreateAddress([FromBody] UserAddress address)
        {
            var userId = GetUserId();
            address.UserId = userId;
            address.CreatedAt = DateTime.UtcNow;

            // If this is the first address or set as default, unset other defaults
            if (address.IsDefault || !await _context.UserAddresses.AnyAsync(a => a.UserId == userId))
            {
                address.IsDefault = true;
                await UnsetDefaultAddresses(userId);
            }

            _context.UserAddresses.Add(address);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAddress), new { id = address.Id }, address);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAddress(int id, [FromBody] UserAddress address)
        {
            var userId = GetUserId();
            if (id != address.Id) return BadRequest();

            var existingAddress = await _context.UserAddresses
                .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

            if (existingAddress == null) return NotFound();

            if (address.IsDefault && !existingAddress.IsDefault)
            {
                await UnsetDefaultAddresses(userId);
            }

            existingAddress.ReceiverName = address.ReceiverName;
            existingAddress.Phone = address.Phone;
            existingAddress.AddressLine = address.AddressLine;
            existingAddress.City = address.City;
            existingAddress.IsDefault = address.IsDefault;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAddress(int id)
        {
            var userId = GetUserId();
            var address = await _context.UserAddresses
                .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

            if (address == null) return NotFound();

            _context.UserAddresses.Remove(address);
            await _context.SaveChangesAsync();

            // If deleted address was default, set another one as default
            if (address.IsDefault)
            {
                var nextAddress = await _context.UserAddresses
                    .Where(a => a.UserId == userId)
                    .OrderByDescending(a => a.CreatedAt)
                    .FirstOrDefaultAsync();
                
                if (nextAddress != null)
                {
                    nextAddress.IsDefault = true;
                    await _context.SaveChangesAsync();
                }
            }

            return NoContent();
        }

        [HttpPatch("{id}/set-default")]
        public async Task<IActionResult> SetDefault(int id)
        {
            var userId = GetUserId();
            var address = await _context.UserAddresses
                .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

            if (address == null) return NotFound();

            await UnsetDefaultAddresses(userId);
            address.IsDefault = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private int GetUserId()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdStr, out int userId) ? userId : 0;
        }

        private async Task UnsetDefaultAddresses(int userId)
        {
            var defaultAddresses = await _context.UserAddresses
                .Where(a => a.UserId == userId && a.IsDefault)
                .ToListAsync();

            foreach (var addr in defaultAddresses)
            {
                addr.IsDefault = false;
            }
        }
    }
}
