Kế hoạch thiết kế lại trang Đăng Nhập & Đăng Ký
Kế hoạch này đề xuất thiết kế lại giao diện trang Đăng nhập và Đăng ký cho ZenTek Exchange theo phong cách công nghệ hiện đại, độc đáo (Dark Glassmorphism) kết hợp với ảnh nền mạch điện tử được tự động sinh.

🎨 Ý tưởng thiết kế (Design Concept)
Ảnh nền công nghệ (Tech Background): Sử dụng ảnh nền trừu tượng tối với các đường dẫn vi mạch điện tử và chấm neon xanh lá/xanh lam để làm bật tính chất của sàn TMĐT đồ điện tử ZenTek.
Glassmorphism (Kính mờ): Form Card thiết kế dạng nổi, nền mờ đục với hiệu ứng backdrop-filter: blur, viền kính bán trong suốt và đổ bóng sâu để tạo chiều sâu giao diện.
Đèn Neon & Glow (Hiệu ứng phát sáng):
Tiêu đề sẽ có bóng chữ màu xanh lam.
Viền Input khi focus sẽ đổi màu xanh lam sáng kèm hiệu ứng tỏa sáng nhẹ (Glow).
Thanh lịch & Trực quan: Tích hợp các biểu tượng từ lucide-react trước mỗi trường nhập liệu giúp người dùng dễ dàng định vị thông tin.
Real-time Validation (Kiểm tra lỗi trực tiếp): Thực hiện kiểm tra lỗi của các trường ngay khi người dùng bỏ chọn trường (onBlur) hoặc gõ phím.
🛠️ Các thay đổi đề xuất (Proposed Changes)

1. Tài nguyên hình ảnh (Assets)
   [NEW] public/tech-bg.png: Sao chép ảnh nền mạch điện tử đã tạo vào thư mục public của frontend để sử dụng làm hình nền trong CSS.
2. Giao diện Styles (Stylesheets)
   [MODIFY]
   login.css
   Thiết lập ảnh nền mạch điện tử cho .login-container.
   Chuyển đổi .login-card sang thiết kế kính mờ (Glassmorphic card).
   Cập nhật màu sắc tiêu đề, mô tả và nhãn trường sang tông màu sáng tương phản trên nền tối.
   Định vị các vị trí icon trong input.
   [MODIFY]
   register.css
   Thực hiện các cập nhật Glassmorphism và ảnh nền tương tự cho .register-container và .register-card.
   Đảm bảo hiển thị Grid 2 cột trên màn hình Desktop (lg:col-span-6) hoạt động trơn tru với giao diện kính.
3. Thành phần React (React Components)
   [MODIFY]
   Login.tsx
   Nhúng các icon Lucide (User, Lock, Eye, EyeOff, Loader2) vào form.
   Thêm trạng thái lỗi riêng biệt cho từng trường để kiểm tra hợp lệ trực tiếp khi tương tác.
   Tích hợp hiệu ứng Spinner trên nút đăng nhập khi isLoading bằng true.
   Cập nhật liên kết chuyển hướng sử dụng PATHS.AUTH.REGISTER từ
   path.utils.ts
   .
   [MODIFY]
   Register.tsx
   Nhúng các icon Lucide (User, Lock, Mail, Phone, ShieldCheck, Eye, EyeOff, Loader2).
   Thêm kiểm tra validation real-time:
   Họ tên: Không chứa ký tự đặc biệt, tối thiểu 3 ký tự.
   Tên đăng nhập: Không dấu, không khoảng trắng, từ 3-20 ký tự.
   Email: Đúng định dạng RFC email.
   Mật khẩu: Tối thiểu 6 ký tự.
   Xác nhận mật khẩu: Khớp với mật khẩu đã nhập.
   Xác thực OTP: gửi OTP và xác thực OTP. OTP có hiệu lực trong 5 phút
   Hiển thị spinner khi form đang gửi.
   Cập nhật liên kết chuyển hướng sử dụng PATHS.AUTH.LOGIN.
   🔍 Kế hoạch kiểm thử & Xác minh (Verification Plan)
   Kiểm thử thủ công (Manual Verification)
   Kiểm tra giao diện (UI & Responsiveness):
   Xem trang đăng nhập /dang-nhap và đăng ký /dang-ky trên các kích cỡ màn hình khác nhau (Mobile, Tablet, Desktop) để đảm bảo Grid 12 cột tự động thay đổi độ rộng.
   Xác nhận ảnh nền hiển thị toàn màn hình và card kính mờ nổi bật chính giữa.
   Kiểm tra tương tác & Validation:
   Kiểm tra xem mật khẩu có thể ẩn/hiện khi bấm icon mắt [👁].
   Thử nhập sai định dạng email, sđt hoặc để trống các trường bắt buộc rồi click ra ngoài để xác thực real-time báo lỗi đỏ trực quan bên dưới trường đó.
   Thử submit form và kiểm tra trạng thái vô hiệu hóa (disabled) của nút bấm cùng biểu tượng loading spinner.
