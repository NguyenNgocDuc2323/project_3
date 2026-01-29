using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;
using System.Linq;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/admin/users")]
    [Authorize(Roles = "1")]
    public class AdminUserController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminUserController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetAllUsers()
        {
            var users = await _context.Users
                .OrderByDescending(u => u.CreatedAt)
                .Select(u => new
                {
                    u.Id,
                    u.Username,
                    u.Email,
                    u.FullName,
                    u.Role,
                    u.IsActive,
                    u.CreatedAt,
                    u.UpdatedAt
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users
                .Where(u => u.Id == id)
                .Select(u => new
                {
                    u.Id,
                    u.Username,
                    u.Email,
                    u.FullName,
                    u.Gender,
                    u.Address,
                    u.City,
                    u.State,
                    u.MobileNumber,
                    u.DateOfBirth,
                    u.Role,
                    u.IsActive,
                    u.CreatedAt,
                    u.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            return Ok(user);
        }

        [HttpPost]
        public async Task<ActionResult<User>> CreateUser([FromBody] CreateUserRequest request)
        {
            if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new { message = "Username, Email, and Password are required" });
            }

            var usernameExists = await _context.Users.AnyAsync(u => u.Username == request.Username);
            if (usernameExists)
            {
                return BadRequest(new { message = "Username already exists" });
            }

            var emailExists = await _context.Users.AnyAsync(u => u.Email == request.Email);
            if (emailExists)
            {
                return BadRequest(new { message = "Email already exists" });
            }

            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                FullName = request.FullName,
                Gender = request.Gender,
                Address = request.Address,
                City = request.City,
                State = request.State,
                MobileNumber = request.MobileNumber,
                DateOfBirth = request.DateOfBirth,
                Role = request.Role ?? 2,
                IsActive = request.IsActive ?? true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, new
            {
                user.Id,
                user.Username,
                user.Email,
                user.FullName,
                user.Role,
                user.IsActive,
                user.CreatedAt,
                user.UpdatedAt
            });
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<User>> UpdateUser(int id, [FromBody] UserUpdateRequest request)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            if (user.Role == 1)
            {
                return BadRequest(new { message = "Cannot modify admin user" });
            }

            Console.WriteLine($"Updating user {id}");
            Console.WriteLine($"Request data - FullName: {request.FullName}, City: {request.City}, State: {request.State}, Gender: {request.Gender}");
            Console.WriteLine($"Current user data - FullName: {user.FullName}, City: {user.City}, State: {user.State}, Gender: {user.Gender}");

            // Get entry before making changes
            var entry = _context.Entry(user);
            
            // Update fields - allow null/empty to clear values (similar to ProfileController)
            if (request.FullName != null)
            {
                user.FullName = request.FullName;
                entry.Property(u => u.FullName).IsModified = true;
                Console.WriteLine($"Updated FullName to: {user.FullName}");
            }

            if (request.Gender != null)
            {
                user.Gender = request.Gender;
                entry.Property(u => u.Gender).IsModified = true;
                Console.WriteLine($"Updated Gender to: {user.Gender}");
            }

            if (request.Address != null)
            {
                user.Address = request.Address;
                entry.Property(u => u.Address).IsModified = true;
            }

            if (request.City != null)
            {
                user.City = request.City;
                entry.Property(u => u.City).IsModified = true;
                Console.WriteLine($"Updated City to: {user.City}");
            }

            if (request.State != null)
            {
                user.State = request.State;
                entry.Property(u => u.State).IsModified = true;
                Console.WriteLine($"Updated State to: {user.State}");
            }

            if (request.MobileNumber != null)
            {
                user.MobileNumber = request.MobileNumber;
                entry.Property(u => u.MobileNumber).IsModified = true;
            }

            if (request.DateOfBirth.HasValue)
            {
                user.DateOfBirth = request.DateOfBirth.Value;
                entry.Property(u => u.DateOfBirth).IsModified = true;
            }
            // Note: If DateOfBirth is null in request, we don't change it (keep existing value)

            if (request.IsActive.HasValue)
            {
                user.IsActive = request.IsActive.Value;
                entry.Property(u => u.IsActive).IsModified = true;
            }

            user.UpdatedAt = DateTime.UtcNow;
            entry.Property(u => u.UpdatedAt).IsModified = true;
            
            // Check if there are any changes
            var hasChanges = entry.Properties.Any(p => p.IsModified);
            Console.WriteLine($"Has changes to save: {hasChanges}");
            if (hasChanges)
            {
                var modifiedProperties = entry.Properties.Where(p => p.IsModified).Select(p => p.Metadata.Name).ToList();
                Console.WriteLine($"Modified properties: {string.Join(", ", modifiedProperties)}");
            }

            try
            {
                var changesSaved = await _context.SaveChangesAsync();
                Console.WriteLine($"User updated for user {id}. Changes saved: {changesSaved}");
                
                // Reload from database to ensure we return the actual saved values
                await _context.Entry(user).ReloadAsync();
                Console.WriteLine($"After save and reload - FullName: {user.FullName}, City: {user.City}, State: {user.State}, Gender: {user.Gender}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating user: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                return StatusCode(500, new { message = "Failed to update user", error = ex.Message });
            }

            return Ok(new
            {
                user.Id,
                user.Username,
                user.Email,
                user.FullName,
                user.Gender,
                user.Address,
                user.City,
                user.State,
                user.MobileNumber,
                user.DateOfBirth,
                user.Role,
                user.IsActive,
                user.CreatedAt,
                user.UpdatedAt
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            if (user.Role == 1)
            {
                return BadRequest(new { message = "Cannot delete admin user" });
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("stats")]
        public async Task<ActionResult<object>> GetStats()
        {
            var totalUsers = await _context.Users.CountAsync();
            var activeUsers = await _context.Users.CountAsync(u => u.IsActive);
            var adminUsers = await _context.Users.CountAsync(u => u.Role == 1);
            var regularUsers = await _context.Users.CountAsync(u => u.Role == 2);

            return Ok(new
            {
                totalUsers,
                activeUsers,
                adminUsers,
                regularUsers
            });
        }
    }

    public class CreateUserRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? Gender { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? MobileNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public int? Role { get; set; }
        public bool? IsActive { get; set; }
    }

    public class UserUpdateRequest
    {
        public string? FullName { get; set; }
        public string? Gender { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? MobileNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public bool? IsActive { get; set; }
    }
}

