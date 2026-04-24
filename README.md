TÀI LIỆU ĐẶC TẢ API - DỰ ÁN GOTRAVEL (PHẦN FRONTEND)Dành cho Frontend Developer (Long)Base URL (API Gateway): http://localhost:3000Môi trường: Local DevelopmentLưu ý: Frontend CHỈ gọi vào Base URL này. Gateway sẽ tự động điều hướng xuống các service Java/Node.js bên dưới. Tuyệt đối không gọi các port 8080, 8081.0. QUY CHUẨN DỮ LIỆU TRẢ VỀ (STANDARD RESPONSE)Để Frontend dễ dàng xử lý (đặc biệt khi dùng Axios Interceptor), tất cả API (kể cả thành công hay thất bại) đều trả về một cấu trúc JSON thống nhất duy nhất.Khi Thành công (HTTP Status 200, 201):{
  "status": 200,
  "message": "Thao tác thành công",
  "data": { ... } // Chứa dữ liệu thực tế
}
Khi Thất bại (HTTP Status 400, 401, 403, 404, 500):{
  "status": 400,
  "message": "Email đã tồn tại trong hệ thống!", // Hiển thị câu này lên Toast Notification
  "data": null
}
1. MODULE XÁC THỰC (IDENTITY & ACCESS)1.1. Đăng nhậpEndpoint: POST /api/v1/auth/loginAuth: Không cầnRequest Body:{
  "email": "user@gmail.com",
  "password": "Password123!"
}
Response (Success):{
  "status": 200,
  "message": "Đăng nhập thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "fullName": "Nguyễn Văn A",
      "role": "USER",
      "avatarUrl": null
    }
  }
}
1.2. Đăng ký Khách hàng (End-User)Endpoint: POST /api/v1/auth/register/userAuth: Không cầnRequest Body:{
  "username": "nguyenvana",
  "email": "user@gmail.com",
  "password": "Password123!",
  "fullName": "Nguyễn Văn A"
}
1.3. Đăng ký Đối tác (Host)Endpoint: POST /api/v1/auth/register/hostAuth: Không cầnRequest Body:{
  "username": "vinpearl_nhatrang",
  "email": "contact@vinpearl.com",
  "password": "Password123!",
  "fullName": "Công ty CP Vinpearl",
  "hostType": "ENTERPRISE",
  "identityInfo": {
    "taxCode": "0101234567",
    "idCard": null
  }
}
2. MODULE MEDIA (UPLOAD ẢNH)2.1. Upload ẢnhEndpoint: POST /api/v1/media/uploadAuth: Cần có JWT Token ở HeaderRequest Format: multipart/form-dataKey: file (Kiểu File)Response (Success):{
  "status": 200,
  "message": "Upload thành công",
  "data": {
    "url": "[https://res.cloudinary.com/gotravel/image/upload/v12345/sample.jpg](https://res.cloudinary.com/gotravel/image/upload/v12345/sample.jpg)"
  }
}
3. MODULE CATALOG (QUẢN LÝ TÀI SẢN & ĐỊA DANH)3.1. [Admin] Tạo Địa danh (Landmark)Endpoint: POST /api/v1/catalog/admin/landmarksAuth: Header Authorization: Bearer <token> (Role: ADMIN)Request Body:{
  "name": "Thác Bản Giốc",
  "latitude": 22.8533,
  "longitude": 106.7249,
  "radiusMeters": 5000,
  "thumbnailUrl": "[https://link-anh.com/thac.jpg](https://link-anh.com/thac.jpg)"
}
3.2. Lấy danh sách Địa danh (Hiển thị Trang chủ)Endpoint: GET /api/v1/catalog/landmarksAuth: Không cầnResponse:{
  "status": 200,
  "message": "Success",
  "data": [
    {
      "id": "abc-123-...",
      "name": "Thác Bản Giốc",
      "thumbnailUrl": "https://...",
      "latitude": 22.8533,
      "longitude": 106.7249
    }
  ]
}
3.3. [Host] Đăng Dịch vụ (Listing - Phòng/Tour/Xe)Endpoint: POST /api/v1/catalog/host/listingsAuth: Header Authorization: Bearer <token> (Role: HOST)Request Body:Lưu ý: Đối tượng attributes là cấu hình động, Frontend có thể nhét bất cứ key-value nào tùy vào form (VD: Số giường, có hồ bơi, ngôn ngữ...){
  "title": "Homestay Thác Bản Giốc View Mây",
  "category": "STAY",
  "basePrice": 550000,
  "latitude": 22.8540,
  "longitude": 106.7255,
  "attributes": {
    "bedType": "King Size",
    "hasWifi": true,
    "maxGuests": 2,
    "images": ["url1.jpg", "url2.jpg"]
  }
}
3.4. [Host] Cập nhật Dịch vụEndpoint: PUT /api/v1/catalog/host/listings/{listingId}Auth: Role HOSTRequest Body: (Giống hệt phần Tạo mới, nhưng gửi để ghi đè)3.5. [Host] Xóa Dịch vụ (Soft Delete)Endpoint: DELETE /api/v1/catalog/host/listings/{listingId}Auth: Role HOSTResponse (Success):{
  "status": 200,
  "message": "Đã ẩn dịch vụ thành công",
  "data": null
}
4. MODULE SEARCH (TÌM KIẾM THEO BÁN KÍNH TỌA ĐỘ)4.1. Khám phá Dịch vụ quanh Địa danh (Search Nearby)Endpoint: GET /api/v1/search/nearbyAuth: Không cầnQuery Params:lat: Vĩ độ (Bắt buộc)lng: Kinh độ (Bắt buộc)radius: Bán kính (Tùy chọn, mặc định 5000 mét)category: Phân loại (Tùy chọn, VD: STAY, EXP)Ví dụ gọi URL: /api/v1/search/nearby?lat=22.8533&lng=106.7249&radius=2000&category=STAYResponse (Success):{
  "status": 200,
  "message": "Success",
  "data": [
    {
      "id": "xyz-789-...",
      "title": "Homestay Thác Bản Giốc View Mây",
      "category": "STAY",
      "basePrice": 550000,
      "distanceMeters": 150.5,
      "thumbnail": "url1.jpg"
    },
    {
      "id": "def-456-...",
      "title": "Tour chèo thuyền Sup dưới chân thác",
      "category": "EXPERIENCE",
      "basePrice": 200000,
      "distanceMeters": 300.2,
      "thumbnail": "url_tour.jpg"
    }
  ]
}
💡 HƯỚNG DẪN CẤU HÌNH AXIOS CHO FRONTEND (ZUSTAND/REDUX)Long thêm đoạn code này vào file cấu hình API để không phải thủ công gửi Token mỗi lần gọi API nhé:import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:3000', // Cổng API Gateway
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Tự động đính kèm Token trước khi gửi
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Hoặc lấy từ Zustand store
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: Tự động bắt lỗi Token hết hạn (401)
axiosClient.interceptors.response.use(
  (response) => response.data, // Trả luôn cục data chuẩn ra ngoài
  (error) => {
    if (error.response && error.response.status === 401) {
      // Ép văng ra trang Login
      window.location.href = '/login';
    }
    // Ném phần message lỗi chuẩn ra để React hiển thị Toast
    return Promise.reject(error.response.data.message); 
  }
);

export default axiosClient;
