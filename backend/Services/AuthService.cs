using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using BCrypt.Net;

namespace Backend.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        /// <summary>
        /// Đăng nhập người dùng và tạo tokens
        /// </summary>
        /// <param name="username">Tên đăng nhập</param>
        /// <param name="password">Mật khẩu</param>
        /// <returns>Thông tin đăng nhập bao gồm access token, refresh token và thông tin user</returns>
        public async Task<AuthResponse?> LoginAsync(string username, string password)
        {
            // Bước 1: Tìm user trong database theo username và kiểm tra user còn active không
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == username && u.IsActive);

            // Bước 2: Kiểm tra user có tồn tại và mật khẩu có đúng không
            // BCrypt.Verify sẽ so sánh password người dùng nhập với password đã hash trong database
            if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            {
                return null; // Đăng nhập thất bại
            }

            // Bước 3: Tạo Access Token (JWT token - dùng để xác thực các API request)
            // Access token có thời hạn ngắn (mặc định 15 phút)
            var accessToken = GenerateAccessToken(user);

            // Bước 4: Tạo Refresh Token (lưu trong database - dùng để làm mới access token)
            // Refresh token có thời hạn dài hơn (mặc định 7 ngày)
            var refreshToken = await GenerateRefreshTokenAsync(user.Id);

            // Bước 5: Trả về response với cả 2 tokens và thông tin user
            return new AuthResponse
            {
                AccessToken = accessToken,           // Token để gửi kèm mỗi API request
                RefreshToken = refreshToken.Token,   // Token để refresh access token khi hết hạn
                ExpiresAt = DateTime.UtcNow.AddMinutes(GetAccessTokenExpirationMinutes()), // Thời gian hết hạn của access token
                User = new UserDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    Email = user.Email,
                    FullName = user.FullName
                }
            };
        }

        /// <summary>
        /// Làm mới access token bằng refresh token
        /// Khi access token hết hạn, frontend sẽ gọi hàm này để lấy access token mới
        /// </summary>
        /// <param name="refreshToken">Refresh token từ client</param>
        /// <returns>Thông tin đăng nhập mới với access token và refresh token mới</returns>
        public async Task<AuthResponse?> RefreshTokenAsync(string refreshToken)
        {
            // Bước 1: Tìm refresh token trong database kèm thông tin user
            var token = await _context.RefreshTokens
                .Include(t => t.User) // Load thông tin user để dùng sau
                .FirstOrDefaultAsync(t => t.Token == refreshToken);

            // Bước 2: Kiểm tra token có tồn tại và còn active không
            // IsActive = !IsRevoked && !IsExpired (xem trong RefreshToken model)
            if (token == null || !token.IsActive)
            {
                return null; // Token không hợp lệ hoặc đã hết hạn
            }

            // Bước 3: Vô hiệu hóa refresh token cũ (để tránh sử dụng lại)
            // Đây là cách bảo mật: mỗi lần refresh chỉ dùng được 1 lần
            token.RevokedAt = DateTime.UtcNow;

            // Bước 4: Tạo access token mới
            var newAccessToken = GenerateAccessToken(token.User);

            // Bước 5: Tạo refresh token mới (thay thế refresh token cũ)
            var newRefreshToken = await GenerateRefreshTokenAsync(token.UserId);

            // Bước 6: Lưu thay đổi vào database (revoke token cũ, lưu token mới)
            await _context.SaveChangesAsync();

            // Bước 7: Trả về tokens mới
            return new AuthResponse
            {
                AccessToken = newAccessToken,        // Access token mới
                RefreshToken = newRefreshToken.Token, // Refresh token mới (client phải lưu lại)
                ExpiresAt = DateTime.UtcNow.AddMinutes(GetAccessTokenExpirationMinutes()),
                User = new UserDto
                {
                    Id = token.User.Id,
                    Username = token.User.Username,
                    Email = token.User.Email,
                    FullName = token.User.FullName
                }
            };
        }

        /// <summary>
        /// Thu hồi (vô hiệu hóa) refresh token
        /// Dùng khi user đăng xuất - để đảm bảo token không thể dùng lại
        /// </summary>
        /// <param name="refreshToken">Refresh token cần thu hồi</param>
        /// <returns>true nếu thu hồi thành công, false nếu token không tồn tại hoặc đã bị thu hồi</returns>
        public async Task<bool> RevokeTokenAsync(string refreshToken)
        {
            // Bước 1: Tìm token trong database
            var token = await _context.RefreshTokens
                .FirstOrDefaultAsync(t => t.Token == refreshToken);

            // Bước 2: Kiểm tra token có tồn tại và chưa bị thu hồi chưa
            if (token == null || token.IsRevoked)
            {
                return false; // Không thể thu hồi (token không tồn tại hoặc đã bị thu hồi rồi)
            }

            // Bước 3: Đánh dấu token đã bị thu hồi
            token.RevokedAt = DateTime.UtcNow;

            // Bước 4: Lưu vào database
            await _context.SaveChangesAsync();

            return true; // Thu hồi thành công
        }

        /// <summary>
        /// Đăng ký user mới
        /// </summary>
        /// <param name="username">Tên đăng nhập</param>
        /// <param name="email">Email</param>
        /// <param name="password">Mật khẩu (sẽ được hash trước khi lưu)</param>
        /// <param name="fullName">Họ tên đầy đủ (tùy chọn)</param>
        /// <returns>User vừa tạo, hoặc null nếu username/email đã tồn tại</returns>
        public async Task<User?> RegisterAsync(string username, string email, string password, string? fullName = null)
        {
            // Bước 1: Kiểm tra username hoặc email đã tồn tại chưa
            var exists = await _context.Users
                .AnyAsync(u => u.Username == username || u.Email == email);

            if (exists)
            {
                return null; // Đã tồn tại, không thể đăng ký
            }

            // Bước 2: Tạo user mới
            var user = new User
            {
                Username = username,
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password), // Hash mật khẩu trước khi lưu (KHÔNG BAO GIỜ lưu mật khẩu dạng text)
                FullName = fullName,
                CreatedAt = DateTime.UtcNow,
                IsActive = true // User mới đăng ký mặc định là active
            };

            // Bước 3: Lưu user vào database
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return user; // Trả về user vừa tạo
        }

        /// <summary>
        /// Tạo JWT Access Token
        /// JWT (JSON Web Token) là một chuỗi mã hóa chứa thông tin user
        /// </summary>
        /// <param name="user">Thông tin user</param>
        /// <returns>Chuỗi JWT token</returns>
        private string GenerateAccessToken(User user)
        {
            // Bước 1: Tạo các "claims" (thông tin) sẽ được mã hóa vào token
            // Claims là các thông tin về user (ID, username, email, ...)
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),      // ID của user
                new Claim(ClaimTypes.Name, user.Username),                     // Username
                new Claim(ClaimTypes.Email, user.Email),                       // Email
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()) // ID duy nhất của token này
            };

            // Bước 2: Lấy "secret key" từ config để ký (sign) token
            // Secret key dùng để đảm bảo token không bị giả mạo
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                _configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured")));
            
            // Bước 3: Tạo chữ ký số (signing credentials) dùng thuật toán HMAC SHA256
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Bước 4: Tạo JWT token với các thông tin trên
            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],      // Người phát hành token (backend của bạn)
                audience: _configuration["Jwt:Audience"],  // Người nhận token (frontend của bạn)
                claims: claims,                            // Thông tin user
                expires: DateTime.UtcNow.AddMinutes(GetAccessTokenExpirationMinutes()), // Thời gian hết hạn
                signingCredentials: creds);                // Chữ ký số

            // Bước 5: Chuyển token thành chuỗi (string) để trả về
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        /// <summary>
        /// Tạo Refresh Token mới và lưu vào database
        /// Refresh token là một chuỗi ngẫu nhiên, không phải JWT
        /// </summary>
        /// <param name="userId">ID của user</param>
        /// <returns>Refresh token đã lưu trong database</returns>
        private async Task<RefreshToken> GenerateRefreshTokenAsync(int userId)
        {
            // Bước 1: Tạo refresh token mới
            var token = new RefreshToken
            {
                Token = GenerateRandomToken(),                              // Tạo chuỗi token ngẫu nhiên
                UserId = userId,                                            // ID của user sở hữu token này
                ExpiresAt = DateTime.UtcNow.AddDays(GetRefreshTokenExpirationDays()), // Thời gian hết hạn (mặc định 7 ngày)
                CreatedAt = DateTime.UtcNow                                 // Thời gian tạo
            };

            // Bước 2: Thêm token vào database
            _context.RefreshTokens.Add(token);
            await _context.SaveChangesAsync(); // Lưu vào database

            return token; // Trả về token vừa tạo
        }

        /// <summary>
        /// Tạo một chuỗi token ngẫu nhiên (64 bytes = 512 bits)
        /// Dùng cho refresh token
        /// </summary>
        /// <returns>Chuỗi token ngẫu nhiên dạng Base64</returns>
        private string GenerateRandomToken()
        {
            var randomNumber = new byte[64]; // Tạo mảng 64 bytes (512 bits)
            using var rng = RandomNumberGenerator.Create(); // Tạo số ngẫu nhiên an toàn
            rng.GetBytes(randomNumber); // Điền số ngẫu nhiên vào mảng
            return Convert.ToBase64String(randomNumber); // Chuyển sang chuỗi Base64 để dễ lưu trữ
        }

        /// <summary>
        /// Lấy thời gian hết hạn của Access Token (đơn vị: phút)
        /// Mặc định: 15 phút nếu không config
        /// </summary>
        private int GetAccessTokenExpirationMinutes()
        {
            return int.Parse(_configuration["Jwt:AccessTokenExpirationMinutes"] ?? "15");
        }

        /// <summary>
        /// Lấy thời gian hết hạn của Refresh Token (đơn vị: ngày)
        /// Mặc định: 7 ngày nếu không config
        /// </summary>
        private int GetRefreshTokenExpirationDays()
        {
            return int.Parse(_configuration["Jwt:RefreshTokenExpirationDays"] ?? "7");
        }
    }
}
