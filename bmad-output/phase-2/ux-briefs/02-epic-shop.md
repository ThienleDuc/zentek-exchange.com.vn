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

------------phân tách----------------

# Kế hoạch thiết kế trang “Khám phá cửa hàng” – ZenTekExchange

> **Phạm vi:** Chỉ phần thân trang (main content), không bao gồm header, footer, danh mục (đã có component layout riêng).  
> **Đối tượng:** Khách hàng (người mua).  
> **Kỹ thuật:** ReactJS, TailwindCSS, responsive.  
> **Dữ liệu:** Bám sát database `ZenTekExchange` – các bảng `CuaHang`, `NguoiDung`, `SanPham`, `DanhGiaSanPham`, `DonHang`, `ChiTietDonHang`.

---

## 1. Mục đích và bố cục tổng thể

**Mục đích:** Cho phép khách hàng khám phá các cửa hàng đang hoạt động trên sàn, xem thông tin cơ bản, tìm kiếm theo tên, lọc theo danh mục hoặc đánh giá, sắp xếp, và đi đến trang riêng của từng cửa hàng.

**Bố cục:** Chia làm hai vùng chính (desktop):

| Vùng             | Nội dung                                                                    | Độ rộng (desktop)        |
| ---------------- | --------------------------------------------------------------------------- | ------------------------ |
| **Sidebar trái** | Bộ lọc cửa hàng (danh mục kinh doanh, đánh giá, vị trí, loại hình)          | 280px (cố định)          |
| **Vùng phải**    | Thanh công cụ (tìm kiếm, sắp xếp), danh sách cửa hàng dạng grid, phân trang | Phần còn lại (flex-grow) |

- Trên mobile (<1024px): Sidebar ẩn, thay bằng nút “Bộ lọc” mở modal/drawer.
- Trên tablet (768-1024px): Có thể thu gọn sidebar hoặc chuyển thành drawer.

---

## 2. Dữ liệu hiển thị – Nguồn từ database

### 2.1. Bảng và các trường cần lấy cho mỗi cửa hàng

- **Bảng `CuaHang`**:
  - `MaCuaHang`, `TenCuaHang`, `Logo`, `MoTa`, `DiaChi`, `PhuongXa`, `QuanHuyen`, `TinhThanh`, `SoDienThoai`, `LoaiHinhCuaHang`, `NgayTao`, `TrangThai`, `DaXacThucPhapLy`
- **Bảng `NguoiDung`**: (qua `NguoiBanId`) – lấy `HoTen` (chủ shop), `NgayTao` (ngày tham gia)
- **Thống kê từ các bảng khác**:
  - **Số sản phẩm đang bán**: `COUNT(SanPham.MaSanPham)` với điều kiện `SanPham.TrangThaiDuyet = N'Đã duyệt'`, `SanPham.TrangThaiHienThi = 1`, `SanPham.DaHetHang = 0` (hoặc tính cả hết hàng)
  - **Đánh giá trung bình của cửa hàng**: `AVG(DanhGiaSanPham.SoSao)` cho các sản phẩm thuộc cửa hàng (hoặc có thể lấy từ bảng đánh giá cửa hàng nếu có; nếu không, tính trung bình từ đánh giá sản phẩm)
  - **Tổng số đánh giá của cửa hàng**: `COUNT(DanhGiaSanPham.MaDanhGia)`
  - **Số lượng đã bán (tổng)**: `SUM(ChiTietDonHang.SoLuong)` từ các đơn hàng đã hoàn thành (`DonHang.TrangThaiDon = N'Đã nhận'`) và sản phẩm thuộc cửa hàng

### 2.2. Điều kiện lọc cửa hàng

- **Chỉ hiển thị cửa hàng đang hoạt động**: `CuaHang.TrangThai = 1`
- **Người bán chưa bị khóa**: `NguoiDung.DaXoa = 0` (JOIN qua `NguoiBanId`)
- Các điều kiện khác từ bộ lọc: theo tên, danh mục sản phẩm của shop (cần JOIN với `SanPham.DanhMucId`), đánh giá, tỉnh/thành, loại hình.

### 2.3. Sắp xếp

