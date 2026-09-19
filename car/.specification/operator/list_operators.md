### 2.3. Xem danh sách Nhà xe (View Operator List)

#### 2.3.1. Mô tả
Cho phép Quản trị viên (Admin) xem danh sách tất cả các Nhà xe (Operator) chính thức đang hoạt động trên hệ thống, tìm kiếm theo tên nhà xe, sắp xếp danh sách và phân trang hiển thị dữ liệu. Chức năng này giúp Admin quản lý tổng thể các đối tác vận tải đã được phê duyệt trên nền tảng.

#### 2.3.2. Tác nhân
- Quản trị viên (Admin)

#### 2.3.3. Tiền điều kiện
- Tác nhân đã đăng nhập thành công vào hệ thống với tài khoản có vai trò Quản trị viên (`ADMIN`).
- Tác nhân đang ở màn hình Quản trị Nhà xe (Operator Management).

#### 2.3.4. Hậu điều kiện
- Hệ thống hiển thị danh sách các Nhà xe chính thức thỏa mãn điều kiện tìm kiếm, sắp xếp và phân trang.
- Dữ liệu trong cơ sở dữ liệu không bị thay đổi trong quá trình truy vấn.

#### 2.3.5. Quy tắc nghiệp vụ
- **Phân quyền truy cập (Role Authorization)**: 
  - **Duy nhất tài khoản có vai trò `ADMIN` mới được phép truy cập và gọi chức năng này.**
  - Mọi yêu cầu từ người dùng thông thường (`USER`), đối tác (`HOST`/`OPERATOR`) hoặc chưa xác thực đều bị từ chối truy cập với mã lỗi `403 Forbidden` hoặc `401 Unauthorized`.
- **Nguồn dữ liệu**:
  - Truy vấn trực tiếp từ bảng `operators` (chỉ gồm các nhà xe đã được duyệt và chính thức hoạt động trên hệ thống).
- **Tìm kiếm (Search)**:
  - Cho phép tìm kiếm tương đối (case-insensitive) theo Tên nhà xe (`name`).
- **Sắp xếp (Sorting)**:
  - Mặc định sắp xếp theo ngày tạo mới nhất (`createdAt` giảm dần).
  - Cho phép tùy chọn sắp xếp theo Tên nhà xe (A-Z hoặc Z-A), Ngày gia nhập (Cũ nhất / Mới nhất).
- **Phân trang (Pagination)**:
  - Mặc định 10 bản ghi/trang (có thể tùy chọn 10, 20, 50 dòng/trang).
  - Kết quả trả về kèm thông tin tổng số lượng nhà xe (`total`), tổng số trang (`totalPages`), trang hiện tại (`page`) và kích thước trang (`limit`).
- **Thông tin hiển thị cho mỗi Nhà xe**:
  - Mã định danh Nhà xe (`id`).
  - Tên Nhà xe (`name`).
  - Mã định danh tài khoản chủ sở hữu (`userId`).
  - Ngày gia nhập hệ thống (`createdAt`).
  - Ngày cập nhật thông tin (`updatedAt`).

#### 2.3.6. Luồng chính
1. Admin nhấn vào mục **"Quản lý Nhà xe"** (hoặc **"Danh sách đối tác Nhà xe"**) trên thanh menu Quản trị (Admin Dashboard).
2. Hệ thống kiểm tra vai trò của người dùng (`ADMIN`):
   - Xác thực thành công.
3. Hệ thống tải dữ liệu các Nhà xe từ bảng `operators` và hiển thị:
   - Thanh công cụ (Ô tìm kiếm theo tên nhà xe, Bộ chọn sắp xếp, Thống kê tổng số nhà xe).
   - Bảng danh sách các nhà xe bao gồm: STT, Mã nhà xe, Tên nhà xe, ID chủ sở hữu, Ngày tham gia, Ngày cập nhật.
   - Thanh điều hướng phân trang ở cuối bảng.
4. Admin có thể nhập từ khóa tìm kiếm hoặc chọn chuyển trang.
5. Hệ thống lọc và hiển thị danh sách tương ứng.

#### 2.3.7. Luồng phát sinh
- **Luồng 2.a: Người dùng không có quyền Quản trị viên (`ADMIN`)**:
  - Nếu tài khoản không mang vai trò `ADMIN`, hệ thống từ chối yêu cầu và phản hồi thông báo: *"Bạn không có quyền thực hiện thao tác này. Chỉ Quản trị viên (Admin) mới có quyền truy cập."* (HTTP 403 Forbidden).
- **Luồng 3.a: Không tìm thấy nhà xe nào phù hợp**:
  - Nếu từ khóa tìm kiếm không khớp với tên bất kỳ nhà xe nào, hệ thống hiển thị bảng trống kèm thông báo: *"Không tìm thấy nhà xe phù hợp với điều kiện tìm kiếm."*
- **Luồng 3.b: Hệ thống chưa có Nhà xe nào**:
  - Nếu hệ thống chưa từng có đơn đăng ký nào được duyệt, bảng hiển thị trạng thái rỗng: *"Chưa có nhà xe nào hoạt động trên hệ thống."*

#### 2.3.8. Giao diện minh họa
- **Hình 1: Màn hình Danh sách Nhà xe dành cho Quản trị viên**
  - Màn hình gồm thanh tiêu đề *"Quản lý đối tác Nhà xe"*, ô tìm kiếm nhanh, nút chọn số lượng dòng hiển thị, và bảng dữ liệu hiển thị danh sách các Nhà xe đã được phê duyệt hoạt động.
- **Hình 2: Trạng thái tìm kiếm và lọc dữ liệu**
  - Admin nhập từ khóa (ví dụ: "Phương Trang") vào ô tìm kiếm, bảng dữ liệu lập tức lọc kết quả theo tên nhà xe tương ứng.
- **Hình 3: Thông báo từ chối truy cập khi không phải Admin**
  - Màn hình hiển thị trang lỗi 403 Forbidden với thông điệp từ chối truy cập nếu người dùng không có quyền Quản trị viên.
