# **TÀI LIỆU TỔNG THỂ DỰ ÁN GOTRAVEL (MASTER DOCUMENT)**
**Tên dự án:** Nền tảng kết nối Lưu trú và Trải nghiệm du lịch GoTravel

**Slogan:** *"Du lịch không chỉ là đi, mà là thuộc về nơi bạn đến."*

**Mô hình kinh doanh:** B2B2C / C2C (Marketplace tích hợp OTA)

**Kiến trúc hệ thống:** Microservices + CQRS

**Đội ngũ phát triển:** Cao Đức Trung (Tech Lead/Node.js), Nguyễn Thành Nhân (Java Backend), Lê Đức Long (Frontend/Next.js).
## **PHẦN 1: TƯ DUY SẢN PHẨM & TRIẾT LÝ CỐT LÕI (PRODUCT PHILOSOPHY)**
GoTravel không được sinh ra để trở thành một bản sao (clone) của Booking.com hay Airbnb. Nó được thiết kế để giải quyết sự "phân mảnh" của ngành du lịch bằng 4 triết lý tư duy cốt lõi:
### **1. Tư duy "Lấy địa danh làm trung tâm" (Landmark-Centric)**
- **Vấn đề cũ:** Các nền tảng OTA truyền thống bắt người dùng tìm kiếm theo Tỉnh/Thành phố (Ví dụ: "Hà Giang"). Điều này quá rộng và khiến khách hàng khó tìm được chỗ ở gần các điểm tham quan cụ thể.
- **Tư duy GoTravel:** Khách hàng đi du lịch vì một danh lam thắng cảnh. Hệ thống sử dụng **Địa danh (Landmark)** làm mỏ neo không gian. Khi người dùng tìm "Thác Bản Giốc", hệ thống (dùng PostGIS) sẽ dùng tọa độ tâm để quét một vòng tròn bán kính 5km, vớt lên toàn bộ Khách sạn, Tour, Dịch vụ xung quanh đó.
### **2. Tư duy "Giỏ hàng hợp nhất đa hình" (Polymorphic Universal Cart)**
- **Vấn đề cũ:** Airbnb hay Booking bắt thanh toán ngay sau khi chọn 1 phòng. Klook bắt thanh toán riêng từng vé. Trải nghiệm bị đứt gãy.
- **Tư duy GoTravel:** Khách hàng có thể "đi chợ" du lịch. Họ có thể nhặt 1 phòng Homestay (tính theo đêm), 2 vé Trekking (tính theo người/ca), 1 dịch vụ thuê xe máy (tính theo lượt) vào chung MỘT giỏ hàng, và quẹt thẻ thanh toán 1 lần duy nhất.
### **3. Tư duy "Hệ sinh thái Bán chéo" (Cross-selling Engine)**
- **Tư duy GoTravel:** Không để tiền rơi. Khi khách hàng vừa chốt thêm 1 khách sạn vào giỏ, hệ thống tự động chạy ngầm thuật toán gợi ý các dịch vụ vệ tinh (Thuê xe, massage, nhà hàng) nằm gần khách sạn đó trong cùng khoảng thời gian lưu trú để kích thích mua thêm.
### **4. Tư duy "Tài chính minh bạch - Zero Trust" (Escrow Wallet)**
- **Tư duy GoTravel:** Bảo vệ cả người mua lẫn người bán. Tiền khách hàng thanh toán qua VNPay không bay thẳng vào túi Host, mà bị giữ ở **Ví trung gian (Escrow Wallet)** của hệ thống. Chỉ khi chuyến đi kết thúc an toàn, hệ thống mới trừ % hoa hồng và "Nhả" tiền (Payout) cho Host rút về ngân hàng.
## **PHẦN 2: ĐỐI TƯỢNG NGƯỜI DÙNG & PHÂN QUYỀN (ACTORS & RBAC)**
Hệ thống xoay quanh 5 nhóm đối tượng, được quản lý bằng kiến trúc Account-Profile:

1. **Guest (Khách vãng lai):** Tạo traffic, được tìm kiếm, đọc review nhưng không được mua hàng.
1. **End-User (Khách du lịch):** Người mua hàng, tạo ra dòng tiền. Có Giỏ hàng, có Lịch sử chuyến đi, có quyền Đánh giá và Báo cáo vi phạm.
1. **Individual Host (Host cá nhân):** Người kinh doanh nhỏ lẻ. Bắt buộc nộp hồ sơ **e-KYC (CCCD)**. Có quyền tạo Dịch vụ lẻ, setup giá động, theo dõi Ví tiền.
1. **Enterprise Host (Doanh nghiệp):** Các tập đoàn lớn. Bắt buộc nộp **Pháp nhân (Giấy phép KD B2B)**. Sở hữu đặc quyền **Tạo Siêu tổ hợp (Complex)** - cho phép gom hàng chục khách sạn, cáp treo trực thuộc vào chung một thương hiệu để quản lý doanh thu tập trung.
1. **Admin System (Quản trị viên):** Người cầm cân nảy mực. Có quyền: Khóa tài khoản, Duyệt/Từ chối e-KYC, Duyệt Địa danh, Cấu hình Hoa hồng, và đặc biệt là quyền **Hủy đơn bắt buộc & Ra lệnh hoàn tiền (Refund)** khi xảy ra tranh chấp.
## **PHẦN 3: KIẾN TRÚC KỸ THUẬT & CÔNG NGHỆ (TECH STACK & ARCHITECTURE)**
Hệ thống áp dụng kiến trúc **Microservices** kết hợp **CQRS (Command Query Responsibility Segregation)**, tuân thủ nguyên lý Polyglot (Đa ngôn ngữ, đa cơ sở dữ liệu).
### **1. Luồng Command (Ghi/Logic Lõi) - Tối ưu tính toàn vẹn (ACID)**
- **Công nghệ:** Java Spring Boot + PostgreSQL.
- **Lý do:** Đòi hỏi xử lý giao dịch tài chính, khóa phòng không được phép sai lệch 1 byte.
- **Các Service gánh vác:**
  - *Identity Service:* Cấp JWT, mã hóa Bcrypt, lưu trữ public key RSA.
  - *Catalog Service:* Quản lý kho dữ liệu đa hình khổng lồ.
  - *Booking & Inventory Service:* Nơi chứa vũ khí **Optimistic Locking (@Version)** để chống Overbooking.
  - *Order & Payment Service:* Xử lý Transaction, Giỏ hàng, kết nối VNPay và quản lý Ví Escrow.
### **2. Luồng Query (Đọc/Tìm kiếm) - Tối ưu tốc độ cao (High I/O)**
- **Công nghệ:** Node.js (Express) + PostGIS + Redis.
- **Lý do:** Tính chất Non-blocking I/O của Node.js xử lý hàng chục ngàn lượt khách lướt tìm kiếm cực nhanh mà không tốn RAM.
- **Các Service gánh vác:**
  - *API Gateway:* Đón 100% traffic, định tuyến, rate limiting.
  - *Search Service:* Query PostGIS quét bán kính không gian.
  - *Recommendation Engine:* Chạy thuật toán gợi ý chéo.
  - *Media & Comm Service:* Stream ảnh lên Cloudinary vùng Private (bảo mật CCCD) và gửi Email tự động.
### **3. Tầng Giao diện (Frontend)**
- **Công nghệ:** Next.js (React) + TailwindCSS.
- **Lý do:** Tối ưu hóa **SEO** thông qua kết xuất phía máy chủ (SSR). Giúp Google dễ dàng lập chỉ mục (index) các trang Địa danh và Dịch vụ, kéo nguồn khách tự nhiên (Organic Traffic) khổng lồ cho nền tảng.
### **4. Thiết kế Database: Kỹ thuật JSONB Đa hình**
Thay vì tạo 3 bảng riêng cho Khách sạn, Tour, và Dịch vụ, hệ thống gộp chung vào bảng Listings. Các thông tin dùng chung (Giá, Tên, Tọa độ) là cột cứng. Các thông tin chuyên biệt (Số giường, Giờ tour) được nhét vào cột attributes kiểu dữ liệu **JSONB** của PostgreSQL. Giúp thiết kế cực kỳ linh hoạt và dễ mở rộng sau này.
## **PHẦN 4: CÁC LUỒNG HOẠT ĐỘNG "SỐNG CÒN" CỦA DỰ ÁN**
Để dự án hoạt động, đây là các kịch bản bắt buộc phải chạy trơn tru:
### **Luồng 1: Bảo vệ quyền riêng tư & Dữ liệu rác**
1. Admin là người duy nhất được tạo **Địa danh Mỏ neo**. Host chỉ được "Đề xuất". Tránh tình trạng rác dữ liệu, 1 địa danh có 10 tên khác nhau.
1. Ảnh CCCD/GPKD của Host được đẩy lên **Private Cloudinary**, chỉ Admin có chữ ký số mới xem được. Bảo vệ tuyệt đối thông tin PII theo luật pháp.
### **Luồng 2: Cơ chế chống Overbooking (Khóa Slot 15 phút)**
*Được kích hoạt khi khách hàng bấm nút "Thanh toán".*

