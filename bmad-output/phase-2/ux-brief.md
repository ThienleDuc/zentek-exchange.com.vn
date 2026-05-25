# UX/UI Brief – ZenTek Exchange

**Trạng thái**: Draft
**Ngày tạo**: 2026-05-24
**Tạo bởi**: Product Manager Agent
**Dựa trên**: Cấu trúc Database Schema mới (Tiếng Việt, hỗ trợ Phân Loại, Media Đánh Giá)

---

## 1. Tổng quan UX

### 1.1 Vision Statement
ZenTek Exchange cần mang lại cảm giác **tin cậy, chuyên nghiệp, và thân thiện** — như một sàn TMĐT "thật" nhưng đơn giản hơn Shopee, uy tín hơn Chợ Tốt, và có tính cộng đồng gắn kết mạnh mẽ qua các `CuocTroChuyen` đa dạng.

### 1.2 Design Principles
| # | Nguyên tắc | Ý nghĩa |
|---|-----------|---------|
| 1 | **Trust First** | Các badge trạng thái phải rõ ràng: `Đã duyệt` (Màu xanh), `Chờ phê duyệt` (Màu vàng), `Đã từ chối` (Màu đỏ). Lịch sử đơn hàng rành mạch. |
| 2 | **Simplicity** | Giảm thiểu bước thao tác, form ngắn gọn, navigation rõ ràng. |
| 3 | **Vietnamese First** | 100% tiếng Việt, format tiền VND, format ngày Việt Nam (DD/MM/YYYY). |
| 4 | **Community Feel** | Hộp chat cộng đồng phải dễ mở/ẩn, tạo cảm giác real-time. |
| 5 | **Progressive Disclosure** | Hiển thị thông tin cần thiết trước, ví dụ: bắt buộc chọn `Phân loại` (Màu/Size) trước khi `Thêm vào giỏ hàng`. |

---

## 2. Information Architecture (IA)

### 2.1 Sitemap
```
ZenTek Exchange
├── 🏠 Trang chủ (Sản phẩm `Đã duyệt`)
├── 📂 Danh mục / Tìm kiếm (Filter danh mục, mức giá)
├── 📦 Chi tiết sản phẩm
│   └── Gallery `AnhSanPham`, Chọn `PhanLoai`, Đánh giá có kèm `PhanHoiMedia`, Nút "Chat ngay"
├── 🏪 Trang Cửa Hàng
│   └── Info Cửa Hàng + danh sách sản phẩm của Shop
├── 🛒 Giỏ Hàng (`GioHang`) & Checkout (`DonHang`)
├── 👤 Tài khoản Người Dùng
│   └── Thông tin cá nhân, Đơn hàng của tôi (`Chờ xử lý`, `Đang giao`, `Đã nhận`, `Đã hủy`)
├── 🏪 Dashboard Người Bán (Seller)
│   └── Quản lý sản phẩm (CRUD), Đơn hàng của Cửa Hàng
├── 💬 Giao Diện Chat (`CuocTroChuyen`)
│   ├── Chat cộng đồng (phòng "General")
│   └── Danh sách & Cửa sổ chat 1-1 (`nhom` hoặc `ca_nhan`)
└── 🔧 Admin Dashboard
    └── Quản lý Users, Duyệt/Từ chối Sản Phẩm (`TrangThaiDuyet`)
```

---

## 3. Page Layouts & Wireframes

