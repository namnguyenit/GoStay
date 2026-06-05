# Báo Cáo Đối Chiếu Backend Với Tài Liệu Hệ Thống GoStay/GoTravel

Ngày kiểm tra: 2026-05-29  
Commit đang kiểm tra: `d87408d3 (TestSystem, origin/TestSystem)`  
Tài liệu đối chiếu: `CSE702013_Report-Hoan thanh chuong 1/CSE702013_Report-Hoan thanh chuong 1.md`  
Phạm vi kiểm tra: backend microservices, API Gateway, media service. Không đánh giá frontend trong tài liệu này.

## 1. Kết Luận Tổng Quan

Backend hiện tại đã có nền tảng microservice và một số luồng nghiệp vụ cốt lõi:

- `Identity` có đăng ký, đăng nhập, JWT RSA, JWKS, hồ sơ User/Host/Enterprise.
- `APIGateway` đã định tuyến request về từng service và xác thực JWT.
- `CatalogandListing` có Listing, Landmark, Complex và Review cơ bản.
- `BookingandInventory` có calendar, soft-lock 15 phút và optimistic locking bằng `@Version`.
- `CartandOrder` có giỏ hàng, checkout, book-now và kết nối Inventory để khóa chỗ.
- `PaymentandWallet` có tạo mã thanh toán/QR theo SePay, webhook, transaction và payout record.
- `cloudinary-service` có upload ảnh đơn, upload nhiều ảnh, upload tài liệu bảo mật và xóa media.

Tuy nhiên, nếu đối chiếu với báo cáo kỹ thuật, backend hiện mới đạt mức MVP/chưa đầy đủ. Nhiều use case trong báo cáo còn thiếu, hoặc đã có code nhưng đang sai/khác với mô tả nghiệp vụ.

Đánh giá tổng thể:

- Khớp khá tốt về khung kiến trúc microservice.
- Khớp một phần về luồng đặt chỗ, tồn kho và thanh toán.
- Chưa đạt ở các phần quan trọng: phân quyền Catalog, thanh toán VNPay/MoMo, ví escrow, refund, vòng đời đơn hàng, review hợp lệ, tìm kiếm theo Landmark/PostGIS, email/QR ticket.

## 2. Các Vấn Đề Cấp Bách

### P0 - Cần xử lý trước khi demo hoặc release backend

#### 2.1. Catalog Host/Admin API chưa chặn đúng role

Mức độ: P0 - lỗi bảo mật.

Trong báo cáo, Host mới được quản lý dịch vụ và đề xuất Landmark; Admin mới được quản lý Landmark, duyệt đề xuất và duyệt/đổi trạng thái Listing.

Hiện tại `CatalogandListing` chỉ cấu hình:

- Public: `/api/v1/catalog/listings/**`
- Internal: `/api/v1/internal/**`
- Các route còn lại: chỉ cần `authenticated()`

File liên quan:

- `CatalogandListing/src/main/java/com/Listing/CatalogandListing/configuration/SecurityConfig.java:29`
- `CatalogandListing/src/main/java/com/Listing/CatalogandListing/controller/CatalogHostController.java:23`
- `CatalogandListing/src/main/java/com/Listing/CatalogandListing/controller/CatalogAdminController.java:18`
- `CatalogandListing/src/main/java/com/Listing/CatalogandListing/controller/CatalogUserController.java:12`

Hệ quả:

- User đăng nhập bình thường có thể gọi API Host/Admin trong Catalog nếu có token hợp lệ.
- Gateway hiện chỉ xác thực JWT, không chặn role theo từng route Catalog.
- Sai với mô hình RBAC trong báo cáo.
- Có nguy cơ sửa, xóa, duyệt dữ liệu trái phép.

Trạng thái: Chưa khớp.

Hướng xử lý:

- Thêm `@PreAuthorize("hasRole('HOST') or hasRole('ENTERPRISE')")` cho API Host phù hợp.
- Thêm `@PreAuthorize("hasRole('ADMIN')")` cho API Admin.
- Kiểm tra lại Gateway và SecurityConfig để tránh các route nhạy cảm chỉ cần đăng nhập.

#### 2.2. Media service verify JWT sai issuer

Mức độ: P0 - bug có thể làm hỏng upload media bằng token user.

Identity phát JWT với issuer:

- `com.gotravel.identity`
- File: `Identity/src/main/java/com/gotravel/Identity/service/AuthenticationService.java:101`

Media service lại verify:

- `issuer: "com.gotravel"`
- File: `cloudinary-service/src/middlewares/auth.middleware.js:41`

Hệ quả:

- User/Host/Admin dùng JWT thật có thể bị từ chối khi upload ảnh.
- UC7.1, UC7.2, UC7.4 có nguy cơ không chạy khi gọi qua Gateway bằng token user.
- Luồng Identity upload secure document bằng internal token có thể vẫn chạy, nhưng upload avatar/media từ user sẽ lỗi.

Trạng thái: Chưa khớp.

Hướng xử lý:

- Sửa issuer trong media service thành `com.gotravel.identity`.
- Nên verify thêm audience `gotravel-api` để đồng nhất với Gateway và các Java services.

#### 2.3. Payment không dùng VNPay/MoMo như báo cáo

Mức độ: P0 - sai cổng thanh toán so với đặc tả.

Báo cáo mô tả UC6.1 là thanh toán gộp qua VNPay/MoMo. Code hiện tại dùng SePay/VietQR:

- `PaymentandWallet/src/main/java/com/gotravel/PaymentandWallet/service/PaymentService.java:70`
- `PaymentandWallet/src/main/java/com/gotravel/PaymentandWallet/controller/SepayWebhookController.java:35`

Hệ quả:

- Không đúng cổng thanh toán trong báo cáo.
- Không có redirect URL, return URL, IPN theo kiểu VNPay.
- UC6.8 Refund VNPay không có cơ sở triển khai vì không lưu `vnp_TransactionNo`.

