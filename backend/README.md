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

**Cách 1: Sử dụng VS Code SQL Server Extension (Khuyến nghị)**

1. Cài đặt extension **SQL Server (mssql)** trong VS Code
2. Nhấn `Ctrl+Shift+P` → Gõ `MS SQL: Connect`
3. Chọn server: `(localdb)\mssqllocaldb`
4. Chọn database: `master`
5. Mở file `Database/CreateDatabase.sql` và chạy (F5)
6. Sau đó chạy migration:
```bash
cd backend
dotnet ef migrations add InitialCreate
dotnet ef database update
```

**Cách 2: Chạy thủ công với Entity Framework**
```bash
cd backend
dotnet ef migrations add InitialCreate
dotnet ef database update
```

Xem chi tiết trong file `Database/README.md`

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
- `Repositories/` - Data access layer
- `Models/` - Data models
- `Data/` - DbContext

## Sử dụng Repository Pattern

Tất cả service có thể inject `IRepository<T>` để làm việc với database:

```csharp
public class MyService
{
    private readonly IRepository<MyModel> _repository;
    
    public MyService(IRepository<MyModel> repository)
    {
        _repository = repository;
    }
    
    public async Task<MyModel> CreateAsync(MyModel model)
    {
        return await _repository.CreateAsync(model);
    }
}
```
