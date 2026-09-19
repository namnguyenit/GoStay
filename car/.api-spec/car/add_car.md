# API Specification: Thêm xe mới (Add Car)

- **HTTP Method**: `POST`
- **Endpoint Gateway**: `/api/v1/cars`
- **Endpoint Backend**: `/cars`
- **Quyền truy cập (Role)**: `HOST` / `OPERATOR` (Đã được Admin phê duyệt làm Nhà xe)
- **Mô tả**: Cho phép chủ Nhà xe đăng ký thông tin xe khách mới vào cơ sở dữ liệu của hệ thống GoTravel.

---

## 📥 Request Headers

| Header | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `Authorization` | `string` | **Có** | Bearer Token của tài khoản Nhà xe (`Bearer <JWT_TOKEN>`) |
| `Content-Type` | `string` | **Có** | `application/json` |
| `x-user-id` | `string` | Auto | Do API Gateway tự động giải mã từ JWT token và đính kèm |

---

## 📥 Request Body

| Field | Type | Required | Allowed Values / Constraint | Description |
| :--- | :--- | :--- | :--- | :--- |
| `name` | `string` | **Có** | 3 - 100 ký tự | Tên / nhãn hiệu xe (VD: *Xe 01 Limousine VIP*) |
| `type` | `string` | **Có** | `SLEEPER`, `LIMOUSINE`, `SEAT` | Loại xe (Giường nằm, Limousine, Ghế ngồi) |
| `licensePlate` | `string` | **Có** | Định dạng biển số xe Việt Nam (VD: *30A-123.45*, *29B-98765*) | Biển số xe đăng ký |
| `totalSeats` | `number` | **Có** | Số nguyên dương $> 0$ | Tổng số ghế ngồi / giường nằm |

### Mẫu Request Body JSON:
```json
{
  "name": "Xe Limousine VIP 01",
  "type": "LIMOUSINE",
  "licensePlate": "30A-123.45",
  "totalSeats": 24
}
```

---

## 📤 Response

### 1. Thành công (HTTP 201 Created)
- Trạng thái xe khởi tạo mặc định là `ACTIVE`.

```json
{
  "success": true,
  "code": "ADD_CAR_SUCCESS",
  "message": "Thêm xe mới thành công!",
  "data": {
    "id": "car_c1b2a3d4-e5f6-7890-abcd-1234567890ab",
    "operatorId": "op_987654321_abcd",
    "name": "Xe Limousine VIP 01",
    "type": "LIMOUSINE",
    "status": "ACTIVE",
    "licensePlate": "30A-123.45",
    "totalSeats": 24,
    "createdAt": "2026-09-09T15:00:00.000Z",
    "updatedAt": "2026-09-09T15:00:00.000Z"
  }
}
```

### 2. Thất bại - Chưa được duyệt làm Nhà xe (HTTP 403 Forbidden)
```json
{
  "statusCode": 403,
  "message": "Tài khoản của bạn chưa được cấp quyền Nhà xe (Operator). Vui lòng nộp đơn đăng ký Nhà xe và chờ Admin phê duyệt trước khi thêm xe.",
  "error": "Forbidden"
}
```

### 3. Thất bại - Trùng biển số xe (HTTP 409 Conflict)
```json
{
  "statusCode": 409,
  "message": "Biển số xe đã tồn tại trong hệ thống, vui lòng kiểm tra lại.",
  "error": "Conflict"
}
```

### 4. Thất bại - Validation dữ liệu không hợp lệ (HTTP 400 Bad Request)
```json
{
  "statusCode": 400,
  "message": [
    "Biển số xe \"30A-ABC\" không đúng định dạng chuẩn biển số xe Việt Nam."
  ],
  "error": "Bad Request"
}
```
