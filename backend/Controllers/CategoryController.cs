using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/categories")]
    public class CategoryController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CategoryController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
        {
            var categories = await _context.Categories
                .OrderBy(c => c.Name)
                .ToListAsync();

            return Ok(categories);
        }

        [HttpGet("tree")]
        public async Task<ActionResult<IEnumerable<CategoryTreeDto>>> GetCategoryTree()
        {
            try
            {
                // Load all categories first
                var allCategories = await _context.Categories
                    .AsNoTracking()
                    .OrderBy(c => c.Name)
                    .ToListAsync();

                if (!allCategories.Any())
                {
                    return Ok(new List<CategoryTreeDto>());
                }

                // Load products separately to avoid complex joins
                var categoryIds = allCategories.Select(c => c.Id).ToList();
                var products = await _context.Products
                    .AsNoTracking()
                    .Where(p => p.CategoryId != null && categoryIds.Contains(p.CategoryId.Value))
                    .Select(p => new
                    {
                        p.Id,
                        p.Name,
                        p.ProductType,
                        p.MRP,
                        p.ImageUrl,
                        p.CategoryId
                    })
                    .ToListAsync();

                // Group products by category
                var productsByCategory = products
                    .GroupBy(p => p.CategoryId!.Value)
                    .ToDictionary(g => g.Key, g => g.Select(p => new CategoryProductDto
                    {
                        Id = p.Id,
                        Name = p.Name,
                        ProductType = p.ProductType,
                        MRP = p.MRP,
                        ImageUrl = p.ImageUrl
                    }).OrderBy(p => p.Name).ToList());

                // Build tree structure
                var parentCategories = allCategories
                    .Where(c => c.ParentCategoryId == null)
                    .Select(c => BuildTreeDto(c, allCategories, productsByCategory))
                    .ToList();

                return Ok(parentCategories);
            }
            catch (Exception)
            {
                // Log error and return empty tree to prevent frontend crash
                // In production, you might want to log this to a logging service
                return Ok(new List<CategoryTreeDto>());
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Category>> GetCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);

            if (category == null)
            {
                return NotFound();
            }

            return Ok(category);
        }

        [HttpPost]
        public async Task<ActionResult<Category>> CreateCategory([FromBody] Category category)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            category.CreatedAt = DateTime.UtcNow;
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] Category category)
        {
            if (id != category.Id)
            {
                return BadRequest();
            }

            var existingCategory = await _context.Categories.FindAsync(id);
            if (existingCategory == null)
            {
                return NotFound();
            }

            existingCategory.Name = category.Name;
            existingCategory.Description = category.Description;
            existingCategory.ParentCategoryId = category.ParentCategoryId;
            existingCategory.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                return NotFound();
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private static CategoryTreeDto BuildTreeDto(
            Category category,
            List<Category> allCategories,
            Dictionary<int, List<CategoryProductDto>> productsByCategory)
        {
            var dto = new CategoryTreeDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                ParentCategoryId = category.ParentCategoryId,
                Products = productsByCategory.ContainsKey(category.Id)
                    ? productsByCategory[category.Id]
                    : new List<CategoryProductDto>(),
                Children = allCategories
                    .Where(c => c.ParentCategoryId == category.Id)
                    .OrderBy(c => c.Name)
                    .Select(c => BuildTreeDto(c, allCategories, productsByCategory))
                    .ToList()
            };

            return dto;
        }

        public class CategoryTreeDto
        {
            public int Id { get; set; }
            public string Name { get; set; } = string.Empty;
            public string? Description { get; set; }
            public int? ParentCategoryId { get; set; }
            public List<CategoryTreeDto> Children { get; set; } = new();
            public List<CategoryProductDto> Products { get; set; } = new();
        }

        public class CategoryProductDto
        {
            public int Id { get; set; }
            public string Name { get; set; } = string.Empty;
            public string ProductType { get; set; } = string.Empty;
            public decimal MRP { get; set; }
            public string ImageUrl { get; set; } = string.Empty;
        }
    }
}