Trạng thái: Lệch nghiệp vụ.

Hướng xử lý:

- Nếu báo cáo bắt buộc VNPay/MoMo: cần viết lại payment flow theo VNPay create-payment-url, return, IPN và refund.
- Nếu nhóm quyết định dùng SePay: cần cập nhật báo cáo, use case và sequence diagram cho đúng thực tế.

#### 2.4. Chưa có Escrow Wallet đúng nghĩa

Mức độ: P0/P1 - sai luồng tiền trong báo cáo.

Báo cáo yêu cầu Payment & Wallet có:

- Ví escrow đóng băng tiền khi khách thanh toán.
- Chuyển tiền sang số dư khả dụng khi chuyến đi hoàn tất.
- Host tạo lệnh rút tiền từ số dư khả dụng.
- Admin duyệt hoặc từ chối payout.
- Refund trừ từ escrow.

Code hiện tại:

- Khi payment completed, tạo ngay `HostPayout` status `PENDING`.
- Không thấy entity `Wallet`, `WalletBalance`, `EscrowBalance`.
- Không có API Host tạo yêu cầu rút tiền.
- Không có API từ chối payout và rollback tiền.

File liên quan:

- `PaymentandWallet/src/main/java/com/gotravel/PaymentandWallet/service/PaymentService.java:157`
- `PaymentandWallet/src/main/java/com/gotravel/PaymentandWallet/entity/HostPayout.java:24`
- `PaymentandWallet/src/main/java/com/gotravel/PaymentandWallet/controller/HostPayoutController.java:26`
- `PaymentandWallet/src/main/java/com/gotravel/PaymentandWallet/controller/HostPayoutController.java:33`

Hệ quả:

- Tiền được đưa vào payout pending ngay sau khi thanh toán, trong khi báo cáo yêu cầu giữ escrow đến khi khách hoàn tất trải nghiệm.
- Không có số dư escrow/khả dụng để Host theo dõi.
- Không thể xử lý tranh chấp/refund đúng.

Trạng thái: Chưa khớp.

Hướng xử lý:

- Tạo wallet/ledger theo Host.
- Payment success: cộng tiền vào `balance_escrow`.
- Trip completed: chuyển tiền từ escrow sang `balance_available`.
- Payout request: trừ `balance_available`, tạo transaction `PENDING`.
- Admin paid: đánh dấu `PAID`.
- Admin reject: rollback tiền vào `balance_available`.
- Refund: trừ `balance_escrow`, tạo transaction `REFUND`.

#### 2.5. Order lifecycle còn thiếu nhiều API và trạng thái quan trọng

Mức độ: P0/P1 - thiếu use case core.

Báo cáo yêu cầu:

- UC4.3: User/Host/Admin xem danh sách đơn theo vai trò.
- UC4.4: Chi tiết đơn và vé QR.
- UC4.5: User yêu cầu hủy, Host duyệt hoặc từ chối hủy.
- UC4.6: Host xác nhận hoàn tất chuyến đi, kích hoạt đối soát tiền.
- UC4.7: Admin force cancel khi có tranh chấp hoặc sự cố.

Code hiện tại chỉ có:

- Checkout cart.
- Book now.
- User xem chi tiết đơn của mình.
- User xem danh sách đơn của mình.
- User hủy đơn nếu trạng thái là `PENDING` hoặc `PAYMENT_PENDING`.
- Internal payment success/failed.

File liên quan:

- `CartandOrder/src/main/java/com/GoTravel/CartandOrder/controller/OrderController.java:26`
- `CartandOrder/src/main/java/com/GoTravel/CartandOrder/controller/OrderController.java:40`
- `CartandOrder/src/main/java/com/GoTravel/CartandOrder/controller/OrderController.java:47`
- `CartandOrder/src/main/java/com/GoTravel/CartandOrder/controller/OrderController.java:54`
- `CartandOrder/src/main/java/com/GoTravel/CartandOrder/controller/InternalOrderController.java:25`
- `CartandOrder/src/main/java/com/GoTravel/CartandOrder/controller/InternalOrderController.java:31`

Hệ quả:

- Host không quản lý được đơn/khách sắp đến.
- Không có quy trình approve cancel.
- Không có sự kiện trip completed để Payment chuyển escrow sang available.
- Admin không có force cancel/refund trigger.
- Không có vé QR như báo cáo.

Trạng thái: Chưa khớp.

Hướng xử lý:

- Bổ sung order states: `CANCEL_REQUESTED`, `CANCEL_REJECTED`, `COMPLETED`, `FORCE_CANCELLED`.
- Bổ sung API Host/Admin.
- Tạo event hoặc internal API sang Payment khi trip completed hoặc force cancel.
- Thêm QR ticket generation hoặc Communication service.

#### 2.6. Review chưa xác minh user đã sử dụng dịch vụ

Mức độ: P1 - ảnh hưởng tính minh bạch và chống fake review.

Báo cáo yêu cầu review phải xuất phát từ user đã thực sự trải nghiệm dịch vụ, xác minh qua Order Service.

Code hiện tại:

- Chỉ kiểm tra Listing tồn tại.
- Chỉ kiểm tra user đã review Listing đó chưa.
- Không gọi Order Service để xác minh order completed.
- Không cập nhật `averageRating` và `totalReviews` trên Listing.

File liên quan:

- `CatalogandListing/src/main/java/com/Listing/CatalogandListing/service/ReviewService.java:31`
- `CatalogandListing/src/main/java/com/Listing/CatalogandListing/service/ReviewService.java:37`
- `CatalogandListing/src/main/java/com/Listing/CatalogandListing/service/ReviewService.java:66`

Hệ quả:

- User bất kỳ có token có thể review Listing nếu biết id.
- Có nguy cơ fake review.
- Rating hiển thị/sắp xếp có thể không cập nhật đúng.

Trạng thái: Chưa khớp.

