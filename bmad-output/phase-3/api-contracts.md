# API Contracts (REST & WebSocket) – ZenTek Exchange

**Trạng thái**: Draft
**Ngày tạo**: 2026-05-24
**Tạo bởi**: API Designer Agent (Đã cập nhật theo Database Schema mới)

---

## 1. Authentication APIs

### 1.1 POST `/api/auth/dang-ky`
- **Desc**: Đăng ký người dùng (`NguoiDung`) mới.
- **Body**: `{ tenDangNhap, email, matKhau, hoTen, soDienThoai }`
- **Res**: `201 Created` - `{ message: "Đăng ký thành công" }`

### 1.2 POST `/api/auth/dang-nhap`
- **Desc**: Đăng nhập hệ thống.
- **Body**: `{ tenDangNhap, matKhau }`
- **Res**: `200 OK` - `{ token: "jwt_string", nguoiDung: { maNguoiDung, vaiTroId, hoTen, anhDaiDien } }`

---

## 2. Cửa hàng (Shop) APIs

### 2.1 POST `/api/cuahang` (Auth Required)
- **Desc**: Đăng ký mở cửa hàng (Biến `NguoiDung` thành người bán).
- **Body**: `{ tenCuaHang, moTa, diaChi, phuongXa, quanHuyen, tinhThanh, soDienThoai, loaiHinhCuaHang, maSoThue }`
- **Res**: `201 Created` - `{ maCuaHang }`

### 2.2 GET `/api/cuahang/:id`
- **Desc**: Lấy thông tin public của Cửa hàng.
- **Res**: `200 OK` - `{ maCuaHang, tenCuaHang, diaChi, diemDanhGia, trangThai, ... }`

---

## 3. Sản phẩm (Product) APIs

### 3.1 POST `/api/sanpham` (Auth Required: NguoiBan)
- **Desc**: Đăng bán sản phẩm (upload form-data bao gồm cả Ảnh và Phân loại).
- **Body** (multipart/form-data): `tieuDe`, `gia`, `tinhTrang` ('Mới' / 'Cũ'), `danhMucId`, `soLuong`, `anhChinh` (file), `anhPhu[]` (files).
- **Res**: `201 Created` - Trạng thái mặc định: `Chờ phê duyệt`.

### 3.2 GET `/api/sanpham`
- **Desc**: Lấy danh sách sản phẩm hiển thị công khai (Bắt buộc điều kiện `TrangThaiDuyet = 'Đã duyệt'`).
- **Query**: `?danhMucId=...&search=abc&minGia=0&maxGia=1000`
- **Res**: `200 OK` - Danh sách SP (có phân trang).

### 3.3 GET `/api/sanpham/:id`
- **Desc**: Chi tiết sản phẩm + Thông tin Cửa hàng + Các Phân Loại (Màu sắc, Size) + Gallery `AnhSanPham`.

---

## 4. Kiểm duyệt (Moderation) APIs (Admin Only)

### 4.1 GET `/api/admin/sanpham/cho-duyet` (Auth Required: Admin)
- **Desc**: Lấy danh sách sản phẩm đang `Chờ phê duyệt`.
- **Res**: `200 OK` - List of pending products.

### 4.2 PUT `/api/admin/sanpham/:id/trang-thai` (Auth Required: Admin)
- **Desc**: Cập nhật trạng thái duyệt của Admin.
- **Body**: `{ trangThaiDuyet: 'Đã duyệt' | 'Đã từ chối' | 'Đã gỡ' }`
- **Res**: `200 OK`.

### 4.3 GET `/api/admin/cuahang` (Auth Required: Admin)
- **Desc**: Lấy danh sách toàn bộ cửa hàng (có thể filter theo `DaXacThucPhapLy` hoặc `TrangThai`).
- **Res**: `200 OK` - Danh sách cửa hàng.

### 4.4 PUT `/api/admin/cuahang/:id/xac-thuc` (Auth Required: Admin)
- **Desc**: Xác thực pháp lý cho cửa hàng.
- **Body**: `{ daXacThucPhapLy: 1 | 0, lyDoTuChoi?: string }`
- **Res**: `200 OK`.

### 4.5 PUT `/api/admin/cuahang/:id/trang-thai` (Auth Required: Admin)
- **Desc**: Khóa hoặc mở khóa cửa hàng.
- **Body**: `{ trangThai: 1 | 0 }`
- **Res**: `200 OK`.

---

## 5. Đơn hàng & Giỏ hàng APIs

### 5.1 POST `/api/giohang/them` (Auth Required)
- **Desc**: Thêm sản phẩm vào giỏ.
- **Body**: `{ sanPhamId, phanLoaiId, soLuong }`
- **Res**: `200 OK`

### 5.2 POST `/api/donhang` (Auth Required)
- **Desc**: Tạo đơn hàng từ giỏ.
- **Body**: `{ hoTenNguoiNhan, soDienThoaiNguoiNhan, diaChiNhan, chiTiet: [{ sanPhamId, phanLoaiId, soLuong, donGia }] }`
- **Res**: `201 Created` - `{ maDonHang }` (Trạng thái mặc định: `Chờ xử lý`).

### 5.3 PUT `/api/donhang/:id/trang-thai` (Auth Required)
- **Desc**: Cập nhật trạng thái đơn (Người bán: Confirm, Người mua: Đã nhận).
- **Body**: `{ trangThaiDon: 'Đang giao' | 'Đã nhận' | 'Đã hủy', lyDoHuy?: string }`

---

## 6. Đánh giá (Review) APIs

### 6.1 POST `/api/danhgia` (Auth Required: Người mua)
- **Desc**: Viết đánh giá cho sản phẩm (`DonHang` phải ở trạng thái `Đã nhận`).
- **Body**: `{ sanPhamId, donHangId, soSao, noiDung }`
- **Res**: `201 Created` - Trả về `maDanhGia`. Có thể upload thêm ảnh/video vào bảng `PhanHoiMedia` sau bước này.

### 6.2 PUT `/api/danhgia/:id/phanhoi` (Auth Required: Người bán)
- **Desc**: Chủ shop trả lời đánh giá.
- **Body**: `{ traLoiNoiDung }`

---

## 7. WebSocket Events (Socket.IO) cho Cuộc Trò Chuyện (Chat)

Backend sử dụng bảng `CuocTroChuyen`, `ThanhVienCuocTroChuyen` và `TinNhan`.

### 7.1 Kết nối
- Khách hàng kết nối Socket, truyền `token` trong payload auth.
- Backend decode JWT, lấy `maNguoiDung`.

### 7.2 Tham gia phòng (Join Room)
- **Event Client Gửi**: `join_room`
- **Payload**: `{ maCuocTroChuyen }`
- **Server Xử lý**: Khớp ID và gọi `socket.join(maCuocTroChuyen)`

### 7.3 Gửi tin nhắn
- **Event Client Gửi**: `send_message`
- **Payload**: `{ maCuocTroChuyen, noiDung }`
- **Server Xử lý**:
  1. Ghi dữ liệu vào bảng `TinNhan`.
  2. Broadcast: `io.to(maCuocTroChuyen).emit("receive_message", { maTinNhan, nguoiGuiId, noiDung, ngayGui })`
  3. Update trường `TinNhanCuoiId` và `NgayCapNhat` trong bảng `CuocTroChuyen`.

### 7.4 Nhận tin nhắn
- **Event Server Trả Về**: `receive_message`
- **Payload**: Chi tiết tin nhắn (như trên). Client lắng nghe để update giao diện chat.
