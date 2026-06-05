# Kế hoạch tạo dữ liệu mẫu quy mô lớn cho Catalog & Listing

## 1. Mục tiêu

Tạo một bộ dữ liệu mẫu đủ lớn, đủ thật và đủ đúng kỹ thuật để phục vụ các luồng chính của hệ thống GoStay:

- Hiển thị trang chủ với 6 địa danh nổi bật.
- Autocomplete địa điểm theo Landmark, Province, Complex.
- Tìm kiếm kiểu Airbnb theo địa điểm, thời gian, số khách và category.
- Search map theo bounding box.
- Gợi ý quanh vị trí người dùng.
- Gợi ý theo tỉnh: tỉnh -> Landmark/Complex/khu du lịch.
- Gợi ý theo Landmark: địa danh -> lưu trú/trải nghiệm/dịch vụ quanh khu vực.
- Gợi ý theo Complex: complex -> các listing thuộc complex.
- Gợi ý chéo sau khi thêm listing vào giỏ hàng.

Mục tiêu không chỉ là có nhiều bản ghi trong database, mà là tạo dữ liệu đúng với cơ chế Search & Recommendation hiện tại.

## 2. Kết luận về kế hoạch ban đầu

Kế hoạch ban đầu đúng hướng nhưng chưa đủ chuẩn nếu triển khai ngay.

Các điểm cần chỉnh:

- Không thể chỉ seed `Complexes` và `Listings`; bắt buộc phải seed `Landmarks` trước vì Node Search & Recommendation đang dùng Landmark cho hero banner, autocomplete, province discovery và nearby search.
- Không nên random tọa độ quá tự do quanh trung tâm tỉnh. Dữ liệu phải bám quanh Landmark/Complex thật để `ST_DWithin`, `ST_Distance`, map viewport và recommendation trả kết quả hợp lý.
- Nếu insert trực tiếp bằng SQL thì phải tự set PostGIS `location`, vì SQL seed không đi qua Java service.
- Nếu có `checkIn/checkOut`, Node Search sẽ gọi Booking/Inventory để kiểm tra còn phòng. Vì vậy muốn test search theo ngày thì cần seed thêm inventory hoặc chuẩn bị dữ liệu inventory tương ứng.
- Không nên hotlink ảnh từ website bất kỳ. Cần nguồn ảnh rõ ràng và có chiến lược lưu ảnh ổn định.
- `mvn compile` không đủ để verify migration SQL. Phải chạy Flyway thật trên PostgreSQL/PostGIS.

## 3. Phạm vi dữ liệu cần tạo

### 3.1. Landmark

Landmark là lớp dữ liệu quan trọng nhất cho search/location.

Số lượng đề xuất:

- Tối thiểu: 30 Landmark.
- Khuyến nghị: 50 Landmark.
- Trong đó có đúng hoặc ít nhất 6 Landmark `is_featured = true` để phục vụ hero banner.

Các field cần có:

- `id`: UUID cố định.
- `name`: tên địa danh có dấu.
- `description`: mô tả ngắn, thật và phù hợp.
- `province`: tỉnh/thành.
- `latitude`: vĩ độ thật.
- `longitude`: kinh độ thật.
- `location`: `ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)`.
- `radius_meters`: bán kính gợi ý quanh địa danh.
- `thumbnail_url`: ảnh đại diện.
- `gallery_urls`: JSONB array chứa nhiều ảnh.
- `is_featured`: true/false.
- `status`: `ACTIVE`.
- `created_at`, `updated_at`.

Ví dụ nhóm Landmark cần có:

- Hồ Hoàn Kiếm, Văn Miếu, Phố cổ Hà Nội.
- Chợ Bến Thành, Nhà thờ Đức Bà, Phố đi bộ Nguyễn Huệ.
- Bà Nà Hills, Bãi biển Mỹ Khê, Cầu Rồng.
- Vịnh Hạ Long, Bãi Cháy, Yên Tử.
- Sa Pa, Fansipan, Bản Cát Cát.
- Tràng An, Tam Cốc, Hang Múa.
- Phố cổ Hội An, Chùa Cầu, Cù Lao Chàm.
- Đại Nội Huế, Lăng Tự Đức, Chùa Thiên Mụ.
- VinWonders Phú Quốc, Bãi Sao, Dinh Cậu.
- Tháp Bà Ponagar, VinWonders Nha Trang, Hòn Mun.

