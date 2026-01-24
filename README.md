# Project 3 - React + .NET API

Dự án full stack với React frontend và .NET 8 Web API backend.

## Cấu trúc

```
Yash Gems & Jewelleries /
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

## Cấu hình AI Chat (Google Gemini)

Dự án sử dụng **Google Gemini API** (miễn phí) thay vì OpenAI để tránh phải thanh toán.

### Cách lấy Google Gemini API Key miễn phí:

1. Truy cập: https://aistudio.google.com/apikey
2. Đăng nhập bằng tài khoản Google của bạn
3. Click "Create API Key" → Chọn project hoặc tạo project mới
4. Copy API key được tạo

### Cấu hình API Key (Sử dụng file .env - Khuyến nghị):

1. Copy file `backend/.env.example` thành `backend/.env`:
   ```powershell
   cd backend
   copy .env.example .env
   ```

2. Mở file `backend/.env` và thêm API key của bạn:
   ```
   GOOGLE_GEMINI_API_KEY=your_api_key_here
   GOOGLE_GEMINI_MODEL=gemini-1.5-flash
   ```

**Lưu ý quan trọng:**
- File `.env` đã được thêm vào `.gitignore` nên **KHÔNG** bị push lên GitHub
- File `.env.example` là template, mọi người sẽ copy và thêm API key của riêng họ
- Google Gemini có free tier rộng rãi (60 requests/phút, 1,500 requests/ngày)
- Model `gemini-1.5-flash` là model miễn phí, nhanh và hiệu quả
- Nếu không có API key, hệ thống sẽ tự động dùng mock responses

## Cấu hình Email (Gmail SMTP)

Backend gửi email xác thực và reset mật khẩu qua Gmail SMTP.

### Cấu hình Email trong `.env`

Trong `backend/.env` thêm các biến sau (tham khảo `backend/.env.example`):
```
Email__SmtpHost=smtp.gmail.com
Email__SmtpPort=587
Email__SmtpUsername=your_email@gmail.com
Email__SmtpPassword=your_app_password
Email__FromEmail=care@yashgems.com
Email__FromName=Yash Gems
Email__ResetPasswordBaseUrl=http://localhost:3000
Email__VerifyEmailBaseUrl=http://localhost:5000/api/auth/verify-email
```

**Lưu ý quan trọng:**
- `Email__SmtpPassword` là App Password của Gmail (không dùng mật khẩu đăng nhập thường)
- `Email__ResetPasswordBaseUrl` trỏ về frontend để mở trang đặt lại mật khẩu
- `Email__VerifyEmailBaseUrl` trỏ về API endpoint xác thực email

## Cấu trúc Frontend

```
frontend/src/
├── common/          # File dùng chung (constants, utils, services, api)
├── components/      # Components
├── layouts/         # Layouts
└── views/          # Pages
```

