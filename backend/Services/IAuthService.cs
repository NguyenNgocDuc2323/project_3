using Backend.Models;

namespace Backend.Services
{
    public interface IAuthService
    {
        Task<AuthResponse?> LoginAsync(string username, string password);
        Task<AuthResponse?> RefreshTokenAsync(string refreshToken);
        Task<bool> RevokeTokenAsync(string refreshToken);
        Task<User?> RegisterAsync(string username, string email, string password, string? fullName = null);
    }
}
