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

## 2. Giao diện Seller Dashboard (Sắp tới)

_(Sẽ cập nhật chi tiết sau khi hoàn thành phần đăng ký)_
