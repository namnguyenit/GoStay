# API Specification: Kiểm tra trạng thái Nhà xe của tôi (Get My Operator Status)

- **HTTP Method**: `GET`
- **Endpoint Gateway**: `/api/v1/operator-applications/me`
- **Endpoint Backend**: `/operator-applications/me`
- **Quyền truy cập (Role)**: `USER` (Đã đăng nhập)
- **Mô tả**: Cho phép người dùng kiểm tra tài khoản của mình có phải là Nhà xe (`Operator`) hay chưa, đồng thời trả về thông tin chi tiết của Nhà xe (nếu có) và đơn đăng ký gần đây nhất (nếu có) để Frontend phục vụ phân luồng giao diện.

---

## 📥 Request Headers

| Header | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `Authorization` | `string` | **Có** | Bearer Token của người dùng (`Bearer <JWT_TOKEN>`) |
| `x-user-id` | `string` | Auto | Do API Gateway tự động giải mã từ JWT token và đính kèm |

---

## 📥 Query Parameters (Optional - Phục vụ dev/testing)

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `userId` | `string` | Không | Mã định danh người dùng (dùng khi test trực tiếp Backend không qua Gateway) |

---

## 📤 Response

### 1. Thành công - Tài khoản chưa nộp đơn đăng ký Nhà xe (HTTP 200 OK)
```json
{
  "success": true,
  "code": "GET_MY_OPERATOR_STATUS_SUCCESS",
  "message": "Lấy thông tin trạng thái nhà xe thành công.",
  "data": {
    "isOperator": false
  }
}
```

### 2. Thành công - Tài khoản có đơn đăng ký đang chờ xét duyệt (HTTP 200 OK)
```json
{
  "success": true,
  "code": "GET_MY_OPERATOR_STATUS_SUCCESS",
  "message": "Lấy thông tin trạng thái nhà xe thành công.",
  "data": {
    "isOperator": false,
    "latestApplication": {
      "id": "b2c3d4e5-f6a7-8901-bcde-2345678901bc",
      "userId": "usr_123456789",
      "name": "Nhà xe Phương Trang",
      "phone": "0912345678",
      "address": "272 Đề Thám, Phường Phạm Ngũ Lão, Quận 1, TP.HCM",
      "status": "PENDING",
      "rejectReason": null,
      "createdAt": "2026-09-15T00:00:00.000Z",
      "updatedAt": "2026-09-15T00:00:00.000Z"
    }
  }
}
```

### 3. Thành công - Tài khoản bị từ chối đơn đăng ký (HTTP 200 OK)
```json
{
  "success": true,
  "code": "GET_MY_OPERATOR_STATUS_SUCCESS",
  "message": "Lấy thông tin trạng thái nhà xe thành công.",
  "data": {
    "isOperator": false,
    "latestApplication": {
      "id": "b2c3d4e5-f6a7-8901-bcde-2345678901bc",
      "userId": "usr_123456789",
      "name": "Nhà xe Phương Trang",
      "phone": "0912345678",
      "address": "272 Đề Thám, Phường Phạm Ngũ Lão, Quận 1, TP.HCM",
      "status": "REJECTED",
      "rejectReason": "Thông tin giấy phép kinh doanh chưa hợp lệ",
      "createdAt": "2026-09-15T00:00:00.000Z",
      "updatedAt": "2026-09-15T00:10:00.000Z"
    }
  }
}
```

### 4. Thành công - Tài khoản đã là Nhà xe chính thức (HTTP 200 OK)
```json
{
  "success": true,
  "code": "GET_MY_OPERATOR_STATUS_SUCCESS",
  "message": "Lấy thông tin trạng thái nhà xe thành công.",
  "data": {
    "isOperator": true,
    "operator": {
      "id": "op_987654321",
      "userId": "usr_123456789",
      "name": "Nhà xe Phương Trang",
      "createdAt": "2026-09-15T00:10:00.000Z",
      "updatedAt": "2026-09-15T00:10:00.000Z"
    },
    "latestApplication": {
      "id": "b2c3d4e5-f6a7-8901-bcde-2345678901bc",
      "userId": "usr_123456789",
      "name": "Nhà xe Phương Trang",
      "phone": "0912345678",
      "address": "272 Đề Thám, Phường Phạm Ngũ Lão, Quận 1, TP.HCM",
      "status": "APPROVED",
      "rejectReason": null,
      "createdAt": "2026-09-15T00:00:00.000Z",
      "updatedAt": "2026-09-15T00:10:00.000Z"
    }
  }
}
```

### 5. Thất bại - Thiếu thông tin người dùng (HTTP 400 Bad Request)
```json
{
  "statusCode": 400,
  "message": "Không tìm thấy thông tin định danh người dùng (x-user-id header).",
  "error": "Bad Request"
}
```
