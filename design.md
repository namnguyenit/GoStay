# GoStay Search Header Design Spec

Nguồn tham chiếu: quan sát trực tiếp `https://www.airbnb.com.vn` bằng Chrome DevTools MCP ngày 2026-06-06. File này mô tả nguyên lý thiết kế, bố cục, trạng thái và animation để áp dụng cho GoStay. Không copy nguyên CSS/source của Airbnb.

## 1. Mục tiêu

Thiết kế một header search giống tinh thần Airbnb:

- Khi ở đầu trang: hiển thị search bar lớn, có tab loại hình ở trên và các segment tìm kiếm ở dưới.
- Khi người dùng scroll xuống: search bar lớn collapse thành search bar nhỏ ở giữa header.
- Khi click vào `Địa điểm`, `Thời gian`, `Khách` hoặc `Loại hình`: mở dropdown/panel tương ứng, segment đang active nổi lên bằng nền trắng + shadow.
- Giao diện phải giữ được phong cách GoStay: sạch, bo tròn, ít màu, nhấn bằng màu brand thay vì quá nhiều màu phụ.

## 2. Cấu trúc Header

Desktop header gồm 3 vùng:

- Left: logo GoStay.
- Center: search system.
- Right: host CTA, ngôn ngữ/tiền tệ, profile/menu nếu cần.

Thông số tham chiếu desktop:

- Header sticky cao khoảng `96px`.
- Padding ngang desktop khoảng `48px`.
- Z-index header nên >= `100`.
- Nền header trắng hoặc trong suốt ở hero, nhưng khi scroll nên chuyển sang trắng có border-bottom rất nhẹ.

## 3. Search Bar Lớn

Search lớn xuất hiện khi `scrollY < 40px` hoặc khi compact search được click mở rộng.

Layout:

- Tab loại hình nằm phía trên: `Nơi lưu trú`, `Trải nghiệm`, `Dịch vụ`.
- Search pill nằm dưới, rộng khoảng `850px`, cao `66px`.
- Pill tổng có border `#dddddd`, radius `999px`, nền trắng.
- Khi chưa focus: shadow nhẹ `0 8px 24px rgba(0,0,0,.10)` nhưng không quá đậm.
- Khi focus vào một segment: nền pill tổng đổi sang xám nhạt `#ebebeb`; segment active thành card trắng bo `32px`, shadow rõ hơn.

Segment desktop đề xuất:

- `Địa điểm`: width khoảng `278px`, padding `15px 32px`.
- `Thời gian`: width khoảng `283px`, padding `15px 24px`.
- `Khách`: width khoảng `278px`, padding `15px 24px`.
- Search button: `48px` height, radius `999px`, dùng brand color.

Text hierarchy:

- Label segment: 12px, weight 600, màu `#222222`.
- Value/placeholder: 14px, weight 400, màu `#6a6a6a`.
- Value đã chọn: màu `#222222`, weight 500.

## 4. Search Bar Nhỏ Khi Scroll

Trigger quan sát được:

- Khoảng `scrollY ~= 40px`: bắt đầu transition giữa search lớn và compact.
- Khoảng `scrollY >= 80px`: compact search ổn định.

Compact layout:

- Nằm giữa header, cao `46-48px`.
- Width khoảng `425-465px` tùy số segment.
- Radius `40px` hoặc `999px`.
- Có shadow nhẹ: `0 0 0 1px rgba(0,0,0,.02), 0 8px 24px rgba(0,0,0,.10)`.
- Gồm 3 nút ngắn: `Địa điểm bất kỳ`, `Thời gian bất kỳ`, `Thêm khách`.
- Có thể thêm label ẩn/a11y: `Bắt đầu tìm kiếm`.

Animation collapse:

