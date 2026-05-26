/**
 * ============================================================================
 * CART & ORDER SERVICE - Route Configuration
 * Backend Port: 8084
 * ============================================================================
 *
 * Controllers & Endpoints Served:
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ CartController (/api/v1/carts)                                          │
 * │   GET    /                    → Xem giỏ hàng (X-User-Id header)         │
 * │   POST   /items               → Thêm sản phẩm vào giỏ                  │
 * │   PUT    /items/{itemId}      → Cập nhật số lượng, ngày                 │
 * │   DELETE /items/{itemId}      → Xóa sản phẩm khỏi giỏ                  │
 * │   @PreAuthorize: isAuthenticated()                                      │
 * ├──────────────────────────────────────────────────────────────────────────┤
 * │ OrderController (/api/v1/orders)                                        │
 * │   POST /checkout-cart         → Checkout từ giỏ hàng                    │
 * │   POST /book-now              → Đặt nhanh (không qua giỏ)              │
 * │   GET  /{orderId}             → Xem chi tiết đơn hàng                   │
 * │   GET  /                      → Xem danh sách đơn (phân trang)          │
 * │   PUT  /{orderId}/cancel      → Hủy đơn hàng                           │
 * │   @PreAuthorize: isAuthenticated()                                      │
 * ├──────────────────────────────────────────────────────────────────────────┤
 * │ InternalOrderController (/api/v1/internal/orders)                       │
 * │   PUT /{orderId}/payment-success → Ghi nhận thanh toán thành công       │
 * │   PUT /{orderId}/payment-failed  → Ghi nhận thanh toán thất bại        │
 * │   Không expose qua Gateway, chỉ gọi service-to-service                  │
 * └──────────────────────────────────────────────────────────────────────────┘
 */

export const cartRoutes = [
    // ==========================================
    // 1. CART - Quản lý giỏ hàng (Auth required)
    // ==========================================
    {
        url: '/api/v1/carts',
        target: (process.env.CART_SERVICE_URL || "http://localhost:8084"),
        auth: true,
        // GET    /                   → Xem giỏ hàng
        // POST   /items              → Thêm vào giỏ
        // PUT    /items/{itemId}     → Sửa item trong giỏ
        // DELETE /items/{itemId}     → Xóa item khỏi giỏ
    },

    // ==========================================
    // 2. ORDER - Quản lý đơn hàng (Auth required)
    // ==========================================
    {
        url: '/api/v1/orders',
        target: (process.env.CART_SERVICE_URL || "http://localhost:8084"),
        auth: true,
        // POST /checkout-cart        → Checkout toàn bộ giỏ
        // POST /book-now             → Đặt nhanh 1 dịch vụ
        // GET  /{orderId}            → Chi tiết đơn
        // GET  /                     → Lịch sử đơn (phân trang)
        // PUT  /{orderId}/cancel     → Hủy đơn
    }
];
