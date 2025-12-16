# Setup Database với VS Code SQL Server Extension

## Cài đặt Extension

1. Mở VS Code
2. Vào Extensions (Ctrl+Shift+X)
3. Tìm và cài đặt: **SQL Server (mssql)** hoặc **SQL Database Projects**

## Kết nối Database

### Cách 1: Sử dụng Command Palette

1. Nhấn `Ctrl+Shift+P` (hoặc `Cmd+Shift+P` trên Mac)
2. Gõ: `MS SQL: Connect`
3. Chọn server: `(localdb)\mssqllocaldb`
4. Chọn database: `BackendDb` (hoặc `master` để tạo mới)
5. Chọn authentication: `Integrated` (Windows Authentication)

### Cách 2: Sử dụng SQL Server Explorer

1. Mở SQL Server Explorer ở sidebar (biểu tượng database)
2. Click vào **Add Connection**
3. Điền thông tin:
   - Server: `(localdb)\mssqllocaldb`
   - Database: `BackendDb`
   - Authentication: `Integrated`

## Tạo Database

1. Kết nối đến `(localdb)\mssqllocaldb` với database `master`
2. Mở file `Database/CreateDatabase.sql`
3. Click chuột phải vào file → **Execute Query** hoặc nhấn `F5`
4. Database và table sẽ được tạo tự động

## Chạy Migration với Entity Framework

Sau khi tạo database bằng SQL script, bạn vẫn cần chạy migration để đồng bộ với Entity Framework:

```bash
cd backend
dotnet ef migrations add InitialCreate
dotnet ef database update
```

Hoặc nếu đã có migration, chỉ cần:

```bash
cd backend
dotnet ef database update
```

## Kiểm tra Database

1. Mở SQL Server Explorer
2. Expand connection `(localdb)\mssqllocaldb`
3. Expand database `BackendDb`
4. Expand `Tables`
5. Bạn sẽ thấy table `Examples`

## Connection String

Connection string trong `appsettings.json`:
```
Server=(localdb)\mssqllocaldb;Database=BackendDb;Trusted_Connection=True;MultipleActiveResultSets=true
```