```css
.search-large {
  transition:
    opacity 180ms cubic-bezier(0.2, 0, 0, 1),
    transform 220ms cubic-bezier(0.2, 0, 0, 1);
}

.search-large.is-collapsed {
  opacity: 0;
  pointer-events: none;
  transform: translateY(-72px) scale(0.92);
}

.search-compact {
  transition:
    opacity 160ms cubic-bezier(0.2, 0, 0, 1),
    transform 220ms cubic-bezier(0.2, 0, 0, 1),
    box-shadow 180ms ease;
}

.search-compact.is-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.search-compact.is-hidden {
  opacity: 0;
  pointer-events: none;
  transform: translateY(12px) scale(0.96);
}
```

Implementation trigger:

```ts
const COLLAPSE_START = 40;
const COLLAPSE_DONE = 80;

function getSearchMode(scrollY: number, isExpandedByClick: boolean) {
  if (isExpandedByClick) return "large";
  return scrollY >= COLLAPSE_DONE ? "compact" : "large";
}
```

Khi click compact search:

- Chuyển về search lớn ngay trong sticky header.
- Focus segment vừa click.
- Mở panel tương ứng.
- Không cần scroll page về đầu; search lớn có thể overlay trong header.

## 5. Active Segment Behavior

Khi một segment active:

- Segment active nổi trên nền pill bằng background trắng.
- Radius segment `32px`.
- Shadow: `0 3px 12px rgba(0,0,0,.10), 0 1px 2px rgba(0,0,0,.08)`.
- Segment inactive nằm trên nền xám nhạt.
- Divider giữa các segment nên mờ hoặc ẩn khi segment cạnh bên active.
- Hover inactive dùng `#dddddd` hoặc `#f2f2f2`, không đổi layout.

State machine:

- `idle-large`: search lớn ở đầu trang, chưa mở panel.
- `focused-location`: mở location dropdown.
- `focused-date`: mở calendar panel.
- `focused-guests`: mở guest/type counter panel.
- `scrolled-compact`: search nhỏ trong header.
- `compact-expanded`: click compact để mở lại search lớn + panel.

## 6. Dropdown Địa Điểm

Airbnb pattern quan sát được:

- Click `Địa điểm` mở panel ngay dưới search.
- Panel căn theo cạnh trái của search/segment.
- Danh sách gồm heading `Điểm đến được đề xuất`, item `Lân cận`, sau đó các địa điểm đề xuất.
- Mỗi item có title + subtitle, có thể có icon/location thumbnail.

GoStay đề xuất:

- Width desktop: `425px`.
- Max-height: `min(70vh, 620px)`.
- Padding: `24px 32px`.
- Radius: `32px`.
- Shadow: `0 8px 28px rgba(0,0,0,.12)`.
- Background: `#ffffff`.
- Row height: `64-72px`.
- Row hover: `#f7f7f7`, radius `16px`.

Content nên dùng dữ liệu GoStay:

- `Gần tôi`: dùng geolocation nếu user cho phép.
- `Địa danh nổi bật`: Huế, Đà Nẵng, Hội An, Đà Lạt...
- `Tìm kiếm gần đây`: nếu có local history.
- `Khu vực có nhiều dịch vụ`: lấy từ API hoặc dữ liệu seed.

Interaction:

- Typing trong input filter danh sách.
- Arrow up/down chọn item.
- Enter chọn địa điểm và chuyển focus sang `Thời gian`.
- Escape đóng panel.

## 7. Calendar Panel

Airbnb pattern quan sát được:

- Panel lịch rộng khoảng `850px`, bắt đầu ngay dưới search bar.
- Nội dung có tab `Ngày` và `Linh hoạt`.
- Tab selector là pill nền xám, item active nền trắng, border `#dddddd`, radius `999px`.
- Hiển thị 2 tháng song song.
- Có navigation tháng trước/sau.
- Dưới lịch có nhóm radio độ linh hoạt: `Ngày chính xác`, `±1 ngày`, `±2 ngày`, `±3 ngày`, `±7 ngày`, `±14 ngày`.

GoStay đề xuất:

