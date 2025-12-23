# Docker Setup Guide

Hướng dẫn chạy dự án với Docker và Docker Compose.

## Yêu cầu

- Docker Desktop (Windows/Mac) hoặc Docker Engine + Docker Compose (Linux)
- Docker version 20.10+
- Docker Compose version 2.0+

## Cấu trúc Docker

Dự án sử dụng Docker Compose với 3 services:
- **MySQL 8.0**: Database server
- **Backend**: .NET 8 Web API
- **Frontend**: Vue 3 với Nginx

## Cách sử dụng

### 1. Chạy tất cả services

```bash
docker-compose up -d --build
```

Lệnh này sẽ:
- Build và chạy MySQL container
- Build và chạy Backend container
- Build và chạy Frontend container
- Tự động chạy database migrations
- Seed dữ liệu mẫu

### 2. Xem logs

```bash
# Xem logs tất cả services
docker-compose logs -f

# Xem logs một service cụ thể
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

### 3. Dừng services

```bash
# Dừng nhưng giữ containers
docker-compose stop

# Dừng và xóa containers
docker-compose down

# Dừng và xóa containers + volumes (xóa database)
docker-compose down -v
```

### 4. Rebuild containers

```bash
# Rebuild khi có thay đổi code
docker-compose up -d --build

# Rebuild một service cụ thể
docker-compose up -d --build backend
```

## Truy cập ứng dụng

Sau khi chạy `docker-compose up -d`, đợi 30-60 giây để tất cả containers khởi động hoàn toàn:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Swagger UI**: http://localhost:5000/swagger (để xem và test API)
- **MySQL**: localhost:3306
  - Username: `appuser`
  - Password: `apppassword`
  - Database: `project_3`
  - Root password: `rootpassword`

### ⚠️ Lưu ý quan trọng:

1. **Backend tự động chạy** khi container khởi động - không cần truy cập Swagger để "chạy" backend
2. **Swagger chỉ là công cụ** để xem documentation và test API
3. **Đợi 30-60 giây** sau khi chạy `docker-compose up -d` để MySQL và Backend khởi động hoàn toàn

### Kiểm tra backend đã sẵn sàng:

```bash
# Kiểm tra containers đang chạy
docker-compose ps

# Xem logs backend (sẽ thấy "Now listening on: http://[::]:5000")
docker-compose logs backend

# Test API bằng curl
curl http://localhost:5000/swagger/v1/swagger.json

# Hoặc mở trình duyệt
# http://localhost:5000/swagger
```

## Database

### Kết nối từ bên ngoài Docker

```bash
mysql -h localhost -P 3306 -u appuser -papppassword project_3
```

### Kết nối từ container

```bash
docker-compose exec mysql mysql -u appuser -papppassword project_3
```

### Backup database

```bash
docker-compose exec mysql mysqldump -u appuser -papppassword project_3 > backup.sql
```

### Restore database

```bash
docker-compose exec -T mysql mysql -u appuser -papppassword project_3 < backup.sql
```

## Environment Variables

Các biến môi trường có thể được cấu hình trong `docker-compose.yml`:

### Backend
- `ASPNETCORE_ENVIRONMENT`: Development/Production
- `ConnectionStrings__DefaultConnection`: MySQL connection string
- `Jwt__Key`: JWT secret key
- `Jwt__Issuer`: JWT issuer
- `Jwt__Audience`: JWT audience

### MySQL
- `MYSQL_ROOT_PASSWORD`: Root password
- `MYSQL_DATABASE`: Database name
- `MYSQL_USER`: Database user
- `MYSQL_PASSWORD`: Database password

## Troubleshooting

### 0. Backend không chạy / Không truy cập được Swagger

**Vấn đề:** Truy cập http://localhost:5000/swagger nhưng không thấy gì hoặc lỗi.

**Giải pháp:**

1. **Kiểm tra container đã chạy chưa:**
```bash
docker-compose ps
```
Phải thấy `project3_backend` có status là `Up` hoặc `Up (healthy)`

2. **Xem logs backend:**
```bash
docker-compose logs backend
```
Tìm dòng `Now listening on: http://[::]:5000` - đây là dấu hiệu backend đã sẵn sàng.

3. **Đợi MySQL khởi động:**
Backend cần MySQL sẵn sàng trước. Kiểm tra:
```bash
docker-compose logs mysql
```
Tìm dòng `ready for connections` - MySQL đã sẵn sàng.

4. **Restart backend nếu cần:**
```bash
docker-compose restart backend
```

5. **Kiểm tra URL đúng:**
- ✅ Đúng: http://localhost:5000/swagger
- ❌ Sai: http://localhost:5000/swagger/index.html (không cần `/index.html`)

### 1. Port đã được sử dụng

Nếu port 3000, 5000, hoặc 3306 đã được sử dụng, sửa trong `docker-compose.yml`:

```yaml
ports:
  - "3001:80"  # Thay 3000 thành 3001
```

### 2. Backend không kết nối được MySQL

Kiểm tra MySQL đã sẵn sàng:
```bash
docker-compose ps
docker-compose logs mysql
```

Đợi MySQL khởi động hoàn toàn (có thể mất 30-60 giây).

### 3. Database migrations không chạy

Chạy migrations thủ công:
```bash
docker-compose exec backend dotnet ef database update
```

### 4. Xóa và tạo lại database

```bash
docker-compose down -v
docker-compose up -d
```

### 5. Xem logs chi tiết

```bash
docker-compose logs --tail=100 -f backend
```

## Chạy local (không dùng Docker)

Nếu muốn chạy backend/frontend local mà chỉ dùng MySQL từ Docker:

```bash
# Chỉ chạy MySQL
docker-compose up -d mysql

# Chạy backend local
cd backend
dotnet run

# Chạy frontend local (terminal khác)
cd frontend
npm run dev
```

Cập nhật connection string trong `appsettings.json`:
```json
"DefaultConnection": "Server=localhost;Port=3306;Database=project_3;User ID=appuser;Password=apppassword;CharSet=utf8mb4;SslMode=None;"
```

## Production Deployment

Để deploy production:

1. Cập nhật environment variables trong `docker-compose.yml`
2. Set `ASPNETCORE_ENVIRONMENT=Production`
3. Sử dụng secrets cho passwords
4. Cấu hình SSL/TLS
5. Sử dụng reverse proxy (Nginx/Traefik)

```bash
docker-compose -f docker-compose.yml up -d --build
```

## Volumes

Dữ liệu MySQL được lưu trong Docker volume `mysql_data`. Để xóa:

```bash
docker volume rm project_3_mysql_data
```

## Cleanup

Xóa tất cả containers, networks, và volumes:

```bash
docker-compose down -v --remove-orphans
docker system prune -a
```

