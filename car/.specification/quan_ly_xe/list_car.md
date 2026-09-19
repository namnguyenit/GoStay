### 1.2. Xem danh sách xe (View Car List)

#### 1.2.1. Mô tả
Cho phép Chủ nhà xe (Operator) xem danh sách tất cả các phương tiện xe khách thuộc quyền quản lý của nhà xe mình, tìm kiếm theo tên xe hoặc biển số xe, lọc theo loại xe (Giường nằm, Limousine, Ghế ngồi), sắp xếp danh sách và phân trang hiển thị dữ liệu.

#### 1.2.2. Tác nhân
- Chủ nhà xe (Operator / Host)

#### 1.2.3. Tiền điều kiện
- Tác nhân đã đăng nhập thành công vào hệ thống với tài khoản Chủ nhà xe.
- Tác nhân đang ở màn hình Danh sách xe.

#### 1.2.4. Hậu điều kiện
- Hiển thị danh sách xe đã được lọc, sắp xếp và phân trang tương ứng.
- Không làm thay đổi dữ liệu của các xe trên hệ thống.

#### 1.2.5. Quy tắc nghiệp vụ
- **Quyền hạn truy cập (Chỉ dành cho Nhà xe - Operator)**: Chức năng này **chỉ có Nhà xe chính thức mới được phép thực hiện** và **chỉ được xem danh sách các xe thuộc quyền sở hữu của chính nhà xe mình**. Hệ thống dựa vào `user_id` của người dùng đang đăng nhập để tra cứu `operator_id` tương ứng; nếu không tìm thấy bản ghi Nhà xe trong bảng `operators`, hệ thống sẽ từ chối truy cập và báo lỗi `403 Forbidden`. Tuyệt đối không cho phép xem danh sách xe của nhà xe khác qua API này.
- **Thống kê (KPI Stats)**: Hiển thị 4 chỉ số tổng quan ở phía trên bảng:
  - **Tổng số xe**: Tổng số lượng xe thuộc nhà xe hiện tại.
  - **Xe giường nằm**: Số lượng xe thuộc loại Giường nằm (`SLEEPER`).
  - **Xe Limousine**: Số lượng xe thuộc loại Limousine (`LIMOUSINE`).
  - **Xe ghế ngồi**: Số lượng xe thuộc loại Ghế ngồi (`SEAT`).
- **Tìm kiếm (Search)**: Cho phép tìm kiếm tương đối theo Tên xe (`name`) hoặc Biển số xe (`license_plate`).
- **Bộ lọc (Filter)**: Cho phép lọc danh sách theo Loại xe (`type`):
  - Tất cả loại xe (Mặc định).
  - Xe giường nằm (`SLEEPER`).
  - Xe Limousine (`LIMOUSINE`).
  - Xe ghế ngồi (`SEAT`).
- **Sắp xếp (Sorting)**: Cho phép sắp xếp danh sách theo:
  - Mới nhất (Sắp xếp theo ngày tạo giảm dần - Mặc định).
  - Tên xe (A-Z).
  - Tổng số ghế (Tăng dần / Giảm dần).
- **Phân trang (Pagination)**:
  - Số dòng hiển thị mặc định là 10 dòng/trang (có thể thay đổi số dòng hiển thị qua ô chọn).
  - Hiển thị tổng số lượng xe thực tế và tổng số trang tương ứng.
- **Định dạng hiển thị nhãn loại xe (Badge Styles)**:
  - Xe giường nằm (`SLEEPER`): Badge màu xanh dương (blue).
  - Xe Limousine (`LIMOUSINE`): Badge màu vàng hổ phách (amber).
  - Xe ghế ngồi (`SEAT`): Badge màu xanh lá (green).

#### 1.2.6. Luồng chính
1. Tác nhân nhấn vào mục **"Quản lý xe"** (hoặc **"Danh sách xe"**) trên thanh điều hướng menu của hệ thống.
2. Hệ thống chuyển hướng tác nhân sang màn hình Danh sách xe.
3. Hệ thống tải dữ liệu xe của nhà xe và hiển thị:
   - Cụm báo cáo thống kê KPI tổng quan (Tổng số xe, Xe giường nằm, Xe Limousine, Xe ghế ngồi).
   - Thanh công cụ (Ô tìm kiếm, Bộ lọc loại xe, Bộ chọn sắp xếp, Nút "+ Thêm xe mới").
   - Bảng danh sách xe kèm theo thông tin: Tên xe, Biển số xe, Nhãn loại xe, Tổng số ghế, Ngày tạo và cột Thao tác (Sửa, Xóa).
   - Thanh phân trang ở phía dưới bảng.
4. Tác nhân nhập từ khóa tìm kiếm, chọn bộ lọc loại xe hoặc chọn kiểu sắp xếp để xem danh sách mong muốn.
5. Hệ thống cập nhật danh sách tức thời và phân trang tương ứng ở bên dưới.

#### 1.2.7. Luồng phát sinh
- **Luồng 2.a: Không tìm thấy kết quả**: 
  - Nếu từ khóa tìm kiếm hoặc bộ lọc không khớp với xe nào, hệ thống hiển thị bảng trống kèm thông báo: *"Chưa có xe nào trong hệ thống"* (nếu nhà xe chưa có xe) hoặc *"Không tìm thấy xe phù hợp với điều kiện tìm kiếm"*.

#### 1.2.8. Giao diện minh họa
- **Hình 1: Màn hình Danh sách xe tổng quan**
  - Màn hình chính hiển thị cụm thẻ thống kê KPI ở trên cùng, phía dưới là thanh công cụ (Ô tìm kiếm, Bộ lọc loại xe, Bộ chọn sắp xếp, Nút màu xanh "+ Thêm xe mới") và bảng danh sách xe đã phân trang.
- **Hình 2: Thao tác Tìm kiếm và Lọc danh sách xe**
  - Tác nhân gõ từ khóa vào ô Tìm kiếm (ví dụ: "51B") hoặc chọn Loại xe "Limousine" từ danh sách bộ lọc, bảng bên dưới tự động làm mới và chỉ hiển thị các xe thỏa mãn điều kiện.
- **Hình 3: Kết quả khi không có dữ liệu (Trạng thái trống - Empty State)**
  - Khi tìm kiếm từ khóa không tồn tại hoặc nhà xe chưa tạo xe nào, bảng hiển thị hình ảnh minh họa nhỏ kèm dòng chữ *"Không tìm thấy xe phù hợp"*.
