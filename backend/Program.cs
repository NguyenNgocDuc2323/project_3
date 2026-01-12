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

builder.Services.AddScoped<IAuthService, AuthService>();

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

static async Task SeedStoriesAsync(ApplicationDbContext db)
{
    var stories = new List<Story>
    {
        new Story
        {
            Title = "The Great Journey",
            Author = "John Smith",
            Description = "A story about a magical adventure through strange lands where wonders await. A journey that will change life forever.",
            ImageUrl = "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&h=1200&fit=crop&q=80",
            Category = "Adventure",
            Views = 12500,
            Likes = 890,
            IsFeatured = true,
            CreatedAt = DateTime.UtcNow.AddDays(-30)
        },
        new Story
        {
            Title = "The Hidden Kingdom",
            Author = "Sarah Johnson",
            Description = "Explore an ancient kingdom with secrets hidden for thousands of years. Do you have the courage to discover them?",
            ImageUrl = "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=1200&fit=crop&q=80",
            Category = "Mystery",
            Views = 10200,
            Likes = 756,
            IsFeatured = true,
            CreatedAt = DateTime.UtcNow.AddDays(-28)
        },
        new Story
        {
            Title = "The Silent Hero",
            Author = "Michael Brown",
            Description = "A touching story about a nameless hero who sacrificed everything for others. A lesson in courage and sacrifice.",
            ImageUrl = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&h=1200&fit=crop&q=80",
            Category = "Drama",
            Views = 9800,
            Likes = 634,
            IsFeatured = true,
            CreatedAt = DateTime.UtcNow.AddDays(-26)
        },
        new Story
        {
            Title = "Distant Dream",
            Author = "Emily Davis",
            Description = "A dream takes us to distant places where anything can happen. Where is the boundary between dream and reality?",
            ImageUrl = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&h=1200&fit=crop&q=80",
            Category = "Romance",
            Views = 8500,
            Likes = 521,
            IsFeatured = false,
            CreatedAt = DateTime.UtcNow.AddDays(-25)
        },
        new Story
        {
            Title = "Eternal Love",
            Author = "David Wilson",
            Description = "A love story that transcends all challenges of time and space. True love will last forever.",
            ImageUrl = "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&h=1200&fit=crop&q=80",
            Category = "Romance",
            Views = 7200,
            Likes = 489,
            IsFeatured = false,
            CreatedAt = DateTime.UtcNow.AddDays(-24)
        },
        new Story
        {
            Title = "The Magical World",
            Author = "Jessica Martinez",
            Description = "Step into a world full of magic, where wizards and sorcerers rule. A world where the impossible becomes possible.",
            ImageUrl = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=1200&fit=crop&q=80",
            Category = "Fantasy",
            Views = 11200,
            Likes = 823,
            IsFeatured = true,
            CreatedAt = DateTime.UtcNow.AddDays(-23)
        },
        new Story
        {
            Title = "New Life",
            Author = "Robert Taylor",
            Description = "Start over from the beginning, searching for the true meaning of life. Sometimes we need to go back to move forward.",
            ImageUrl = "https://images.unsplash.com/photo-1521542464131-cb30f7a44e91?w=800&h=1200&fit=crop&q=80",
            Category = "Life",
            Views = 6500,
            Likes = 412,
            IsFeatured = false,
            CreatedAt = DateTime.UtcNow.AddDays(-22)
        },
        new Story
        {
            Title = "Ancient Secrets",
            Author = "Lisa Anderson",
            Description = "Discover secrets buried since ancient times. Each secret holds unimaginable power.",
            ImageUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1200&fit=crop&q=80",
            Category = "History",
            Views = 9300,
            Likes = 678,
            IsFeatured = false,
            CreatedAt = DateTime.UtcNow.AddDays(-21)
        },
        new Story
        {
            Title = "The Blue Planet",
            Author = "James White",
            Description = "A space adventure takes us to a distant planet with strange creatures and amazing discoveries.",
            ImageUrl = "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=1200&fit=crop&q=80",
            Category = "Science Fiction",
            Views = 15800,
            Likes = 1200,
            IsFeatured = true,
            CreatedAt = DateTime.UtcNow.AddDays(-20)
        },
        new Story
        {
            Title = "Gateway to the Past",
            Author = "Patricia Harris",
            Description = "A mysterious time portal appears, allowing people to travel to the past. But every change has unforeseen consequences.",
            ImageUrl = "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=1200&fit=crop&q=80",
            Category = "Science Fiction",
            Views = 14200,
            Likes = 956,
            IsFeatured = true,
            CreatedAt = DateTime.UtcNow.AddDays(-19)
        },
        new Story
        {
            Title = "Glass Heart",
            Author = "Christopher Lee",
            Description = "A love story as transparent as glass, fragile but incredibly beautiful. Pure love will last forever.",
            ImageUrl = "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=1200&fit=crop&q=80",
            Category = "Romance",
            Views = 8800,
            Likes = 645,
            IsFeatured = false,
            CreatedAt = DateTime.UtcNow.AddDays(-18)
        },
        new Story
        {
            Title = "The Forgotten Land",
            Author = "Amanda Green",
            Description = "Explore an ancient land forgotten for centuries. Secrets await discovery.",
            ImageUrl = "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=1200&fit=crop&q=80",
            Category = "Adventure",
            Views = 11200,
            Likes = 789,
            IsFeatured = false,
            CreatedAt = DateTime.UtcNow.AddDays(-17)
        },
        new Story
        {
            Title = "Ghost in the Mirror",
            Author = "Daniel King",
            Description = "An ancient mirror with a terrifying secret. Those who look into it will see their future, but what is the price?",
            ImageUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1200&fit=crop&q=80",
            Category = "Mystery",
            Views = 13400,
            Likes = 912,
            IsFeatured = true,
            CreatedAt = DateTime.UtcNow.AddDays(-16)
        },
        new Story
        {
            Title = "Twinkling Stars",
            Author = "Michelle Scott",
            Description = "A story about dreams and hopes under a starry sky. Each star carries a wish.",
            ImageUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1200&fit=crop&q=80",
            Category = "Life",
            Views = 7600,
            Likes = 534,
            IsFeatured = false,
            CreatedAt = DateTime.UtcNow.AddDays(-15)
        },
        new Story
        {
            Title = "Warrior of the Night",
            Author = "Kevin Adams",
            Description = "A warrior with dark powers must face the greatest challenges of life. Will light prevail?",
            ImageUrl = "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&h=1200&fit=crop&q=80",
            Category = "Fantasy",
            Views = 16200,
            Likes = 1156,
            IsFeatured = true,
            CreatedAt = DateTime.UtcNow.AddDays(-14)
        },
        new Story
        {
            Title = "Flower in the Snow",
            Author = "Rachel Moore",
            Description = "A beautiful love story like a flower blooming in the cold winter. True love will overcome all difficulties.",
            ImageUrl = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=1200&fit=crop&q=80",
            Category = "Romance",
            Views = 6900,
            Likes = 478,
            IsFeatured = false,
            CreatedAt = DateTime.UtcNow.AddDays(-13)
        },
        new Story
        {
            Title = "War Between Worlds",
            Author = "Thomas Wright",
            Description = "A great war between parallel worlds is beginning. The fate of many worlds lies in the hands of heroes.",
            ImageUrl = "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=1200&fit=crop&q=80",
            Category = "Science Fiction",
            Views = 14500,
            Likes = 1023,
            IsFeatured = true,
            CreatedAt = DateTime.UtcNow.AddDays(-12)
        },
        new Story
        {
            Title = "Queen of the Green Forest",
            Author = "Jennifer Lewis",
            Description = "A story about a queen protecting the fairy forest. The power of nature and love for Mother Earth.",
            ImageUrl = "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&h=1200&fit=crop&q=80",
            Category = "Fantasy",
            Views = 10800,
            Likes = 745,
            IsFeatured = false,
            CreatedAt = DateTime.UtcNow.AddDays(-11)
        },
        new Story
        {
            Title = "The Missing Diary",
            Author = "Brian Clark",
            Description = "An ancient diary with missing pages. Each page found will reveal a new secret.",
            ImageUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1200&fit=crop&q=80",
            Category = "Mystery",
            Views = 9200,
            Likes = 623,
            IsFeatured = false,
            CreatedAt = DateTime.UtcNow.AddDays(-10)
        },
        new Story
        {
            Title = "The Aliens",
            Author = "Nicole Young",
            Description = "An alien race arrives on Earth with mysterious intentions. Are they friend or foe?",
            ImageUrl = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&h=1200&fit=crop&q=80",
            Category = "Science Fiction",
            Views = 12800,
            Likes = 887,
            IsFeatured = true,
            CreatedAt = DateTime.UtcNow.AddDays(-9)
        },
        new Story
        {
            Title = "Castle in the Clouds",
            Author = "Ryan Mitchell",
            Description = "A beautiful castle sits on the clouds. Only those with pure hearts can reach it.",
            ImageUrl = "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&h=1200&fit=crop&q=80",
            Category = "Fantasy",
            Views = 8400,
            Likes = 567,
            IsFeatured = false,
            CreatedAt = DateTime.UtcNow.AddDays(-8)
        },
        new Story
        {
            Title = "Heart of the Ocean",
            Author = "Stephanie Hall",
            Description = "Deep in the ocean lies a mysterious treasure. What will adventurers find there?",
            ImageUrl = "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=1200&fit=crop&q=80",
            Category = "Adventure",
            Views = 11500,
            Likes = 801,
            IsFeatured = false,
            CreatedAt = DateTime.UtcNow.AddDays(-7)
        },
        new Story
        {
            Title = "Symphony of Time",
            Author = "Andrew Baker",
            Description = "An ancient melody that can control the flow of time. Whoever possesses it will have unmatched power.",
            ImageUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1200&fit=crop&q=80",
            Category = "Mystery",
            Views = 13100,
            Likes = 934,
            IsFeatured = true,
            CreatedAt = DateTime.UtcNow.AddDays(-6)
        },
        new Story
        {
            Title = "The Eternal Flame",
            Author = "Laura Garcia",
            Description = "A flame that never dies, containing the power of the sun. It will grant power to whoever can touch it.",
            ImageUrl = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=1200&fit=crop&q=80",
            Category = "Fantasy",
            Views = 9900,
            Likes = 712,
            IsFeatured = false,
            CreatedAt = DateTime.UtcNow.AddDays(-5)
        },
        new Story
        {
            Title = "Letter from the Past",
            Author = "Mark Thompson",
            Description = "A letter sent from the distant past, containing important warnings for the future. Will anyone believe it?",
            ImageUrl = "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=1200&fit=crop&q=80",
            Category = "History",
            Views = 8700,
            Likes = 589,
            IsFeatured = false,
            CreatedAt = DateTime.UtcNow.AddDays(-4)
        },
        new Story
        {
            Title = "Planet of the Future",
            Author = "Sandra Walker",
            Description = "Travel to a planet in the distant future, where technology and humanity have merged into one.",
            ImageUrl = "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=1200&fit=crop&q=80",
            Category = "Science Fiction",
            Views = 13800,
            Likes = 967,
            IsFeatured = true,
            CreatedAt = DateTime.UtcNow.AddDays(-3)
        },
        new Story
        {
            Title = "Eternal Friendship",
            Author = "Paul Rodriguez",
            Description = "A story about friendship that transcends all boundaries and challenges. A friendship that will last forever.",
            ImageUrl = "https://images.unsplash.com/photo-1521542464131-cb30f7a44e91?w=800&h=1200&fit=crop&q=80",
            Category = "Life",
            Views = 7100,
            Likes = 445,
            IsFeatured = false,
            CreatedAt = DateTime.UtcNow.AddDays(-2)
        },
        new Story
        {
            Title = "Ghost City",
            Author = "Karen Foster",
            Description = "A haunted city where wandering souls seek liberation. Who dares to enter?",
            ImageUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1200&fit=crop&q=80",
            Category = "Mystery",
            Views = 12400,
            Likes = 856,
            IsFeatured = false,
            CreatedAt = DateTime.UtcNow.AddDays(-1)
        }
    };

    db.Stories.AddRange(stories);
    await db.SaveChangesAsync();
}

app.Run();

