using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Size
    {
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string Name { get; set; } = string.Empty;

        public decimal PriceMultiplier { get; set; } = 1m;

        public ICollection<ProductSize> ProductSizes { get; set; } = new List<ProductSize>();
    }
}
