using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Backend.Data;
using Backend.Models;
using Backend.Services;
using Microsoft.Extensions.DependencyInjection;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;
using Microsoft.OpenApi.Models;
using DotNetEnv;

var envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
if (File.Exists(envPath))
{
    Env.Load(envPath);
}

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.MaxDepth = 32;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Project 3 API",
        Version = "v1",
        Description = "API documentation for Project 3 - Full Stack Application"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.\nExample: \"Bearer 12345abcdef\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins(
                    "http://localhost:3000",
                    "http://localhost:5173"
                  )
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        new MySqlServerVersion(new Version(8, 0, 21)),
        mySqlOptions => mySqlOptions.EnableRetryOnFailure()
    ));

var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("JWT Issuer not configured");
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? throw new InvalidOperationException("JWT Audience not configured");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddHttpClient();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEmailService, EmailService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


app.UseCors("AllowReactApp");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

if (app.Environment.IsDevelopment())
{
    app.MapGet("/", () => Results.Redirect("/swagger")).ExcludeFromDescription();
}

if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

    try
    {
        app.Logger.LogInformation("Checking database migrations...");
        
        if (db.Database.CanConnect())
        {
            app.Logger.LogInformation("Database connection successful!");
        }
        
        await db.Database.MigrateAsync();
        app.Logger.LogInformation("Database migrations applied successfully!");

        if (await db.Categories.AnyAsync())
        {
            app.Logger.LogInformation("Categories table already has data, skipping seed.");
        }
        else
        {
            app.Logger.LogInformation("Seeding categories data...");
            await SeedCategoriesAsync(db);
            app.Logger.LogInformation("Categories seeded successfully!");
        }

        if (await db.Products.AnyAsync())
        {
            app.Logger.LogInformation("Products table already has data, skipping seed.");
        }
        else
        {
            app.Logger.LogInformation("Seeding products data...");
            await SeedProductsAsync(db);
            app.Logger.LogInformation("Products seeded successfully!");
        }

        if (await db.Stories.AnyAsync())
        {
            app.Logger.LogInformation("Stories table already has data, skipping seed.");
        }
        else
        {
            app.Logger.LogInformation("Seeding stories data...");
            await SeedStoriesAsync(db);
            app.Logger.LogInformation("Stories seeded successfully!");
        }
    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "Failed to connect to database. Please check MySQL connection settings.");
        app.Logger.LogError("Error: {Message}", ex.Message);
        app.Logger.LogError("Stack trace: {StackTrace}", ex.StackTrace);
    }
}

static async Task SeedCategoriesAsync(ApplicationDbContext db)
{
    var categories = new List<Category>
    {
        new Category { Name = "Rings", Description = "Engagement, wedding, and statement rings", CreatedAt = DateTime.UtcNow.AddDays(-10) },
        new Category { Name = "Necklaces", Description = "Gold and diamond necklaces for every occasion", CreatedAt = DateTime.UtcNow.AddDays(-10) },
        new Category { Name = "Earrings", Description = "Studs, hoops, and chandelier designs", CreatedAt = DateTime.UtcNow.AddDays(-10) },
        new Category { Name = "Bracelets", Description = "Timeless gold and diamond bracelets", CreatedAt = DateTime.UtcNow.AddDays(-10) },
        new Category { Name = "Bangles", Description = "Elegant bangles with modern craftsmanship", CreatedAt = DateTime.UtcNow.AddDays(-10) },
        new Category { Name = "Pendants", Description = "Signature pendants with precious stones", CreatedAt = DateTime.UtcNow.AddDays(-10) },
        new Category { Name = "Bridal Sets", Description = "Curated bridal jewelry collections", CreatedAt = DateTime.UtcNow.AddDays(-10) },
        new Category { Name = "Heritage", Description = "Classic designs inspired by Indian heritage", CreatedAt = DateTime.UtcNow.AddDays(-10) }
    };

    db.Categories.AddRange(categories);
    await db.SaveChangesAsync();
}