- **Mặc định:** Theo số lượng sản phẩm bán chạy (tổng `SoLuongDaBan` giảm dần) hoặc theo đánh giá trung bình.
- **Các tùy chọn:** Tên cửa hàng A-Z, Ngày tham gia (mới nhất), Đánh giá cao nhất, Sản phẩm bán chạy nhất, Số lượng sản phẩm.

### 2.4. Phân trang

- Mỗi trang hiển thị **12 cửa hàng** (dạng grid, 3-4 cột trên desktop).
- Dùng `offset` và `limit`.

---

## 3. Cấu trúc chi tiết từng phần

### 3.1. Sidebar bộ lọc (cột trái)

- **Tiêu đề:** “Lọc cửa hàng” + nút “Đặt lại” (xóa toàn bộ filter).
- **Các nhóm lọc:**

#### a. Danh mục kinh doanh

- Lấy danh sách danh mục cấp 1 từ `DanhMuc`.
- Checkbox để lọc các cửa hàng có ít nhất một sản phẩm thuộc danh mục đó (hoặc chuyên về danh mục đó).
- Có thể tìm kiếm trong danh mục.

#### b. Đánh giá cửa hàng

- Checkbox các mức: từ 5 sao, 4 sao trở lên, 3 sao trở lên.
- Hiển thị sao tương ứng.

#### c. Địa điểm (Tỉnh/Thành)

- Dropdown hoặc danh sách các tỉnh/thành có cửa hàng (lấy từ `CuaHang.TinhThanh`).
- Có thể chọn nhiều.

#### d. Loại hình cửa hàng

- Checkbox: Cá nhân, Hộ kinh doanh, Doanh nghiệp nhỏ.
- Tương ứng với `LoaiHinhCuaHang` (1,2,3).

#### e. Nút “Áp dụng bộ lọc”

- Gọi lại API với các filter đã chọn.

### 3.2. Vùng danh sách cửa hàng (cột phải)

#### a. Thanh công cụ

- **Ô tìm kiếm theo tên cửa hàng**: Input text, debounce, tìm kiếm theo `TenCuaHang`.
- **Số lượng cửa hàng tìm thấy:** Hiển thị “X cửa hàng”.
- **Sắp xếp:** Dropdown các lựa chọn (nêu ở 2.3).
- **Nút “Bộ lọc” (mobile):** Mở sidebar dạng drawer.

#### b. Grid cửa hàng

- Grid responsive:
  - Mobile (default): 1 cột (full width)
  - sm (640px): 2 cột
  - md (768px): 2-3 cột
  - lg (1024px): 3 cột
  - xl (1280px): 4 cột
- Mỗi **card cửa hàng** bao gồm:
  - **Logo:** Hình tròn hoặc vuông, kích thước 80x80 (desktop) / 60x60 (mobile). Nếu `Logo` null, dùng ảnh mặc định.
  - **Tên cửa hàng:** `TenCuaHang`, font đậm, cỡ lớn, có thể giới hạn 2 dòng.
  - **Đánh giá:** Hiển thị sao trung bình (làm tròn 0.5) + số lượng đánh giá.
  - **Số sản phẩm:** Ví dụ “123 sản phẩm”.
  - **Đã bán:** “Đã bán 1.234” (tổng số lượng từ các đơn đã nhận).
  - **Địa chỉ rút gọn:** `PhuongXa, QuanHuyen, TinhThanh` (có thể cắt).
  - **Badge xác thực:** Nếu `DaXacThucPhapLy = 1`, hiển thị icon “Đã xác thực” (màu xanh).
  - **Nút “Xem shop”:** Dẫn đến trang chi tiết cửa hàng (`/cua-hang/{MaCuaHang}`).
- Toàn bộ card (trừ nút) cũng có thể click để vào trang shop.

#### c. Phân trang

- Dưới cùng grid, hiển thị số trang, Previous/Next.
- Dùng phân trang số (page = offset/limit + 1).

### 3.3. Trạng thái đặc biệt

- **Không có cửa hàng nào:** Hiển thị thông báo “Không tìm thấy cửa hàng phù hợp” + gợi ý đặt lại bộ lọc.
- **Loading:** Skeleton card (các khối xám) với số lượng bằng `limit`.

---

## 4. Luồng dữ liệu và API

### 4.1. URL và query parameters

- Đường dẫn: `/cua-hang` hoặc `/stores`
- Query params: `page`, `limit`, `search` (tên shop), `sort`, `categoryIds`, `minRating`, `province`, `businessType`, `verified`
- Sử dụng `useSearchParams` để đồng bộ.

