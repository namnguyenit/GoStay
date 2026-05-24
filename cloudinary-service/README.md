# Cloudinary Service Setup

This service handles media uploads and management using Cloudinary.


## Prerequisites
- Node.js (v14 hoặc cao hơn)
- npm (Node Package Manager)
- Một tài khoản Cloudinary ([Đăng ký tại đây](https://cloudinary.com/users/register))

## 1. Tạo dịch vụ trên Cloudinary và lấy biến môi trường

### Bước 1: Đăng ký hoặc đăng nhập Cloudinary
Truy cập https://cloudinary.com/users/register để đăng ký tài khoản miễn phí hoặc đăng nhập nếu đã có tài khoản.

### Bước 2: Tạo Cloudinary Cloud (Cloud Name)
Sau khi đăng nhập, vào Dashboard. Cloudinary sẽ tự động tạo một Cloud (cloud name) cho bạn. Nếu muốn tạo thêm, vào phần **Settings > Account** và tạo mới.

### Bước 3: Lấy các biến môi trường
Tại Dashboard, bạn sẽ thấy các thông tin sau:

- **Cloud name**: Tên cloud của bạn
- **API Key**: Khóa API
- **API Secret**: Mã bí mật API

Ví dụ:
```
CLOUDINARY_CLOUD_NAME=demo
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdeFGHIJKLMNOpqrstuvwxYZ
```

Sao chép các giá trị này và điền vào file `.env` như hướng dẫn bên dưới.

## 1. Clone the Repository
If you haven't already, clone the repository and navigate to the `cloudinary-service` directory:

```bash
cd cloudinary-service
```

## 2. Install Dependencies
Install the required npm packages:

```bash
npm install
```


## 2. Cấu hình biến môi trường
Tạo file `.env` trong thư mục `cloudinary-service` với nội dung:

```
PORT=5001
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Thay thế `your_cloud_name`, `your_api_key`, `your_api_secret` bằng thông tin bạn lấy ở bước trên.


## 3. Khởi động dịch vụ
Chạy lệnh sau để khởi động service:

```bash
npm start
```

Dịch vụ sẽ chạy trên cổng bạn cấu hình trong file `.env` (mặc định: 5001).

## 5. API Endpoints
Refer to the `src/routes/media.routes.js` file for available endpoints and usage.

## 6. Testing
You can use tools like Postman to test the API endpoints.

---

For further customization, see the configuration files in `src/configs/` and middleware in `src/middlewares/`.
