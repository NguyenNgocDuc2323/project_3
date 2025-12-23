# 🚀 Quick Start Guide

Hướng dẫn nhanh để chạy dự án với Docker.

## Bước 1: Khởi động Docker

**Windows (PowerShell):**
```powershell
.\docker-start.bat
```

**Hoặc chạy trực tiếp:**
```powershell
docker-compose up -d --build
```

## Bước 2: Đợi containers khởi động

Đợi **30-60 giây** để:
- MySQL khởi động và tạo database
- Backend kết nối MySQL và chạy migrations
- Frontend build và khởi động

## Bước 3: Kiểm tra services đã sẵn sàng

```powershell
# Xem trạng thái
docker-compose ps

# Xem logs backend (tìm dòng "Now listening on")
docker-compose logs backend

# Xem logs MySQL (tìm dòng "ready for connections")
docker-compose logs mysql
```

## Bước 4: Truy cập ứng dụng

Sau khi thấy logs "Now listening on" và "ready for connections":

- ✅ **Frontend**: http://localhost:3000
- ✅ **Backend API**: http://localhost:5000
- ✅ **Swagger UI**: http://localhost:5000/swagger

## ⚠️ Lưu ý quan trọng

### Backend tự động chạy!

- Backend **tự động chạy** khi container khởi động
- **KHÔNG CẦN** truy cập Swagger để "chạy" backend
- Swagger chỉ là công cụ để **xem và test API**

### URL Swagger đúng:

- ✅ **Đúng**: http://localhost:5000/swagger
- ❌ **Sai**: http://localhost:5000/swagger/index.html

### Nếu không truy cập được:

1. **Kiểm tra containers:**
```powershell
docker-compose ps
```

2. **Xem logs để tìm lỗi:**
```powershell
docker-compose logs -f backend
docker-compose logs -f mysql
```

3. **Restart nếu cần:**
```powershell
docker-compose restart backend
```

## Các lệnh thường dùng

```powershell
# Xem logs tất cả services
docker-compose logs -f

# Xem logs một service
docker-compose logs -f backend

# Dừng services
docker-compose down

# Dừng và xóa dữ liệu
docker-compose down -v

# Rebuild containers
docker-compose up -d --build
```

## Troubleshooting

### Backend không chạy?

1. Kiểm tra MySQL đã sẵn sàng:
```powershell
docker-compose logs mysql | Select-String "ready for connections"
```

2. Kiểm tra backend logs:
```powershell
docker-compose logs backend | Select-String "Now listening"
```

3. Restart backend:
```powershell
docker-compose restart backend
```

### Port đã được sử dụng?

Sửa port trong `docker-compose.yml`:
```yaml
ports:
  - "5001:5000"  # Thay 5000 thành 5001
```

### Database connection error?

Kiểm tra MySQL container:
```powershell
docker-compose ps mysql
docker-compose logs mysql
```

Đợi MySQL khởi động hoàn toàn (30-60 giây) rồi restart backend.

