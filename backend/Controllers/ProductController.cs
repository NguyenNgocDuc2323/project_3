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
            var productQuery = _context.Products
                .Where(p => !categoryId.HasValue || p.CategoryId == categoryId.Value)
                .Where(p => !featured.HasValue || !featured.Value || p.IsFeatured);

            var products = await BuildProductQuery(productQuery)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            // Calculate FavoriteCount for each product
            var productIds = products.Select(p => p.Id).ToList();
            var favoriteCounts = await _context.Favorites
                .Where(f => productIds.Contains(f.ProductId))
                .GroupBy(f => f.ProductId)
                .Select(g => new { ProductId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.ProductId, x => x.Count);

            foreach (var product in products)
            {
                product.FavoriteCount = favoriteCounts.GetValueOrDefault(product.Id, 0);
            }

            return Ok(products);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProductWithFavoriteCountDto>> GetProduct(int id)
        {
            try
            {
                // Check if product exists and update views without loading IsBestSeller
                var productExists = await _context.Products
                    .Where(p => p.Id == id)
                    .Select(p => new { p.Id, p.Views })
                    .FirstOrDefaultAsync();

                if (productExists == null)
                {
                    return NotFound();
                }

                // Update views
                await _context.Products
                    .Where(p => p.Id == id)
                    .ExecuteUpdateAsync(p => p.SetProperty(x => x.Views, x => x.Views + 1));

                // Get product DTO
                var productDto = await BuildProductQuery()
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (productDto == null)
                {
                    return NotFound();
                }

                return Ok(productDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while loading the product.", error = ex.Message });
            }
        }

        [HttpGet("popular")]
        public async Task<ActionResult<IEnumerable<ProductWithFavoriteCountDto>>> GetPopularProducts([FromQuery] int limit = 5)
        {
            var products = await BuildProductQuery()
                .OrderByDescending(p => p.Views)
                .ThenByDescending(p => p.Likes)
                .Take(limit)
                .ToListAsync();

            // Calculate FavoriteCount for each product
            var productIds = products.Select(p => p.Id).ToList();
            var favoriteCounts = await _context.Favorites
                .Where(f => productIds.Contains(f.ProductId))
                .GroupBy(f => f.ProductId)
                .Select(g => new { ProductId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.ProductId, x => x.Count);

            foreach (var product in products)
            {
                product.FavoriteCount = favoriteCounts.GetValueOrDefault(product.Id, 0);
            }

            return Ok(products);
        }

        private IQueryable<ProductWithFavoriteCountDto> BuildProductQuery(IQueryable<Product>? baseQuery = null)
        {
            var query = baseQuery ?? _context.Products;
            
            return query
                .AsNoTracking()
                .Select(p => new ProductWithFavoriteCountDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    StyleCode = p.StyleCode,
                    ProductType = p.ProductType,
                    Brand = p.Brand,
                    GoldCarat = p.GoldCarat,
                    MaterialName = p.Material != null ? p.Material.Name : null,
                    MaterialPriceMultiplier = p.Material != null ? p.Material.PriceMultiplier : 1m,
                    MetalColorName = p.MetalColor != null ? p.MetalColor.Name : null,
                    MetalColorHex = p.MetalColor != null ? p.MetalColor.HexCode : null,
                    MetalColorPriceMultiplier = p.MetalColor != null ? p.MetalColor.PriceMultiplier : 1m,
                    Sizes = p.ProductSizes
                        .Select(ps => ps.Size != null ? ps.Size.Name : null)
                        .Where(name => name != null)
                        .Select(name => name!)
                        .ToList(),
                    SizeOptions = p.ProductSizes
                        .Where(ps => ps.Size != null)
                        .Select(ps => new SizeOptionDto
                        {
                            Name = ps.Size!.Name,
                            PriceMultiplier = ps.Size!.PriceMultiplier
                        })
                        .ToList(),
                    MRP = p.MRP,
                    OriginalPrice = p.OriginalPrice,
                    ImageUrl = p.ImageUrl,
                    Views = p.Views,
                    Likes = p.Likes,
                    CategoryId = p.CategoryId,
                    Category = p.Category != null ? new CategoryDto
                    {
                        Id = p.Category.Id,
                        Name = p.Category.Name,
                        Description = p.Category.Description
                    } : null,
                    IsFeatured = p.IsFeatured,
                    CreatedAt = p.CreatedAt,
                    FavoriteCount = 0, // Will be calculated separately
                    Images = p.ProductImages
                        .OrderBy(img => img.SortOrder)
                        .Select(img => img.ImageUrl)
                        .ToList()
                });
        }

        public class ProductWithFavoriteCountDto
        {
            public int Id { get; set; }
            public string Name { get; set; } = string.Empty;
            public string StyleCode { get; set; } = string.Empty;
            public string ProductType { get; set; } = string.Empty;
            public string Brand { get; set; } = string.Empty;
            public string GoldCarat { get; set; } = string.Empty;
            public string? MaterialName { get; set; }
            public decimal MaterialPriceMultiplier { get; set; }
            public string? MetalColorName { get; set; }
            public string? MetalColorHex { get; set; }
            public decimal MetalColorPriceMultiplier { get; set; }
            public List<string> Sizes { get; set; } = new List<string>();
            public List<SizeOptionDto> SizeOptions { get; set; } = new List<SizeOptionDto>();
            public decimal MRP { get; set; }
            public decimal OriginalPrice { get; set; }
            public string ImageUrl { get; set; } = string.Empty;
            public int Views { get; set; }
            public int Likes { get; set; }
            public int? CategoryId { get; set; }
            public CategoryDto? Category { get; set; }
            public bool IsFeatured { get; set; }
            public DateTime CreatedAt { get; set; }
            public int FavoriteCount { get; set; }
            public List<string> Images { get; set; } = new List<string>();
        }

        public class SizeOptionDto
        {
            public string Name { get; set; } = string.Empty;
            public decimal PriceMultiplier { get; set; }
        }

        public class CategoryDto
        {
            public int Id { get; set; }
            public string Name { get; set; } = string.Empty;
            public string? Description { get; set; }
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
            existingProduct.StyleCode = product.StyleCode;
            existingProduct.ProductType = product.ProductType;
            existingProduct.Brand = product.Brand;
            existingProduct.GoldCarat = product.GoldCarat;
            existingProduct.MRP = product.MRP;
            existingProduct.OriginalPrice = product.OriginalPrice;
            existingProduct.ImageUrl = product.ImageUrl;
            existingProduct.CategoryId = product.CategoryId;
            existingProduct.IsFeatured = product.IsFeatured;

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

