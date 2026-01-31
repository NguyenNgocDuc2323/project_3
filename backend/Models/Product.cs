using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Product
    {
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

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

        public decimal MRP { get; set; }

        public decimal OriginalPrice { get; set; }

        [Required]
        [StringLength(500)]
        public string ImageUrl { get; set; } = string.Empty;

        public int Views { get; set; } = 0;

        public int Likes { get; set; } = 0;

        public int? CategoryId { get; set; }

        public Category? Category { get; set; }

        public bool IsFeatured { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;


        public int? MaterialId { get; set; }

        public Material? Material { get; set; }

        public int? MetalColorId { get; set; }

        public MetalColor? MetalColor { get; set; }

        public ICollection<ProductImage> ProductImages { get; set; } = new List<ProductImage>();

        public ICollection<ProductSize> ProductSizes { get; set; } = new List<ProductSize>();

        public ICollection<Review> Reviews { get; set; } = new List<Review>();

        public ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
    }
}