Hướng xử lý:

- Catalog gọi Order Service internal để kiểm tra `userId + listingId` có order `COMPLETED` hay không.
- Sau khi tạo/sửa/xóa review, tính lại `averageRating` và `totalReviews`.
- Bổ sung edit/delete review trong thời gian quy định, Host reply, Admin hide/delete review.

#### 2.7. Admin seed hardcode và có thể reset credential

Mức độ: P1 - bug bảo mật.

File:

- `Identity/src/main/java/com/gotravel/Identity/configuration/DataSeedForAdmin.java:32`
- `Identity/src/main/java/com/gotravel/Identity/configuration/DataSeedForAdmin.java:33`
- `Identity/src/main/java/com/gotravel/Identity/configuration/DataSeedForAdmin.java:34`

Code đang:

- Tìm user `admin`.
- Set password về `12345678`.
- Set email `dm@admin`.
- Set role `ADMIN`.

Hệ quả:

- Mỗi lần service start có thể reset password admin.
- Credential quá yếu và rõ ràng.
- Không phù hợp môi trường demo công khai hoặc production.

Trạng thái: Bug còn tồn tại.

Hướng xử lý:

- Lấy admin seed từ environment variables.
- Chỉ seed nếu admin chưa tồn tại.
- Không reset password nếu user đã có.
- Bắt buộc password mạnh hoặc dùng one-time bootstrap.

## 3. Các Vấn Đề Quan Trọng Nhưng Có Thể Xử Lý Sau P0

### P1 - Nghiệp vụ core chưa đầy đủ

#### 3.1. Tìm kiếm theo Landmark/PostGIS chưa đúng UC3.1

Báo cáo yêu cầu user tìm theo Landmark, hệ thống quét bán kính quanh Landmark bằng PostGIS.

Code hiện tại có cột geometry và latitude/longitude, nhưng search chỉ dùng category/province:

- `CatalogandListing/src/main/java/com/Listing/CatalogandListing/service/ListingService.java:127`
- `CatalogandListing/src/main/java/com/Listing/CatalogandListing/repository/ListingRepository.java:25`
- `CatalogandListing/src/main/java/com/Listing/CatalogandListing/repository/ListingRepository.java:26`

Thiếu:

- Search theo `landmarkId`.
- Query `ST_DWithin`/spatial index.
- Sắp xếp theo khoảng cách.
- Trả về distance/location cho map.

Trạng thái: Chưa khớp.

#### 3.2. Filter và sort kết quả còn thiếu

Báo cáo yêu cầu lọc theo:

- Giá.
- Hạng sao.
- Tiện nghi.
- Loại hình dịch vụ.
- Độ phổ biến/đánh giá tốt.

Code hiện chỉ filter:

- Category.
- Province.
- Sort `averageRating`.

File:

- `CatalogandListing/src/main/java/com/Listing/CatalogandListing/service/ListingService.java:128`

Trạng thái: Khớp một phần rất nhỏ.

#### 3.3. Cross-selling/recommendation chưa có

Báo cáo UC3.4 yêu cầu gợi ý chéo sau khi user thêm dịch vụ vào giỏ.

Hiện tại:

- Cart add item không gọi recommendation engine.
- Không thấy service/module recommendation.

Trạng thái: Chưa có.

#### 3.4. Universal Cart chưa hỗ trợ thanh toán nhiều Host

Báo cáo yêu cầu giỏ hàng hợp nhất cho nhiều loại hình dịch vụ và thanh toán tập trung.

Code có cart đa dịch vụ, nhưng checkout đang chặn nếu cart có nhiều Host:

- `CartandOrder/src/main/java/com/GoTravel/CartandOrder/service/OrderService.java:319`
- `CartandOrder/src/main/java/com/GoTravel/CartandOrder/service/OrderService.java:329`

Hệ quả:

- User không checkout được một giỏ hàng gồm nhiều nhà cung cấp.
- Sai với “Universal Cart” nếu giỏ có nhiều Host.

Trạng thái: Khớp một phần.

Hướng xử lý:

- Cho phép order có nhiều Host bằng cách tách payout theo `OrderItem.hostId`.
- Payment success sinh nhiều escrow ledger entries theo Host.
- Hoặc tạo các sub-order theo Host dưới một checkout group.

#### 3.5. Listing tạo mới đang ACTIVE ngay, chưa đúng luồng kiểm duyệt

Báo cáo có Admin kiểm duyệt dữ liệu/listing và ẩn nội dung vi phạm.

Code khi Host tạo Listing:

- Set `ListingStatus.ACTIVE` ngay.
- File: `CatalogandListing/src/main/java/com/Listing/CatalogandListing/service/ListingService.java:61`

Enums hiện có:

- `ACTIVE`, `HIDDEN`, `DELETED`
- File: `CatalogandListing/src/main/java/com/Listing/CatalogandListing/enums/ListingStatus.java:4`

Thiếu:

- Status `PENDING`, `REJECTED`.
- Admin approve/reject Listing đúng nghĩa.
- Lý do từ chối.

Trạng thái: Lệch một phần.

#### 3.6. Inventory initialization đang mặc định quantity = 5

Khi tạo Listing, Catalog gọi Inventory initialize với `totalQuantity(5)`:

- `CatalogandListing/src/main/java/com/Listing/CatalogandListing/service/ListingService.java:65`

Hệ quả:

- Số phòng/slot thật trong attributes không được dùng.
- Sai với yêu cầu thuộc tính động theo từng loại dịch vụ.

Trạng thái: Chưa khớp.

Hướng xử lý:

- Lấy quantity/timeSlots từ request/attributes.
- Đổi DTO init inventory để truyền category, quantity, timeSlots đúng.

#### 3.7. Host inventory chưa kiểm tra chủ sở hữu Listing

Controller đã comment rõ:

- `BookingandInventory/src/main/java/com/Gostay/BookingandInventory/controller/InventoryHostController.java:30`

