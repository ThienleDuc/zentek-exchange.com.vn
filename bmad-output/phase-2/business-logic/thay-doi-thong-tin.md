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

# Logic nghiệp vụ: Trang Thay đổi thông tin người bán (SellerProfile)

## 1. Mục đích trang

Cho phép người bán (seller) xem và cập nhật hồ sơ cửa hàng của mình, bao gồm:

- Thông tin tài khoản cá nhân (họ tên, email, số điện thoại, ảnh đại diện)
- Thông tin cửa hàng (tên, logo, mô tả, địa chỉ, loại hình, mã số thuế, …)
- Xác thực số điện thoại qua OTP trước khi lưu thay đổi quan trọng (tuỳ chọn)

## 2. Đối tượng sử dụng

- **Người bán (Seller)** đã đăng nhập vào hệ thống, có quyền quản lý thông tin cửa hàng của mình.

## 3. Các thành phần chính trên trang

| Thành phần          | Mô tả                                                                                                |
| ------------------- | ---------------------------------------------------------------------------------------------------- |
| Ảnh đại diện        | Hiển thị và cho phép upload ảnh mới (JPG, PNG)                                                       |
| Logo cửa hàng       | Hiển thị và cho phép upload logo mới (vuông, JPG, PNG)                                               |
| Thông tin tài khoản | Họ tên (sửa được), tên đăng nhập (chỉ xem), email, SĐT, ngày tham gia                                |
| Thông tin cửa hàng  | Tên, SĐT, mô tả, địa chỉ (tỉnh, quận, phường, số nhà), loại hình, MST, trạng thái xác thực, ngày tạo |
| Nhập mã OTP         | Ô nhập 6 số, nút “Gửi mã” / “Gửi lại mã”                                                             |
| Nút lưu thay đổi    | Lưu tất cả thông tin đã sửa (cả ảnh, avatar, logo, thông tin)                                        |

## 4. Luồng dữ liệu & khởi tạo trang

1. Khi truy cập trang, gọi API `GET /api/seller/profile` (mock) để lấy dữ liệu user và shop.
2. Hiển thị loading, sau đó gán dữ liệu vào state:
   - `user`: thông tin tài khoản (hoTen, tenDangNhap, email, soDienThoai, anhDaiDien, ngayTao)
   - `shop`: thông tin cửa hàng (tenCuaHang, logo, moTa, diaChi, tinhThanh, quanHuyen, phuongXa, soDienThoai, loaiHinhCuaHang, maSoThue, daXacThucPhapLy, ngayTao)
3. Gọi API lấy danh sách tỉnh/thành (`getProvinces`) để hiển thị dropdown.
4. Dựa vào `shop.tinhThanh` hiện tại, gọi API lấy cây địa chỉ (`getProvinceTree`) để lấy danh sách quận/huyện và phường/xã tương ứng, khởi tạo các dropdown phụ thuộc.
5. Hiển thị form với dữ liệu hiện có.

## 5. Các thao tác nghiệp vụ chi tiết

### 5.1. Upload ảnh đại diện và logo

- Người dùng click nút “Đổi ảnh”, chọn file từ máy.
- Hỗ trợ định dạng JPG, PNG.
- Sau khi chọn file:
  - Lưu file vào state (`avatarFile` / `logoFile`).
  - Tạo URL preview tạm thời để hiển thị ảnh mới ngay trên giao diện.
- **Lưu ý:** Ảnh chỉ được upload thực sự khi nhấn nút **Lưu thay đổi** (gửi lên server sau đó).

### 5.2. Thay đổi thông tin tài khoản

- Các trường có thể sửa: `hoTen`, `email`, `soDienThoai`.
- Trường `tenDangNhap`, `ngayTao` chỉ hiển thị (disabled).
- Khi người dùng nhập liệu, cập nhật state `user` tương ứng.

### 5.3. Thay đổi thông tin cửa hàng

- Các trường có thể sửa: `tenCuaHang`, `soDienThoai` (cửa hàng), `moTa`, `diaChi` (số nhà, đường), `tinhThanh`, `quanHuyen`, `phuongXa`, `loaiHinhCuaHang`, `maSoThue`.
- Các trường chỉ đọc: `daXacThucPhapLy`, `ngayTao`.
- Khi người dùng nhập liệu, cập nhật state `shop`.

### 5.4. Xử lý địa chỉ (dropdown liên kết 3 cấp)

- **Tỉnh/Thành:** chọn một giá trị → gọi API lấy danh sách quận/huyện và phường/xã của tỉnh đó. Reset `quanHuyen` và `phuongXa`.
- **Phường/Xã:** chọn phường → tự động xác định quận/huyện tương ứng (dựa vào `district_code` của phường) và điền vào dropdown quận/huyện (disable nhưng hiển thị đúng). Đồng thời cập nhật `shop.quanHuyen`.
- **Quận/Huyện:** (thường được tự động chọn khi chọn phường, nhưng vẫn có thể cho phép chọn lại – trong logic hiện tại chỉ được chọn sau khi chọn phường).
- **Địa chỉ chi tiết (số nhà, đường):** input text tự do.

