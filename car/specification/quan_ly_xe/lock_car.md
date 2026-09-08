### 1.4. Khóa xe / Thay đổi trạng thái xe (Lock / Change Car Status)

#### 1.4.1. Mô tả
Cho phép Chủ nhà xe (Operator) thay đổi trạng thái hoạt động của một phương tiện xe khách (như: Hoạt động `ACTIVE`, Bảo trì / Hỏng `MAINTENANCE`, Tạm khóa `INACTIVE`) khi xe gặp sự cố hỏng hóc, nằm gara sửa chữa hoặc tạm thời không thể đưa vào khai thác. Xe ở trạng thái Bảo trì hoặc Tạm khóa sẽ bị hệ thống chặn chọn khi tạo các chuyến xe (`Trip`) mới.

#### 1.4.2. Tác nhân
- Chủ nhà xe (Operator / Host)

#### 1.4.3. Tiền điều kiện
- Tác nhân đã đăng nhập thành công vào hệ thống với tài khoản Chủ nhà xe.
- Tác nhân đang ở màn hình Danh sách xe.

#### 1.4.4. Hậu điều kiện
- Trạng thái mới của xe được lưu trữ vào cơ sở dữ liệu (`Car.status`).
- Danh sách xe hiển thị nhãn (Badge) trạng thái mới tương ứng.
- Hệ thống chặn không cho phép chọn xe này khi xếp lịch các chuyến xe (`Trip`) mới.

#### 1.4.5. Quy tắc nghiệp vụ
- **Quyền sở hữu**: Tác nhân chỉ được thay đổi trạng thái các xe thuộc sở hữu của nhà xe mình.
- **Định dạng các trạng thái xe (`status`)**:
  - `ACTIVE`: Xe đang hoạt động bình thường (Badge màu xanh lá - `Green`).
  - `MAINTENANCE`: Xe đang bảo trì / hỏng hóc (Badge màu vàng hổ phách - `Amber`).
  - `INACTIVE`: Xe tạm khóa / ngưng sử dụng (Badge màu xám hoặc đỏ - `Slate/Red`).
- **Cảnh báo chuyến xe đã bán vé (`SCHEDULED`)**:
  - Nếu xe bị chuyển sang `MAINTENANCE` hoặc `INACTIVE` trong khi **đang có các chuyến xe sắp chạy đã bán vé (`Ticket`)**, hệ thống sẽ đưa ra cảnh báo nhắc nhở để tác nhân chủ động điều phối xe thay thế.

#### 1.4.6. Luồng chính
1. Tại màn hình Danh sách xe, tác nhân nhấn vào nút công tắc trạng thái (Toggle) hoặc chọn thao tác **"Đổi trạng thái"** tại dòng của xe tương ứng.
2. Hệ thống hiển thị Form cửa sổ bật lên (Modal) **"Thay đổi trạng thái xe"**.
3. Tác nhân chọn trạng thái mới (Hoạt động / Bảo trì / Tạm khóa) và có thể nhập thêm lý do *(không bắt buộc)*.
4. Tác nhân nhấn nút **"Xác nhận"**.
5. Hệ thống kiểm tra các chuyến xe sắp tới của xe này.
6. Hệ thống lưu trạng thái mới của xe vào cơ sở dữ liệu.
7. Hệ thống hiển thị thông báo thành công: *"Cập nhật trạng thái xe thành công!"*.
8. Hệ thống tự động đóng Form cửa sổ bật lên (Modal) và cập nhật nhãn (Badge) trạng thái mới trên dòng của xe đó.

#### 1.4.7. Luồng phát sinh
- **Luồng 4.a: Cảnh báo xe đang có chuyến xe sắp chạy đã bán vé**:
  - Tại bước 5, nếu xe có các chuyến xe sắp chạy và đã bán vé cho khách, hệ thống hiển thị Dialog cảnh báo: *"Cảnh báo: Xe này đang có các chuyến xe sắp khởi hành đã bán vé. Việc chuyển trạng thái xe sẽ yêu cầu nhà xe điều phối xe thay thế!"*. Tác nhân có thể chọn **"Hủy"** hoặc bấm **"Vẫn tiếp tục"**.
- **Luồng 4.b: Tác nhân hủy thao tác**:
  - Tại bước 3 hoặc 4, tác nhân nhấn nút **"Hủy"** hoặc biểu tượng **"X"** trên góc Form.
  - Hệ thống đóng Form cửa sổ bật lên (Modal) mà không lưu bất kỳ thay đổi nào.

#### 1.4.8. Giao diện minh họa
- **Hình 1: Thao tác chọn Đổi trạng thái xe từ Danh sách xe**
  - Tác nhân tìm đến xe cần thay đổi và nhấn vào nút công tắc trạng thái (Toggle) hoặc menu nút **"Đổi trạng thái"** tại cột Thao tác.
- **Hình 2: Form cửa sổ bật lên (Modal) "Thay đổi trạng thái xe"**
  - Form hiển thị danh sách radio chọn trạng thái (`Hoạt động`, `Bảo trì / Hỏng`, `Tạm khóa`) kèm ô nhập ghi chú/lý do và 2 nút hành động **"Hủy"** và **"Xác nhận"**.
- **Hình 3: Kết quả sau khi Khóa / Đổi trạng thái xe thành công**
  - Form đóng lại, hiển thị thông báo xanh *"Cập nhật trạng thái xe thành công!"* ở góc trên bên phải. Nhãn (Badge) trạng thái của xe tương ứng lập tức đổi màu (ví dụ: Badge màu vàng *"Đang bảo trì"* hoặc màu xám *"Tạm khóa"*).
