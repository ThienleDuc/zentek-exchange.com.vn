# Feature Brainstorm – ZenTek Exchange

**Trạng thái**: Draft
**Ngày tạo**: 2026-05-23
**Tạo bởi**: Analyst Agent

---

## 1. Phân loại tính năng theo MoSCoW

### Legend

- 🟢 **Must Have** — Bắt buộc có trong MVP, thiếu thì không bảo vệ được đồ án
- 🟡 **Should Have** — Nên có, thêm nếu còn thời gian, tăng chất lượng đáng kể
- 🟠 **Could Have** — Có thì tốt, bỏ cũng không ảnh hưởng core
- 🔴 **Won't Have** — Không làm trong phạm vi đồ án này

---

## 2. Epic 1: Authentication & User Management

### 🟢 Must Have

| ID      | Tính năng                    | Mô tả                                                                  |
| ------- | ---------------------------- | ---------------------------------------------------------------------- |
| AUTH-01 | Đăng ký tài khoản khách hàng | TenDangNhap, Email, MatKhauHash, HoTen, VaiTro. Hash password (bcrypt) |

| AUTH-02 | Đăng nhập / Đăng xuất | TenDangNhap Or Email + mật khẩu → JWT token. Logout clear token |
| AUTH-03 | Phân quyền 3 VaiTro | KhachHang, NguoiBanHang, Admin. Middleware kiểm tra quyền |
| AUTH-04 | Quản lý thông tin cá nhân | Xem/sửa HoTen, SoDienThoai, AnhDaiDien |
| AUTH-06 | Admin quản lý user | Danh sách users, tạo/sửa/xóa/khóa/mở khóa tài khoản, reset mật khẩu |
| AUTH-07 | Admin quản lý cửa hàng | Danh sách shops, xác thực pháp lý cửa hàng |

### 🟡 Should Have

| ID      | Tính năng     | Mô tả                                                        |
| ------- | ------------- | ------------------------------------------------------------ |
| AUTH-08 | Quên mật khẩu | Gửi link reset password qua email (sử dụng Mailtrap để test) |
| AUTH-09 | Đổi mật khẩu  | User đổi password cũ → mới (yêu cầu nhập password cũ)        |

### 🟠 Could Have

| ID      | Tính năng              | Mô tả                           |
| ------- | ---------------------- | ------------------------------- |
| AUTH-10 | Đăng nhập Google OAuth | Social login qua Google account |
| AUTH-11 | Xác thực email         | Gửi email xác thực sau đăng ký  |

### 🔴 Won't Have

- Single Sign-On (SSO) enterprise
- Biometric authentication
- Xác thực 2 yếu tố (2FA) OTP/SMS

---

## 3. Epic 2: Người bán Shop (Cửa hàng người bán)

### 🟢 Must Have

| ID      | Tính năng                   | Mô tả                                                                                                                                                                                        |
| ------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SHOP-01 | Đăng ký tài khoản người bán | TenDangNhap, Email, MatKhauHash, HoTen, VaiTro, TenCuaHang, MoTa, Logo, DiaChi, PhuongXa, QuanHuyen, TinhThanh, SoDienThoai, LoaiHinhCuaHang, MaSoThue, PdfGiayPhep . Hash password (bcrypt) |
| SHOP-02 | Trang cửa hàng công khai    | Hiển thị: info shop, danh sách sản phẩm đã duyệt, điểm rating trung bình, số sản phẩm đã bán                                                                                                 |
| SHOP-03 | Quản lý thông tin cửa hàng  | Xem/sửa TenCuaHang, MoTa, Logo, DiaChi, PhuongXa, QuanHuyen, TinhThanh, SoDienThoai, LoaiHinhCuaHang, MaSoThue, PdfGiayPhep                                                                  |

### 🟡 Should Have

| ID      | Tính năng       | Mô tả                                                                |
| ------- | --------------- | -------------------------------------------------------------------- |
| SHOP-04 | Thống kê shop   | Dashboard nhỏ: tổng sản phẩm, tổng đơn hoàn thành, rating trung bình |
| SHOP-05 | Trạng thái shop | Hoạt động / Tạm ngưng / Bị khóa (admin khóa nếu vi phạm)             |

---

## 4. Epic 3: Product Management (Quản lý sản phẩm)

### 🟢 Must Have