### 4.2. API endpoint

- `GET /api/stores` với các params trên.
- Server trả về:
  ```json
  {
    "total": 50,
    "page": 1,
    "limit": 12,
    "totalPages": 5,
    "stores": [
      {
        "maCuaHang": "uuid",
        "tenCuaHang": "...",
        "logo": "url",
        "moTa": "...",
        "soSanPham": 45,
        "soLuongDaBan": 1234,
        "diemDanhGia": 4.5,
        "soLuongDanhGia": 89,
        "diaChiNgan": "Phường A, Quận B, TP C",
        "tinhThanh": "TP Hồ Chí Minh",
        "loaiHinh": 1,
        "daXacThucPhapLy": true,
        "ngayTao": "2024-01-01"
      }
    ]
  }
  ```

# Kế hoạch thiết kế trang “Cửa hàng” (Xem cửa hàng + sản phẩm) – ZenTekExchange

> **Phạm vi:** Chỉ phần thân trang (main content), không bao gồm header, footer, danh mục (đã có component layout riêng).  
> **Đối tượng:** Khách hàng (người mua) xem một cửa hàng cụ thể.  
> **Kỹ thuật:** ReactJS, TailwindCSS, responsive.  
> **Dữ liệu:** Bám sát database `ZenTekExchange` – các bảng `CuaHang`, `NguoiDung`, `SanPham`, `AnhSanPham`, `DanhMuc`, `DanhGiaSanPham`, `DonHang`, `ChiTietDonHang`.

---

## 1. Mục đích và bố cục tổng thể

**Mục đích:** Hiển thị thông tin chi tiết của một cửa hàng (logo, tên, mô tả, đánh giá, thống kê, v.v.) và danh sách sản phẩm của cửa hàng đó, kèm theo bộ lọc danh mục (các danh mục mà cửa hàng có sản phẩm), sắp xếp và phân trang.

**Bố cục:** Một cột duy nhất, chia thành các vùng:

| Vùng                 | Nội dung                                                                       |
| -------------------- | ------------------------------------------------------------------------------ |
| **Header cửa hàng**  | Thông tin cửa hàng (logo, tên, mô tả, đánh giá, chỉ số, nút theo dõi – nếu có) |
| **Thanh điều hướng** | Các tab hoặc bộ lọc danh mục (sản phẩm theo danh mục)                          |
| **Thanh công cụ**    | Sắp xếp, số lượng sản phẩm, view toggle (grid/list – tùy chọn)                 |
| **Grid sản phẩm**    | Danh sách sản phẩm của cửa hàng (dạng card)                                    |
| **Phân trang**       | Dưới cùng                                                                      |

Trên mobile, các thành phần này xếp dọc, có thể có nút mở bộ lọc danh mục dạng drawer.

> **Lưu ý:** Không có sidebar riêng, bộ lọc danh mục được hiển thị dưới dạng các tab/nút ngang hoặc dropdown.

---

## 2. Dữ liệu hiển thị – Nguồn từ database

### 2.1. Thông tin cửa hàng (header)

- **Bảng `CuaHang`**:
  - `MaCuaHang`, `TenCuaHang`, `Logo`, `MoTa`, `DiaChi`, `PhuongXa`, `QuanHuyen`, `TinhThanh`, `SoDienThoai`, `LoaiHinhCuaHang`, `NgayTao`, `DaXacThucPhapLy`
- **Bảng `NguoiDung`** (chủ shop): `HoTen`
- **Các chỉ số thống kê:**
  - **Tổng sản phẩm:** `COUNT(SanPham.MaSanPham)` với `TrangThaiDuyet = N'Đã duyệt'`, `TrangThaiHienThi = 1`
  - **Đánh giá trung bình:** `AVG(DanhGiaSanPham.SoSao)` cho tất cả sản phẩm của shop (hoặc trung bình có trọng số)
  - **Số lượng đánh giá:** `COUNT(DanhGiaSanPham.MaDanhGia)`
  - **Tổng số đã bán:** `SUM(ChiTietDonHang.SoLuong)` với `DonHang.TrangThaiDon = N'Đã nhận'` và sản phẩm thuộc shop
