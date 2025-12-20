using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Backend.Models;
using Backend.Services;
using Backend.Data;
using System.Linq;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;
        private readonly IConfiguration _configuration;
        private readonly IServiceProvider _serviceProvider;

        public AuthController(IAuthService authService, ILogger<AuthController> logger, IConfiguration configuration, IServiceProvider serviceProvider)
        {
            _authService = authService;
            _logger = logger;
            _configuration = configuration;
            _serviceProvider = serviceProvider;
        }
        
        private int GetAccessTokenExpirationMinutes()
        {
            return int.Parse(_configuration["Jwt:AccessTokenExpirationMinutes"] ?? "15");
        }

        private int GetRefreshTokenExpirationDays()
        {
            return int.Parse(_configuration["Jwt:RefreshTokenExpirationDays"] ?? "7");
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var response = await _authService.LoginAsync(request.Username, request.Password);

            if (response == null)
            {
                return Unauthorized(new { message = "Invalid username or password" });
            }

            Response.Cookies.Append("refreshToken", response.RefreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTimeOffset.UtcNow.AddDays(GetRefreshTokenExpirationDays()),
                Path = "/"
            });

            Response.Cookies.Append("accessToken", response.AccessToken, new CookieOptions
            {
                HttpOnly = false,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTimeOffset.UtcNow.AddMinutes(GetAccessTokenExpirationMinutes()),
                Path = "/"
            });

            return Ok(response);
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Register request validation failed: {Errors}", 
                        string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)));
                    return BadRequest(ModelState);
                }

                _logger.LogInformation("Attempting to register user: {Username}, {Email}", 
                    request.Username, request.Email);

                var user = await _authService.RegisterAsync(
                    request.Username,
                    request.Email,
                    request.Password,
                    request.FullName
                );

                if (user == null)
                {
                    _logger.LogWarning("Registration failed: Username or email already exists - {Username}, {Email}", 
                        request.Username, request.Email);
                    return BadRequest(new { message = "Username or email already exists" });
                }

                _logger.LogInformation("User created successfully with ID: {UserId}", user.Id);

                var response = await _authService.LoginAsync(request.Username, request.Password);

                if (response == null)
                {
                    _logger.LogError("Login failed after registration for user ID: {UserId}. Rolling back user creation.", user.Id);
                    await _authService.DeleteUserAsync(user.Id);
                    return StatusCode(500, new { message = "Registration failed. Please try again." });
                }

                _logger.LogInformation("Registration and auto-login successful for user: {Username}", request.Username);

                Response.Cookies.Append("refreshToken", response.RefreshToken, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    Expires = DateTimeOffset.UtcNow.AddDays(GetRefreshTokenExpirationDays()),
                    Path = "/"
                });

                Response.Cookies.Append("accessToken", response.AccessToken, new CookieOptions
                {
                    HttpOnly = false,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    Expires = DateTimeOffset.UtcNow.AddMinutes(GetAccessTokenExpirationMinutes()),
                    Path = "/"
                });

                return Ok(response);
            }
            catch (Exception ex)
            {
                var errorMessage = ex.Message ?? "Unknown error";
                var innerError = ex.InnerException?.Message;
                
                _logger.LogError(ex, "Error occurred during registration for user: {Username}, {Email}. Error: {Error}, Inner: {Inner}", 
                    request?.Username, request?.Email, errorMessage, innerError);
                
                // Log full exception details for debugging
                _logger.LogError("Full exception details: {Exception}", ex.ToString());
                
                return StatusCode(500, new { 
                    message = "Registration failed. Please try again.", 
                    error = errorMessage,
                    innerError = innerError ?? "No inner error"
                });
            }
        }

        [HttpPost("refresh")]
        public async Task<ActionResult<AuthResponse>> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var refreshToken = request.RefreshToken ?? Request.Cookies["refreshToken"];

            if (string.IsNullOrEmpty(refreshToken))
            {
                return Unauthorized(new { message = "Refresh token not found" });
            }

            var response = await _authService.RefreshTokenAsync(refreshToken);

            if (response == null)
            {
                return Unauthorized(new { message = "Invalid or expired refresh token" });
            }

            Response.Cookies.Append("refreshToken", response.RefreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTimeOffset.UtcNow.AddDays(GetRefreshTokenExpirationDays()),
                Path = "/"
            });

            Response.Cookies.Append("accessToken", response.AccessToken, new CookieOptions
            {
                HttpOnly = false,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTimeOffset.UtcNow.AddMinutes(GetAccessTokenExpirationMinutes()),
                Path = "/"
            });

            return Ok(response);
        }

        [HttpGet("test-db")]
        public async Task<IActionResult> TestDatabase()
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                
                var canConnect = db.Database.CanConnect();
                var usersCount = canConnect ? await db.Users.CountAsync() : -1;
                
                // Try to get column info (MySQL specific)
                var connection = db.Database.GetDbConnection();
                await connection.OpenAsync();
                var command = connection.CreateCommand();
                command.CommandText = "DESCRIBE Users";
                using var reader = await command.ExecuteReaderAsync();
                
                var columns = new List<object>();
                while (await reader.ReadAsync())
                {
                    columns.Add(new
                    {
                        Field = reader.GetString(0),
                        Type = reader.GetString(1),
                        Null = reader.GetString(2),
                        Key = reader.GetString(3),
                        Default = reader.IsDBNull(4) ? null : reader.GetString(4),
                        Extra = reader.IsDBNull(5) ? null : reader.GetString(5)
                    });
                }
                await connection.CloseAsync();
                
                return Ok(new
                {
                    canConnect,
                    usersCount,
                    columns,
                    message = "Database test successful"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Database test failed",
                    error = ex.Message,
                    innerError = ex.InnerException?.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

        [HttpPost("revoke")]
        public async Task<IActionResult> RevokeToken([FromBody] RefreshTokenRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _authService.RevokeTokenAsync(request.RefreshToken);

            if (!result)
            {
                return BadRequest(new { message = "Failed to revoke token" });
            }

            return Ok(new { message = "Token revoked successfully" });
        }
    }
}
