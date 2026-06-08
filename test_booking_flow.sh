#!/bin/bash
# ============================================================
# GoStay - Quick Booking Test (Bước 13-17)
# Dùng khi đã có: Host, User, Listing sẵn sàng
# ============================================================

BASE_IDENTITY="http://localhost:8080"
BASE_CART="http://localhost:8084"
BASE_PAYMENT="http://localhost:8085"
BASE_BOOKING="http://localhost:8083"

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
log_step() { echo -e "\n${BLUE}=== $1 ===${NC}"; }
log_ok()   { echo -e "${GREEN}✅ $1${NC}"; }
log_err()  { echo -e "${RED}❌ $1${NC}"; }

# Helper decode JWT
jwt_sub() {
  local p=$(echo "$1" | cut -d. -f2)
  local r=$(( ${#p} % 4 ))
  [ $r -eq 2 ] && p="${p}==" || true
  [ $r -eq 3 ] && p="${p}=" || true
  echo "$p" | tr '_-' '/+' | base64 --decode 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin).get('sub',''))" 2>/dev/null
}

# ─── Config ────────────────────────────────────────────────
# Thay đổi nếu cần
LISTING_ID="9e7b13d3-b549-4e3d-af39-3b9705d92637"
HOST_USERNAME="nguyen_host_v2"
HOST_PASS="Host@12345"
USER_USERNAME="tran_user_v2"
USER_PASS="User@12345"
# ─────────────────────────────────────────────────────────────

log_step "Login"
HOST_TOKEN=$(curl -s -X POST "$BASE_IDENTITY/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$HOST_USERNAME\",\"password\":\"$HOST_PASS\"}" \
  | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('token',''))" 2>/dev/null)
HOST_ID=$(jwt_sub "$HOST_TOKEN")

USER_TOKEN=$(curl -s -X POST "$BASE_IDENTITY/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USER_USERNAME\",\"password\":\"$USER_PASS\"}" \
  | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('token',''))" 2>/dev/null)
USER_ID=$(jwt_sub "$USER_TOKEN")

echo "Host ID: $HOST_ID"
echo "User ID: $USER_ID"

log_step "Bước A: Khởi tạo Inventory (nếu chưa có)"
INIT=$(curl -s -X POST "$BASE_BOOKING/api/v1/internal/inventory/initialize" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HOST_TOKEN" \
  -d "{\"listingId\":\"$LISTING_ID\",\"category\":\"STAY\",\"quantity\":5}")
echo "$INIT" | python3 -m json.tool 2>/dev/null || echo "$INIT"

log_step "Bước 13: Kiểm tra availability"
AVAIL=$(curl -s "$BASE_BOOKING/api/v1/public/inventory/listings/$LISTING_ID/availability?startDate=2026-06-10&endDate=2026-06-13")
echo "$AVAIL" | python3 -m json.tool 2>/dev/null || echo "$AVAIL"

log_step "Bước 14: User đặt phòng (Book Now)"
BOOK=$(curl -s -X POST "$BASE_CART/api/v1/orders/book-now" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "X-User-Id: $USER_ID" \
  -d "{
    \"item\": {
      \"listingId\": \"$LISTING_ID\",
      \"listingTitle\": \"Can ho bien Da Nang\",
      \"startDate\": \"2026-06-10\",
      \"endDate\": \"2026-06-13\",
      \"quantity\": 1,
      \"unitPrice\": 1200000
    },
    \"fullName\": \"Tran Thi User\",
    \"email\": \"userv2@gostay.vn\",
    \"phone\": \"0912345678\"
  }")
echo "$BOOK" | python3 -m json.tool 2>/dev/null || echo "$BOOK"

ORDER_ID=$(echo "$BOOK" | python3 -c "import sys,json; d=json.load(sys.stdin).get('data',{}); print(d.get('orderId','') or d.get('id',''))" 2>/dev/null)
ORDER_AMOUNT=$(echo "$BOOK" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('totalAmount','3600000'))" 2>/dev/null)
log_ok "Order ID: $ORDER_ID | Tổng: ${ORDER_AMOUNT}đ"

log_step "Bước 15: Tạo thanh toán SePay QR"
PAYMENT=$(curl -s -X POST "$BASE_PAYMENT/api/v1/payments/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "X-User-Id: $USER_ID" \
  -d "{\"orderId\":\"$ORDER_ID\",\"amount\":$ORDER_AMOUNT,\"hostId\":\"$HOST_ID\"}")
echo "$PAYMENT" | python3 -m json.tool 2>/dev/null || echo "$PAYMENT"

PAYMENT_ID=$(echo "$PAYMENT" | python3 -c "import sys,json; d=json.load(sys.stdin).get('data',{}); print(d.get('paymentId','') or d.get('id',''))" 2>/dev/null)
QR_URL=$(echo "$PAYMENT" | python3 -c "import sys,json; d=json.load(sys.stdin).get('data',{}); print(d.get('qrCodeUrl','') or d.get('qrUrl',''))" 2>/dev/null)
REF=$(echo "$PAYMENT" | python3 -c "import sys,json; d=json.load(sys.stdin).get('data',{}); print(d.get('referenceCode','') or d.get('transferContent',''))" 2>/dev/null)

log_step "Bước 16: Xem lịch sử đơn hàng"
curl -s "$BASE_CART/api/v1/orders?page=0&size=5" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "X-User-Id: $USER_ID" | python3 -m json.tool 2>/dev/null

log_step "Bước 17: Xem lịch sử thanh toán"
curl -s "$BASE_PAYMENT/api/v1/payments/history?page=0&size=5" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "X-User-Id: $USER_ID" | python3 -m json.tool 2>/dev/null

echo ""
echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        🎉 KẾT QUẢ BOOKING! 🎉        ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
echo -e "Host ID    : ${YELLOW}$HOST_ID${NC}"
echo -e "User ID    : ${YELLOW}$USER_ID${NC}"
echo -e "Listing ID : ${YELLOW}$LISTING_ID${NC}"
echo -e "Order ID   : ${YELLOW}$ORDER_ID${NC}"
echo -e "Payment ID : ${YELLOW}$PAYMENT_ID${NC}"
echo -e "Mã CK      : ${YELLOW}$REF${NC}"
echo -e "QR URL     : ${YELLOW}$QR_URL${NC}"
echo ""
echo -e "${BLUE}➡️  Để giả lập thanh toán SePay: https://my.sepay.vn${NC}"
echo -e "${BLUE}   Mô phỏng giao dịch với nội dung: ${YELLOW}$REF${NC}"
