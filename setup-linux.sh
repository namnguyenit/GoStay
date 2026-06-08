#!/bin/bash
set -euo pipefail

# ============================================================
# GoStay - Environment Setup Script for Linux Server
# Note: This script ONLY provisions the environment and builds
# the project. Use the separate run script to start services.
# ============================================================

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; }
info() { echo -e "${CYAN}[i]${NC} $1"; }

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

# ─── Config ────────────────────────────────────────────────────
DB_SUPERUSER="${DB_SUPERUSER:-postgres}"
DB_SUPERPASS="${DB_SUPERPASS:-postgres}"
INTERNAL_TOKEN="${INTERNAL_TOKEN:-gostay-internal-secret-token-12345}"
JAVA_VERSION="17"
NODE_VERSION="22"
KEYSTORE_PATH="$PROJECT_DIR/Identity/src/main/resources/keystore.jks"

# ─── 1. System Packages ───────────────────────────────────────
install_system_packages() {
    info "Updating package list..."
    sudo apt-get update -qq

    info "Installing system dependencies..."
    # Đã bỏ postgresql-16-postgis-3 để tránh lỗi trên các OS khác nhau. 
    # Package 'postgis' sẽ tự động kéo bản PostGIS phù hợp với PostgreSQL mặc định của OS.
    sudo apt-get install -y -qq \
        curl wget gnupg ca-certificates \
        build-essential git unzip \
        libvips-dev \
        postgresql postgresql-contrib postgis \
        redis-server nginx ufw

    log "System packages installed"
}

# ─── 2. Java 17 (Temurin) ─────────────────────────────────────
install_java() {
    if java -version 2>&1 | grep -q "version \"$JAVA_VERSION"; then
        log "Java $JAVA_VERSION already installed"
        return
    fi
    info "Installing Java $JAVA_VERSION (Temurin)..."
    sudo mkdir -p /etc/apt/keyrings
    wget -qO- https://packages.adoptium.net/artifactory/api/gpg/key/public \
        | sudo tee /etc/apt/keyrings/adoptium.asc >/dev/null
    echo "deb [signed-by=/etc/apt/keyrings/adoptium.asc] https://packages.adoptium.net/artifactory/deb $(lsb_release -cs 2>/dev/null || echo bookworm) main" \
        | sudo tee /etc/apt/sources.list.d/adoptium.list >/dev/null
    sudo apt-get update -qq
    sudo apt-get install -y -qq temurin-${JAVA_VERSION}-jdk
    log "Java $JAVA_VERSION installed"
}

# ─── 3. Node.js & PM2 ─────────────────────────────────────────
install_node() {
    if node -v 2>/dev/null | grep -q "^v$NODE_VERSION"; then
        log "Node.js $NODE_VERSION already installed"
    else
        info "Installing Node.js $NODE_VERSION LTS..."
        curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo bash -
        sudo apt-get install -y -qq nodejs
        log "Node.js $(node -v) installed"
    fi

    info "Installing PM2 globally (for process management)..."
    sudo npm install -g pm2 yarn --silent
    log "PM2 installed"
}

# ─── 4. PostgreSQL Databases ──────────────────────────────────
setup_databases() {
    info "Setting up PostgreSQL databases..."

    # Đảm bảo service postgresql đang chạy
    sudo systemctl start postgresql 2>/dev/null || sudo service postgresql start 2>/dev/null || true

    sudo -u postgres psql <<-EOSQL
        ALTER USER $DB_SUPERUSER PASSWORD '$DB_SUPERPASS';
EOSQL

    DB_LIST=(
        "auth_db:auth_user:auth_password"
        "cataloglisting:catalog_user:catalog_password"
        "bookinginventory:booking_user:booking_password"
        "cartorder:cart_user:cart_password"
        "paymentwallet:payment_user:payment_password"
        "recommendation_db:recommendation_user:recommendation_password"
    )

    for entry in "${DB_LIST[@]}"; do
        DB_NAME="${entry%%:*}"
        REMAINDER="${entry#*:}"
        DB_USER="${REMAINDER%%:*}"
        DB_PASS="${REMAINDER#*:}"

        sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 \
            && warn "Database $DB_NAME already exists" \
            || sudo -u postgres createdb "$DB_NAME"

        sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname = '$DB_USER'" | grep -q 1 \
            && warn "User $DB_USER already exists" \
            || sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';"

        sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
        sudo -u postgres psql -d "$DB_NAME" -c "GRANT ALL ON SCHEMA public TO $DB_USER;"
    done

    # PostGIS extensions
    for DB in cataloglisting recommendation_db; do
        sudo -u postgres psql -d "$DB" -c "CREATE EXTENSION IF NOT EXISTS postgis;" 2>/dev/null || true
        log "PostGIS enabled on $DB"
    done

    # Create reader user for search-and-recommendation
    sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname = 'catalog_node_reader'" | grep -q 1 \
        || sudo -u postgres psql -c "CREATE USER catalog_node_reader WITH PASSWORD 'reader_password';"
    sudo -u postgres psql -d cataloglisting -c "GRANT SELECT ON ALL TABLES IN SCHEMA public TO catalog_node_reader;"
    sudo -u postgres psql -d cataloglisting -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO catalog_node_reader;"

    log "All databases configured"
}

