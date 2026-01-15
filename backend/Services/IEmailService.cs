namespace Backend.Services
{
    public interface IEmailService
    {
        Task SendPasswordResetEmailAsync(string email, string resetToken);
        Task SendRegistrationConfirmationEmailAsync(string email, string username);
    }
}
