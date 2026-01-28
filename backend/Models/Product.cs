using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Product
    {
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [StringLength(100)]
        public string Designer { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string StyleCode { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string ProductType { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Brand { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string GoldCarat { get; set; } = string.Empty;

        public decimal GoldWeight { get; set; }

        public decimal DiamondCarat { get; set; }

        [StringLength(50)]
        public string? DiamondQuality { get; set; }

        [StringLength(50)]
        public string? StoneType { get; set; }

        public decimal StoneCarat { get; set; }

        public int Quantity { get; set; } = 0;

        public decimal MakingCharges { get; set; }

        public decimal MRP { get; set; }

        public decimal OriginalPrice { get; set; }

        [StringLength(1000)]
        public string? Description { get; set; }

        [Required]
        [StringLength(500)]
        public string ImageUrl { get; set; } = string.Empty;

        public int Views { get; set; } = 0;

        public int Likes { get; set; } = 0;

        public int? CategoryId { get; set; }

        public Category? Category { get; set; }

        public bool IsFeatured { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public int? MaterialId { get; set; }

        public Material? Material { get; set; }

        public int? MetalColorId { get; set; }

        public MetalColor? MetalColor { get; set; }

        public ICollection<ProductImage> ProductImages { get; set; } = new List<ProductImage>();

        public ICollection<ProductSize> ProductSizes { get; set; } = new List<ProductSize>();

        public ICollection<Review> Reviews { get; set; } = new List<Review>();
    }
}

