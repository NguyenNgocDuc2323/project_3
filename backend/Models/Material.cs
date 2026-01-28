using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Material
    {
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string Name { get; set; } = string.Empty;

        public decimal PriceMultiplier { get; set; } = 1m;

        public ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
