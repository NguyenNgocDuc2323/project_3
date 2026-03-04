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

## Cấu hình (backend/appsettings.json)

Mọi cấu hình backend nằm trong **`backend/appsettings.json`**:

| Section | Mục đích |
|--------|----------|
| `Environment` | `Development` hoặc `Production` (cookie Secure/SameSite) |
| `ConnectionStrings` | Chuỗi kết nối MySQL |
| `Jwt` | Key, Issuer, Audience, thời hạn token |
| `Email` | SMTP Gmail (xác thực, reset mật khẩu) |
| `GoogleGemini` | ApiKey, Model (chat AI) |
| `Vnpay` | TmnCode, HashSecret, BaseUrl, ReturnUrl |
| `BankTransfer` | QrUrlTemplate (VietQR) |

## Cấu hình AI Chat (Google Gemini)

Dự án sử dụng **Google Gemini API** (miễn phí) thay vì OpenAI để tránh phải thanh toán.

### Cách lấy Google Gemini API Key miễn phí:

1. Truy cập: https://aistudio.google.com/apikey
2. Đăng nhập bằng tài khoản Google của bạn
3. Click "Create API Key" → Chọn project hoặc tạo project mới
4. Copy API key được tạo

### Cấu hình API Key trong `backend/appsettings.json`

Mở `backend/appsettings.json`, tìm section `GoogleGemini` và điền:

- `ApiKey`: API key lấy từ https://aistudio.google.com/apikey
- `Model`: giữ `gemini-1.5-flash` (miễn phí)

**Lưu ý:** Google Gemini có free tier rộng rãi. Nếu không điền ApiKey, chat sẽ dùng mock responses.

## Cấu hình Email (Gmail SMTP)

Backend gửi email xác thực và reset mật khẩu qua Gmail SMTP.

### Cấu hình Email trong `backend/appsettings.json`

Mở `backend/appsettings.json`, tìm section `Email` và điền:

| Key | Ví dụ / Ghi chú |
|-----|------------------|
| `SmtpHost` | `smtp.gmail.com` |
| `SmtpPort` | `587` |
| `SmtpUsername` | email Gmail của bạn |
| `SmtpPassword` | App Password của Gmail (không dùng mật khẩu đăng nhập thường) |
| `FromEmail` | email hiển thị người gửi |
| `FromName` | tên hiển thị (vd. Yash Gems) |
| `ResetPasswordBaseUrl` | URL frontend (vd. `http://localhost:3000`) |
| `VerifyEmailBaseUrl` | `http://localhost:5000/api/auth/verify-email` |

## Cấu hình Thanh toán Online

Dự án tích hợp VNPAY và Chuyển khoản ngân hàng (VietQR).

### 1. Cấu hình VNPAY (Sandbox)

**Chỉ cần sửa trong `backend/appsettings.json`**, section `Vnpay`:

| Key | Ý nghĩa |
|-----|--------|
| `TmnCode` | Mã website (lấy từ [VNPAY sandbox](https://sandbox.vnpayment.vn/devreg/) / email sau khi đăng ký) |
| `HashSecret` | Chuỗi bí mật (cùng nguồn) |
| `BaseUrl` | Giữ `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html` cho sandbox |
| `ReturnUrl` | URL frontend nhận callback (vd. `http://localhost:3000/checkout/payment-callback`) |

Dự án đã có sẵn giá trị mẫu trong `appsettings.json`; chỉ cần thay `TmnCode` và `HashSecret` nếu dùng tài khoản VNPay của bạn.

**Thẻ test NCB:**
- Số thẻ: `9704198526191432198`
- Tên chủ thẻ: `NGUYEN VAN A`
- Ngày phát hành: `07/15`
- OTP: `123456`

### 2. Chuyển khoản VietQR

Hệ thống tự động tạo mã VietQR dựa trên số tài khoản cấu hình. Hiện tại đang sử dụng demo VietQR.io.

## Cấu trúc Frontend

```
frontend/src/
├── common/          # File dùng chung (constants, utils, services, api)
├── components/      # Components
├── layouts/         # Layouts
└── views/          # Pages
```