Hiện tại API Host chỉ cần role HOST/ADMIN:

- `BookingandInventory/src/main/java/com/Gostay/BookingandInventory/controller/InventoryHostController.java:36`

Service query trực tiếp theo `listingId`:

- `BookingandInventory/src/main/java/com/Gostay/BookingandInventory/service/InventoryHostService.java:47`
- `BookingandInventory/src/main/java/com/Gostay/BookingandInventory/service/InventoryHostService.java:59`

Hệ quả:

- Host A có thể xem hoặc chặn lịch của Listing thuộc Host B nếu biết `listingId`.

Trạng thái: Bug phân quyền cấp tài nguyên.

Hướng xử lý:

- Inventory gọi Catalog internal để verify Listing owner.
- Hoặc Gateway/Catalog cung cấp ownership claim/cache.

#### 3.8. Giá động UC5.3 chưa có

Báo cáo yêu cầu Host cài giá tăng/giảm theo từng ngày.

Code hiện tại:

- `InventoryCalendar` chỉ có quantity/status, không có price override.
- `BlockCalendarRequest` chỉ có action block/unblock.
- File: `BookingandInventory/src/main/java/com/Gostay/BookingandInventory/dto/request/BlockCalendarRequest.java:12`

Trạng thái: Chưa có.

Hướng xử lý:

- Thêm `priceOverride` hoặc bảng `pricing_calendar`.
- Cart/Order khi tính tiền phải lấy giá theo ngày từ Inventory/Pricing thay vì chỉ dùng `basePrice`.

#### 3.9. Complex tạo được nhưng Listing chưa gắn đúng Complex

Báo cáo UC2.5 yêu cầu Enterprise tạo Complex và gắn các Listing con vào Complex.

Code:

- Có API tạo Complex: `CatalogHostController.java:53`
- Có request Listing `complexId`: `SaveListingRequest.java:24`
- Entity Listing dùng `Complex complex`: `Listing.java:42`
- Mapper ignore unmapped target: `ListingMapper.java:10`

Hệ quả:

- `complexId` trong request có khả năng không được map vào entity.
- Listing tạo mới không gắn vào Complex cha.

Trạng thái: Chưa khớp.

Hướng xử lý:

- Trong `ListingService.createListing`, nếu có `complexId`, load Complex, verify owner, set `listing.setComplex(complex)`.
- Chỉ Enterprise/chủ Complex mới được gắn Listing vào Complex.

#### 3.10. Duyệt Host/Enterprise chưa transactional đúng flow

Identity có:

- Cập nhật approval status: `UserService.java:406`
- Thêm role Host: `UserService.java:442`
- Thêm role Enterprise: `UserService.java:458`

Controller:

- Approval status: `UserController.java:87`
- Success upgrade Host: `UserController.java:188`
- Success upgrade Enterprise: `UserController.java:195`

Rủi ro:

- Duyệt status và cấp role là 2 API riêng.
- Nếu Admin set approval `APPROVED` nhưng không gọi success endpoint, user có hồ sơ approved nhưng chưa có role.
- Nếu success endpoint được gọi không kiểm tra approval status approved, có thể cấp role sai quy trình.

Trạng thái: Khớp một phần.

Hướng xử lý:

- Gộp approve + grant role trong một transaction.
- Reject thì không grant role.
- Lưu người duyệt, thời điểm duyệt và lý do reject.

### P2 - Thiếu chức năng theo báo cáo

#### 3.11. UC1.3 Quên/khôi phục mật khẩu chưa có

Báo cáo yêu cầu khôi phục mật khẩu qua Email/OTP.

Code `AuthenticationController` chỉ có:

- Login.
- Refresh roles.

File:

- `Identity/src/main/java/com/gotravel/Identity/controller/AuthenticationController.java:27`
- `Identity/src/main/java/com/gotravel/Identity/controller/AuthenticationController.java:38`

Trạng thái: Chưa có.

#### 3.12. OAuth2 đăng ký/đăng nhập chưa có

Báo cáo có nhắc đăng ký “hoặc dùng OAuth2”. Code hiện tại mới có LOCAL provider và login username/password.

Trạng thái: Chưa có hoặc chưa triển khai.

#### 3.13. Admin sub-roles chưa có

Báo cáo chia Admin thành:

- Moderator.
- Accountant.
- Customer Support.
- Super Admin.

Code hiện chỉ thấy role `ADMIN` chung.

Trạng thái: Chưa có.

#### 3.14. Refund API UC6.8 chưa có

Báo cáo yêu cầu Admin kích hoạt Refund API, gọi VNPay refund, trừ escrow và tạo transaction `REFUND`.

Code Payment hiện không thấy endpoint refund.

Trạng thái: Chưa có.

#### 3.15. Cấu hình tỷ lệ hoa hồng UC6.5 chưa có

Báo cáo yêu cầu Admin cấu hình commission rate.

Code đang hardcode:

- `COMMISSION_RATE = 0.05`
- File: `PaymentandWallet/src/main/java/com/gotravel/PaymentandWallet/service/PaymentService.java:50`

Trạng thái: Chưa khớp.

#### 3.16. Host tạo lệnh rút tiền UC6.4 chưa có

Báo cáo yêu cầu Host đặt lệnh rút tiền từ số dư khả dụng.

Code hiện tại:

- Host chỉ xem payout: `HostPayoutController.java:26`
- Admin chỉ mark paid: `HostPayoutController.java:33`

Thiếu:

- `POST /payouts` tạo lệnh rút.
- Validate bank info.
- Validate hạn mức rút tối thiểu.
- Validate số dư khả dụng.
- Reject payout và rollback.

Trạng thái: Chưa có.

#### 3.17. Bank info nằm ở Identity nhưng Payment không dùng

Identity có bank fields:

