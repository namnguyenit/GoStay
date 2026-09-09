# API Specification: Xử lý Phê duyệt / Từ chối đơn đăng ký Nhà xe (Process Operator Application)

- **HTTP Method**: `PATCH`
- **Endpoint Gateway**: `/api/v1/operator-applications/:id/process`
- **Endpoint Backend**: `/operator-applications/:id/process`
- **Quyền truy cập (Role)**: `ADMIN` (Quản trị viên)
- **Mô tả**: Cho phép Quản trị viên (`ADMIN`) thực hiện Phê duyệt (`APPROVED`) hoặc Từ chối (`REJECTED`) đơn đăng ký nhà xe dựa vào thông tin truyền vào `status`.

---

## 📥 Request Headers

| Header | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `Authorization` | `string` | **Có** | Bearer Token của tài khoản Admin (`Bearer <ADMIN_JWT_TOKEN>`) |
| `Content-Type` | `string` | **Có** | `application/json` |

---

## 📥 Path Parameters

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Mã UUID của đơn đăng ký cần xử lý |

---

## 📥 Request Body

| Field | Type | Required | Allowed Values | Description |
| :--- | :--- | :--- | :--- | :--- |
| `status` | `string` | **Có** | `APPROVED`, `REJECTED` | Quyết định xử lý: Duyệt hoặc Từ chối |
| `rejectReason` | `string` | Bắt buộc khi `status` = `REJECTED` | Chuỗi ký tự | Lý do từ chối đơn đăng ký |

### Mẫu Request Body - Phê duyệt (`APPROVED`):
```json
{
  "status": "APPROVED"
}
```

### Mẫu Request Body - Từ chối (`REJECTED`):
```json
{
  "status": "REJECTED",
  "rejectReason": "Thông tin số điện thoại liên hệ nhà xe không chính xác."
}
```

---

## 📤 Response

### 1. Thành công Phê duyệt (HTTP 200 OK)
- Đơn chuyển sang trạng thái `APPROVED`.
- **Hệ thống tự động khởi tạo bản ghi Nhà xe chính thức (`Operator`) mới** vào bảng `operators`.

```json
{
  "success": true,
  "code": "APPROVE_OPERATOR_SUCCESS",
  "message": "Đã phê duyệt đơn đăng ký nhà xe thành công!",
  "data": {
    "application": {
      "id": "b2c3d4e5-f6a7-8901-bcde-2345678901bc",
      "userId": "usr_123456789",
      "name": "Nhà xe Phương Trang",
      "phone": "0912345678",
      "address": "272 Đề Thám, Phường Phạm Ngũ Lão, Quận 1, TP.HCM",
      "status": "APPROVED",
      "rejectReason": null,
      "createdAt": "2026-09-09T14:08:00.000Z",
      "updatedAt": "2026-09-09T14:20:00.000Z"
    },
    "operator": {
      "id": "op_987654321_abcd",
      "userId": "usr_123456789",
      "name": "Nhà xe Phương Trang",
      "createdAt": "2026-09-09T14:20:00.000Z",
      "updatedAt": "2026-09-09T14:20:00.000Z"
    }
  }
}
```

### 2. Thành công Từ chối (HTTP 200 OK)
- Đơn chuyển sang trạng thái `REJECTED`, lưu `rejectReason`.
- Trường `operator` trả về `null` (Không khởi tạo `Operator`).

```json
{
  "success": true,
  "code": "REJECT_OPERATOR_SUCCESS",
  "message": "Đã từ chối đơn đăng ký nhà xe.",
  "data": {
    "application": {
      "id": "b2c3d4e5-f6a7-8901-bcde-2345678901bc",
      "userId": "usr_123456789",
      "name": "Nhà xe Phương Trang",
      "phone": "0912345678",
      "address": "272 Đề Thám, Phường Phạm Ngũ Lão, Quận 1, TP.HCM",
      "status": "REJECTED",
      "rejectReason": "Thông tin số điện thoại liên hệ nhà xe không chính xác.",
      "createdAt": "2026-09-09T14:08:00.000Z",
      "updatedAt": "2026-09-09T14:25:00.000Z"
    },
    "operator": null
  }
}
```

### 3. Thất bại - Đơn không tồn tại (HTTP 404 Not Found)
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy đơn đăng ký nhà xe.",
  "error": "Not Found"
}
```

### 4. Thất bại - Đơn không ở trạng thái PENDING (HTTP 400 Bad Request)
```json
{
  "statusCode": 400,
  "message": "Đơn đăng ký không ở trạng thái chờ duyệt (PENDING).",
  "error": "Bad Request"
}
```

---

## ⚡ Helper Endpoints (Đường dẫn rút gọn)

Ngoài endpoint chung `/process`, hệ thống cũng hỗ trợ các URL helper:

1. **Phê duyệt trực tiếp**: `PATCH /api/v1/operator-applications/:id/approve` (Không cần body).
2. **Từ chối trực tiếp**: `PATCH /api/v1/operator-applications/:id/reject`
   - Body: `{ "rejectReason": "Lý do từ chối..." }`
