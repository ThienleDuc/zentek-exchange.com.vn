# Text-to-Prompt: Mô tả nghiệp vụ trang tìm kiếm sản phẩm (ZenTekExchange)

Bạn hãy xây dựng **trang tìm kiếm sản phẩm** cho website ZenTekExchange dựa trên cơ sở dữ liệu đã thiết kế. Trang này cho phép người dùng nhập từ khóa, lọc theo nhiều tiêu chí, sắp xếp và phân trang kết quả. Mọi bộ lọc phải được đồng bộ với URL để có thể lưu lại hoặc chia sẻ.

## 1. Luồng người dùng

- Người dùng nhập từ khóa vào ô tìm kiếm trên header (hoặc vào trang search trực tiếp với tham số `?q=...`).
- Trang search hiển thị danh sách sản phẩm thỏa mãn từ khóa, kèm các bộ lọc bên trái (desktop) hoặc dạng drawer (mobile).
- Người dùng có thể:
  - Lọc theo danh mục, khoảng giá, đánh giá sao, tình trạng (Mới/Cũ), cửa hàng.
  - Sắp xếp kết quả (theo độ liên quan, mới nhất, giá tăng dần/giảm dần, bán chạy nhất, đánh giá cao nhất).
  - Chuyển trang (phân trang số).
- Khi thay đổi bất kỳ bộ lọc nào, URL được cập nhật (các tham số như `?q=...&category=...&priceMin=...`), kết quả tự động tải lại.

## 2. Các bảng dữ liệu liên quan

- `SanPham`: MaSanPham, TieuDe, Gia, SoLuongDaBan, DiemDanhGia, TinhTrang, DaHetHang, NgayDang, TrangThaiDuyet, TrangThaiHienThi, CuaHangId, DanhMucId.
- `DanhMuc`: MaDanhMuc, TenDanhMuc, DanhMucChaId.
- `CuaHang`: MaCuaHang, TenCuaHang.
- `AnhSanPham`: DuongDanAnh, LaAnhChinh, SanPhamId.

**Điều kiện hiển thị sản phẩm:** `TrangThaiDuyet = N'Đã duyệt'` và `TrangThaiHienThi = 1`. Sản phẩm hết hàng (`DaHetHang = 1`) vẫn hiển thị nhưng có overlay "HẾT HÀNG".

## 3. Các tiêu chí tìm kiếm & lọc

| Tiêu chí       | Tham số URL | Kiểu         | Ghi chú                                                                                                            |
| -------------- | ----------- | ------------ | ------------------------------------------------------------------------------------------------------------------ |
| Từ khóa        | `q`         | string       | Tìm kiếm trong `TieuDe` (có thể mở rộng sang `MoTa`). Nên dùng full-text hoặc LIKE với xử lý bỏ dấu.               |
| Danh mục       | `category`  | string       | Có thể là `MaDanhMuc` hoặc slug. Hỗ trợ danh mục cha: nếu chọn danh mục cha, lấy cả sản phẩm của các danh mục con. |
| Giá thấp nhất  | `priceMin`  | number       | >= giá trị                                                                                                         |
| Giá cao nhất   | `priceMax`  | number       | <= giá trị                                                                                                         |
| Đánh giá sao   | `rating`    | number (1-5) | Lọc sản phẩm có `DiemDanhGia >= rating`                                                                            |
| Tình trạng     | `condition` | string       | `Mới` hoặc `Cũ`                                                                                                    |
| Cửa hàng       | `store`     | string       | Tên cửa hàng hoặc `MaCuaHang`                                                                                      |
| Sắp xếp        | `sort`      | string       | `relevance`, `newest`, `price_asc`, `price_desc`, `best_seller`, `top_rated`                                       |
| Trang          | `page`      | number       | Bắt đầu từ 1                                                                                                       |
| Số lượng/trang | `limit`     | number       | Mặc định 12 (có thể cho phép 24, 36)                                                                               |

## 4. API tìm kiếm

**Endpoint:** `GET /api/products/search`

**Xử lý backend:**