1. Order Service gọi nội bộ sang Inventory Service.
1. Inventory Service mở Giao dịch, trừ số lượng phòng trống, tạo một bản ghi Lock có thời hạn 15 phút.
1. Nếu có 2 khách cùng bấm thanh toán phòng cuối cùng ở cùng 1 mili-giây ![ref1] Cờ @Version của Spring Boot sẽ văng lỗi Conflict (409) cho người chậm tay hơn, bảo vệ CSDL.
1. Có 1 Job chạy ngầm 1 phút/lần. Quá 15 phút khách không trả tiền, Job tự động nhả phòng ra.
### **Luồng 3: Vòng đời của một Đơn hàng và Dòng tiền**
1. Khách quẹt thẻ VNPay ![ref1] Hệ thống nhận Webhook IPN ![ref1] Đơn hàng thành PAID ![ref1] Tiền chui vào Ví Escrow (Tiền đóng băng).
1. Khách đi du lịch về ![ref1] Host bấm "Hoàn tất chuyến đi".
1. Hệ thống tính % Hoa hồng cho sàn ![ref1] Đẩy phần tiền còn lại sang "Ví Khả dụng" của Host.
1. Host tạo lệnh Rút tiền (Payout) ![ref1] Admin (Kế toán) duyệt thủ công ![ref1] Tiền về thẻ ngân hàng thật của Host.
### **Luồng 4: Giải quyết Tranh chấp & Hoàn tiền (Refund)**
- Khách tố cáo Host lừa đảo. Admin kiểm tra bằng chứng.
- Admin bấm **"Hủy đơn bắt buộc"**. Hệ thống tự động gọi API Refund sang VNPay, rút tiền từ Ví Escrow trả lại thẳng vào thẻ tín dụng cho khách hàng.
## **PHẦN 5: ĐÁNH GIÁ TỔNG QUAN**
GoTravel là một bài toán **Enterprise-level** (Cấp độ doanh nghiệp) được thu nhỏ. Dự án hội tụ đầy đủ các thách thức khó nhất của ngành phần mềm:

- Xử lý bài toán hóc búa về Tồn kho đồng thời (Concurrency Inventory).
- Giao tiếp và đảm bảo tính toàn vẹn dữ liệu (Data Consistency) giữa nhiều Microservices (S2S).
- Xử lý dòng tiền (Cash-flow) và tích hợp cổng thanh toán bên thứ ba (Webhooks).
- Tính toán không gian địa lý (Geospatial) bằng PostGIS.
- Tư duy sản phẩm (Product Mindset) hiện đại với Giỏ hàng đa hình và bán chéo.

Với quỹ thời gian 5 tuần và nguồn lực 3 lập trình viên, dự án yêu cầu tính kỷ luật (Agile/Scrum), sự giao tiếp chặt chẽ thông qua API Contract, và năng lực triển khai kỹ thuật vượt trội.






**Phân tích sâu các mục** 
# **PHẦN 1: TƯ DUY SẢN PHẨM & TRIẾT LÝ CỐT LÕI (PRODUCT PHILOSOPHY)**
GoTravel không được sinh ra để trở thành một bản sao (clone) của Booking.com, Agoda hay Airbnb. Nền tảng được thai nghén từ việc phân tích những nỗi đau (Pain-points) thực tế của du khách Việt Nam và được thiết kế để giải quyết sự "phân mảnh" của ngành du lịch.

Hệ thống vận hành dựa trên **4 triết lý tư duy cốt lõi**, biến GoTravel thành một hệ sinh thái Du lịch "Tất cả trong một" (All-in-one Travel Ecosystem).
## **1. Tư duy "Lấy địa danh làm trung tâm" (Landmark-Centric)**
### **Nỗi đau của thị trường (Pain-point):**
Các nền tảng OTA truyền thống bắt buộc người dùng tìm kiếm theo ranh giới hành chính (Thành phố/Tỉnh). Ví dụ, du khách tìm "Hà Giang" sẽ nhận được hàng ngàn khách sạn rải rác khắp tỉnh. Khi họ muốn đi "Sông Nho Quế", họ vô tình đặt nhầm khách sạn cách đó... 50km vì cùng thuộc tỉnh Hà Giang. Sự cứng nhắc này khiến việc tự lên kế hoạch di chuyển trở thành ác mộng.
### **Giải pháp của GoTravel:**
Con người đi du lịch vì một **Danh lam thắng cảnh (Landmark)**, không phải vì cái tên Tỉnh/Thành phố. Hệ thống GoTravel thay đổi hoàn toàn gốc rễ tìm kiếm:

- **Mỏ neo Không gian:** Admin hệ thống sẽ khởi tạo các "Địa danh gốc" (Ví dụ: Thác Bản Giốc, Đỉnh Fansipan, Phố cổ Hội An) với tọa độ GPS chuẩn xác làm mỏ neo.
- **Quét bán kính:** Khi người dùng chọn "Thác Bản Giốc", hệ thống sẽ lấy tọa độ tâm của thác, vẽ một vòng tròn bán kính 5km - 10km và rà quét để vớt lên toàn bộ Khách sạn, Tour trải nghiệm, Chỗ thuê xe máy nằm xung quanh đó.
- **Kết nối kỹ thuật:** Triết lý này là lý do dự án bắt buộc phải sử dụng **Hệ quản trị CSDL Không gian (PostGIS)** kết hợp với Node.js. Thay vì dùng lệnh LIKE tìm tên tỉnh tốn thời gian, hệ thống dùng hàm ST\_DWithin để đo khoảng cách thực tế trên bản đồ vệ tinh, mang lại độ chính xác tuyệt đối cho du khách.
## **2. Tư duy "Giỏ hàng hợp nhất đa hình" (Polymorphic Universal Cart)**
### **Nỗi đau của thị trường (Pain-point):**
Hành trình của một du khách tự túc hiện nay bị đứt gãy nghiêm trọng. Họ lên Booking.com đặt phòng (thanh toán lần 1), tải Klook về đặt vé cáp treo (thanh toán lần 2), và lên Facebook gọi điện thuê xe máy (thanh toán tiền mặt). Tỷ lệ rớt đơn (Drop-off rate) rất cao vì trải nghiệm mua sắm quá mệt mỏi.
### **Giải pháp của GoTravel:**
Xây dựng trải nghiệm "Đi chợ du lịch" xuyên suốt bằng khái niệm **Giỏ hàng hợp nhất**.

- **Gom mọi thứ vào một giỏ:** Khách hàng có thể "nhặt" 1 phòng Homestay (thuộc tính tính theo đêm), 2 vé Trekking (thuộc tính tính theo người/ca/kíp), và 1 dịch vụ thuê xe máy (thuộc tính tính theo lượt) vào chung MỘT giỏ hàng duy nhất.
- **Thanh toán 1 lần (Single Checkout):** Người dùng chỉ cần quẹt thẻ qua VNPay đúng một lần để thanh toán cho 3 dịch vụ thuộc về 3 chủ nhà (Host) khác nhau.
- **Kết nối kỹ thuật:** Để làm được điều này, GoTravel áp dụng kiến trúc **JSONB Đa hình (Polymorphism)** trong PostgreSQL để lưu trữ cấu trúc hàng hóa khác nhau vào chung một bảng Listings, và xử lý tách hóa đơn phức tạp tại Order Service.
## **3. Tư duy "Hệ sinh thái Bán chéo" (Cross-selling Engine)**
### **Nỗi đau của thị trường (Pain-point):**
Tại các địa phương, Host A có phòng nghỉ, Host B có xe máy cho thuê, Host C dẫn tour bản địa. Tuy nhiên, họ hoạt động rời rạc. Một du khách đặt phòng của Host A không hề biết Host B có xe cho thuê ngay sát vách. Các OTA hiện tại đang bỏ lỡ hàng tỷ đồng từ việc không khai thác được giá trị gia tăng (AOV) của khách hàng.
### **Giải pháp của GoTravel:**
Áp dụng tư duy **"Không để tiền rơi"** bằng Động cơ Gợi ý (Recommendation Engine) chạy tự động.