static async Task SeedProductsAsync(ApplicationDbContext db)
{
    var categoryMap = await db.Categories.ToDictionaryAsync(c => c.Name, c => c.Id);

    var products = new List<Product>
    {
        new Product
        {
            Name = "Regal Solitaire Ring",
            Designer = "Aanya Mehta",
            StyleCode = "RG-ASM-102",
            ProductType = "Ring",
            Brand = "Asmi",
            GoldCarat = "18K",
            GoldWeight = 6.250m,
            DiamondCarat = 0.75m,
            DiamondQuality = "VVS",
            StoneType = "Ruby",
            StoneCarat = 0.20m,
            Quantity = 12,
            MakingCharges = 8500m,
            MRP = 185000m,
            Description = "A regal solitaire ring with diamond brilliance and ruby accents.",
            ImageUrl = "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&h=600&fit=crop&q=80",
            CategoryId = categoryMap.GetValueOrDefault("Rings"),
            Views = 15200,
            Likes = 1200,
            IsFeatured = true,
            CreatedAt = DateTime.UtcNow.AddDays(-20)
        },
        new Product
        {
            Name = "Imperial Halo Necklace",
            Designer = "Rohan Kapoor",
            StyleCode = "NK-DDM-415",
            ProductType = "Necklace",
            Brand = "Ddamas",
            GoldCarat = "22K",
            GoldWeight = 18.500m,
            DiamondCarat = 1.25m,
            DiamondQuality = "VS",
            StoneType = "Sapphire",
            StoneCarat = 0.40m,
            Quantity = 5,
            MakingCharges = 14500m,
            MRP = 425000m,
            Description = "An opulent necklace with halo diamonds and a sapphire centerpiece.",
            ImageUrl = "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800&h=600&fit=crop&q=80",
            CategoryId = categoryMap.GetValueOrDefault("Necklaces"),
            Views = 9800,
            Likes = 756,
            IsFeatured = true,
            CreatedAt = DateTime.UtcNow.AddDays(-18)
        },
        new Product
        {
            Name = "Celestial Drop Earrings",
            Designer = "Meera Shah",
            StyleCode = "ER-CT-308",
            ProductType = "Earrings",
            Brand = "Caratlane",
            GoldCarat = "18K",
            GoldWeight = 4.200m,
            DiamondCarat = 0.60m,
            DiamondQuality = "VVS",
            StoneType = "Emerald",
            StoneCarat = 0.15m,
            Quantity = 20,
            MakingCharges = 6200m,
            MRP = 118000m,
            Description = "Celestial drop earrings with emerald sparkle and fine diamonds.",
            ImageUrl = "https://images.unsplash.com/photo-1514820720301-4c4790309f46?w=800&h=600&fit=crop&q=80",
            CategoryId = categoryMap.GetValueOrDefault("Earrings"),
            Views = 11200,
            Likes = 890,
            IsFeatured = true,
            CreatedAt = DateTime.UtcNow.AddDays(-16)
        },
        new Product
        {
            Name = "Royal Charm Bracelet",
            Designer = "Kabir Rao",
            StyleCode = "BR-ASM-220",
            ProductType = "Bracelet",
            Brand = "Asmi",
            GoldCarat = "18K",
            GoldWeight = 10.800m,
            DiamondCarat = 0.50m,
            DiamondQuality = "VS",
            StoneType = "Topaz",
            StoneCarat = 0.25m,
            Quantity = 9,
            MakingCharges = 7200m,
            MRP = 165000m,
            Description = "A royal charm bracelet crafted for grand celebrations.",
            ImageUrl = "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=800&h=600&fit=crop&q=80",
            CategoryId = categoryMap.GetValueOrDefault("Bracelets"),
            Views = 8500,
            Likes = 634,
            IsFeatured = false,
            CreatedAt = DateTime.UtcNow.AddDays(-15)
        },
        new Product
        {
            Name = "Majestic Heritage Bangle",
            Designer = "Nisha Verma",
            StyleCode = "BG-HR-519",
            ProductType = "Bangle",
            Brand = "Heritage",
            GoldCarat = "22K",
            GoldWeight = 22.750m,
            DiamondCarat = 0.40m,
            DiamondQuality = "VS",
            StoneType = null,
            StoneCarat = 0.00m,
            Quantity = 6,
            MakingCharges = 9800m,
            MRP = 355000m,
            Description = "Classic heritage bangle with detailed gold artistry.",
            ImageUrl = "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop&q=80",
            CategoryId = categoryMap.GetValueOrDefault("Bangles"),
            Views = 13800,
            Likes = 1023,
            IsFeatured = true,
            CreatedAt = DateTime.UtcNow.AddDays(-14)
        },
        new Product
        {
            Name = "Crown Pendant Set",
            Designer = "Dev Patel",
            StyleCode = "PD-DDM-314",
            ProductType = "Pendant",
            Brand = "Ddamas",
            GoldCarat = "18K",
            GoldWeight = 8.300m,
            DiamondCarat = 0.85m,
            DiamondQuality = "VVS",
            StoneType = "Pearl",
            StoneCarat = 0.30m,
            Quantity = 14,
            MakingCharges = 5400m,
            MRP = 142000m,
            Description = "Crown-inspired pendant set with pearl luster.",
            ImageUrl = "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&h=600&fit=crop&q=80",
            CategoryId = categoryMap.GetValueOrDefault("Pendants"),
            Views = 12400,
            Likes = 912,
            IsFeatured = false,
            CreatedAt = DateTime.UtcNow.AddDays(-12)
        },
        new Product
        {
            Name = "Bridal Radiance Set",
            Designer = "Riya Nair",
            StyleCode = "BRD-ASM-777",
            ProductType = "Bridal Set",
            Brand = "Asmi",
            GoldCarat = "22K",
            GoldWeight = 35.500m,
            DiamondCarat = 2.20m,
            DiamondQuality = "VVS",
            StoneType = "Ruby",
            StoneCarat = 0.60m,
            Quantity = 3,
            MakingCharges = 26000m,
            MRP = 925000m,
            Description = "A grand bridal set with masterful goldwork and ruby accents.",
            ImageUrl = "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=600&fit=crop&q=80",
            CategoryId = categoryMap.GetValueOrDefault("Bridal Sets"),
            Views = 9800,
            Likes = 756,
            IsFeatured = true,
            CreatedAt = DateTime.UtcNow.AddDays(-10)
        },
        new Product
        {
            Name = "Heritage Kundan Necklace",
            Designer = "Isha Gupta",
            StyleCode = "HN-HR-642",
            ProductType = "Necklace",
            Brand = "Heritage",
            GoldCarat = "22K",
            GoldWeight = 28.200m,
            DiamondCarat = 0.30m,
            DiamondQuality = "VS",
            StoneType = "Ruby",
            StoneCarat = 0.50m,
            Quantity = 4,
            MakingCharges = 15200m,
            MRP = 585000m,
            Description = "Traditional kundan necklace with royal aura.",
            ImageUrl = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop&q=80",
            CategoryId = categoryMap.GetValueOrDefault("Heritage"),
            Views = 11500,
            Likes = 801,
            IsFeatured = false,
            CreatedAt = DateTime.UtcNow.AddDays(-8)
        }
    };

    db.Products.AddRange(products);
    await db.SaveChangesAsync();
}

