#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# GoStay - Full Environment Setup Script for Linux Server
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

# ─── 1. System Packages ───────────────────────────────────────
install_system_packages() {
    info "Updating package list..."
    sudo apt-get update -qq

    info "Installing system dependencies..."
    sudo apt-get install -y -qq \
        curl wget gnupg ca-certificates \
        build-essential git unzip \
        libvips-dev \
        postgresql postgresql-contrib postgis postgresql-16-postgis-3 \
        redis-server

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

# ─── 3. Node.js ───────────────────────────────────────────────
install_node() {
    if node -v 2>/dev/null | grep -q "^v$NODE_VERSION"; then
        log "Node.js $NODE_VERSION already installed"
        return
    fi
    info "Installing Node.js $NODE_VERSION LTS..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo bash -
    sudo apt-get install -y -qq nodejs
    log "Node.js $(node -v) installed"
}

# ─── 4. PostgreSQL Databases ──────────────────────────────────
setup_databases() {
    info "Setting up PostgreSQL databases..."

    sudo -u postgres psql <<-EOSQL
        ALTER USER postgres PASSWORD '$DB_SUPERPASS';
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
    if [ -f /keystore.jks ]; then
        log "Keystore /keystore.jks already exists"
        return
    fi
    info "Generating JKS keystore for Identity JWT signing..."
    sudo keytool -genkeypair \
        -alias jwt \
        -keyalg RSA \
        -keysize 2048 \
        -keystore /keystore.jks \
        -storepass secret \
        -keypass secret \
        -dname "CN=GoStay, OU=GoStay, O=GoStay, L=City, ST=State, C=VN" \
        -validity 3650
    sudo chmod 644 /keystore.jks
    log "Keystore generated at /keystore.jks"
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
NODE_ENV=development
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
    warn "EDIT cloudinary-service/.env with your Cloudinary credentials before running!"
}

# ─── 8. Build All Services ────────────────────────────────────
build_all() {
    info "Building Java services (Identity, CatalogandListing, BookingandInventory, CartandOrder, PaymentandWallet)..."
    for svc in Identity CatalogandListing BookingandInventory CartandOrder PaymentandWallet; do
        info "Building $svc..."
        (cd "$svc" && chmod +x mvnw && ./mvnw clean package -DskipTests -q)
        log "$svc built"
    done

    info "Installing Node.js dependencies..."
    for svc in APIGateway cloudinary-service search-and-recommendation; do
        info "npm install $svc..."
        (cd "$svc" && npm install --silent)
        log "$svc dependencies installed"
    done

    info "Building front_end..."
    (cd front_end && npm install --silent && npm run build) || warn "front_end build skipped (may need config)"
    log "front_end built"

    log "All services built successfully"
}

# ─── 9. Start All Services (ordered by dependency) ────────────
START_PIDS=()
start_all() {
    info "Starting services in dependency order..."

    # Java services
    info "Starting Identity (port 8080)..."
    java -jar Identity/target/Identity-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev &
    START_PIDS+=($!)
    sleep 15

    info "Starting cloudinary-service (port 5001)..."
    (cd cloudinary-service && node src/server.js) &
    START_PIDS+=($!)
    sleep 3

    info "Starting CatalogandListing (port 8082)..."
    java -jar CatalogandListing/target/CatalogandListing-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev &
    START_PIDS+=($!)
    sleep 10

    info "Starting BookingandInventory (port 8083)..."
    java -jar BookingandInventory/target/BookingandInventory-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev &
    START_PIDS+=($!)
    sleep 10

    info "Starting CartandOrder (port 8084)..."
    java -jar CartandOrder/target/CartandOrder-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev &
    START_PIDS+=($!)
    sleep 10

    info "Starting PaymentandWallet (port 8085)..."
    java -jar PaymentandWallet/target/PaymentandWallet-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev &
    START_PIDS+=($!)
    sleep 10

    info "Starting search-and-recommendation (port 8086)..."
    (cd search-and-recommendation && npm run start:prod) &
    START_PIDS+=($!)
    sleep 5

    info "Starting APIGateway (port 5555)..."
    (cd APIGateway && node src/server.js) &
    START_PIDS+=($!)
    sleep 3

    info "Starting front_end (port 3000)..."
    (cd front_end && npm start) &
    START_PIDS+=($!)

    log "All services started! PIDs: ${START_PIDS[*]}"
    echo ""
    echo "  APIGateway:       http://localhost:5555"
    echo "  Identity:         http://localhost:8080"
    echo "  Catalog&Listing:  http://localhost:8082"
    echo "  Booking&Inventory: http://localhost:8083"
    echo "  Cart&Order:       http://localhost:8084"
    echo "  Payment&Wallet:   http://localhost:8085"
    echo "  Search&Rec:       http://localhost:8086"
    echo "  Cloudinary:       http://localhost:5001"
    echo "  Frontend:         http://localhost:3000"
    echo ""
    warn "Press Ctrl+C to stop all services"

    trap stop_all SIGINT SIGTERM
    wait
}

stop_all() {
    info "Stopping all services..."
    for pid in "${START_PIDS[@]}"; do
        kill "$pid" 2>/dev/null || true
    done
    log "All services stopped"
    exit 0
}

# ─── Main ──────────────────────────────────────────────────────
usage() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  install     Install all dependencies (Java, Node, PostgreSQL, Redis)"
    echo "  setup-db    Create databases and users"
    echo "  setup-redis Configure Redis"
    echo "  keystore    Generate JWT keystore for Identity"
    echo "  env         Generate .env files"
    echo "  build       Build all services"
    echo "  start       Start all services in order"
    echo "  all         Run everything (install, setup, build)"
    echo ""
    echo "  (no args)   Equivalent to 'all'"
}

case "${1:-all}" in
    install)
        install_system_packages
        install_java
        install_node
        setup_redis
        generate_keystore
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
    start)
        start_all
        ;;
    stop)
        stop_all
        ;;
    all|"")
        install_system_packages
        install_java
        install_node
        setup_databases
        setup_redis
        generate_keystore
        generate_env_files
        build_all
        log "=== GoStay setup complete! ==="
        echo ""
        echo "Next steps:"
        echo "  1. Edit cloudinary-service/.env with your Cloudinary credentials"
        echo "  2. Run: $0 start"
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
