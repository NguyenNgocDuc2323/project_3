using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/products")]
    public class ProductController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductWithFavoriteCountDto>>> GetProducts([FromQuery] int? categoryId = null, [FromQuery] bool? featured = null)
        {
            var products = await BuildProductQuery()
                .Where(p => !categoryId.HasValue || p.CategoryId == categoryId.Value)
                .Where(p => !featured.HasValue || !featured.Value || p.IsFeatured)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return Ok(products);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProductWithFavoriteCountDto>> GetProduct(int id)
        {
            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                return NotFound();
            }

            product.Views++;
            await _context.SaveChangesAsync();

            var productDto = await BuildProductQuery()
                .FirstOrDefaultAsync(p => p.Id == id);

            return Ok(productDto);
        }

        [HttpGet("popular")]
        public async Task<ActionResult<IEnumerable<ProductWithFavoriteCountDto>>> GetPopularProducts([FromQuery] int limit = 5)
        {
            var products = await BuildProductQuery()
                .OrderByDescending(p => p.Views)
                .ThenByDescending(p => p.Likes)
                .Take(limit)
                .ToListAsync();

            return Ok(products);
        }

        private IQueryable<ProductWithFavoriteCountDto> BuildProductQuery()
        {
            return _context.Products
                .Include(p => p.Category)
                .AsNoTracking()
                .Select(p => new ProductWithFavoriteCountDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Designer = p.Designer,
                    StyleCode = p.StyleCode,
                    ProductType = p.ProductType,
                    Brand = p.Brand,
                    GoldCarat = p.GoldCarat,
                    GoldWeight = p.GoldWeight,
                    DiamondCarat = p.DiamondCarat,
                    DiamondQuality = p.DiamondQuality,
                    StoneType = p.StoneType,
                    StoneCarat = p.StoneCarat,
                    Quantity = p.Quantity,
                    MakingCharges = p.MakingCharges,
                    MRP = p.MRP,
                    Description = p.Description,
                    ImageUrl = p.ImageUrl,
                    Views = p.Views,
                    Likes = p.Likes,
                    CategoryId = p.CategoryId,
                    Category = p.Category,
                    IsFeatured = p.IsFeatured,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt,
                    FavoriteCount = _context.Favorites.Count(f => f.ProductId == p.Id)
                });
        }

        public class ProductWithFavoriteCountDto
        {
            public int Id { get; set; }
            public string Name { get; set; } = string.Empty;
            public string Designer { get; set; } = string.Empty;
            public string StyleCode { get; set; } = string.Empty;
            public string ProductType { get; set; } = string.Empty;
            public string Brand { get; set; } = string.Empty;
            public string GoldCarat { get; set; } = string.Empty;
            public decimal GoldWeight { get; set; }
            public decimal DiamondCarat { get; set; }
            public string? DiamondQuality { get; set; }
            public string? StoneType { get; set; }
            public decimal StoneCarat { get; set; }
            public int Quantity { get; set; }
            public decimal MakingCharges { get; set; }
            public decimal MRP { get; set; }
            public string? Description { get; set; }
            public string ImageUrl { get; set; } = string.Empty;
            public int Views { get; set; }
            public int Likes { get; set; }
            public int? CategoryId { get; set; }
            public Category? Category { get; set; }
            public bool IsFeatured { get; set; }
            public DateTime CreatedAt { get; set; }
            public DateTime? UpdatedAt { get; set; }
            public int FavoriteCount { get; set; }
        }

        [HttpPost]
        [Authorize(Roles = "1")] // 1 = Admin
        public async Task<ActionResult<Product>> CreateProduct([FromBody] Product product)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            product.CreatedAt = DateTime.UtcNow;
            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "1")] // 1 = Admin
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] Product product)
        {
            if (id != product.Id)
            {
                return BadRequest();
            }

            var existingProduct = await _context.Products.FindAsync(id);
            if (existingProduct == null)
            {
                return NotFound();
            }

            existingProduct.Name = product.Name;
            existingProduct.Designer = product.Designer;
            existingProduct.StyleCode = product.StyleCode;
            existingProduct.ProductType = product.ProductType;
            existingProduct.Brand = product.Brand;
            existingProduct.GoldCarat = product.GoldCarat;
            existingProduct.GoldWeight = product.GoldWeight;
            existingProduct.DiamondCarat = product.DiamondCarat;
            existingProduct.DiamondQuality = product.DiamondQuality;
            existingProduct.StoneType = product.StoneType;
            existingProduct.StoneCarat = product.StoneCarat;
            existingProduct.Quantity = product.Quantity;
            existingProduct.MakingCharges = product.MakingCharges;
            existingProduct.MRP = product.MRP;
            existingProduct.Description = product.Description;
            existingProduct.ImageUrl = product.ImageUrl;
            existingProduct.CategoryId = product.CategoryId;
            existingProduct.IsFeatured = product.IsFeatured;
            existingProduct.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "1")] // 1 = Admin
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

