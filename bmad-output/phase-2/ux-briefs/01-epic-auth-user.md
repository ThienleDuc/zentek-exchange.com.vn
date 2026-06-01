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

---

-----------------phân tách ------------------------

# Kế hoạch thiết kế các trang quản lý tài khoản – ZenTekExchange

> **Phạm vi:** Chỉ phần thân trang (main content), không bao gồm header, footer, danh mục (đã có component layout riêng).  
> **Kỹ thuật:** ReactJS, TailwindCSS, responsive.  
> **Dữ liệu:** Bám sát database `ZenTekExchange` – bảng `NguoiDung`.

---

## 1. Trang “Tài khoản của tôi”

**Mục đích:** Hiển thị thông tin chi tiết của tài khoản đang đăng nhập, cung cấp nút dẫn đến trang đổi mật khẩu.

### 1.1. Bố cục tổng thể

Trang được chia làm hai cột (trên desktop) hoặc xếp chồng (trên mobile):

| Cột          | Nội dung                          | Độ rộng (desktop) |
| ------------ | --------------------------------- | ----------------- |
| **Cột trái** | Ảnh đại diện và các nút hành động | 1/3 (flex: 1)     |
| **Cột phải** | Thông tin chi tiết tài khoản      | 2/3 (flex: 2)     |

Trên mobile: cột trái ở trên, cột phải ở dưới, mỗi cột full width.

### 1.2. Dữ liệu hiển thị

- **Nguồn:** Bảng `NguoiDung` với `MaNguoiDung` của người dùng hiện tại.
- **Các trường cần lấy:** `HoTen`, `Email`, `SoDienThoai`, `AnhDaiDien`, `TenDangNhap`, `NgayTao`.

### 1.3. Cấu trúc chi tiết từng phần

#### Cột trái – Ảnh đại diện và điều hướng

- **Ảnh đại diện:** Hiển thị hình tròn, kích thước 150x150 (hoặc 120x120 trên mobile). Nếu `AnhDaiDien` null, hiển thị ảnh mặc định (avatar placeholder).
- **Nút “Chỉnh sửa thông tin”:** Dẫn đến trang `/thay-doi-thong-tin`.
- **Nút “Đổi mật khẩu”:** Dẫn đến trang `/doi-mat-khau`.

#### Cột phải – Thông tin chi tiết

Hiển thị dạng danh sách các trường, mỗi trường có nhãn và giá trị:

- **Họ và tên:** `HoTen`
- **Tên đăng nhập:** `TenDangNhap`
- **Email:** `Email`
- **Số điện thoại:** `SoDienThoai` (nếu null thì hiển thị “Chưa cập nhật”)
- **Ngày tham gia:** `NgayTao` (định dạng dd/mm/yyyy)

### 1.4. Tương tác

- Khi vào trang, gọi API `GET /api/user/profile` để lấy thông tin.
- Hiển thị skeleton loading cho cả hai cột.
- Nếu lỗi, hiển thị thông báo và nút thử lại.
- Click các nút điều hướng sẽ chuyển trang (React Router).

### 1.5. Responsive

- Desktop: hai cột ngang.
- Mobile: ảnh đại diện căn giữa, các nút xếp dọc, thông tin dạng list.

---

## 2. Trang “Thay đổi thông tin”

**Mục đích:** Cho phép người dùng cập nhật họ tên, số điện thoại, email và ảnh đại diện. Không bao gồm đổi mật khẩu.

### 2.1. Bố cục tổng thể

Hai cột (desktop) hoặc xếp chồng (mobile):

| Cột          | Nội dung                                                | Độ rộng (desktop) |
| ------------ | ------------------------------------------------------- | ----------------- |
| **Cột phải** | Ảnh đại diện và khu vực tải ảnh lên                     | 1/3 (flex: 1)     |
| **Cột trái** | Biểu mẫu thông tin chung (họ tên, email, số điện thoại) | 2/3 (flex: 2)     |

**Lưu ý:** Theo yêu cầu, ảnh nằm ở cột phải, thông tin chung nằm cột trái.

### 2.2. Dữ liệu hiển thị

- **Lấy thông tin hiện tại:** Từ API `GET /api/user/profile` (tương tự trang tài khoản).
- **Cập nhật:** Gửi lên API `PUT /api/user/profile` với các trường đã sửa.

### 2.3. Cấu trúc chi tiết từng phần

#### Cột trái – Biểu mẫu thông tin chung

