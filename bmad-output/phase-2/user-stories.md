# User Stories – ZenTek Exchange

**Trạng thái**: Draft
**Ngày tạo**: 2026-05-24
**Tạo bởi**: Product Manager Agent
**Dựa trên**: PRD MVP 1.0

---

## Epic 1: Authentication & User Management

### AUTH-01: Đăng ký
**Là** một khách truy cập, **Tôi muốn** đăng ký một tài khoản mới **Để** có thể mua hàng hoặc trao đổi trên hệ thống.
- **AC1**: Form đăng ký yêu cầu: Tên đăng nhập, Email, Mật khẩu, Họ tên.
- **AC2**: Mật khẩu phải được mã hóa (bcrypt) trước khi lưu.
- **AC3**: Email và Tên đăng nhập phải là unique. Hệ thống báo lỗi nếu trùng.

### AUTH-02: Đăng nhập/Đăng xuất
**Là** một người dùng đã đăng ký, **Tôi muốn** đăng nhập/đăng xuất **Để** truy cập các chức năng của tài khoản.
- **AC1**: Hỗ trợ đăng nhập bằng Tên đăng nhập hoặc Email.
- **AC2**: Đăng nhập thành công trả về JWT token.
- **AC3**: Click Đăng xuất sẽ xóa token ở phía client và redirect về Trang chủ.

### AUTH-04: Quản lý Profile
**Là** một người dùng, **Tôi muốn** xem và chỉnh sửa thông tin cá nhân **Để** cập nhật khi cần.
- **AC1**: Cho phép thay đổi Họ tên, Số điện thoại, Avatar.
- **AC2**: Không cho phép thay đổi Tên đăng nhập.

### AUTH-06: Admin quản lý User
**Là** một Admin, **Tôi muốn** quản lý tài khoản người dùng **Để** duy trì an ninh nền tảng.
- **AC1**: Admin xem được danh sách tất cả người dùng (phân trang).
- **AC2**: Admin có thể khóa (ban) hoặc mở khóa tài khoản bất kỳ (ngoại trừ super admin).

---

## Epic 2: Shop Management

### SHOP-01: Mở cửa hàng
**Là** một NguoiBanHang, **Tôi muốn** đăng ký thông tin cửa hàng **Để** bắt đầu đăng bán sản phẩm.
- **AC1**: Form yêu cầu: Tên cửa hàng, Mô tả, Địa chỉ chi tiết (Tỉnh/Huyện/Phường).
- **AC2**: Tên cửa hàng phải là unique.
- **AC3**: Sau khi lưu thành công, user chính thức có cửa hàng và truy cập được Dashboard người bán.

### SHOP-02: Trang cửa hàng công khai
**Là** một người mua, **Tôi muốn** xem trang của cửa hàng **Để** biết thông tin shop và các sản phẩm họ đang bán.
- **AC1**: Hiển thị banner/logo, tên, địa chỉ, rating trung bình.
- **AC2**: Liệt kê các sản phẩm "Đã duyệt" của cửa hàng này.

### SHOP-04: Kiểm duyệt cửa hàng (Admin)
**Là** một Admin, **Tôi muốn** xét duyệt hồ sơ mở cửa hàng **Để** đảm bảo tính pháp lý.
- **AC1**: Hiển thị danh sách cửa hàng "Chưa xác thực".
- **AC2**: Nút "Xác nhận" -> DaXacThucPhapLy = 1.
- **AC3**: Nút "Từ chối" kèm lý do -> Lưu vào LyDoTuChoi.

---

## Epic 3: Product Management

### PROD-01: Đăng bán sản phẩm
**Là** một NguoiBanHang, **Tôi muốn** đăng một sản phẩm mới **Để** tiếp cận người mua.
- **AC1**: Form yêu cầu: Tiêu đề, Mô tả, Giá, Tình trạng (Mới/Cũ), Số lượng, Danh mục.
- **AC2**: Cho phép upload nhiều ảnh (ít nhất 1 ảnh làm cover).
- **AC3**: Sau khi submit, sản phẩm ở trạng thái "Chờ phê duyệt" (không hiển thị public).

### PROD-02: Sửa sản phẩm
**Là** một NguoiBanHang, **Tôi muốn** cập nhật thông tin sản phẩm **Để** điều chỉnh giá hoặc mô tả.
- **AC1**: Có thể sửa các trường như giá, mô tả, số lượng.
- **AC2**: Nếu sửa (ngoại trừ số lượng), trạng thái sẽ chuyển lại thành "Chờ phê duyệt".

### PROD-03: Xóa sản phẩm
**Là** một NguoiBanHang, **Tôi muốn** xóa sản phẩm **Để** ngưng bán hoàn toàn.
- **AC1**: Xóa cứng sản phẩm khỏi database.
- **AC2**: Cảnh báo user rằng các đánh giá của sản phẩm này cũng sẽ mất.

### PROD-05: Xem chi tiết sản phẩm
**Là** người mua, **Tôi muốn** xem trang chi tiết sản phẩm **Để** biết thông tin đầy đủ trước khi mua.
- **AC1**: Hiển thị ảnh gallery, giá, tình trạng, số lượng còn lại.
- **AC2**: Hiển thị thông tin người bán kèm nút "Chat ngay".
- **AC3**: Có nút "Thêm vào giỏ" và "Mua ngay".

