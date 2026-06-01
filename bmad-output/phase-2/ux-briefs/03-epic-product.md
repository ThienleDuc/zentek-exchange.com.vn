# Epic 3: Product Management (UX/UI Brief)

## 1. Tổng quan

Quản lý Sản phẩm (Product Management) là giao diện dành cho Admin để kiểm duyệt, quản lý và theo dõi toàn bộ sản phẩm trên hệ thống. Mục tiêu là đảm bảo các sản phẩm tuân thủ quy định và chất lượng của nền tảng trước và trong khi hiển thị cho người dùng mua sắm.

## 2. Đối tượng sử dụng

- **Admin / Kiểm duyệt viên**: Xét duyệt sản phẩm mới, kiểm tra sản phẩm bị báo cáo, gỡ bài vi phạm và theo dõi thống kê tổng quan về dữ liệu sản phẩm.

## 3. Các thành phần giao diện chính

### 3.1. Khu vực Thống kê (Dashboards / Charts)

_(Lưu ý: Tất cả các biểu đồ thống kê dưới đây đều tự động cập nhật dữ liệu dựa trên tiêu chí "Khoảng ngày" ở phần Bộ lọc. Nếu không chọn, hệ thống mặc định hiển thị dữ liệu của toàn bộ thời gian)_

- **Biểu đồ cột (Bar chart) Tổng quan số lượng**: Thể hiện số liệu Tổng số sản phẩm, Số sản phẩm đang chờ duyệt, Số sản phẩm vi phạm bị gỡ. (Thay thế cho các Thẻ thông tin nhanh).
- **Biểu đồ tròn (Pie chart) Trạng thái sản phẩm**: Thể hiện tỷ lệ sản phẩm phân bổ theo các trạng thái: Chờ phê duyệt, Đã duyệt, Đã từ chối, Đã gỡ.
- **Biểu đồ đường (Line chart) Thống kê tăng trưởng**: Thể hiện xu hướng và số lượng sản phẩm đăng mới biến động theo từng ngày.

### 3.2. Bộ lọc và Tìm kiếm (Filter & Search)

Cho phép Admin nhanh chóng khoanh vùng danh sách sản phẩm cần xử lý với các tùy chọn:

- **Trạng thái duyệt**: Dropdown chọn (Tất cả, Chờ phê duyệt, Đã duyệt, Đã từ chối, Đã gỡ).
- **Khoảng ngày**: Date picker chọn từ ngày - đến ngày (theo Ngày đăng hoặc Ngày duyệt).
- **Tên cửa hàng**: Input autocomplete hoặc search tìm theo tên Cửa hàng/Người bán.
- **Danh mục**: Dropdown cây danh mục (chọn danh mục cha/con).
- **Tình trạng**: Dropdown chọn (Tất cả, Mới, Cũ).
- **Tìm kiếm từ khóa**: Tìm theo Tên sản phẩm, Mã sản phẩm.

### 3.3. Bảng Danh sách Sản phẩm (Data Table)

Bảng dữ liệu hiển thị thông tin sản phẩm trực quan, bao gồm các cột:

- **Sản phẩm**: Hình ảnh thu nhỏ (Thumbnail), Tên sản phẩm.
- **Cửa hàng**: Tên cửa hàng đăng bán.
- **Phân loại**: Tên Danh mục & Tình trạng (Mới/Cũ).
- **Giá & Số lượng**: Giá bán, Kho, Đã bán.
- **Ngày đăng**: Thời gian hệ thống nhận bài đăng.
- **Trạng thái**: Badge màu sắc (Vàng: Chờ phê duyệt, Xanh: Đã duyệt, Đỏ: Đã từ chối/Đã gỡ).
- **Hành động (Action)**:
  - **Sản phẩm chờ duyệt**: Nút **[Phê duyệt]** và **[Từ chối]**.
  - **Sản phẩm đã duyệt**: Nút **[Gỡ bài]** (Dùng khi phát hiện vi phạm/bị report).
  - Nút **[Xem chi tiết]** (Icon mắt) khi click sẽ chuyển hướng sang một **Trang mới** để xem chi tiết sản phẩm.