- **Họ và tên:** Input text, bắt buộc.
- **Email:** Input email, bắt buộc, định dạng hợp lệ.
- **Số điện thoại:** Input text, số 10 chữ số, có thể để trống (nếu cho phép).
- **Nút “Lưu thay đổi”** (dưới cùng) và **nút “Hủy”** (quay lại trang tài khoản).

#### Cột phải – Ảnh đại diện

- **Ảnh hiện tại:** Hiển thị hình tròn, kích thước 150x150.
- **Nút “Chọn ảnh”** (input file ẩn, kích hoạt bằng nút).
- **Xem trước ảnh:** Khi chọn file mới, hiển thị preview.
- **Nút “Xóa ảnh”** (nếu có ảnh hiện tại) – đặt lại ảnh mặc định.
- Hỗ trợ các định dạng: jpg, png, gif, tối đa 2MB.

### 2.4. Xử lý cập nhật

1. Kiểm tra validation client-side (họ tên không rỗng, email đúng định dạng, số điện thoại hợp lệ nếu có).
2. Nếu có ảnh mới, upload ảnh lên server trước (hoặc gửi dạng multipart/form-data cùng lúc).
3. Gọi API cập nhật thông tin.
4. Thành công: Hiển thị thông báo “Cập nhật thành công”, chuyển hướng về trang “Tài khoản của tôi” sau 2 giây hoặc cho phép người dùng bấm tiếp tục.
5. Thất bại: Hiển thị lỗi, giữ nguyên dữ liệu đã nhập.

### 2.5. Responsive

- Trên mobile: cột phải (ảnh) lên trên, cột trái (form) xuống dưới.
- Các input full width, nút bấm chiếm toàn bộ chiều rộng.

---

## 3. Trang “Đổi mật khẩu”

**Mục đích:** Cho phép người dùng thay đổi mật khẩu, yêu cầu nhập mật khẩu cũ, mật khẩu mới và xác nhận mật khẩu mới.

### 3.1. Bố cục tổng thể

Trang có bố cục một cột, căn giữa (dạng form). Đặt trong container có chiều rộng tối đa 500px (trên desktop) hoặc full width trên mobile.

### 3.2. Cấu trúc form

- **Mật khẩu cũ:** Input type password, bắt buộc.
- **Mật khẩu mới:** Input type password, bắt buộc, yêu cầu độ phức tạp tối thiểu (ví dụ: ít nhất 8 ký tự, có chữ hoa, số, ký tự đặc biệt – tuỳ chọn).
- **Xác nhận mật khẩu mới:** Input type password, bắt buộc, phải khớp với mật khẩu mới.
- **Nút “Đổi mật khẩu”** và **nút “Hủy”** (quay lại trang tài khoản).

### 3.3. Xử lý validation client-side

- Mật khẩu cũ không được rỗng.
- Mật khẩu mới: không rỗng, đủ độ dài, phức tạp (nếu có quy định).
- Xác nhận khớp với mật khẩu mới.
- Hiển thị lỗi ngay dưới từng trường khi người dùng thao tác (onBlur).

### 3.4. Gọi API

- `POST /api/user/change-password` với body `{ oldPassword, newPassword }`.
- Server kiểm tra mật khẩu cũ có đúng không, sau đó cập nhật `MatKhauHash`.
- Thành công: Hiển thị thông báo “Đổi mật khẩu thành công. Vui lòng đăng nhập lại.”, sau đó đăng xuất người dùng và chuyển về trang đăng nhập (hoặc quay về tài khoản nhưng yêu cầu đăng nhập lại).
- Thất bại: Hiển thị lỗi (mật khẩu cũ sai, mật khẩu mới không hợp lệ, …), giữ nguyên form.

### 3.5. Tương tác bổ sung

- Có thể có checkbox “Hiển thị mật khẩu” để người dùng xem mật khẩu đang nhập.
- Nút “Đổi mật khẩu” có trạng thái loading trong khi chờ phản hồi.

### 3.6. Responsive

- Form luôn chiếm 90% chiều rộng trên mobile, tối đa 500px trên desktop.
- Các input full width, nút bấm full width.

---

## 4. Các điểm chung cho cả 3 trang

- **Xác thực:** Tất cả các trang đều yêu cầu người dùng đã đăng nhập. Nếu chưa đăng nhập, chuyển hướng về trang đăng nhập.
- **Loading:** Sử dụng skeleton hoặc spinner trong khi chờ API.
- **Thông báo:** Dùng toast hoặc alert tạm thời (top-right) cho các thông báo thành công/thất bại.
- **Điều hướng:** Sử dụng React Router, sau khi lưu thành công thường quay lại trang “Tài khoản của tôi”.

---

## 5. Tóm tắt các thành phần theo từng trang

