using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CartController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CartController> _logger;

        public CartController(ApplicationDbContext context, ILogger<CartController> logger)
        {
            _context = context;
            _logger = logger;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : 0;
        }

        private async Task<Cart> GetOrCreateCartAsync(int userId)
        {
            var cart = await _context.Carts
                .Include(c => c.Items)
                    .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                cart = new Cart
                {
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();
            }

            return cart;
        }

        [HttpGet]
        public async Task<ActionResult<CartDto>> GetCart()
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
            {
                return Unauthorized(new { message = "Invalid user" });
            }

            var cart = await GetOrCreateCartAsync(userId);

            var cartDto = new CartDto
            {
                Id = cart.Id,
                UserId = cart.UserId,
                Items = cart.Items.Select(i => new CartItemDto
                {
                    Id = i.Id,
                    ProductId = i.ProductId,
                    ProductName = i.Product.Name,
                    ProductImageUrl = i.Product.ImageUrl,
                    ProductMRP = i.Product.MRP,
                    Quantity = i.Quantity,
                    Subtotal = i.Product.MRP * i.Quantity
                }).ToList(),
                TotalItems = cart.Items.Sum(i => i.Quantity),
                TotalAmount = cart.Items.Sum(i => i.Product.MRP * i.Quantity)
            };

            return Ok(cartDto);
        }

        [HttpPost("items")]
        public async Task<ActionResult<CartDto>> AddItem([FromBody] AddCartItemRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
            {
                return Unauthorized(new { message = "Invalid user" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var product = await _context.Products.FindAsync(request.ProductId);
            if (product == null)
            {
                return NotFound(new { message = "Product not found" });
            }

            if (product.Quantity < request.Quantity)
            {
                return BadRequest(new { message = "Insufficient product quantity" });
            }

            var cart = await GetOrCreateCartAsync(userId);

            var existingItem = cart.Items.FirstOrDefault(i => i.ProductId == request.ProductId);
            if (existingItem != null)
            {
                existingItem.Quantity += request.Quantity;
                existingItem.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                var newItem = new CartItem
                {
                    CartId = cart.Id,
                    ProductId = request.ProductId,
                    Quantity = request.Quantity,
                    CreatedAt = DateTime.UtcNow
                };
                cart.Items.Add(newItem);
            }

            cart.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(await GetCartDtoAsync(cart.Id));
        }

        [HttpPut("items/{itemId}")]
        public async Task<ActionResult<CartDto>> UpdateItemQuantity(int itemId, [FromBody] UpdateCartItemRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
            {
                return Unauthorized(new { message = "Invalid user" });
            }

            if (request.Quantity < 1)
            {
                return BadRequest(new { message = "Quantity must be at least 1" });
            }

            var cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                return NotFound(new { message = "Cart not found" });
            }

            var item = cart.Items.FirstOrDefault(i => i.Id == itemId);
            if (item == null)
            {
                return NotFound(new { message = "Cart item not found" });
            }

            var product = await _context.Products.FindAsync(item.ProductId);
            if (product == null)
            {
                return NotFound(new { message = "Product not found" });
            }

            if (product.Quantity < request.Quantity)
            {
                return BadRequest(new { message = "Insufficient product quantity" });
            }

            item.Quantity = request.Quantity;
            item.UpdatedAt = DateTime.UtcNow;
            cart.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(await GetCartDtoAsync(cart.Id));
        }

        [HttpDelete("items/{itemId}")]
        public async Task<ActionResult<CartDto>> RemoveItem(int itemId)
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
            {
                return Unauthorized(new { message = "Invalid user" });
            }

            var cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                return NotFound(new { message = "Cart not found" });
            }

            var item = cart.Items.FirstOrDefault(i => i.Id == itemId);
            if (item == null)
            {
                return NotFound(new { message = "Cart item not found" });
            }

            cart.Items.Remove(item);
            cart.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(await GetCartDtoAsync(cart.Id));
        }

        [HttpDelete("clear")]
        public async Task<ActionResult> ClearCart()
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
            {
                return Unauthorized(new { message = "Invalid user" });
            }

            var cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                return NotFound(new { message = "Cart not found" });
            }

            _context.CartItems.RemoveRange(cart.Items);
            cart.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Cart cleared successfully" });
        }

        private async Task<CartDto> GetCartDtoAsync(int cartId)
        {
            var cart = await _context.Carts
                .Include(c => c.Items)
                    .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(c => c.Id == cartId);

            if (cart == null)
            {
                return new CartDto();
            }

            return new CartDto
            {
                Id = cart.Id,
                UserId = cart.UserId,
                Items = cart.Items.Select(i => new CartItemDto
                {
                    Id = i.Id,
                    ProductId = i.ProductId,
                    ProductName = i.Product.Name,
                    ProductImageUrl = i.Product.ImageUrl,
                    ProductMRP = i.Product.MRP,
                    Quantity = i.Quantity,
                    Subtotal = i.Product.MRP * i.Quantity
                }).ToList(),
                TotalItems = cart.Items.Sum(i => i.Quantity),
                TotalAmount = cart.Items.Sum(i => i.Product.MRP * i.Quantity)
            };
        }
    }

    public class AddCartItemRequest
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; } = 1;
    }

    public class UpdateCartItemRequest
    {
        public int Quantity { get; set; }
    }

    public class CartDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public List<CartItemDto> Items { get; set; } = new();
        public int TotalItems { get; set; }
        public decimal TotalAmount { get; set; }
    }

    public class CartItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string ProductImageUrl { get; set; } = string.Empty;
        public decimal ProductMRP { get; set; }
        public int Quantity { get; set; }
        public decimal Subtotal { get; set; }
    }
}