| ID      | Tính năng               | Mô tả                                                                                         |
| ------- | ----------------------- | --------------------------------------------------------------------------------------------- |
| PROD-01 | Đăng bán sản phẩm       | TieuDe, FileMoTa, Gia, TinhTrang, SoLuong, upload nhiều ảnh sản phẩm, gán danh mục, phân loại |
| PROD-02 | Sửa sản phẩm            | Cập nhật thông tin → tự động chuyển lại "Chờ duyệt" (cần admin duyệt lại)                     |
| PROD-03 | Xóa sản phẩm            | Người bán xóa sản phẩm → xóa cứng sản phẩm, xóa luôn cả review, đánh giá của sản phẩm đó      |
| PROD-04 | Hệ thống danh mục       | Điện thoại, Laptop, Máy tính bảng, Tai nghe/Loa, Linh kiện, Phụ kiện, Gia dụng điện tử,       |
| PROD-05 | Trang chi tiết sản phẩm | Gallery ảnh, thông tin đầy đủ, info Người bán, rating, nút "Mua ngay"                         |

### 🟡 Should Have

| ID      | Tính năng          | Mô tả                                                                  |
| ------- | ------------------ | ---------------------------------------------------------------------- |
| PROD-06 | Tìm kiếm sản phẩm  | Tìm theo tên (text search). Thanh search trên header                   |
| PROD-07 | Lọc sản phẩm       | Filter: danh mục, khoảng giá (min-max)                                 |
| PROD-08 | Sắp xếp sản phẩm   | Sort: giá tăng/giảm, mới nhất, đánh giá cao nhất                       |
| PROD-09 | Quản lý tồn kho    | Tự động trừ SoLuong khi có đơn. Còn hàng / Hết hàng (tự động cập nhật) |
| PROD-10 | Sản phẩm liên quan | Gợi ý 4-8 sản phẩm cùng danh mục ở cuối trang chi tiết                 |

### 🟠 Could Have

| ID      | Tính năng                 | Mô tả                                                              |
| ------- | ------------------------- | ------------------------------------------------------------------ |
| PROD-11 | So sánh sản phẩm          | So sánh 2-3 sản phẩm cùng loại (bảng so sánh)                      |
| PROD-12 | Đặc tả kỹ thuật theo loại | Fields riêng cho từng danh mục (VD: RAM, CPU, màn hình cho laptop) |

### 🔴 Won't Have

- AI product recommendation
- Quét mã vạch / QR code sản phẩm
- Video sản phẩm (chỉ hỗ trợ ảnh)

---

## 5. Epic 4: Moderation (Kiểm duyệt bài đăng)

### 🟢 Must Have

| ID     | Tính năng                   | Mô tả                                                                         |
| ------ | --------------------------- | ----------------------------------------------------------------------------- |
| MOD-01 | Hàng đợi duyệt bài          | Admin thấy danh sách tất cả bài đăng có trạng thái "Chờ phê duyệt"            |
| MOD-02 | Phê duyệt bài đăng          | Admin click "Duyệt" → trạng thái → "Đã duyệt" → hiển thị công khai            |
| MOD-03 | Từ chối bài đăng            | Admin click "Từ chối" → trạng thái → "Đã từ chối" → ẩn, Người bán biết để sửa |
| MOD-04 | Gỡ bỏ bài đã duyệt          | Admin gỡ bài đã duyệt nếu phát hiện vi phạm sau → trạng thái "Đã gỡ"          |
| MOD-05 | Luồng trạng thái kiểm duyệt | Draft → Chờ phê duyệt → Đã duyệt / Đã từ chối / Đã gỡ                         |

### 🟡 Should Have

| ID     | Tính năng               | Mô tả                                                                      |
| ------ | ----------------------- | -------------------------------------------------------------------------- |
| MOD-06 | Lý do từ chối/gỡ        | Admin nhập lý do khi từ chối/gỡ bài. Người bán xem được lý do để sửa lại   |
| MOD-07 | Lọc bài theo trạng thái | Admin filter danh sách bài theo: Chờ duyệt / Đã duyệt / Đã từ chối / Đã gỡ |

---

## 6. Epic 5: Order Management (Quản lý đơn hàng)

### 🟢 Must Have

| ID     | Tính năng                  | Mô tả                                                                                |
| ------ | -------------------------- | ------------------------------------------------------------------------------------ |
| ORD-01 | Giỏ hàng (Cart)            | Thêm sản phẩm vào giỏ. Khi checkout: gộp đơn theo shop, tách đơn nếu khác shop.      |
| ORD-02 | Tạo đơn hàng               | Đặt hàng từ giỏ: nhập địa chỉ nhận (text tự nhập), ghi chú                           |
| ORD-03 | Người bán xác nhận/hủy đơn | Người bán nhận thông báo đơn mới → Xác nhận hoặc Từ chối                             |
| ORD-04 | Cập nhật trạng thái đơn    | Người bán: xác nhận → "Đang giao"; Khách hàng: nhận hàng → "Đã nhận"                 |
| ORD-05 | Hủy đơn hàng               | Khách hàng hủy (trước khi Người bán xác nhận giao); Người bán hủy (trước khi giao)   |
| ORD-06 | Lịch sử đơn hàng           | Khách hàng: xem đơn đã mua; Người bán: xem đơn đã bán. Danh sách + filter trạng thái |
| ORD-07 | Chi tiết đơn hàng          | Thông tin: sản phẩm, giá, người mua/bán, địa chỉ, trạng thái, timeline               |

