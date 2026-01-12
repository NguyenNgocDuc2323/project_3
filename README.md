# Project 3 - React + .NET API

Dự án full stack với React frontend và .NET 8 Web API backend.

## Cấu trúc

```
project_3/
├── frontend/     # React + Vite
└── backend/      # .NET 8 Web API
```

## Yêu cầu

- Node.js 18+
- .NET 8 SDK
- MySQL (Laragon)

## Chạy Project

### 1. Setup Database

Import file `backend/database.sql` vào MySQL qua Laragon hoặc phpMyAdmin.

### 2. Chạy Backend

```powershell
cd backend
dotnet run
```

Backend chạy tại: `http://localhost:5000`
Swagger: `http://localhost:5000/swagger`

### 3. Chạy Frontend

Mở terminal mới:

```powershell
cd frontend
npm install
npm run dev
```

Frontend chạy tại: `http://localhost:3000`

## Cấu trúc Frontend

```
frontend/src/
├── common/          # File dùng chung (constants, utils, services, api)
├── components/      # Components
├── layouts/         # Layouts
└── views/          # Pages
```

