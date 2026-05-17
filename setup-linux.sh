#!/bin/bash

# ==============================================================================
# GoStay System Setup Script for Ubuntu/Debian Linux (NATIVE/NO DOCKER)
# Môi trường gồm: Java 17, Node.js 20, PostgreSQL 15+, PM2
# ==============================================================================

set -e # Dừng script nếu có lỗi xảy ra

echo "==========================================================="
echo "BẮT ĐẦU CÀI ĐẶT MÔI TRƯỜNG CHO HỆ THỐNG GOSTAY"
echo "==========================================================="

# 1. Cập nhật hệ thống
echo "[1/7] Cập nhật các gói hệ thống..."
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y curl wget wget gnupg2 software-properties-common apt-transport-https

# 2. Cài đặt Java 17 (Cho Identity Service)
echo "[2/7] Cài đặt OpenJDK 17..."
sudo apt-get install -y openjdk-17-jdk
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
echo "export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64" >> ~/.bashrc
export PATH=$PATH:$JAVA_HOME/bin

# 3. Cài đặt Node.js 20 (Cho APIGateway, Cloudinary Service và Dashboard)
echo "[3/7] Cài đặt Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
# Cài đặt PM2 để chạy tiến trình nền
sudo npm install -g pm2

# 4. Cài đặt và cấu hình PostgreSQL
echo "[4/7] Cài đặt PostgreSQL..."
sudo apt-get install -y postgresql postgresql-contrib

echo "Khởi động DB..."
if command -v systemctl >/dev/null 2>&1; then
    sudo systemctl enable postgresql
    sudo systemctl start postgresql
else
    sudo service postgresql start
fi

echo "Cấu hình Database và User cho Identity Service..."
# Dùng bash shell của quyền root để su sang postgres (tránh lỗi permission denied trên Codespaces)
sudo bash -c 'su - postgres -c "psql -c \"DROP DATABASE IF EXISTS auth_db;\""'
sudo bash -c 'su - postgres -c "psql -c \"DROP ROLE IF EXISTS gotravel_db;\""'

# Tạo user gotravel_db / pass: 123456 và database auth_db theo file database.yaml
sudo bash -c 'su - postgres -c "psql -c \"CREATE USER gotravel_db WITH PASSWORD '\'123456'\';\""'
sudo bash -c 'su - postgres -c "psql -c \"CREATE DATABASE auth_db OWNER gotravel_db;\""'
sudo bash -c 'su - postgres -c "psql -c \"GRANT ALL PRIVILEGES ON DATABASE auth_db TO gotravel_db;\""'
sudo bash -c 'su - postgres -c "psql -c \"ALTER DATABASE auth_db OWNER TO gotravel_db;\""'

# 5. Build Identity Service (Java / Spring Boot)
echo "[5/7] Build Identity Service..."
cd Identity
chmod +x mvnw
./mvnw clean compile package -DskipTests
cd ..

# 6. Cài đặt thư viện cho các service NodeJS
echo "[6/7] Cài đặt NPM Packages cho APIGateway..."
cd APIGateway
npm install
cd ..

echo "Cài đặt NPM Packages cho Cloudinary Service..."
cd cloudinary-service
npm install
cd ..

echo "Cài đặt NPM Packages cho API Test Dashboard..."
cd Identity/api-test-dashboard
npm install
npm run build
cd ../..

# 7. Tạo script chạy (Start Script)
echo "[7/7] Tạo file khởi động hệ thống start-all.sh"
cat << 'EOF' > start-all.sh
#!/bin/bash
echo "Khởi động Identity Service (Java)..."
nohup java -jar Identity/target/Identity-0.0.1-SNAPSHOT.jar > identity.log 2>&1 &
IDENTITY_PID=$!
echo "Identity Service chạy phân luồng (PID: $IDENTITY_PID) - log: identity.log"

echo "Đợi 15s để Identity Service khởi động xong..."
sleep 15

echo "Khởi động API Gateway (NodeJS) bằng PM2..."
cd APIGateway && pm2 start server.js --name "APIGateway" && cd ..

echo "Khởi động Cloudinary Service (NodeJS) bằng PM2..."
cd cloudinary-service && pm2 start src/media-server.js --name "CloudinaryService" && cd ..

echo "Hệ thống đã được bật! Dùng lệnh 'pm2 status' để xem NodeJS"
echo "Dùng 'tail -f identity.log' để xem log Spring Boot"
EOF
chmod +x start-all.sh

echo "==========================================================="
echo "✅ HOÀN TẤT CÀI ĐẶT MÔI TRƯỜNG!"
echo "- Java: $(java -version 2>&1 | head -n 1)"
echo "- Node.js: $(node -v)"
echo "- Database auth_db đã được tạo."
echo ""
echo "🔥 ĐỂ KHỞI ĐỘNG HỆ THỐNG: Hãy chạy lệnh './start-all.sh'"
echo "==========================================================="