- Desktop panel: width `850px`, padding `34px 32px`, radius `32px`.
- Tablet: width `min(720px, calc(100vw - 32px))`, có thể vẫn 2 tháng nếu đủ rộng.
- Mobile: fullscreen bottom sheet, 1 tháng/lần.
- Month grid: 7 cột, day button `40px`.
- Selected start/end: circle đen hoặc brand dark.
- In-range background: `#f7f7f7`.
- Disabled day: màu `#c1c1c1`, cursor disabled.

Calendar states:

- `idle`: chưa chọn ngày.
- `selecting-checkin`: click ngày đầu.
- `selecting-checkout`: hover preview range, click ngày kết thúc.
- `selected-range`: hiển thị range.
- `flexible`: bật chọn ± ngày.

Panel actions:

- `Xóa`: reset date.
- `Áp dụng`: đóng panel và cập nhật label segment.
- Sau khi chọn checkout có thể tự chuyển focus sang `Khách`.

## 8. Khách / Số Người / Loại Dịch Vụ

Dropdown khách quan sát được:

- Panel căn phải theo segment khách.
- Width khoảng `425px`.
- Padding `16px 32px`.
- Mỗi row gồm label + subtitle bên trái, counter bên phải.
- Counter button tròn `32px`, nền `#f2f2f2`; disabled dùng text/icon `#c1c1c1`.
- Các nhóm: người lớn, trẻ em, em bé, thú cưng.

GoStay áp dụng:

- Nếu search theo lưu trú: dùng `Người lớn`, `Trẻ em`, `Em bé`, `Thú cưng`.
- Nếu search theo trải nghiệm/dịch vụ: thay `Khách` bằng `Số người` hoặc `Người tham gia`.
- Nếu cần `Loại hình`: dùng panel riêng hoặc tab phía trên, không nhét chung vào guest nếu dữ liệu khác nhau.

Loại hình theo Airbnb:

- Tab `Nơi lưu trú`, `Trải nghiệm`, `Dịch vụ` nằm trên search lớn.
- Click tab đổi route/context: `/stays`, `/experiences`, `/services`.
- Search bar vẫn giữ pattern `Địa điểm / Thời gian / Khách`, nhưng dữ liệu card/list phía dưới đổi theo type.

GoStay đề xuất tab:

- `Nơi lưu trú`: hotel, homestay, villa, apartment.
- `Trải nghiệm`: tour, workshop, night life, culture.
- `Dịch vụ`: spa, ăn uống, makeup, thuê xe, catering.

Nếu muốn dropdown loại hình trong search:

- Segment label `Loại hình`, value `Bất kỳ`.
- Panel width `425px`.
- Item dạng card row: icon, title, subtitle.
- Multi-select nếu người dùng muốn tìm nhiều loại dịch vụ cùng lúc.

## 9. Search Submit Behavior

Search button:

- Desktop large: button cao `48px`, radius `999px`.
- Compact: có thể dùng icon search tròn bên phải hoặc ẩn nếu compact chỉ mở rộng.
- Màu brand GoStay nên dùng đồng nhất, ví dụ `#ff385c` nếu muốn giữ vibe Airbnb, hoặc màu brand hiện tại của GoStay nếu đã có.

Submit payload đề xuất:

```ts
type SearchPayload = {
  serviceType: "stay" | "experience" | "service";
  destination?: {
    label: string;
    latitude?: number;
    longitude?: number;
    radiusMeters?: number;
  };
  checkIn?: string;
  checkOut?: string;
  flexibleDays?: 0 | 1 | 2 | 3 | 7 | 14;
  guests?: {
    adults: number;
    children: number;
    infants: number;
    pets: number;
  };
  categories?: string[];
};
```

Điều hướng:

- `stay`: `/search/stays?...`
- `experience`: `/search/experiences?...`
- `service`: `/search/services?...`

## 10. CSS Token Đề Xuất

