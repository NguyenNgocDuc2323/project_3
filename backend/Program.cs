using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Backend.Data;
using Backend.Models;
using Backend.Services;
using Microsoft.Extensions.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowVueApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sql => sql.EnableRetryOnFailure()
    ));

// JWT Authentication
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

app.UseHttpsRedirection();

app.UseCors("AllowVueApp");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

if (app.Environment.IsDevelopment())
{
    app.MapGet("/", () => Results.Redirect("/swagger")).ExcludeFromDescription();
}

// Auto-create database and seed data in development (simpler for student project)
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

    try
    {
        // Delete and recreate database to ensure correct structure (for student project only!)
        app.Logger.LogInformation("Resetting database for development...");
        db.Database.EnsureDeleted(); // Delete old database
        db.Database.EnsureCreated(); // Create new database with correct tables
        app.Logger.LogInformation("Database created successfully with tables: Users, RefreshTokens, Stories");

        // Auto-seed stories data
        if (!await db.Stories.AnyAsync())
        {
            app.Logger.LogInformation("Seeding stories data...");
            await SeedStoriesAsync(db);
            app.Logger.LogInformation("Stories seeded successfully!");
        }
    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "Failed to create database. Ensure SQL Server LocalDB is installed and accessible.");
        app.Logger.LogError("Error: {Message}", ex.Message);
    }
}

