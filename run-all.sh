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

APP_NAME="gostay"

# ─── 1. Build Java Services ──────────────────────────────────
build_java() {
    info "Building Java services..."
    for svc in Identity CatalogandListing BookingandInventory CartandOrder PaymentandWallet; do
        info "Building $svc..."
        (cd "$svc" && chmod +x mvnw && ./mvnw clean package -DskipTests -q)
        log "$svc built"
    done
}

# ─── 2. Install Node.js Dependencies ─────────────────────────
build_node() {
    info "Installing Node.js dependencies..."
    for svc in APIGateway cloudinary-service search-and-recommendation; do
        info "npm install $svc..."
        (cd "$svc" && npm install --silent)
        log "$svc dependencies installed"
    done
}

# ─── 3. Build Frontend ───────────────────────────────────────
build_frontend() {
    info "Building front_end..."
    (cd front_end && npm install --silent && npm run build)
    log "front_end built"
}

# ─── 4. Start All Services via PM2 ──────────────────────────
start_all() {
    info "Starting all services via PM2..."

    # Ensure PM2 is installed
    if ! command -v pm2 &>/dev/null; then
        info "Installing PM2 globally..."
        npm install -g pm2
    fi

    # Stop previous instances if any
    pm2 delete "$APP_NAME" 2>/dev/null || true

    # Java services
    pm2 start java --name "${APP_NAME}-identity" \
        -- --jar Identity/target/Identity-0.0.1-SNAPSHOT.jar \
        --spring.profiles.active=dev
    sleep 2

    pm2 start java --name "${APP_NAME}-catalog" \
        -- --jar CatalogandListing/target/CatalogandListing-0.0.1-SNAPSHOT.jar \
        --spring.profiles.active=dev
    sleep 2

    pm2 start java --name "${APP_NAME}-booking" \
        -- --jar BookingandInventory/target/BookingandInventory-0.0.1-SNAPSHOT.jar \
        --spring.profiles.active=dev
    sleep 2

    pm2 start java --name "${APP_NAME}-cartorder" \
        -- --jar CartandOrder/target/CartandOrder-0.0.1-SNAPSHOT.jar \
        --spring.profiles.active=dev
    sleep 2

    pm2 start java --name "${APP_NAME}-payment" \
        -- --jar PaymentandWallet/target/PaymentandWallet-0.0.1-SNAPSHOT.jar \
        --spring.profiles.active=dev
    sleep 2

    # Node.js services
    pm2 start APIGateway/src/server.js --name "${APP_NAME}-apigateway" \
        --cwd "$PROJECT_DIR/APIGateway"
    sleep 1

    pm2 start cloudinary-service/src/server.js --name "${APP_NAME}-cloudinary" \
        --cwd "$PROJECT_DIR/cloudinary-service"
    sleep 1

    pm2 start search-and-recommendation/dist/main.js --name "${APP_NAME}-search" \
        --cwd "$PROJECT_DIR/search-and-recommendation" || {
        warn "search-and-recommendation dist not found, trying npm run start:prod..."
        pm2 start npm --name "${APP_NAME}-search" \
            --cwd "$PROJECT_DIR/search-and-recommendation" \
            -- run start:prod
    }
    sleep 1

    # Frontend (Next.js)
    pm2 start npm --name "${APP_NAME}-frontend" \
        --cwd "$PROJECT_DIR/front_end" \
        -- run start

    log "All services started via PM2"
    echo ""
    pm2 list
    echo ""
    info "Logs: pm2 logs ${APP_NAME}"
    info "Status: pm2 status"
    info "Stop: pm2 delete ${APP_NAME}"
}

# ─── 5. Stop All ─────────────────────────────────────────────
stop_all() {
    info "Stopping all services..."
    pm2 delete "$APP_NAME" 2>/dev/null || true
    log "All services stopped"
}

# ─── 6. Show Logs ───────────────────────────────────────────
show_logs() {
    pm2 logs "$APP_NAME"
}

# ─── Main ────────────────────────────────────────────────────
usage() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  build       Build all services (Java jars + npm install + frontend)"
    echo "  start       Start all services via PM2"
    echo "  stop        Stop all services"
    echo "  restart     Rebuild + restart all services"
    echo "  logs        Tail PM2 logs"
    echo "  status      Show PM2 process list"
    echo "  all         build + start"
}

case "${1:-all}" in
    build)
        build_java
        build_node
        build_frontend
        log "Build complete"
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
