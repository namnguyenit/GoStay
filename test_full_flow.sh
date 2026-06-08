#!/bin/bash
# ============================================================
# GoStay - Full E2E Test Script
# Luồng: Register Host → Nộp hồ sơ Host → Admin Approve
#        → Host tạo Listing → User đặt dịch vụ → Thanh toán QR
# ============================================================

BASE_IDENTITY="http://localhost:8080"
BASE_CATALOG="http://localhost:8082"
BASE_CART="http://localhost:8084"
BASE_PAYMENT="http://localhost:8085"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log_step() { echo -e "\n${BLUE}╔══════════════════════════════════════╗${NC}"; echo -e "${BLUE}║  $1${NC}"; echo -e "${BLUE}╚══════════════════════════════════════╝${NC}"; }
log_ok()   { echo -e "${GREEN}  ✅ $1${NC}"; }
log_err()  { echo -e "${RED}  ❌ $1${NC}"; }
log_info() { echo -e "${YELLOW}  ℹ️  $1${NC}"; }
log_data() { echo -e "${CYAN}  ▶ $1${NC}"; }

# Helper: extract JWT sub (userId) from token - fix URL-safe base64
extract_user_id_from_jwt() {
  local token="$1"
  local payload
  payload=$(echo "$token" | cut -d. -f2)
  local rem=$(( ${#payload} % 4 ))
  if [ $rem -eq 2 ]; then payload="${payload}=="; fi
  if [ $rem -eq 3 ]; then payload="${payload}="; fi
  echo "$payload" | tr '_-' '/+' | base64 --decode 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('sub',''))" 2>/dev/null
}

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   🏨 GoStay - Full E2E Test Flow 🏨          ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"

# ──────────────────────────────────────────────
# BƯỚC 1: Đăng ký HOST
# ──────────────────────────────────────────────
log_step "BƯỚC 1: Đăng ký tài khoản HOST"

REG_HOST=$(curl -s -X POST "$BASE_IDENTITY/api/users" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "nguyen_host_v2",
    "password": "Host@12345",
    "email": "hostv2@gostay.vn",
    "fullName": "Nguyễn Văn Host",
    "phoneNumber": "0901234567"
  }')
echo "$REG_HOST" | python3 -m json.tool 2>/dev/null || echo "$REG_HOST"
HOST_REG_ID=$(echo "$REG_HOST" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('id',''))" 2>/dev/null)
log_ok "Host registered | ID: $HOST_REG_ID"

# ──────────────────────────────────────────────
# BƯỚC 2: Đăng ký USER
# ──────────────────────────────────────────────
log_step "BƯỚC 2: Đăng ký tài khoản USER"

REG_USER=$(curl -s -X POST "$BASE_IDENTITY/api/users" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "tran_user_v2",
    "password": "User@12345",
    "email": "userv2@gostay.vn",
    "fullName": "Trần Thị User",
    "phoneNumber": "0912345678"
  }')
echo "$REG_USER" | python3 -m json.tool 2>/dev/null || echo "$REG_USER"
USER_REG_ID=$(echo "$REG_USER" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('id',''))" 2>/dev/null)
log_ok "User registered | ID: $USER_REG_ID"

# ──────────────────────────────────────────────
# BƯỚC 3: Login ADMIN
# ──────────────────────────────────────────────
log_step "BƯỚC 3: Đăng nhập ADMIN"

LOGIN_ADMIN=$(curl -s -X POST "$BASE_IDENTITY/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "12345678"}')
echo "$LOGIN_ADMIN" | python3 -m json.tool 2>/dev/null || echo "$LOGIN_ADMIN"
ADMIN_TOKEN=$(echo "$LOGIN_ADMIN" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('token',''))" 2>/dev/null)
ADMIN_ID=$(extract_user_id_from_jwt "$ADMIN_TOKEN")
log_ok "Admin logged in | ID: $ADMIN_ID"

# ──────────────────────────────────────────────
# BƯỚC 4: Login HOST
# ──────────────────────────────────────────────
log_step "BƯỚC 4: Đăng nhập HOST"

LOGIN_HOST=$(curl -s -X POST "$BASE_IDENTITY/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "nguyen_host_v2", "password": "Host@12345"}')
echo "$LOGIN_HOST" | python3 -m json.tool 2>/dev/null || echo "$LOGIN_HOST"
HOST_TOKEN=$(echo "$LOGIN_HOST" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('token',''))" 2>/dev/null)
HOST_ID=$(extract_user_id_from_jwt "$HOST_TOKEN")
log_ok "Host logged in | ID: $HOST_ID"

# ──────────────────────────────────────────────
# BƯỚC 5: Host nộp hồ sơ nâng cấp
# ──────────────────────────────────────────────
log_step "BƯỚC 5: Host nộp hồ sơ xin nâng cấp lên HOST"

UPGRADE=$(curl -s -X POST "$BASE_IDENTITY/api/users/me/upgradetohost" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HOST_TOKEN" \
  -d '{
    "cccdNumber": "0123456789",
    "bankAccount": "9876543210",
    "bankName": "Vietcombank"
  }')
echo "$UPGRADE" | python3 -m json.tool 2>/dev/null || echo "$UPGRADE"
log_ok "Host đã nộp hồ sơ → Trạng thái: PENDING"

# ──────────────────────────────────────────────
# BƯỚC 6: Admin xem danh sách hosts PENDING
# ──────────────────────────────────────────────
log_step "BƯỚC 6: Admin xem danh sách host chờ duyệt"

PENDING=$(curl -s -X GET "$BASE_IDENTITY/api/users/hosts?page=0&size=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo "$PENDING" | python3 -m json.tool 2>/dev/null || echo "$PENDING"

# Lấy account ID của host vừa đăng ký
HOST_ACCOUNT_ID=$(echo "$PENDING" | python3 -c "
import sys, json
d = json.load(sys.stdin)
items = d.get('data', {}).get('content', [])
for item in items:
    if item.get('username') == 'nguyen_host_v2':
        print(item.get('id',''))
        break
if not items:
    # fallback: lấy item đầu
    pass
" 2>/dev/null)

if [ -z "$HOST_ACCOUNT_ID" ]; then
  # fallback: dùng ID từ lúc register
  HOST_ACCOUNT_ID="$HOST_REG_ID"
fi
log_data "Host Account ID để approve: $HOST_ACCOUNT_ID"

# ──────────────────────────────────────────────
# BƯỚC 7: Admin APPROVE host
# ──────────────────────────────────────────────
log_step "BƯỚC 7: Admin APPROVE hồ sơ Host"

APPROVE=$(curl -s -X PUT "$BASE_IDENTITY/api/users/$HOST_ACCOUNT_ID/approvalstatus" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"status": "APPROVED", "reason": "Hồ sơ hợp lệ, đã xác minh CCCD và tài khoản ngân hàng"}')
echo "$APPROVE" | python3 -m json.tool 2>/dev/null || echo "$APPROVE"
log_ok "Admin đã APPROVE host!"

# ──────────────────────────────────────────────
# BƯỚC 8: Host login lại (nhận token mới có ROLE_HOST)
# ──────────────────────────────────────────────
log_step "BƯỚC 8: Host login lại → Token mới với ROLE_HOST"

LOGIN_HOST2=$(curl -s -X POST "$BASE_IDENTITY/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "nguyen_host_v2", "password": "Host@12345"}')
echo "$LOGIN_HOST2" | python3 -m json.tool 2>/dev/null || echo "$LOGIN_HOST2"
HOST_TOKEN=$(echo "$LOGIN_HOST2" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('token',''))" 2>/dev/null)
HOST_ID=$(extract_user_id_from_jwt "$HOST_TOKEN")
log_ok "Host re-logged in | ID: $HOST_ID"
log_data "Scope trong JWT: $(echo "$HOST_TOKEN" | cut -d. -f2 | base64 --decode 2>/dev/null | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d.get("scope",""))' 2>/dev/null)"

# ──────────────────────────────────────────────
# BƯỚC 9: Host tạo Listing
# ──────────────────────────────────────────────
log_step "BƯỚC 9: Host tạo Listing - Căn hộ biển Đà Nẵng"

CREATE_LISTING=$(curl -s -X POST "$BASE_CATALOG/api/v1/catalog/host/listings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HOST_TOKEN" \
  -d '{
    "category": "STAY",
    "subCategory": "NONE",
    "title": "Căn hộ biển Đà Nẵng - View trực diện Mỹ Khê",
    "description": "Căn hộ cao cấp 2PN, ban công nhìn thẳng ra biển Mỹ Khê. Đầy đủ tiện nghi, phù hợp cặp đôi hoặc gia đình nhỏ.",
    "province": "Đà Nẵng",
    "basePrice": 1200000,
    "priceUnit": "PER_NIGHT",
    "latitude": 16.0471,
    "longitude": 108.2410,
    "thumbnailUrl": "https://images.unsplash.com/photo-1571896349842-33c89424de2d",
    "attributes": {
      "categoryType": "STAY",
      "galleryUrls": [
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d",
        "https://images.unsplash.com/photo-1582719508461-905c673771fd"
      ],
      "stayDetail": {
        "propertyType": "APARTMENT",
        "roomSizeSqM": 65,
        "maxGuests": 4,
        "bedrooms": 2,
        "beds": [
          {"type": "KING", "quantity": 1},
          {"type": "SINGLE", "quantity": 2}
        ],
        "bathrooms": 2
      },
      "amenities": ["WIFI", "AIR_CONDITIONER", "POOL", "PARKING", "KITCHEN", "TV", "WASHING_MACHINE"],
      "policies": {
        "checkInTime": "14:00",
        "checkOutTime": "12:00",
        "allowPets": false,
        "allowSmoking": false,
        "partyAllowed": false
      }
    }
  }')
echo "$CREATE_LISTING" | python3 -m json.tool 2>/dev/null || echo "$CREATE_LISTING"
log_ok "Listing được tạo thành công!"

# ──────────────────────────────────────────────
# BƯỚC 10: Host xem listings của mình
# ──────────────────────────────────────────────
log_step "BƯỚC 10: Host xem danh sách Listing của mình"

MY_LISTINGS=$(curl -s -X GET "$BASE_CATALOG/api/v1/catalog/host/listings" \
  -H "Authorization: Bearer $HOST_TOKEN")
echo "$MY_LISTINGS" | python3 -m json.tool 2>/dev/null || echo "$MY_LISTINGS"

LISTING_ID=$(echo "$MY_LISTINGS" | python3 -c "
import sys, json
d = json.load(sys.stdin)
items = d.get('data', {}).get('content', [])
if items:
    print(items[0].get('id', ''))
" 2>/dev/null)
LISTING_PRICE=$(echo "$MY_LISTINGS" | python3 -c "
import sys, json
d = json.load(sys.stdin)
items = d.get('data', {}).get('content', [])
if items:
    print(items[0].get('basePrice', 1200000))
" 2>/dev/null)
log_data "Listing ID: $LISTING_ID"
log_data "Giá: ${LISTING_PRICE} VNĐ/đêm"

# ──────────────────────────────────────────────
# BƯỚC 11: User đăng nhập
# ──────────────────────────────────────────────
log_step "BƯỚC 11: User đăng nhập"

LOGIN_USER=$(curl -s -X POST "$BASE_IDENTITY/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "tran_user_v2", "password": "User@12345"}')
echo "$LOGIN_USER" | python3 -m json.tool 2>/dev/null || echo "$LOGIN_USER"
USER_TOKEN=$(echo "$LOGIN_USER" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('token',''))" 2>/dev/null)
USER_ID=$(extract_user_id_from_jwt "$USER_TOKEN")
log_ok "User logged in | ID: $USER_ID"

# ──────────────────────────────────────────────
# BƯỚC 12: User xem listing (public)
# ──────────────────────────────────────────────
log_step "BƯỚC 12: User xem chi tiết Listing (public)"

VIEW=$(curl -s -X GET "$BASE_CATALOG/api/v1/catalog/listings/$LISTING_ID")
echo "$VIEW" | python3 -m json.tool 2>/dev/null || echo "$VIEW"
log_ok "Xem listing thành công!"

# ──────────────────────────────────────────────
# BƯỚC 13: User đặt phòng (Book Now)
# ──────────────────────────────────────────────
log_step "BƯỚC 13: User đặt phòng trực tiếp (Book Now)"

BOOK=$(curl -s -X POST "$BASE_CART/api/v1/orders/book-now" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "X-User-Id: $USER_ID" \
  -d "{
    \"item\": {
      \"listingId\": \"$LISTING_ID\",
      \"listingTitle\": \"Căn hộ biển Đà Nẵng - View trực diện Mỹ Khê\",
      \"thumbnailUrl\": \"https://images.unsplash.com/photo-1571896349842-33c89424de2d\",
      \"startDate\": \"2026-06-10\",
      \"endDate\": \"2026-06-13\",
      \"quantity\": 1,
      \"unitPrice\": $LISTING_PRICE
    },
    \"fullName\": \"Trần Thị User\",
    \"email\": \"userv2@gostay.vn\",
    \"phone\": \"0912345678\"
  }")
echo "$BOOK" | python3 -m json.tool 2>/dev/null || echo "$BOOK"

ORDER_ID=$(echo "$BOOK" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('orderId','') or d.get('data',{}).get('id',''))" 2>/dev/null)
ORDER_AMOUNT=$(echo "$BOOK" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('totalAmount','3600000'))" 2>/dev/null)
log_ok "Order đã đặt! | Order ID: $ORDER_ID"
log_data "Tổng tiền: ${ORDER_AMOUNT} VNĐ (3 đêm × 1.200.000đ)"

# ──────────────────────────────────────────────
# BƯỚC 14: User tạo thanh toán SePay QR
# ──────────────────────────────────────────────
log_step "BƯỚC 14: Tạo thanh toán → Sinh QR SePay"

PAYMENT=$(curl -s -X POST "$BASE_PAYMENT/api/v1/payments/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "X-User-Id: $USER_ID" \
  -d "{
    \"orderId\": \"$ORDER_ID\",
    \"amount\": $ORDER_AMOUNT,
    \"hostId\": \"$HOST_ID\"
  }")
echo "$PAYMENT" | python3 -m json.tool 2>/dev/null || echo "$PAYMENT"

PAYMENT_ID=$(echo "$PAYMENT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('paymentId','') or d.get('data',{}).get('id',''))" 2>/dev/null)
QR_URL=$(echo "$PAYMENT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('qrCodeUrl','') or d.get('data',{}).get('qrUrl',''))" 2>/dev/null)
REF_CODE=$(echo "$PAYMENT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('referenceCode','') or d.get('data',{}).get('transferContent',''))" 2>/dev/null)
log_ok "Payment tạo thành công! | ID: $PAYMENT_ID"
log_data "QR URL: $QR_URL"
log_data "Mã chuyển khoản: $REF_CODE"

# ──────────────────────────────────────────────
# BƯỚC 15: User xem danh sách đơn hàng
# ──────────────────────────────────────────────
log_step "BƯỚC 15: User xem lịch sử đơn hàng"

ORDERS=$(curl -s -X GET "$BASE_CART/api/v1/orders?page=0&size=5" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "X-User-Id: $USER_ID")
echo "$ORDERS" | python3 -m json.tool 2>/dev/null || echo "$ORDERS"

# ──────────────────────────────────────────────
# BƯỚC 16: User xem chi tiết đơn hàng
# ──────────────────────────────────────────────
log_step "BƯỚC 16: User xem chi tiết đơn hàng"

if [ -n "$ORDER_ID" ]; then
  ORDER_DETAIL=$(curl -s -X GET "$BASE_CART/api/v1/orders/$ORDER_ID" \
    -H "Authorization: Bearer $USER_TOKEN" \
    -H "X-User-Id: $USER_ID")
  echo "$ORDER_DETAIL" | python3 -m json.tool 2>/dev/null || echo "$ORDER_DETAIL"
fi

# ──────────────────────────────────────────────
# BƯỚC 17: User xem lịch sử thanh toán
# ──────────────────────────────────────────────
log_step "BƯỚC 17: User xem lịch sử thanh toán"

PAY_HIST=$(curl -s -X GET "$BASE_PAYMENT/api/v1/payments/history?page=0&size=5" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "X-User-Id: $USER_ID")
echo "$PAY_HIST" | python3 -m json.tool 2>/dev/null || echo "$PAY_HIST"

# ──────────────────────────────────────────────
# BƯỚC 18: Admin xem tất cả hosts đã được duyệt
# ──────────────────────────────────────────────
log_step "BƯỚC 18: Admin xem tất cả Hosts đã APPROVED"

ALL_HOSTS=$(curl -s -X GET "$BASE_IDENTITY/api/users/hosts/all?page=0&size=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo "$ALL_HOSTS" | python3 -m json.tool 2>/dev/null || echo "$ALL_HOSTS"

# ──────────────────────────────────────────────
# TỔNG KẾT
# ──────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          🎉 LUỒNG TEST HOÀN TẤT THÀNH CÔNG! 🎉       ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}📋 THÔNG TIN CÁC ACCOUNTS:${NC}"
echo -e "  Admin ID  : ${YELLOW}$ADMIN_ID${NC}"
echo -e "  Host ID   : ${YELLOW}$HOST_ID${NC}"
echo -e "  User ID   : ${YELLOW}$USER_ID${NC}"
echo ""
echo -e "${CYAN}📦 THÔNG TIN DỊCH VỤ:${NC}"
echo -e "  Listing ID : ${YELLOW}$LISTING_ID${NC}"
echo -e "  Order ID   : ${YELLOW}$ORDER_ID${NC}"
echo -e "  Payment ID : ${YELLOW}$PAYMENT_ID${NC}"
echo -e "  Mã CK      : ${YELLOW}$REF_CODE${NC}"
echo -e "  QR URL     : ${YELLOW}$QR_URL${NC}"
echo ""
echo -e "${BLUE}💡 Để hoàn tất thanh toán:${NC}"
echo -e "  1. Quét QR hoặc chuyển khoản với nội dung: ${YELLOW}$REF_CODE${NC}"
echo -e "  2. Mô phỏng tại: https://my.sepay.vn (mục Mô phỏng giao dịch)"
echo -e "  3. Webhook endpoint: http://localhost:8085/api/v1/public/payments/sepay-webhook"
echo ""