- **Nút “Theo dõi cửa hàng”** (tùy chọn – có thể phát triển sau, cần bảng `TheoDoiCuaHang`).

### 2.2. Danh sách sản phẩm của cửa hàng

- **Bảng `SanPham`** với điều kiện:
  - `CuaHangId = {maCuaHang}`
  - `TrangThaiDuyet = N'Đã duyệt'`
  - `TrangThaiHienThi = 1`
- **Kết hợp với:** `AnhSanPham` (ảnh chính), `DanhMuc` (tên danh mục), `DanhGiaSanPham` (điểm TB, số lượng)
- **Lọc theo danh mục:** Nếu chọn danh mục, thêm điều kiện `SanPham.DanhMucId IN (danh mục đã chọn + danh mục con)`.
- **Sắp xếp:**
  - Mặc định: Mới nhất (`NgayDang DESC`)
  - Giá thấp đến cao, giá cao đến thấp
  - Bán chạy nhất (`SoLuongDaBan DESC`)
  - Đánh giá cao nhất (`DiemDanhGia DESC`)
- **Phân trang:** Mỗi lần 12 hoặc 20 sản phẩm, dùng offset/limit.

### 2.3. Danh sách danh mục (để lọc)

- Lấy các `DanhMuc` có ít nhất một sản phẩm đang bán của cửa hàng.
- Có thể hiển thị dạng tab, dropdown hoặc danh sách ngang.

---

## 3. Cấu trúc chi tiết từng phần

### 3.1. Header cửa hàng

Bố trí dạng flex (ảnh bên trái, thông tin bên phải) – trên mobile xếp dọc.

- **Logo:** Hình tròn hoặc vuông, kích thước 120x120 (desktop) / 80x80 (mobile). Nếu `Logo` null, dùng placeholder.
- **Thông tin:**
  - **Tên cửa hàng:** `TenCuaHang`, font lớn, đậm.
  - **Badge xác thực:** Nếu `DaXacThucPhapLy = 1`, hiển thị icon “Đã xác thực” màu xanh.
  - **Mô tả:** `MoTa`, giới hạn 2-3 dòng, có thể mở rộng.
  - **Đánh giá:** Hiển thị sao trung bình (to), số lượng đánh giá.
  - **Đã bán:** Tổng số đã bán (định dạng).
  - **Số sản phẩm:** Tổng sản phẩm đang bán.
  - **Địa chỉ:** `DiaChi, PhuongXa, QuanHuyen, TinhThanh` (hiển thị đầy đủ hoặc rút gọn).
  - **Số điện thoại:** `SoDienThoai` (có thể liên hệ).
  - **Ngày tham gia:** `NgayTao` (định dạng dd/mm/yyyy).
- **Nút hành động:**
  - Nút “Liên hệ người bán” (mở chat, tương tự các trang khác).
  - Nút “Theo dõi” (nếu có chức năng).

### 3.2. Bộ lọc danh mục (thanh điều hướng)

- Hiển thị dạng các nút/tab cuộn ngang (overflow-auto).
- Các danh mục: “Tất cả” (mặc định) + các danh mục có sản phẩm.
- Khi chọn danh mục, reset page về 1, gọi lại API sản phẩm với `categoryId`.
- Trên mobile, có thể dùng dropdown thay vì tab ngang.

### 3.3. Thanh công cụ (sắp xếp)

- **Số lượng sản phẩm:** Hiển thị “X sản phẩm”.
- **Dropdown sắp xếp:** Các tùy chọn sắp xếp.
- **(Tùy chọn) Toggle hiển thị:** Grid / List (nếu có).

### 3.4. Grid sản phẩm

- **Card sản phẩm** (theo thiết kế đã thống nhất: ảnh, tiêu đề, giá, đã bán).
- Toàn bộ card là link đến trang chi tiết sản phẩm.
- Grid responsive: 2 cột (mobile) → 3 cột (tablet) → 4-5 cột (desktop).
- Nếu không có sản phẩm: Hiển thị “Cửa hàng chưa có sản phẩm nào trong danh mục này”.

### 3.5. Phân trang

- Dùng phân trang số (1,2,3…) hoặc “Xem thêm”. Đề xuất phân trang số cho rõ ràng.
- Hiển thị ở dưới grid.

---

## 4. Luồng dữ liệu và API

### 4.1. URL và tham số