- `Identity/src/main/java/com/gotravel/Identity/entity/HostProfile.java:40`
- `Identity/src/main/java/com/gotravel/Identity/entity/HostProfile.java:41`
- `Identity/src/main/java/com/gotravel/Identity/dto/request/HostProfileRequest.java:17`

Payment payout chưa thấy gọi Identity để lấy bank info khi Admin chuyển tiền.

Trạng thái: Chưa khớp với UC6.2, UC6.4 và UC6.7.

#### 3.18. Email/thông báo/QR ticket UC7.5 chưa có

Báo cáo yêu cầu Node.js Comm Service tạo QR code và gửi email vé điện tử sau thanh toán.

Code chỉ có QR payment SePay, không có email ticket/SMTP/Comm service.

Tìm thấy:

- QR payment: `PaymentService.java:69`

Không thấy:

- Email service.
- QR ticket.
- Async message queue/API call từ Order sang Comm.

Trạng thái: Chưa có.

#### 3.19. Secure e-KYC thiếu signed URL cho Admin xem tài liệu

Media có upload secure document private:

- `cloudinary-service/src/controllers/media.controller.js:19`
- `cloudinary-service/src/controllers/media.controller.js:94`
- `cloudinary-service/src/routes/media.routes.js:26`

Báo cáo UC7.3 yêu cầu Admin xem ảnh qua Signed URL có hạn dùng 5 phút.

Code chưa thấy endpoint tạo signed URL.

Trạng thái: Khớp upload private một phần, thiếu view secure.

#### 3.20. Map view UC3.3 chưa có API riêng

Entity Listing/Landmark có lat/lng và geometry, nhưng chưa thấy endpoint tối ưu trả về marker/map bounds.

Trạng thái: Khớp data model một phần.

## 4. Bug/Rủi Ro Kỹ Thuật Khác

### 4.1. Internal service URL bị hardcode ở một số FeignClient

Ví dụ:

- `CatalogandListing/src/main/java/com/Listing/CatalogandListing/client/InventoryClient.java`
- `CartandOrder/src/main/java/com/GoTravel/CartandOrder/client/InventoryClient.java`

Một số URL đang là `http://localhost:8083`.

Rủi ro:

- Khó deploy Docker/Kubernetes.
- Lệch với định hướng native-cloud/config-driven trong báo cáo.

Hướng xử lý:

- Dùng property `${services.booking.url:...}` thống nhất.

### 4.2. Inventory lock hết hạn chỉ được release nếu PaymentRequest tồn tại

Inventory có repository tìm lock hết hạn:

- `BookingandInventory/src/main/java/com/Gostay/BookingandInventory/repository/InventoryLockRepository.java:19`

Nhưng chưa thấy scheduler trong Inventory sử dụng repository này.

Payment có scheduler expire payment:

- `PaymentandWallet/src/main/java/com/gotravel/PaymentandWallet/scheduler/PaymentExpiryScheduler.java:31`

Rủi ro:

- Nếu order lock thành công nhưng user không tạo payment request, lock có thể không được release tự động.
- Inventory nên tự quản lý lock TTL của chính nó.

### 4.3. Review exception đang dùng RuntimeException

Trong `ReviewService`, lỗi đang throw `RuntimeException` với message:

- `CatalogandListing/src/main/java/com/Listing/CatalogandListing/service/ReviewService.java:34`
- `CatalogandListing/src/main/java/com/Listing/CatalogandListing/service/ReviewService.java:38`

Rủi ro:

- Response error không đồng nhất với `AppException`/ErrorCode.

### 4.4. Payment webhook thành công nhưng notify Order fail không có retry

Payment khi completed có gọi Order:

- `PaymentandWallet/src/main/java/com/gotravel/PaymentandWallet/service/PaymentService.java:175`

Nếu gọi Order fail, hiện chỉ log error.

Rủi ro:

- Payment completed nhưng Order vẫn `PAYMENT_PENDING`.
- Inventory lock không được confirm.

Hướng xử lý:

- Thêm outbox/retry job.
- Hoặc dùng saga/event bus.

### 4.5. Admin payout mark-paid không validate current status

`HostPayoutService.markAsPaid` set `PAID` trực tiếp:

- `PaymentandWallet/src/main/java/com/gotravel/PaymentandWallet/service/HostPayoutService.java:45`

Rủi ro:

- Mark paid nhiều lần.
- Mark paid payout đã cancel/invalid.

Hướng xử lý:

- Chỉ cho phép `PENDING -> PAID`.
- Lưu `paidBy`, `proofUrl`/bill và note.

### 4.6. `ddl-auto: update` trong các service dev

Các service dev đang dùng `ddl-auto: update`:

- `Identity/src/main/resources/database.yaml:10`
- `CatalogandListing/src/main/resources/database.yaml:10`
- `BookingandInventory/src/main/resources/database.yaml:10`
- `CartandOrder/src/main/resources/database.yaml:10`
- `PaymentandWallet/src/main/resources/database.yaml:10`

Rủi ro:

- Demo local tiện lợi, nhưng không phù hợp production.
- Dễ drift schema so với tài liệu DB.

Hướng xử lý:

- Dùng Flyway/Liquibase.
- Production nên dùng `validate`.

## 5. Những Phần Đã Khớp Với Báo Cáo

### 5.1. Kiến trúc microservice tách service

Báo cáo yêu cầu tách các domain:

- Identity & Access.
- Catalog & Listing.
- Booking & Inventory.
- Cart & Order.
- Payment & Wallet.
- Media & Comm.

Repo hiện có các service tương ứng:

- `Identity`
- `CatalogandListing`
- `BookingandInventory`
- `CartandOrder`
- `PaymentandWallet`
- `cloudinary-service`
- `APIGateway`

Trạng thái: Khớp về cấu trúc tổng thể.

### 5.2. Database-per-service

Mỗi Java service có database riêng:

- Identity: `auth_db`
- Catalog: `cataloglisting`
- Booking: `bookinginventory`
- Cart: `cartorder`
- Payment: `paymentwallet`

