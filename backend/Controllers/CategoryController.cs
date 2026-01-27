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
            var categories = await _context.Categories
                .AsNoTracking()
                .Include(c => c.Products)
                .Include(c => c.Children)
                .ThenInclude(c => c.Products)
                .OrderBy(c => c.Name)
                .ToListAsync();

            var parentCategories = categories
                .Where(c => c.ParentCategoryId == null)
                .Select(ToTreeDto)
                .ToList();

            return Ok(parentCategories);
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

        private static CategoryTreeDto ToTreeDto(Category category)
        {
            return new CategoryTreeDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                ParentCategoryId = category.ParentCategoryId,
                Products = category.Products
                    .OrderBy(p => p.Name)
                    .Select(p => new CategoryProductDto
                    {
                        Id = p.Id,
                        Name = p.Name,
                        ProductType = p.ProductType,
                        MRP = p.MRP,
                        ImageUrl = p.ImageUrl
                    })
                    .ToList(),
                Children = category.Children
                    .OrderBy(c => c.Name)
                    .Select(ToTreeDto)
                    .ToList()
            };
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