- **Đề xuất đúng lúc, đúng chỗ:** Ngay giây phút khách hàng nhấn nút "Thêm Khách sạn vào giỏ", hệ thống ngầm lấy Tọa độ của khách sạn đó + Khoảng thời gian Check-in/Check-out mà khách vừa chọn.
- **Gợi ý tự động:** Trình duyệt lập tức hiển thị: *"Có thể bạn sẽ cần: Thuê xe máy cách khách sạn của bạn 200m (Còn xe trong ngày bạn đến)"*.
- **Giá trị kinh doanh:** Tính năng này biến GoTravel thành một "siêu cò" kết nối các dịch vụ địa phương lại với nhau, thúc đẩy nền kinh tế bản địa và mang lại nguồn thu phí hoa hồng khổng lồ cho hệ thống.
## **4. Tư duy "Tài chính minh bạch - Zero Trust" (Escrow Wallet)**
### **Nỗi đau của thị trường (Pain-point):**
Nạn lừa đảo "Booking ảo" tràn lan trên các hội nhóm du lịch. Khách hàng chuyển khoản cọc 50% nhưng đến nơi chủ nhà báo hết phòng hoặc mất liên lạc. Ngược lại, chủ nhà cũng sợ bị khách "bùng" cọc sát giờ. Thiếu niềm tin là rào cản lớn nhất ngăn cản du khách đặt dịch vụ qua mạng.
### <a name="_ymd5cu1enj9j"></a>**Giải pháp của GoTravel:**
Áp dụng cơ chế **Zero Trust (Không tin tưởng ai)** và **Ví trung gian (Escrow Wallet)** để bảo vệ tuyệt đối dòng tiền.

- **Tiền bị Đóng băng:** Khi khách hàng quẹt thẻ VNPay, tiền không bay thẳng vào tài khoản của Host. Dòng tiền này được hệ thống GoTravel "Giữ hộ" và ghi nhận vào cột balance\_escrow (Ví đóng băng). Cả khách và Host đều yên tâm vì nền tảng đang cầm tiền.
- **Giải ngân an toàn:** Chỉ khi khách hàng đến nơi, ở xong và kết thúc chuyến đi (Không có khiếu nại hay tranh chấp), Host mới được phép ấn nút "Xác nhận hoàn tất". Lúc này, hệ thống sẽ tự động trừ đi % Hoa hồng của GoTravel, và nhả phần tiền còn lại vào Ví khả dụng (balance\_avail) cho Host rút về ngân hàng.
- **Công lý thuộc về Admin:** Nếu Host lừa đảo, Admin dùng quyền "Hủy đơn bắt buộc" để lập tức hoàn tiền 100% (Refund) từ Ví Escrow trả thẳng về thẻ tín dụng cho khách. Xóa bỏ hoàn toàn nạn lừa đảo du lịch.
# **PHẦN 2: ĐỐI TƯỢNG NGƯỜI DÙNG & KIẾN TRÚC PHÂN QUYỀN (ACTORS & RBAC)**
Để đảm bảo hệ thống vừa dễ dàng mở rộng (Scalable), vừa bảo mật tuyệt đối (Secure), GoTravel áp dụng kiến trúc **Account - Profile Pattern**.

- **Account (Tài khoản):** Chỉ lưu trữ thông tin đăng nhập cốt lõi (Email, Password Hash, Role) tại Identity Service.
- **Profile (Hồ sơ):** Lưu trữ thông tin nghiệp vụ chi tiết (Thông tin e-KYC, Mã số thuế, Giấy phép kinh doanh) và liên kết khóa ngoại linh hoạt.

Kiến trúc này phục vụ cho 5 nhóm Tác nhân (Actors) với các ranh giới quyền hạn được vạch ra cực kỳ nghiêm ngặt:
## **1. Khách vãng lai (Guest) - "Người mang lại lưu lượng"**
- **Định vị nghiệp vụ:** Là những người dùng truy cập web/app qua Google Search hoặc quảng cáo nhưng chưa đăng nhập. Nhóm này là mục tiêu tối thượng của các chiến dịch SEO (Nhờ ứng dụng Next.js SSR).
- **Đặc quyền Khám phá (Read-Only):**
  - Tương tác với bản đồ và tìm kiếm không gian (Spatial Search) quanh Địa danh gốc.
  - Xem toàn bộ chi tiết Phòng/Tour, lịch trống, giá cả và đọc hàng ngàn bài đánh giá của người dùng trước.
- **Chốt chặn hệ thống:** Ngay khi Guest bấm "Thêm vào giỏ" hoặc "Viết đánh giá", API Gateway sẽ lập tức đánh chặn (báo lỗi 401 Unauthorized) và yêu cầu đăng nhập/đăng ký.
## **2. Khách du lịch (End-User) - "Dòng máu của nền tảng"**
- **Định vị nghiệp vụ:** Là người dùng cuối (Buyer), tác nhân duy nhất nạp tiền (Cash-in) vào hệ thống để nuôi sống nền tảng và các Đối tác.
- **Đặc quyền Giao dịch & Tương tác:**
  1. **Toàn quyền Giỏ hàng:** Sở hữu "Giỏ hàng hợp nhất đa hình", gom phòng, vé, tour vào chung và thanh toán 1 lần qua VNPay.
  1. **Kích hoạt Khóa Slot (Soft-lock):** Hành động bấm "Thanh toán" của End-User có sức mạnh kích hoạt luồng Transaction dưới Database của Inventory Service để khóa phòng 15 phút.
  1. **Quyền lực Hậu mãi:** Cung cấp vũ khí tối thượng là "Đánh giá & Chấm sao" (Rating). Nếu bị lừa đảo, End-User có quyền kích hoạt luồng "Tranh chấp/Khiếu nại" để gọi Admin vào xử lý và đòi Hoàn tiền (Refund).
## **3. Host Cá nhân (Individual Host) - "Những mảnh ghép bản địa"**
- **Định vị nghiệp vụ:** Là các hộ kinh doanh nhỏ lẻ, chủ homestay, người dân bản địa dẫn tour. Đây là nhóm tạo ra linh hồn "Trải nghiệm văn hóa" cho GoTravel.
- **Rào cản Pháp lý (Onboarding):** Bắt buộc phải thực hiện e-KYC (Tải lên CCCD mặt trước/sau và ảnh chân dung). Dữ liệu này được mã hóa và lưu tại vùng Private của Cloudinary, tuân thủ Luật Bảo vệ Dữ liệu Cá nhân.
- **Đặc quyền Kinh doanh:**
  - Toàn quyền thao tác CRUD (Tạo, Sửa, Ẩn, Xóa mềm) đối với các Dịch vụ lẻ (Listing) thuộc sở hữu của mình.
  - Cài đặt giá động (Dynamic Pricing) theo ngày lễ/tết và mở/đóng lịch trống.
  - **Làm chủ dòng tiền:** Theo dõi Ví Escrow (Tiền đang bị đóng băng chờ khách đi xong) và Ví khả dụng. Đặt lệnh Rút tiền (Payout) về số tài khoản ngân hàng chính chủ đã đăng ký.
## **4. Host Doanh nghiệp (Enterprise Host) - "Hệ sinh thái khổng lồ"**
- **Định vị nghiệp vụ:** Là các tập đoàn quản lý chuỗi khách sạn, khu nghỉ dưỡng (Resorts), công ty du lịch lớn.
- **Rào cản Pháp lý B2B:** Phải cung cấp Mã số thuế (Tax Code - Unique) và bản scan Giấy phép Đăng ký Kinh doanh.
- **Đặc quyền Siêu Tổ hợp (Complex Management):**
  - Kế thừa toàn bộ quyền của Host cá nhân.
  - Có khả năng khởi tạo các **Siêu Tổ hợp (Complex)**. Ví dụ: Tạo tổ hợp "Sun World Fansipan", sau đó tạo ra 1 Khách sạn, 1 Vé cáp treo, 1 Vé Buffet và "gói" tất cả chúng vào bên trong tổ hợp này.
  - Cung cấp các công cụ báo cáo tài chính, xuất hóa đơn VAT và thống kê doanh thu chéo tổng thể cho toàn bộ doanh nghiệp.