// Seed stories function
static async Task SeedStoriesAsync(ApplicationDbContext db)
{
    var stories = new List<Story>
    {
        new Story
        {
            Title = "Hành Trình Vĩ Đại",
            Author = "Nguyễn Văn A",
            Description = "Câu chuyện về một cuộc phiêu lưu kỳ diệu qua các vùng đất xa lạ, nơi những điều kỳ diệu đang chờ đợi. Một chuyến đi sẽ thay đổi cuộc đời mãi mãi.",
            ImageUrl = "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&h=1200&fit=crop&q=80",
            Category = "Phiêu lưu",
            Views = 12500,
            Likes = 890,
            IsFeatured = true,
            CreatedAt = DateTime.UtcNow.AddDays(-30)
        },
        new Story
        {
            Title = "Vương Quốc Bí Ẩn",
            Author = "Trần Thị B",
            Description = "Khám phá vương quốc cổ xưa với những bí mật được giấu kín qua hàng ngàn năm. Liệu bạn có đủ can đảm để khám phá?",
            ImageUrl = "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=1200&fit=crop&q=80",
            Category = "Huyền bí",
            Views = 10200,
            Likes = 756,
            IsFeatured = true,
            CreatedAt = DateTime.UtcNow.AddDays(-28)
        },
        new Story
        {
            Title = "Người Hùng Thầm Lặng",
            Author = "Lê Văn C",
            Description = "Câu chuyện cảm động về một người hùng không tên, người đã hy sinh tất cả vì người khác. Một bài học về lòng dũng cảm và sự hy sinh.",
            ImageUrl = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&h=1200&fit=crop&q=80",
            Category = "Drama",
            Views = 9800,
            Likes = 634,
            IsFeatured = true,
            CreatedAt = DateTime.UtcNow.AddDays(-26)
        },
        new Story
        {
            Title = "Giấc Mơ Xa Xôi",
            Author = "Phạm Thị D",
            Description = "Một giấc mơ đưa chúng ta đến những nơi xa xôi, nơi mọi điều đều có thể xảy ra. Đâu là ranh giới giữa giấc mơ và hiện thực?",
            ImageUrl = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&h=1200&fit=crop&q=80",
            Category = "Lãng mạn",
            Views = 8500,
            Likes = 521,
            IsFeatured = false,
            CreatedAt = DateTime.UtcNow.AddDays(-25)
        },
        new Story
        {
            Title = "Tình Yêu Vĩnh Cửu",
            Author = "Hoàng Văn E",
            Description = "Câu chuyện tình yêu vượt qua mọi thử thách của thời gian và không gian. Một tình yêu thật sự sẽ tồn tại mãi mãi.",
            ImageUrl = "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&h=1200&fit=crop&q=80",
            Category = "Lãng mạn",
            Views = 7200,
            Likes = 489,
            IsFeatured = false,
            CreatedAt = DateTime.UtcNow.AddDays(-24)
        },
        new Story
        {
            Title = "Thế Giới Ma Thuật",
            Author = "Vũ Thị F",
            Description = "Bước vào thế giới đầy phép thuật, nơi phù thủy và pháp sư cai trị. Một thế giới nơi mọi điều không thể đều trở thành có thể.",
            ImageUrl = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=1200&fit=crop&q=80",
            Category = "Fantasy",
            Views = 11200,
            Likes = 823,
            IsFeatured = true,
            CreatedAt = DateTime.UtcNow.AddDays(-23)
        },
        new Story
        {
            Title = "Cuộc Sống Mới",
            Author = "Đặng Văn G",
            Description = "Bắt đầu lại từ đầu, tìm kiếm ý nghĩa thực sự của cuộc sống. Đôi khi chúng ta cần quay lại để tiến về phía trước.",
            ImageUrl = "https://images.unsplash.com/photo-1521542464131-cb30f7a44e91?w=800&h=1200&fit=crop&q=80",
            Category = "Đời sống",
            Views = 6500,
            Likes = 412,
            IsFeatured = false,
            CreatedAt = DateTime.UtcNow.AddDays(-22)
        },
        new Story
        {
            Title = "Bí Mật Cổ Xưa",
            Author = "Bùi Thị H",
            Description = "Khám phá những bí mật được chôn giấu từ thời cổ đại. Mỗi bí mật đều ẩn chứa một sức mạnh không thể tưởng tượng.",
            ImageUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1200&fit=crop&q=80",
            Category = "Lịch sử",
            Views = 9300,
            Likes = 678,
            IsFeatured = false,
            CreatedAt = DateTime.UtcNow.AddDays(-21)
        },
        new Story
        {
            Title = "Hành Tinh Xanh",
            Author = "Nguyễn Minh K",
            Description = "Một cuộc phiêu lưu không gian đưa chúng ta đến một hành tinh xa xôi, nơi có những sinh vật kỳ lạ và những phát hiện đáng kinh ngạc.",
            ImageUrl = "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=1200&fit=crop&q=80",
            Category = "Khoa học viễn tưởng",
            Views = 15800,
            Likes = 1200,
            IsFeatured = true,
            CreatedAt = DateTime.UtcNow.AddDays(-20)
        },
        new Story
        {
            Title = "Cổng Vào Quá Khứ",
            Author = "Trần Đức L",
            Description = "Một cổng thời gian bí ẩn xuất hiện, cho phép con người du hành về quá khứ. Nhưng mỗi thay đổi đều có hậu quả khôn lường.",
            ImageUrl = "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=1200&fit=crop&q=80",
            Category = "Khoa học viễn tưởng",
            Views = 14200,
            Likes = 956,
            IsFeatured = true,
            CreatedAt = DateTime.UtcNow.AddDays(-19)
        },
        new Story
        {
            Title = "Trái Tim Thủy Tinh",
            Author = "Lê Thảo M",
            Description = "Câu chuyện tình yêu trong suốt như thủy tinh, dễ vỡ nhưng đẹp đẽ vô cùng. Một tình yêu thuần khiết sẽ mãi mãi tồn tại.",
            ImageUrl = "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=1200&fit=crop&q=80",
            Category = "Lãng mạn",
            Views = 8800,
            Likes = 645,
            IsFeatured = false,
            CreatedAt = DateTime.UtcNow.AddDays(-18)
        },
        new Story
        {
            Title = "Vùng Đất Bị Lãng Quên",
            Author = "Phạm Quang N",
            Description = "Khám phá một vùng đất cổ xưa đã bị lãng quên qua hàng thế kỷ. Những bí mật đang chờ đợi được khám phá.",
            ImageUrl = "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=1200&fit=crop&q=80",
            Category = "Phiêu lưu",
            Views = 11200,
            Likes = 789,
            IsFeatured = false,
            CreatedAt = DateTime.UtcNow.AddDays(-17)
        },
        new Story
        {
            Title = "Bóng Ma Trong Gương",
            Author = "Hoàng Lan O",
            Description = "Một tấm gương cổ xưa với bí mật đáng sợ. Ai nhìn vào sẽ thấy tương lai của chính mình, nhưng cái giá phải trả là gì?",
            ImageUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1200&fit=crop&q=80",
            Category = "Huyền bí",
            Views = 13400,
            Likes = 912,
            IsFeatured = true,
            CreatedAt = DateTime.UtcNow.AddDays(-16)
        },
        new Story
        {
            Title = "Những Ngôi Sao Lấp Lánh",
            Author = "Vũ Hải P",
            Description = "Một câu chuyện về những ước mơ và hy vọng dưới bầu trời đầy sao. Mỗi ngôi sao đều mang theo một điều ước.",
            ImageUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1200&fit=crop&q=80",
            Category = "Đời sống",
            Views = 7600,
            Likes = 534,
            IsFeatured = false,
            CreatedAt = DateTime.UtcNow.AddDays(-15)
        },
        new Story
        {
            Title = "Chiến Binh Bóng Đêm",
            Author = "Đặng Vũ Q",
            Description = "Một chiến binh với sức mạnh bóng tối phải đối mặt với những thử thách lớn nhất trong cuộc đời. Liệu ánh sáng có chiến thắng?",
            ImageUrl = "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&h=1200&fit=crop&q=80",
            Category = "Fantasy",
            Views = 16200,
            Likes = 1156,
            IsFeatured = true,
            CreatedAt = DateTime.UtcNow.AddDays(-14)
        },
        new Story
        {
            Title = "Hoa Nở Trong Tuyết",
            Author = "Bùi Mai R",
            Description = "Một câu chuyện tình yêu đẹp như hoa nở giữa mùa đông giá lạnh. Tình yêu thật sự sẽ vượt qua mọi khó khăn.",
            ImageUrl = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=1200&fit=crop&q=80",
            Category = "Lãng mạn",
            Views = 6900,
            Likes = 478,
            IsFeatured = false,
            CreatedAt = DateTime.UtcNow.AddDays(-13)
        },
        new Story
        {
            Title = "Cuộc Chiến Giữa Các Thế Giới",
            Author = "Nguyễn Hoàng S",
            Description = "Một cuộc chiến lớn giữa các thế giới song song đang bắt đầu. Số phận của nhiều thế giới nằm trong tay những anh hùng.",
            ImageUrl = "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=1200&fit=crop&q=80",
            Category = "Khoa học viễn tưởng",
            Views = 14500,
            Likes = 1023,
            IsFeatured = true,
            CreatedAt = DateTime.UtcNow.AddDays(-12)
        },
        new Story
        {
            Title = "Nữ Hoàng Rừng Xanh",
            Author = "Trần Linh T",
            Description = "Câu chuyện về một nữ hoàng bảo vệ khu rừng cổ tích. Sức mạnh của thiên nhiên và tình yêu với mẹ Trái Đất.",
            ImageUrl = "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&h=1200&fit=crop&q=80",
            Category = "Fantasy",
            Views = 10800,
            Likes = 745,
            IsFeatured = false,
            CreatedAt = DateTime.UtcNow.AddDays(-11)
        },
        new Story
        {
            Title = "Nhật Ký Mất Tích",
            Author = "Lê Anh U",
            Description = "Một cuốn nhật ký cổ với những trang giấy bị mất tích. Mỗi trang được tìm thấy sẽ tiết lộ một bí mật mới.",
            ImageUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1200&fit=crop&q=80",
            Category = "Huyền bí",
            Views = 9200,
            Likes = 623,
            IsFeatured = false,
            CreatedAt = DateTime.UtcNow.AddDays(-10)
        },
        new Story
        {
            Title = "Người Ngoài Hành Tinh",
            Author = "Phạm Đức V",
            Description = "Một chủng tộc người ngoài hành tinh đến Trái Đất với mục đích bí ẩn. Họ là bạn hay thù?",
            ImageUrl = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&h=1200&fit=crop&q=80",
            Category = "Khoa học viễn tưởng",
            Views = 12800,
            Likes = 887,
            IsFeatured = true,
            CreatedAt = DateTime.UtcNow.AddDays(-9)
        },
        new Story
        {
            Title = "Lâu Đài Trên Mây",
            Author = "Hoàng Thị X",
            Description = "Một lâu đài tuyệt đẹp nằm trên những đám mây. Chỉ những người có trái tim trong sáng mới có thể đến đó.",
            ImageUrl = "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&h=1200&fit=crop&q=80",
            Category = "Fantasy",
            Views = 8400,
            Likes = 567,
            IsFeatured = false,
            CreatedAt = DateTime.UtcNow.AddDays(-8)
        },
        new Story
        {
            Title = "Trái Tim Của Đại Dương",
            Author = "Vũ Minh Y",
            Description = "Sâu thẳm dưới đại dương có một kho báu bí ẩn. Những người mạo hiểm sẽ tìm thấy gì ở đó?",
            ImageUrl = "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=1200&fit=crop&q=80",
            Category = "Phiêu lưu",
            Views = 11500,
            Likes = 801,
            IsFeatured = false,
            CreatedAt = DateTime.UtcNow.AddDays(-7)
        },
        new Story
        {
            Title = "Bản Giao Hưởng Của Thời Gian",
            Author = "Đặng Quỳnh Z",
            Description = "Một bản nhạc cổ xưa có thể điều khiển dòng chảy của thời gian. Ai sở hữu nó sẽ có quyền lực vô song.",
            ImageUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1200&fit=crop&q=80",
            Category = "Huyền bí",
            Views = 13100,
            Likes = 934,
            IsFeatured = true,
            CreatedAt = DateTime.UtcNow.AddDays(-6)
        },
        new Story
        {
            Title = "Ngọn Lửa Vĩnh Cửu",
            Author = "Bùi Hồng AA",
            Description = "Một ngọn lửa không bao giờ tắt, chứa đựng sức mạnh của mặt trời. Nó sẽ trao cho ai có thể chạm vào nó.",
            ImageUrl = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=1200&fit=crop&q=80",
            Category = "Fantasy",
            Views = 9900,
            Likes = 712,
            IsFeatured = false,
            CreatedAt = DateTime.UtcNow.AddDays(-5)
        },
        new Story
        {
            Title = "Bức Thư Từ Quá Khứ",
            Author = "Nguyễn Lan BB",
            Description = "Một bức thư được gửi từ quá khứ xa xôi, chứa đựng những cảnh báo quan trọng cho tương lai. Liệu có ai tin vào nó?",
            ImageUrl = "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=1200&fit=crop&q=80",
            Category = "Lịch sử",
            Views = 8700,
            Likes = 589,
            IsFeatured = false,
            CreatedAt = DateTime.UtcNow.AddDays(-4)
        },
        new Story
        {
            Title = "Hành Tinh Tương Lai",
            Author = "Trần Hưng CC",
            Description = "Du hành đến một hành tinh ở tương lai xa, nơi công nghệ và con người đã hòa hợp thành một.",
            ImageUrl = "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=1200&fit=crop&q=80",
            Category = "Khoa học viễn tưởng",
            Views = 13800,
            Likes = 967,
            IsFeatured = true,
            CreatedAt = DateTime.UtcNow.AddDays(-3)
        },
        new Story
        {
            Title = "Tình Bạn Bất Diệt",
            Author = "Lê Mai DD",
            Description = "Câu chuyện về tình bạn vượt qua mọi ranh giới và thử thách. Một tình bạn sẽ mãi mãi tồn tại.",
            ImageUrl = "https://images.unsplash.com/photo-1521542464131-cb30f7a44e91?w=800&h=1200&fit=crop&q=80",
            Category = "Đời sống",
            Views = 7100,
            Likes = 445,
            IsFeatured = false,
            CreatedAt = DateTime.UtcNow.AddDays(-2)
        },
        new Story
        {
            Title = "Thành Phố Ma",
            Author = "Phạm Đông EE",
            Description = "Một thành phố bị ma ám, nơi những linh hồn lang thang tìm kiếm sự giải thoát. Ai dám bước vào?",
            ImageUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1200&fit=crop&q=80",
            Category = "Huyền bí",
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

