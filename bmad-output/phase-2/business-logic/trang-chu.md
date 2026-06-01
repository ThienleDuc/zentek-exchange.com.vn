# Text-to-Prompt: Logic nghiệp vụ trang Home (hiển thị danh sách sản phẩm)

Bạn hãy triển khai **trang chủ (Home)** cho website ZenTekExchange theo đúng cơ sở dữ liệu đã thiết kế. Trang Home hiển thị 2 khối sản phẩm chính: **"Bán chạy nhất"** và **"Mới nhất"**. Mỗi khối sử dụng cơ chế **load more** (tải thêm) thay vì phân trang truyền thống.

## 1. Yêu cầu chung

- Chỉ hiển thị sản phẩm đáp ứng các điều kiện:
  - `TrangThaiDuyet = N'Đã duyệt'` (đã được admin phê duyệt)
  - `TrangThaiHienThi = 1` (cửa hàng chưa ẩn sản phẩm)
  - (Không cần kiểm tra `DaXoa` vì bảng `SanPham` hiện chưa có cột này; nếu sau này thêm thì cũng lọc những sản phẩm chưa bị xóa mềm)
- Sản phẩm đã hết hàng (`DaHetHang = 1`) vẫn hiển thị nhưng có lớp phủ **"HẾT HÀNG"** và không cho phép thêm vào giỏ (hoặc nút bị vô hiệu hóa – xử lý ở trang chi tiết).
- Mỗi sản phẩm hiển thị: ảnh đại diện (ưu tiên `LaAnhChinh = 1` trong bảng `AnhSanPham`), tên sản phẩm, giá, tình trạng (`TinhTrang`: Mới/Cũ), số lượng đã bán (`SoLuongDaBan`).

## 2. Khối "Bán chạy nhất"

- **Sắp xếp**: giảm dần theo `SoLuongDaBan`. Nếu bằng nhau thì giảm dần theo `NgayDang` (sản phẩm mới hơn lên trước).
- **Phân trang** (load more): mỗi lần tải **20 sản phẩm**. Gọi API với tham số:
  - `sortBy = "best_seller"`
  - `offset` (bắt đầu từ 0)
  - `limit = 20`

## 3. Khối "Mới nhất"

- **Sắp xếp**: giảm dần theo `NgayDang` (sản phẩm đăng sau lên trước).
- **Phân trang**: tương tự, mỗi lần tải 20 sản phẩm. Gọi API với:
  - `sortBy = "newest"`
  - `offset`, `limit`

## 4. API cần xây dựng

### Endpoint: `GET /api/products`

**Query parameters:**

| Tham số  | Kiểu   | Bắt buộc           | Mô tả                           |
| -------- | ------ | ------------------ | ------------------------------- |
| `sortBy` | string | Có                 | `best_seller` hoặc `newest`     |
| `offset` | int    | Không, mặc định 0  | Vị trí bắt đầu                  |
| `limit`  | int    | Không, mặc định 20 | Số lượng sản phẩm tối đa trả về |

**Response:** 200 OK

```json
{
  "data": [
    {
      "maSanPham": "guid",
      "tieuDe": "string",
      "gia": 123000.0,
      "soLuongDaBan": 150,
      "tinhTrang": "Mới",
      "daHetHang": false,
      "hinhAnh": "https://..."
      // có thể thêm các trường cần thiết khác nhưng không bắt buộc cho Home
    }
  ],
  "hasMore": true, // true nếu còn sản phẩm ở lần tiếp theo (dựa vào tổng số hoặc số bản ghi trả về >= limit)
  "total": 120 // optional: tổng số sản phẩm thỏa mãn (dùng để kiểm tra hasMore)
}
```

**Logic truy vấn database (SQL Server):**