### 3.2. Complex

Complex đại diện cho khu tổ hợp, resort, khu nghỉ dưỡng, khu du lịch hoặc hệ sinh thái nhiều dịch vụ.

Số lượng đề xuất:

- Tối thiểu: 10 Complex.
- Khuyến nghị: 15-20 Complex.

Các field cần có:

- `id`: UUID cố định.
- `host_id`: UUID cố định cho enterprise/host giả lập.
- `name`: tên complex.
- `description`: mô tả.
- `province`: tỉnh/thành.
- `latitude`, `longitude`.
- `location`: `ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)`.
- `thumbnail_url`.
- `gallery_urls`: JSONB array.
- `status`: `ACTIVE`.
- `created_at`, `updated_at`.

Nguyên tắc tạo Complex:

- Complex phải nằm gần một Landmark hoặc trong một tỉnh du lịch rõ ràng.
- Mỗi Complex nên có 5-15 Listing gắn vào để test grouping và recommendation theo Complex.
- Complex không nên chỉ là resort; có thể là khu du lịch, khu nghỉ dưỡng, tổ hợp villa, tổ hợp dịch vụ trải nghiệm.

Ví dụ:

- Hoan Kiem Heritage Stay Complex.
- My Khe Beach Resort Collection.
- Hoi An Riverside Retreat.
- Ha Long Bay Marina Complex.
- Sa Pa Mountain Eco Village.
- Phu Quoc Sunset Resort Hub.
- Ninh Binh Trang An Eco Complex.

### 3.3. Listing

Listing là dữ liệu chính để search, map, recommendation và cross-sell.

Số lượng đề xuất:

- Tối thiểu: 150 Listing.
- Khuyến nghị: 200-250 Listing.

Tỷ lệ đề xuất:

- `STAY`: 45-50%.
- `EXP`: 25-30%.
- `SVC`: 20-25%.

Phân bổ mẫu cho 200 listing:

- 90 `STAY`.
- 60 `EXP`.
- 50 `SVC`.

Các field cần có:

- `id`: UUID cố định.
- `host_id`: UUID cố định.
- `complex_id`: có hoặc null.
- `category`: `STAY`, `EXP`, `SVC`.
- `sub_category`: theo enum hiện tại.
- `title`: tên listing có dấu.
- `description`: mô tả.
- `province`: tỉnh/thành.
- `base_price`.
- `price_unit`: `PER_NIGHT`, `PER_PAX`, `PER_HOUR`.
- `latitude`, `longitude`.
- `location`: `ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)`.
- `thumbnail_url`.
- `attributes`: JSONB.
- `average_rating`.
- `total_reviews`.
- `status`: `ACTIVE` cho dữ liệu public demo.
- `created_at`, `updated_at`.

Lưu ý về `sub_category`:

- Enum hiện tại gồm: `PHOTOGRAPHY`, `CHEF`, `MASSAGE`, `PREPARED_MEALS`, `TRAINING`, `MAKEUP`, `HAIR_STYLING`, `SPA`, `CATERING`, `NONE`.
- Với `STAY` và nhiều `EXP`, nếu chưa có enum riêng thì dùng `NONE`.
- Với `SVC`, dùng đúng sub category tương ứng như `SPA`, `MASSAGE`, `CHEF`, `PHOTOGRAPHY`, `MAKEUP`, `CATERING`.

Nguyên tắc tọa độ Listing:

- Listing thuộc Complex: tọa độ nằm rất gần tọa độ Complex, khoảng 50-500 mét.
- Listing quanh Landmark: tọa độ nằm trong `radius_meters` của Landmark.
- Không tạo listing nằm quá xa Landmark nhưng vẫn cùng tỉnh nếu listing đó dùng để test nearby.
- Cần có cả listing gần và xa để infinite scroll/recommendation có độ phân tầng.

### 3.4. Review

Review giúp scoring hoạt động thật hơn vì Recommendation đang dùng rating và popularity.

Số lượng đề xuất:

- 300-800 review giả lập.
- Không cần review cho tất cả listing, nhưng listing nổi bật nên có nhiều review hơn.

