# API Specification: Xem danh sách & tìm kiếm Xe (Get Cars List)

- **HTTP Method**: `GET`
- **Endpoint Gateway**: `/api/v1/cars`
- **Endpoint Backend**: `/cars`
- **Quyền truy cập (Role)**: `HOST` / `OPERATOR`
- **Mô tả**: Cho phép nhà xe xem danh sách các xe thuộc sở hữu của mình, hỗ trợ phân trang, lọc loại xe, tìm kiếm theo tên/biển số xe và thống kê chỉ số KPI nhanh.

---

## 📥 Request Headers

| Header | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `Authorization` | `string` | **Có** | Bearer Token của tài khoản Nhà xe (`Bearer <JWT_TOKEN>`) |
| `x-user-id` | `string` | Auto | Do API Gateway tự động giải mã từ JWT token và đính kèm |

---

## 📥 Query Parameters

| Parameter | Type | Required | Default | Allowed Values / Constraint | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `page` | `number` | Không | `1` | Integer $\ge 1$ | Số trang |
| `limit` | `number` | Không | `10` | $1 \le$ Integer $\le 100$ | Số lượng dòng trên 1 trang |
| `keyword` | `string` | Không | `null` | Chuỗi ký tự | Tìm kiếm tương đối theo Tên xe hoặc Biển số xe |
| `type` | `string` | Không | Tất cả | `SLEEPER`, `LIMOUSINE`, `SEAT` | Lọc theo loại xe |
| `sortBy` | `string` | Không | `createdAt` | `createdAt`, `name`, `totalSeats` | Trường sắp xếp |
| `sortOrder` | `string` | Không | `desc` | `asc`, `desc` | Thứ tự sắp xếp (tăng/giảm) |

### Mẫu Request URL:
- Xem danh sách trang 1 (mặc định): `GET /api/v1/cars`
- Lọc xe Limousine tìm từ khóa "VIP": `GET /api/v1/cars?type=LIMOUSINE&keyword=VIP`

---

## 📤 Response

### 1. Thành công (HTTP 200 OK)
Trả về danh sách xe kèm thống kê KPI tổng quan:

```json
{
  "success": true,
  "code": "GET_CARS_SUCCESS",
  "message": "Lấy danh sách xe thành công.",
  "data": {
    "kpi": {
      "totalCars": 15,
      "sleeperCars": 8,
      "limousineCars": 5,
      "seatCars": 2
    },
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 15,
      "totalPages": 2
    },
    "data": [
      {
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
    ]
  }
}
```

### 2. Thất bại - Chưa được duyệt làm Nhà xe (HTTP 403 Forbidden)
```json
{
  "statusCode": 403,
  "message": "Tài khoản của bạn chưa được cấp quyền Nhà xe (Operator). Vui lòng nộp đơn đăng ký Nhà xe và chờ Admin phê duyệt.",
  "error": "Forbidden"
}
```