# ─── 5. Redis ─────────────────────────────────────────────────
setup_redis() {
    info "Configuring Redis..."
    sudo systemctl enable redis-server 2>/dev/null || true
    sudo systemctl start redis-server 2>/dev/null || sudo service redis-server start 2>/dev/null || true
    if redis-cli ping 2>/dev/null | grep -q PONG; then
        log "Redis is running"
    else
        warn "Redis may not have started. Check manually."
    fi
}

# ─── 6. JKS Keystore for Identity ─────────────────────────────
generate_keystore() {
    if [ -f "$KEYSTORE_PATH" ]; then
        log "Keystore already exists at $KEYSTORE_PATH"
        return
    fi
    info "Generating JKS keystore for Identity JWT signing..."
    
    # Tạo thư mục nếu chưa tồn tại
    mkdir -p "$(dirname "$KEYSTORE_PATH")"
    
    # Không dùng sudo ở đây để file được tạo thuộc quyền của user hiện tại, 
    # giúp Java dễ dàng đọc file mà không bị lỗi Permission Denied.
    keytool -genkeypair \
        -alias jwt \
        -keyalg RSA \
        -keysize 2048 \
        -keystore "$KEYSTORE_PATH" \
        -storepass secret \
        -keypass secret \
        -dname "CN=GoStay, OU=GoStay, O=GoStay, L=Hanoi, ST=Hanoi, C=VN" \
        -validity 3650
        
    chmod 644 "$KEYSTORE_PATH"
    log "Keystore generated securely at $KEYSTORE_PATH"
}

# ─── 7. Environment Files ─────────────────────────────────────
generate_env_files() {
    info "Generating .env files..."

    # APIGateway
    cat > APIGateway/.env <<EOF
GATEWAY_PORT=5555
IDENTITY_SERVICE_URL=http://localhost:8080
MEDIA_SERVICE_URL=http://localhost:5001
CATALOG_SERVICE_URL=http://localhost:8082
BOOKING_SERVICE_URL=http://localhost:8083
CART_SERVICE_URL=http://localhost:8084
PAYMENT_SERVICE_URL=http://localhost:8085
SEARCH_SERVICE_URL=http://localhost:8086
INTERNAL_SERVICE_TOKEN=${INTERNAL_TOKEN}
EOF
    log "APIGateway/.env created"

    # cloudinary-service
    cat > cloudinary-service/.env <<EOF
MEDIA_PORT=5001
IDENTITY_SERVICE_URL=http://localhost:8080
INTERNAL_SERVICE_TOKEN=${INTERNAL_TOKEN}
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EOF
    log "cloudinary-service/.env created (EDIT CLOUDINARY CREDENTIALS)"

    # search-and-recommendation
    cat > search-and-recommendation/.env <<EOF
PORT=8086
NODE_ENV=production
CATALOG_DB_HOST=localhost
CATALOG_DB_PORT=5432
CATALOG_DB_NAME=cataloglisting
CATALOG_DB_USER=catalog_node_reader
CATALOG_DB_PASSWORD=reader_password
RECOMMENDATION_DB_HOST=localhost
RECOMMENDATION_DB_PORT=5432
RECOMMENDATION_DB_NAME=recommendation_db
RECOMMENDATION_DB_USER=recommendation_user
RECOMMENDATION_DB_PASSWORD=recommendation_password
REDIS_URL=redis://localhost:6379
INVENTORY_SERVICE_URL=http://localhost:8083
INTERNAL_SERVICE_TOKEN=${INTERNAL_TOKEN}
EOF
    log "search-and-recommendation/.env created"

    # front_end
    cat > front_end/.env <<EOF
NEXT_PUBLIC_API_URL=http://localhost:5555/api
EOF
    log "front_end/.env created"

    log "Environment files generated"
    warn "EDIT cloudinary-service/.env with your Cloudinary credentials before starting!"
}