File:

- `Identity/src/main/resources/database.yaml:3`
- `CatalogandListing/src/main/resources/database.yaml:3`
- `BookingandInventory/src/main/resources/database.yaml:3`
- `CartandOrder/src/main/resources/database.yaml:3`
- `PaymentandWallet/src/main/resources/database.yaml:3`

Trạng thái: Khớp.

### 5.3. JWT RSA + JWKS

Báo cáo yêu cầu JWT stateless, RSA, public key qua JWKS để các service verify local.

Code có:

- Identity tạo token RS256, issuer, audience, scope.
- JWKS endpoint.
- Các service phía sau Gateway dùng `jwk-set-uri`.

File:

- `Identity/src/main/java/com/gotravel/Identity/service/AuthenticationService.java:101`
- `Identity/src/main/java/com/gotravel/Identity/service/AuthenticationService.java:102`
- `Identity/src/main/java/com/gotravel/Identity/service/AuthenticationService.java:107`
- `Identity/src/main/java/com/gotravel/Identity/controller/JwksController.java:24`
- `CatalogandListing/src/main/resources/jwt.yaml:6`
- `BookingandInventory/src/main/resources/jwt.yaml:6`
- `CartandOrder/src/main/resources/jwt.yaml:6`
- `PaymentandWallet/src/main/resources/jwt.yaml:6`

Trạng thái: Khớp phần lớn. Riêng media issuer đang sai.

### 5.4. API Gateway là cửa vào chung

Báo cáo yêu cầu client đi qua API Gateway, internal routes không expose.

Code có:

- Setup proxy cho các service.
- Verify JWT nếu route auth.
- Xóa header internal từ request client.
- Chặn `/api/v1/internal`.
- Rate limit login/register.

File:

- `APIGateway/src/gateway/proxy.routes.js:13`
- `APIGateway/src/gateway/proxy.routes.js:23`
- `APIGateway/src/app.js:24`
- `APIGateway/src/app.js:30`
- `APIGateway/src/middlewares/auth-rate-limit.middleware.js:24`

Trạng thái: Khớp khá tốt.

### 5.5. Identity account-profile-role cơ bản

Code đã có:

- Đăng ký user.
- Đăng nhập.
- Bcrypt password.
- User profile.
- Host profile.
- Enterprise profile.
- Admin list user/host/enterprise.
- Admin ban/unban.
- Admin approve/reject profile.
- Upgrade role/revoke role.

File:

- `Identity/src/main/java/com/gotravel/Identity/controller/UserController.java`
- `Identity/src/main/java/com/gotravel/Identity/service/UserService.java`
- `Identity/src/main/java/com/gotravel/Identity/configuration/SecurityConfig.java:99`

Trạng thái: Khớp một phần lớn với UC1.1, UC1.2, UC1.4, UC1.5, UC1.6, UC1.7, UC1.8, UC1.9, UC1.10. Thiếu UC1.3 và cần sửa flow approve/role.

### 5.6. Catalog data model đã có nền tảng

Code có:

- Landmark.
- LandmarkSuggestion.
- Complex.
- Listing.
- Review.
- Listing attributes JSONB đa hình.
- Latitude/longitude/geometry.

File:

- `CatalogandListing/src/main/java/com/Listing/CatalogandListing/entity/Listing.java`
- `CatalogandListing/src/main/java/com/Listing/CatalogandListing/entity/Landmark.java`
- `CatalogandListing/src/main/java/com/Listing/CatalogandListing/entity/Complex.java`
- `CatalogandListing/src/main/java/com/Listing/CatalogandListing/entity/Review.java`

Trạng thái: Khớp nền tảng UC2.x/UC3.x, nhưng nghiệp vụ chưa đầy đủ.

### 5.7. Landmark official/suggestion đã có

Code có:

- Host đề xuất Landmark.
- Admin xem đề xuất.
- Admin update suggestion status.
- Admin tạo Landmark.
- Admin cập nhật Landmark.
- Admin đổi status Landmark.
- Public lấy landmarks.

File:

- `CatalogandListing/src/main/java/com/Listing/CatalogandListing/controller/CatalogHostController.java:37`
- `CatalogandListing/src/main/java/com/Listing/CatalogandListing/controller/CatalogAdminController.java:35`
- `CatalogandListing/src/main/java/com/Listing/CatalogandListing/controller/CatalogAdminController.java:54`
- `CatalogandListing/src/main/java/com/Listing/CatalogandListing/controller/CatalogAdminController.java:83`
- `CatalogandListing/src/main/java/com/Listing/CatalogandListing/controller/CatalogAdminController.java:98`
- `CatalogandListing/src/main/java/com/Listing/CatalogandListing/controller/CatalogAdminController.java:115`
- `CatalogandListing/src/main/java/com/Listing/CatalogandListing/controller/CatalogPublicController.java:44`

Trạng thái: Khớp khá tốt về API, cần bổ sung RBAC và transaction duyệt đề xuất -> tạo Landmark nếu cần.

### 5.8. Inventory có soft-lock và optimistic locking

Báo cáo nhấn mạnh chống overbooking bằng optimistic locking.

Code có:

- `@Version` trên `InventoryCalendar`.
- Lock 15 phút.
- Confirm lock.
- Cancel/release lock.
- Public availability.
- Host block/unblock.
- Admin force block.

File:

- `BookingandInventory/src/main/java/com/Gostay/BookingandInventory/entity/InventoryCalendar.java:62`
- `BookingandInventory/src/main/java/com/Gostay/BookingandInventory/service/InventoryInternalService.java:126`
- `BookingandInventory/src/main/java/com/Gostay/BookingandInventory/service/InventoryInternalService.java:171`
- `BookingandInventory/src/main/java/com/Gostay/BookingandInventory/service/InventoryInternalService.java:185`
- `BookingandInventory/src/main/java/com/Gostay/BookingandInventory/controller/InventoryPublicController.java:33`
- `BookingandInventory/src/main/java/com/Gostay/BookingandInventory/controller/InventoryHostController.java:49`
- `BookingandInventory/src/main/java/com/Gostay/BookingandInventory/controller/InventoryAdminController.java:49`

