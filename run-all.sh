#!/bin/bash
set -euo pipefail

# ============================================================
# GoStay - Build & Run All Services with PM2
# ============================================================

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; }
info() { echo -e "${CYAN}[i]${NC} $1"; }

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

APP_PREFIX="gostay"

# Đảm bảo PM2 đã được cài đặt
if ! command -v pm2 &> /dev/null; then
    err "PM2 is not installed. Please run setup-linux.sh first or install it manually via: npm install -g pm2"
    exit 1
fi

# ─── 1. Build Java Services ──────────────────────────────────
build_java() {
    info "Building Java services..."
    for svc in Identity CatalogandListing BookingandInventory CartandOrder PaymentandWallet; do
        info "Building $svc..."
        (cd "$svc" && chmod +x mvnw && ./mvnw clean package -DskipTests -q)
        log "$svc built successfully"
    done
}

# ─── 2. Install Node.js Dependencies & Build ─────────────────
build_node() {
    info "Installing and building Node.js services..."
    for svc in APIGateway cloudinary-service search-and-recommendation; do
        info "Running npm install for $svc..."
        (cd "$svc" && npm install --silent)
        
        # Đặc thù cho NestJS: Cần build ra thư mục dist/
        if [ "$svc" == "search-and-recommendation" ]; then
            info "Building NestJS source for $svc..."
            (cd "$svc" && npm run build --silent)
        fi
        log "$svc prepared"
    done
}

# ─── 3. Build Frontend ───────────────────────────────────────
build_frontend() {
    info "Building Next.js frontend..."
    (cd front_end && npm install --silent && npm run build)
    log "Frontend built successfully"
}

# ─── Helper Functions cho PM2 ────────────────────────────────
start_java_service() {
    local svc_name=$1
    local dir=$2
    
    # Tìm chính xác tên file jar (tránh lỗi wildcard của PM2)
    local jar_file
    jar_file=$(find "$dir/target" -maxdepth 1 -name "*.jar" ! -name "*plain.jar" | head -n 1)
    
    if [ -z "$jar_file" ]; then
        err "No JAR file found in $dir/target. Please build first."
        return
    fi

    info "Starting $svc_name..."
    pm2 start java --name "${APP_PREFIX}-${svc_name}" -- -jar "$jar_file"
}

start_node_service() {
    local svc_name=$1
    local dir=$2
    local entry_script=$3
    
    info "Starting $svc_name..."
    pm2 start "$entry_script" --name "${APP_PREFIX}-${svc_name}" --cwd "$dir"
}

start_nextjs_service() {
    local svc_name=$1
    local dir=$2
    
    info "Starting $svc_name..."
    pm2 start npm --name "${APP_PREFIX}-${svc_name}" --cwd "$dir" -- run start
}

# ─── 4. Start All Services ───────────────────────────────────
start_all() {
    info "Starting all services with PM2..."

    # Khởi động Backend Services (Java)
    start_java_service "identity" "Identity"
    start_java_service "catalog" "CatalogandListing"
    start_java_service "booking" "BookingandInventory"
    start_java_service "cart" "CartandOrder"
    start_java_service "payment" "PaymentandWallet"

    # Khởi động Backend Services (Node/Nest)
    start_node_service "media" "cloudinary-service" "src/media-server.js"
    start_node_service "search" "search-and-recommendation" "dist/src/main.js"
    
    # Khởi động API Gateway
    start_node_service "gateway" "APIGateway" "server.js"

    # Khởi động Frontend
    start_nextjs_service "frontend" "front_end"

    # Lưu cấu hình PM2 để tự động chạy lại khi server khởi động lại
    pm2 save

    log "All services have been issued start commands!"
    echo "================================================="
    pm2 status
}

# ─── 5. Stop All ─────────────────────────────────────────────
stop_all() {
    info "Stopping all GoStay services..."
    pm2 delete all 2>/dev/null || true
    log "All services stopped and removed from PM2"
}

# ─── 6. Show Logs ───────────────────────────────────────────
show_logs() {
    pm2 logs
}

# ─── Main ────────────────────────────────────────────────────
usage() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  build       Build all services (Java jars + npm install + Next build)"
    echo "  start       Start all services via PM2"
    echo "  stop        Stop and remove all services from PM2"
    echo "  restart     Rebuild + restart all services"
    echo "  logs        Tail PM2 logs for all services"
    echo "  status      Show PM2 process list"
    echo "  all         build + start"
}

case "${1:-all}" in
    build)
        build_java
        build_node
        build_frontend
        log "Build phase complete"
        ;;
    start)
        start_all
        ;;
    stop)
        stop_all
        ;;
    restart)
        stop_all
        build_java
        build_node
        build_frontend
        start_all
        ;;
    logs)
        show_logs
        ;;
    status)
        pm2 status
        ;;
    all|"")
        stop_all
        build_java
        build_node
        build_frontend
        start_all
        ;;
    help|--help|-h)
        usage
        ;;
    *)
        err "Unknown command: $1"
        usage
        exit 1
        ;;
esac