Các field cần có:

- `id`: UUID cố định.
- `listing_id`.
- `user_id`: UUID giả lập.
- `rating`: 1-5.
- `comment`.
- `images`: JSONB array hoặc null.
- `created_at`.

Nguyên tắc:

- Listing nổi bật: rating 4.6-5.0, nhiều review.
- Listing bình thường: rating 4.0-4.6.
- Một số listing ít review để test penalty trong scoring.

### 3.5. Inventory

Inventory không thuộc CatalogandListing, nhưng cần nếu muốn test search theo ngày.

Nếu không seed Inventory:

- Search không có `checkIn/checkOut` vẫn trả listing.
- Search có `checkIn/checkOut` có thể trả rỗng vì Node gọi Booking/Inventory để filter availability.

Khuyến nghị:

- Tạo seed riêng cho BookingandInventory.
- Mỗi `STAY` listing nên có inventory trong 60-90 ngày tới.
- Một số listing có ngày sold out để test filter.
- `EXP` và `SVC` cũng cần capacity nếu hệ thống booking áp dụng chung inventory.

## 4. Tỉnh/thành nên ưu tiên

Khuyến nghị seed theo 10 cụm du lịch để đủ dữ liệu cho search và recommendation:

| Nhóm | Tỉnh/thành | Lý do |
|---|---|---|
| 1 | Hà Nội | Có nhiều Landmark, STAY, city tour, photography |
| 2 | TP. Hồ Chí Minh | Nhiều dịch vụ, lưu trú, city experience |
| 3 | Đà Nẵng | Biển, resort, dịch vụ du lịch |
| 4 | Quảng Ninh | Hạ Long, du thuyền, nghỉ dưỡng |
| 5 | Lào Cai | Sa Pa, trekking, homestay |
| 6 | Ninh Bình | Tràng An, Tam Cốc, eco tour |
| 7 | Quảng Nam | Hội An, resort, workshop |
| 8 | Thừa Thiên Huế | Di sản, city tour, trải nghiệm văn hóa |
| 9 | Kiên Giang | Phú Quốc, resort, tour đảo |
| 10 | Khánh Hòa | Nha Trang, biển, diving, resort |

## 5. Chiến lược hình ảnh

### 5.1. Nguyên tắc chung

Không dùng ảnh bất kỳ lấy từ Google Images hoặc website lạ.

Ưu tiên nguồn:

- Pexels: ảnh miễn phí, attribution không bắt buộc theo license của Pexels.
- Unsplash: ảnh miễn phí, nhưng nếu dùng qua API cần tuân thủ API guideline, attribution và download tracking.
- Wikimedia Commons: phù hợp cho Landmark thật, nhưng nhiều ảnh yêu cầu attribution/license rõ ràng.
- Website chính thức/tự upload: tốt nhất nếu có quyền sử dụng.

Nguồn tham khảo:

- Pexels License: https://www.pexels.com/legal-pages/license
- Unsplash License/Help: https://help.unsplash.com/en/articles/2612315-can-i-use-unsplash-images-for-personal-or-commercial-projects
- Unsplash API Terms: https://unsplash.com/api-terms
- Wikimedia Commons Reuse: https://commons.wikimedia.org/wiki/Commons%3AREUSE

### 5.2. Không nên hotlink trực tiếp cho production

Với demo local, có thể lưu URL ảnh trực tiếp nếu nguồn cho phép.

Với production hoặc demo nghiêm túc:

1. Chọn ảnh.
2. Lưu metadata nguồn ảnh.
3. Upload ảnh lên Cloudinary/S3.
4. Lưu URL Cloudinary/S3 vào `thumbnail_url`, `gallery_urls`.

Lý do:

- Tránh URL ảnh chết.
- Tránh bị chặn hotlink.
- Tối ưu kích thước ảnh.
- Dễ thay đổi CDN.
- Dễ kiểm soát license/credit.

### 5.3. Metadata ảnh nên lưu ở file nguồn

Trong file seed source nên lưu:

```json
{
  "imageUrl": "https://...",
  "source": "Pexels",
  "sourcePage": "https://...",
  "author": "Tên tác giả nếu có",
  "license": "Pexels License",
  "attributionRequired": false
}
```