> **Ràng buộc:** Chỉ có thể chọn quận/huyện sau khi đã chọn phường/xã (do logic suy ngược). Khi thay đổi tỉnh, toàn bộ quận và phường bị xoá.

### 5.5. Gửi và xác thực OTP

- Người dùng nhập số điện thoại (trong thông tin tài khoản) trước.
- Nhấn nút “Gửi mã” → gọi API `sendOtp(soDienThoai)` (mock). Nếu thành công, hiển thị thông báo và nút chuyển thành “Gửi lại mã”.
- Người dùng nhập mã OTP 6 số vào ô (chỉ cho phép nhập số).
- **Ghi chú:** Trong logic hiện tại, mã OTP không được kiểm tra trước khi lưu (chỉ có ô nhập nhưng chưa gọi API verify). Nghiệp vụ thực tế cần xác thực OTP trước khi cho phép lưu các thay đổi liên quan đến số điện thoại hoặc thông tin nhạy cảm.

### 5.6. Lưu thay đổi

- Nhấn nút **“Lưu thay đổi”**.
- Trình tự xử lý:
  1. Nếu có `avatarFile` hoặc `logoFile`, upload lên server thông qua `mockUploadImage`, nhận về URL mới.
  2. Tạo object `updatedUser` và `updatedShop` với các thông tin đã sửa (kể cả URL ảnh mới).
  3. Gọi API `PUT /api/seller/profile` (mock) để cập nhật.
  4. Sau khi thành công:
     - Cập nhật lại state `user`, `shop`.
     - Xoá các file tạm `avatarFile`, `logoFile`.
     - Hiển thị thông báo “Cập nhật thành công!”.
  5. Nếu lỗi, hiển thị thông báo lỗi.

## 6. Ràng buộc & kiểm tra dữ liệu (suy luận từ mã nguồn)

| Trường                  | Ràng buộc                                                                      |
| ----------------------- | ------------------------------------------------------------------------------ |
| Số điện thoại           | Khi gửi OTP, phải có giá trị (không được để trống)                             |
| Ảnh đại diện / logo     | Hỗ trợ file ảnh, tạo preview tạm. Khi chưa lưu, ảnh cũ vẫn được giữ            |
| Địa chỉ                 | Tỉnh → bắt buộc, sau đó mới chọn được phường. Quận được sinh tự động từ phường |
| Mã OTP                  | Chỉ chấp nhận số, tối đa 6 ký tự                                               |
| Tên đăng nhập, ngày tạo | Không cho phép sửa                                                             |
| Ngày tạo cửa hàng       | Chỉ hiển thị, không sửa                                                        |

## 7. API giả định cần triển khai thực tế

| API Endpoint                         | Method | Mô tả                                                              |
| ------------------------------------ | ------ | ------------------------------------------------------------------ |
| `/api/seller/profile`                | GET    | Lấy thông tin user và shop hiện tại                                |
| `/api/seller/profile`                | PUT    | Cập nhật toàn bộ thông tin (user + shop) kèm ảnh (nếu có)          |
| `/api/upload/image` (hoặc tích hợp)  | POST   | Upload ảnh đại diện / logo, trả về URL công khai (dùng mock riêng) |
| `/api/location/provinces`            | GET    | Lấy danh sách tỉnh/thành                                           |
| `/api/location/province-tree/{code}` | GET    | Lấy cây địa chỉ (quận, phường) theo mã tỉnh                        |
| `/api/otp/send`                      | POST   | Gửi mã OTP đến số điện thoại của user                              |
| `/api/otp/verify`                    | POST   | Xác thực mã OTP (chưa có trong code, cần bổ sung)                  |

> **Lưu ý:** Code hiện tại chưa thực hiện xác thực OTP trước khi lưu, chỉ có gửi mã. Nghiệp vụ hoàn chỉnh nên yêu cầu xác thực OTP nếu số điện thoại thay đổi hoặc trước khi cập nhật thông tin nhạy cảm.

## 8. Luồng chính của người dùng

1. Truy cập trang “Hồ sơ cửa hàng”
2. Xem thông tin hiện tại
3. Sửa các trường cần thay đổi (có thể kèm upload ảnh mới)
4. (Tuỳ chọn) Nhấn “Gửi mã” để nhận OTP, nhập mã vào ô
5. Nhấn “Lưu thay đổi”
6. Hệ thống upload ảnh (nếu có), cập nhật thông tin, thông báo thành công
7. Trang hiển thị lại dữ liệu mới

## 9. Ghi chú triển khai từ code mẫu

- Dữ liệu ban đầu là **mock**, cần thay bằng API thật.
- Các hàm `getProvinces`, `getProvinceTree` giả định từ service có sẵn.
- `SearchableDropdown` là component hỗ trợ tìm kiếm và chọn giá trị.
- OTP chưa được tích hợp xác thực vào bước lưu – cần bổ sung luồng kiểm tra OTP hợp lệ trước khi cho phép cập nhật số điện thoại hoặc toàn bộ hồ sơ (tuỳ yêu cầu nghiệp vụ).
- Ảnh upload được tạo URL preview bằng `URL.createObjectURL`, cần thu hồi URL sau khi dùng để tránh rò rỉ bộ nhớ.
