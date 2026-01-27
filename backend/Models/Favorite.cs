using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Favorite
    {
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public int ProductId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public User? User { get; set; }

        public Product? Product { get; set; }
    }
}
