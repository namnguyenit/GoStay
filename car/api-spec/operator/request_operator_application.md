# API Specification: Nộp đơn đăng ký Nhà xe (Request Operator Application)

- **HTTP Method**: `POST`
- **Endpoint Gateway**: `/api/v1/operator-applications`
- **Endpoint Backend**: `/operator-applications`
- **Quyền truy cập (Role)**: `USER` (Đã đăng nhập)
- **Mô tả**: Cho phép người dùng (`USER`) nộp đơn xin cấp quyền trở thành Nhà xe (`HOST`/`OPERATOR`).

---

## 📥 Request Headers

| Header | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `Authorization` | `string` | **Có** | Bearer Token của người dùng (`Bearer <JWT_TOKEN>`) |
| `Content-Type` | `string` | **Có** | `application/json` |
| `x-user-id` | `string` | Auto | Do API Gateway tự động giải mã từ JWT token và đính kèm |

---

## 📥 Request Body

| Field | Type | Required | Constraint | Description |
| :--- | :--- | :--- | :--- | :--- |
| `name` | `string` | **Có** | 3 - 100 ký tự | Tên Nhà xe / Công ty vận tải đăng ký |
| `phone` | `string` | **Có** | SĐT Việt Nam 10 chữ số | Số điện thoại liên hệ nhà xe |
| `address` | `string` | **Có** | Không để trống | Địa chỉ trụ sở chính nhà xe |

### Mẫu Request Body JSON:
```json
{
  "name": "Nhà xe Phương Trang",
  "phone": "0912345678",
  "address": "272 Đề Thám, Phường Phạm Ngũ Lão, Quận 1, TP.HCM"
}
```

---

## 📤 Response

### 1. Thành công (HTTP 201 Created)
```json
{
  "success": true,
  "code": "REQUEST_OPERATOR_SUCCESS",
  "message": "Gửi đơn đăng ký thành công! Yêu cầu của bạn đang chờ Admin xem xét và phê duyệt.",
  "data": {
    "id": "b2c3d4e5-f6a7-8901-bcde-2345678901bc",
    "userId": "usr_123456789",
    "name": "Nhà xe Phương Trang",
    "phone": "0912345678",
    "address": "272 Đề Thám, Phường Phạm Ngũ Lão, Quận 1, TP.HCM",
    "status": "PENDING",
    "createdAt": "2026-09-09T14:08:00.000Z",
    "updatedAt": "2026-09-09T14:08:00.000Z"
  }
}
```

### 2. Thất bại - Đã có đơn PENDING chưa xử lý (HTTP 409 Conflict)
```json
{
  "statusCode": 409,
  "message": "Bạn đã có đơn đăng ký đang chờ Admin phê duyệt. Vui lòng chờ kết quả xử lý.",
  "error": "Conflict"
}
```

### 3. Thất bại - Đã là Nhà xe chính thức (HTTP 409 Conflict)
```json
{
  "statusCode": 409,
  "message": "Tài khoản của bạn đã được phê duyệt trở thành Nhà xe (Operator). Không thể gửi thêm đơn đăng ký mới.",
  "error": "Conflict"
}
```

### 4. Thất bại - Validation dữ liệu không hợp lệ (HTTP 400 Bad Request)
```json
{
  "statusCode": 400,
  "message": [
    "Số điện thoại \"091234\" không hợp lệ (phải là định dạng SĐT Việt Nam 10 chữ số)."
  ],
  "error": "Bad Request"
}
```