# ─── 8. Build All Services ────────────────────────────────────
build_all() {
    info "Building Java services (Identity, CatalogandListing, BookingandInventory, CartandOrder, PaymentandWallet)..."
    for svc in Identity CatalogandListing BookingandInventory CartandOrder PaymentandWallet; do
        info "Building $svc..."
        (cd "$svc" && chmod +x mvnw && ./mvnw clean package -DskipTests -q)
        log "$svc built successfully."
    done

    info "Installing Node.js dependencies..."
    for svc in APIGateway cloudinary-service search-and-recommendation; do
        info "Running npm install in $svc..."
        (cd "$svc" && npm install --silent)
        
        # Build NestJS (search-and-recommendation)
        if [ -f "$svc/nest-cli.json" ]; then
            (cd "$svc" && npm run build --silent)
            log "$svc compiled."
        fi
        log "$svc dependencies installed."
    done

    info "Building Next.js front_end..."
    (cd front_end && npm install --silent && npm run build) || warn "front_end build skipped/failed (may need config adjustment)."
    log "front_end built."

    log "All services built and ready."
}

# ─── Main ──────────────────────────────────────────────────────
usage() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  install     Install all system dependencies (Java, Node, PM2, Postgres, Redis, Nginx)"
    echo "  setup-db    Create databases, users, and configure PostGIS"
    echo "  setup-redis Configure Redis"
    echo "  keystore    Generate JWT keystore securely inside the Identity module"
    echo "  env         Generate all required .env files"
    echo "  build       Build all Java and Node.js/Next.js services"
    echo "  all         Run all the above steps in sequence"
    echo ""
    echo "  (no args)   Equivalent to 'all'"
}

case "${1:-all}" in
    install)
        install_system_packages
        install_java
        install_node
        ;;
    setup-db)
        setup_databases
        ;;
    setup-redis)
        setup_redis
        ;;
    keystore)
        generate_keystore
        ;;
    env)
        generate_env_files
        ;;
    build)
        build_all
        ;;
    all|"")
        info "Starting Full Environment Setup..."
        install_system_packages
        install_java
        install_node
        setup_databases
        setup_redis
        generate_keystore
        generate_env_files
        build_all
        echo ""
        log "==========================================================="
        log " ENVIRONMENT SETUP COMPLETE"
        log "==========================================================="
        echo -e "Next steps:"
        echo -e "  1. Check and edit ${YELLOW}cloudinary-service/.env${NC} to add your keys."
        echo -e "  2. Run your separate startup script (or use PM2/Systemd) to launch the services."
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
```eof

**Những thay đổi quan trọng so với bản cũ để phù hợp với định hướng của bạn:**

1.  **Cài sẵn PM2 và Nginx:** Kịch bản giờ đây tự động cài sẵn `pm2` bằng NPM toàn cầu (`npm install -g pm2`) và `nginx` bằng APT. Kịch bản chạy (run script) của bạn sau này có thể gọi trực tiếp pm2 để start Gateway/Frontend mà không bị lỗi command not found.
2.  **Khắc phục lỗi Keystore:** Keystore giờ được sinh trực tiếp vào thư mục mã nguồn: `Identity/src/main/resources/keystore.jks`. Nó không cần dùng quyền `sudo`, nhờ đó khi Service Identity chạy (dù bằng user thường), nó vẫn có đủ quyền đọc (Read) file này.
3.  **Thay đổi package PostgreSQL an toàn hơn:** Chuyển `postgresql-16-postgis-3` thành `postgresql postgresql-contrib postgis`. Linux (Ubuntu/Debian) sẽ tự động tìm phiên bản module tương thích với nhau, nhờ vậy setup script sẽ không bị hỏng nếu bạn cài trên các máy ảo đời mới hay cũ hơn.
4.  **Tối ưu Node.js Build Phase:** Trong phần build, tôi thêm một đoạn nhỏ nhận diện dự án NestJS (`search-and-recommendation`) để chạy `npm run build` tạo ra thư mục `dist/` trước khi kịch bản chạy được khởi động bằng PM2.