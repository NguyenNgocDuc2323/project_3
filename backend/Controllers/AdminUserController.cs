using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

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
                    u.AvatarUrl,
                    u.Gender,
                    u.Address,
                    u.Phone,
                    u.DateOfBirth,
                    u.Role,
                    u.IsActive,
                    u.CreatedAt,
                    u.UpdatedAt
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpPost]
        public async Task<ActionResult<User>> CreateUser([FromBody] CreateUserRequest request)
        {
            if (string.IsNullOrEmpty(request.Email))
            {
                return BadRequest(new { message = "Email is required" });
            }

            // Validate username if provided
            if (!string.IsNullOrEmpty(request.Username))
            {
                if (request.Username.Length < 3)
                {
                    return BadRequest(new { message = "Username must be at least 3 characters" });
                }

                if (request.Username.Length > 50)
                {
                    return BadRequest(new { message = "Username must not exceed 50 characters" });
                }

                // Check if username already exists
                if (await _context.Users.AnyAsync(u => u.Username == request.Username))
                {
                    return BadRequest(new { message = "Username already exists" });
                }
            }
            else
            {
                // Generate username from email if not provided
                var emailParts = request.Email.Split('@');
                var baseUsername = emailParts[0];
                var username = baseUsername;
                var counter = 1;

                // Ensure unique username
                while (await _context.Users.AnyAsync(u => u.Username == username))
                {
                    username = $"{baseUsername}{counter}";
                    counter++;
                }

                request.Username = username;
            }

            // Validate password if provided
            if (!string.IsNullOrEmpty(request.Password))
            {
                if (request.Password.Length < 6)
                {
                    return BadRequest(new { message = "Password must be at least 6 characters" });
                }
            }
            else
            {
                // Generate default password if not provided
                request.Password = "123456"; // Default password, user should change it
            }

            // Check if email already exists
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
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
                Phone = request.Phone,
                DateOfBirth = request.DateOfBirth,
                Role = request.Role ?? 2,
                IsActive = request.IsActive ?? true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                user.Id,
                user.Username,
                user.Email,
                user.FullName,
                user.AvatarUrl,
                user.Gender,
                user.Address,
                user.Phone,
                user.DateOfBirth,
                user.Role,
                user.IsActive,
                user.CreatedAt,
                user.UpdatedAt
            });
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
                    u.AvatarUrl,
                    u.Gender,
                    u.Address,
                    u.Phone,
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

            if (request.FullName != null)
            {
                if (request.FullName.Length > 100)
                {
                    return BadRequest(new { message = "Full name must not exceed 100 characters" });
                }
                user.FullName = request.FullName;
            }

            if (request.Gender != null)
            {
                if (request.Gender.Length > 20)
                {
                    return BadRequest(new { message = "Gender must not exceed 20 characters" });
                }
                user.Gender = request.Gender;
            }

            if (request.Address != null)
            {
                if (request.Address.Length > 500)
                {
                    return BadRequest(new { message = "Address must not exceed 500 characters" });
                }
                user.Address = request.Address;
            }

            if (request.Phone != null)
            {
                if (request.Phone.Length > 20)
                {
                    return BadRequest(new { message = "Phone must not exceed 20 characters" });
                }
                user.Phone = request.Phone;
            }

            if (request.DateOfBirth.HasValue)
            {
                if (request.DateOfBirth.Value > DateTime.UtcNow)
                {
                    return BadRequest(new { message = "Date of birth cannot be in the future" });
                }
                user.DateOfBirth = request.DateOfBirth.Value;
            }

            if (request.IsActive.HasValue)
            {
                user.IsActive = request.IsActive.Value;
            }

            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                user.Id,
                user.Username,
                user.Email,
                user.FullName,
                user.AvatarUrl,
                user.Gender,
                user.Address,
                user.Phone,
                user.DateOfBirth,
                user.Role,
                user.IsActive,
                user.CreatedAt,
                user.UpdatedAt
            });
        }

        [HttpPost("{id}/change-password")]
        public async Task<ActionResult> ChangeUserPassword(int id, [FromBody] AdminChangePasswordRequest request)
        {
            if (string.IsNullOrEmpty(request.NewPassword))
            {
                return BadRequest(new { message = "New password is required" });
            }

            if (request.NewPassword.Length < 6)
            {
                return BadRequest(new { message = "Password must be at least 6 characters" });
            }

            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            if (user.Role == 1)
            {
                return BadRequest(new { message = "Cannot change admin user password" });
            }

            // Admin can change password without old password
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Password changed successfully" });
        }

        [HttpPost("{id}/avatar")]
        public async Task<ActionResult> UploadUserAvatar(int id, IFormFile file)
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

            return Ok(new { message = "Avatar uploaded successfully", avatarUrl });
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

    public class UserUpdateRequest
    {
        public string? FullName { get; set; }
        public string? Gender { get; set; }
        public string? Address { get; set; }
        public string? Phone { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public bool? IsActive { get; set; }
    }

    public class CreateUserRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? Gender { get; set; }
        public string? Address { get; set; }
        public string? Phone { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public int? Role { get; set; }
        public bool? IsActive { get; set; }
    }

    public class AdminChangePasswordRequest
    {
        public string NewPassword { get; set; } = string.Empty;
    }
}

