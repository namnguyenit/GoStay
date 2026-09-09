# API Specification: Đăng nhập (Authentication Login)

- **HTTP Method**: `POST`
- **Endpoint Gateway**: `/api/v1/auth/login`
- **Endpoint Backend**: `/api/auth/login` (Identity Service - Port 8080)
- **Quyền truy cập (Role)**: Public (Không yêu cầu Token)
- **Mô tả**: Xác thực tài khoản người dùng bằng `username` và `password`. Khi đăng nhập thành công, hệ thống sẽ cấp JWT Token để truy cập các tài nguyên hệ thống.

---

## 📥 Request Headers

| Header | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `Content-Type` | `string` | **Có** | `application/json` |

---

## 📥 Request Body

| Field | Type | Required | Constraint | Description |
| :--- | :--- | :--- | :--- | :--- |
| `username` | `string` | **Có** | Không được để trống | Tên đăng nhập của tài khoản |
| `password` | `string` | **Có** | Không được để trống | Mật khẩu tài khoản |

### Mẫu Request Body JSON:
```json
{
  "username": "user123",
  "password": "Password123@"
}
```

---

## 📤 Response

### 1. Thành công (HTTP 200 OK)
Trả về JWT Token dùng cho việc đính kèm vào header `Authorization: Bearer <token>` các API tiếp theo.

```json
{
  "success": true,
  "status": 200,
  "code": "LOGIN_SUCCESS",
  "message": "Đăng nhập thành công",
  "data": {
    "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfMTIzNDU2Nzg5Iiwicm9sZXMiOlsiVVNFUiJdLCJpYXQiOjE3MjU4Nzg0MDAsImV4cCI6MTcyNTk2NDgwMH0.SignatureExample..."
  }
}
```

### 2. Thất bại - Sai thông tin đăng nhập (HTTP 401 Unauthorized / HTTP 400 Bad Request)
```json
{
  "success": false,
  "status": 401,
  "code": "UNAUTHENTICATED",
  "message": "Tên đăng nhập hoặc mật khẩu không chính xác."
}
```
