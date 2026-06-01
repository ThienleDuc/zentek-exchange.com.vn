# Epic 7: Chat System (UX/UI Brief)

## 1. Tổng quan thiết kế (Overview)
Trang Quản lý tin nhắn dành cho Admin, với giao diện được thiết kế tham khảo từ các ứng dụng nhắn tin phổ biến (như Zalo, Facebook Messenger, Telegram) nhằm mang lại trải nghiệm mượt mà, trực quan.

## 2. Bố cục (Layout)
Giao diện chia làm **2 cột (2-Column Layout)** lấp đầy màn hình (trừ sidebar và header nếu có):

### Cột 1: Danh sách cuộc trò chuyện (Conversations List)
- **Kích thước**: Chiếm khoảng 30% - 35% chiều rộng màn hình.
- **Tính năng**:
  - **Thanh tìm kiếm (Search Bar)**: Tìm kiếm theo tên người dùng, tên cửa hàng hoặc nội dung tin nhắn.
  - **Bộ lọc (Filter)**: Dạng các nút (Button/Pill) xếp ngang bên dưới thanh tìm kiếm:
    - `Tất cả` (All)
    - `Cá nhân` (Individual)
    - `Nhóm` (Group)
    - `Cửa hàng` (Store)
  - **Danh sách (List View)**: Hiển thị danh sách các cuộc trò chuyện. Mỗi item hiển thị:
    - Avatar người dùng / cửa hàng.
    - Tên người dùng.
    - Nội dung tin nhắn cuối cùng (bị cắt ngắn với dấu `...`).
    - Thời gian nhắn tin.
    - Chấm đỏ/badge báo tin nhắn chưa đọc.
  - Trạng thái *Active* cho cuộc trò chuyện đang được chọn.

### Cột 2: Hộp thoại tin nhắn (Message Dialog)
- **Kích thước**: Chiếm phần lớn diện tích còn lại (khoảng 65% - 70%).
- **Tính năng**:
  - **Header**: Hiển thị thông tin người đang trò chuyện (Avatar, Tên, Trạng thái online/offline), và các hành động (như xem hồ sơ, xóa tin nhắn, ...).
  - **Vùng hiển thị tin nhắn (Message History)**:
    - Khung cuộn hiển thị bong bóng chat (Chat bubbles).
    - Tin nhắn của admin nằm bên phải (màu chủ đạo), tin nhắn của người dùng nằm bên trái (màu nền nhạt).
    - Có phân tách mốc thời gian.
  - **Thanh nhập liệu (Input Area)**:
    - Ô nhập văn bản đa dòng (textarea).
    - Nút đính kèm ảnh/file.
    - Nút gửi tin nhắn (Send).

## 3. Màu sắc và Typography
- Sử dụng các màu sắc chủ đạo của thiết kế hiện tại (vibrant colors, glassmorphism nếu có thể).
- Nền cột 1: `bg-surface`.
- Nền cột 2: `bg-surface-muted` hoặc nền có pattern nhẹ để nổi bật vùng chat.
- Typography: Font hiện hành (Inter/Roboto), kích thước dễ đọc cho nội dung chat.
