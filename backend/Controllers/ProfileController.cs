using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

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

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                throw new UnauthorizedAccessException("Invalid user token");
            }
            return userId;
        }

        [HttpGet]
        public async Task<ActionResult<ProfileDto>> GetProfile()
        {
            try
            {
                var userId = GetCurrentUserId();

                var user = await _context.Users
                    .Where(u => u.Id == userId)
                    .Select(u => new ProfileDto
                    {
                        Id = u.Id,
                        Username = u.Username,
                        Email = u.Email,
                        FullName = u.FullName,
                        AvatarUrl = u.AvatarUrl,
                        Gender = u.Gender,
                        Address = u.Address,
                        Phone = u.Phone,
                        DateOfBirth = u.DateOfBirth,
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
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "Invalid authentication" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving profile", error = ex.Message });
            }
        }

        [HttpPut]
        public async Task<ActionResult<ProfileDto>> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();

                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                if (!string.IsNullOrEmpty(request.FullName))
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

                user.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                var profileDto = new ProfileDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    Email = user.Email,
                    FullName = user.FullName,
                    AvatarUrl = user.AvatarUrl,
                    Gender = user.Gender,
                    Address = user.Address,
                    Phone = user.Phone,
                    DateOfBirth = user.DateOfBirth,
                    CreatedAt = user.CreatedAt,
                    UpdatedAt = user.UpdatedAt
                };

                return Ok(profileDto);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "Invalid authentication" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating profile", error = ex.Message });
            }
        }

        [HttpPost("avatar")]
        public async Task<ActionResult<ProfileDto>> UploadAvatar(IFormFile file)
        {
            try
            {
                var userId = GetCurrentUserId();

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

                var user = await _context.Users.FindAsync(userId);
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

                var profileDto = new ProfileDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    Email = user.Email,
                    FullName = user.FullName,
                    AvatarUrl = user.AvatarUrl,
                    Gender = user.Gender,
                    Address = user.Address,
                    Phone = user.Phone,
                    DateOfBirth = user.DateOfBirth,
                    CreatedAt = user.CreatedAt,
                    UpdatedAt = user.UpdatedAt
                };

                return Ok(profileDto);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "Invalid authentication" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while uploading avatar", error = ex.Message });
            }
        }
    }

    public class ProfileDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? AvatarUrl { get; set; }
        public string? Gender { get; set; }
        public string? Address { get; set; }
        public string? Phone { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class UpdateProfileRequest
    {
        public string? FullName { get; set; }
        public string? Gender { get; set; }
        public string? Address { get; set; }
        public string? Phone { get; set; }
        public DateTime? DateOfBirth { get; set; }
    }
}

