# 📖 Hướng dẫn sử dụng Swagger để Test API

Swagger UI là công cụ để xem và test API một cách trực quan.

## Truy cập Swagger

Sau khi backend đã chạy, truy cập:
- **URL**: http://localhost:5000/swagger

## Cách sử dụng Swagger

### 1. Test API không cần Authentication

Các API công khai (như `/api/Auth/login`, `/api/Auth/register`) có thể test trực tiếp:

1. Mở endpoint trong Swagger UI
2. Click **"Try it out"**
3. Nhập dữ liệu vào Request body
4. Click **"Execute"**
5. Xem kết quả ở phần **"Responses"**

### 2. Test API cần Authentication (JWT Token)

Các API được bảo vệ (như `/api/Story`, `/api/Category`) cần JWT token:

#### Bước 1: Đăng nhập để lấy token

1. Tìm endpoint `/api/Auth/login`
2. Click **"Try it out"**
3. Nhập thông tin đăng nhập:
```json
{
  "username": "admin",
  "password": "1"
}
```
4. Click **"Execute"**
5. Copy `accessToken` từ response

#### Bước 2: Thêm token vào Swagger

1. Click nút **"Authorize"** ở góc trên bên phải Swagger UI
2. Trong popup, nhập: `Bearer <your-token>`
   - Ví dụ: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. Click **"Authorize"**
4. Click **"Close"**

#### Bước 3: Test API được bảo vệ

Bây giờ bạn có thể test các API cần authentication:
- `/api/Story` - Quản lý stories
- `/api/Category` - Quản lý categories
- `/api/Auth/refresh` - Refresh token
- Và các API khác...

Token sẽ tự động được gửi kèm trong header `Authorization: Bearer <token>`

### 3. Refresh Token

Khi token hết hạn (sau 15 phút), bạn cần refresh:

1. Tìm endpoint `/api/Auth/refresh`
2. Click **"Try it out"**
3. Click **"Execute"** (không cần body vì refresh token được lưu trong cookie)
4. Copy `accessToken` mới
5. Click **"Authorize"** lại và cập nhật token mới

## Các endpoint chính

### Authentication (`/api/Auth`)

- **POST `/api/Auth/login`** - Đăng nhập
  - Body: `{ "username": "admin", "password": "1" }`
  - Response: `{ "accessToken": "...", "refreshToken": "...", "user": {...} }`

- **POST `/api/Auth/register`** - Đăng ký
  - Body: `{ "username": "...", "email": "...", "password": "...", "fullName": "..." }`

- **POST `/api/Auth/refresh`** - Refresh token
  - Không cần body (dùng refresh token từ cookie)

- **POST `/api/Auth/revoke`** - Revoke token
  - Body: `{ "refreshToken": "..." }`

### Stories (`/api/Story`) - Cần Authentication

- **GET `/api/Story`** - Lấy danh sách stories
- **GET `/api/Story/{id}`** - Lấy story theo ID
- **POST `/api/Story`** - Tạo story mới
- **PUT `/api/Story/{id}`** - Cập nhật story
- **DELETE `/api/Story/{id}`** - Xóa story

### Categories (`/api/Category`) - Cần Authentication

- **GET `/api/Category`** - Lấy danh sách categories
- **POST `/api/Category`** - Tạo category mới
- **PUT `/api/Category/{id}`** - Cập nhật category
- **DELETE `/api/Category/{id}`** - Xóa category

## Tips

### 1. Lưu token để dùng lại

Sau khi authorize, token được lưu trong session Swagger. Bạn không cần nhập lại cho đến khi:
- Refresh trang
- Token hết hạn
- Click **"Logout"** trong popup Authorize

### 2. Xem Schema

Click vào model trong Swagger để xem cấu trúc dữ liệu:
- `LoginRequest` - Dữ liệu đăng nhập
- `AuthResponse` - Response sau khi đăng nhập
- `Story` - Model của Story
- `Category` - Model của Category

### 3. Test với dữ liệu mẫu

Swagger tự động tạo dữ liệu mẫu. Bạn có thể:
- Sửa dữ liệu mẫu
- Xem ví dụ request/response
- Copy curl command để test bằng terminal

### 4. Xem Response Codes

Mỗi endpoint hiển thị các response codes có thể:
- `200 OK` - Thành công
- `400 Bad Request` - Dữ liệu không hợp lệ
- `401 Unauthorized` - Chưa đăng nhập hoặc token hết hạn
- `403 Forbidden` - Không có quyền
- `404 Not Found` - Không tìm thấy
- `500 Internal Server Error` - Lỗi server

## Troubleshooting

### Không thấy nút "Authorize"?

- Đảm bảo backend đã chạy và Swagger đã load
- Refresh trang http://localhost:5000/swagger
- Kiểm tra console browser có lỗi không

### Token không hoạt động?

1. Kiểm tra token còn hạn không (token hết hạn sau 15 phút)
2. Đảm bảo đã nhập đúng format: `Bearer <token>` (có chữ "Bearer" và space)
3. Thử đăng nhập lại để lấy token mới

### API trả về 401 Unauthorized?

1. Kiểm tra đã click "Authorize" và nhập token chưa
2. Kiểm tra token còn hạn không
3. Thử refresh token hoặc đăng nhập lại

### Không thấy endpoint nào?

- Kiểm tra backend đã chạy chưa: `docker-compose ps`
- Xem logs backend: `docker-compose logs backend`
- Đảm bảo đang ở môi trường Development (Swagger chỉ hiện trong Development)

## Ví dụ Test Flow hoàn chỉnh

1. **Mở Swagger**: http://localhost:5000/swagger

2. **Đăng nhập**:
   - POST `/api/Auth/login`
   - Body: `{ "username": "admin", "password": "1" }`
   - Copy `accessToken`

3. **Authorize**:
   - Click "Authorize"
   - Nhập: `Bearer <accessToken>`
   - Click "Authorize" và "Close"

4. **Test API**:
   - GET `/api/Story` - Xem danh sách stories
   - POST `/api/Story` - Tạo story mới
   - GET `/api/Category` - Xem categories

5. **Refresh token khi hết hạn**:
   - POST `/api/Auth/refresh`
   - Copy token mới
   - Authorize lại với token mới

Chúc bạn test API thành công! 🎉

