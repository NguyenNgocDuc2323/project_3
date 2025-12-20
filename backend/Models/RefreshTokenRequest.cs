using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class RefreshTokenRequest
    {
        [Required(ErrorMessage = "Refresh token là bắt buộc")]
        public string RefreshToken { get; set; } = string.Empty;
    }
}