- Đường dẫn: `/cua-hang/{maCuaHang}` hoặc `/store/{slug}`.
- Query params: `page`, `categoryId`, `sort`.

### 4.2. Các API cần gọi

- **Lấy thông tin cửa hàng:** `GET /api/stores/{storeId}`
- **Lấy danh sách danh mục (của shop):** `GET /api/stores/{storeId}/categories`
- **Lấy sản phẩm của shop:** `GET /api/stores/{storeId}/products?page=1&limit=12&categoryId=...&sort=...`

### 4.3. Xử lý khi tải trang

- Gọi đồng thời (Promise.all) các API: store info, categories, products (trang 1).
- Hiển thị skeleton cho header và grid sản phẩm.

### 4.4. Khi thay đổi danh mục hoặc sắp xếp

- Reset page về 1.
- Gọi lại API products với params mới.
- Cập nhật grid.

### 4.5. Phân trang

- Khi click vào trang mới, gọi API với `page` mới.
- Cuộc lên đầu grid (tùy chọn).

---

## 5. Tương tác và trạng thái

- **Khởi tạo:** Lấy `storeId` từ URL param. Gọi API.
- **Loading:** Skeleton cho header và grid.
- **Lỗi:** Nếu không tìm thấy cửa hàng (hoặc cửa hàng bị khóa), hiển thị thông báo “Cửa hàng không tồn tại hoặc đã đóng cửa” và nút quay về trang chủ.
- **Thay đổi bộ lọc:** Áp dụng ngay (debounce nếu cần).
- **Responsive:** Xử lý cuộn ngang cho danh mục, drawer cho mobile nếu cần.

---

## 6. Responsive chi tiết (TailwindCSS)

- **Desktop (≥1024px):** Header dạng flex (logo trái, thông tin phải). Grid 4-5 cột. Danh mục hiển thị ngang.
- **Tablet (768px – 1024px):** Header vẫn flex nhưng thu nhỏ logo. Grid 3 cột.
- **Mobile (<768px):** Header xếp dọc (logo trên, thông tin dưới, căn giữa). Grid 2 cột. Danh mục có thể chuyển thành dropdown hoặc cuộn ngang.

---

## 7. Tóm tắt các thành phần chính

- [x] **Header cửa hàng:** Logo, tên, badge xác thực, mô tả, đánh giá (sao + số lượng), đã bán, số sản phẩm, địa chỉ, số điện thoại, ngày tham gia, nút liên hệ.
- [x] **Bộ lọc danh mục:** Danh sách các danh mục (có sản phẩm), dạng tab hoặc dropdown, có mục “Tất cả”.
- [x] **Thanh công cụ:** Số sản phẩm, dropdown sắp xếp.
- [x] **Grid sản phẩm:** Card sản phẩm (ảnh, tiêu đề, giá, đã bán), link đến chi tiết.
- [x] **Phân trang:** Số trang, Previous/Next.
- [x] **Trạng thái:** Loading skeleton, không có sản phẩm, lỗi.
- [x] **Responsive:** Từ mobile lên desktop.

---

## 8. Lưu ý đặc biệt từ database

- Chỉ hiển thị sản phẩm đã được duyệt và đang hiển thị (`TrangThaiDuyet = N'Đã duyệt'`, `TrangThaiHienThi = 1`). Có thể lọc thêm sản phẩm còn hàng hoặc không tùy chiến lược.
- Để lọc sản phẩm theo danh mục, cần hỗ trợ lấy cả danh mục con: nếu chọn danh mục cha, tìm tất cả sản phẩm có `DanhMucId` trong cây con.
- Đánh giá trung bình của cửa hàng có thể tính từ `DanhGiaSanPham` (không hoàn toàn chính xác nếu muốn đánh giá riêng cửa hàng). Có thể tạm chấp nhận.
- Nút “Liên hệ người bán” cần dùng bảng `CuocTroChuyen` để tạo cuộc trò chuyện giữa khách và chủ shop.
- Trang này có thể được mở từ trang “Khám phá cửa hàng” hoặc từ kết quả tìm kiếm.

---

Kế hoạch này cung cấp đầy đủ mô tả để triển khai trang xem chi tiết cửa hàng, bao gồm thông tin cửa hàng và danh sách sản phẩm có bộ lọc danh mục, phân trang và responsive.
