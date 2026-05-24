#!/bin/bash
# ============================================================
# GoStay - Payment Demo Script
# Tạo đơn hàng → Sinh QR → Hướng dẫn thanh toán SePay Test
# ============================================================

BASE_IDENTITY="http://localhost:8080"
BASE_CART="http://localhost:8084"
BASE_PAYMENT="http://localhost:8085"
BASE_BOOKING="http://localhost:8083"

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

log_step() { echo -e "\n${BLUE}${BOLD}━━━ $1 ━━━${NC}"; }
log_ok()   { echo -e "${GREEN}  ✅ $1${NC}"; }
log_warn() { echo -e "${YELLOW}  ⚠️  $1${NC}"; }
log_box()  { echo -e "${CYAN}$1${NC}"; }

jwt_sub() {
  local p=$(echo "$1" | cut -d. -f2)
  local r=$(( ${#p} % 4 ))
  [ $r -eq 2 ] && p="${p}==" || true
  [ $r -eq 3 ] && p="${p}=" || true
  echo "$p" | tr '_-' '/+' | base64 --decode 2>/dev/null \
    | python3 -c "import sys,json; print(json.load(sys.stdin).get('sub',''))" 2>/dev/null
}

# ─── Config (thay đổi nếu cần) ────────────────────────────
LISTING_ID="9e7b13d3-b549-4e3d-af39-3b9705d92637"
HOST_USERNAME="nguyen_host_v2"
HOST_PASS="Host@12345"
USER_USERNAME="tran_user_v2"
USER_PASS="User@12345"
START_DATE="2026-06-20"  # Dùng ngày khác để tránh đã đặt
END_DATE="2026-06-22"
UNIT_PRICE=1200000
# ─────────────────────────────────────────────────────────

echo ""
echo -e "${BOLD}${GREEN}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║        🏨 GoStay Payment Demo - SePay QR Flow 🏨         ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ─── LOGIN ────────────────────────────────────────────────
log_step "BƯỚC 1: Đăng nhập"

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

log_ok "Host ID: $HOST_ID"
log_ok "User ID: $USER_ID"

# ─── ĐẶT PHÒNG ────────────────────────────────────────────
log_step "BƯỚC 2: User đặt phòng (Book Now)"

BOOK=$(curl -s -X POST "$BASE_CART/api/v1/orders/book-now" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "X-User-Id: $USER_ID" \
  -d "{
    \"item\": {
      \"listingId\": \"$LISTING_ID\",
      \"listingTitle\": \"Can ho bien Da Nang\",
      \"startDate\": \"$START_DATE\",
      \"endDate\": \"$END_DATE\",
      \"quantity\": 1,
      \"unitPrice\": $UNIT_PRICE
    },
    \"fullName\": \"Tran Thi User\",
    \"email\": \"userv2@gostay.vn\",
    \"phone\": \"0912345678\"
  }")

BOOK_SUCCESS=$(echo "$BOOK" | python3 -c "import sys,json; print(json.load(sys.stdin).get('success',''))" 2>/dev/null)
ORDER_ID=$(echo "$BOOK" | python3 -c "import sys,json; d=json.load(sys.stdin).get('data',{}); print(d.get('orderId','') or d.get('id',''))" 2>/dev/null)
ORDER_AMOUNT=$(echo "$BOOK" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('totalAmount',0))" 2>/dev/null)

if [ "$BOOK_SUCCESS" = "True" ] || [ "$BOOK_SUCCESS" = "true" ]; then
  log_ok "Đặt phòng thành công!"
  log_ok "Order ID    : $ORDER_ID"
  log_ok "Tổng tiền   : $(python3 -c "print(f'{int($ORDER_AMOUNT):,}')") VNĐ (2 đêm × 1.200.000đ)"
else
  echo -e "${RED}  ❌ Lỗi đặt phòng:${NC}"
  echo "$BOOK" | python3 -m json.tool 2>/dev/null
  echo ""
  log_warn "Có thể ngày $START_DATE–$END_DATE đã bị đặt hoặc inventory hết."
  log_warn "Thử thay START_DATE/END_DATE trong script này."
  exit 1
fi

# ─── TẠO THANH TOÁN ────────────────────────────────────────
log_step "BƯỚC 3: Tạo thanh toán → Sinh QR SePay"

PAYMENT=$(curl -s -X POST "$BASE_PAYMENT/api/v1/payments/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "X-User-Id: $USER_ID" \
  -d "{\"orderId\":\"$ORDER_ID\",\"amount\":$ORDER_AMOUNT,\"hostId\":\"$HOST_ID\"}")

PAY_SUCCESS=$(echo "$PAYMENT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('success',''))" 2>/dev/null)
PAYMENT_ID=$(echo "$PAYMENT" | python3 -c "import sys,json; d=json.load(sys.stdin).get('data',{}); print(d.get('paymentId','') or d.get('id',''))" 2>/dev/null)
QR_URL=$(echo "$PAYMENT" | python3 -c "import sys,json; d=json.load(sys.stdin).get('data',{}); print(d.get('qrCodeUrl','') or d.get('qrUrl',''))" 2>/dev/null)
PAY_CODE=$(echo "$PAYMENT" | python3 -c "import sys,json; d=json.load(sys.stdin).get('data',{}); print(d.get('paymentCode','') or d.get('referenceCode',''))" 2>/dev/null)
BANK_ACC=$(echo "$PAYMENT" | python3 -c "import sys,json; d=json.load(sys.stdin).get('data',{}); print(d.get('bankAccount',''))" 2>/dev/null)
BANK_NAME=$(echo "$PAYMENT" | python3 -c "import sys,json; d=json.load(sys.stdin).get('data',{}); print(d.get('bankName',''))" 2>/dev/null)
EXPIRES=$(echo "$PAYMENT" | python3 -c "import sys,json; d=json.load(sys.stdin).get('data',{}); print(d.get('expiresAt',''))" 2>/dev/null)

if [ "$PAY_SUCCESS" = "True" ] || [ "$PAY_SUCCESS" = "true" ]; then
  log_ok "Tạo thanh toán thành công!"
else
  echo -e "${RED}  ❌ Lỗi tạo thanh toán:${NC}"
  echo "$PAYMENT" | python3 -m json.tool 2>/dev/null
  exit 1
fi

# ─── HIỆN THÔNG TIN THANH TOÁN ────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║              💳 THÔNG TIN THANH TOÁN 💳                  ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${CYAN}  Payment ID  :${NC} ${YELLOW}$PAYMENT_ID${NC}"
echo -e "${CYAN}  Order ID    :${NC} ${YELLOW}$ORDER_ID${NC}"
echo -e "${CYAN}  Số tiền     :${NC} ${YELLOW}$(python3 -c "print(f'{int($ORDER_AMOUNT):,}')") VNĐ${NC}"
echo -e "${CYAN}  Ngân hàng   :${NC} ${YELLOW}$BANK_NAME${NC}"
echo -e "${CYAN}  Số TK       :${NC} ${YELLOW}$BANK_ACC${NC}"
echo -e "${CYAN}  Nội dung CK :${NC} ${BOLD}${YELLOW}$PAY_CODE${NC}  ← BẮT BUỘC ghi đúng"
echo -e "${CYAN}  Hết hạn     :${NC} ${YELLOW}$EXPIRES${NC}"

echo ""
echo -e "${GREEN}  🔗 URL ảnh QR:${NC}"
echo -e "  ${BLUE}$QR_URL${NC}"

# Mở QR trong browser nếu có
if command -v open &>/dev/null; then
  echo ""
  echo -e "${YELLOW}  → Đang mở QR trong trình duyệt...${NC}"
  open "$QR_URL" 2>/dev/null &
fi

# ─── HƯỚNG DẪN THANH TOÁN ────────────────────────────────
echo ""
echo -e "${BOLD}${YELLOW}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║         📱 HƯỚNG DẪN THANH TOÁN (TEST MODE) 📱           ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${BOLD}⚠️  TẠI SAO QUÉT QR BỊ LỖI?${NC}"
echo ""
echo "  SePay Test Mode dùng tài khoản ảo (Virtual Account)."
echo "  Khi quét QR bằng app ngân hàng thật → ngân hàng báo lỗi vì"
echo "  số TK '$BANK_ACC' không phải tài khoản thật."
echo "  Đây là HÀNH VI BÌNH THƯỜNG trong test mode."
echo ""

echo -e "${BOLD}${GREEN}✅ CÁCH ĐỂ TEST THANH TOÁN ĐÚNG CÁCH:${NC}"
echo ""

echo -e "${CYAN}  ── Cách 1: Mô phỏng qua SePay Dashboard (Dễ nhất) ──${NC}"
echo "  1. Truy cập: ${BLUE}https://my.sepay.vn${NC}"
echo "  2. Đăng nhập tài khoản SePay"
echo "  3. Vào menu: ${YELLOW}Mô phỏng giao dịch${NC} hoặc ${YELLOW}Transactions → Simulate${NC}"
echo "  4. Điền thông tin:"
echo -e "     • Số tài khoản: ${YELLOW}$BANK_ACC${NC}"
echo -e "     • Số tiền     : ${YELLOW}$(python3 -c "print(f'{int($ORDER_AMOUNT):,}')")${NC}"
echo -e "     • Nội dung    : ${BOLD}${YELLOW}$PAY_CODE${NC}  ← QUAN TRỌNG"
echo "  5. Bấm Simulate → Hệ thống tự gọi webhook về GoStay"
echo ""

echo -e "${CYAN}  ── Cách 2: Gọi webhook thủ công qua API ──${NC}"
echo "  Chạy lệnh sau để giả lập SePay gọi về:"
echo ""
echo -e "${YELLOW}  curl -X POST http://localhost:8085/api/v1/public/payments/sepay-webhook \\${NC}"
echo -e "${YELLOW}    -H 'Content-Type: application/json' \\${NC}"
echo -e "${YELLOW}    -d '{${NC}"
echo -e "${YELLOW}      \"id\": 999,${NC}"
echo -e "${YELLOW}      \"gateway\": \"BIDV\",${NC}"
echo -e "${YELLOW}      \"transactionDate\": \"$(date '+%Y-%m-%d %H:%M:%S')\",${NC}"
echo -e "${YELLOW}      \"accountNumber\": \"$BANK_ACC\",${NC}"
echo -e "${YELLOW}      \"content\": \"Thanh toan $PAY_CODE don hang\",${NC}"
echo -e "${YELLOW}      \"transferType\": \"in\",${NC}"
echo -e "${YELLOW}      \"transferAmount\": $ORDER_AMOUNT,${NC}"
echo -e "${YELLOW}      \"accumulated\": $ORDER_AMOUNT,${NC}"
echo -e "${YELLOW}      \"referenceCode\": \"FT$(date +%s)\",${NC}"
echo -e "${YELLOW}      \"description\": \"Thanh toan $PAY_CODE\"${NC}"
echo -e "${YELLOW}    }'${NC}"
echo ""

# ─── TỰ ĐỘNG SIMULATE WEBHOOK ────────────────────────────
echo -e "${CYAN}  ── Tự động giả lập ngay? ──${NC}"
echo -n "  Bạn có muốn giả lập thanh toán ngay bây giờ không? [y/N]: "
read -r CONFIRM

if [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
  echo ""
  echo -e "${YELLOW}  → Đang gửi webhook giả lập...${NC}"
  
  WEBHOOK=$(curl -s -X POST "$BASE_PAYMENT/api/v1/public/payments/sepay-webhook" \
    -H "Content-Type: application/json" \
    -d "{
      \"id\": $(date +%s%N | cut -c1-9),
      \"gateway\": \"$BANK_NAME\",
      \"transactionDate\": \"$(date '+%Y-%m-%d %H:%M:%S')\",
      \"accountNumber\": \"$BANK_ACC\",
      \"content\": \"Thanh toan $PAY_CODE\",
      \"transferType\": \"in\",
      \"transferAmount\": $ORDER_AMOUNT,
      \"accumulated\": $ORDER_AMOUNT,
      \"referenceCode\": \"FT$(date +%s)\",
      \"description\": \"Thanh toan don hang GoStay $PAY_CODE\"
    }")
  
  echo "$WEBHOOK" | python3 -m json.tool 2>/dev/null || echo "$WEBHOOK"
  
  WEBHOOK_OK=$(echo "$WEBHOOK" | python3 -c "import sys,json; print(json.load(sys.stdin).get('success',''))" 2>/dev/null)
  
  if [[ "$WEBHOOK_OK" =~ [Tt]rue ]]; then
    echo ""
    log_ok "✨ Webhook thành công! Thanh toán đã được xử lý!"
    
    echo ""
    log_step "Kiểm tra trạng thái payment sau khi thanh toán"
    sleep 1
    
    STATUS=$(curl -s "$BASE_PAYMENT/api/v1/payments/$PAYMENT_ID" \
      -H "Authorization: Bearer $USER_TOKEN")
    echo "$STATUS" | python3 -m json.tool 2>/dev/null
    
    PAY_STATUS=$(echo "$STATUS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('status',''))" 2>/dev/null)
    log_ok "Trạng thái Payment: ${BOLD}$PAY_STATUS${NC}"
    
    log_step "Kiểm tra Order sau thanh toán"
    ORDER_STATUS=$(curl -s "$BASE_CART/api/v1/orders/$ORDER_ID" \
      -H "Authorization: Bearer $USER_TOKEN" \
      -H "X-User-Id: $USER_ID")
    echo "$ORDER_STATUS" | python3 -m json.tool 2>/dev/null
    
  else
    echo -e "${RED}  ❌ Webhook thất bại:${NC}"
    echo "$WEBHOOK" | python3 -m json.tool 2>/dev/null
  fi
fi

# ─── TỔNG KẾT ─────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                  📋 TÓM TẮT THÔNG TIN 📋                 ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo -e "  Order ID    : ${YELLOW}$ORDER_ID${NC}"
echo -e "  Payment ID  : ${YELLOW}$PAYMENT_ID${NC}"
echo -e "  Mã CK       : ${BOLD}${YELLOW}$PAY_CODE${NC}"
echo -e "  QR URL      : ${BLUE}$QR_URL${NC}"
echo ""
echo -e "${GREEN}  💡 SePay Test Mode hoạt động như thế nào:${NC}"
echo "  ┌─────────────┐    webhook     ┌──────────────────┐"
echo "  │ SePay Dashboard │ ──────────→ │ GoStay :8085      │"
echo "  │ Simulate TX   │             │ /sepay-webhook    │"
echo "  └─────────────┘             └──────────────────┘"
echo "        ↑                              ↓"
echo "  Bạn bấm nút              Hệ thống cập nhật"
echo "  'Mô phỏng'               đơn hàng CONFIRMED"
echo ""