Database hiện chưa có bảng riêng cho image credit, nên ít nhất metadata này phải nằm trong file nguồn seed để sau này còn audit được.

## 6. Cấu trúc file đề xuất

Không nên viết tay trực tiếp một file SQL dài hàng nghìn dòng.

Nên dùng cấu trúc:

```text
CatalogandListing/
  seed/
    catalog_seed_source.json
    image_sources.json
  scripts/
    generate-catalog-seed.js
  src/main/resources/db/migration/
    V10__seed_demo_catalog_data.sql
```

Ý nghĩa:

- `catalog_seed_source.json`: dữ liệu gốc dễ review.
- `image_sources.json`: danh sách ảnh và license/nguồn.
- `generate-catalog-seed.js`: script sinh SQL deterministic.
- `V10__seed_demo_catalog_data.sql`: file Flyway migration cuối cùng sau khi đã review.

## 7. Vì sao nên dùng script sinh SQL

Lý do:

- Tránh viết tay hàng trăm UUID.
- Có thể sinh tọa độ quanh Landmark/Complex theo bán kính hợp lý.
- Có thể đảm bảo tỷ lệ category.
- Có thể tạo dữ liệu deterministic bằng seed cố định.
- Dễ regenerate nếu cần đổi số lượng.
- Dễ validate trước khi tạo SQL.

Script nên làm các việc:

- Đọc `catalog_seed_source.json`.
- Validate required fields.
- Validate lat/lng range.
- Validate URL ảnh.
- Validate category/sub category/status hợp lệ.
- Generate UUID cố định hoặc đọc UUID đã định nghĩa.
- Sinh SQL insert theo đúng thứ tự.
- Tự set `location` PostGIS.
- Tự escape string/JSON an toàn.
- Sinh thêm block verification cuối migration.

## 8. Chiến lược Flyway migration

### 8.1. Không sửa migration đã chạy

Nếu `V10__seed_demo_catalog_data.sql` đã chạy trên database, không nên sửa lại file đó.

Nếu cần chỉnh data sau khi đã chạy:

- Tạo migration mới `V11__adjust_demo_catalog_data.sql`.
- Hoặc nếu chỉ là dev local và chấp nhận reset DB, có thể drop/recreate database.

### 8.2. Seed demo nên idempotent ở mức hợp lý

Vì Flyway versioned migration chỉ chạy một lần, seed SQL không bắt buộc phải idempotent tuyệt đối.

Tuy nhiên vẫn nên dùng:

```sql
INSERT INTO public.landmarks (...)
VALUES (...)
ON CONFLICT (id) DO UPDATE SET ...
```

Lợi ích:

- Dễ chạy lại trong môi trường dev nếu cần.
- Dễ sửa dữ liệu khi reset chưa sạch.
- Giảm lỗi duplicate UUID.

### 8.3. Thứ tự insert

Thứ tự đúng:

1. `landmarks`
2. `complexes`
3. `listings`
4. `reviews`
5. optional inventory ở service khác

Lý do:

- Listing có thể tham chiếu `complex_id`.
- Search/recommendation cần Landmark trước để resolve location.
- Review cần `listing_id`.

## 9. Yêu cầu SQL bắt buộc

### 9.1. Set PostGIS location

Mọi row có lat/lng phải set `location`.

Mẫu:

```sql
location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
```

Lưu ý thứ tự:

- `ST_MakePoint(longitude, latitude)`
- Không phải `ST_MakePoint(latitude, longitude)`

### 9.2. JSONB gallery URLs

Mẫu:

```sql
gallery_urls = '[
  "https://example.com/image-1.jpg",
  "https://example.com/image-2.jpg"
]'::jsonb
```

### 9.3. Listing attributes

Với `STAY`, attributes nên có:

```json
{
  "bedrooms": 2,
  "bathrooms": 1,
  "maxGuests": 4,
  "amenities": ["wifi", "air_conditioning", "pool"],
  "roomType": "villa"
}
```

Với `EXP`, attributes nên có:

```json
{
  "durationHours": 4,
  "difficulty": "easy",
  "included": ["guide", "ticket"],
  "languages": ["vi", "en"]
}
```

