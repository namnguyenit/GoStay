### 1.1. Thêm xe mới (Add Car)

#### 1.1.1. Mô tả
Cho phép Chủ nhà xe (Operator) thêm một phương tiện xe khách mới vào danh sách quản lý của nhà xe mình. Xe mới sau khi thêm sẽ được sử dụng để gán vào các tuyến đường và chuyến xe (Trip) phục vụ việc bán vé.

#### 1.1.2. Tác nhân
- Chủ nhà xe (Operator / Host)

#### 1.1.3. Tiền điều kiện
- Tác nhân đã đăng nhập thành công vào hệ thống với tài khoản Chủ nhà xe.
- Tác nhân đang ở màn hình Danh sách xe.

#### 1.1.4. Hậu điều kiện
- Thông tin xe khách mới được ghi nhận thành công và lưu trữ vào cơ sở dữ liệu (Bảng `cars`).
- Xe mới xuất hiện trong danh sách xe của nhà xe.
- Tổng số lượng xe của nhà xe được cập nhật tự động.

#### 1.1.5. Quy tắc nghiệp vụ
- **Quyền hạn truy cập (Chỉ dành cho Nhà xe - Operator)**: Chức năng này **chỉ có Nhà xe chính thức mới được phép thực hiện**. Người dùng bắt buộc phải có tài khoản đã được Quản trị viên (Admin) phê duyệt trở thành Nhà xe (tồn tại bản ghi hợp lệ trong bảng `operators` liên kết với `user_id`). Nếu tài khoản người dùng thông thường (`USER`) hoặc chưa được duyệt làm Nhà xe cố tình gọi thao tác này, hệ thống sẽ từ chối truy cập và báo lỗi `403 Forbidden`.
- **Tên xe (`name`)**: Bắt buộc nhập, độ dài từ 3 đến 100 ký tự (Ví dụ: "Xe Limousine VIP 01", "Xe Giường nằm Hà Nội - Sài Gòn").
- **Biển số xe (`license_plate`)**:
  - Bắt buộc nhập.
  - Phải là **duy nhất** trên toàn hệ thống (không trùng với biển số xe đã tồn tại).
  - Phải đúng định dạng biển số xe Việt Nam (Ví dụ: `51B-123.45`, `29B-987.65`, `43B-012.34`).
- **Loại xe (`type`)**: Bắt buộc chọn 1 trong 3 loại xe theo định dạng hệ thống:
  - `SLEEPER`: Xe giường nằm.
  - `LIMOUSINE`: Xe Limousine.
  - `SEAT`: Xe ghế ngồi.
- **Tổng số ghế (`total_seats`)**:
  - Bắt buộc nhập.
  - Phải là số nguyên dương lớn hơn 0 ($> 0$, thông thường từ 4 đến 54 ghế tùy theo loại xe).
- **Ràng buộc Nhà xe (`operator_id`)**: 
  - Hệ thống tự động gắn xe mới vừa tạo vào ID nhà xe của tác nhân đang đăng nhập.

#### 1.1.6. Luồng chính
1. Tác nhân nhấn vào nút **"+ Thêm xe mới"** ở góc trên bên phải màn hình Danh sách xe.
2. Hệ thống hiển thị Form cửa sổ bật lên (Modal) **"Thêm xe mới"**.
3. Tác nhân nhập các thông tin cần thiết:
   - Tên xe.
   - Biển số xe.
   - Chọn Loại xe (Giường nằm / Limousine / Ghế ngồi).
   - Nhập Tổng số ghế.
4. Tác nhân nhấn nút **"Lưu thông tin"** (hoặc **"Thêm mới"**).
5. Hệ thống kiểm tra tính hợp lệ của dữ liệu theo các Quy tắc nghiệp vụ (định dạng biển số, kiểm tra trùng biển số xe, số ghế $> 0$).
6. Hệ thống lưu thông tin xe mới vào cơ sở dữ liệu.
7. Hệ thống hiển thị thông báo thành công: *"Thêm xe mới thành công!"*.
8. Hệ thống tự động đóng Form cửa sổ bật lên (Modal) và làm mới danh sách xe để hiển thị xe vừa được tạo ở dòng đầu tiên.

#### 1.1.7. Luồng phát sinh
- **Luồng 1.a: Biển số xe đã tồn tại**:
  - Tại bước 5, nếu biển số xe vừa nhập đã có trong hệ thống, hệ thống dừng xử lý, đánh dấu đỏ ô nhập Biển số xe và hiển thị thông báo lỗi bên dưới: *"Biển số xe đã tồn tại trong hệ thống, vui lòng kiểm tra lại."*
- **Luồng 1.b: Nhập thiếu thông tin bắt buộc**:
  - Tại bước 5, nếu tác nhân bỏ trống các trường bắt buộc (Tên xe, Biển số, Loại xe, Số ghế), hệ thống hiển thị thông báo lỗi: *"Vui lòng nhập đầy đủ các thông tin bắt buộc."* và viền đỏ các trường thiếu.
- **Luồng 1.c: Số ghế không hợp lệ**:
  - Tại bước 5, nếu tổng số ghế $\le 0$ hoặc chứa ký tự không phải số, hệ thống báo lỗi dưới ô Tổng số ghế: *"Tổng số ghế phải là số nguyên lớn hơn 0."*
- **Luồng 4.a: Tác nhân hủy thao tác**:
  - Tại bước 3 hoặc 4, tác nhân nhấn nút **"Hủy"** hoặc biểu tượng **"X"** trên góc Form.
  - Hệ thống đóng Form cửa sổ bật lên (Modal) mà không lưu bất kỳ dữ liệu nào.

#### 1.1.8. Giao diện minh họa
- **Hình 1: Màn hình Danh sách xe**
  - Tác nhân nhấn vào nút màu xanh **"+ Thêm xe mới"** nằm ở phía trên bên phải của danh sách xe hiện tại.
- **Hình 2: Form cửa sổ bật lên (Modal) "Thêm xe mới"**
  - Form cửa sổ bật lên đè lên giao diện chính. Tác nhân thực hiện điền thông tin bao gồm: Ô nhập *Tên xe*, Ô nhập *Biển số xe*, Danh sách chọn *Loại xe*, Ô nhập *Tổng số ghế*, cùng 2 nút hành động **"Hủy"** và **"Lưu"** ở góc dưới.
- **Hình 3: Kết quả sau khi Thêm xe thành công**
  - Form cửa sổ bật lên đóng lại, hiển thị thông báo xanh *"Thêm xe mới thành công!"* ở góc trên bên phải màn hình. Xe mới vừa thêm xuất hiện ngay ở dòng đầu tiên của danh sách xe với các nhãn loại xe và trạng thái tương ứng.