```sql
-- Ví dụ cho best_seller
SELECT sp.MaSanPham, sp.TieuDe, sp.Gia, sp.SoLuongDaBan, sp.TinhTrang, sp.DaHetHang,
       (SELECT TOP 1 DuongDanAnh FROM AnhSanPham WHERE SanPhamId = sp.MaSanPham AND LaAnhChinh = 1) AS HinhAnh
FROM SanPham sp
WHERE sp.TrangThaiDuyet = N'Đã duyệt'
  AND sp.TrangThaiHienThi = 1
ORDER BY sp.SoLuongDaBan DESC, sp.NgayDang DESC
OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
```

Với `newest` thì `ORDER BY sp.NgayDang DESC`.

**Lưu ý bảo mật:** Không cần xác thực cho API này (công khai). Nhưng nếu muốn giới hạn tốc độ (rate limit) thì vẫn nên áp dụng.

## 5. Xử lý phía frontend (dựa trên code mẫu Home.tsx)

- **Tách component `ProductSection`** dùng chung cho cả hai khối. Component nhận props: `title` (tiêu đề), `icon` (emoji), `sortBy` (`best_seller` hoặc `newest`), `limit` (mặc định 20).
- **State quản lý**: `products` (mảng sản phẩm đã tải), `offset`, `loading`, `hasMore`, `error`.
- **Lần đầu vào trang**:
  - Gọi API `GET /api/products?sortBy={sortBy}&offset=0&limit=20`.
  - Gán dữ liệu vào `products`, set `offset = 20`.
  - Xác định `hasMore` dựa trên trường `hasMore` từ response hoặc nếu số lượng trả về < limit thì `hasMore = false`.
- **Khi nhấn nút "Xem thêm"**:
  - Nếu `!loading && hasMore` thì tăng `offset` lên `limit`, gọi API với `offset` mới.
  - Nối dữ liệu mới vào mảng `products`.
  - Cập nhật `hasMore`.
- **Hiển thị skeleton loading** khi đang tải (tối thiểu 3-4 skeleton card).
- **Xử lý lỗi**: hiển thị thông báo và cho phép thử lại (nút "Tải lại" hoặc tự động retry).
- **Click vào sản phẩm**: điều hướng đến trang chi tiết với đường dẫn `/san-pham/{maSanPham}` (đã có logic ở trang chi tiết).

## 6. Logic redirect khi đã đăng nhập

- Trang Home chỉ dành cho **người dùng chưa đăng nhập** hoặc **người dùng đã đăng nhập nhưng không có dashboard riêng** (ví dụ: chỉ có vai trò `Khách hàng` – nếu tồn tại). Cụ thể:
  - Sử dụng `storage.getUser()` và `storage.getToken()` để kiểm tra.
  - Lấy `roleName` của người dùng.
  - Gọi `getDashboardPath(roleName)` để xác định đường dẫn dashboard tương ứng (admin, người bán, ...).
  - Nếu `dashboardPath !== '/'` (tức có dashboard riêng) thì tự động chuyển hướng đến dashboard đó, **không render nội dung Home**.
  - Trường hợp không có token hoặc role là `customer` (hoặc không có dashboard) thì hiển thị Home bình thường.

## 7. Tối ưu hiệu suất

- Sử dụng `React.memo` cho `ProductCard` nếu cần.
- Dùng `useCallback` cho hàm `fetchProducts` và `loadMore` để tránh re-render không cần thiết.
- Ảnh sản phẩm nên lazy load (`loading="lazy"`).
- Cân nhắc cache API response ở phía client (ví dụ: sử dụng React Query hoặc SWR) để giảm tải request khi quay lại trang Home.

## 8. Mở rộng (không bắt buộc cho phiên bản đầu)

- Hỗ trợ tham số `categoryId` để lọc theo danh mục (nếu sau này có trang danh mục riêng).
- Thêm tính năng "vô tận scroll" (infinite scroll) thay vì nút "Xem thêm".
- Gửi kèm thông tin `storeName` (tên cửa hàng) nếu muốn hiển thị.

Trên đây là toàn bộ logic business cho trang Home. Hãy triển khai đúng theo các yêu cầu trên, đảm bảo tính nhất quán với cơ sở dữ liệu ZenTekExchange.