## **5. Quản trị viên (Admin System) - "Tòa án tối cao"**
- **Định vị nghiệp vụ:** Đội ngũ Back-office của nền tảng. Không kinh doanh, không tạo phòng, chỉ đóng vai trò kiểm soát rủi ro (Risk Management) và dọn dẹp hệ thống.
- **Đặc quyền Định hướng không gian:** Là người duy nhất được chốt tọa độ GPS để tạo ra các "Địa danh Mỏ neo" (Landmark Core).
- **Đặc quyền Kiểm duyệt (Moderation):**
  1. Nắm quyền sinh sát (Approve/Reject) hồ sơ e-KYC và B2B của giới chủ.
  1. Có quyền Ẩn/Xóa bắt buộc các dịch vụ "treo đầu dê bán thịt chó" hoặc Đánh giá thô tục mà không cần Host đồng ý. Khóa (Ban) tài khoản vi phạm ngay lập tức.
- **Đặc quyền Tài chính & Kế toán (Accountant):**
  1. Thiết lập linh hoạt % Hoa hồng chiết khấu của nền tảng.
  1. Phê duyệt các lệnh Rút tiền (Payout) để giải ngân tiền thực cho Host.
  1. **Vũ khí tối thượng - Force Cancel & Refund:** Khi khách bị lừa đảo, Admin dùng nút "Hủy bắt buộc" để hệ thống tự động chọc API vào Cổng VNPay, rút tiền từ Ví Escrow trả thẳng về thẻ cho khách hàng.
## <a name="_utaxrbh6qrbd"></a>**KIẾN TRÚC KỸ THUẬT CHO RBAC TẠI BƯỚC NÀY**
GoTravel không để Database bị quá tải bởi việc check quyền liên tục. Khi người dùng (User/Host/Admin) đăng nhập, Identity Service sẽ ký một đoạn mã **JWT (JSON Web Token)** chứa payload: {"user\_id": "uuid", "role": "ENTERPRISE"}.

Tại cổng **API Gateway**, mọi Request sẽ được chặn lại để kiểm tra tính hợp lệ của Token thông qua **Public Key RSA**. Nếu một tác nhân USER cố tình gửi API gọi hàm POST /complexes (Tạo tổ hợp của Doanh nghiệp), Gateway sẽ văng lỗi 403 Forbidden ngay lập tức mà không cần gọi xuống Database.
# **CHƯƠNG 3: PHÂN TÍCH YÊU CẦU VÀ QUY TRÌNH NGHIỆP VỤ**
Chương này trình bày chi tiết về quá trình khảo sát, phân tích yêu cầu của hệ thống GoTravel. Từ việc xác định các yêu cầu chức năng, phi chức năng, cho đến việc mô hình hóa các quy trình nghiệp vụ lõi và đặc tả các ca sử dụng (Use Case). Đây là cơ sở nền tảng để thiết kế kiến trúc Microservices ở các chương tiếp theo.
## **3.1. Các yêu cầu của hệ thống**
Để đảm bảo hệ thống GoTravel giải quyết triệt để bài toán kinh doanh của một nền tảng OTA (Online Travel Agent) đa dịch vụ theo định hướng **Landmark-Centric (Lấy địa danh làm trung tâm)**, các yêu cầu của hệ thống được định nghĩa một cách nghiêm ngặt.
### **3.1.1. Yêu cầu chức năng (Functional Requirements)**
Yêu cầu chức năng mô tả những hành động mà hệ thống phải thực hiện, được phân chia theo các nhóm đối tượng (Actor) tham gia vào nền tảng:

**a. Nhóm Khách vãng lai & Khách du lịch (Guest/User)**

- **Tìm kiếm Không gian (Spatial Search):** Cho phép người dùng tìm kiếm Khách sạn, Trải nghiệm (Tour) và Dịch vụ tiện ích trong bán kính quy định xung quanh một Địa danh (Landmark) mỏ neo.
- **Quản lý Giỏ hàng Đa hình (Polymorphic Cart):** Cho phép người dùng thêm nhiều loại hình dịch vụ khác nhau (Lưu trú tính theo đêm, Tour tính theo vé/giờ) vào chung một giỏ hàng.
- **Thanh toán gộp (Single Checkout):** Thanh toán toàn bộ giỏ hàng trong một lần duy nhất qua cổng VNPay/MoMo.
- **Đánh giá và Phản hồi:** Để lại điểm đánh giá (Rating) và bình luận (Review) cho những dịch vụ đã trải nghiệm thành công.

**b. Nhóm Chủ cung cấp dịch vụ (Host/Enterprise)**

- **Định danh điện tử (e-KYC & B2B):** Gửi hồ sơ Căn cước công dân (Cá nhân) hoặc Giấy phép kinh doanh (Doanh nghiệp) để hệ thống định danh trước khi bán hàng.
- **Quản lý Dịch vụ & Tổ hợp (Catalog Management):** Thêm, sửa, ẩn các sản phẩm kinh doanh. Đối với Doanh nghiệp, cho phép tạo các "Siêu tổ hợp" (Complex) để nhóm các dịch vụ con lại với nhau.
- **Quản lý Tồn kho & Giá động:** Thiết lập lịch trống (Availability) và cài đặt giá khác nhau theo từng ngày (Lễ, Tết).
- **Quản lý Dòng tiền (Escrow Wallet):** Theo dõi ví điện tử trung gian, xem số dư đang bị hệ thống đóng băng và đặt lệnh rút tiền (Payout) về tài khoản ngân hàng.

**c. Nhóm Quản trị viên (Admin System)**

- **Quản trị Địa danh:** Tạo và chốt tọa độ GPS cho các Landmark chính thức để hệ thống Search quét không gian.
- **Kiểm duyệt Hệ thống:** Phê duyệt hồ sơ đối tác, ẩn/xóa các đánh giá vi phạm hoặc các dịch vụ sai sự thật.
- **Đối soát Tài chính:** Cấu hình tỷ lệ hoa hồng nền tảng, duyệt lệnh rút tiền của Host và ra lệnh hoàn tiền (Refund) bắt buộc khi xử lý tranh chấp.
### **3.1.2. Yêu cầu phi chức năng (Non-functional Requirements)**
- **Hiệu năng và Thời gian phản hồi (Performance):** Các luồng truy vấn đọc (Tìm kiếm, Gợi ý chéo) phải đạt thời gian phản hồi dưới 200ms thông qua việc tối ưu I/O bất đồng bộ của Node.js.
- **Tính toàn vẹn dữ liệu (ACID & Concurrency):** Luồng đặt phòng bắt buộc phải có cơ chế Khóa chỗ tạm thời (Soft-lock 15 phút). Hệ thống phải chống lại hiện tượng bán lố phòng (Overbooking) bằng kỹ thuật Optimistic Locking khi có nhiều người dùng cùng thanh toán một thời điểm.
- **Tính bảo mật (Security):** Áp dụng xác thực không trạng thái (Stateless Authentication) bằng **JWT (JSON Web Token)** kết hợp thuật toán mã hóa bất đối xứng **RSA**. Public Keys được chia sẻ nội bộ giúp các dịch vụ tự xác thực mà không làm nghẽn cổ chai Identity Service.
- **Khả năng mở rộng (Scalability):** Áp dụng nguyên lý *Database-per-service*, cho phép từng microservice được nhân bản (scale) độc lập tùy theo lưu lượng truy cập thực tế.
## **3.2. Các ràng buộc của dự án**
Trong quá trình phát triển và vận hành, hệ thống phải tuân thủ các giới hạn và quy định sau:
### **3.2.1. Ràng buộc về triển khai (Server, Network)**
1. Ứng dụng phải được thiết kế theo chuẩn Cloud-Native, đóng gói bằng Docker (Containerization) để đảm bảo tính đồng nhất giữa môi trường Development và Production.
1. Mọi luồng giao tiếp từ Client (Frontend) bắt buộc phải đi qua một điểm duy nhất là **API Gateway** để kiểm soát định tuyến và xác thực Token. Tuyệt đối không để lộ các cổng (port) của các service Java/Node.js nội bộ ra ngoài Internet.
### **3.2.2. Ràng buộc về kinh tế (Chi phí vận hành)**
- Do là dự án đồ án thực nghiệm, hệ thống bị giới hạn về ngân sách duy trì hạ tầng Cloud. Giải pháp là tối đa hóa việc sử dụng các công nghệ mã nguồn mở (Java, Node.js, PostgreSQL, ReactJS).
- Kiến trúc Microservices sẽ được cấu hình tối ưu bộ nhớ (Memory footprint) để có thể chạy mượt mà trên các cụm máy chủ cấu hình tầm trung.
### **3.2.3. Ràng buộc về đạo đức và pháp lý (Quyền riêng tư)**
- **Bảo vệ dữ liệu cá nhân:** Tuân thủ quy định về bảo vệ dữ liệu cá nhân (NĐ 13/2023/NĐ-CP). Hình ảnh CCCD của người dùng phải được mã hóa và lưu trữ tại phân vùng Private, không được phép truy cập qua URL công khai.
- **An toàn tài chính:** Tuân thủ luật phòng chống rửa tiền (AML), tiền của khách hàng nạp vào phải được đưa vào Ví đóng băng (Escrow). Host chỉ được rút tiền về số tài khoản ngân hàng chính chủ đã xác minh trùng khớp với CCCD/GPKD.
## **3.3. Mô hình hóa quy trình nghiệp vụ**
### **3.3.1. Bảng danh sách các quy trình nghiệp vụ cốt lõi**