- **Phân trang (Pagination)**: Hỗ trợ thanh phân trang ở cuối bảng (bao gồm chọn số dòng trên một trang, số trang hiện tại, tổng số trang và nút chuyển trang Next/Prev) để tối ưu hiển thị khi danh sách quá dài.

### 3.4. Trang Chi tiết Sản phẩm (Product Detail Page)

Thay vì dùng Modal, khi bấm xem chi tiết Admin sẽ được dẫn đến một trang riêng biệt chứa toàn bộ thông tin về sản phẩm.

**3.4.1. Trạng thái và Thời gian:**

- Ngày đăng, Ngày sửa.
- Trạng thái duyệt hiện tại.
- Ngày duyệt.
  _(Lưu ý: Các trường ngày tháng nếu chưa có dữ liệu - null - thì hiển thị "---")_

**3.4.2. Hình ảnh Sản phẩm (Image Gallery):**

- **Ảnh chính**: Hiển thị kích thước to nhất ở vị trí nổi bật.
- **Danh sách Ảnh phụ**: Hiển thị dạng thanh trượt (carousel) ngay bên dưới ảnh chính.
  - Có mũi tên tiến/lùi (Next/Prev) để lướt xem nếu danh sách ảnh dài vượt qua không gian hiển thị.
  - Khi click vào một ảnh phụ bất kỳ, frontend sẽ tự động hoán đổi đưa ảnh đó lên vị trí ảnh chính (chỉ thao tác hiển thị trên frontend, không ảnh hưởng đến dữ liệu lưu trữ dưới backend).

**3.4.3. Thông tin cốt lõi của Sản phẩm:**

- Tiêu đề sản phẩm.
- Tình trạng (Mới/Cũ).
- Phân loại chi tiết (Các thuộc tính phân loại lấy từ bảng PhanLoai).
- Giá bán, Số lượng tồn kho, Số lượng đã bán.
- Mô tả sản phẩm

**3.4.4. Thống kê Tương tác (Sử dụng Icon trực quan):**

- 👁️ Lượt xem.
- ⭐ Điểm đánh giá (Trung bình).
- 🛒 Số lượng đang nằm trong giỏ hàng.

**3.4.5. Thông tin Cửa hàng (Shop Info):**

- Hiển thị thông tin cơ bản: Logo, Tên cửa hàng, Địa chỉ cụ thể, Loại hình cửa hàng (Cá nhân, Hộ kinh doanh, Doanh nghiệp).

**3.4.6. Danh sách Đánh giá Sản phẩm (Reviews):**
Hiển thị các đánh giá thực tế từ người mua, bao gồm:

- Thông tin người mua (Ảnh đại diện, Tên).
- Ngày tạo đánh giá, Số sao đánh giá (1-5 sao).
- Nội dung văn bản đánh giá.
- Media đi kèm (nếu có): Ảnh phản hồi, Đường dẫn Video.
- Phản hồi từ Người bán (nếu có): Nội dung trả lời và Ngày trả lời.

_(Trang chi tiết cũng cần tích hợp các nút hành động: Duyệt / Từ chối / Gỡ bài để Admin có thể đưa ra quyết định xử lý ngay lập tức sau khi kiểm tra xong mọi thông tin)_

## 4. Ánh xạ với User Stories & Database

- **User Stories**: Hỗ trợ MOD-01, MOD-02, MOD-03 (Duyệt/Từ chối sản phẩm) và MOD-04 (Gỡ bài vi phạm).
- **Database**: Sử dụng các trường `TrangThaiDuyet` (Chờ phê duyệt, Đã duyệt, Đã từ chối, Đã gỡ) và `TinhTrang` (Mới, Cũ) trong bảng `SanPham` để làm bộ lọc.

