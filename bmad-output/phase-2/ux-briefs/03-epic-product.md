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