1. Xây dựng truy vấn động từ bảng `SanPham`, join với `DanhMuc`, `CuaHang`, `AnhSanPham` (lấy ảnh chính).
2. Áp dụng các điều kiện WHERE:
   - `TrangThaiDuyet = N'Đã duyệt'` và `TrangThaiHienThi = 1`.
   - Nếu `q` có giá trị: tìm kiếm trong `TieuDe` (dùng `LIKE` hoặc `CONTAINS` nếu có full-text). Nên loại bỏ dấu tiếng Việt hoặc thêm cột `TieuDeKD`.
   - Nếu `category` có giá trị: lọc theo `DanhMucId` (nếu là danh mục cha thì lấy tất cả con cháu bằng CTE đệ quy).
   - Nếu `priceMin` có: `Gia >= priceMin`
   - Nếu `priceMax` có: `Gia <= priceMax`
   - Nếu `rating > 0`: `DiemDanhGia >= rating`
   - Nếu `condition` có: `TinhTrang = condition`
   - Nếu `store` có: `CuaHang.TenCuaHang = store` hoặc `CuaHang.MaCuaHang = store`
3. Sắp xếp theo `sort`:
   - `newest`: `NgayDang DESC`
   - `price_asc`: `Gia ASC`
   - `price_desc`: `Gia DESC`
   - `best_seller`: `SoLuongDaBan DESC`
   - `top_rated`: `DiemDanhGia DESC`
   - `relevance`: không ưu tiên, có thể dùng thứ tự mặc định hoặc mức độ match nếu có full-text.
4. Phân trang: sử dụng `OFFSET (page-1)*limit ROWS FETCH NEXT limit ROWS ONLY`.
5. Đếm tổng số bản ghi thỏa mãn để trả về `total` và `totalPages`.

**Response mẫu:**

```json
{
  "data": [
    {
      "maSanPham": "guid",
      "tieuDe": "Laptop Gaming ASUS...",
      "gia": 18500000,
      "soLuongDaBan": 123,
      "diemDanhGia": 4.5,
      "tinhTrang": "Mới",
      "daHetHang": false,
      "hinhAnh": "https://...",
      "tenCuaHang": "TechPro",
      "tenDanhMuc": "Máy tính xách tay"
    }
  ],
  "total": 345,
  "page": 2,
  "limit": 12,
  "totalPages": 29
}
```

## 5. Giao diện và tương tác (frontend)

### 5.1. Bố cục

- **Desktop:** Sidebar bên trái chứa các bộ lọc, bên phải là kết quả (toolbar + grid sản phẩm + phân trang).
- **Mobile:** Nút "Bộ lọc" mở drawer từ dưới lên hoặc từ phải sang.

### 5.2. Các thành phần

- **Sidebar lọc (FilterSidebar)**:
  - Danh mục (dropdown, lấy từ API `/api/categories`).
  - Khoảng giá (2 input number: Từ - Đến).
  - Đánh giá sao (radio: 5 sao, 4 sao, ..., 1 sao, và "Tất cả").
  - Tình trạng (radio: Mới, Cũ, Tất cả).
  - Cửa hàng (dropdown, lấy từ API `/api/stores`).
  - Nút "Đặt lại" (reset tất cả filter, giữ lại từ khóa `q` hoặc xóa hết tùy UX).
- **Toolbar**:
  - Hiển thị số lượng kết quả (`Tìm thấy X sản phẩm`).
  - Dropdown sắp xếp.
- **Grid sản phẩm**: hiển thị dạng card (tương tự trang chủ).
- **Phân trang số**: hiển thị tối đa 5 số, có nút Trước/Sau.

### 5.3. Đồng bộ URL và state