Trạng thái: Khớp phần cốt lõi UC5.1, UC5.2, UC5.4. Thiếu giá động UC5.3, owner check và release scheduler độc lập.

### 5.9. Cart và checkout nối với Inventory

Code có:

- Add/update/delete cart item.
- Lấy giá tin cậy từ Catalog, không lấy giá client gửi.
- Checkout cart.
- Book now.
- Lock inventory trước khi thanh toán.
- Payment success confirm lock.
- Payment failed cancel lock.

File:

- `CartandOrder/src/main/java/com/GoTravel/CartandOrder/controller/CartController.java:24`
- `CartandOrder/src/main/java/com/GoTravel/CartandOrder/controller/CartController.java:29`
- `CartandOrder/src/main/java/com/GoTravel/CartandOrder/controller/CartController.java:36`
- `CartandOrder/src/main/java/com/GoTravel/CartandOrder/controller/CartController.java:44`
- `CartandOrder/src/main/java/com/GoTravel/CartandOrder/service/CartService.java:117`
- `CartandOrder/src/main/java/com/GoTravel/CartandOrder/service/OrderService.java:47`
- `CartandOrder/src/main/java/com/GoTravel/CartandOrder/service/OrderService.java:68`
- `CartandOrder/src/main/java/com/GoTravel/CartandOrder/service/OrderService.java:94`
- `CartandOrder/src/main/java/com/GoTravel/CartandOrder/service/OrderService.java:230`
- `CartandOrder/src/main/java/com/GoTravel/CartandOrder/service/OrderService.java:245`

Trạng thái: Khớp một phần UC4.1, UC4.2, UC5.4.

### 5.10. Payment có flow thanh toán cơ bản và webhook

Code có:

- Tạo payment request.
- Sinh QR URL.
- Webhook public từ SePay.
- Verify webhook.
- Idempotency bằng `sepayId`.
- Match payment code.
- Validate amount.
- Tạo transaction.
- Báo Order payment success.
- Payment expiry scheduler.

File:

- `PaymentandWallet/src/main/java/com/gotravel/PaymentandWallet/controller/PaymentController.java:28`
- `PaymentandWallet/src/main/java/com/gotravel/PaymentandWallet/controller/SepayWebhookController.java:35`
- `PaymentandWallet/src/main/java/com/gotravel/PaymentandWallet/service/PaymentService.java:69`
- `PaymentandWallet/src/main/java/com/gotravel/PaymentandWallet/service/PaymentService.java:101`
- `PaymentandWallet/src/main/java/com/gotravel/PaymentandWallet/service/PaymentService.java:106`
- `PaymentandWallet/src/main/java/com/gotravel/PaymentandWallet/service/PaymentService.java:245`
- `PaymentandWallet/src/main/java/com/gotravel/PaymentandWallet/scheduler/PaymentExpiryScheduler.java:31`

Trạng thái: Khớp về concept payment request/webhook, nhưng lệch VNPay/MoMo và thiếu wallet/refund.

### 5.11. Media upload đã có nền tảng

Code có:

- Single image upload.
- Bulk upload.
- Secure document upload private.
- Delete media.
- Multer memory storage.
- Sharp optimize image.
- Cloudinary storage.
- Ownership/RBAC theo role.

File:

- `cloudinary-service/src/routes/media.routes.js:22`
- `cloudinary-service/src/routes/media.routes.js:24`
- `cloudinary-service/src/routes/media.routes.js:26`
- `cloudinary-service/src/routes/media.routes.js:28`
- `cloudinary-service/src/controllers/media.controller.js:19`
- `cloudinary-service/src/controllers/media.controller.js:94`
- `cloudinary-service/src/utils/mediaOwnership.js:81`
- `cloudinary-service/src/utils/mediaOwnership.js:89`
- `cloudinary-service/src/utils/mediaOwnership.js:97`
- `cloudinary-service/src/utils/mediaOwnership.js:117`
- `cloudinary-service/src/utils/mediaOwnership.js:137`

Trạng thái: Khớp UC7.1, UC7.2, UC7.3, UC7.4 ở mức cơ bản. Còn lỗi issuer và thiếu signed URL cho Admin xem tài liệu bảo mật.

## 6. Ma Trận Use Case Tóm Tắt