### Trang “Tài khoản của tôi”

- [x] Cột trái: Ảnh đại diện, nút “Chỉnh sửa thông tin”, nút “Đổi mật khẩu”
- [x] Cột phải: Danh sách thông tin (họ tên, tên đăng nhập, email, số điện thoại, ngày tham gia)
- [x] Responsive 2 cột → 1 cột

### Trang “Thay đổi thông tin”

- [x] Cột phải: Ảnh đại diện + nút chọn ảnh + xóa ảnh
- [x] Cột trái: Form họ tên, email, số điện thoại
- [x] Nút Lưu, Hủy
- [x] Upload ảnh, preview
- [x] Responsive (đảo cột trên mobile)

### Trang “Đổi mật khẩu”

- [x] Form một cột: mật khẩu cũ, mật khẩu mới, xác nhận mật khẩu mới
- [x] Validation real-time
- [x] Nút Đổi mật khẩu, Hủy
- [x] Xử lý thành công → đăng xuất và chuyển hướng
- [x] Responsive form trung tâm

---

Kế hoạch này cung cấp đầy đủ mô tả để triển khai ba trang quản lý tài khoản của ZenTekExchange, bám sát database, sử dụng ReactJS và TailwindCSS, có responsive và tương tác rõ ràng.

----------------Phân tách-----------------

