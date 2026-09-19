### 2.2. Phê duyệt đơn đăng ký Nhà xe (Approve Operator Application)

#### 2.2.1. Mô tả
Cho phép Quản trị viên (Admin) xem danh sách các đơn đăng ký trở thành Nhà xe từ người dùng, kiểm tra thông tin nhà xe, và thực hiện Phê duyệt (`APPROVED`) hoặc Từ chối (`REJECTED`). **Khi Admin bấm Phê duyệt, hệ thống sẽ chính thức khởi tạo một bản ghi Nhà xe mới (`Operator`) trong cơ sở dữ liệu** và nâng cấp vai trò của tài khoản đó.

#### 2.2.2. Tác nhân
- Quản trị viên (Admin)

#### 2.2.3. Tiền điều kiện
- Tác nhân đã đăng nhập thành công vào hệ thống với tài khoản Quản trị viên (Admin).
- Tác nhân đang ở màn hình Quản lý đơn đăng ký Nhà xe.

#### 2.2.4. Hậu điều kiện
- **Khi Phê duyệt (`APPROVED`)**: 
  - Đơn đăng ký chuyển sang trạng thái `APPROVED`.
  - Bản ghi Nhà xe mới được chính thức tạo vào bảng `operators` trong cơ sở dữ liệu (`id`, `user_id`, `name`).
  - Vai trò (Role) của người dùng được cập nhật nâng cấp từ `USER` thành `HOST` / `OPERATOR`.
- **Khi Từ chối (`REJECTED`)**: 
  - Đơn đăng ký chuyển sang trạng thái `REJECTED` kèm theo lý do từ chối.
  - Không có bản ghi nào được tạo trong bảng `operators`.

#### 2.2.5. Quy tắc nghiệp vụ
- **Chỉ Admin mới có quyền phê duyệt**: Duy nhất tài khoản có vai trò `ADMIN` mới được truy cập và thực hiện thao tác duyệt đơn.
- **Tạo bản ghi CSDL khi Phê duyệt**:
  - Ngay khi bấm Phê duyệt, hệ thống sẽ tự động chèn 1 dòng dữ liệu vào bảng `operators`:
    - `id`: Mã UUID nhà xe tự động sinh.
    - `user_id`: ID tài khoản người dùng nộp đơn.
    - `name`: Tên nhà xe đã được duyệt.
- **Yêu cầu Lý do khi Từ chối**: Nếu chọn Từ chối đơn đăng ký, Admin bắt buộc phải nhập câu Lý do từ chối (Ví dụ: "Thông tin liên hệ nhà xe không chính xác", "Tên nhà xe không phù hợp") để gửi thông báo giải thích cho người dùng.

#### 2.2.6. Luồng chính (Trường hợp Phê duyệt đơn)
1. Admin nhấn vào mục **"Quản lý đơn đăng ký Nhà xe"** trên thanh menu Admin.
2. Hệ thống hiển thị danh sách các đơn đăng ký (lọc theo trạng thái `PENDING`).
3. Admin chọn một đơn đăng ký và nhấn **"Xem chi tiết"**.
4. Hệ thống hiển thị Modal chi tiết bao gồm: Tên nhà xe, Số điện thoại liên hệ, Địa chỉ trụ sở, Ngày gửi đơn.
5. Admin kiểm tra thông tin nhà xe và nhấn nút **"Phê duyệt"**.
6. Hệ thống hiển thị Form xác nhận phê duyệt.
7. Admin bấm **"Xác nhận Phê duyệt"**.
8. Hệ thống cập nhật trạng thái đơn thành `APPROVED`, **tạo bản ghi mới trong bảng `operators`** trong cơ sở dữ liệu và nâng cấp role tài khoản của user.
9. Hệ thống hiển thị thông báo thành công: *"Đã phê duyệt đơn đăng ký nhà xe thành công!"* và gửi thông báo/email tới người dùng.

#### 2.2.7. Luồng phát sinh (Trường hợp Từ chối đơn)
- **Luồng 5.a: Admin từ chối đơn đăng ký**:
  - Tại bước 5, Admin nhấn nút **"Từ chối"**.
  - Hệ thống hiển thị ô nhập *"Lý do từ chối (Bắt buộc)"*.
  - Admin nhập lý do (ví dụ: *"Thông tin số điện thoại nhà xe không thể liên lạc"* ) và bấm *"Xác nhận Từ chối"*.
  - Hệ thống cập nhật trạng thái đơn thành `REJECTED`, lưu lý do từ chối, gửi thông báo tới người dùng và **không tạo bản ghi nào trong bảng `operators`**.

#### 2.2.8. Giao diện minh họa
- **Hình 1: Màn hình Danh sách đơn đăng ký Nhà xe (Dành cho Admin)**
  - Bảng danh sách các đơn đăng ký với các cột: Tên người nộp, Tên nhà xe, Số điện thoại, Ngày nộp, Trạng thái (Badge màu vàng `PENDING`) và nút **"Xem chi tiết"**.
- **Hình 2: Form Modal Xem chi tiết đơn đăng ký & Nút Phê duyệt/Từ chối**
  - Cửa sổ Modal hiển thị toàn bộ thông tin đã nộp và 2 nút hành động ở góc dưới: Nút màu đỏ **"Từ chối"** và Nút màu xanh **"Phê duyệt"**.
- **Hình 3: Kết quả sau khi Phê duyệt thành công**
  - Đơn chuyển sang nhãn xanh *"Đã phê duyệt"*, hệ thống phát sự kiện khởi tạo bản ghi `Operator` trong CSDL và gửi thông báo mừng tới người dùng.