|**Mã QT**|**Tên quy trình nghiệp vụ**|**Tác nhân chính (Actor)**|**Mô tả tóm tắt**|
| :- | :- | :- | :- |
|**QT-01**|Đăng ký & Định danh Host (e-KYC)|User, Admin|Luồng người dùng gửi hồ sơ e-KYC để nâng cấp thành nhà cung cấp (Host) và Admin xét duyệt.|
|**QT-02**|Khởi tạo Dịch vụ đa hình|Host, Enterprise|Luồng Host tạo thông tin cho Phòng, Tour, Dịch vụ kèm thuộc tính JSONB động và lịch trống.|
|**QT-03**|Tìm kiếm & Gợi ý chéo|Guest, User|Luồng người dùng tìm kiếm theo Địa danh và hệ thống tự động gợi ý các dịch vụ liên quan (Cross-selling).|
|**QT-04**|Đặt dịch vụ & Thanh toán (Checkout)|User, Cổng VNPay|Luồng chốt Giỏ hàng, khóa phòng chống Overbooking và thanh toán gộp 1 lần.|
|**QT-05**|Đối soát & Rút tiền (Payout)|Host, Admin|Luồng Host yêu cầu rút tiền từ Ví Escrow về tài khoản ngân hàng sau khi hoàn tất dịch vụ.|
### **3.3.2. Biểu đồ hoạt động (Activity Diagram) và giải thích chi tiết**
Để làm rõ cách hệ thống vận hành, đồ án lựa chọn phân tích sâu quy trình phức tạp nhất: **Quy trình Đặt dịch vụ & Thanh toán gộp (QT-04)**.

**A. Biểu đồ hoạt động (Activity Diagram)**

@startuml\
skinparam roundcorner 5\
skinparam maxmessagesize 60\
skinparam defaultFontName Arial\
\
|Khách hàng (User)|\
start\
:Thêm dịch vụ vào Giỏ hàng;\
:Nhấn "Thanh toán" (Checkout);\
\
|Hệ thống GoTravel|\
:Đọc dữ liệu Giỏ hàng & Lấy giá mới nhất;\
:Kiểm tra Tồn kho\n(Inventory Check);\
\
if (Số lượng còn đủ?) then (Không đủ)\
`  `:Thông báo lỗi: Hết phòng/Hết vé;\
`  `|Khách hàng (User)|\
`  `:Cập nhật lại Giỏ hàng;\
`  `stop\
else (Đủ số lượng)\
`  `|Hệ thống GoTravel|\
`  `:Khóa chỗ tạm thời (Soft-lock 15 phút);\
`  `:Tạo Đơn hàng (Trạng thái: PENDING);\
`  `:Sinh Link thanh toán VNPay;\
\
`  `|Cổng Thanh toán (VNPay)|\
`  `:Hiển thị trang nhập thẻ;\
\
`  `|Khách hàng (User)|\
`  `:Nhập thông tin thẻ và Xác nhận;\
\
`  `|Cổng Thanh toán (VNPay)|\
`  `:Xử lý giao dịch ngân hàng;\
`  `if (Giao dịch Thành công?) then (Có)\
`    `:Gửi Webhook (IPN) Thành công;\
\
`    `|Hệ thống GoTravel|\
`    `:Cập nhật Đơn hàng -> PAID;\
`    `:Chuyển Khóa chỗ -> CONFIRMED (Chốt cứng);\
`    `:Cộng tiền vào Ví Escrow của Host;\
`    `:Gửi Email vé điện tử (QR Code);\
`  `else (Không / Hủy / Quá 15p)\
`    `:Gửi Webhook Thất bại;\
\
`    `|Hệ thống GoTravel|\
`    `:Cập nhật Đơn hàng -> CANCELLED;\
`    `:Giải phóng Khóa chỗ (Release Lock)\nTrả lại tồn kho;\
`  `endif\
\
`  `|Khách hàng (User)|\
`  `:Nhận kết quả giao dịch & Điều hướng;\
`  `stop\
endif\
@enduml

**B. Giải thích chi tiết các bước:**

- **Kiểm tra kho & Khóa chỗ:** Khi người dùng ấn Thanh toán, hệ thống phải đối chiếu với inventory\_db xem ngày đó còn đủ số lượng không. Nếu còn, hệ thống thực hiện nghiệp vụ **Soft-lock (Khóa mềm 15 phút)** bằng cơ chế *Optimistic Locking* của Java, trừ tạm thời tồn kho để ngăn người khác đặt trùng.
- **Sinh Link Thanh toán:** Order Service lưu đơn hàng với trạng thái PENDING và gọi API tạo link VNPay.
- **Xử lý Webhook & Đối soát:** Nếu thanh toán thành công, Cổng VNPay bắn Webhook (IPN) về hệ thống. Hệ thống lập tức đổi trạng thái Đơn hàng thành PAID, chốt cứng tồn kho, và cộng tiền vào **Ví Đóng băng (Escrow Wallet)** của Host. Nếu quá 15 phút khách không trả tiền, một Background Job sẽ chạy ngầm để giải phóng tồn kho (Release Lock).
## **3.4. Phân tích Ca sử dụng (Use Case)**
### **3.4.1. Biểu đồ Use Case tổng quan**
Biểu đồ mô tả bức tranh tương tác toàn diện giữa 4 nhóm tác nhân (End-User, Individual Host, Enterprise Host, Admin) và 6 phân hệ lõi của hệ thống GoTravel.

@startuml\
left to right direction\
skinparam packageStyle rectangle\
skinparam UseCaseBackgroundColor #E3F2FD\
skinparam UseCaseBorderColor #1E88E5\
\
actor "End-User\n(Khách du lịch)" as User\
actor "Individual Host\n(Cá nhân)" as IndHost\
actor "Enterprise Host\n(Doanh nghiệp)" as EntHost\
actor "Host (Chung)" as BaseHost\
actor "Admin System\n(Quản trị viên)" as Admin\
\
IndHost --|> BaseHost\
EntHost --|> BaseHost\
\
rectangle "HỆ THỐNG GOTRAVEL (6 PHÂN HỆ LÕI)" {\
\
`  `usecase "Đăng nhập / Đăng ký" as UC\_Auth\
`  `usecase "Định danh điện tử (e-KYC/B2B)" as UC\_KYC\
\
`  `usecase "Khám phá quanh Địa danh" as UC\_Explore\
`  `usecase "Quản lý Giỏ hàng Đa hình" as UC\_Cart\
`  `usecase "Động cơ Gợi ý chéo (Cross-sell)" as UC\_CrossSell\
\
`  `usecase "Thanh toán gộp (Checkout)" as UC\_Checkout\
`  `usecase "Khóa Slot 15 phút (Soft-lock)" as UC\_SoftLock\
`  `usecase "Đánh giá & Bình luận (Review)" as UC\_Review\
\
`  `usecase "Đề xuất Địa danh mới" as UC\_Suggest\
`  `usecase "Quản lý Dịch vụ (Tạo/Lịch/Giá)" as UC\_ManageListings\
`  `usecase "Quản lý Ví Escrow & Rút tiền" as UC\_ManageWallet\
`  `usecase "Quản lý Siêu Tổ hợp (Complex)" as UC\_ManageComplex\
\
`  `usecase "Tạo Địa danh mỏ neo (Landmarks)" as UC\_CreateLandmark\
`  `usecase "Phê duyệt Hồ sơ & Đề xuất" as UC\_Approve\
`  `usecase "Kiểm duyệt & Ẩn/Xóa Dịch vụ" as UC\_Moderate\
`  `usecase "Đối soát Dòng tiền & Cấu hình" as UC\_Reconcile\
}\
\
' User \
User --> UC\_Auth\
User --> UC\_Explore\
User --> UC\_Cart\
User --> UC\_Checkout\
User --> UC\_Review\
\
' Base Host \
BaseHost --> UC\_Auth\
BaseHost --> UC\_Suggest\
BaseHost --> UC\_ManageListings\
BaseHost --> UC\_ManageWallet\
\
' Specific Host\
IndHost --> UC\_KYC\
EntHost --> UC\_KYC\
EntHost --> UC\_ManageComplex\
\
' Admin \
Admin --> UC\_Auth\
Admin --> UC\_CreateLandmark\
Admin --> UC\_Approve\
Admin --> UC\_Moderate\
Admin --> UC\_Reconcile\
\
' Includes & Extends\
UC\_CrossSell .> UC\_Cart : <<extend>>\
UC\_Checkout .> UC\_SoftLock : <<include>>\
@enduml
### **3.4.2. Các kịch bản của hệ thống (System Scenarios)**
Dựa trên sơ đồ tổng quan, các kịch bản của hệ thống được phân rã thành **49 Use Case chi tiết**, chia theo 7 cụm Microservices.

