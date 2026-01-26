using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Backend.Models;
using Backend.Services;
using Backend.Data;
using System.Linq;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IEmailService _emailService;
        private readonly ILogger<AuthController> _logger;
        private readonly IConfiguration _configuration;
        private readonly IServiceProvider _serviceProvider;

        public AuthController(IAuthService authService, IEmailService emailService, ILogger<AuthController> logger, IConfiguration configuration, IServiceProvider serviceProvider)
        {
            _authService = authService;
            _emailService = emailService;
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

            var userRecord = await _serviceProvider.GetRequiredService<ApplicationDbContext>()
                .Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (userRecord != null && !userRecord.IsActive)
            {
                return Unauthorized(new { message = "Please verify your email before logging in." });
            }

            var response = await _authService.LoginAsync(request.Email, request.Password);

            if (response == null)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            var isDevelopment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";
            
            Response.Cookies.Append("refreshToken", response.RefreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = !isDevelopment,
                SameSite = isDevelopment ? SameSiteMode.Lax : SameSiteMode.None,
                Expires = DateTimeOffset.UtcNow.AddDays(GetRefreshTokenExpirationDays()),
                Path = "/"
            });

            Response.Cookies.Append("accessToken", response.AccessToken, new CookieOptions
            {
                HttpOnly = false,
                Secure = !isDevelopment,
                SameSite = isDevelopment ? SameSiteMode.Lax : SameSiteMode.None,
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

                var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
                var smtpHost = _configuration["Email:SmtpHost"];
                var smtpPort = _configuration["Email:SmtpPort"];
                var smtpUsername = _configuration["Email:SmtpUsername"];
                var smtpPasswordConfigured = !string.IsNullOrEmpty(_configuration["Email:SmtpPassword"]);
                _logger.LogInformation("Email config check - Environment: {Env}, Host: {Host}, Port: {Port}, Username: {Username}, Password configured: {HasPassword}", 
                    environment, smtpHost, smtpPort, smtpUsername, smtpPasswordConfigured);

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

                bool emailSent = false;
                try
                {
                    var verificationToken = await _authService.CreateEmailVerificationTokenAsync(user.Id);
                    _logger.LogInformation("Attempting to send email verification to: {Email}", user.Email);
                    await _emailService.SendEmailVerificationEmailAsync(user.Email, user.Username, verificationToken);
                    _logger.LogInformation("Email verification sent successfully to: {Email}", user.Email);
                    emailSent = true;
                }
                catch (Exception emailEx)
                {
                    _logger.LogError(emailEx, "Failed to send email verification to {Email}. Error: {Error}, StackTrace: {StackTrace}", 
                        user.Email, emailEx.Message, emailEx.StackTrace);
                }

                return Ok(new
                {
                    message = "Registration successful. Please verify your email to activate your account.",
                    emailSent = emailSent
                });
            }
            catch (Exception ex)
            {
                var errorMessage = ex.Message ?? "Unknown error";
                var innerError = ex.InnerException?.Message;
                
                _logger.LogError(ex, "Error occurred during registration for user: {Username}, {Email}. Error: {Error}, Inner: {Inner}", 
                    request?.Username, request?.Email, errorMessage, innerError);
                
                _logger.LogError("Full exception details: {Exception}", ex.ToString());
                
                return StatusCode(500, new { 
                    message = "Registration failed. Please try again.", 
                    error = errorMessage,
                    innerError = innerError ?? "No inner error"
                });
            }
        }

        [HttpGet("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromQuery] string email, [FromQuery] string token)
        {
            var frontendBaseUrl = (_configuration["Email:ResetPasswordBaseUrl"] ?? "http://localhost:3000").TrimEnd('/');
            var loginBaseUrl = $"{frontendBaseUrl}/login";

            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(token))
            {
                var missingParamsUrl = $"{loginBaseUrl}?verified=0&reason=missing_params";
                return Redirect(missingParamsUrl);
            }

            var verified = await _authService.VerifyEmailAsync(email, token);

            if (!verified)
            {
                var invalidUrl = $"{loginBaseUrl}?verified=0&reason=invalid_or_expired";
                return Redirect(invalidUrl);
            }

            var successUrl = $"{loginBaseUrl}?verified=1";
            return Redirect(successUrl);
        }

        [HttpPost("refresh")]
        public async Task<ActionResult<AuthResponse>> RefreshToken([FromBody] RefreshTokenRequest? request = null)
        {
            var refreshToken = request?.RefreshToken ?? Request.Cookies["refreshToken"];

            if (string.IsNullOrEmpty(refreshToken))
            {
                return Unauthorized(new { message = "Refresh token not found" });
            }

            var response = await _authService.RefreshTokenAsync(refreshToken);

            if (response == null)
            {
                return Unauthorized(new { message = "Invalid or expired refresh token" });
            }

            var isDevelopment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";
            
            Response.Cookies.Append("refreshToken", response.RefreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = !isDevelopment,
                SameSite = isDevelopment ? SameSiteMode.Lax : SameSiteMode.None,
                Expires = DateTimeOffset.UtcNow.AddDays(GetRefreshTokenExpirationDays()),
                Path = "/"
            });

            Response.Cookies.Append("accessToken", response.AccessToken, new CookieOptions
            {
                HttpOnly = false,
                Secure = !isDevelopment,
                SameSite = isDevelopment ? SameSiteMode.Lax : SameSiteMode.None,
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
        public async Task<IActionResult> RevokeToken([FromBody] RefreshTokenRequest? request = null)
        {
            var refreshToken = request?.RefreshToken ?? Request.Cookies["refreshToken"];
            
            if (string.IsNullOrEmpty(refreshToken))
            {
                return BadRequest(new { message = "Refresh token is required" });
            }

            var result = await _authService.RevokeTokenAsync(refreshToken);

            if (!result)
            {
                return BadRequest(new { message = "Failed to revoke token" });
            }

            return Ok(new { message = "Token revoked successfully" });
        }

        [HttpGet("test-hot-reload")]
        public IActionResult TestHotReload()
        {
            return Ok(new { 
                message = "Hot reload test - Version 1.0", 
                timestamp = DateTime.UtcNow,
                status = "Backend code changes will auto-reload!"
            });
        }

        [HttpGet("email-config")]
        public IActionResult GetEmailConfig()
        {
            try
            {
                var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
                var smtpHost = _configuration["Email:SmtpHost"];
                var smtpPort = _configuration["Email:SmtpPort"];
                var smtpUsername = _configuration["Email:SmtpUsername"];
                var smtpPassword = _configuration["Email:SmtpPassword"];
                var fromEmail = _configuration["Email:FromEmail"];
                var fromName = _configuration["Email:FromName"];

                return Ok(new
                {
                    environment = environment,
                    smtpHost = smtpHost,
                    smtpPort = smtpPort,
                    smtpUsername = smtpUsername,
                    smtpPasswordConfigured = !string.IsNullOrEmpty(smtpPassword),
                    fromEmail = fromEmail,
                    fromName = fromName,
                    isConfigured = !string.IsNullOrEmpty(smtpHost) && 
                                   !string.IsNullOrEmpty(smtpUsername) && 
                                   !string.IsNullOrEmpty(smtpPassword)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get email config: {Error}", ex.Message);
                return StatusCode(500, new { 
                    message = "Failed to get email config",
                    error = ex.Message
                });
            }
        }

        [HttpPost("test-email")]
        public async Task<IActionResult> TestEmail([FromBody] dynamic request)
        {
            try
            {
                var testEmail = (string)(request?.email?.ToString() ?? "thom.dt.2436@aptechlearning.edu.vn");
                _logger.LogInformation("Testing email send to: {Email}", testEmail);
                
                var smtpHost = _configuration["Email:SmtpHost"];
                var smtpPort = _configuration["Email:SmtpPort"];
                var smtpUsername = _configuration["Email:SmtpUsername"];
                _logger.LogInformation("Email config - Host: {Host}, Port: {Port}, Username: {Username}", 
                    smtpHost, smtpPort, smtpUsername);
                
                await _emailService.SendRegistrationConfirmationEmailAsync(testEmail, "Test User");
                
                return Ok(new { 
                    message = "Test email sent successfully",
                    email = testEmail,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Test email failed: {Error}, InnerException: {InnerException}", 
                    ex.Message, ex.InnerException?.Message);
                return StatusCode(500, new { 
                    message = "Failed to send test email",
                    error = ex.Message,
                    innerError = ex.InnerException?.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _authService.ForgotPasswordAsync(request.Email);

            if (!result)
            {
                return Ok(new { message = "If the email exists, a password reset link has been sent." });
            }

            return Ok(new { message = "If the email exists, a password reset link has been sent." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _authService.ResetPasswordAsync(request.Email, request.Token, request.NewPassword);

            if (!result)
            {
                return BadRequest(new { message = "Invalid or expired reset token." });
            }

            return Ok(new { message = "Password has been reset successfully." });
        }
    }
}
