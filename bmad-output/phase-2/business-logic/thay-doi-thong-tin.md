# Logic trang thay đổi thông tin (dùng chung cho Buyer & Seller)

## 1. Nguyên tắc chung

- Người dùng đã đăng nhập (có JWT token).
- Tách biệt việc cập nhật **thông tin text** và **upload ảnh đại diện / logo**.
- Ảnh được upload riêng qua API `POST /api/upload`, trả về đường dẫn (URL), sau đó cập nhật vào trường `AnhDaiDien` (người dùng) hoặc `Logo` (cửa hàng).
- Mọi thay đổi đều phải kiểm tra quyền sở hữu (chỉ người dùng mới sửa được thông tin của mình).

---

## 2. Đối với Buyer (Người mua)

### 2.1. Giao diện

- Hiển thị form gồm các trường:
  - Họ tên (`HoTen`)
  - Email (chỉ hiển thị, không cho sửa hoặc có thể sửa nhưng cần kiểm tra unique)
  - Số điện thoại (`SoDienThoai`)
  - Ảnh đại diện: hiển thị ảnh hiện tại + nút "Tải ảnh mới" (upload riêng)
- Nút **"Lưu thay đổi"** để cập nhật các trường text.

### 2.2. Luồng xử lý

1. **Upload ảnh đại diện** (riêng biệt, không phụ thuộc vào nút lưu):
   - Người dùng chọn file ảnh.
   - Gọi API `POST /api/upload/avatar` (hoặc chung `POST /api/upload` với loại = avatar).
   - Server lưu ảnh, trả về đường dẫn (URL).
   - Cập nhật state `AnhDaiDien` trên form.
   - (Có thể gọi luôn API cập nhật ảnh ngay, hoặc đợi đến khi nhấn "Lưu thay đổi" mới gửi – theo yêu cầu "cập nhật riêng biệt" nên có thể lưu ngay khi upload xong, không cần chờ nút lưu).

2. **Cập nhật thông tin text**:
   - Người dùng sửa các trường `HoTen`, `SoDienThoai` (Email có thể cho sửa nhưng cần validate).
   - Nhấn "Lưu thay đổi".
   - Gọi API `PUT /api/nguoidung/thong-tin` với body:
     ```json
     {
       "hoTen": "string",
       "soDienThoai": "string",
       "email": "string" // nếu cho phép sửa
     }
     ```
