# Backend API - ASP.NET Core

## Yêu cầu
- .NET 8.0 SDK
- SQL Server (LocalDB hoặc SQL Server Express)

## Cài đặt

### 1. Cài đặt Entity Framework Tools
```bash
dotnet tool install --global dotnet-ef
```

### 2. Setup Database

Chạy migration để tạo database:
```bash
cd backend
dotnet ef database update
```

### 3. Chạy ứng dụng
```bash
cd backend
dotnet run
```

API sẽ chạy tại: `http://localhost:5000`
Swagger UI: `http://localhost:5000/swagger`

## Cấu hình Database

Connection string trong `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=BackendDb;Trusted_Connection=True;MultipleActiveResultSets=true"
  }
}
```

**Nếu dùng SQL Server thật**, sửa connection string:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=BackendDb;User Id=YOUR_USER;Password=YOUR_PASSWORD;TrustServerCertificate=True"
  }
}
```

## Cấu trúc dự án

- `Controllers/` - API Controllers
- `Services/` - Business logic
- `Models/` - Data models
- `Data/` - DbContext
