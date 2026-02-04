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

## Cấu hình Thanh toán Online

Dự án tích hợp các cổng thanh toán phổ biến tại Việt Nam (VNPAY, ZaloPay) và Chuyển khoản ngân hàng (VietQR).

### 1. Cấu hình VNPAY (Sandbox)

1. Đăng ký tài khoản test tại: [VNPAY Sandbox Register](https://sandbox.vnpayment.vn/devreg/)
2. Lấy `vnp_TmnCode` và `vnp_HashSecret` từ email VNPAY gửi.
3. Cấu hình trong `backend/.env`:
   ```
   Vnpay__TmnCode=YOUR_TMN_CODE
   Vnpay__HashSecret=YOUR_HASH_SECRET
   Vnpay__BaseUrl=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
   Vnpay__ReturnUrl=http://localhost:3000/checkout/payment-callback
   ```
4. **Thẻ test NCB:**
   - Số thẻ: `9704198526191432198`
   - Tên chủ thẻ: `NGUYEN VAN A`
   - Ngày phát hành: `07/15`
   - OTP: `123456`

### 2. Cấu hình ZaloPay (Sandbox)

Sử dụng bộ mã test mặc định của ZaloPay trong `backend/.env`:
```
ZaloPay__AppId=2553
ZaloPay__Key1=9ph319p987679393p622p7rr6f6p9113
ZaloPay__Key2=Iyz2p763th0p939393p622p7rr6f6p9113
ZaloPay__BaseUrl=https://sb-openapi.zalopay.vn/v2/create
ZaloPay__RedirectUrl=http://localhost:3000/checkout/payment-callback
```

### 3. Chuyển khoản VietQR

Hệ thống tự động tạo mã VietQR dựa trên số tài khoản cấu hình. Hiện tại đang sử dụng demo VietQR.io.

## Cấu trúc Frontend

```
frontend/src/
├── common/          # File dùng chung (constants, utils, services, api)
├── components/      # Components
├── layouts/         # Layouts
└── views/          # Pages
```