### 🟡 Should Have

| ID     | Tính năng                 | Mô tả                                                                                   |
| ------ | ------------------------- | --------------------------------------------------------------------------------------- |
| ORD-08 | Luồng trạng thái chi tiết | Chờ xử lý → Đang giao → Đã nhận / Đã hủy                                                |
| ORD-09 | Thông báo đơn hàng        | Notify khi: có đơn mới (Người bán), đơn được xác nhận (Khách hàng), trạng thái thay đổi |

### 🔴 Won't Have

- Tích hợp vận chuyển thực (GHN, GHTK, J&T)
- Tích hợp thanh toán thực (VNPay, Momo, ZaloPay)
- Hoàn tiền tự động (refund system)
- Tính phí vận chuyển tự động

---

## 7. Epic 6: Rating & Review (Đánh giá sản phẩm)

### 🟢 Must Have

| ID     | Tính năng                    | Mô tả                                                          |
| ------ | ---------------------------- | -------------------------------------------------------------- |
| REV-01 | Khách hàng đánh giá sản phẩm | Sau khi xác nhận nhận hàng → cho điểm 1-5 sao + viết nhận xét  |
| REV-02 | Người bán phản hồi đánh giá  | Người bán trả lời review của Khách hàng (thể hiện trách nhiệm) |
| REV-03 | Hiển thị rating trung bình   | Điểm trung bình sao hiển thị trên: trang sản phẩm, trang shop  |
| REV-04 | Danh sách đánh giá           | Xem tất cả reviews trên trang sản phẩm (scroll/pagination)     |

### 🟡 Should Have

| ID     | Tính năng        | Mô tả                                           |
| ------ | ---------------- | ----------------------------------------------- |
| REV-05 | Đánh giá kèm ảnh | Khách hàng đính kèm ảnh thật trong review       |
| REV-06 | Lọc đánh giá     | Filter: theo số sao, có ảnh, mới nhất           |
| REV-07 | Phân bổ sao      | Hiển thị bar chart: bao nhiêu % 5 sao, 4 sao... |

### 🟠 Could Have

| ID     | Tính năng             | Mô tả                                               |
| ------ | --------------------- | --------------------------------------------------- |
| REV-08 | "Hữu ích" button      | User đánh dấu review nào hữu ích, sort theo helpful |
| REV-09 | Giới hạn 1 review/đơn | Mỗi đơn hàng chỉ được đánh giá 1 lần, tránh spam    |

---

## 8. Epic 7: Community Chat (Chat cộng đồng / người bán / khách hàng khác)

### 🟢 Must Have

**A. Chat cộng đồng (Group Chat)**

| ID      | Tính năng                    | Mô tả                                                                    |
| ------- | ---------------------------- | ------------------------------------------------------------------------ |
| CHAT-01 | Phòng chat chung             | Tối thiểu 1 phòng chat "General" cho tất cả user đã đăng nhập            |
| CHAT-02 | Gửi tin nhắn text            | Real-time messaging bằng WebSocket (Socket.IO), gửi nhận tức thì         |
| CHAT-03 | Hiển thị thông tin người gửi | Mỗi tin nhắn hiện: avatar, tên user, thời gian gửi                       |
| CHAT-04 | Lịch sử chat                 | Lưu trữ tin nhắn trong DB, load lại khi vào phòng (pagination/scroll up) |
| CHAT-05 | Yêu cầu đăng nhập            | Chỉ user đã đăng nhập mới tham gia chat, guest chỉ xem                   |

**B. Chat với cửa hàng (Khách hàng ↔ Người bán 1-1)**

| ID      | Tính năng                 | Mô tả                                                                                               |
| ------- | ------------------------- | --------------------------------------------------------------------------------------------------- |
| CHAT-06 | Chat 1-1 với cửa hàng     | Khách hàng nhắn tin trực tiếp cho Người bán từ trang sản phẩm hoặc trang cửa hàng (nút "Chat ngay") |
| CHAT-07 | Danh sách cuộc trò chuyện | Người bán và Khách hàng xem danh sách tất cả cuộc chat 1-1, sắp xếp theo tin nhắn mới nhất          |