----------------------Phân tách----------------------------------

# 📄 Kế hoạch thiết kế phần nội dung trang Home – ZenTekExchange

> **Phạm vi:** Chỉ phần thân trang home (main content), không bao gồm header, footer, danh mục (đã có component layout riêng).  
> **Mục tiêu:** Mô tả chi tiết cách bố trí, các thành phần, nguồn dữ liệu từ database, cơ chế phân trang và responsive grid.  
> **Hình thức:** Thuần mô tả, không có code.

---

## 1. Bố cục tổng thể của phần nội dung

Phần nội dung được đặt trong một vùng container có căn lề giữa, chiều rộng tối đa và padding ngang. Gồm hai khối chính xếp chồng theo chiều dọc, mỗi khối cách nhau một khoảng nhất định:

- **Khối “Sản phẩm bán chạy nhất”** (phía trên)
- **Khối “Sản phẩm mới nhất”** (phía dưới)

Mỗi khối có:

- Một tiêu đề lớn (ví dụ: “🔥 Bán chạy nhất” / “✨ Mới nhất”)
- Một lưới (grid) hiển thị danh sách sản phẩm
- Một nút hoặc thanh điều khiển phân trang (xem thêm / số trang)

Không có sidebar lọc hay banner quảng cáo trong phần nội dung này.

---

## 2. Grid sản phẩm – Thay đổi theo kích thước màn hình

Lưới sản phẩm được xây dựng dạng **grid**, số cột thay đổi linh hoạt nhờ cơ chế responsive (Tailwind CSS hoặc CSS thuần). Cụ thể:

- Trên màn hình **điện thoại** (dưới 640px): hiển thị **2 cột**, khoảng cách giữa các sản phẩm nhỏ.
- Trên màn hình **điện thoại lớn / tablet nhỏ** (640px – 768px): hiển thị **3 cột**.
- Trên màn hình **tablet** (768px – 1024px): hiển thị **4 cột**.
- Trên màn hình **desktop nhỏ** (1024px – 1280px): hiển thị **5 cột**.
- Trên màn hình **desktop lớn** (≥1280px): hiển thị **6 cột**.

Khoảng cách giữa các ô sản phẩm (gap) cũng tăng dần theo kích thước màn hình: từ 8px lên 20px.

Mỗi sản phẩm trong lưới chiếm một ô, có chiều rộng tự động theo cột.

---

## 3. Cấu trúc chi tiết của một card sản phẩm

Mỗi card sản phẩm được thiết kế dạng khối chữ nhật, có viền bo góc nhẹ, đổ bóng, và hiệu ứng khi rê chuột. Card bao gồm các phần sau (từ trên xuống dưới):

### 3.1. Vùng ảnh

- Ảnh đại diện của sản phẩm, lấy từ bảng **AnhSanPham**, ưu tiên ảnh có cờ `LaAnhChinh = 1`, nếu không có thì lấy ảnh đầu tiên.
- Ảnh có tỷ lệ 1:1 (vuông), hiển thị vừa khung, dạng `cover` (cắt để lấp đầy).
- Phía trên ảnh (góc trái) có một badge nhỏ hiển thị **tình trạng** (`Mới` hoặc `Cũ`) lấy từ cột `TinhTrang` của bảng **SanPham**. Badge có màu nền xanh cho “Mới”, cam cho “Cũ”.
- Nếu sản phẩm **hết hàng** (`DaHetHang = 1` hoặc `SoLuong <= 0`), một lớp phủ mờ trong suốt phủ lên ảnh, kèm dòng chữ “Hết hàng” màu trắng trên nền đỏ, đặt chính giữa vùng ảnh.

### 3.2. Vùng thông tin

