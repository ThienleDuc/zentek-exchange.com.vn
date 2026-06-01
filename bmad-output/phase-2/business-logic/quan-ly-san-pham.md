# Logic trang quản lý sản phẩm (dành cho Seller) – định dạng .md

## 1. Xác định vai trò người dùng

- Lấy thông tin từ JWT token sau khi đăng nhập.
- Kiểm tra `VaiTro` (hoặc `Role`). Nếu là **Seller** (người bán), cho phép truy cập trang quản lý sản phẩm.

## 2. Lấy danh sách sản phẩm của Seller

- Gọi API: `GET /api/sanpham/seller`
- Header: `Authorization: Bearer <token>`
- Server lấy `NguoiBanId` từ token (hoặc từ `NguoiDung` liên kết với `CuaHang`).
- Truy vấn bảng `SanPham` kết hợp với `CuaHang` để lọc theo `CuaHang.NguoiBanId = currentUserId`.
- Trả về danh sách sản phẩm kèm thông tin: `MaSanPham`, `TieuDe`, `Gia`, `TinhTrang`, `SoLuong`, `TrangThaiDuyet`, `NgayDang`, `LuotXem`, `DiemDanhGia`, ...

## 3. Giao diện bảng danh sách sản phẩm

- Bảng hiển thị các cột: Ảnh đại diện, Tiêu đề, Giá, Tình trạng, Số lượng, Trạng thái duyệt, Ngày đăng, Thao tác.
- **Nút bên ngoài bảng**: "Thêm sản phẩm" + icon SVG. Click vào → chuyển đến trang thêm sản phẩm (hoặc mở modal).

## 4. Các nút thao tác trên mỗi dòng sản phẩm (dạng SVG)

- **Xem chi tiết** (eye icon) → chuyển đến trang chi tiết sản phẩm (dành cho Seller).
- **Sửa** (pencil icon) → mở modal chỉnh sửa sản phẩm.
- **Khóa sản phẩm** (lock icon) → thực hiện hành động khóa.

## 5. Hành động "Khóa sản phẩm"

- Khi click nút "Khóa" (sản phẩm đang ở trạng thái "Đã duyệt" hoặc "Đã gỡ").
- Hiển thị hộp thoại xác nhận: "Bạn có chắc chắn muốn khóa sản phẩm này? Sản phẩm sẽ chuyển sang trạng thái Chờ phê duyệt."
- Gọi API: `PUT /api/sanpham/khoa/{id}` (hoặc `PATCH`).
- Server cập nhật:
  - `TrangThaiDuyet = N'Chờ phê duyệt'`
  - `TrangThaiHienThi = 0` (nếu có)
  - `NgaySua = GETDATE()`
  - Xóa lý do từ chối cũ (nếu có)
- Sau khi thành công, reload lại danh sách.

> **Lưu ý**: Theo yêu cầu, khóa sản phẩm đưa về trạng thái "Chờ phê duyệt" – có thể ngầm hiểu là cần admin duyệt lại khi mở khóa.

## 6. Modal chỉnh sửa sản phẩm (khi click nút Sửa)

- Modal hiển thị form có các trường:
  - Tiêu đề (input text)
  - Danh mục (dropdown lấy từ `DanhMuc`)
  - Giá (number)
  - Tình trạng (radio: Mới/Cũ)
  - Số lượng (number)
  - Mô tả file (nếu có – có thể dùng editor hoặc upload file)
  - Link sản phẩm (nếu có)
- Khi submit: gọi API `PUT /api/sanpham/{id}` với dữ liệu mới.
- Server cập nhật: `TieuDe`, `DanhMucId`, `Gia`, `TinhTrang`, `SoLuong`, `FileMoTa`, `LinkSanPham`, `NgaySua = GETDATE()`.
- **Không thay đổi** `TrangThaiDuyet` (giữ nguyên cũ, trừ khi cần yêu cầu duyệt lại – tuỳ logic).
- Sau khi sửa, đóng modal và refresh bảng.

---

# Logic trang thêm sản phẩm (dành cho Seller) – định dạng .md

Trang này gồm **3 phần chính** trên cùng một giao diện. Người dùng có thể thực hiện tuần tự hoặc không theo thứ tự.

## 1. Danh sách ảnh sản phẩm

- Cho phép upload nhiều ảnh (drag & drop hoặc chọn file).
- Hỗ trợ định dạng: jpg, png, gif, webp.
- Mỗi ảnh sau khi upload sẽ hiển thị thumbnail, kèm checkbox hoặc nút để chọn làm **ảnh chính** (`LaAnhChinh = 1`).
- Có thể xóa ảnh trước khi lưu.
- Khi người dùng chọn một ảnh, phần "thêm phân loại" sẽ active để gán phân loại cho ảnh đó.

## 2. Thông tin sản phẩm

Form nhập các trường:

- Tiêu đề (bắt buộc)
- Danh mục (chọn từ danh mục cây, bắt buộc)
- Giá (bắt buộc, số dương)
- Tình trạng (Mới / Cũ, bắt buộc)
- Số lượng (mặc định 1)
- File mô tả sản phẩm (có thể upload PDF, Word, hoặc text). Sử dụng **mã hóa** từ `utils` để mã hóa file trước khi gửi lên server (ví dụ: chuyển thành base64 hoặc mã hóa AES).
- Link sản phẩm tham khảo (không bắt buộc)

## 3. Thêm phân loại cho từng ảnh sản phẩm

