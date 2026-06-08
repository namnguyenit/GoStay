# GoStay System Setup Guide (Windows Native)

> [!NOTE]  
> Toàn bộ các database đã được tự động dọn dẹp và chèn sẵn dữ liệu mẫu. Bạn **không cần** phải chạy thêm bất kỳ lệnh khởi tạo dữ liệu DB nào nữa. Tài khoản PostgreSQL sử dụng là `gotravel_db` / `123456`.

Tài liệu này hướng dẫn cách chạy hệ thống trực tiếp trên Windows (không dùng Docker).

---

## 1. Cấu hình Environment Variables (.env)

Hệ thống có nhiều microservices, một số service NodeJS yêu cầu bạn phải tạo file `.env` trước khi chạy. Bạn cần copy nội dung từ `.env.example` sang `.env` ở các thư mục sau:

### 1.1. API Gateway

Tạo file `APIGateway/.env` và thiết lập token nội bộ chung với Spring Boot:

```env
GATEWAY_PORT=5555
IDENTITY_SERVICE_URL=http://localhost:8080
MEDIA_SERVICE_URL=http://localhost:5001
CATALOG_SERVICE_URL=http://localhost:8082
BOOKING_SERVICE_URL=http://localhost:8083
CART_SERVICE_URL=http://localhost:8084
PAYMENT_SERVICE_URL=http://localhost:8085
SEARCH_SERVICE_URL=http://localhost:8086

# Phải khớp với token mặc định của các service Java
INTERNAL_SERVICE_TOKEN=gostay-internal-secret-token-12345
```

### 1.2. Search and Recommendation Service

Tạo file `search-and-recommendation/.env`:

```env
PORT=8086
NODE_ENV=development

CATALOG_DB_HOST=localhost
CATALOG_DB_PORT=5432
CATALOG_DB_NAME=cataloglisting
CATALOG_DB_USER=catalog_node_reader
CATALOG_DB_PASSWORD=secret_password

RECOMMENDATION_DB_HOST=localhost
RECOMMENDATION_DB_PORT=5432
RECOMMENDATION_DB_NAME=recommendation_db
RECOMMENDATION_DB_USER=recommendation_user
RECOMMENDATION_DB_PASSWORD=secret_password

REDIS_URL=redis://localhost:6379

INVENTORY_SERVICE_URL=http://localhost:8083
INTERNAL_SERVICE_TOKEN=gostay-internal-secret-token-12345
```

> [!IMPORTANT]  
> Service này bắt buộc phải có **Redis** chạy ở cổng `6379`. Nếu bạn chưa có Redis trên Windows, bạn có thể tải Redis port cho Windows (Memurai hoặc tải phiên bản MS Open Tech Redis).

### 1.3. Cloudinary Service (Media)

Tạo file `cloudinary-service/.env` và nhập API key Cloudinary của bạn:

```env
MEDIA_PORT=5001
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 2. Khởi động các Microservices Backend (Java)

Bạn mở các cửa sổ Terminal (PowerShell/Command Prompt) khác nhau, cd vào từng thư mục tương ứng và chạy lệnh sau (hoặc đơn giản là mở từng folder bằng IntelliJ/Eclipse và ấn Run):

```powershell
# 1. Identity Service (Port 8080)
cd Identity
.\mvnw spring-boot:run

# 2. Catalog and Listing (Port 8082)
cd CatalogandListing
.\mvnw spring-boot:run

# 3. Booking and Inventory (Port 8083)
cd BookingandInventory
.\mvnw spring-boot:run

# 4. Cart and Order (Port 8084)
cd CartandOrder
.\mvnw spring-boot:run

# 5. Payment and Wallet (Port 8085)
cd PaymentandWallet
.\mvnw spring-boot:run
```

> [!TIP]  
> Lần đầu khởi chạy, bạn có thể thiết lập thêm biến môi trường nếu muốn bootstrap tài khoản Admin ở Identity service:
> `$env:ADMIN_BOOTSTRAP_ENABLED="true"; $env:ADMIN_BOOTSTRAP_USERNAME="admin"; $env:ADMIN_BOOTSTRAP_PASSWORD="StrongPassword123!"; .\mvnw spring-boot:run`

---

## 3. Khởi động các Services NodeJS

Mở thêm các cửa sổ Terminal mới:

```powershell
# 1. API Gateway (Port 5555)
cd APIGateway
npm install
npm start

# 2. Cloudinary Service (Port 5001)
cd cloudinary-service
npm install
npm start

# 3. Search & Recommendation Service (Port 8086)
cd search-and-recommendation
npm install
npm run start:dev
```

---

## 4. Khởi động Frontend Web

Cuối cùng, khởi động Frontend:

```powershell
cd front_end
npm install
npm run dev
```

Mở trình duyệt và truy cập `http://localhost:3000` (hoặc cổng hiển thị trên Terminal của Front-end). Toàn bộ API call từ Client sẽ được Front-end gọi thông qua APIGateway ở port `5555`.

---

> [!NOTE]  
> Tất cả các luồng Checkout, Cập nhật Tồn kho, và Tính năng Gợi ý đều đã có sẵn data test để bạn phát triển ứng dụng ngay!
