### 2.1. Đăng ký trở thành Nhà xe (Request Operator Approval)

#### 2.1.1. Mô tả
Cho phép người dùng (User) nộp đơn đăng ký trở thành đối tác Nhà xe (Operator) trên hệ thống GoTravel. Đơn đăng ký bao gồm các thông tin cơ bản của nhà xe (Tên nhà xe, Số điện thoại liên hệ, Địa chỉ trụ sở) sẽ được gửi đến Quản trị viên (Admin) xem xét. Chỉ khi Admin phê duyệt thành công, hệ thống mới chính thức tạo bản ghi Nhà xe (`Operator`) trong cơ sở dữ liệu.

#### 2.1.2. Tác nhân
- Người dùng (User)

#### 2.1.3. Tiền điều kiện
- Tác nhân đã đăng nhập thành công vào hệ thống với tài khoản người dùng (`USER`).
- Tác nhân chưa phải là Chủ nhà xe và chưa có đơn đăng ký nào ở trạng thái Chờ duyệt (`PENDING`).
- Tác nhân đang ở màn hình Đăng ký trở thành Nhà xe.

#### 2.1.4. Hậu điều kiện
- Đơn đăng ký trở thành Nhà xe được tạo và ghi nhận vào hệ thống ở trạng thái Chờ duyệt (`PENDING`).
- Bản ghi Nhà xe trong bảng `operators` của cơ sở dữ liệu **chưa được tạo** ở bước này (sẽ tự động tạo khi Admin bấm Phê duyệt ở Usecase 2.2).

#### 2.1.5. Quy tắc nghiệp vụ
- **Tên nhà xe (`name`)**: Bắt buộc nhập, độ dài từ 3 đến 100 ký tự (Ví dụ: "Nhà xe Phương Trang", "Nhà xe Hải Vân").
- **Số điện thoại liên hệ (`phone`)**: Bắt buộc nhập, đúng định dạng số điện thoại Việt Nam (10 chữ số).
- **Địa chỉ trụ sở (`address`)**: Bắt buộc nhập.
- **Ràng buộc trạng thái đơn**:
  - Trạng thái đơn mặc định khi gửi là `PENDING` (Chờ duyệt).
  - Một tài khoản chỉ được phép có duy nhất 1 đơn ở trạng thái `PENDING`. Nếu đã có đơn `PENDING`, hệ thống sẽ chặn không cho tạo đơn mới.
  - Nếu đơn trước đó bị Admin Từ chối (`REJECTED`), người dùng được phép chỉnh sửa lại thông tin và nộp lại đơn.

#### 2.1.6. Luồng chính
1. Tác nhân nhấn vào nút **"Đăng ký trở thành Nhà xe"** trên thanh điều hướng hoặc trang thông tin cá nhân.
2. Hệ thống chuyển hướng tác nhân đến màn hình Form **"Đăng ký trở thành Nhà xe"**.
3. Tác nhân nhập các thông tin cần thiết:
   - Tên nhà xe.
   - Số điện thoại liên hệ.
   - Địa chỉ trụ sở.
4. Tác nhân nhấn nút **"Gửi yêu cầu đăng ký"**.
5. Hệ thống kiểm tra tính hợp lệ của các thông tin đã nhập (tên nhà xe, định dạng SĐT, địa chỉ).
6. Hệ thống tạo đơn đăng ký mới ở trạng thái `PENDING` và lưu vào cơ sở dữ liệu.
7. Hệ thống hiển thị thông báo thành công: *"Gửi đơn đăng ký thành công! Yêu cầu của bạn đang chờ Admin xem xét và phê duyệt."*.
8. Hệ thống chuyển hướng tác nhân sang màn hình Theo dõi trạng thái đơn đăng ký.

#### 2.1.7. Luồng phát sinh
- **Luồng 1.a: Đã có đơn đăng ký đang chờ duyệt (`PENDING`)**:
  - Tại bước 1 hoặc 4, nếu tác nhân đã có một đơn đăng ký trước đó đang ở trạng thái `PENDING`, hệ thống chặn thao tác gửi đơn mới và hiển thị thông báo: *"Bạn đã có đơn đăng ký đang chờ Admin phê duyệt. Vui lòng chờ kết quả xử lý."*
- **Luồng 1.b: Nhập thiếu thông tin bắt buộc**:
  - Tại bước 5, nếu tác nhân bỏ trống thông tin bắt buộc (Tên nhà xe, SĐT, Địa chỉ), hệ thống báo lỗi viền đỏ các trường thiếu: *"Vui lòng nhập đầy đủ các thông tin bắt buộc."*
- **Luồng 1.c: Số điện thoại không hợp lệ**:
  - Tại bước 5, nếu số điện thoại không đúng định dạng 10 chữ số, hệ thống thông báo lỗi dưới ô SĐT: *"Số điện thoại liên hệ không hợp lệ."*
- **Luồng 4.a: Tác nhân hủy thao tác**:
  - Tại bước 3 hoặc 4, tác nhân nhấn nút **"Hủy"** hoặc nút **"Quay lại"**.
  - Hệ thống hủy thao tác và quay về trang trước đó mà không lưu đơn.

#### 2.1.8. Giao diện minh họa
- **Hình 1: Trang giới thiệu & Nút "Đăng ký ngay"**
  - Màn hình giới thiệu các quyền lợi dành cho đối tác Nhà xe trên ứng dụng GoTravel kèm nút hành động nổi bật màu xanh **"Đăng ký trở thành Nhà xe"**.
- **Hình 2: Form nhập thông tin đăng ký Nhà xe**
  - Màn hình chứa Form đăng ký bao gồm các trường: Ô nhập *Tên nhà xe*, Ô nhập *Số điện thoại liên hệ*, Ô nhập *Địa chỉ trụ sở* và 2 nút hành động **"Hủy"** và **"Gửi yêu cầu đăng ký"**.
- **Hình 3: Màn hình Theo dõi trạng thái đơn đăng ký (Trạng thái `PENDING`)**
  - Màn hình hiển thị thẻ thông báo màu vàng: *"Đơn đăng ký của bạn đang chờ Admin phê duyệt"*, đi kèm bảng tóm tắt lại các thông tin nhà xe đã nộp và nút **"Hủy đơn đăng ký"** nếu muốn rút đơn.