### 3.1 Trang Chi tiết Sản Phẩm (Tích hợp Phân Loại)
```
┌──────────────────────────────────────────────────────────────┐
│ [Logo]   [────── Thanh tìm kiếm ──────]   🛒 💬 🔔  [User ▼] │
├──────────────────────────────────────────────────────────────┤
│  ┌────────────────────┐  [Badge: Đã duyệt]                  │
│  │                    │  TÊN SẢN PHẨM                       │
│  │     ẢNH CHÍNH      │  Giá: 5.000.000 VNĐ                 │
│  │  (AnhSanPham)      │  Tình trạng: Mới | Đã bán: 10       │
│  └────────────────────┘  ────────────────────────────────── │
│   [Ảnh 1] [Ảnh 2]        Phân loại (PhanLoai):              │
│                          [ Xanh ]  [ Đen ]  [ Đỏ ]          │
│                          ────────────────────────────────── │
│  ┌────────────────┐      [ - ] 1 [ + ]                      │
│  │ [Avt] Cửa Hàng │      [ THÊM VÀO GIỎ ]  [ MUA NGAY ]     │
│  │ [💬 Chat ngay] │                                         │
│  └────────────────┘                                         │
├──────────────────────────────────────────────────────────────┤
│  ĐÁNH GIÁ SẢN PHẨM (DanhGiaSanPham + PhanHoiMedia)           │
│  ⭐⭐⭐⭐⭐ - "Hàng đẹp" [Đính kèm 1 ảnh] - User A          │
│    ↳ Cửa hàng trả lời: "Cảm ơn bạn!"                        │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 Trang Chat (Cộng đồng & 1-1)
```
┌──────────────────────────────────────────────────────────────┐
│                        HEADER                                │
├───────────────┬──────────────────────────────────────────────┤
│ DANH SÁCH     │              KHUNG CHAT                      │
│               │                                              │
│ ── Cộng đồng │  ┌────────────────────────────────────────┐  │
│ 💬 Phòng Chung│  │  [avatar] UserA  14:30                │  │
│               │  │  "Có ai biết laptop nào tốt dưới 10tr?"│  │
│ ── Chat 1-1   │  │                                        │  │
│ [av] Shop_HCM │  │              [avatar] UserB  14:31    │  │
│ "Bạn ơi..."  │  │     "Dell XPS cũ khá ổn nha bạn"     │  │
│               │  │                                        │  │
│ [av] UserC    │  │  [avatar] UserC  14:32                │  │
│ "OK anh"     │  │  "Thinkpad T480 cũng tốt"            │  │
│               │  └────────────────────────────────────────┘  │
│               │  ┌────────────────────────────┐ [📎] [Gửi] │
│               │  │ Nhập tin nhắn (TinNhan)...  │            │
│               │  └────────────────────────────┘            │
├───────────────┴──────────────────────────────────────────────┤
│                        FOOTER                                │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. Visual Design Guidelines

### 4.1 Color Palette
| Token | Hex | Sử dụng |
|-------|-----|---------|
| **Primary** | `#2563EB` (Blue 600) | Buttons chính, links, phân loại đang chọn (active) |
| **Secondary** | `#059669` (Emerald 600) | Trạng thái `Đã duyệt`, `Đã nhận`, Giá bán |
| **Warning** | `#D97706` (Amber 600) | Trạng thái `Chờ phê duyệt`, `Chờ xử lý`, `Đang giao` |
| **Danger** | `#DC2626` (Red 600) | Trạng thái `Đã từ chối`, `Đã hủy`, Nút Xóa |
| **Surface** | `#FFFFFF` | Card background |
| **Background** | `#F9FAFB` (Gray 50) | Page background |

### 4.2 Component Styles
- **Badge Trạng Thái**: Hình chữ nhật bo tròn nhẹ (border-radius 4px), màu nền nhạt tương ứng với trạng thái (ví dụ: Chờ phê duyệt -> nền Vàng nhạt, chữ Vàng đậm).
- **Phân Loại (PhanLoai) Selector**: Nút bấm nhỏ (Pills). Khi active, viền và chữ chuyển màu Primary. Bắt buộc user phải click chọn trước khi nhấn Thêm vào giỏ.
- **Rating**: Sử dụng icon ngôi sao vàng (`#FBBF24`). Cho phép đính kèm ảnh thumbnail mờ từ `PhanHoiMedia`.

---

## 5. Interaction Patterns & States

| Trường hợp | Pattern |
|-----------|---------|
| **Chọn Phân Loại** | Nút `Thêm vào giỏ` bị disabled hoặc hiện cảnh báo "Vui lòng chọn phân loại" nếu user chưa chọn. |
| **Empty State** | Icon minh họa + text "Chưa có đơn hàng nào" / "Chưa có đánh giá". |
| **Notifications**| Toast notification góc trên bên phải khi thêm giỏ hàng thành công hoặc báo lỗi kết nối Chat. |
| **Chat Bubble** | Tin nhắn của mình: Nền Primary, chữ trắng, căn phải. Tin nhắn đối phương: Nền xám nhạt, chữ đen, căn trái. |