- Khi component mount, đọc `searchParams` từ URL để khởi tạo `filters` (các tham số: q, category, priceMin, priceMax, rating, condition, store, sort, page).
- Mỗi khi `filters` thay đổi (do người dùng thao tác trên bộ lọc hoặc phân trang), gọi `setSearchParams` để cập nhật URL (replace: true để không tạo lịch sử chồng chất).
- Trong `useEffect` phụ thuộc `filters`, gọi API tìm kiếm và cập nhật kết quả.
- Khi nhấn nút "Đặt lại": tạo object filters mới với các giá trị mặc định (vd: category='', priceMin='', priceMax='', rating=0, condition='', store='', sort='relevance', page=1). Giữ nguyên `keyword` nếu muốn, hoặc xóa luôn.

### 5.4. Xử lý tải và lỗi

- Hiển thị skeleton loading khi đang gọi API (số lượng skeleton bằng `limit`).
- Nếu `total === 0`, hiển thị thông báo "Không tìm thấy sản phẩm" và nút "Xóa bộ lọc".
- Nếu lỗi mạng hoặc server, hiển thị thông báo lỗi và cho phép thử lại.

### 5.5. Tối ưu hiệu suất

- Debounce từ khóa? Không áp dụng cho trang search vì từ khóa thường được nhập từ header trước khi vào trang. Tuy nhiên nếu có ô tìm kiếm trên trang thì nên debounce.
- Sử dụng `React.memo` cho các card sản phẩm.
- Lazy load ảnh (`loading="lazy"`).

## 6. API bổ trợ

- `GET /api/categories` – lấy danh sách danh mục (có phân cấp) để render dropdown lọc. Trả về cây hoặc danh sách phẳng với `level`.
- `GET /api/stores` – lấy danh sách cửa hàng có sản phẩm đã duyệt và đang hoạt động (dùng để lọc).

## 7. Xử lý danh mục cha-con

- Nếu danh mục được chọn có `DanhMucChaId = NULL` (danh mục cấp 1), truy vấn phải lấy tất cả sản phẩm thuộc danh mục đó và các danh mục con (có thể đệ quy). Có thể dùng CTE trong SQL hoặc xử lý bằng cách lưu đường dẫn (path).
- Frontend có thể gửi `categoryId` thay vì tên; backend xác định và mở rộng.

## 8. Các trường hợp đặc biệt

- Khi `sort = relevance` mà không có full-text, có thể sắp xếp theo độ dài từ khóa xuất hiện hoặc chỉ cần sắp xếp mặc định (ví dụ theo `NgayDang DESC`).
- Nếu `q` rỗng (không có từ khóa), vẫn trả về danh sách sản phẩm thỏa mãn các bộ lọc khác.
- Khi chuyển trang, phải cuộc lên đầu trang (scroll to top).

## 9. Ví dụ luồng chính

1. Người dùng gõ "laptop" trên header và nhấn Enter → URL: `/search?q=laptop`.
2. Trang search khởi tạo filter với `keyword = "laptop"`, gọi API với `q=laptop&page=1&limit=12&sort=relevance`.
3. Hiển thị danh sách laptop.
4. Người dùng chọn danh mục "Máy tính xách tay" và khoảng giá "5 triệu - 15 triệu" → URL cập nhật: `/search?q=laptop&category=Máy%20tính%20xách%20tay&priceMin=5000000&priceMax=15000000`.
5. Gọi API mới, cập nhật kết quả.
6. Người dùng chuyển sang trang 2 → URL thêm `&page=2`, gọi API, scroll lên đầu.

## 10. Lưu ý bảo mật và hiệu suất

- Validate input: `priceMin`, `priceMax` phải là số dương, `page` >=1, `limit` nên giới hạn (max 100).
- Sử dụng parameterized query để tránh SQL injection.
- Đánh index trên các cột: `TrangThaiDuyet`, `TrangThaiHienThi`, `Gia`, `NgayDang`, `SoLuongDaBan`, `DiemDanhGia`, `DanhMucId`, `CuaHangId`.
- Cân nhắc cache cho các danh sách danh mục và cửa hàng.

Trên đây là toàn bộ mô tả nghiệp vụ cho trang tìm kiếm sản phẩm. Hãy triển khai đầy đủ backend API và frontend theo đúng yêu cầu, bám sát cơ sở dữ liệu ZenTekExchange.
