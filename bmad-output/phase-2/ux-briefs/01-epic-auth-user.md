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

---

# Quản lý Người dùng (User Management)

Tính năng này cung cấp giao diện quản trị để xem danh sách, tìm kiếm, sửa, xóa và cấp lại mật khẩu cho người dùng.

🎨 Ý tưởng thiết kế (Design Concept)
- **Bố cục Toàn màn hình (Full-height Layout):** Trang thiết lập chiều cao tối thiểu `min-h-screen` (100vh), được chia làm 2 phần rõ rệt:
  - **Phần 1 (Phía trên):** Khu vực thống kê hiển thị các biểu đồ (sử dụng thư viện biểu đồ ReactJS) giúp admin nắm bắt lượng người dùng mới, tỷ lệ các vai trò.
  - **Phần 2 (Phía dưới):** Khu vực hiển thị bảng dữ liệu danh sách người dùng chi tiết.
- **Phong cách Kính mờ (Dark Glassmorphism) & Tone màu Slate:** Trang quản lý được chia làm 2 Card (Khối) lớn bao bọc Biểu đồ và Bảng. Cả 2 Card sử dụng tone màu Slate tối (`bg-slate-900/70`), viền kính mờ đục (`backdrop-blur-md`) và đổ bóng đổ để nổi bật hoàn toàn trên nền layout `slate-800`.
- **Màu sắc & Trạng thái (Colors & States):** Sử dụng các huy hiệu (badges) màu sắc neon để phân biệt vai trò (Admin: Đỏ, Seller: Xanh lá, Buyer: Xanh lam) giúp quản trị viên dễ dàng nhận diện.
- **Tương tác trực quan:** Các nút hành động (Xem, Sửa, Xoá) sử dụng icon từ `lucide-react` với hiệu ứng hover glow sáng rực lên tương ứng với hành động (Xoá -> Đỏ, Xem -> Xanh lam, Sửa -> Vàng).
- **Modal Kính mờ (Glass Modal):** Modal xem chi tiết người dùng sẽ hiển thị dưới dạng pop-up kính mờ ở trung tâm, hiệu ứng fade-in mượt mà.

🛠️ Các thay đổi đề xuất (Proposed Changes)

1. Giao diện Styles (Sử dụng Tailwind CSS)
   - Đồng bộ màu nền của `AdminLayout` thành `#1e293b` (slate-800) khớp với Sidebar và Footer.
   - Định dạng 2 Card hiển thị với nền `slate-900` bán trong suốt.
   - Tạo hiệu ứng hover nhẹ (`hover:bg-slate-700/30`) cho từng hàng trong bảng.
   - Bo góc mềm mại cho bảng (`rounded-xl`), kết hợp với bóng đổ (`shadow-2xl`) để tạo chiều sâu.

2. Thành phần React (React Components)
   [NEW] `UserManagement.tsx`
   - Bố cục trang chia làm 2 khối Card. 
   - **Card 1 (Tổng quan Thống kê):** Tích hợp thư viện biểu đồ `recharts` để vẽ Pie Chart (Tỷ lệ vai trò) và Bar Chart (Đăng ký mới 7 ngày).
   - **Card 2 (Danh sách Người dùng):** Chứa Tiêu đề, thanh tìm kiếm, nút "Thêm mới" và bảng dữ liệu.
   - Ô tìm kiếm tích hợp icon kính lúp, viền sẽ phát sáng (`ring-blue-500`) khi đang nhập liệu để tăng độ tập trung (focus).
   - Bảng dữ liệu hiển thị các cột: Tài khoản, Liên hệ, Vai trò, Ngày tạo, Thao tác.
   - Tích hợp component `Pagination.tsx` ở cuối bảng để điều hướng trang.
   
   [NEW] `UserDetailModal.tsx`
   - Bố cục lưới 2 cột gọn gàng để hiển thị thông tin cá nhân.
   - Nút "Cấp lại mật khẩu ngẫu nhiên" (icon Key): Khi thành công sẽ hiện khung viền xanh lá (success alert) chứa mật khẩu mới nổi bật, kèm text gợi ý copy gửi cho người dùng.
   
   [NEW] `Pagination.tsx`
   - Cung cấp các nút chuyển trang (Prev, Next, Số trang) dạng nút bấm bo góc. Nút trang hiện tại sẽ được đổ màu nổi bật.

🔍 Kế hoạch kiểm thử & Xác minh (Verification Plan)
- Đảm bảo bảng hiển thị tốt, không bị vỡ bố cục trên màn hình nhỏ (tích hợp thanh cuộn ngang `overflow-x-auto`).
- Kiểm tra hiệu ứng hover trên từng hàng và các nút thao tác có đổi màu sắc phản hồi ngay lập tức.
- Thử nghiệm tìm kiếm, đảm bảo ô tìm kiếm có hiệu ứng focus rõ ràng.
- Mở Modal xem chi tiết và nhấp "Cấp lại mật khẩu", đảm bảo thông báo mật khẩu mới hiển thị rõ ràng, nổi bật.
- Khi bấm Xoá, hộp thoại xác nhận hiện ra với nội dung cảnh báo chính xác (rằng tài khoản và cửa hàng tương ứng sẽ bị vô hiệu hoá - Soft Delete).