*Ghi chú: Dưới đây là danh sách tóm tắt các Use Case lõi. Đặc tả chi tiết từng Use Case được trình bày ở mục 3.4.5.*

- **Nhóm Identity & Access Service:** Đăng ký, Đăng nhập (UC1.1 - UC1.2), Nộp hồ sơ e-KYC (UC1.6), Admin phê duyệt Host (UC1.10).
- **Nhóm Catalog & Listing Service:** Tạo Địa danh (UC2.1), Khởi tạo Tổ hợp (UC2.5), Tạo Dịch vụ Đa hình (UC2.6), Viết đánh giá (UC2.9).
- **Nhóm Search Service (Node.js):** Tìm kiếm không gian quanh Landmark (UC3.1), Gợi ý chéo Cross-selling (UC3.4).
- **Nhóm Cart & Order Service:** Quản lý Giỏ hàng (UC4.1), Thanh toán gộp (UC4.5), Xác nhận hoàn tất chuyến đi (UC4.6).
- **Nhóm Booking & Inventory Service:** Xem lịch trống (UC5.1), Thiết lập giá động (UC5.3), Khóa Slot 15 phút chống Overbooking (UC5.4).
- **Nhóm Payment & Escrow Wallet:** Cấu hình Ngân hàng (UC6.2), Xem số dư Ví Escrow (UC6.3), Rút tiền Payout (UC6.4), Cấu hình Hoa hồng (UC6.5).
- **Nhóm Media & Comm Service (Node.js):** Upload ảnh mã hóa bảo mật (UC7.3), Gửi Email vé điện tử (UC7.5).
### **3.4.3. Phân rã Biểu đồ Use Case chi tiết**
*(Tại phần này trong file Word, sinh viên chèn 3 Hình ảnh Sơ đồ Use Case Chi tiết cho 3 đối tượng: User, Host, Admin đã được thiết kế sẵn trên hệ thống Draw.io vào báo cáo).*
### **3.4.4. Bảng ánh xạ yêu cầu chức năng với Use Case (Traceability Matrix)**
Bảng này chứng minh sự liên kết logic giữa các yêu cầu từ thực tế (Mục 3.1.1) và thiết kế hệ thống (Mục 3.4.2), đảm bảo không có tính năng nào bị bỏ sót.

|**Mã Yêu cầu (REQ)**|**Tên Yêu cầu chức năng**|**Các Use Case đáp ứng (Mã UC)**|
| :- | :- | :- |
|**REQ-01**|Tìm kiếm dịch vụ theo không gian quanh Địa danh|UC3.1 (Tìm kiếm không gian), UC3.3 (Bản đồ)|
|**REQ-02**|Khách hàng gom nhiều dịch vụ và thanh toán 1 lần|UC4.1 (Quản lý giỏ hàng), UC6.1 (Thanh toán VNPay)|
|**REQ-03**|Hệ thống chống bán lố phòng (Overbooking)|UC5.4 (Khóa Slot 15 phút)|
|**REQ-04**|Định danh nhà cung cấp minh bạch|UC1.6 (e-KYC Cá nhân), UC1.10 (Admin duyệt hồ sơ)|
|**REQ-05**|Host tạo dịch vụ với nhiều thuộc tính khác nhau|UC2.6 (Tạo Dịch vụ đa hình JSONB)|
|**REQ-06**|Giữ tiền khách hàng an toàn cho đến khi đi xong|UC6.3 (Ví Escrow), UC4.6 (Xác nhận hoàn tất chuyến đi)|
### <a name="_vzaefde6wa70"></a>**3.4.5. Đặc tả chi tiết các Use Case cốt lõi**
*(Lưu ý: Do khối lượng hệ thống rất lớn với 49 Use Case, đồ án tiến hành đặc tả chi tiết 3 Use Case phức tạp nhất mang tính chất "Sống còn" của hệ thống. Toàn bộ đặc tả chi tiết của 46 Use Case còn lại được đính kèm tại Phụ Lục của đồ án).*

**Đặc tả UC5.4 – Khóa Slot 15 phút (Chống Overbooking)**

|**Trường thông tin**|**Nội dung chi tiết**|
| :- | :- |
|**Số và tên UC**|UC5.4 – Khóa Slot 15 phút (Chống Overbooking)|
|**Mô tả**|Luồng kỹ thuật lõi (System-to-System) giữa Order Service và Inventory Service. Khi khách bắt đầu ấn thanh toán, hệ thống lập tức trừ số lượng phòng trong kho để không ai mua được nữa, và cấp 15 phút để điền thẻ ngân hàng. Quá 15 phút tự nhả phòng.|
|**Tác nhân**|Khách hàng (User) - Kích hoạt gián tiếp qua nút Thanh toán.|
|**Tiền điều kiện**|Người dùng gửi yêu cầu đặt dịch vụ cho các ngày cụ thể.|
|**Luồng chính (Soft-Lock)**|<p>1\. Khách hàng nhấn "Thanh toán".</p><p></p><p>2\. Order Service gọi API nội bộ sang Inventory Service.</p><p></p><p>3\. Hệ thống mở Giao dịch @Transactional.</p><p></p><p>4\. Hệ thống kiểm tra: Số lượng còn trống >= Số lượng khách đặt.</p><p></p><p>5\. Nếu đủ: Trừ cột available\_quantity và tạo bản ghi lưu vết vào inventory\_locks với hạn 15 phút.</p><p></p><p>6\. DB đối chiếu cờ @Version bằng Optimistic Locking.</p><p></p><p>7\. Trả về HTTP 200 cho Order Service tiếp tục tạo link VNPay.</p>|
|**Luồng ngoại lệ A1**|<p>**Xung đột dữ liệu - Cùng đặt một phòng:**</p><p></p><p>- Tại bước 6, Khách B vừa bấm thanh toán nhanh hơn Khách A một mili-giây.</p><p></p><p>- DB phát hiện @Version của A đã cũ. Hibernate ném ngoại lệ ObjectOptimisticLockingFailureException.</p><p></p><p>- Giao dịch của A bị hủy (Rollback). Trả về cảnh báo: *"Dịch vụ vừa được người khác đặt trước."*</p>|
|**Các quy tắc**|Toàn bộ quá trình phải nằm trong 1 Giao dịch phân tán (Distributed Transaction).|

**Đặc tả UC6.1 – Thanh toán gộp (Cổng VNPay)**

|**Trường thông tin**|**Nội dung chi tiết**|
| :- | :- |
|**Số và tên UC**|UC6.1 – Thanh toán gộp (Cổng VNPay)|
|**Mô tả**|Người dùng thanh toán toàn bộ giỏ hàng qua VNPay. Hệ thống nhận Webhook (IPN) để cập nhật đơn hàng và chuyển tiền vào Ví trung gian (Escrow Wallet).|
|**Tác nhân**|Khách hàng (User), Cổng thanh toán (VNPay)|
|**Tiền điều kiện**|Dịch vụ đã được khóa tạm thời (Soft-lock) 15 phút tại Inventory Service.|
|**Luồng chính**|<p>1\. VNPay xử lý trừ tiền từ thẻ người dùng.</p><p></p><p>2\. VNPay gọi lệnh HTTP POST (IPN Webhook) về API của Payment Service.</p><p></p><p>3\. Hệ thống xác thực chữ ký (Secure Hash) để chống giả mạo.</p><p></p><p>4\. Tạo bản ghi Transaction và cộng tiền vào balance\_escrow (Ví đóng băng) của Host.</p><p></p><p>5\. Bắn Event nội bộ sang Order Service đổi trạng thái Đơn hàng thành PAID và chuyển khóa Soft-lock thành Chốt cứng.</p><p></p><p>6\. Hiển thị thông báo "Thanh toán thành công" cho Khách.</p>|