Với `SVC`, attributes nên có:

```json
{
  "durationHours": 2,
  "serviceAreaKm": 10,
  "availableAtGuestLocation": true
}
```

Lưu ý: Java entity đang dùng `BaseListingAttributes`. Cần kiểm tra mapping thực tế trước khi thêm attributes quá phức tạp.

## 10. Quy tắc tạo dữ liệu theo luồng sản phẩm

### 10.1. Trang chủ có vị trí người dùng

Dữ liệu cần đảm bảo:

- Quanh mỗi thành phố lớn có đủ cả `STAY`, `EXP`, `SVC`.
- Listing có rating/review để scoring hoạt động.
- Listing không tập trung vào một host duy nhất vì diversity service đang giới hạn host/complex.

Tiêu chí:

- Với tọa độ trung tâm Đà Nẵng, query 20km trả ít nhất 30 listing.
- Với tọa độ Hồ Chí Minh, query 20km trả ít nhất 30 listing.
- Với tọa độ Hà Nội, query 20km trả ít nhất 30 listing.

### 10.2. Trang chủ không có vị trí

Dữ liệu cần đảm bảo:

- Có ít nhất 6 Landmark `is_featured = true`.
- Các Landmark featured có thumbnail đẹp.
- Có listing nổi bật ở nhiều tỉnh.

Tiêu chí:

- `/recommendations/home/hero-landmarks` trả đủ 6 item.
- `/recommendations/home/feed` không có lat/lng vẫn có section địa danh nổi bật và listing nổi bật.

### 10.3. Search theo thanh tìm kiếm

Dữ liệu cần đảm bảo:

- Landmark có tên tiếng Việt có dấu.
- Listing title có keyword thực tế.
- Province có nhiều Landmark/Complex.

Tiêu chí:

- Gõ `Da Nang` vẫn resolve được `Đà Nẵng`.
- Gõ `Ho Guom` vẫn autocomplete được `Hồ Hoàn Kiếm`.
- Gõ `villa bien` match được listing có title tương ứng.

### 10.4. Search theo category

Dữ liệu cần đảm bảo:

- Mỗi tỉnh du lịch có cả 3 category.
- Không để `STAY` quá áp đảo khiến các tab `EXP` và `SVC` trống.

Tiêu chí:

- `/search/listings?category=STAY` có dữ liệu.
- `/search/listings?category=EXP` có dữ liệu.
- `/search/listings?category=SVC` có dữ liệu.

### 10.5. Province discovery

Dữ liệu cần đảm bảo:

- Mỗi tỉnh có ít nhất 2-5 Landmark.
- Một số tỉnh có Complex.

Tiêu chí:

- `/recommendations/provinces` trả đủ danh sách tỉnh.
- `/recommendations/provinces/Đà Nẵng/destinations` trả cả `LANDMARK` và `COMPLEX` nếu có.

### 10.6. Cross-sell

Dữ liệu cần đảm bảo:

- Quanh một listing `STAY` phải có `EXP` và `SVC`.
- Quanh một listing `EXP` phải có `STAY` hoặc `SVC`.
- Quanh một listing `SVC` phải có `STAY` hoặc `EXP`.

Tiêu chí:

- Thêm villa Đà Nẵng vào giỏ -> gợi ý tour, spa, photography quanh Đà Nẵng.
- Không gợi ý lại listing đã nằm trong giỏ.
- Không gợi ý cùng category với source listing.

## 11. Checklist triển khai

### Giai đoạn 1: Chốt dataset

- [ ] Chốt số lượng Landmark.
- [ ] Chốt số lượng Complex.
- [ ] Chốt số lượng Listing.
- [ ] Chốt tỉnh/thành ưu tiên.
- [ ] Chốt nguồn ảnh được phép dùng.
- [ ] Chốt có seed Inventory hay chưa.

### Giai đoạn 2: Chuẩn bị dữ liệu nguồn

- [ ] Tạo `catalog_seed_source.json`.
- [ ] Tạo `image_sources.json`.
- [ ] Điền Landmark thật với tọa độ thật.
- [ ] Điền Complex gần Landmark/tỉnh.
- [ ] Điền Listing theo category.
- [ ] Gắn ảnh thumbnail/gallery.
- [ ] Gắn rating/review count hợp lý.
- [ ] Kiểm tra không có URL ảnh rỗng.
- [ ] Kiểm tra không có tọa độ ngoài range.