| UC | Mô tả | Trạng thái backend |
| --- | --- | --- |
| UC1.1 | Đăng ký tài khoản | Có, khớp phần lớn |
| UC1.2 | Đăng nhập/đăng xuất | Có login/JWT, chưa thấy logout/token revoke |
| UC1.3 | Quên/khôi phục mật khẩu | Chưa có |
| UC1.4 | Cập nhật thông tin/avatar | Có, avatar phụ thuộc media issuer đang lỗi |
| UC1.5 | Nộp hồ sơ nâng cấp Host | Có |
| UC1.6 | Nộp e-KYC cá nhân | Có upload secure qua internal, thiếu signed URL admin |
| UC1.7 | Nộp GPKD doanh nghiệp | Có profile enterprise, chưa thấy secure document GPKD riêng |
| UC1.8 | Admin xem user/host | Có |
| UC1.9 | Admin ban/unban | Có |
| UC1.10 | Admin phê duyệt KYC/B2B | Có một phần, flow role/status cần gộp transaction |
| UC2.1 | Tạo Landmark chính thức | Có |
| UC2.2 | Cập nhật/đổi status Landmark | Có |
| UC2.3 | Host đề xuất Landmark | Có |
| UC2.4 | Admin duyệt đề xuất Landmark | Có một phần |
| UC2.5 | Enterprise tạo Complex | Có tạo Complex, thiếu RBAC và gắn Listing vào Complex |
| UC2.6 | Tạo/sửa Listing đa hình | Có, thiếu moderation và inventory config đúng |
| UC2.7 | Ẩn/xóa Listing | Có soft delete, chưa cleanup media |
| UC2.8 | Xem chi tiết Listing | Có |
| UC2.9 | Review | Có submit/get, thiếu verify order, edit/delete |
| UC2.10 | Host reply/report review | Chưa có |
| UC2.11 | Admin ẩn/xóa Listing/Review | Có đổi Listing status, chưa có review moderation |
| UC3.1 | Search theo Landmark/PostGIS | Chưa có đúng spec |
| UC3.2 | Lọc/sắp xếp kết quả | Có một phần nhỏ |
| UC3.3 | Map view | Chưa có API riêng |
| UC3.4 | Cross-selling | Chưa có |
| UC4.1 | Thêm/sửa/xóa cart | Có |
| UC4.2 | Báo giá tạm tính | Có tổng tiền cơ bản, chưa có phí/thuế/day pricing |
| UC4.3 | Xem danh sách đơn | User có, Host/Admin chưa có |
| UC4.4 | Chi tiết đơn & QR ticket | Chi tiết user có, QR ticket chưa có |
| UC4.5 | Yêu cầu/duyệt hủy đơn | User cancel cơ bản, Host approve/reject chưa có |
| UC4.6 | Xác nhận hoàn tất chuyến đi | Chưa có |
| UC4.7 | Admin force cancel | Chưa có |
| UC5.1 | Xem lịch trống | Có |
| UC5.2 | Quản lý lịch trống block/unblock | Có, thiếu owner check |
| UC5.3 | Giá động | Chưa có |
| UC5.4 | Soft-lock 15 phút | Có, cần release scheduler độc lập |
| UC6.1 | Thanh toán VNPay/MoMo | Lệch, code dùng SePay/VietQR |
| UC6.2 | Cấu hình tài khoản ngân hàng | Có trong Identity HostProfile, Payment chưa dùng |
| UC6.3 | Xem số dư escrow | Chưa có wallet đúng nghĩa |
| UC6.4 | Host đặt lệnh rút tiền | Chưa có |
| UC6.5 | Admin cấu hình commission | Chưa có, đang hardcode 5% |
| UC6.6 | Thống kê doanh thu | Có payout list cơ bản, chưa có analytics đúng spec |
| UC6.7 | Admin duyệt payout | Có mark paid, thiếu list all/reject/proof/rollback |
| UC6.8 | Refund API | Chưa có |
| UC7.1 | Upload ảnh đơn | Có, nhưng user JWT đang lỗi issuer |
| UC7.2 | Upload album | Có |
| UC7.3 | Upload secure e-KYC | Có upload private, thiếu signed URL view |
| UC7.4 | Xóa media | Có ownership cơ bản |
| UC7.5 | Email/thông báo/QR | Chưa có |

## 7. Thứ Tự Xử Lý Đề Xuất

### Đợt 1 - Sửa lỗi chặn demo và bảo mật

1. Sửa media JWT issuer.
2. Thêm RBAC cho Catalog Host/Admin/User controllers.
3. Sửa admin seed hardcode/reset password.
4. Thêm owner check cho Inventory Host endpoints.
5. Thêm Inventory lock expiry scheduler độc lập.

### Đợt 2 - Làm đúng luồng nghiệp vụ đặt chỗ/thanh toán

1. Hoàn thiện Order lifecycle: cancel request, Host approve/reject, complete trip, Admin force cancel.
2. Thiết kế lại Wallet/Escrow ledger.
3. Payment success chỉ credit escrow, không tạo payout ngay.
4. Trip completed mới move escrow sang available.
5. Host tạo payout request, Admin approve/reject.

### Đợt 3 - Đồng bộ với báo cáo thanh toán

1. Chọn chính thức: VNPay/MoMo hay SePay.
2. Nếu dùng VNPay/MoMo: implement create payment URL, return/IPN, refund.
3. Nếu giữ SePay: cập nhật báo cáo, sequence diagram, use case UC6.1/UC6.8.

### Đợt 4 - Hoàn thiện Catalog/Search/Review

1. Search theo Landmark/PostGIS.
2. Filter/sort giá, tiện nghi, rating, distance.
3. Complex -> Listing mapping.
4. Listing moderation `PENDING/APPROVED/REJECTED`.
5. Review verify completed order.
6. Review edit/delete/reply/report/moderation.

### Đợt 5 - Tiện ích hệ thống

1. Quên mật khẩu OTP/email.
2. Comm service gửi email QR ticket.
3. Secure document signed URL cho Admin.
4. Analytics doanh thu Host/Admin/Enterprise.
5. Test tự động và integration test.

## 8. Kết Quả Kiểm Tra Build/Syntax

Đã chạy:

- `mvnw -DskipTests compile` cho `Identity`: pass.
- `mvnw -DskipTests compile` cho `CatalogandListing`: pass.
- `mvnw -DskipTests compile` cho `BookingandInventory`: pass.
- `mvnw -DskipTests compile` cho `CartandOrder`: pass.
- `mvnw -DskipTests compile` cho `PaymentandWallet`: pass.
- `node --check` cho `APIGateway`: pass.
- `node --check` cho `cloudinary-service`: pass.

Chưa chạy:

- Integration test end-to-end vì chưa có môi trường DB/service runtime đang bật.
- Chưa có bộ test tự động đầy đủ trong repo cho các luồng UC.

## 9. Ghi Chú

Tài liệu này chỉ đánh giá backend theo static code review và compile/syntax check. Các kết luận về “chưa khớp” dựa trên việc đối chiếu code hiện có với use case trong báo cáo. Để kết luận “hoạt động đúng runtime”, cần thêm bộ integration test gọi API qua Gateway với DB thực tế và seed data.
