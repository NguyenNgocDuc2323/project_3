using Backend.Models;

namespace Backend.Services
{
    public interface IAuthService
    {
        Task<AuthResponse?> LoginAsync(string email, string password);
        Task<AuthResponse?> RefreshTokenAsync(string refreshToken);
        Task<bool> RevokeTokenAsync(string refreshToken);
        Task<User?> RegisterAsync(string username, string email, string password, string? fullName = null);
        Task<bool> DeleteUserAsync(int userId);
        Task<bool> ForgotPasswordAsync(string email);
        Task<bool> ResetPasswordAsync(string email, string token, string newPassword);
    }
}
