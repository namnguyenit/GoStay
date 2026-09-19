# API Specification: Xem danh sách Nhà xe (Get Operators)

- **HTTP Method**: `GET`
- **Endpoint Gateway**: `/api/v1/operators`
- **Endpoint Backend**: `/operators`
- **Quyền truy cập (Role)**: `ADMIN` (Quản trị viên)
- **Mô tả**: Cho phép Quản trị viên (`ADMIN`) lấy danh sách các Nhà xe chính thức đang hoạt động trên hệ thống, hỗ trợ tìm kiếm theo tên nhà xe, sắp xếp và phân trang.

---

## 📥 Request Headers

| Header | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `Authorization` | `string` | **Có** | Bearer Token của tài khoản Admin (`Bearer <ADMIN_JWT_TOKEN>`) |
| `x-user-roles` | `string` | Auto | Do APIGateway tự động giải mã từ token (phải chứa `ADMIN`) |

---

## 📥 Query Parameters

| Parameter | Type | Required | Default | Allowed Values | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `search` | `string` | Không | - | Chuỗi ký tự bất kỳ | Tìm kiếm tương đối theo tên nhà xe |
| `page` | `number` | Không | `1` | Số nguyên >= 1 | Trang hiện tại |
| `limit` | `number` | Không | `10` | 1 - 100 | Số bản ghi trên mỗi trang |
| `sortBy` | `string` | Không | `createdAt` | `createdAt`, `name` | Trường sắp xếp |
| `sortOrder` | `string` | Không | `desc` | `asc`, `desc` | Chiều sắp xếp (tăng dần / giảm dần) |

### Mẫu Request URL:
- Xem danh sách mặc định: `GET /api/v1/operators`
- Tìm kiếm theo tên và phân trang: `GET /api/v1/operators?search=Phương Trang&page=1&limit=10`

---

## 📤 Response

### 1. Thành công (HTTP 200 OK)
```json
{
  "success": true,
  "code": "GET_OPERATORS_SUCCESS",
  "message": "Lấy danh sách nhà xe thành công.",
  "data": [
    {
      "id": "op_987654321",
      "userId": "usr_123456789",
      "name": "Nhà xe Phương Trang",
      "createdAt": "2026-09-15T00:10:00.000Z",
      "updatedAt": "2026-09-15T00:10:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### 2. Thất bại - Không có quyền Admin (HTTP 403 Forbidden)
```json
{
  "statusCode": 403,
  "message": "Bạn không có quyền thực hiện thao tác này. Chỉ Quản trị viên (Admin) mới có quyền truy cập.",
  "error": "Forbidden"
}
```
