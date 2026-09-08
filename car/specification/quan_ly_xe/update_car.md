### 1.3. Cập nhật thông tin xe (Update Car)

#### 1.3.1. Mô tả
Cho phép Chủ nhà xe (Operator) chỉnh sửa các thông tin chi tiết của một phương tiện xe khách hiện có trong danh sách quản lý của nhà xe mình (như Tên xe, Biển số xe, Loại xe, Tổng số ghế).

#### 1.3.2. Tác nhân
- Chủ nhà xe (Operator / Host)

#### 1.3.3. Tiền điều kiện
- Tác nhân đã đăng nhập thành công vào hệ thống với tài khoản Chủ nhà xe.
- Tác nhân đang ở màn hình Danh sách xe và chọn thao tác "Sửa" trên dòng xe tương ứng.

#### 1.3.4. Hậu điều kiện
- Thông tin thay đổi của xe khách được cập nhật thành công vào cơ sở dữ liệu (Bảng `cars`).
- Bảng danh sách xe trên giao diện được làm mới và hiển thị dữ liệu xe mới cập nhật.

#### 1.3.5. Quy tắc nghiệp vụ
- **Quyền sở hữu**: Tác nhân chỉ được phép cập nhật các xe thuộc sở hữu của nhà xe mình (`operator_id` trùng với ID nhà xe của tác nhân đang đăng nhập).
- **Tên xe (`name`)**: Bắt buộc nhập, độ dài từ 3 đến 100 ký tự.
- **Biển số xe (`license_plate`)**:
  - Bắt buộc nhập, đúng định dạng biển số xe Việt Nam.
  - Phải là **duy nhất** trên toàn hệ thống (nếu thay đổi biển số xe mới, biển số mới không được trùng với xe khác trong hệ thống).
- **Loại xe (`type`)**: Bắt buộc chọn 1 trong 3 loại xe (`SLEEPER`, `LIMOUSINE`, `SEAT`).
- **Tổng số ghế (`total_seats`)**:
  - Bắt buộc nhập, phải là số nguyên dương ($> 0$).
  - **Ràng buộc chuyến xe**: Nếu xe đã được xếp vào các chuyến xe (`Trip`) đang sắp chạy hoặc đang hoạt động (`SCHEDULED`), tổng số ghế mới không được nhỏ hơn số ghế lớn nhất đã được khách đặt vé trên các chuyến xe đó.

#### 1.3.6. Luồng chính
1. Tại màn hình Danh sách xe, tác nhân nhấn vào nút **"Sửa"** (biểu tượng chiếc bút) tại dòng của xe cần cập nhật.
2. Hệ thống hiển thị Form cửa sổ bật lên (Modal) **"Cập nhật thông tin xe"** và tự động điền sẵn (pre-fill) dữ liệu hiện tại của xe vào các ô nhập liệu.
3. Tác nhân tiến hành chỉnh sửa các thông tin mong muốn (Tên xe, Biển số xe, Loại xe, Tổng số ghế).
4. Tác nhân nhấn nút **"Lưu thay đổi"** (hoặc **"Cập nhật"**).
5. Hệ thống kiểm tra tính hợp lệ của dữ liệu theo các Quy tắc nghiệp vụ (định dạng biển số, kiểm tra trùng biển số với xe khác, rà soát ràng buộc số ghế vé đã đặt).
6. Hệ thống cập nhật thông tin xe mới vào cơ sở dữ liệu.
7. Hệ thống hiển thị thông báo thành công: *"Cập nhật thông tin xe thành công!"*.
8. Hệ thống tự động đóng Form cửa sổ bật lên (Modal) và làm mới danh sách xe để hiển thị dữ liệu xe vừa được cập nhật.

#### 1.3.7. Luồng phát sinh
- **Luồng 3.a: Biển số xe trùng với xe khác**:
  - Tại bước 5, nếu biển số xe mới thay đổi bị trùng với một xe khác đã có trong hệ thống, hệ thống dừng xử lý, đánh dấu đỏ ô Biển số xe và hiển thị thông báo lỗi bên dưới: *"Biển số xe đã được sử dụng bởi một xe khác trong hệ thống."*
- **Luồng 3.b: Nhập thiếu thông tin bắt buộc**:
  - Tại bước 5, nếu tác nhân xóa trống các trường bắt buộc (Tên xe, Biển số xe, Số ghế), hệ thống hiển thị thông báo lỗi: *"Vui lòng nhập đầy đủ các thông tin bắt buộc."* và viền đỏ các trường thiếu.
- **Luồng 3.c: Số ghế không hợp lệ với vé đã đặt**:
  - Tại bước 5, nếu tác nhân giảm tổng số ghế xuống nhỏ hơn số ghế đã được hành khách đặt trên các chuyến xe sắp chạy của xe này, hệ thống chặn lại và báo lỗi: *"Không thể giảm số ghế nhỏ hơn số ghế đã được khách đặt trên các chuyến xe đang hoạt động."*
- **Luồng 4.a: Tác nhân hủy thao tác**:
  - Tại bước 3 hoặc 4, tác nhân nhấn nút **"Hủy"** hoặc biểu tượng **"X"** trên góc Form.
  - Hệ thống đóng Form cửa sổ bật lên (Modal) mà không lưu bất kỳ thay đổi nào.

#### 1.3.8. Giao diện minh họa
- **Hình 1: Thao tác chọn Sửa xe từ Danh sách xe**
  - Tác nhân tìm đến dòng của xe cần chỉnh sửa trong danh sách xe và nhấn vào nút **"Sửa"** (biểu tượng chiếc bút) ở cột Thao tác.
- **Hình 2: Form cửa sổ bật lên (Modal) "Cập nhật thông tin xe"**
  - Form hiển thị với tiêu đề "Cập nhật thông tin xe". Tất cả các ô nhập liệu (Tên xe, Biển số, Loại xe, Tổng số ghế) đã có sẵn dữ liệu cũ của xe. Tác nhân thay đổi các trường cần thiết và nhấn nút **"Lưu thay đổi"**.
- **Hình 3: Kết quả sau khi Cập nhật xe thành công**
  - Form đóng lại, hiển thị thông báo Toast xanh *"Cập nhật thông tin xe thành công!"* ở góc trên bên phải màn hình. Thông tin xe ở dòng tương ứng trong danh sách xe lập tức cập nhật dữ liệu mới vừa sửa.
