# API Specification: Xem danh sách đơn đăng ký Nhà xe (Get Operator Applications)

- **HTTP Method**: `GET`
- **Endpoint Gateway**: `/api/v1/operator-applications`
- **Endpoint Backend**: `/operator-applications`
- **Quyền truy cập (Role)**: `ADMIN` (Quản trị viên)
- **Mô tả**: Cho phép Quản trị viên (`ADMIN`) lấy danh sách tất cả các đơn đăng ký trở thành nhà xe, hỗ trợ lọc theo trạng thái đơn (`status`).

---

## 📥 Request Headers

| Header | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `Authorization` | `string` | **Có** | Bearer Token của tài khoản Admin (`Bearer <ADMIN_JWT_TOKEN>`) |

---

## 📥 Query Parameters

| Parameter | Type | Required | Default | Allowed Values | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `status` | `string` | Không | Tất cả | `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED` | Lọc theo trạng thái đơn |

### Mẫu Request URL:
- Xem tất cả đơn: `GET /api/v1/operator-applications`
- Lọc đơn đang chờ duyệt: `GET /api/v1/operator-applications?status=PENDING`

---

## 📤 Response

### 1. Thành công (HTTP 200 OK)
```json
{
  "success": true,
  "code": "GET_OPERATOR_APPLICATIONS_SUCCESS",
  "message": "Lấy danh sách đơn đăng ký thành công.",
  "data": [
    {
      "id": "b2c3d4e5-f6a7-8901-bcde-2345678901bc",
      "userId": "usr_123456789",
      "name": "Nhà xe Phương Trang",
      "phone": "0912345678",
      "address": "272 Đề Thám, Phường Phạm Ngũ Lão, Quận 1, TP.HCM",
      "status": "PENDING",
      "rejectReason": null,
      "createdAt": "2026-09-09T14:08:00.000Z",
      "updatedAt": "2026-09-09T14:08:00.000Z"
    }
  ]
}
```

### 2. Thất bại - Chưa đăng nhập hoặc Không có quyền Admin (HTTP 401 / HTTP 403)
```json
{
  "statusCode": 403,
  "message": "Bạn không có quyền thực hiện thao tác này.",
  "error": "Forbidden"
}
```
