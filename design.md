# Website Design Specification: Airbnb Vietnam

This document provides a highly detailed reverse-engineered design specification of the Airbnb Vietnam landing page (https://www.airbnb.com.vn/). It contains all the visual, layout, spacing, typographic, and component specifications needed to recreate the page with pixel-level similarity.

---

## 1. Design System Overview

### Overall Design Style
Airbnb uses a **clean, content-first, high-trust, and minimalist design style**. It is characterized by heavy use of whitespace, high-contrast typography, soft container borders, and high-fidelity visuals (large images with rich colors). Elements are laid out in a clean grid structure with flat, subtle shadows to convey depth.

### Visual Personality
*   **Welcoming & Human**: Large imagery of real-world destinations, warm micro-interactions, and clear copywriting.
*   **Polished & Premium**: Subtle transitions, precise border-radii, custom typography (`Airbnb Cereal App` or equivalent premium sans-serif), and responsive grid scaling.
*   **Intuitive & Discoverable**: Immediate visibility of search filters, category selectors, and listing details without visual clutter.

### Brand Feeling
*   Modern, reliable, and premium. The branding is anchored by a signature brand color (`#FF385C`), offset by clean white backgrounds and deep charcoal text (`#222222`), giving a balanced, sophisticated feeling.

### UX Patterns Used
*   **Sticky Dynamic Header**: The navigation header remains sticky, transitioning from an expanded search form to a compact pill search bar upon scroll.
*   **Horizontal Category Slider**: A scrollable category navigation bar with icons and text indicators to filter listings.
*   **Listing Card Carousels**: Each listing card has its own image carousel supporting swiping (touch) and button navigation (hover-controlled chevrons).
*   **Floating Wishlist Action**: Floating absolute heart icon on the top-right of each card.
*   **Sticky Bottom Navigation (Mobile)**: A dedicated bottom bar with quick action buttons for navigation.

---

## 2. Layout Architecture

### Page Width & Containers
*   **Maximum Page Width**: Max-width is set to `1760px` for extra-large screens.
*   **Default Desktop Width**: Outer padding is fluid with a maximum container width of `1600px` (or `1280px` for standard desktops).
*   **Container Padding**:
    *   **Desktop (>= 1440px)**: Left/Right padding: `80px` (`5rem`).
    *   **Desktop/Tablet (950px to 1439px)**: Left/Right padding: `40px` (`2.5rem`).
    *   **Tablet/Mobile (< 950px)**: Left/Right padding: `24px` (`1.5rem`).

### Grid System
The main listing cards are laid out in a CSS Grid container:
*   **Desktop (>= 1640px)**: `6 columns` or `7 columns` depending on viewport size.
*   **Desktop (1128px to 1639px)**: `4 columns`.
*   **Desktop/Tablet (950px to 1127px)**: `3 columns`.
*   **Tablet (550px to 949px)**: `2 columns`.
*   **Mobile (< 550px)**: `1 column` (full width list) or `1.5 columns` carousel depending on section type.

### Grid Spacing & Vertical Rhythm
*   **Grid Column Gap**: `24px` (`1.5rem`).
*   **Grid Row Gap**: `40px` (`2.5rem`) - provides breathing room between card rows.
*   **Section Spacing**: Vertically separated by `48px` to `64px` using margin/padding.
*   **Vertical Rhythm**: Main layout groups elements into structured chunks:
    1.  Header + Search/Categories (Sticky top, height: `80px` - `170px`)
    2.  Category Filters Slider (Sticky below header, height: `78px`)
    3.  Listing Grid Content (Flex grow / Grid)
    4.  Footer Area (Fixed at bottom or static scrollable, height: `350px`)

---

## 3. Color System

### Primary & Accent Colors
| Color Name | Hex | Usage |
| :--- | :--- | :--- |
| **Primary Brand** | `#FF385C` | Brand logo, search buttons, active wishlist heart, active tab underlines, primary CTAs. |
| **Secondary Accent** | `#E61E4F` | Hover state of primary brand elements (slightly darker, richer pink/red). |
| **Success/Verification** | `#22C55E` | Verification badges or green highlight success text. |

### Neutral Colors
| Color Name | Hex | Usage |
| :--- | :--- | :--- |
| **Dark Neutral (Primary Text)** | `#222222` | Titles, listing headers, card names, prices, navigation text. |
| **Medium Neutral (Secondary Text)** | `#717171` | Subtitles, location distance, ratings, inactive links, footer text. |
| **Light Neutral (Disabled/Muted)** | `#B0B0B0` | Placeholders, inactive arrow borders, disabled text states. |

### Background Colors
| Color Name | Hex | Usage |
| :--- | :--- | :--- |
| **Primary Background** | `#FFFFFF` | Main page background, card body, header background, modal popups. |
| **Secondary Background** | `#F7F7F7` | Compact search bar background, footer background, hover overlays, slider controls. |

### Border Colors
| Color Name | Hex | Usage |
| :--- | :--- | :--- |
| **Thin Border** | `#DDDDDD` | Header border, collapsed search bar border, category separator line. |
| **Soft Border** | `#EAEAEA` | Inner grid dividers, card bottom lines, subtle card shadows. |

---

## 4. Typography System

### Font Stack
```css
font-family: Circular, -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif;
```
*(On Airbnb Vietnam, the premium `Airbnb Cereal App` font is served, falling back to system sans-serif like `-apple-system`, `BlinkMacSystemFont`, and `Roboto` for cross-platform stability).*

### Typography Scale & Hierarchy
| Element | Font Size | Line Height | Font Weight | Letter Spacing | Color |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Page Main Title** | `32px` | `36px` | `80px` (Bold) | `normal` | `#222222` |
| **Section Headings** | `22px` | `26px` | `700` (Bold) | `-0.2px` | `#222222` |
| **Card Title (Primary)** | `15px` | `19px` | `600` (Semi-bold) | `normal` | `#222222` |
| **Card Description (Muted)** | `15px` | `19px` | `400` (Regular) | `normal` | `#717171` |
| **Card Price** | `15px` | `19px` | `600` (Semi-bold) | `normal` | `#222222` |
| **Rating Label** | `14px` | `18px` | `400` (Regular) | `normal` | `#222222` |
| **Navigation Link** | `14px` | `18px` | `600` (Semi-bold) | `normal` | `#222222` |
| **Footer Heading** | `14px` | `18px` | `600` (Semi-bold) | `normal` | `#222222` |
| **Footer Link** | `14px` | `18px` | `400` (Regular) | `normal` | `#717171` |
| **Mobile Tab Label** | `10px` | `12px` | `600` (Semi-bold) | `normal` | Inactive: `#717171`, Active: `#FF385C` |

---

## 5. Spacing System

Airbnb uses an **even-number spacing scale** based primarily on factors of `8px` (`0.5rem`).

### Spacing Scale Tokens
*   **`space-1`**: `4px` (`0.25rem`) - internal micro margins (between rating star and number).
*   **`space-2`**: `8px` (`0.5rem`) - card text spacing, close buttons, wishlist offsets.
*   **`space-3`**: `12px` (`0.75rem`) - inner card padding, listing details margin-top.
*   **`space-4`**: `16px` (`1.0rem`) - button padding, mobile grid margins, general component spacing.
*   **`space-6`**: `24px` (`1.5rem`) - standard grid gap, desktop header margins.
*   **`space-8`**: `32px` (`2.0rem`) - inner section margins, footer column gap.
*   **`space-10`**: `40px` (`2.5rem`) - card row vertical spacing, section separation.
*   **`space-12`**: `48px` (`3.0rem`) - main category margins.
*   **`space-16`**: `64px` (`4.0rem`) - large page layout top/bottom paddings.

---

## 6. Component Library

### Navbar (Navigation & Header)
*   **Height**: `80px` (`5rem`) when compact, `170px` (`10.6rem`) when search bar is expanded.
*   **Sticky Position**: Fixed to top (`position: sticky; top: 0; z-index: 100;`).
*   **Background**: Solid `#FFFFFF` with a thin bottom border `#DDDDDD` (`1px`).
*   **Left Section (Logo)**:
    *   Airbnb Logo in Brand Color (`#FF385C`).
    *   Width: `102px`, height: `32px`.
    *   Clicking navigates to home page.
*   **Center Section (Expanded Search tabs)**:
    *   Tabs: "Nơi lưu trú" (Stays), "Trải nghiệm" (Experiences), "Trải nghiệm trực tuyến" (Online Experiences).
    *   Font size: `16px`, weight: `400` (Regular). Active tab has bold weight `600` and a small brand line underneath.
*   **Right Section (User Controls)**:
    *   "Cho thuê nhà trên Airbnb" (Airbnb your home) text button (hover: background `#F7F7F7`, rounded pill).
    *   Globe Icon (language selector popup button).
    *   User Menu Button: Oval white container with grey border (`border: 1px solid #DDDDDD`), rounded pill (`border-radius: 21px`). Displays menu icon (hamburger) on left, grey user avatar icon on right. Hover displays subtle box-shadow.

---

### Hero / Search Form (Expanded State)
*   **Structure**: Pill-shaped container centering below navigation tabs, size `850px` width, `66px` height.
*   **Shadow**: Box shadow of `0px 16px 32px rgba(0, 0, 0, 0.08)`.
*   **Border**: `1px solid #DDDDDD`.
*   **Dividers**: Thin vertical gray lines (`1px solid #EAEAEA`) separating input fields.
*   **Form Segments**:
    1.  **Địa điểm (Where)**: Label text (12px bold), subtext/input field "Tìm kiếm điểm đến" (14px regular). Active shows outline, dark background, and region suggest dropdown.
    2.  **Nhận phòng (Check in)** / **Trả phòng (Check out)**: Labels (12px bold), value "Thêm ngày" (14px regular). Click opens Calendar Modal.
    3.  **Khách (Who)**: Label (12px bold), value "Thêm khách" (14px regular). Click opens Guest Selector Modal.
*   **Search Button (CTA)**:
    *   Positioned on the right side of the pill.
    *   Expanded state: Round brand color `#FF385C` background, white text "Tìm kiếm" and search icon.
    *   Collapsed state: Circular search icon with brand background.
    *   Hover state: Background turns to `#E61E4F`.

---

### Category Filter Bar
*   **Height**: `78px` (`4.8rem`).
*   **Sticky Position**: Stays sticky below the navbar (`position: sticky; top: 80px; z-index: 90;`).
*   **Items Layout**: Horizontal flexbox list (`overflow-x: auto`) with hidden scrollbars.
*   **Category Item**:
    *   Icon: SVG (approx `24px x 24px`), colored `#717171` (medium gray).
    *   Label: `12px` font size, weight: `600` (semi-bold).
    *   Inactive state: Opacity `0.6`, no border. Hover transitions opacity to `1.0`.
    *   Active state: Opacity `1.0`, bottom border (`2px solid #222222`) positioned `10px` below the text.
*   **Navigation Chevrons**: Floating circular left/right buttons (`32px x 32px`, white background, thin border `#DDDDDD`, box-shadow) appearing on the edges when list overflows, allowing horizontal scroll on click.

---

### Listing Cards (Accommodation Card)
*   **Card Container**: Vertical flexbox layout. Height varies based on image aspect ratio, but typically fits `350px - 400px` height.
*   **Image Carousel Area**:
    *   Dimensions: Width `100%`, Aspect Ratio `20:19` (or `1:1`).
    *   Border Radius: `12px` (`0.75rem`), overflow hidden.
    *   Wishlist Button: Positioned absolute in top-right. Transparent fill with a `1.5px` white border SVG heart. On hover/active, transitions to solid `#FF385C` color.
    *   Navigation Chevrons: Left/right circular white buttons (`28px x 28px`, opacity `0.9` hover) appear on the left/right edges of the card image *only on hover* over the card.
    *   Indicator Dots: Row of bottom-centered small white dots (active dot is larger and fully opaque, inactive dots are smaller with lower opacity) representing slides.
*   **Listing Metadata**:
    *   Spacing: Gap of `12px` between image and text block.
    *   **Line 1**: Title (e.g., "Hồ Chí Minh, Việt Nam" - font-size `15px` bold) and Rating (right-aligned star SVG + numeric rating e.g., "4,87").
    *   **Line 2**: Distance/Host (e.g., "Cách 8 km • Chủ nhà siêu cấp" - font-size `14px` regular `#717171`).
    *   **Line 3**: Date Range (e.g., "Ngày 05 - Ngày 10 thg 6" - font-size `14px` regular `#717171`).
    *   **Line 4 (Price)**: Font-size `15px` bold `#222222` (e.g., "1.250.000 ₫ ") + span regular `#222222` ("đêm").

---

### Buttons
*   **Primary Action (Brand Button)**:
    *   Background: `#FF385C` or linear gradient `#BD1E59` to `#FF385C`.
    *   Text: White `#FFFFFF`, font-weight `600`.
    *   Border-radius: `8px` (`0.5rem`).
    *   Animation: Hover scale scale `0.98` transition, background-color shifts to `#E61E4F`.
*   **Secondary Action (Pill Buttons)**:
    *   Background: White `#FFFFFF`, border `1px solid #222222`.
    *   Hover: Background `#F7F7F7`.
    *   Border-radius: `24px` (`1.5rem`).
    *   Padding: `10px 16px`.
*   **Icon-Only Round Buttons (Slider Navigation/Map)**:
    *   Background: White `#FFFFFF`, border `1px solid #DDDDDD`, border-radius `50%`.
    *   Shadow: `0 2px 4px rgba(0,0,0,0.1)`.
    *   Size: `32px` or `48px` diameter.

---

### Footer
*   **Layout**: Static layout, vertical stacking. Background color: `#F7F7F7` (off-white).
*   **Border Top**: `1px solid #DDDDDD`.
*   **Desktop Section Layout**: 3 columns representing footer groupings.
    *   Columns: "Hỗ trợ" (Support), "Đón tiếp khách" (Hosting), "Airbnb".
    *   Heading: `14px` bold `#222222`.
    *   Links: Stacked vertically with a margin-bottom of `16px`. Font size `14px`, color `#717171`. Hover: text decoration underline, color `#222222`.
*   **Bottom Utility Row**:
    *   Split into Left and Right sections by a top divider line `#DDDDDD` (`1px`).
    *   **Left (Copyright)**: "© 2026 Airbnb, Inc." followed by dots and legal links (Quyền riêng tư, Điều khoản, Sơ đồ trang web) styled in `#717171` (14px).
    *   **Right (Selectors & Socials)**:
        *   Globe Icon + "Tiếng Việt (VN)" button (weight `600`, color `#222222`).
        *   Currency Symbol + "₫ VND" button.
        *   Social Icon SVGs (Facebook, Twitter, Instagram) inline spaced by `16px`.

---

## 7. CSS Specification

### CSS Variables (Design Tokens)
```css
:root {
  /* Brand colors */
  --color-brand: #ff385c;
  --color-brand-hover: #e61e4f;
  --color-brand-gradient: linear-gradient(to right, #e61e4f 0%, #e31c5f 50%, #d70466 100%);

  /* Neutral palette */
  --color-text-primary: #222222;
  --color-text-secondary: #717171;
  --color-text-muted: #b0b0b0;
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f7f7f7;
  
  /* Borders and Dividers */
  --color-border-thin: #dddddd;
  --color-border-light: #eaeaea;
  
  /* Typography */
  --font-family-primary: Circular, -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif;
  
  /* Spacing Scale */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 24px;
  --space-2xl: 32px;
  --space-3xl: 40px;
  --space-4xl: 48px;
  --space-layout: 80px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05);
  --shadow-lg: 0 16px 32px rgba(0, 0, 0, 0.08);
  --shadow-xl: 0 24px 48px rgba(0, 0, 0, 0.12);

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 24px;
  --radius-full: 9999px;
  
  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.25s ease-in-out;
}
```

---

## 8. Responsive Behavior

Airbnb adapts dynamically across three primary viewport ranges.

### Responsive Breakpoints Chart
| Device Class | Viewport Range | Grid Columns | Navigation Layout | Card Layout |
| :--- | :--- | :--- | :--- | :--- |
| **Desktop** | `>= 1128px` | `4` to `6` columns | Full expanded/collapsible search bar. Sticky navigation. | Grid layout. Hover chevrons on cards. Wishlist top-right. |
| **Tablet** | `768px` - `1127px` | `3` columns | Collapsed search pill: "Địa điểm bất kỳ..." centered. Hamburger menu active. | Grid layout. Hover chevrons hidden. Wishlist active. |
| **Mobile** | `< 768px` (Standard `375px`) | `1` column or custom carousels | Full-width mobile search input "Bạn muốn đi đâu?". Sticky bottom navigation bar active. | Stacked list or horizontal carousels (1.5 cards visible for swiping). Wishlist active. Footer stacks vertically. |

### Layout Modifications at Breakpoints
*   **Header Compact Transition**: Below `1128px`, the navbar automatically hides the double-layer navigation tabs and centers the search bar into a compact pill shape (`box-shadow` active on default state).
*   **Sticky Mobile Bottom Bar**: At `< 768px`, a bottom sticky menu (`position: fixed; bottom: 0; left: 0; right: 0; height: 64px; background: #ffffff; border-top: 1px solid #dddddd;`) appears with icon selectors:
    *   **Khám phá** (Explore icon - active brand red)
    *   **Yêu thích** (Wishlist heart icon)
    *   **Đăng nhập** (User login icon)
*   **Footer Stacking**: In Mobile view, columns of footer links stack on top of each other. Column headers function as toggleable accordions or are expanded default, but padding is compact.

---

## 9. Interaction Design

### Hover Effects & Animations
*   **Card Hover State**:
    *   On mouse-enter, the left/right chevron navigation buttons on the image fade in (transition: `opacity 0.2s ease`).
    *   Active card hover causes no image zoom, but slightly increases image contrast or sharpness.
*   **Wishlist Heart Click**:
    *   Clicking triggers a bounce animation (`transform: scale(1.2)` returning back to `1.0` within `150ms`).
    *   Fills icon path with brand color `#FF385C` and adds a slight red radial particle burst (optional micro-animation).
*   **Pill Search Bar Hover**:
    *   Hovering over the compact search pill adds a minor translateY offset (`-1px`) and expands the shadow from `--shadow-sm` to `--shadow-md`.
*   **Buttons (Brand/Accent)**:
    *   Hovering over primary `#FF385C` causes background color to shift smoothly to `#E61E4F` (transition: `background-color 0.15s ease`).

### Transitions
*   **Expanded -> Collapsed Search Bar**: When scrolling down by more than `50px`, the expanded search bar scales down smoothly (using `transform: scale(0.8) translateY(-30px)` and fades opacity to `0`) while the compact pill slides in, keeping the transitions smooth at `250ms` duration.
*   **Image Slider**: Slider transitions to left/right image offsets using `transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)`.

---

## 10. Visual Assets

### Icons
*   All icons (Hamburger menu, search glass, rating star, globe language selector, chevron arrows, categories icons, wishlist heart) are vector **SVGs**.
*   Stroke width: Typically `1.5px` or `2px`.
*   Color: `#222222` (primary) or `#717171` (secondary).

### Brand Logo
*   Airbnb Bélo SVG mark + "airbnb" wordmark.
*   Color: `#FF385C` or `#FFFFFF` (when overlaying dark covers, though homepage uses brand color).

---

## 11. Accessibility Notes

*   **Contrast Ratios**: Body text `#222222` on `#FFFFFF` background maintains a contrast ratio of `15.9:1`, far exceeding WCAG AAA standard. Secondary text `#717171` on `#FFFFFF` background maintains `4.5:1`, meeting WCAG AA standards.
*   **Keyboard Navigation**: Interactive components (buttons, links, search fields) have custom `:focus-visible` rings with high-contrast outlines (usually a thick black ring `#222222` or brand outline).
*   **Semantic HTML**: Ensure header use `<header>`, main listing grid is `<main>`, category bar is `<nav aria-label="Danh mục">`, listing cards use `<article>`, and footer is `<footer>`.
*   **Aria Labels**: Image carousels use `aria-label="Hình ảnh 1 trên 5"` and chevron buttons use `aria-label="Hình ảnh tiếp theo"`.

---

## 12. Frontend Recreation Guide

### Recommended DOM / HTML Structure
```html
<div class="app-layout min-h-screen flex flex-col bg-white">
  
  <!-- Header / Navbar -->
  <header class="sticky top-0 z-50 bg-white border-b border-gray-200">
    <div class="max-w-[1760px] mx-auto px-6 lg:px-20 h-20 flex items-center justify-between">
      <!-- Logo -->
      <div class="logo-container">...</div>
      
      <!-- Collapsed Search (default hidden on scroll-up / desktop) -->
      <div class="compact-search-bar flex items-center shadow-sm hover:shadow-md border border-gray-200 rounded-full py-2 px-4 cursor-pointer transition">...</div>
      
      <!-- Right Controls -->
      <div class="user-menu flex items-center gap-4">...</div>
    </div>
  </header>

  <!-- Categories Sub-header -->
  <nav class="sticky top-20 z-40 bg-white border-b border-gray-100 shadow-sm">
    <div class="max-w-[1760px] mx-auto px-6 lg:px-20 py-4 flex items-center justify-between">
      <!-- Categories Slider -->
      <div class="categories-list flex items-center overflow-x-auto scrollbar-none gap-8">...</div>
    </div>
  </nav>

  <!-- Listing Grid Content -->
  <main class="flex-grow max-w-[1760px] mx-auto px-6 lg:px-20 py-8">
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-6 gap-y-10">
      
      <!-- Listing Card Article -->
      <article class="listing-card group flex flex-col cursor-pointer">
        <!-- Image Container -->
        <div class="relative aspect-[20/19] rounded-xl overflow-hidden bg-gray-100">
          <img src="..." class="object-cover w-full h-full" alt="Listing Image" />
          <button class="absolute top-3 right-3 text-white hover:scale-110 transition">...</button>
        </div>
        <!-- Card Text -->
        <div class="mt-3 flex flex-col">
          <div class="flex justify-between items-start">
            <h3 class="text-[15px] font-semibold text-gray-900">Ho Chi Minh, Vietnam</h3>
            <span class="text-sm text-gray-900 flex items-center gap-1">★ 4.95</span>
          </div>
          <p class="text-sm text-gray-500 mt-1">Cách 10 km • Chủ siêu cấp</p>
          <p class="text-sm text-gray-500 mt-0.5">Ngày 12 - 17 tháng 6</p>
          <p class="text-[15px] font-semibold text-gray-900 mt-1.5">1.250.000 ₫ <span class="font-normal text-gray-700">/ đêm</span></p>
        </div>
      </article>

    </div>
  </main>

  <!-- Footer -->
  <footer class="bg-gray-50 border-t border-gray-200">
    <!-- Links Column Grid -->
    <div class="max-w-[1760px] mx-auto px-6 lg:px-20 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">...</div>
    <!-- Utility Row -->
    <div class="max-w-[1760px] mx-auto px-6 lg:px-20 py-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">...</div>
  </footer>

</div>
```

---

## 13. DOM Structure Map

```
Page (div.app-layout)
├── Header (header.navbar)
│   ├── Logo Container (div.logo)
│   ├── Search Container (div.search-container)
│   │   ├── Extended Search (div.search-expanded) -> Tabs: [Stay, Experiences, Online]
│   │   │   └── Search Form Pill -> Inputs: [Location, Dates, Guests]
│   │   └── Collapsed Search (div.search-collapsed) -> Button: [Anywhere | Anytime | Add guests]
│   └── User Actions Group (div.user-menu)
│       ├── Host CTA Button (button.host-cta)
│       ├── Language Toggle (button.language-picker)
│       └── Profile Menu Dropdown Button (button.profile-menu)
├── Sub-Navigation (nav.categories-slider)
│   ├── Horizontal Scroll Wrapper (div.categories-scroll)
│   │   ├── Category Item 1 (button.category-item) -> [Icon, Label]
│   │   ├── Category Item 2 (button.category-item) -> [Icon, Label]
│   │   └── ...
│   ├── Left Scroll Arrow (button.chevron-left)
│   └── Right Scroll Arrow (button.chevron-right)
├── Main Content Grid (main.listing-grid)
│   ├── Listing Card 1 (article.listing-card)
│   │   ├── Image Carousel Container (div.image-carousel)
│   │   │   ├── Image Element (img)
│   │   │   ├── Wishlist Floating Button (button.wishlist-heart)
│   │   │   ├── Left Slide Trigger (button.slide-prev)
│   │   │   ├── Right Slide Trigger (button.slide-next)
│   │   │   └── Carousel Indicator Dots (div.slide-dots)
│   │   └── Card Details Text Block (div.card-details)
│   │       ├── Heading Row (div.title-row) -> [Title, Rating]
│   │       ├── Sub-info 1 (p.distance)
│   │       ├── Sub-info 2 (p.dates)
│   │       └── Pricing Row (p.price)
│   ├── Listing Card 2 (article.listing-card)
│   └── ...
├── Bottom Mobile Navigation (nav.mobile-tabbar) -> [Hidden on Desktop]
│   ├── Tab: Explore (a)
│   ├── Tab: Wishlist (a)
│   └── Tab: Log In (a)
└── Footer (footer.site-footer)
    ├── Links Section Grid (div.footer-links-columns)
    │   ├── Column: Support (div) -> Title + Links Stack
    │   ├── Column: Hosting (div) -> Title + Links Stack
    │   └── Column: Airbnb (div) -> Title + Links Stack
    └── Copyright Utility Row (div.footer-utility-row)
        ├── Copyright & Legal Links (div.legal-links)
        └── Language/Currency/Socials Block (div.utility-group)
            ├── Language Selector (button)
            ├── Currency Selector (button)
            └── Social Accounts Icons (div.socials)
```

---

## 14. AI Reconstruction Blueprint

```yaml
design_tokens:
  brand:
    primary: "#FF385C"
    hover: "#E61E4F"
  background:
    base: "#FFFFFF"
    accent: "#F7F7F7"
  text:
    primary: "#222222"
    secondary: "#717171"
  borders:
    thin: "#DDDDDD"
    light: "#EAEAEA"
  typography:
    family: "Circular, -apple-system, sans-serif"
    sizes:
      heading: "22px"
      body_bold: "15px"
      body_regular: "14px"
      mobile_caption: "10px"
  spacing:
    grid_gap_x: "24px"
    grid_gap_y: "40px"
    container_padding_desktop: "80px"
    container_padding_mobile: "24px"
  radii:
    card_image: "12px"
    pill: "24px"

layout_rules:
  desktop_grid: "repeat(auto-fill, minmax(280px, 1fr))"
  tablet_grid: "repeat(3, 1fr)"
  mobile_grid: "repeat(1, 1fr)"
  sticky_header_height: "80px"
  sticky_categories_height: "78px"

component_blueprint:
  card:
    structure: "Vertical card layout, absolute top-right heart icon, aspect ratio 20:19, padding text gap 12px"
    interaction: "Show slide chevrons on image overlay hover. Bounce click animation on heart icon."
  search_bar:
    collapsed: "Pill shape, 3 border sections, search glass icon on background #FF385C, hover scales shadow"
    expanded: "Full row overlay, input autocomplete drop down maps, checkout date picker inline modal"
  footer:
    desktop: "3 vertical columns link blocks, bottom left legal row, bottom right globe language switcher + socials inline"
```