### Giai đoạn 3: Viết generator

- [ ] Viết script `generate-catalog-seed.js`.
- [ ] Validate schema dữ liệu nguồn.
- [ ] Generate SQL deterministic.
- [ ] Escape string/JSON đúng.
- [ ] Set PostGIS `location`.
- [ ] Generate verification SQL.
- [ ] Không tạo UUID random thay đổi mỗi lần chạy.

### Giai đoạn 4: Review SQL

- [ ] Review số lượng row insert.
- [ ] Review status/category/sub_category.
- [ ] Review `location`.
- [ ] Review JSONB.
- [ ] Review foreign key `complex_id`.
- [ ] Review ảnh và nguồn ảnh.
- [ ] Review dữ liệu có đủ 3 category quanh mỗi tỉnh chính.

### Giai đoạn 5: Chạy migration

- [ ] Chạy PostgreSQL có PostGIS.
- [ ] Chạy Java CatalogandListing để Flyway apply migration.
- [ ] Kiểm tra Flyway log.
- [ ] Không có lỗi constraint.
- [ ] Không có lỗi JSONB.
- [ ] Không có lỗi PostGIS.

### Giai đoạn 6: Verify bằng SQL

- [ ] Kiểm tra Landmark active.
- [ ] Kiểm tra 6 Landmark featured.
- [ ] Kiểm tra Complex active.
- [ ] Kiểm tra Listing đủ 3 category.
- [ ] Kiểm tra row có lat/lng nhưng `location IS NULL`.
- [ ] Kiểm tra ảnh null.
- [ ] Kiểm tra normalized search fields.

### Giai đoạn 7: Verify bằng API Node

- [ ] Test hero landmarks.
- [ ] Test province discovery.
- [ ] Test autocomplete không dấu.
- [ ] Test search theo location.
- [ ] Test search theo category.
- [ ] Test map bounding box.
- [ ] Test nearby theo Landmark.
- [ ] Test recommendation home có lat/lng.
- [ ] Test recommendation home không lat/lng.
- [ ] Test cross-sell.

## 12. SQL kiểm tra sau migration

### 12.1. Kiểm tra location null

```sql
SELECT 'listings' AS table_name, COUNT(*) AS missing_location
FROM public.listings
WHERE latitude IS NOT NULL
  AND longitude IS NOT NULL
  AND location IS NULL
UNION ALL
SELECT 'landmarks', COUNT(*)
FROM public.landmarks
WHERE latitude IS NOT NULL
  AND longitude IS NOT NULL
  AND location IS NULL
UNION ALL
SELECT 'complexes', COUNT(*)
FROM public.complexes
WHERE latitude IS NOT NULL
  AND longitude IS NOT NULL
  AND location IS NULL;
```

Kỳ vọng: tất cả `missing_location = 0`.

### 12.2. Kiểm tra số lượng theo category

```sql
SELECT category, COUNT(*)
FROM public.listings
WHERE status = 'ACTIVE'
GROUP BY category
ORDER BY category;
```

Kỳ vọng:

- `STAY` >= 80 nếu seed 200 listing.
- `EXP` >= 50 nếu seed 200 listing.
- `SVC` >= 40 nếu seed 200 listing.

### 12.3. Kiểm tra featured Landmark

```sql
SELECT id, name, province, thumbnail_url
FROM public.landmarks
WHERE status = 'ACTIVE'
  AND is_featured = true
ORDER BY updated_at DESC NULLS LAST, name
LIMIT 10;
```

Kỳ vọng: ít nhất 6 row, có ảnh đại diện.

### 12.4. Kiểm tra normalized search

```sql
SELECT COUNT(*) AS missing_landmark_normalized
FROM public.landmarks
WHERE status = 'ACTIVE'
  AND name IS NOT NULL
  AND name_normalized IS NULL;

SELECT COUNT(*) AS missing_listing_normalized
FROM public.listings
WHERE status = 'ACTIVE'
  AND title IS NOT NULL
  AND title_normalized IS NULL;
```

Kỳ vọng: cả hai query trả `0`.