- **Tiêu đề sản phẩm:** lấy từ cột `TieuDe` của bảng **SanPham**, giới hạn tối đa 2 dòng, chữ đậm vừa. Nếu dài quá sẽ cắt và thêm dấu ba chấm.
- **Giá bán:** lấy từ cột `Gia` (DECIMAL), hiển thị dưới dạng số có dấu phân cách hàng nghìn, kèm đơn vị “₫”. Giá được tô màu đỏ hoặc cam đậm, cỡ chữ lớn hơn bình thường.
- **Đã bán:** lấy từ cột `SoLuongDaBan` của bảng **SanPham**, định dạng “Đã bán 123”.

### 3.3. Vùng hành động

- Toàn bộ card sản phẩm (bao gồm ảnh, tiêu đề, giá, số lượng đã bán) đóng vai trò là một liên kết duy nhất.
- Khi người dùng di chuột (hover) vào card, card có hiệu ứng nổi lên: đổ bóng lớn hơn, phóng to nhẹ (scale), tạo cảm giác có thể tương tác.
- Click vào bất kỳ đâu trên card sẽ điều hướng đến trang chi tiết sản phẩm, sử dụng `MaSanPham` để xác định sản phẩm.
- Không hiển thị nút “Thêm vào giỏ” hay bất kỳ nút hành động nào khác trên card.

> **Lưu ý về phân loại:** Trên card chỉ thể hiện giá thấp nhất (hoặc giá gốc) và không hiển thị các tùy chọn phân loại. Khi người dùng muốn mua sẽ được hướng dẫn chọn phân loại trong một modal riêng.

---

```markdown
## 4. Dữ liệu cho từng khối sản phẩm

### 4.1. Khối “Sản phẩm bán chạy nhất”

- **Nguồn:** Bảng **SanPham**, kết hợp với **CuaHang**, **NguoiDung**, **AnhSanPham**, **DanhGiaSanPham**.
- **Điều kiện lọc:**
  - `SanPham.TrangThaiDuyet = N'Đã duyệt'`
  - `SanPham.TrangThaiHienThi = 1`
  - `SanPham.DaHetHang = 0` (sản phẩm còn hàng)
  - `CuaHang.TrangThai = 1` (cửa hàng đang hoạt động)
  - `NguoiDung.DaXoa = 0` (người bán chưa bị khóa)
- **Sắp xếp:** Theo `SanPham.SoLuongDaBan` giảm dần (sản phẩm bán chạy nhất lên đầu).
- **Phân trang:** Mỗi lần tải 20 sản phẩm. Hỗ trợ cơ chế **offset** và **limit** (tức là lấy từ vị trí thứ offset, số lượng limit). Tổng số sản phẩm có thể lớn, do đó chỉ tải dần khi người dùng yêu cầu.

### 4.2. Khối “Sản phẩm mới nhất”

- **Nguồn:** Tương tự khối bán chạy.
- **Điều kiện lọc:** Giống trên (sản phẩm được duyệt, đang hiển thị, còn hàng, cửa hàng hoạt động, người bán chưa bị khóa).
- **Sắp xếp:** Theo `SanPham.NgayDang` giảm dần (sản phẩm mới đăng lên trước).
- **Phân trang:** Cũng dùng offset/limit, mỗi lần 20 sản phẩm.
```

---

## 5. Cơ chế phân trang (Limit / Offset)

Mỗi khối sản phẩm hoạt động độc lập với nhau, có trạng thái riêng:

- **Lần đầu khi vào trang:** Mỗi khối tự động tải 20 sản phẩm đầu tiên (offset = 0).
- **Dưới mỗi grid** có một nút hoặc vùng điều khiển. Thiết kế đề xuất dùng nút **“Xem thêm”** (dạng text hoặc button) để tải thêm sản phẩm.
- Khi nhấn “Xem thêm”:
  - Tăng offset lên một lượng bằng limit (ví dụ từ 0 lên 20, 40,…).
  - Gọi lại API với offset mới.
  - Dữ liệu mới được nối tiếp vào danh sách hiện tại (không thay thế).
  - Nếu số sản phẩm trả về ít hơn limit, tức là đã hết dữ liệu, nút “Xem thêm” sẽ bị ẩn hoặc chuyển thành “Đã hết sản phẩm” và vô hiệu hóa.