# <a name="_j3ymfwksmpm8"></a>**PHẦN 3: KIẾN TRÚC KỸ THUẬT & CÔNG NGHỆ (TECH STACK & ARCHITECTURE)**
Khác với các hệ thống Monolithic (nguyên khối) truyền thống, GoTravel được thiết kế ngay từ đầu với tư duy **Cloud-Native** và **Polyglot Microservices (Vi dịch vụ đa ngôn ngữ)**.

Triết lý kỹ thuật của GoTravel là: *"Không có một ngôn ngữ hay cơ sở dữ liệu nào hoàn hảo cho mọi bài toán. Hãy dùng đúng công cụ cho đúng mục đích"*. Hệ thống được chia thành 8 Microservices, tận dụng sức mạnh của cả **Java Spring Boot** và **Node.js**.
## <a name="_pdung34keo37"></a>**3.1. KIẾN TRÚC TỔNG THỂ (SYSTEM TOPOLOGY)**
Hệ thống được thiết kế theo mô hình **API Gateway Pattern** kết hợp với **Database-per-Service** (Mỗi dịch vụ một CSDL riêng).

1. **Client Layer:** Trình duyệt Web (ReactJS) / Ứng dụng Mobile.
1. **Edge Layer (Cửa ngõ):** API Gateway (Node.js) làm nhiệm vụ định tuyến (Routing), chặn rác (Rate Limiting) và xác thực vé (JWT Verifier).
1. **Business Layer (Tầng nghiệp vụ lõi - Java):** Nơi xử lý các giao dịch sinh tử (Tiền bạc, Đặt chỗ, Quản lý tài sản).
1. **Performance Layer (Tầng hiệu năng cao - Node.js):** Nơi xử lý các tác vụ đọc dữ liệu cực nhanh (Tìm kiếm, Gợi ý) và thao tác tệp tin (Upload ảnh).
1. **Data Layer:** PostgreSQL (Lưu trữ quan hệ + Không gian + JSON), Redis (Caching), Cloudinary (Lưu trữ Media).
## <a name="_sy1ga4vp7qs7"></a>**3.2. THE CORE: JAVA SPRING BOOT (XỬ LÝ GIAO DỊCH & ACID)**
**Tại sao lại là Java?** Ngành du lịch và OTA đòi hỏi tính chính xác tuyệt đối về dòng tiền và số lượng phòng (Inventory). Java với hệ sinh thái Spring Boot cung cấp khả năng quản lý giao dịch (Transaction Management) mạnh mẽ nhất.

**Các Microservices bằng Java:**

1. **Identity & Access Service (auth\_db):** Quản lý User/Host và cấp phát JWT.
1. **Catalog & Listing Service (catalog\_db):** Nơi Host tạo Tổ hợp, Phòng, Tour, Dịch vụ đa hình.
1. **Booking & Inventory Service (inventory\_db):** Quản lý lịch trống và giá động.
1. **Cart & Order Service (order\_db):** Xử lý Giỏ hàng và điều phối luồng Checkout.
1. **Payment & Wallet Service (payment\_db):** Ví Escrow giữ tiền và kết nối VNPay.

**Vũ khí công nghệ cốt lõi trong Java:**

- **@Transactional (All-or-Nothing):** Bất kỳ luồng ghi dữ liệu nào liên quan đến nhiều bảng đều được bọc trong một Transaction. Nếu thẻ ngân hàng lỗi, hệ thống tự động Rollback (thu hồi) lệnh trừ phòng. Dữ liệu không bao giờ bị "nửa nạc nửa mỡ".
- **Optimistic Locking (@Version):** Giải quyết triệt để rủi ro Overbooking (Bán lố phòng). Khi hàng trăm người cùng ấn thanh toán 1 căn phòng duy nhất, Spring Data JPA sẽ kiểm tra phiên bản (version) của dòng dữ liệu đó. Người nhanh nhất thành công, những người đến chậm 1 mili-giây sẽ bị văng lỗi ObjectOptimisticLockingFailureException.
- **Jackson Polymorphism:** Thay vì dùng Map<String, Object> lộn xộn, Java sử dụng kỹ thuật Kế thừa (Inheritance) để map cục JSON động từ Frontend vào đúng các Class cấu hình của từng loại dịch vụ (Phòng/Tour/Xe) một cách an toàn (Strongly Typed).
## <a name="_7cxmrh5n516a"></a>**3.3. THE EDGE: NODE.JS (XỬ LÝ I/O BẤT ĐỒNG BỘ & HIỆU NĂNG ĐỌC)**
**Tại sao lại là Node.js?** Đứng trước bài toán tìm kiếm bán kính địa lý (truy vấn Read-heavy) và đẩy file ảnh (I/O-bound), Java sẽ tốn rất nhiều RAM do cơ chế đa luồng (Multi-threading). Node.js với mô hình Non-blocking I/O và Event Loop là sự lựa chọn hoàn hảo để gánh tải (Scale) với chi phí thấp nhất.

**Các Microservices bằng Node.js:**

1. **API Gateway & BFF:** Tấm khiên bảo vệ hệ thống. Đứng mũi chịu sào nhận 100% lượng truy cập.
1. **Search & Location Service:** Truy vấn PostGIS tốc độ cao.
1. **Recommendation Engine:** Động cơ gợi ý chéo (Cross-selling).
1. **Media & Comm Service:** Đẩy luồng stream ảnh thẳng lên Cloudinary và bắn Email/SMS nền.

**Vũ khí công nghệ cốt lõi trong Node.js:**

- **Bypass JWT Validation:** Node.js Gateway tự cấu hình giải mã chữ ký JWT\_SECRET. Nó không cần gọi HTTP sang Identity Service của Java để hỏi xem Token này có đúng không. Nó tự kiểm tra, bóc tách UserId và Role, nhét vào HTTP Header rồi ném xuống cho Java. Giúp giảm tải 50% cho Identity Service.
- **MemoryStorage Multer Stream:** Xử lý file bằng luồng (Stream) thẳng lên mây, tuyệt đối không lưu file rác (diskStorage) ra ổ cứng của Server làm nghẽn máy chủ.
## <a name="_ugl0w4w95kyz"></a>**3.4. CHIẾN LƯỢC CƠ SỞ DỮ LIỆU (DATA STRATEGY)**
Thay vì dùng quá nhiều công nghệ database (như MongoDB cho NoSQL, Elasticsearch cho Search), GoTravel tận dụng sức mạnh tuyệt đối của **PostgreSQL** như một cơ sở dữ liệu "Tất cả trong một" (All-in-one).

**1. Database-per-Service:** Mỗi Java Service có một lược đồ (Schema) CSDL riêng. order\_db KHÔNG BAO GIỜ được phép dùng câu lệnh JOIN với auth\_db. Mọi giao tiếp phải thông qua API nội bộ (S2S). Điều này giúp sau này công ty có thể tách một Service ra server riêng mà không sợ dính dáng dữ liệu.

**2. PostgreSQL JSONB (Xử lý Đa hình):** Ngành du lịch có vô số loại sản phẩm (Phòng cần số giường, Tour cần lịch trình, Thuê xe cần loại xe). Thay vì thiết kế 10 bảng (Tables) khác nhau, hệ thống sử dụng cột attributes kiểu JSONB. Dữ liệu được lưu mềm dẻo như NoSQL (MongoDB) nhưng vẫn giữ được tính ACID và khả năng Index siêu việt của cơ sở dữ liệu quan hệ.

**3. PostgreSQL + PostGIS (Triết lý Landmark-Centric):** Đây là "Vũ khí hạt nhân" của hệ thống.

- Các cột tọa độ được lưu dưới dạng GEOGRAPHY(Point, 4326).
- Node.js Search Service sử dụng tài khoản Read-Only query thẳng vào Catalog DB.
- Sử dụng hàm ST\_DWithin() kết hợp với chỉ mục **GiST Index**, hệ thống có thể tính toán hàng triệu khoảng cách không gian (Spatial calculation) từ tâm Địa danh ra xung quanh chỉ trong vài chục mili-giây.

**4. Redis Cache:** Sử dụng để lưu trữ các dữ liệu "Nóng" và ít thay đổi như: Danh sách Địa danh nổi bật (Hero Banner), Mã OTP xác thực, và Trạng thái phân trang. Giúp giảm tải 30-40% query thừa vào Database.
## <a name="_h56y7y84z20m"></a>**3.5. CƠ CHẾ GIAO TIẾP LIÊN DỊCH VỤ (INTER-SERVICE COMMUNICATION)**
Microservices không thể hoạt động độc lập hoàn toàn, chúng phải "nói chuyện" với nhau.