```markdown
# Kế hoạch thiết kế các trang “Hồ sơ người bán”, “Chỉnh sửa hồ sơ”, “Đổi mật khẩu” – ZenTekExchange

> **Phạm vi:** Chỉ phần thân trang (main content), không bao gồm header, footer, menu sidebar (đã có component layout riêng).  
> **Vai trò:** Người bán (Seller).  
> **Kỹ thuật:** ReactJS, TailwindCSS, responsive.  
> **Dữ liệu:** Bám sát database `ZenTekExchange` – các bảng `NguoiDung`, `CuaHang`.

> **Nguyên tắc:** Trang “Hồ sơ người bán” hiển thị thông tin kết hợp giữa tài khoản người dùng và cửa hàng. Trang “Chỉnh sửa hồ sơ” cho phép cập nhật thông tin (cả người dùng và cửa hàng), có hai nút “Lưu thay đổi” và “Đổi mật khẩu” (dẫn sang trang đổi mật khẩu). Trang “Đổi mật khẩu” dùng chung với khách hàng (đã có kế hoạch trước đó).

---

## 1. Trang “Hồ sơ người bán” (Xem thông tin)

**Mục đích:** Hiển thị toàn bộ thông tin của người bán (tài khoản) và cửa hàng của họ ở chế độ xem (read-only), không có form chỉnh sửa.

### 1.1. Bố cục tổng thể

Chia làm hai cột (desktop) hoặc xếp chồng (mobile):

| Cột          | Nội dung                                                                                                                              | Độ rộng (desktop) |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| **Cột trái** | Thông tin tài khoản người bán (avatar, họ tên, email, số điện thoại, tên đăng nhập, ngày tham gia)                                    | 1/2 (flex: 1)     |
| **Cột phải** | Thông tin cửa hàng (logo, tên cửa hàng, mô tả, địa chỉ, số điện thoại cửa hàng, loại hình, mã số thuế, trạng thái xác thực, ngày tạo) | 1/2 (flex: 1)     |

Trên mobile: cột trái ở trên, cột phải ở dưới, mỗi cột full width.

### 1.2. Dữ liệu hiển thị

- **Nguồn:**
  - Bảng `NguoiDung` với `MaNguoiDung` của người bán hiện tại.
  - Bảng `CuaHang` với `NguoiBanId` tương ứng.
- **Các trường hiển thị (cột trái – thông tin tài khoản):**
  - Ảnh đại diện (`AnhDaiDien`)
  - Họ và tên (`HoTen`)
  - Tên đăng nhập (`TenDangNhap`)
  - Email (`Email`)
  - Số điện thoại (`SoDienThoai`)
  - Ngày tạo tài khoản (`NgayTao`)
- **Các trường hiển thị (cột phải – thông tin cửa hàng):**
  - Logo (`Logo`)
  - Tên cửa hàng (`TenCuaHang`)
  - Mô tả (`MoTa`)
  - Địa chỉ đầy đủ: `DiaChi, PhuongXa, QuanHuyen, TinhThanh` (ghép chuỗi)
  - Số điện thoại cửa hàng (`SoDienThoai`)
  - Loại hình cửa hàng (`LoaiHinhCuaHang`: 1-Cá nhân, 2-Hộ kinh doanh, 3-Doanh nghiệp nhỏ)
  - Mã số thuế (`MaSoThue`)
  - Trạng thái xác thực pháp lý (`DaXacThucPhapLy`: hiển thị “Đã xác thực” hoặc “Chưa xác thực”)
  - Ngày tạo cửa hàng (`NgayTao`)

### 1.3. Nút hành động

- **Nút “Chỉnh sửa hồ sơ”** (ở đầu trang, bên phải hoặc cuối cột trái): Dẫn đến trang `/seller/edit-profile`.
- **Nút “Đổi mật khẩu”** (cạnh nút trên hoặc ở vị trí riêng): Dẫn đến trang `/doi-mat-khau` (dùng chung).

### 1.4. Xử lý trạng thái

- Khi vào trang, gọi API `GET /api/seller/profile` để lấy thông tin người bán và cửa hàng.
- Hiển thị skeleton loading cho cả hai cột.
- Nếu chưa có cửa hàng (trường hợp hiếm, vì người bán phải có cửa hàng), hiển thị thông báo và hướng dẫn tạo cửa hàng.

### 1.5. Responsive

- Desktop: hai cột ngang, mỗi cột có nền trắng, bo góc, padding.
- Mobile: xếp chồng, ảnh đại diện/logo căn giữa.

---

## 2. Trang “Chỉnh sửa hồ sơ” (dành cho người bán)

**Mục đích:** Cho phép người bán cập nhật thông tin tài khoản (họ tên, email, số điện thoại, ảnh đại diện) và thông tin cửa hàng (tên, logo, mô tả, địa chỉ, số điện thoại shop, loại hình, mã số thuế, giấy phép…). Trang này có nút “Lưu thay đổi” và nút “Đổi mật khẩu” (dẫn sang trang đổi mật khẩu).

> **Lưu ý:** Không bao gồm đổi mật khẩu trên trang này, chỉ có nút chuyển hướng.

### 2.1. Bố cục tổng thể

Tương tự trang “Hồ sơ người bán” nhưng toàn bộ thông tin đều ở dạng input/form có thể sửa. Chia hai cột:

| Cột          | Nội dung                                                                                                                      |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| **Cột trái** | Form thông tin tài khoản (ảnh đại diện, họ tên, email, số điện thoại)                                                         |
| **Cột phải** | Form thông tin cửa hàng (logo, tên shop, mô tả, địa chỉ, số điện thoại shop, loại hình, mã số thuế, file giấy phép, xác thực) |

Cuối trang (hoặc mỗi cột) có **nút “Lưu thay đổi”** và **nút “Đổi mật khẩu”** (dẫn đến trang đổi mật khẩu).

### 2.2. Chi tiết các trường chỉnh sửa

#### Cột trái – Thông tin tài khoản

- **Ảnh đại diện:** Hiển thị ảnh hiện tại, nút “Chọn ảnh” (upload file), hỗ trợ xóa.
- **Họ và tên:** Input text, bắt buộc.
- **Email:** Input email, bắt buộc.
- **Số điện thoại:** Input text, 10 chữ số, có thể để trống (nếu cho phép).

#### Cột phải – Thông tin cửa hàng

- **Logo:** Hiển thị logo hiện tại, nút “Chọn logo” (upload file).
- **Tên cửa hàng:** Input text, bắt buộc, tối đa 50 ký tự.
- **Mô tả:** Textarea, không bắt buộc.
- **Địa chỉ:** Gồm 4 trường (hoặc dùng cascade):
  - Tỉnh/Thành phố (dropdown hoặc input)
  - Quận/Huyện
  - Phường/Xã
  - Địa chỉ cụ thể (số nhà, đường)
- **Số điện thoại cửa hàng:** Input text, 10 chữ số, bắt buộc.
- **Loại hình cửa hàng:** Dropdown (1-Cá nhân, 2-Hộ kinh doanh, 3-Doanh nghiệp nhỏ).
- **Mã số thuế:** Input text, bắt buộc (unique).
- **Giấy phép kinh doanh (PDF):** Hiển thị file hiện tại (tên file), nút “Tải lên PDF mới” (hỗ trợ .pdf). Chỉ cho phép upload lại nếu cần.
- **Trạng thái xác thực pháp lý:** Chỉ hiển thị (readonly), không sửa được. Gửi yêu cầu xác thực có thể có nút riêng (không bắt buộc).

### 2.3. Xử lý cập nhật

- Khi nhấn “Lưu thay đổi”:
  - Validate client-side (họ tên, email, số điện thoại, tên shop, MST, số điện thoại shop).
  - Nếu có file ảnh hoặc PDF mới, upload lên server trước (dùng FormData).
  - Gọi API `PUT /api/seller/profile` với toàn bộ dữ liệu (cả user và shop).
  - Thành công: Hiển thị toast “Cập nhật thành công” và chuyển về trang “Hồ sơ người bán”.
  - Thất bại: Hiển thị lỗi, giữ nguyên dữ liệu đã nhập.
- **Nút “Đổi mật khẩu”:** Chuyển hướng đến trang `/doi-mat-khau` (dùng chung).

### 2.4. Responsive

- Trên mobile, hai cột xếp chồng (form thông tin cá nhân trước, form shop sau).
- Các input full width, nút bấm full width.

---

## 3. Trang “Đổi mật khẩu” (dùng chung với khách hàng)

**Kế hoạch đã được mô tả trong phần trước (trang đổi mật khẩu cho khách hàng).**  
Áp dụng tương tự cho người bán, chỉ khác endpoint API (có thể dùng chung `/api/user/change-password` vì cùng bảng `NguoiDung`).

### 3.1. Tóm tắt lại (để đảm bảo đồng bộ):

- Form một cột, căn giữa, chiều rộng tối đa 500px.
- Các trường: Mật khẩu cũ, Mật khẩu mới, Xác nhận mật khẩu mới.
- Validation real-time (mật khẩu mới đủ mạnh, khớp xác nhận).
- Nút “Đổi mật khẩu” và “Hủy” (quay lại trang hồ sơ).
- Khi thành công: Hiển thị thông báo, đăng xuất người dùng và chuyển về trang đăng nhập (vì mật khẩu thay đổi cần đăng nhập lại).

---

## 4. Các điểm chung cho cả 2 trang (Hồ sơ và Chỉnh sửa)

- **Xác thực:** Yêu cầu người dùng đã đăng nhập và có vai trò Seller (người bán). Nếu không, chuyển hướng về trang chủ hoặc thông báo lỗi.
- **Loading:** Hiển thị skeleton khi gọi API lấy dữ liệu.
- **Thông báo:** Dùng toast cho các thao tác thành công/thất bại.
- **Điều hướng:** Sử dụng React Router, sau khi lưu thành công thường quay lại trang “Hồ sơ người bán”.

---

## 5. Tóm tắt các thành phần chính

### Trang “Hồ sơ người bán” (xem)

- [x] Cột trái: Ảnh đại diện, họ tên, tên đăng nhập, email, số điện thoại, ngày tham gia.
- [x] Cột phải: Logo, tên shop, mô tả, địa chỉ (ghép chuỗi), số điện thoại shop, loại hình, mã số thuế, trạng thái xác thực, ngày tạo shop.
- [x] Nút “Chỉnh sửa hồ sơ”, nút “Đổi mật khẩu”.
- [x] Responsive 2 cột → 1 cột.

### Trang “Chỉnh sửa hồ sơ” (người bán)

- [x] Cột trái: Form thông tin tài khoản (ảnh, họ tên, email, số điện thoại).
- [x] Cột phải: Form thông tin cửa hàng (logo, tên shop, mô tả, địa chỉ cascade, số điện thoại shop, loại hình, mã số thuế, upload PDF giấy phép).
- [x] Nút “Lưu thay đổi” và “Đổi mật khẩu” (chuyển hướng).
- [x] Xử lý upload file (ảnh, logo, PDF).
- [x] Responsive.

### Trang “Đổi mật khẩu” (dùng chung)

- [x] Form mật khẩu cũ, mới, xác nhận.
- [x] Validation, loading, xử lý thành công (đăng xuất).

---

## 6. Lưu ý đặc biệt từ database

- Bảng `CuaHang` có các trường quan trọng: `NguoiBanId` (liên kết 1-1 với `NguoiDung`), `DaXacThucPhapLy` (0/1), `PdfGiayPhep` (đường dẫn file). Khi chỉnh sửa, người bán có thể upload lại giấy phép, nhưng việc xác thực lại có thể cần admin duyệt – tuỳ logic.
- `LoaiHinhCuaHang` là TINYINT (1,2,3). Hiển thị text tương ứng.
- `MaSoThue` là unique, cần kiểm tra trùng lặp khi cập nhật.
- Ảnh đại diện và logo lưu đường dẫn (VARCHAR(MAX)), khi upload cần lưu file vào thư mục và trả về URL.

---

Kế hoạch này cung cấp đầy đủ mô tả để thiết kế ba trang hồ sơ và chỉnh sửa cho người bán, bám sát database, có responsive và tương tác rõ ràng.
```
