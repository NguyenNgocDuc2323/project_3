using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<PasswordResetToken> PasswordResetTokens { get; set; }
        public DbSet<Story> Stories { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<EmailVerificationToken> EmailVerificationTokens { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Favorite> Favorites { get; set; }
        public DbSet<Payment> Payments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Username).IsUnique();
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
                entity.Property(e => e.PasswordHash).IsRequired();
                entity.Property(e => e.CreatedAt).IsRequired();
                entity.Property(e => e.Role).IsRequired().HasDefaultValue(2); // 1 = Admin, 2 = User
            });

            modelBuilder.Entity<RefreshToken>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Token).IsUnique();
                entity.Property(e => e.Token).IsRequired();
                entity.Property(e => e.ExpiresAt).IsRequired();
                entity.Property(e => e.UserId).IsRequired();
                entity.Property(e => e.CreatedAt).IsRequired();

                entity.HasOne(e => e.User)
                      .WithMany(u => u.RefreshTokens)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<PasswordResetToken>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Token).IsUnique();
                entity.Property(e => e.Token).IsRequired();
                entity.Property(e => e.UserId).IsRequired();
                entity.Property(e => e.ExpiresAt).IsRequired();
                entity.Property(e => e.CreatedAt).IsRequired();

                entity.HasOne(e => e.User)
                      .WithMany(u => u.PasswordResetTokens)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<EmailVerificationToken>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Token).IsUnique();
                entity.Property(e => e.Token).IsRequired();
                entity.Property(e => e.UserId).IsRequired();
                entity.Property(e => e.ExpiresAt).IsRequired();
                entity.Property(e => e.CreatedAt).IsRequired();

                entity.HasOne(e => e.User)
                      .WithMany(u => u.EmailVerificationTokens)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Story>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Author).HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(1000);
                entity.Property(e => e.ImageUrl).IsRequired().HasMaxLength(500);
                entity.Property(e => e.Category).HasMaxLength(50);
                entity.Property(e => e.CreatedAt).IsRequired();
                entity.HasIndex(e => e.IsFeatured);
            });

            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.CreatedAt).IsRequired();
                entity.HasIndex(e => e.Name);
            });

            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
                entity.Property(e => e.StyleCode).IsRequired().HasMaxLength(50);
                entity.Property(e => e.ProductType).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Brand).IsRequired().HasMaxLength(50);
                entity.Property(e => e.GoldCarat).IsRequired().HasMaxLength(20);
                entity.Property(e => e.MRP).HasColumnType("decimal(10,2)");
                entity.Property(e => e.OriginalPrice).HasColumnType("decimal(10,2)");
                entity.Property(e => e.ImageUrl).IsRequired().HasMaxLength(500);
                entity.Property(e => e.CreatedAt).IsRequired();
                entity.HasIndex(e => e.IsFeatured);
                entity.HasIndex(e => e.StyleCode);
                entity.HasIndex(e => e.CategoryId);

                entity.HasOne(e => e.Category)
                      .WithMany(c => c.Products)
                      .HasForeignKey(e => e.CategoryId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<Cart>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.UserId).IsRequired();
                entity.Property(e => e.CreatedAt).IsRequired();

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.UserId).IsUnique();
            });

            modelBuilder.Entity<CartItem>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.CartId).IsRequired();
                entity.Property(e => e.ProductId).IsRequired();
                entity.Property(e => e.Quantity).IsRequired();
                entity.Property(e => e.CreatedAt).IsRequired();

                entity.HasOne(e => e.Cart)
                      .WithMany(c => c.Items)
                      .HasForeignKey(e => e.CartId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Product)
                      .WithMany()
                      .HasForeignKey(e => e.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.CartId, e.ProductId }).IsUnique();
            });

            modelBuilder.Entity<Order>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.UserId).IsRequired();
                entity.Property(e => e.Status).IsRequired().HasMaxLength(50).HasDefaultValue("Pending");
                entity.Property(e => e.Subtotal).HasColumnType("decimal(10,2)");
                entity.Property(e => e.Total).HasColumnType("decimal(10,2)");
                entity.Property(e => e.ShippingAddress).HasMaxLength(255);
                entity.Property(e => e.PaymentMethod).HasMaxLength(100);
                entity.Property(e => e.CreatedAt).IsRequired();
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.Status);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<OrderItem>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.OrderId).IsRequired();
                entity.Property(e => e.ProductId).IsRequired();
                entity.Property(e => e.Quantity).IsRequired();
                entity.Property(e => e.UnitPrice).HasColumnType("decimal(10,2)");
                entity.Property(e => e.TotalPrice).HasColumnType("decimal(10,2)");
                entity.HasIndex(e => new { e.OrderId, e.ProductId }).IsUnique();

                entity.HasOne(e => e.Order)
                      .WithMany(o => o.Items)
                      .HasForeignKey(e => e.OrderId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Product)
                      .WithMany()
                      .HasForeignKey(e => e.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Review>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.UserId).IsRequired();
                entity.Property(e => e.ProductId).IsRequired();
                entity.Property(e => e.Rating).IsRequired();
                entity.Property(e => e.Comment).HasMaxLength(1000);
                entity.Property(e => e.CreatedAt).IsRequired();
                entity.HasIndex(e => new { e.UserId, e.ProductId }).IsUnique();
                entity.HasIndex(e => e.ProductId);
                entity.HasIndex(e => e.UserId);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Product)
                      .WithMany(p => p.Reviews)
                      .HasForeignKey(e => e.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Favorite>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.UserId).IsRequired();
                entity.Property(e => e.ProductId).IsRequired();
                entity.Property(e => e.CreatedAt).IsRequired();
                entity.HasIndex(e => new { e.UserId, e.ProductId }).IsUnique();
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.ProductId);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Product)
                      .WithMany()
                      .HasForeignKey(e => e.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Payment>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.OrderId).IsRequired();
                entity.Property(e => e.UserId).IsRequired();
                entity.Property(e => e.Amount).HasColumnType("decimal(10,2)");
                entity.Property(e => e.Currency).IsRequired().HasMaxLength(10).HasDefaultValue("USD");
                entity.Property(e => e.Status).IsRequired().HasMaxLength(50).HasDefaultValue("Pending");
                entity.Property(e => e.Provider).HasMaxLength(100);
                entity.Property(e => e.Method).HasMaxLength(100);
                entity.Property(e => e.Reference).HasMaxLength(255);
                entity.Property(e => e.CreatedAt).IsRequired();
                entity.HasIndex(e => e.OrderId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.Reference);

                entity.HasOne(e => e.Order)
                      .WithMany(o => o.Payments)
                      .HasForeignKey(e => e.OrderId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}

