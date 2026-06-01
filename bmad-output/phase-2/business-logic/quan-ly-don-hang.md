```markdown
# Logic trang Quản lý đơn hàng

## Đối với Seller (Người bán)

### 1. Xác nhận giao hàng

- Hành động: Click nút "Xác nhận giao hàng" trên đơn hàng.
- Điều kiện: Chỉ thực hiện được khi `TrangThaiDon = N'Chờ xử lý'`.
- Xử lý:
  - Kiểm tra trạng thái hiện tại. Nếu khác `Chờ xử lý` → hiển thị thông báo lỗi và không cho phép.
  - Gọi API: `PUT /api/donhang/{id}/xac-nhan-giao`
  - Server cập nhật: `TrangThaiDon = N'Đang giao'`, `NgayCapNhat = GETDATE()`.
- Kết quả: Reload danh sách đơn hàng.

### 2. Hủy đơn hàng

- Hành động: Click nút "Hủy đơn" trên đơn hàng.
- Điều kiện: Chỉ thực hiện được khi `TrangThaiDon = N'Chờ xử lý'`.
- Xử lý:
  - Kiểm tra trạng thái, nếu khác `Chờ xử lý` → thông báo lỗi.
  - Hiển thị modal nhập lý do hủy (bắt buộc).
  - Gọi API: `PUT /api/donhang/{id}/huy`
  - Server cập nhật: `TrangThaiDon = N'Đã hủy'`, `LyDoHuy = <nội dung>`, `NgayCapNhat = GETDATE()`.
- Kết quả: Reload danh sách.

### 3. Liên hệ người mua

- Hành động: Click nút "Liên hệ" (icon chat).
- Mục đích: Tạo hoặc mở cuộc trò chuyện giữa người bán (Seller) và người mua (Buyer).
- Xử lý phía client:
  - Gọi API kiểm tra: `GET /api/cuoctrochuyen/ton-tai?nguoi1=<sellerId>&nguoi2=<buyerId>`
  - Nếu chưa có: gọi `POST /api/cuoctrochuyen` tạo cuộc trò chuyện mới (loại `ca_nhan`).
  - Nếu đã có: lấy `MaCuocTroChuyen`.
  - Chuyển hướng đến trang chat hoặc mở popup chat với cuộc trò chuyện đó.
- Lưu ý: Không tạo trùng lặp, kiểm tra qua bảng `ThanhVienCuocTroChuyen`.

### 4. Trả lời đánh giá

- Hành động: Tại trang chi tiết đơn hàng hoặc tại sản phẩm, có nút "Trả lời" bên cạnh đánh giá.
- Xử lý: Gọi đến chức năng đã xây dựng trong **trang Quản lý sản phẩm** (phần trả lời đánh giá của Seller).
- Chi tiết: Xem lại mục "Trả lời đánh giá" tại logic trang xem chi tiết sản phẩm.

---

## Đối với Buyer (Người mua)

### 1. Hủy đơn hàng

- Hành động: Click nút "Hủy đơn" trên đơn hàng của mình.
- Điều kiện: Chỉ hủy được khi `TrangThaiDon = N'Chờ xử lý'`.
- Xử lý:
  - Kiểm tra trạng thái, nếu khác `Chờ xử lý` → thông báo lỗi.
  - Hiển thị modal nhập lý do hủy.
  - Gọi API: `PUT /api/donhang/{id}/huy`
  - Server cập nhật: `TrangThaiDon = N'Đã hủy'`, `LyDoHuy = ...`, `NgayCapNhat = GETDATE()`.
- Kết quả: Reload danh sách.

### 2. Liên hệ người bán

- Hành động: Click nút "Liên hệ" (icon chat).
- Mục đích: Tạo hoặc mở cuộc trò chuyện giữa người mua và người bán (chủ cửa hàng của đơn hàng).
- Xử lý:
  - Lấy `NguoiBanId` từ `CuaHang` liên kết với sản phẩm trong đơn hàng.
  - Gọi API kiểm tra: `GET /api/cuoctrochuyen/ton-tai?nguoi1=<buyerId>&nguoi2=<sellerId>`
  - Nếu chưa có → tạo mới (loại `ca_nhan`).
  - Nếu đã có → lấy `MaCuocTroChuyen`.
  - Chuyển đến trang chat hoặc mở popup.

### 3. Xác nhận đã nhận hàng

- Hành động: Click nút "Đã nhận hàng" trên đơn hàng.
- Điều kiện: Chỉ thực hiện được khi `TrangThaiDon = N'Đang giao'`.
- Xử lý:
  - Kiểm tra trạng thái hiện tại. Nếu khác `Đang giao` → hiển thị lỗi.
  - Gọi API: `PUT /api/donhang/{id}/da-nhan`
  - Server cập nhật: `TrangThaiDon = N'Đã nhận'`, `NgayCapNhat = GETDATE()`.
  - (Có thể cập nhật số lượng đã bán, điểm đánh giá trung bình, ...)
- Kết quả: Reload danh sách.

### 4. Mua lại

- Hành động: Click nút "Mua lại" trên đơn hàng đã hoàn thành (thường là đơn hàng `Đã nhận`).
- Xử lý phía client:
  - Lấy danh sách các `ChiTietDonHang` của đơn hàng đó.
  - Với mỗi sản phẩm: gọi API thêm vào giỏ hàng hiện tại:
    - `POST /api/giohang/them` với `SanPhamId`, `PhanLoaiId`, `SoLuong`.
  - Sau khi thêm thành công tất cả:
    - Chuyển hướng đến trang thanh toán (đặt hàng) cùng với giỏ hàng đó.
  - Nếu người dùng thoát khỏi trang thanh toán (không hoàn tất đơn):
    - Giỏ hàng vẫn giữ nguyên các sản phẩm đã thêm (không xóa).
  - Nếu đặt hàng thành công:
    - Có thể xóa các sản phẩm đó khỏi giỏ hàng (tuỳ logic: thường sau khi đặt hàng thành công, giỏ hàng sẽ được làm trống hoặc xóa các item đã đặt). Theo yêu cầu: "nếu thành công thì xóa trong giỏ hàng".
- Ghi chú: Cần kiểm tra số lượng tồn kho trước khi thêm vào giỏ.

---

## Các API tham khảo

| API                               | Phương thức | Mô tả                                        |
| --------------------------------- | ----------- | -------------------------------------------- |
| `/api/donhang/{id}/xac-nhan-giao` | PUT         | Seller xác nhận giao hàng                    |
| `/api/donhang/{id}/huy`           | PUT         | Hủy đơn (cả Seller và Buyer)                 |
| `/api/donhang/{id}/da-nhan`       | PUT         | Buyer xác nhận đã nhận hàng                  |
| `/api/cuoctrochuyen/ton-tai`      | GET         | Kiểm tra cuộc trò chuyện đã tồn tại          |
| `/api/cuoctrochuyen`              | POST        | Tạo cuộc trò chuyện mới                      |
| `/api/giohang/them`               | POST        | Thêm sản phẩm vào giỏ                        |
| `/api/donhang/{id}/mua-lai`       | GET         | (Tuỳ chọn) Lấy danh sách sản phẩm để mua lại |

---

## Lưu ý chung

- Tất cả các hành động đều phải kiểm tra quyền (qua token) và quyền sở hữu đơn hàng (Seller chỉ được thao tác trên đơn hàng có chứa sản phẩm của mình; Buyer chỉ được thao tác trên đơn hàng của chính mình).
- Cập nhật trạng thái đơn hàng cần tuân thủ đúng luồng:
  - `Chờ xử lý` → `Đang giao` (Seller) hoặc `Đã hủy` (cả hai)
  - `Đang giao` → `Đã nhận` (Buyer)
  - Không cho phép chuyển ngược hoặc nhảy cóc trạng thái.
- Khi hủy đơn, nên hoàn lại số lượng sản phẩm tồn kho (nếu đã trừ) và xử lý các ràng buộc liên quan.
```
