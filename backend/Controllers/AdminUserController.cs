using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;
using System.Linq;
using Microsoft.AspNetCore.Hosting;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/admin/users")]
    [Authorize(Roles = "1")]
    public class AdminUserController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public AdminUserController(ApplicationDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
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
                    u.Role,
                    u.IsActive,
                    u.AvatarUrl,
                    u.Address,
                    u.City,
                    u.State,
                    u.MobileNumber,
                    u.DateOfBirth,
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
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

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

            if (request.AvatarUrl != null)
            {
                user.AvatarUrl = request.AvatarUrl;
                entry.Property(u => u.AvatarUrl).IsModified = true;
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

            if (request.Role.HasValue)
            {
                user.Role = request.Role.Value;
                entry.Property(u => u.Role).IsModified = true;
            }

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
                user.Role,
                user.IsActive,
                user.AvatarUrl,
                user.Address,
                user.City,
                user.State,
                user.MobileNumber,
                user.DateOfBirth,
                user.CreatedAt,
                user.UpdatedAt
            });
        }

        [HttpPost("{id}/upload-avatar")]
        public async Task<ActionResult<object>> UploadUserAvatar(int id, IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "No file uploaded" });
            }

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            
            if (!allowedExtensions.Contains(fileExtension))
            {
                return BadRequest(new { message = "Invalid file type. Allowed: jpg, jpeg, png, gif, webp" });
            }

            if (file.Length > 5 * 1024 * 1024) // 5MB
            {
                return BadRequest(new { message = "File size exceeds 5MB limit" });
            }

            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            var uploadsFolder = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, "uploads", "avatars");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var fileName = $"avatar_{id}_{DateTime.UtcNow:yyyyMMddHHmmss}{fileExtension}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var avatarUrl = $"/uploads/avatars/{fileName}";

            // Delete old avatar if exists
            if (!string.IsNullOrEmpty(user.AvatarUrl) && user.AvatarUrl.StartsWith("/uploads/avatars/"))
            {
                var oldFilePath = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, user.AvatarUrl.TrimStart('/'));
                if (System.IO.File.Exists(oldFilePath))
                {
                    try
                    {
                        System.IO.File.Delete(oldFilePath);
                    }
                    catch
                    {
                        // Ignore deletion errors
                    }
                }
            }

            user.AvatarUrl = avatarUrl;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { avatarUrl });
        }

        [HttpPost("{id}/change-password")]
        public async Task<IActionResult> ChangeUserPassword(int id, [FromBody] ChangeUserPasswordRequest request)
        {
            if (string.IsNullOrEmpty(request.NewPassword))
            {
                return BadRequest(new { message = "New password is required" });
            }

            if (request.NewPassword.Length < 6)
            {
                return BadRequest(new { message = "New password must be at least 6 characters" });
            }

            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            // Update password
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Password changed successfully" });
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
        [Required]
        [StringLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;

        [StringLength(100)]
        public string? FullName { get; set; }

        [StringLength(10)]
        public string? Gender { get; set; }

        [StringLength(500)]
        public string? Address { get; set; }

        [StringLength(50)]
        public string? City { get; set; }

        [StringLength(50)]
        public string? State { get; set; }

        [StringLength(20)]
        public string? MobileNumber { get; set; }

        public DateTime? DateOfBirth { get; set; }

        public int? Role { get; set; }

        public bool? IsActive { get; set; }
    }

    public class UserUpdateRequest
    {
        public string? FullName { get; set; }
        public string? Gender { get; set; }
        public string? AvatarUrl { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? MobileNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public int? Role { get; set; }
        public bool? IsActive { get; set; }
    }

    public class ChangeUserPasswordRequest
    {
        [Required]
        [MinLength(6)]
        public string NewPassword { get; set; } = string.Empty;
    }
}

