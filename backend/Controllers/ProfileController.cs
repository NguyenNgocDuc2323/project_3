using System.Linq;
using System.Security.Claims;
using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/profile")]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public ProfileController(ApplicationDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        [HttpGet]
        public async Task<ActionResult<ProfileDto>> GetProfile()
        {
            var userId = GetUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            var user = await _context.Users
                .Where(u => u.Id == userId.Value)
                .Select(u => new ProfileDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    FullName = u.FullName,
                    AvatarUrl = u.AvatarUrl,
                    Address = u.Address,
                    City = u.City,
                    State = u.State,
                    MobileNumber = u.MobileNumber,
                    DateOfBirth = u.DateOfBirth,
                    Gender = u.Gender,
                    Role = u.Role,
                    CreatedAt = u.CreatedAt,
                    UpdatedAt = u.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            return Ok(user);
        }

        [HttpPut]
        public async Task<ActionResult<ProfileDto>> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            var userId = GetUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            var user = await _context.Users.FindAsync(userId.Value);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            Console.WriteLine($"Updating profile for user {userId.Value}");
            Console.WriteLine($"Request data - FullName: {request.FullName}, City: {request.City}, State: {request.State}, Gender: {request.Gender}");
            Console.WriteLine($"Current user data - FullName: {user.FullName}, City: {user.City}, State: {user.State}, Gender: {user.Gender}");

            // Get entry before making changes
            var entry = _context.Entry(user);
            
            // Update fields - allow empty strings to clear values
            if (request.FullName != null)
            {
                user.FullName = request.FullName;
                entry.Property(u => u.FullName).IsModified = true;
                Console.WriteLine($"Updated FullName to: {user.FullName}");
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

            if (request.Gender != null)
            {
                user.Gender = request.Gender;
                entry.Property(u => u.Gender).IsModified = true;
                Console.WriteLine($"Updated Gender to: {user.Gender}");
            }

            // Email không được phép thay đổi trong profile update
            // Nếu cần thay đổi email, phải tạo API riêng với xác thực đặc biệt

            if (!string.IsNullOrEmpty(request.CurrentPassword) && !string.IsNullOrEmpty(request.NewPassword))
            {
                if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
                {
                    return BadRequest(new { message = "Current password is incorrect" });
                }
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
                entry.Property(u => u.PasswordHash).IsModified = true;
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
                // Log để debug
                Console.WriteLine($"Profile updated for user {userId}. Changes saved: {changesSaved}");
                
                // Reload from database to ensure we return the actual saved values
                await _context.Entry(user).ReloadAsync();
                Console.WriteLine($"After save and reload - FullName: {user.FullName}, City: {user.City}, State: {user.State}, Gender: {user.Gender}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating profile: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                return StatusCode(500, new { message = "Failed to update profile", error = ex.Message, innerError = ex.InnerException?.Message });
            }

            return Ok(new ProfileDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FullName = user.FullName,
                AvatarUrl = user.AvatarUrl,
                Address = user.Address,
                City = user.City,
                State = user.State,
                MobileNumber = user.MobileNumber,
                DateOfBirth = user.DateOfBirth,
                Gender = user.Gender,
                Role = user.Role,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt
            });
        }

        [HttpPost("avatar")]
        public async Task<ActionResult<ProfileDto>> UploadAvatar(IFormFile file)
        {
            var userId = GetUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

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

            var user = await _context.Users.FindAsync(userId.Value);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            var uploadsFolder = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, "uploads", "avatars");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var fileName = $"avatar_{userId}_{DateTime.UtcNow:yyyyMMddHHmmss}{fileExtension}";
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

            return Ok(new ProfileDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FullName = user.FullName,
                AvatarUrl = user.AvatarUrl,
                Address = user.Address,
                City = user.City,
                State = user.State,
                MobileNumber = user.MobileNumber,
                DateOfBirth = user.DateOfBirth,
                Gender = user.Gender,
                Role = user.Role,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt
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
    }

    public class ProfileDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? AvatarUrl { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? MobileNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public int Role { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class UpdateProfileRequest
    {
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? MobileNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? CurrentPassword { get; set; }
        public string? NewPassword { get; set; }
    }
}

