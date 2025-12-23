# Project 3 - Full Stack Application

Dự án full stack với Vue 3 frontend và .NET 8 Web API backend.

## Cấu trúc dự án

```
Project 3/
├── frontend/          # Vue 3 Frontend Application
└── backend/           # .NET 8 Web API Backend
```

## Yêu cầu hệ thống

### Frontend
- Node.js 18+ và npm
- Vue 3
- Vite

### Backend
- .NET 8 SDK
- Visual Studio 2022 hoặc VS Code

## Cài đặt và chạy

### 🐳 Cách 1: Chạy với Docker (Khuyến nghị)

Xem hướng dẫn chi tiết trong [DOCKER.md](./DOCKER.md)

**Quick start:**

**Windows (PowerShell):**
```powershell
.\docker-start.ps1
```

**Linux/Mac:**
```bash
chmod +x docker-start.sh
./docker-start.sh
```

**Hoặc chạy trực tiếp:**
```bash
# Build và chạy tất cả services (MySQL + Backend + Frontend)
docker-compose up -d --build
```

**Hot Reload:**
- ✅ **Frontend**: Tự động reload khi sửa code trong `frontend/src/`
- ✅ **Backend**: Tự động rebuild và restart khi sửa code trong `backend/`
- ✅ Không cần rebuild container, chỉ cần sửa code là ăn ngay!

**Các lệnh thường dùng:**
```bash
# Xem logs tất cả services
docker-compose logs -f

# Xem logs một service cụ thể
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart một service (nếu cần)
docker-compose restart backend
docker-compose restart frontend

# Dừng services
docker-compose down

# Dừng và xóa dữ liệu
docker-compose down -v

# Rebuild một service cụ thể
docker-compose up -d --build backend
docker-compose up -d --build frontend
```

Sau khi chạy (đợi 30-60 giây để containers khởi động):
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Swagger UI**: http://localhost:5000/swagger (để xem và test API)

📖 **Hướng dẫn sử dụng Swagger**: Xem [SWAGGER-GUIDE.md](./SWAGGER-GUIDE.md)

**Lưu ý:** Backend tự động chạy khi container khởi động. Swagger chỉ là công cụ để xem và test API, không phải để "chạy" backend.

**Kiểm tra backend đã chạy:**
```powershell
# Xem trạng thái containers
docker-compose ps

# Xem logs backend
docker-compose logs -f backend

# Test API (mở trình duyệt)
# Swagger UI: http://localhost:5000/swagger
# Hoặc test API endpoint:
curl http://localhost:5000/api/story
```

### 💻 Cách 2: Chạy thủ công (Development)

#### Backend

1. Di chuyển vào thư mục backend:
```bash
cd backend
```

2. Restore packages (nếu cần):
```bash
dotnet restore
```

3. Chạy ứng dụng:
```bash
dotnet run
```

Backend sẽ chạy tại: **http://localhost:5000**  
Swagger UI: **http://localhost:5000/swagger**

**Lưu ý:** Cần có MySQL đang chạy. Có thể dùng Docker:
```bash
docker-compose up -d mysql
```

#### Frontend

1. Di chuyển vào thư mục frontend:
```bash
cd frontend
```

2. Cài đặt dependencies (lần đầu tiên):
```bash
npm install
```

3. Chạy development server:
```bash
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:3000**
**Lưu ý:** Nếu port 3000 đã bị sử dụng, Vite sẽ tự động chọn port khác (5173, 5174, ...). Kiểm tra console để xem port chính xác.

**Lưu ý:** Cần chạy backend trước, sau đó mới chạy frontend để frontend có thể gọi API.

## Tính năng

- ✅ Vue 3 với Composition API
- ✅ Vue Router cho routing
- ✅ Axios cho HTTP requests với Refresh Token tự động
- ✅ .NET 8 Web API
- ✅ Swagger/OpenAPI documentation
- ✅ CORS configuration
- ✅ JWT Authentication với Refresh Token
- ✅ Entity Framework Core với MySQL
- ✅ Docker & Docker Compose support
- ✅ MySQL Database

## Development

### Frontend Development
- Hot module replacement (HMR) đã được cấu hình
- Proxy API requests đến backend

### Backend Development
- Swagger UI cho API testing
- CORS đã được cấu hình cho frontend

## Build cho Production

### Frontend
```bash
cd frontend
npm run build
```

Output sẽ ở thư mục `frontend/dist`

### Backend

**Cách 1: Publish từ thư mục backend**
```bash
cd backend
dotnet publish -c Release
```

**Cách 2: Publish từ thư mục gốc**
```bash
dotnet publish -c Release --project backend/Backend.csproj
```

**Publish với output folder cụ thể:**
```bash
cd backend
dotnet publish -c Release -o ./publish
```

**Publish self-contained (bao gồm .NET runtime):**
```bash
cd backend
dotnet publish -c Release -o ./publish --self-contained true -r win-x64
```

Output sẽ ở thư mục `backend/bin/Release/net8.0/publish` hoặc thư mục bạn chỉ định

## Tác giả

Dự án học tập - Trường học

