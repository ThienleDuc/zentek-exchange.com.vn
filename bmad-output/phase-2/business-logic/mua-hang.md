## Logic mua hàng

Hãy xây dựng luồng xử lý cho các trang: chi tiết sản phẩm, giỏ hàng, đặt hàng theo đúng yêu cầu dưới đây. Sử dụng cơ sở dữ liệu đã có (các bảng NguoiDung, SanPham, GioHang, ChiTietGioHang, DonHang, ChiTietDonHang). Cần đảm bảo các chức năng:
Lưu ý: lấy ra danh sách giỏ hàng của người dùng là buyer theo NguoiMuaId

### 1. Trang chi tiết sản phẩm

- **Nút "Thêm giỏ hàng"**:
  - Kiểm tra đăng nhập, nếu chưa thì chuyển đến trang đăng nhập.
  - Nếu đã đăng nhập, thêm sản phẩm (kèm phân loại nếu có) vào giỏ hàng của người dùng. Nếu sản phẩm đã có trong giỏ thì tăng số lượng. Sử dụng API `POST /api/cart/add` với các tham số `NguoiMuaId`, `SanPhamId`, `PhanLoaiId` (nếu có), `SoLuong`.
- **Nút "Mua hàng"**:
  - Kiểm tra đăng nhập.
  - Tạo một đơn hàng tạm (temp order) lưu trữ thông tin sản phẩm hiện tại (SanPhamId, PhanLoaiId, SoLuong, DonGia). Có thể lưu trong sessionStorage, Redis hoặc bảng tạm `DonHangTam` với thời gian sống 30 phút.
  - Chuyển hướng đến trang đặt hàng (`/dat-hang?tempOrderId=...`) với ID của đơn tạm.

### 2. Trang giỏ hàng

- Hiển thị danh sách sản phẩm trong giỏ của người dùng (từ `ChiTietGioHang` nối với `SanPham`, `AnhSanPham`, `PhanLoai`).
- Mỗi sản phẩm có: checkbox chọn, ảnh, tên, phân loại, đơn giá, số lượng (có thể điều chỉnh), nút xóa.
- Phía dưới hiển thị **Tổng tiền tạm tính** = tổng `(SoLuong * DonGia)` của các sản phẩm được chọn (chỉ để hiển thị, không dùng để gửi sang trang đặt hàng).
- Nút **"Mua hàng"** (Thanh toán):
  - Lấy danh sách các `ChiTietGioHangId` được chọn.
  - Gọi API `POST /api/temp-order/create` truyền `NguoiMuaId` và mảng `cartItemIds`. Server sẽ đọc thông tin từ `ChiTietGioHang`, kiểm tra quyền sở hữu, tạo bản ghi đơn tạm và trả về `tempOrderId`.
  - Chuyển hướng đến `/dat-hang?tempOrderId=...` (không truyền danh sách sản phẩm trực tiếp qua URL).

### 3. Trang đặt hàng

- Khi vào trang, đọc `tempOrderId` từ query string hoặc sessionStorage.
- Gọi API `GET /api/temp-order/{tempOrderId}` để lấy danh sách sản phẩm cần đặt (tên, phân loại, số lượng, đơn giá, thành tiền). Hiển thị danh sách đó.
- Người dùng nhập thông tin người nhận: họ tên, số điện thoại, địa chỉ (có thể thêm ghi chú).
- Người dùng có thể điều chỉnh số lượng tại trang này (chỉ lưu trong bộ nhớ tạm trên client, hoặc gọi API cập nhật tạm).
- Nút **"Đặt hàng"** (Thanh toán):
  - Gửi request `POST /api/orders` với các thông tin: `tempOrderId`, `NguoiMuaId`, `hoTenNguoiNhan`, `soDienThoaiNguoiNhan`, `diaChiNhan`, `ghiChu` (có thể kèm mảng items đã sửa).
  - Xử lý server trong transaction:
    - Kiểm tra tồn kho cho từng sản phẩm (so với `SoLuong` trong bảng `SanPham`). Nếu không đủ thì rollback và báo lỗi.
    - Tạo bản ghi `DonHang` với trạng thái "Chờ xử lý".
    - Tạo các `ChiTietDonHang`, đồng thời **giảm `SoLuong`** và **tăng `SoLuongDaBan`** trong bảng `SanPham`.
    - Xóa các sản phẩm đã đặt khỏi giỏ hàng: nếu `tempOrderId` được tạo từ giỏ hàng (có `cartItemIds`) thì xóa các `ChiTietGioHang` tương ứng; nếu từ mua ngay (không nằm trong giỏ) thì không cần xóa.
    - Xóa hoặc vô hiệu hóa bộ nhớ tạm (xóa bản ghi trong `DonHangTam` hoặc xóa key Redis).
  - Commit transaction, trả về `MaDonHang` và chuyển hướng đến trang thành công / chi tiết đơn hàng.

### Yêu cầu bổ sung

- **Bộ nhớ tạm**: Có thể tạo bảng `DonHangTam` (TempOrderId, NguoiMuaId, DataJson, NgayTao, HanSuDung) hoặc dùng Redis với TTL 30 phút. Định kỳ dọn dẹp các bản ghi hết hạn.
- **Bảo mật**: Luôn kiểm tra `NguoiMuaId` từ token, không cho phép truy cập giỏ hàng hoặc đơn tạm của người khác.
- **Tồn kho**: Sử dụng cơ chế khóa lạc quan (row version) hoặc pessimistic locking để tránh bán quá số lượng.
- **Xóa giỏ hàng**: Chỉ xóa các sản phẩm đã đặt thành công, giữ lại các sản phẩm khác trong giỏ.
