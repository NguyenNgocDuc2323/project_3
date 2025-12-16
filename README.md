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

### Backend

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

### Frontend

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

**Lưu ý:** Cần chạy backend trước, sau đó mới chạy frontend để frontend có thể gọi API.

## Tính năng

- ✅ Vue 3 với Composition API
- ✅ Vue Router cho routing
- ✅ Pinia cho state management
- ✅ Axios cho HTTP requests
- ✅ .NET 8 Web API
- ✅ Swagger/OpenAPI documentation
- ✅ CORS configuration
- ✅ Service layer pattern
- ✅ Repository pattern ready (có thể mở rộng)

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