static async Task SeedStoriesAsync(ApplicationDbContext db)
{
    var stories = new List<Story>
    {
        new Story
        {
            Title = "How to Read a Diamond Certificate",
            Author = "Yash Gem Lab",
            Description = "Learn how to read certification details like cut, clarity, and carat to choose diamonds with confidence.",
            ImageUrl = "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&h=1200&fit=crop&q=80",
            Category = "Diamond Education",
            Views = 12500,
            Likes = 890,
            IsFeatured = true,
            CreatedAt = DateTime.UtcNow.AddDays(-30)
        },
        new Story
        {
            Title = "Gold Purity Guide: 18K vs 22K",
            Author = "Yash Design Studio",
            Description = "Understand how gold purity affects durability, color, and craftsmanship in fine jewelry.",
            ImageUrl = "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800&h=1200&fit=crop&q=80",
            Category = "Gold Knowledge",
            Views = 10200,
            Likes = 756,
            IsFeatured = true,
            CreatedAt = DateTime.UtcNow.AddDays(-28)
        },
        new Story
        {
            Title = "Gemstone Colors and Their Meaning",
            Author = "Heritage Curator",
            Description = "Discover the symbolism behind ruby, emerald, sapphire, and other precious stones.",
            ImageUrl = "https://images.unsplash.com/photo-1514820720301-4c4790309f46?w=800&h=1200&fit=crop&q=80",
            Category = "Gemstone Insights",
            Views = 9800,
            Likes = 634,
            IsFeatured = true,
            CreatedAt = DateTime.UtcNow.AddDays(-26)
        },
        new Story
        {
            Title = "Bridal Jewelry Checklist",
            Author = "Yash Bridal Atelier",
            Description = "Plan your bridal set with perfect balance of tradition, comfort, and timeless sparkle.",
            ImageUrl = "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=1200&fit=crop&q=80",
            Category = "Bridal",
            Views = 8500,
            Likes = 521,
            IsFeatured = false,
            CreatedAt = DateTime.UtcNow.AddDays(-25)
        },
        new Story
        {
            Title = "Caring for Diamond Jewelry",
            Author = "Yash Care Team",
            Description = "Simple, effective steps to preserve brilliance and protect your jewelry for years to come.",
            ImageUrl = "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&h=1200&fit=crop&q=80",
            Category = "Care Guide",
            Views = 7200,
            Likes = 489,
            IsFeatured = false,
            CreatedAt = DateTime.UtcNow.AddDays(-24)
        },
        new Story
        {
            Title = "Heritage Craftsmanship: The Yash Signature",
            Author = "Master Craftsmen",
            Description = "A closer look at the artistry, setting techniques, and finishing that define Yash creations.",
            ImageUrl = "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=1200&fit=crop&q=80",
            Category = "Craftsmanship",
            Views = 11200,
            Likes = 823,
            IsFeatured = true,
            CreatedAt = DateTime.UtcNow.AddDays(-23)
        }
    };

    db.Stories.AddRange(stories);
    await db.SaveChangesAsync();
}

app.Run();

