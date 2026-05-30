# Epic 2: Shop Management (UX/UI Brief)

## 1. Giao diện Đăng ký Người bán (Seller Registration)

### Triết lý thiết kế (Design Philosophy)

Kế thừa và mở rộng phong cách **"Dark-mode Glassmorphism"** từ trang Đăng ký Người mua. Hướng tới sự chuyên nghiệp, đáng tin cậy nhưng vẫn giữ được nét hiện đại, đậm chất công nghệ của sàn ZenTek Exchange. Cửa sổ form sẽ cần rộng hơn (hoặc chia lưới) để chứa nhiều thông tin.

### Bố cục (Layout & Structure)

Do form dành cho người bán yêu cầu rất nhiều trường dữ liệu, giao diện sẽ được thiết kế dưới dạng **Wizard 2 bước** hoặc **Chia 3 cột rõ ràng** để tránh làm người dùng bị ngợp:

#### Phần 1: Thông tin Chủ tài khoản (Personal Account)

Giữ nguyên luồng đăng ký tài khoản và xác thực OTP inline của người mua:

- Họ tên, Tên đăng nhập, Email, Mật khẩu, Xác nhận mật khẩu.
- Xác thực OTP: Nút "Gửi mã OTP", thanh đếm ngược 5 phút, ô nhập OTP 6 số.

#### Phần 2: Thông tin Cửa hàng (Shop Details)

- **Thông tin cơ bản**: Tên cửa hàng, Loại hình (Cá nhân / Doanh nghiệp), Số điện thoại cửa hàng.

- **Pháp lý**: Mã số thuế (MST), Nút Upload Giấy phép kinh doanh (Vùng Drag & Drop với viền nét đứt).

#### Phần 3: Thông tin Cửa hàng (Shop Details)

- **Địa chỉ kinh doanh**: Các dropdown chọn Tỉnh/Thành phố, Quận/Huyện, Xã/Phường, và ô nhập Địa chỉ chi tiết.
- **Giới thiệu**: Textarea nhập Mô tả cửa hàng.

### Trải nghiệm người dùng (UX)

- **Real-time Validation**: Hiển thị lỗi ngay lập tức khi nhập sai định dạng hoặc thiếu thông tin.
- **Nút Hành Động**: Nút "ĐĂNG KÝ BÁN HÀNG" nổi bật với hiệu ứng gradient (VD: Cam/Đỏ) để phân biệt với nút Đăng ký mua (Xanh blue).

## 2. Giao diện Quản lý Cửa hàng (Admin Shop Management)

### Triết lý thiết kế (Design Philosophy)
Kế thừa giao diện bảng điều khiển của "Quản lý Người dùng", nhưng tập trung mạnh vào quy trình **Kiểm duyệt (Moderation)** và **Quản lý rủi ro pháp lý**. Admin cần có cái nhìn tổng quan về trạng thái của các cửa hàng (Chờ duyệt, Đang hoạt động, Đã bị khóa) và xem xét nhanh được giấy tờ pháp lý.

### Bố cục (Layout & Structure)

#### Phần 1: Tổng quan Thống kê (Metrics Dashboard)
Sử dụng biểu đồ để cung cấp cái nhìn trực quan và chuyên nghiệp:
- **Biểu đồ Cột chồng (Stacked Bar Chart)**: Hiển thị số lượng cửa hàng đăng ký mới trong 7 ngày gần nhất. Mỗi cột đại diện cho một ngày và được xếp chồng các màu theo trạng thái (Hoạt động, Chờ duyệt, Bị khóa).
- **Biểu đồ Tròn (Pie Chart)**: Thể hiện tỷ lệ phần trăm phân bố trạng thái tổng thể của tất cả cửa hàng hiện có trong hệ thống.

#### Phần 2: Bảng Danh sách Cửa hàng (Shops Datatable)
- **Công cụ phía trên (Toolbar)**:
  - Nút **"Thêm mới"**: Mở modal tạo cửa hàng mới (có thể tự động gán tài khoản Seller).
  - **Bộ lọc đa tiêu chí**: Lọc theo Trạng thái (Tất cả, Chờ duyệt, Hoạt động, Vi phạm) và Loại hình (Cá nhân, Doanh nghiệp).
  - Thanh tìm kiếm: Tìm nhanh theo tên cửa hàng, tên chủ shop hoặc mã số thuế.
- **Cột thông tin**: 
  - Tên cửa hàng & Người đại diện (Seller).
  - Loại hình (Cá nhân / Doanh nghiệp).
  - Trạng thái hoạt động (Badge: Chờ duyệt, Hoạt động, Đã khóa).
- **Hành động (Row Actions)**:
  - **Xem (Phê duyệt)**: Mở Modal xem chi tiết giấy phép. Dựa vào `DaXacThucPhapLy` (0: Chưa xác thực, 1: Đã xác thực) để Admin tiến hành phê duyệt.
  - **Sửa**: Chỉnh sửa nhanh thông tin cơ bản của cửa hàng.
  - **Khóa / Mở khóa**: Không có chức năng xóa cửa hàng. Admin chỉ có thể khóa/mở khóa dựa vào `TrangThai` (0: Khóa, 1: Hoạt động).
- **Phân trang (Pagination)**:
  - Điều hướng trang ở cuối bảng, cho phép tùy chọn số dòng trên mỗi trang (10, 20, 50).

#### Phần 3: Modal Thêm mới, Chi tiết & Chỉnh sửa (Shop Modals)
Các Modal này được thiết kế đồng bộ với form đăng ký từ trang **Đăng ký Người bán (Register Seller)**:
- **Thông tin cơ bản**: Tên cửa hàng, Loại hình (Cá nhân, Hộ kinh doanh, Doanh nghiệp), Số điện thoại cửa hàng.
- **Vị trí (Địa chỉ)**: 
  - Tỉnh/Thành phố, Quận/Huyện, Phường/Xã (chọn qua Dropdown theo danh mục hành chính).
  - Tên đường, Tòa nhà, Số nhà (Text input).
- **Hồ sơ pháp lý**: 
  - Mã số thuế (Bắt buộc đối với Hộ kinh doanh và Doanh nghiệp).
  - Khung Preview / Nút "Xem Giấy phép kinh doanh" (Mở PDF viewer hoặc hình ảnh).
- **Hành động (Chỉ dành cho Xem chi tiết/Phê duyệt)**:
  - Nút **"Phê duyệt"** (Màu xanh): Kích hoạt cửa hàng (Chuyển `DaXacThucPhapLy` thành `1`).
  - Nút **"Từ chối"** (Màu đỏ/cam): Đi kèm ô nhập lý do từ chối (Lưu vào `LyDoTuChoi`).
  - Nút **"Khóa cửa hàng"** / **"Mở khóa cửa hàng"**: Thay đổi trạng thái hoạt động (`TrangThai` 0 hoặc 1).

### Trải nghiệm người dùng (UX)
- **Sử dụng Component Alert**: Tái sử dụng component `Alert` đa năng cho các bước xác nhận thao tác quan trọng (Duyệt, Khóa, Xóa).
- **Review nhanh PDF**: Admin không cần tải file về máy, hệ thống hỗ trợ preview file giấy phép ngay trên trình duyệt để tối ưu luồng xử lý.

## 3. Giao diện Seller Dashboard (Sắp tới)
_(Sẽ cập nhật chi tiết sau khi hoàn thành phần quản lý của Admin)_