### 12.5. Kiểm tra dữ liệu theo tỉnh

```sql
SELECT province, category, COUNT(*)
FROM public.listings
WHERE status = 'ACTIVE'
GROUP BY province, category
ORDER BY province, category;
```

Kỳ vọng: các tỉnh chính có đủ `STAY`, `EXP`, `SVC`.

### 12.6. Kiểm tra Complex có Listing

```sql
SELECT c.name, c.province, COUNT(l.id) AS listing_count
FROM public.complexes c
LEFT JOIN public.listings l ON l.complex_id = c.id
WHERE c.status = 'ACTIVE'
GROUP BY c.id, c.name, c.province
ORDER BY listing_count DESC;
```

Kỳ vọng: phần lớn Complex có ít nhất 3 Listing.

## 13. API kiểm tra sau migration

### 13.1. Hero Landmark

```http
GET /api/v1/recommendations/home/hero-landmarks
```

Kỳ vọng:

- Trả 6 địa danh.
- Có `thumbnailUrl`.
- Có `latitude`, `longitude`, `province`.

### 13.2. Province discovery

```http
GET /api/v1/recommendations/provinces
GET /api/v1/recommendations/provinces/Đà Nẵng/destinations
```

Kỳ vọng:

- Có danh sách tỉnh.
- Destination có cả `LANDMARK` và `COMPLEX` nếu tỉnh đó có dữ liệu.

### 13.3. Search không dấu

```http
GET /api/v1/search/locations/suggest?q=Da Nang
GET /api/v1/search/locations/suggest?q=Ho Guom
```

Kỳ vọng:

- Match được dữ liệu tiếng Việt có dấu.

### 13.4. Search listing theo địa điểm

```http
GET /api/v1/search/listings?locationQuery=Đà Nẵng&category=ALL
GET /api/v1/search/listings?locationQuery=Đà Nẵng&category=STAY
GET /api/v1/search/listings?locationQuery=Đà Nẵng&category=EXP
GET /api/v1/search/listings?locationQuery=Đà Nẵng&category=SVC
```

Kỳ vọng:

- `ALL` trả grouped sections.
- Category cụ thể chỉ trả category đó.

### 13.5. Search map

```http
GET /api/v1/search/map?minLat=15.95&maxLat=16.15&minLng=108.10&maxLng=108.35&category=ALL
```

Kỳ vọng:

- Trả marker trong bounding box.
- Có `latitude`, `longitude`, `price`, `category`.

### 13.6. Cross-sell

```http
POST /api/v1/recommendations/cross-sell/cart-item
Content-Type: application/json

{
  "sourceListingId": "UUID_CUA_LISTING_STAY",
  "sourceCategory": "STAY",
  "checkIn": "2026-07-10",
  "checkOut": "2026-07-12",
  "guests": 2,
  "cartListingIds": ["UUID_CUA_LISTING_STAY"],
  "limit": 5
}
```

Kỳ vọng:

- Không trả listing nguồn.
- Không trả listing đã có trong giỏ.
- Ưu tiên listing category khác quanh khu vực.

## 14. Rủi ro và cách xử lý

### 14.1. Ảnh chết hoặc bị chặn hotlink

Rủi ro:

- URL ảnh không render.
- Website nguồn chặn hotlink.
- Ảnh bị xóa.

Cách xử lý:

- Demo nhanh: dùng Pexels/Unsplash URL ổn định.
- Demo nghiêm túc/production: upload lên Cloudinary/S3.
- Lưu metadata nguồn ảnh.

### 14.2. Tọa độ sai thứ tự

Rủi ro:

- Dùng `ST_MakePoint(latitude, longitude)` sẽ đảo tọa độ.
- Search radius sai hoàn toàn.

Cách xử lý:

- Luôn dùng `ST_MakePoint(longitude, latitude)`.
- Có SQL verification bằng `ST_X(location)` và `ST_Y(location)`.

### 14.3. Search theo ngày trả rỗng

Rủi ro:

- Catalog có listing nhưng Inventory không có availability.

Cách xử lý:

- Seed inventory tương ứng.
- Khi test search catalog đơn thuần, không truyền `checkIn/checkOut`.

