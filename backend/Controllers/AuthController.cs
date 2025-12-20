using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Backend.Services;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        /// <summary>
        /// API đăng nhập: POST /api/auth/login
        /// Nhận username và password, trả về access token và refresh token
        /// </summary>
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
        {
            // Kiểm tra dữ liệu đầu vào có hợp lệ không
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Gọi service để xử lý đăng nhập
            // Service sẽ kiểm tra username/password và tạo tokens
            var response = await _authService.LoginAsync(request.Username, request.Password);

            // Nếu đăng nhập thất bại (username/password sai)
            if (response == null)
            {
                return Unauthorized(new { message = "Tên đăng nhập hoặc mật khẩu không đúng" });
            }

            // Trả về response chứa access token, refresh token và thông tin user
            return Ok(response);
        }

        /// <summary>
        /// API đăng ký: POST /api/auth/register
        /// Tạo user mới và tự động đăng nhập (trả về tokens luôn)
        /// </summary>
        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
        {
            // Kiểm tra dữ liệu đầu vào
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Bước 1: Tạo user mới
            var user = await _authService.RegisterAsync(
                request.Username,
                request.Email,
                request.Password,
                request.FullName
            );

            // Nếu user == null nghĩa là username hoặc email đã tồn tại
            if (user == null)
            {
                return BadRequest(new { message = "Tên đăng nhập hoặc email đã tồn tại" });
            }

            // Bước 2: Tự động đăng nhập sau khi đăng ký thành công
            // Tạo và trả về tokens luôn để user không cần đăng nhập lại
            var response = await _authService.LoginAsync(request.Username, request.Password);

            return Ok(response);
        }

        /// <summary>
        /// API làm mới token: POST /api/auth/refresh
        /// Khi access token hết hạn, frontend sẽ gọi API này với refresh token
        /// Để lấy access token mới (và refresh token mới)
        /// </summary>
        [HttpPost("refresh")]
        public async Task<ActionResult<AuthResponse>> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            // Kiểm tra dữ liệu đầu vào
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Gọi service để refresh token
            // Service sẽ kiểm tra refresh token, tạo tokens mới và vô hiệu hóa token cũ
            var response = await _authService.RefreshTokenAsync(request.RefreshToken);

            // Nếu refresh token không hợp lệ hoặc đã hết hạn
            if (response == null)
            {
                return Unauthorized(new { message = "Refresh token không hợp lệ hoặc đã hết hạn" });
            }

            // Trả về tokens mới
            return Ok(response);
        }

        /// <summary>
        /// API thu hồi token: POST /api/auth/revoke
        /// Dùng khi user đăng xuất - vô hiệu hóa refresh token để không thể dùng lại
        /// </summary>
        [HttpPost("revoke")]
        public async Task<IActionResult> RevokeToken([FromBody] RefreshTokenRequest request)
        {
            // Kiểm tra dữ liệu đầu vào
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Gọi service để thu hồi token
            var result = await _authService.RevokeTokenAsync(request.RefreshToken);

            // Nếu thu hồi thất bại (token không tồn tại hoặc đã bị thu hồi rồi)
            if (!result)
            {
                return BadRequest(new { message = "Không thể thu hồi token" });
            }

            // Thu hồi thành công
            return Ok(new { message = "Token đã được thu hồi thành công" });
        }
    }
}
