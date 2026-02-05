using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Payment
    {
        public int Id { get; set; }

        [Required]
        public int OrderId { get; set; }

        [Required]
        public int UserId { get; set; }

        public decimal Amount { get; set; }

        [Required]
        [StringLength(10)]
        public string Currency { get; set; } = "VND";

        [Required]
        [StringLength(50)]
        public string Status { get; set; } = "Pending";

        [StringLength(100)]
        public string? Provider { get; set; }

        [StringLength(100)]
        public string? Method { get; set; }

        [StringLength(255)]
        public string? Reference { get; set; }

        public DateTime? PaidAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public Order? Order { get; set; }

        public User? User { get; set; }
    }
}