```css
:root {
  --search-brand: #ff385c;
  --search-brand-dark: #e61e4d;
  --search-ink: #222222;
  --search-muted: #6a6a6a;
  --search-disabled: #c1c1c1;
  --search-line: #dddddd;
  --search-soft: #f7f7f7;
  --search-active-bg: #ffffff;
  --search-shell-bg: #ebebeb;
  --search-radius-pill: 999px;
  --search-radius-panel: 32px;
  --search-radius-segment: 32px;
  --search-shadow-shell: 0 8px 24px rgba(0, 0, 0, 0.1);
  --search-shadow-active:
    0 3px 12px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.08);
  --search-shadow-panel: 0 8px 28px rgba(0, 0, 0, 0.12);
  --search-ease: cubic-bezier(0.2, 0, 0, 1);
}
```

## 11. Component Breakdown

```txt
SearchHeader
SearchTypeTabs
SearchBarLarge
SearchBarCompact
SearchSegment
LocationPopover
CalendarPopover
GuestPopover
ServiceTypePopover
SearchSubmitButton
```

State đặt ở `SearchHeader`:

```ts
type ActivePanel = "location" | "date" | "guests" | "type" | null;

type SearchHeaderState = {
  mode: "large" | "compact";
  activePanel: ActivePanel;
  serviceType: "stay" | "experience" | "service";
  destinationLabel: string;
  dateLabel: string;
  guestLabel: string;
};
```

Keyboard/a11y:

- Mỗi segment là `button` hoặc input có label rõ.
- Panel dùng `role="dialog"` hoặc combobox/listbox phù hợp.
- Calendar day dùng button với aria-label đầy đủ.
- Escape đóng panel.
- Tab không trap nếu không phải modal fullscreen.

## 12. Responsive

Desktop >= 1024px:

- Header 96px.
- Search lớn 850px.
- Location/guest panel 425px.
- Calendar panel 850px, 2 tháng.

Tablet 768-1023px:

- Header padding `24px`.
- Search lớn width `calc(100vw - 48px)`.
- Segment co theo grid.
- Calendar width `calc(100vw - 48px)`.

Mobile < 768px:

- Không dùng search lớn desktop.
- Header chỉ có logo + compact search hoặc search card.
- Click search mở bottom sheet fullscreen.
- Location/date/guest là các step trong cùng sheet.
- Calendar 1 tháng, footer sticky `Xóa / Áp dụng`.

## 13. Animation Chi Tiết

Open panel:

- Duration: `160-220ms`.
- From: `opacity: 0`, `transform: translateY(-6px) scale(.98)`.
- To: `opacity: 1`, `transform: translateY(0) scale(1)`.
- Easing: `cubic-bezier(.2, 0, 0, 1)`.

Close panel:

- Duration: `120-160ms`.
- Fade out nhanh hơn open.

Large to compact:

- Large translate lên `-72px`, opacity về `0`.
- Compact translate từ `12px` lên `0`, opacity từ `0` lên `1`.
- Header vẫn giữ height ổn định để tránh layout jump.

Compact to large:

- Khi click compact, set `isExpandedByClick = true`.
- Large search xuất hiện trong sticky header, không cần scroll top.
- Focus đúng panel vừa click.
- Khi user scroll tiếp hoặc click ngoài, nếu `scrollY >= 80`, quay lại compact.

## 14. Checklist Triển Khai Cho GoStay

- Search lớn có tab loại hình phía trên.
- Search nhỏ xuất hiện ổn định khi scroll xuống.
- Click compact mở lại search lớn + đúng dropdown.
- Location dropdown có danh sách đề xuất, hover, keyboard navigation.
- Calendar có 2 tháng desktop, 1 tháng mobile, chọn range rõ ràng.
- Guest/type panel có counter hoặc category list, không dùng alert/confirm.
- Animation không làm header nhảy layout.
- Mobile dùng bottom sheet, không ép desktop panel vào màn nhỏ.
- Màu sắc đồng nhất với GoStay, chỉ dùng brand color cho CTA/search active.
