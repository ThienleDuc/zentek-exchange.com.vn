# Text-to-Prompt: Mô tả nghiệp vụ trang danh sách cửa hàng (ZenTekExchange)

Bạn hãy xây dựng **trang danh sách cửa hàng** cho website ZenTekExchange, cho phép người dùng xem, tìm kiếm, lọc và sắp xếp các cửa hàng đang hoạt động trên sàn. Trang này lấy dữ liệu từ bảng `CuaHang`, kết hợp với các bảng `NguoiDung` (chủ cửa hàng), `SanPham`, `DanhGiaSanPham` để hiển thị các chỉ số như số lượng sản phẩm, tổng số đã bán, đánh giá trung bình.

## 1. Các bảng dữ liệu liên quan

- **`CuaHang`**:
  - `MaCuaHang` (PK), `TenCuaHang`, `Logo`, `MoTa`, `DiaChi`, `PhuongXa`, `QuanHuyen`, `TinhThanh`, `SoDienThoai`, `LoaiHinhCuaHang` (1:Cá nhân, 2:Hộ kinh doanh, 3:Doanh nghiệp nhỏ), `MaSoThue`, `DaXacThucPhapLy`, `TrangThai` (1: hoạt động, 0: khóa), `NgayTao`.
- **`NguoiDung`** (chủ cửa hàng): `HoTen`, `AnhDaiDien`, … (liên kết qua `NguoiBanId` trong `CuaHang`).
- **`SanPham`**: dùng để tính `SoSanPham` (số sản phẩm đã duyệt và hiển thị của cửa hàng) và `SoLuongDaBan` (tổng số lượng đã bán từ tất cả sản phẩm của cửa hàng).
- **`DanhGiaSanPham`**: để tính điểm đánh giá trung bình của cửa hàng (trung bình `SoSao` của các đánh giá cho sản phẩm thuộc cửa hàng đó) và tổng số đánh giá.

**Điều kiện hiển thị cửa hàng:**

- `CuaHang.TrangThai = 1` (cửa hàng đang hoạt động, chưa bị khóa).
- Nên kiểm tra thêm `NguoiDung.DaXoa = 0` (người bán chưa bị xóa mềm).
- Chỉ hiển thị những cửa hàng có ít nhất một sản phẩm đã được duyệt (`SanPham.TrangThaiDuyet = N'Đã duyệt'` và `SanPham.TrangThaiHienThi = 1`) – hoặc vẫn hiển thị cửa hàng dù chưa có sản phẩm, nhưng cần thống nhất.

## 2. Các tiêu chí tìm kiếm, lọc và sắp xếp

Giao diện gồm thanh tìm kiếm theo tên cửa hàng, sidebar lọc (desktop) với các bộ lọc và dropdown sắp xếp.

| Tiêu chí              | Tham số URL    | Kiểu         | Mô tả                                                                                                                                     |
| --------------------- | -------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Từ khóa tìm kiếm      | `search`       | string       | Tìm kiếm theo `TenCuaHang` (có thể mở rộng sang `MoTa`).                                                                                  |
| Địa điểm (Tỉnh/Thành) | `province`     | string       | Lọc theo `TinhThanh`.                                                                                                                     |
| Loại hình             | `businessType` | string       | Lọc theo `LoaiHinhCuaHang` (hiển thị dạng text: Cá nhân, Hộ kinh doanh, Doanh nghiệp nhỏ).                                                |
| Xác thực pháp lý      | `verified`     | boolean      | Lọc những cửa hàng có `DaXacThucPhapLy = true`.                                                                                           |
| Đánh giá tối thiểu    | `minRating`    | number (1-5) | Lọc cửa hàng có điểm đánh giá trung bình >= `minRating`.                                                                                  |
| Sắp xếp               | `sort`         | string       | Các giá trị: `name_asc`, `name_desc`, `newest` (ngày tạo), `top_rated`, `best_seller` (tổng đã bán), `most_products` (số lượng sản phẩm). |
| Phân trang            | `page`         | number       | Bắt đầu từ 1, mỗi trang 12 cửa hàng (có thể cấu hình).                                                                                    |