### 14.4. Dữ liệu bị lệch ranking

Rủi ro:

- Một host/complex có quá nhiều listing điểm cao.
- Diversity service phải loại bớt nên UI nhìn thiếu đa dạng.

Cách xử lý:

- Chia listing cho nhiều `host_id`.
- Chia listing cho nhiều complex.
- Rating/review không nên cùng một mức cho tất cả.

### 14.5. Migration seed quá lớn và khó sửa

Rủi ro:

- Flyway versioned migration đã chạy thì không sửa file cũ được.

Cách xử lý:

- Review kỹ JSON source trước.
- Generate SQL sau cùng.
- Nếu cần chỉnh sau khi chạy, tạo migration mới.

## 15. Tiêu chí hoàn thành

Seed data được xem là hoàn chỉnh khi đạt các tiêu chí sau:

- Có ít nhất 30 Landmark active.
- Có ít nhất 6 Landmark featured có ảnh.
- Có ít nhất 10 Complex active.
- Có ít nhất 150 Listing active.
- Listing phân bổ đủ `STAY`, `EXP`, `SVC`.
- Các tỉnh chính có dữ liệu Landmark/Complex/Listing.
- Không có row tọa độ hợp lệ nhưng `location IS NULL`.
- `thumbnail_url` không null với dữ liệu public.
- `gallery_urls` là JSONB hợp lệ.
- Autocomplete không dấu hoạt động.
- Search theo Landmark/Province/Complex hoạt động.
- Search map bounding box hoạt động.
- Recommendation home có vị trí và không có vị trí đều có dữ liệu.
- Province discovery trả Landmark/Complex.
- Cross-sell trả listing khác category quanh source listing.
- Nếu test theo ngày, Inventory cũng phải có dữ liệu tương ứng.

## 16. Đề xuất cấu hình dataset đầu tiên

Dataset đầu tiên nên vừa đủ lớn để test hệ thống nhưng chưa quá nặng.

Đề xuất:

- 50 Landmark.
- 15 Complex.
- 220 Listing:
  - 100 `STAY`.
  - 65 `EXP`.
  - 55 `SVC`.
- 500 Review.
- Inventory 90 ngày cho khoảng 100-150 listing có thể book.

Phân bổ:

- Hà Nội: 20 listing.
- TP. Hồ Chí Minh: 20 listing.
- Đà Nẵng: 30 listing.
- Quảng Ninh: 25 listing.
- Lào Cai: 20 listing.
- Ninh Bình: 20 listing.
- Quảng Nam: 25 listing.
- Thừa Thiên Huế: 20 listing.
- Kiên Giang: 30 listing.
- Khánh Hòa: 30 listing.

## 17. Quyết định cần chốt trước khi triển khai

- [ ] Dùng dataset tối thiểu hay dataset khuyến nghị?
- [ ] Có seed Inventory luôn không?
- [ ] Ảnh dùng trực tiếp từ Pexels/Unsplash/Wikimedia hay upload qua Cloudinary trước?
- [ ] Có cần lưu attribution/credit trong DB riêng không, hay chỉ lưu trong file nguồn?
- [ ] Dữ liệu demo có cần tiếng Anh song song không, hay chỉ tiếng Việt?
- [ ] Có muốn dữ liệu thật theo từng Landmark cụ thể, hay chấp nhận dữ liệu bán thật cho Listing?

## 18. Kết luận

Kế hoạch chuẩn nên triển khai theo hướng:

1. Seed `Landmarks` trước.
2. Seed `Complexes` gần Landmark/tỉnh du lịch.
3. Seed `Listings` bám quanh Landmark/Complex, đủ `STAY`, `EXP`, `SVC`.
4. Seed `Reviews` để ranking có dữ liệu.
5. Seed `Inventory` nếu muốn test search theo ngày.
6. Dùng ảnh có nguồn rõ ràng, tốt nhất upload lên Cloudinary/S3 trước khi lưu DB.
7. Luôn set `location` PostGIS trong SQL.
8. Verify bằng cả SQL và API Node.

Không nên chỉ tạo nhiều listing cho đẹp giao diện. Dữ liệu mẫu phải được thiết kế để chứng minh toàn bộ cơ chế Search & Recommendation hoạt động đúng.