- Trong quá trình tải thêm, hiển thị hiệu ứng **skeleton** (các ô xám nhấp nháy) đúng bằng số lượng limit để tránh bố cục bị xô lệch.
- Nếu có lỗi mạng hoặc API lỗi, hiển thị thông báo lỗi và cho phép thử lại.

> **Không dùng phân trang dạng số trang** (1,2,3…) trong kế hoạch này để tập trung vào trải nghiệm infinite scroll dạng có nút “Xem thêm”, vì phù hợp với trang home hơn. Tuy vậy, cơ chế offset/limit vẫn hoàn toàn tương thích với phân trang số nếu sau này thay đổi.

---

## 6. Tương tác và trạng thái (mô tả hành vi)

- **Khởi tạo:** Khi người dùng mở trang home, cả hai khối đều hiển thị trạng thái loading (skeleton) cho 20 sản phẩm đầu, sau đó thay bằng dữ liệu thật.
- **Hover vào card:** Toàn bộ card sản phẩm có hiệu ứng nổi lên (đổ bóng lớn hơn, scale nhẹ) báo hiệu có thể click. Trên thiết bị cảm ứng thì không có hover mà vẫn giữ trạng thái bình thường.
- **Click vào card:** Click bất kỳ đâu trên card sẽ điều hướng đến trang chi tiết sản phẩm (dùng `MaSanPham`).
- **Hết hàng:** Sản phẩm có `DaHetHang = 1` vẫn hiển thị bình thường trong danh sách (không có lớp phủ, không badge), nhưng khi click vào card vẫn vào trang chi tiết (người dùng sẽ thấy hết hàng ở đó). Không có nút “Thêm vào giỏ” trên card.

## 7. Thích ứng với di động (mobile)

- Trên màn hình nhỏ, grid chỉ có 2 cột, card được thu nhỏ font chữ, padding giảm.
- Nút “Xem thêm” được làm lớn hơn một chút để dễ bấm bằng ngón tay.
- Khoảng cách giữa các card được giảm xuống để tối ưu không gian.
- Không có hành vi hover (thay bằng active state khi nhấn giữ). Toàn bộ card vẫn là vùng click để xem chi tiết.

Trên màn hình rất rộng (≥1280px), grid 6 cột giúp tận dụng không gian, card có kích thước vừa phải, nội dung không bị dãn quá mức.

## 8. Tóm tắt các thành phần chính (text checklist)

- **Khối “Sản phẩm bán chạy nhất”**
  - Tiêu đề
  - Grid responsive 2-6 cột
  - Danh sách card sản phẩm (mỗi card chỉ gồm: ảnh đại diện, tiêu đề, giá bán, số lượng đã bán)
  - Toàn bộ card là link đến trang chi tiết, hover có hiệu ứng nổi
  - Nút “Xem thêm” dưới grid + skeleton loading
- **Khối “Sản phẩm mới nhất”** (tương tự)

**Các yếu tố không có trong phần nội dung này:** Header, footer, danh mục sản phẩm (đã có layout riêng), sidebar lọc, banner quảng cáo, nút thêm vào giỏ, đánh giá sao, tên cửa hàng, badge tình trạng.

---

Kế hoạch này cung cấp đầy đủ mô tả để một nhà phát triển có thể hiểu và triển khai phần nội dung trang home của ZenTekExchange, bám sát cấu trúc database đã cho, có responsive và phân trang dạng offset/limit, với card sản phẩm tối giản chỉ gồm tiêu đề, giá, số lượng đã bán và toàn bộ card là link đến trang chi tiết.