**C. Chat với khách hàng khác (User ↔ User 1-1)**

| ID      | Tính năng                | Mô tả                                                                                             |
| ------- | ------------------------ | ------------------------------------------------------------------------------------------------- |
| CHAT-08 | Chat 1-1 giữa khách hàng | User nhắn tin riêng cho user khác (từ profile hoặc từ phòng chat cộng đồng, nút "Nhắn tin riêng") |

### 🟡 Should Have

| ID      | Tính năng                  | Mô tả                                                                 |
| ------- | -------------------------- | --------------------------------------------------------------------- |
| CHAT-09 | Gửi ảnh trong chat         | Upload và hiển thị inline ảnh trong cuộc trò chuyện (cộng đồng & 1-1) |
| CHAT-10 | Trạng thái online          | Hiển thị trạng thái online/offline của Người bán trên trang cửa hàng  |
| CHAT-11 | Thông báo tin nhắn mới     | Badge đỏ / notification khi có tin nhắn 1-1 chưa đọc                  |
| CHAT-12 | Đánh dấu đã đọc / chưa đọc | Hiển thị trạng thái đã đọc cho tin nhắn 1-1 (seen indicator)          |

### 🟠 Could Have

| ID      | Tính năng         | Mô tả                               |
| ------- | ----------------- | ----------------------------------- |
| CHAT-13 | Gửi video         | Upload video ngắn trong chat        |
| CHAT-14 | Tìm kiếm tin nhắn | Full-text search trong lịch sử chat |
| CHAT-15 | Mention (@user)   | Tag người khác bằng @username       |

### 🔴 Won't Have

- Voice/Video call
- Chat bot tự động
- File sharing (documents, PDF...)

---

## 9. Epic 8: Admin Dashboard

### 🟢 Must Have

| ID     | Tính năng           | Mô tả                                                                        |
| ------ | ------------------- | ---------------------------------------------------------------------------- |
| ADM-01 | Dashboard tổng quan | Cards thống kê: tổng users, tổng products, tổng orders, bài chờ duyệt        |
| ADM-02 | Quản lý người dùng  | Bảng danh sách users: tìm kiếm, xem chi tiết, khóa/mở khóa tài khoản         |
| ADM-03 | Quản lý kiểm duyệt  | Danh sách bài chờ duyệt, xem chi tiết bài, approve/reject                    |
| ADM-04 | Quản lý danh mục    | CRUD danh mục sản phẩm (tên, icon/ảnh, thứ tự hiển thị, Mô tả, Danh mục Cha) |

### 🟡 Should Have

| ID     | Tính năng      | Mô tả                                       |
| ------ | -------------- | ------------------------------------------- |
| ADM-05 | Export dữ liệu | Xuất danh sách users/orders/products ra CSV |

---

## 10. Epic 9: UI/UX & Frontend chung

### 🟢 Must Have

| ID    | Tính năng                 | Mô tả                                                                             |
| ----- | ------------------------- | --------------------------------------------------------------------------------- |
| UI-01 | Trang chủ                 | Hero section, sản phẩm mới nhất, danh mục nổi bật, sản phẩm được đánh giá cao     |
| UI-02 | Trang danh mục / Tìm kiếm | Grid sản phẩm + sidebar filter + sort + pagination                                |
| UI-03 | Layout responsive         | Hoạt động chính trên Desktop. Có responsive cho Mobile/Tablet thì càng tốt.       |
| UI-04 | Navigation                | Header: logo, thanh search, icons (giỏ hàng, thông báo, user menu). Footer: links |
| UI-05 | Loading states            | Skeleton loading cho danh sách, spinner cho actions                               |
| UI-06 | Error handling            | Trang 404, error messages thân thiện tiếng Việt, form validation                  |

### 🟡 Should Have

| ID    | Tính năng                       | Mô tả                                                                    |
| ----- | ------------------------------- | ------------------------------------------------------------------------ |
| UI-07 | Toast notifications             | Pop-up thông báo khi: đặt hàng thành công, bài được duyệt, lỗi xảy ra... |
| UI-08 | Breadcrumb navigation           | Đường dẫn breadcrumb cho subpages (Trang chủ > Laptop > Dell XPS 15)     |
| UI-09 | Pagination hoặc Infinite scroll | Cho trang danh sách sản phẩm                                             |
| UI-10 | Dark mode                       | Toggle dark/light theme (bonus ấn tượng cho demo)                        |

### 🔴 Won't Have

- Hệ thống thông báo nâng cấp (Push notification / Email notification) tạm thời loại bỏ.

