using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace Backend.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendPasswordResetEmailAsync(string email, string resetToken)
        {
            try
            {
                var smtpHost = _configuration["Email:SmtpHost"];
                var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
                var smtpUsername = _configuration["Email:SmtpUsername"];
                var smtpPassword = _configuration["Email:SmtpPassword"];
                var fromEmail = _configuration["Email:FromEmail"];
                var fromName = _configuration["Email:FromName"] ?? "Project 3";

                if (string.IsNullOrEmpty(smtpHost) || string.IsNullOrEmpty(smtpUsername) || string.IsNullOrEmpty(smtpPassword))
                {
                    throw new InvalidOperationException("Email configuration is incomplete");
                }

                var resetUrl = $"{_configuration["Email:ResetPasswordBaseUrl"]}/reset-password?token={resetToken}&email={Uri.EscapeDataString(email)}";

                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(fromName, fromEmail));
                message.To.Add(new MailboxAddress("", email));
                message.Subject = "Reset Your Password";

                var bodyBuilder = new BodyBuilder
                {
                    HtmlBody = $@"
                        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                            <h2 style='color: #333;'>Password Reset Request</h2>
                            <p>You requested to reset your password. Click the button below to reset it:</p>
                            <div style='text-align: center; margin: 30px 0;'>
                                <a href='{resetUrl}' style='background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;'>Reset Password</a>
                            </div>
                            <p>Or copy and paste this link into your browser:</p>
                            <p style='word-break: break-all; color: #666;'>{resetUrl}</p>
                            <p style='color: #999; font-size: 12px;'>This link will expire in 1 hour.</p>
                            <p style='color: #999; font-size: 12px;'>If you didn't request this, please ignore this email.</p>
                        </div>"
                };

                message.Body = bodyBuilder.ToMessageBody();

                using var client = new SmtpClient();
                
                var secureSocketOptions = smtpPort == 465 
                    ? SecureSocketOptions.SslOnConnect 
                    : SecureSocketOptions.StartTls;
                
                _logger.LogInformation("Connecting to SMTP server: {Host}:{Port} with {Security}", 
                    smtpHost, smtpPort, secureSocketOptions);
                
                await client.ConnectAsync(smtpHost, smtpPort, secureSocketOptions);
                
                if (!string.IsNullOrEmpty(smtpUsername) && !string.IsNullOrEmpty(smtpPassword))
                {
                    _logger.LogInformation("Authenticating with username: {Username}", smtpUsername);
                    await client.AuthenticateAsync(smtpUsername, smtpPassword);
                }
                
                _logger.LogInformation("Sending password reset email to: {Email}", email);
                await client.SendAsync(message);
                await client.DisconnectAsync(true);
                
                _logger.LogInformation("Password reset email sent successfully to: {Email}", email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send password reset email to {Email}. Error: {Error}", 
                    email, ex.Message);
                throw;
            }
        }

        public async Task SendRegistrationConfirmationEmailAsync(string email, string username)
        {
            if (string.IsNullOrEmpty(email))
            {
                return;
            }

            try
            {
                var smtpHost = _configuration["Email:SmtpHost"];
                var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
                var smtpUsername = _configuration["Email:SmtpUsername"];
                var smtpPassword = _configuration["Email:SmtpPassword"];
                var fromEmail = _configuration["Email:FromEmail"];
                var fromName = _configuration["Email:FromName"] ?? "Project 3";

                if (string.IsNullOrEmpty(smtpHost) || string.IsNullOrEmpty(smtpUsername) || string.IsNullOrEmpty(smtpPassword))
                {
                    throw new InvalidOperationException("Email configuration is incomplete");
                }

                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(fromName, fromEmail));
                message.To.Add(new MailboxAddress("", email));
                message.Subject = "Welcome to Project 3 - Registration Successful";

                var bodyBuilder = new BodyBuilder
                {
                    HtmlBody = $@"
                        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                            <h2 style='color: #333;'>Welcome to Project 3!</h2>
                            <p>Dear {username},</p>
                            <p>Thank you for registering with Project 3. Your account has been successfully created.</p>
                            <p>You can now log in and start using our services.</p>
                            <div style='text-align: center; margin: 30px 0;'>
                                <a href='{_configuration["Email:ResetPasswordBaseUrl"]}/login' style='background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;'>Login Now</a>
                            </div>
                            <p>If you have any questions, please don't hesitate to contact us.</p>
                            <p style='color: #999; font-size: 12px;'>Best regards,<br/>Project 3 Team</p>
                        </div>"
                };

                message.Body = bodyBuilder.ToMessageBody();

                using var client = new SmtpClient();
                
                var secureSocketOptions = smtpPort == 465 
                    ? SecureSocketOptions.SslOnConnect 
                    : SecureSocketOptions.StartTls;
                
                _logger.LogInformation("Connecting to SMTP server: {Host}:{Port} with {Security}", 
                    smtpHost, smtpPort, secureSocketOptions);
                
                await client.ConnectAsync(smtpHost, smtpPort, secureSocketOptions);
                
                if (!string.IsNullOrEmpty(smtpUsername) && !string.IsNullOrEmpty(smtpPassword))
                {
                    _logger.LogInformation("Authenticating with username: {Username}", smtpUsername);
                    await client.AuthenticateAsync(smtpUsername, smtpPassword);
                }
                
                _logger.LogInformation("Sending registration confirmation email to: {Email}", email);
                await client.SendAsync(message);
                await client.DisconnectAsync(true);
                
                _logger.LogInformation("Registration confirmation email sent successfully to: {Email}", email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send registration confirmation email to {Email}. Error: {Error}", 
                    email, ex.Message);
                throw;
            }
        }
    }
}