- Hiển thị danh sách các ảnh đã upload (dạng gallery nhỏ).
- Khi **click vào một ảnh** (hoặc chọn từ dropdown), hiển thị form thêm phân loại cho ảnh đó.
- Form phân loại bao gồm:
  - Tên phân loại (ví dụ: Màu đỏ, Size L, ...)
  - (Có thể thêm nhiều phân loại cho cùng một ảnh)
- Mỗi phân loại sẽ được lưu vào bảng `PhanLoai` với:
  - `TenPhanLoai`
  - `SanPhamId` (sẽ có sau khi tạo sản phẩm)
  - `HinhAnhId` (liên kết với ảnh vừa chọn)
- **Lưu ý**: Cần tạo sản phẩm trước, sau đó mới tạo phân loại. Vì vậy, quy trình có thể:
  - Bước 1: Upload ảnh, nhập thông tin, tạo sản phẩm (lưu tạm).
  - Bước 2: Sau khi có `MaSanPham`, tiếp tục thêm phân loại cho từng ảnh.
    Hoặc thiết kế: Lưu toàn bộ cùng lúc (dùng transaction) – tạo sản phẩm → lưu ảnh → lưu phân loại.

## 4. Xử lý file mô tả (mã hóa)

- Sử dụng hàm `encodeFile(file)` từ `utils` (ví dụ: chuyển file thành base64 hoặc mã hóa đối xứng).
- Gửi chuỗi đã mã hóa lên server qua field `FileMoTa` (dạng NVARCHAR(MAX)).
- Server giải mã (nếu cần) hoặc lưu trực tiếp chuỗi đã mã hóa.

## 5. Luồng thêm sản phẩm tổng thể

1. Người dùng điền thông tin sản phẩm.
2. Upload danh sách ảnh (hiển thị preview).
3. Với mỗi ảnh, có thể thêm một hoặc nhiều phân loại (chọn ảnh đó).
4. Click nút **"Lưu sản phẩm"**.
5. Gọi API `POST /api/sanpham` với dữ liệu:
   - Thông tin sản phẩm (kèm `CuaHangId` lấy từ token).
   - Danh sách ảnh (dạng mảng các file base64 hoặc form-data).
   - Danh sách phân loại (tạm thời chưa có `MaHinhAnh` nếu chưa lưu ảnh).
6. Server xử lý transaction:
   - Tạo bản ghi `SanPham` với `TrangThaiDuyet = N'Chờ phê duyệt'`.
   - Lưu từng ảnh vào `AnhSanPham`, nhận `MaHinhAnh`.
   - Với mỗi phân loại (đã chọn ảnh), tạo bản ghi `PhanLoai` với `HinhAnhId` tương ứng.
7. Trả về thành công, chuyển hướng về trang quản lý sản phẩm.

---

# Logic trang xem chi tiết sản phẩm (dành cho Seller)

## 1. Hiển thị thông tin sản phẩm

- Gọi API `GET /api/sanpham/{id}`.
- Hiển thị đầy đủ: tiêu đề, giá, danh mục, mô tả file, ảnh (kèm ảnh chính), phân loại, số lượng, lượt xem, điểm đánh giá, trạng thái duyệt.

## 2. Nút "Khóa sản phẩm" và "Bỏ khóa"

- **Khóa sản phẩm**: giống hành động ở trang quản lý (chuyển sang `Chờ phê duyệt`).
- **Bỏ khóa**:
  - Chỉ hiển thị nếu sản phẩm đang bị khóa (hoặc đang ở trạng thái `Chờ phê duyệt` do khóa).
  - Click → xác nhận mở khóa.
  - Gọi API `PUT /api/sanpham/mo-khoa/{id}`.
  - Server cập nhật:
    - `TrangThaiDuyet = N'Đã duyệt'` (hoặc `Đã gỡ` tuỳ logic)
    - `TrangThaiHienThi = 1`
  - Sau đó reload trang.

## 3. Danh sách đánh giá (có lọc theo số sao)

- Gọi API `GET /api/danhgia/sanpham/{id}?sosao={0-5}`.
- Mặc định lấy tất cả (không truyền `sosao` hoặc `sosao=0`).
- Hiển thị các nút lọc: "Tất cả", "5 sao", "4 sao", "3 sao", "2 sao", "1 sao".
- Khi chọn một bộ lọc, gọi lại API với tham số `sosao`.
- Mỗi đánh giá hiển thị:
  - Người đánh giá (tên)
  - Số sao
  - Nội dung
  - Ảnh/video đính kèm (nếu có)
  - Ngày tạo
  - Phần trả lời của Seller (nếu có)

## 4. Nút "Trả lời" trên từng đánh giá

- Bên cạnh mỗi đánh giá (chỉ hiển thị nếu chưa có trả lời hoặc cho phép sửa).
- Click → mở modal/textbox để nhập nội dung trả lời.
- Gửi API `POST /api/danhgia/{maDanhGia}/tra-loi` với nội dung.
- Server cập nhật:
  - `TraLoiNoiDung`
  - `TraLoiNgayTao = GETDATE()`
  - `TraLoiNgayCapNhat = GETDATE()`
- Sau khi trả lời, reload lại danh sách đánh giá để hiển thị câu trả lời.

## 5. Lưu ý về phân quyền

- Chỉ Seller sở hữu sản phẩm (qua `CuaHang`) mới được xem chi tiết, khóa/mở khóa, trả lời đánh giá.
- API cần kiểm tra token và quyền sở hữu.