## 3. API danh sách cửa hàng

**Endpoint:** `GET /api/stores`

**Query parameters:** tương ứng các tham số trên.

**Xử lý backend** (SQL / LINQ):

1. **Nguồn dữ liệu**: từ `CuaHang` join `NguoiDung` (lấy `HoTen`), tính toán các chỉ số:
   - `SoSanPham`: `COUNT(SanPham.MaSanPham)` với điều kiện `SanPham.TrangThaiDuyet = N'Đã duyệt'` và `SanPham.TrangThaiHienThi = 1`.
   - `SoLuongDaBan`: `SUM(SanPham.SoLuongDaBan)` (cột đã được duy trì sẵn trong bảng `SanPham` – nếu chưa có thì phải tính từ `ChiTietDonHang`).
   - `DiemDanhGia` (trung bình sao của cửa hàng): tính từ bảng `DanhGiaSanPham` thông qua `SanPham` của cửa hàng đó: `AVG(DanhGiaSanPham.SoSao)`. Nếu chưa có đánh giá nào thì mặc định 0.
   - `SoLuongDanhGia`: `COUNT(DanhGiaSanPham.MaDanhGia)`.

   Do các chỉ số này có thể tốn kém khi tính toán realtime, có thể cache hoặc lưu vào bảng `CuaHang` thêm các cột `SoSanPham`, `TongSoLuongDaBan`, `DiemDanhGiaTrungBinh`, `SoLuongDanhGia` và cập nhật định kỳ (trigger hoặc scheduled job). Trong prompt này, bạn có thể giả định các cột đó đã được tính sẵn hoặc tính động khi query.

2. **Điều kiện WHERE**:
   - `CuaHang.TrangThai = 1`.
   - Nếu có `search`: `CuaHang.TenCuaHang LIKE N'%' + @search + '%'`.
   - Nếu có `province`: `CuaHang.TinhThanh = @province`.
   - Nếu có `businessType`: `CuaHang.LoaiHinhCuaHang = @businessTypeId` (cần map từ tên loại hình sang số).
   - Nếu `verified = true`: `CuaHang.DaXacThucPhapLy = 1`.
   - Nếu `minRating > 0`: `DiemDanhGia >= @minRating`.

3. **Sắp xếp** theo `sort`:
   - `name_asc`: `TenCuaHang ASC`
   - `name_desc`: `TenCuaHang DESC`
   - `newest`: `NgayTao DESC`
   - `top_rated`: `DiemDanhGia DESC`
   - `best_seller`: `SoLuongDaBan DESC`
   - `most_products`: `SoSanPham DESC`

4. **Phân trang**: sử dụng `OFFSET (page-1)*limit ROWS FETCH NEXT limit ROWS ONLY`.

5. **Response mẫu**:

```json
{
  "data": [
    {
      "maCuaHang": "guid",
      "tenCuaHang": "TechPro Việt Nam",
      "logo": "https://...",
      "moTa": "Chuyên laptop chính hãng",
      "tinhThanh": "Hà Nội",
      "loaiHinh": 2,
      "loaiHinhTen": "Hộ kinh doanh",
      "daXacThucPhapLy": true,
      "soSanPham": 45,
      "soLuongDaBan": 1230,
      "diemDanhGia": 4.7,
      "soLuongDanhGia": 89,
      "ngayTao": "2024-01-15T...",
      "nguoiBanHoTen": "Nguyễn Văn A"
    }
  ],
  "total": 120,
  "page": 1,
  "limit": 12,
  "totalPages": 10
}
```

## 4. Giao diện frontend (tham khảo từ Stores.tsx)

### 4.1. Bố cục

- **Desktop**: Sidebar trái chứa các bộ lọc (Địa điểm, Loại hình, Xác thực, Đánh giá). Phần kết quả bên phải gồm: thanh tìm kiếm theo tên cửa hàng, bộ đếm kết quả, dropdown sắp xếp, grid các card cửa hàng, phân trang số.
- **Mobile**: Nút "Bộ lọc" mở drawer.

### 4.2. Card cửa hàng

Mỗi card hiển thị:

- Logo (nếu có, nếu không thì icon mặc định).
- Tên cửa hàng + biểu tượng xác thực (nếu `daXacThucPhapLy = true`).
- Đánh giá (sao, điểm số, số lượng đánh giá) – dùng component `renderStars`.
- Số sản phẩm (format k+), tổng đã bán (format k+, M).
- Địa điểm (Tỉnh/Thành).
- Click vào card → điều hướng đến trang chi tiết cửa hàng (`/cua-hang/{maCuaHang}`).

### 4.3. Đồng bộ URL

- Đọc `searchParams` khi khởi tạo để lấy các filter ban đầu.
- Mỗi khi filter thay đổi (người dùng chọn trên sidebar, gõ tìm kiếm, chọn sắp xếp, chuyển trang), cập nhật URL bằng `setSearchParams` (replace: true) và gọi lại API.
- Nút "Đặt lại" (Reset) sẽ xóa tất cả filter (giữ nguyên `search`? tùy UX, tốt nhất nên reset toàn bộ, kể cả từ khóa tìm kiếm).

### 4.4. Xử lý tải và lỗi

- Hiển thị skeleton loading khi gọi API (số skeleton = 12).
- Nếu không có kết quả, hiển thị thông báo và nút "Xóa bộ lọc".
- Nếu lỗi mạng: hiển thị thông báo lỗi và nút thử lại.

### 4.5. Phân trang

- Mỗi trang hiển thị 12 cửa hàng (`limit = 12`).
- Phân trang số, hiển thị tối đa 5 số, có nút Trước/Sau.
- Khi chuyển trang, cuộc lên đầu trang.

## 5. Các API bổ trợ

- `GET /api/stores/filters` (hoặc lấy dữ liệu động từ `CuaHang` để cung cấp danh sách các tỉnh thành, loại hình hiện có). Có thể lấy trực tiếp từ dữ liệu cửa hàng đang hoạt động: `SELECT DISTINCT TinhThanh FROM CuaHang WHERE TrangThai = 1`.
- Cần có API lấy danh sách tỉnh thành (nếu muốn tĩnh) hoặc lấy động như trên.

## 6. Xử lý đặc biệt

- **Xác thực pháp lý**: Chỉ hiển thị badge nếu `DaXacThucPhapLy = true`.
- **Sắp xếp mặc định**: Có thể là `newest` (mới nhất) hoặc `top_rated`. Tốt nhất nên để giá trị mặc định trong code, và nếu không có `sort` trên URL thì dùng mặc định.
- **Loại hình**: Map giá trị số (1,2,3) sang tên hiển thị (Cá nhân, Hộ kinh doanh, Doanh nghiệp nhỏ). Dùng để lọc và hiển thị.
- **Tìm kiếm theo tên cửa hàng**: Nên dùng `LIKE` hoặc full-text, có thể bỏ dấu tiếng Việt.

## 7. Lưu ý bảo mật và hiệu suất

- Validate `page`, `limit` (giới hạn limit ≤ 100).
- Sử dụng parameterized query tránh SQL injection.
- Đánh index trên các cột hay lọc: `TrangThai`, `TinhThanh`, `LoaiHinhCuaHang`, `DaXacThucPhapLy`, `NgayTao`, `TenCuaHang` (nếu tìm kiếm).
- Các chỉ số tổng hợp (số sản phẩm, tổng đã bán, điểm đánh giá) nên được tính toán và lưu trữ sẵn trong bảng `CuaHang` để tránh join phức tạp khi phân trang. Có thể cập nhật bằng trigger hoặc job định kỳ.

## 8. Tích hợp với các trang khác

- Trang chi tiết cửa hàng (`/cua-hang/{id}`) sẽ hiển thị thông tin đầy đủ hơn, danh sách sản phẩm của cửa hàng đó.
- Từ đây có thể điều hướng đến trang sản phẩm của cửa hàng.

Trên đây là toàn bộ mô tả nghiệp vụ cho trang danh sách cửa hàng. Hãy triển khai backend API và frontend theo đúng yêu cầu, bám sát cơ sở dữ liệu ZenTekExchange.
