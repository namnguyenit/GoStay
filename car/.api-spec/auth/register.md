# API Specification: Đăng ký tài khoản (User Signup / Registration)

- **HTTP Method**: `POST`
- **Endpoint Gateway**: `/api/v1/auth/register`
- **Endpoint Backend**: `/api/users` (Identity Service - Port 8080)
- **Quyền truy cập (Role)**: Public (Không yêu cầu Token)
- **Mô tả**: Cho phép người dùng mới tạo tài khoản khách hàng (`USER`) trong hệ thống GoTravel.

---

## 📥 Request Headers

| Header | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `Content-Type` | `string` | **Có** | `application/json` |

---

## 📥 Request Body

| Field | Type | Required | Constraint | Description |
| :--- | :--- | :--- | :--- | :--- |
| `username` | `string` | **Có** | 3 - 50 ký tự | Tên đăng nhập duy nhất |
| `password` | `string` | **Có** | Tối thiểu 8 ký tự | Mật khẩu tài khoản |
| `email` | `string` | **Có** | Định dạng Email | Địa chỉ email liên hệ |
| `fullName` | `string` | **Có** | Không để trống | Họ và tên người dùng |
| `phoneNumber` | `string` | **Có** | 10 - 11 chữ số | Số điện thoại liên hệ |
| `dateOfBirth` | `string` | **Có** | Định dạng `YYYY-MM-DD` | Ngày tháng năm sinh |

### Mẫu Request Body JSON:
```json
{
  "username": "user123",
  "password": "Password123@",
  "email": "user123@example.com",
  "fullName": "Nguyễn Văn A",
  "phoneNumber": "0912345678",
  "dateOfBirth": "1998-05-20"
}
```

---

## 📤 Response

### 1. Thành công (HTTP 200 OK / 201 Created)
Tài khoản mới tạo mặc định gán vai trò (`roles`) là `USER`.

```json
{
  "success": true,
  "status": 200,
  "code": "USER_CREATED",
  "message": "Đăng ký tài khoản thành công",
  "data": {
    "id": "usr_123456789",
    "username": "user123",
    "email": "user123@example.com",
    "fullName": "Nguyễn Văn A",
    "phoneNumber": "0912345678",
    "dateOfBirth": "1998-05-20",
    "roles": ["USER"]
  }
}
```

### 2. Thất bại - Trùng Username hoặc Email (HTTP 409 Conflict / HTTP 400 Bad Request)
```json
{
  "success": false,
  "status": 409,
  "code": "USER_EXISTED",
  "message": "Tên đăng nhập hoặc Email đã tồn tại trong hệ thống."
}
```

### 3. Thất bại - Validation dữ liệu không hợp lệ (HTTP 400 Bad Request)
```json
{
  "success": false,
  "status": 400,
  "code": "INVALID_INPUT",
  "message": "Mật khẩu phải từ 8 ký tự trở lên"
}
```