---

## 11. Tổng hợp MVP Feature Map

### Must Have = 47 features

```text
┌───────────────────────────────────────────────────────────────────┐
│                      ZenTek Exchange MVP                         │
├──────────────┬──────────────┬──────────────┬─────────────────────┤
│  AUTH (6)    │  SHOP (3)    │  PRODUCT (5) │  MODERATION (5)     │
│  ·Đăng ký   │  ·Mở shop    │  ·CRUD SP    │  ·Hàng đợi duyệt   │
│  ·Đăng nhập │  ·Trang shop │  ·Danh mục   │  ·Approve/Reject    │
│  ·3 Roles   │  ·Sửa shop   │  ·Tình trạng │  ·Gỡ bài vi phạm   │
│  ·Profile   │              │  ·Chi tiết   │  ·Luồng trạng thái  │
│  ·Admin CRUD│              │              │                     │
├──────────────┼──────────────┼──────────────┼─────────────────────┤
│  ORDER (7)   │  REVIEW (4)  │  CHAT (8)    │  ADMIN (4) + UI (6) │
│  ·Giỏ hàng  │  ·Rate 1-5★  │  ·Room chung │  ·Dashboard         │
│  ·Tạo đơn   │  ·Reply      │  ·Chat 1-1   │  ·User management   │
│  ·Xác nhận  │  ·Avg rating │  ·Text msg   │  ·Moderation panel  │
│  ·Trạng thái│  ·List all   │  ·Lịch sử   │  ·Category mgmt     │
│  ·Hủy đơn   │              │  ·User info  │  ·Homepage, pages   │
│  ·Lịch sử   │              │  ·Auth req   │  ·Loading, errors   │
└──────────────┴──────────────┴──────────────┴─────────────────────┘
```

### Tổng hợp theo MoSCoW

| Priority       | Số features | Ước tính (Story Points) |
| -------------- | ----------- | ----------------------- |
| 🟢 Must Have   | 48          | ~120-150 SP             |
| 🟡 Should Have | 25          | ~45-60 SP               |
| 🟠 Could Have  | 9           | ~15-25 SP               |
| 🔴 Won't Have  | —           | —                       |
| **Tổng**       | **82**      | **~180-235 SP**         |

---

## 12. Gợi ý thứ tự triển khai (Sprint Roadmap)

| Sprint       | Focus                   | Epics & Features                                      |
| ------------ | ----------------------- | ----------------------------------------------------- |
| **Sprint 1** | 🏗️ Foundation           | Project setup, DB schema, AUTH Must-Have (6 features) |
| **Sprint 2** | 🏪 Người bán & Products | SHOP Must-Have (3), PRODUCT Must-Have (5)             |
| **Sprint 3** | 🔍 Moderation           | MODERATION Must-Have (5), Admin panel cơ bản          |
| **Sprint 4** | 🛒 Commerce             | ORDER Must-Have (6)                                   |
| **Sprint 5** | ⭐ Trust & Community    | REVIEW Must-Have (4), CHAT Must-Have (8)              |
| **Sprint 6** | 🎨 Polish & Admin       | ADMIN Must-Have (4), UI Must-Have (6), Bug fixes      |
| **Sprint 7** | 🚀 Enhancement          | Should Have features, Testing, Seed data, Demo prep   |

---

## 13. Technical Considerations

> _Chi tiết sẽ ở Phase 3 — Architecture. Đây là ghi chú sơ bộ cho context._

### Các yêu cầu kỹ thuật chính:

1. **Real-time chat** → WebSocket (Socket.IO) — yêu cầu persistent connection
2. **Image upload** → File storage: upload vào server/public (Local upload)
3. **Text search** → Tìm kiếm sản phẩm: Tích hợp SQL Server full-text search hoặc query LIKE
4. **Authentication** → JWT + bcrypt + role-based middleware
5. **Responsive UI** → Tailwind CSS
6. **Notification** → Tạm thời loại bỏ hệ thống notification phức tạp (email/push), chỉ dùng Toast notification nội bộ (UI-07)

### Kiến trúc dự kiến (sơ bộ):

- **Frontend**: React (component-based) + Tailwind CSS
- **Backend**: Node.js + Express (đơn giản, phù hợp real-time với Socket.IO)
- **Database**: SQL Server (MSSQL)
- **Real-time**: Socket.IO (mature, documentation tốt)
- **File storage**: Multer local upload (lưu file trực tiếp vào server/public)

---

_Artifact này hoàn thành Phase 1 – Brainstorm. Chuyển sang PO Review để approve trước khi sang Phase 2._