---

## Epic 4: Moderation

### MOD-01 & MOD-02 & MOD-03: Duyệt / Từ chối sản phẩm
**Là** một Admin, **Tôi muốn** xét duyệt các sản phẩm mới **Để** đảm bảo không có hàng cấm/lừa đảo.
- **AC1**: Admin có danh sách "Chờ phê duyệt".
- **AC2**: Nút "Duyệt" -> Sản phẩm public.
- **AC3**: Nút "Từ chối" -> Sản phẩm bị ẩn, người bán thấy trạng thái bị từ chối.

### MOD-04: Gỡ bài vi phạm
**Là** một Admin, **Tôi muốn** gỡ các sản phẩm đã duyệt nhưng bị báo cáo **Để** làm sạch nền tảng.
- **AC1**: Nút "Gỡ bài" trên các sản phẩm đang hiển thị. Sản phẩm chuyển sang trạng thái "Đã gỡ".

---

## Epic 5: Order Management

### ORD-01 & ORD-02: Giỏ hàng & Checkout
**Là** người mua, **Tôi muốn** thêm sản phẩm vào giỏ và đặt hàng **Để** mua nhiều món cùng lúc.
- **AC1**: Giỏ hàng hiển thị các sản phẩm, gộp theo từng Shop.
- **AC2**: Quá trình Checkout cho phép nhập địa chỉ giao hàng bằng tay (text) và Ghi chú.
- **AC3**: Submit tạo thành công đơn hàng (trạng thái "Chờ xử lý"), trừ số lượng kho dự kiến.

### ORD-03 & ORD-04: Cập nhật trạng thái
**Là** người bán/người mua, **Tôi muốn** cập nhật trạng thái đơn **Để** theo dõi tiến độ.
- **AC1**: Người bán có nút "Xác nhận" -> "Đang giao".
- **AC2**: Người mua có nút "Đã nhận hàng" -> "Hoàn thành".

### ORD-05: Hủy đơn
**Là** người mua/bán, **Tôi muốn** hủy đơn hàng **Để** dừng giao dịch nếu đổi ý.
- **AC1**: Người mua chỉ hủy được khi đơn "Chờ xử lý".
- **AC2**: Người bán chỉ hủy được trước khi chuyển sang "Đang giao". Số lượng kho hoàn lại.

---

## Epic 6: Rating & Review

### REV-01: Đánh giá sản phẩm
**Là** người mua, **Tôi muốn** đánh giá sản phẩm **Để** chia sẻ trải nghiệm với người khác.
- **AC1**: Nút đánh giá chỉ hiện với đơn hàng trạng thái "Hoàn thành".
- **AC2**: Cho phép chọn 1-5 sao và nhập nội dung text.

### REV-02: Seller phản hồi
**Là** người bán, **Tôi muốn** trả lời các đánh giá **Để** giải thích hoặc cảm ơn người mua.
- **AC1**: Seller có nút "Phản hồi" dưới mỗi review của sản phẩm mình bán.

---

## Epic 7: Chat System

### CHAT-01: Phòng chat cộng đồng
**Là** một người dùng, **Tôi muốn** tham gia phòng chat chung **Để** hỏi han, giao lưu kiến thức điện tử.
- **AC1**: Có một room "General" mọi người đều thấy.
- **AC2**: Chỉ user đã đăng nhập mới gõ được tin nhắn. Tin nhắn hiện ngay lập tức cho những người đang online (WebSocket).
- **AC3**: Hiển thị avatar, tên người gửi và thời gian.

### CHAT-06: Chat 1-1 Buyer-Seller
**Là** người mua, **Tôi muốn** chat riêng với người bán **Để** mặc cả hoặc hỏi thêm về tình trạng máy.
- **AC1**: Nút "Chat ngay" trên trang sản phẩm mở cửa sổ chat 1-1 với chủ shop.
- **AC2**: Tin nhắn real-time riêng tư giữa 2 người.

### CHAT-08: Chat 1-1 User-User
**Là** người dùng, **Tôi muốn** chat riêng với một user khác trong phòng cộng đồng **Để** trao đổi thông tin kín.
- **AC1**: Bấm vào tên một người trong nhóm chat sẽ có tùy chọn "Nhắn tin riêng".
- **AC2**: Mở phòng chat riêng biệt.

---

## Epic 8: Admin Dashboard & UI

### ADM-01: Dashboard Thống kê
**Là** Admin, **Tôi muốn** xem các chỉ số hệ thống **Để** nắm bắt tình hình hoạt động.
- **AC1**: Hiển thị tổng User, tổng Sản phẩm, tổng Đơn hàng, tổng Cửa hàng.

### ADM-05: Quản lý cửa hàng
**Là** Admin, **Tôi muốn** quản lý toàn bộ cửa hàng **Để** xử lý các shop vi phạm.
- **AC1**: Hiển thị danh sách cửa hàng đang hoạt động.
- **AC2**: Nút "Khóa" -> TrangThai = 0 (tạm khóa).

### UI-01: Trang chủ
**Là** một khách truy cập, **Tôi muốn** thấy trang chủ trực quan **Để** dễ dàng tìm kiếm sản phẩm.
- **AC1**: Hiển thị slider banner.
- **AC2**: Hiển thị sản phẩm mới nhất và danh mục nổi bật.