- **Giao tiếp Đồng bộ (Synchronous):** Sử dụng **Spring Cloud OpenFeign**.
  - *Ví dụ:* Order Service (Giỏ hàng) gọi sang Catalog Service để lấy giá mới nhất trước khi tính tiền. Hoặc gọi sang Inventory Service để ra lệnh Khóa phòng (Soft-lock).
- **Giao tiếp Bất đồng bộ (Asynchronous):** Sử dụng @Async (Background Threads) và @Scheduled (Cron Jobs).
  - *Ví dụ:* Job chạy ngầm mỗi 1 phút quét các đơn hàng khóa quá 15 phút để nhả phòng ra.
- **Giao tiếp với Bên thứ ba (External Webhook):** Cổng Payment tiếp nhận Webhook (IPN) từ VNPay. API này được thiết kế theo chuẩn **Idempotent (Tính bất biến)** – VNPay có gọi thông báo thành công 10 lần thì hệ thống cũng chỉ cộng tiền cho Host đúng 1 lần duy nhất.
# **PHẦN 4: CÁC LUỒNG HOẠT ĐỘNG "SỐNG CÒN" CỦA HỆ THỐNG (CORE WORKFLOWS)**
Sức mạnh thực sự của kiến trúc Microservices không nằm ở việc tách nhỏ mã nguồn, mà nằm ở cách các dịch vụ phối hợp nhịp nhàng với nhau để giải quyết các bài toán hóc búa. Dưới đây là 4 luồng hoạt động mang tính "sống còn", quyết định sự thành bại của nền tảng GoTravel:
## **1. Luồng Bảo vệ Dữ liệu Không gian & Quyền riêng tư (Data Protection Flow)**
Luồng này đảm bảo hệ thống không bị biến thành một bãi rác dữ liệu và tuân thủ nghiêm ngặt Luật Bảo vệ dữ liệu cá nhân.

- **Bảo vệ mỏ neo Không gian:** Khác với Google Maps nơi ai cũng có thể tạo địa điểm, hệ thống GoTravel áp dụng cơ chế kiểm duyệt khắt khe. Các Host chỉ có quyền "Đề xuất". Duy nhất **Admin** mới có quyền chốt tọa độ GPS và khởi tạo **Địa danh chính thức (Landmark)**. Điều này giúp CSDL Không gian (PostGIS) luôn sạch sẽ, tốc độ quét bán kính luôn ở mức tối đa và kết quả tìm kiếm không bị phân mảnh do Host viết sai chính tả.
- **Bảo mật e-KYC (Zero-leakage):** Khi Host tải lên Căn cước công dân hoặc Giấy phép kinh doanh, Media Service (Node.js) sẽ tự động cấu hình ném các file này vào phân vùng **Private Cloud** của Cloudinary. Các file này không có Public URL. Hacker dù lấy được link cũng bị trả về lỗi 403 Forbidden. Chỉ Admin với chữ ký số động (Signed URL) mới có thể mở xem để duyệt hồ sơ.
## **2. Luồng Chống Overbooking - Khóa Slot 15 phút (Concurrency Control Flow)**
Đây là bài toán kinh điển của ngành OTA: Làm sao để 100 người cùng bấm thanh toán 1 căn phòng mà không bị lỗi bán lố?

- **Bước 1:** Khi Khách A bấm "Thanh toán", Order Service (Java) lập tức gọi nội bộ sang Inventory Service.
- **Bước 2 (Soft-lock):** Inventory Service mở Giao dịch, trừ số lượng phòng trống và cấp một chứng chỉ khóa (Lock) có thời hạn 15 phút.
- **Bước 3 (Optimistic Locking):** Nếu Khách B cũng bấm thanh toán chậm hơn Khách A đúng 1 mili-giây, cơ chế @Version của Spring Boot JPA sẽ phát hiện dữ liệu vừa bị thay đổi. CSDL ngay lập tức ném ra ngoại lệ ObjectOptimisticLockingFailureException, đánh bật Khách B ra ngoài với thông báo "Phòng vừa được đặt".
- **Bước 4 (Auto-release):** Sẽ có một Background Job (@Scheduled) chạy ngầm mỗi phút. Nếu Khách A không thanh toán trong 15 phút, Job này tự động hủy Lock và cộng trả lại số lượng phòng về kho để bán cho người khác.
## **4.3. Luồng Vòng đời Dòng tiền Zero-Trust (Escrow Cash-flow)**
Nền tảng đóng vai trò là "Trọng tài tài chính", không tin tưởng tuyệt đối vào bất kỳ bên nào (Zero-Trust) để bảo vệ quyền lợi người mua.

- **Khớp lệnh:** Khách hàng quẹt thẻ. Cổng thanh toán VNPay gọi Webhook (IPN) ngầm về hệ thống. Payment Service xác thực chữ ký (Signature Hash) để chống giả mạo, sau đó chuyển trạng thái Đơn hàng thành Đã thanh toán.
- **Ví Đóng băng (Escrow):** Tiền không bay thẳng vào tài khoản của Host. Hệ thống ghi nhận số tiền này vào cột balance\_escrow (Ví đóng băng). Host thấy tiền nhưng chưa được rút. Khách hàng yên tâm vì nền tảng đang giữ tiền.
- **Giải ngân (Payout):** Chỉ khi khách hàng đến nơi, sử dụng dịch vụ xong và Host bấm "Hoàn tất chuyến đi", Payment Service mới kích hoạt luồng đối soát: Trừ phần trăm hoa hồng của hệ thống, và chuyển tiền vào balance\_avail (Ví khả dụng) của Host. Sau đó Host mới được tạo lệnh Rút tiền về ngân hàng thực tế.
## **4.4. Luồng Xử lý Tranh chấp & Hoàn tiền Khẩn cấp (Dispute & Refund Flow)**
Sử dụng trong tình huống sự cố (Host lừa đảo, hết phòng thực tế).

- Nếu khách hàng đến nơi mà không có phòng, Admin sẽ can thiệp.
- Admin sử dụng quyền tối cao bấm nút **"Hủy đơn bắt buộc"**.
- Giao dịch liên Service được kích hoạt: Order Service ra lệnh cho Payment Service thu hồi toàn bộ số tiền đang nằm trong Ví Escrow của Host.
- Ngay sau đó, Payment Service gọi API Refund trực tiếp sang máy chủ VNPay để hoàn trả tiền điện tử thẳng về tài khoản thẻ gốc của Khách hàng mà không cần Host đồng ý.
# <a name="_k71uquohv4dg"></a>**PHẦN 5: ĐÁNH GIÁ TỔNG QUAN (EXECUTIVE SUMMARY)**
Dự án GoTravel không dừng lại ở mức độ một bài tập đồ án sinh viên (CRUD cơ bản), mà mang dáng dấp của một sản phẩm phần mềm cấp doanh nghiệp (**Enterprise-level Software**). Nó hội tụ đầy đủ các thách thức khó nhất của ngành kỹ nghệ phần mềm hiện đại:

1. **Thách thức về Kiến trúc Phân tán:** Giải quyết bài toán giao tiếp nội bộ (S2S), tính toàn vẹn dữ liệu xuyên Service (Distributed Transactions) và mô hình CQRS.
1. **Thách thức về Dữ liệu Không gian:** Tích hợp và tối ưu hóa hệ quản trị cơ sở dữ liệu PostGIS để tính toán tọa độ địa lý.
1. **Thách thức về Tài chính:** Xử lý tiền tệ, làm việc với API của cổng thanh toán quốc gia và đối soát dòng tiền Escrow.
1. **Tư duy Sản phẩm (Product Mindset):** Giải quyết nỗi đau thực tế của du khách với mô hình Giỏ hàng hợp nhất đa hình và Gợi ý bán chéo tự động.

Với quy mô 8 Microservices, việc triển khai thành công kiến trúc này đòi hỏi đội ngũ phát triển phải có sự am hiểu sâu sắc về cả tư duy nghiệp vụ (Domain-Driven Design), kỹ năng lập trình đa ngôn ngữ (Java & Node.js), và khả năng quản lý dự án nghiêm ngặt (Agile/Scrum). GoTravel là minh chứng rõ nét cho năng lực làm chủ công nghệ và khả năng giải quyết các bài toán lớn của thực tiễn ngành Du lịch Việt Nam.

[ref1]: Aspose.Words.8c5f7375-88d1-4803-bd59-22b41e11b6df.001.png
