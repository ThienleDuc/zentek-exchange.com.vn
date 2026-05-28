# UX/UI Brief – ZenTek Exchange (Tổng quan)

**Trạng thái**: Draft
**Ngày cập nhật**: 2026-05-25

---

## 1. Tổng quan UX chung
- **Simplicity (Đơn giản hóa)**: Giao diện gọn gàng, chia bố cục rõ ràng, tập trung vào các trường dữ liệu cần thiết.
- **Trust First (Tin cậy)**: Hiển thị các thông báo lỗi rõ ràng (Validation) giúp người dùng nhận biết lỗi lập tức.
- **Vietnamese First**: 100% sử dụng tiếng Việt.
- **Progressive Disclosure**: Sắp xếp các trường dữ liệu hợp lý để tránh form bị quá dài.

---

## 2. Visual Design Guidelines (Quy chuẩn thiết kế chung)

### 2.1 Color Palette
| Token | Hex | Sử dụng |
|-------|-----|---------|
| **Primary** | `#2563eb` (Xanh/Blue) | Buttons chính, links, menu chủ đạo |
| **Accent** | `#ff4d4f` (Đỏ cam) | Làm điểm nhấn, button nổi bật |
| **Secondary** | `#10b981` (Xanh lá) | Thông báo thành công |
| **Warning** | `#f59e0b` (Vàng) | Thông báo cảnh báo |
| **Danger** | `#ef4444` (Đỏ) | Thông báo lỗi (Validation error) |
| **Surface** | `#FFFFFF` | Form Card background, Panel |
| **Background** | `#fff5f5` (Trắng hồng) | Page background chung toàn web |
| **Text Main** | `#000000` (Đen) | Tiêu đề chính, Text đậm |
| **Text Body** | `#4b5563` (Xám) | Chữ cơ bản |

### 2.2 Typography (Font chữ)
- **Font chủ đạo**: `Inter`, `system-ui`, `sans-serif`.
- **Cảm giác (Vibe)**: Hiện đại, bo cong mềm mại, thân thiện với mắt người dùng.
- Kích thước chữ tiêu chuẩn từ `14px` đến `16px`.

---

## 3. Các tài liệu UX/UI chi tiết theo Epic

Chi tiết UX/UI cho từng phân hệ được nhóm trong thư mục `ux-briefs/`:

1. [Epic 1: Authentication & User](ux-briefs/01-epic-auth-user.md)
2. [Epic 2: Shop Management](ux-briefs/02-epic-shop.md)
3. [Epic 3: Product Management](ux-briefs/03-epic-product.md)
4. [Epic 4: Moderation](ux-briefs/04-epic-moderation.md)
5. [Epic 5: Order Management](ux-briefs/05-epic-order.md)
6. [Epic 6: Rating & Review](ux-briefs/06-epic-rating-review.md)
7. [Epic 7: Chat System](ux-briefs/07-epic-chat.md)
8. [Epic 8: Admin Dashboard & UI](ux-briefs/08-epic-admin-ui.md)
