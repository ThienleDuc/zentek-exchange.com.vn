# Epic 5: Order Management (UX/UI Brief)

-------------------phân tách-------------------------

```markdown
# Kế hoạch thiết kế trang giỏ hàng – ZenTekExchange

> **Phạm vi:** Chỉ phần thân trang giỏ hàng (main content).
> **Mục tiêu:** Mô tả chi tiết bố cục, các thành phần, nguồn dữ liệu từ database, tương tác, responsive.  
> **Kỹ thuật:** ReactJS, TailwindCSS, responsive.  
> **Dữ liệu:** Bám sát database `ZenTekExchange` – các bảng `GioHang`, `ChiTietGioHang`, `SanPham`, `AnhSanPham`, `PhanLoai`, `CuaHang`.

---

## 1. Bố cục tổng thể của trang giỏ hàng

Trang giỏ hàng được chia làm hai cột chính (trên màn hình desktop) hoặc xếp chồng (trên mobile):

- **Cột trái (2/3 chiều rộng desktop):** Danh sách sản phẩm trong giỏ.
- **Cột phải (1/3 chiều rộng desktop):** Tóm tắt đơn hàng (thông tin tổng cộng, nút thanh toán).

Trên mobile: cột trái ở trên, cột phải ở dưới, mỗi cột chiếm toàn bộ chiều rộng.

Nếu giỏ hàng trống, hiển thị thông báo “Giỏ hàng trống” kèm nút “Tiếp tục mua sắm” (liên kết về trang home hoặc danh mục).

---

## 2. Dữ liệu hiển thị – Nguồn từ database

### 2.1 Lấy thông tin giỏ hàng của người dùng hiện tại

- Bảng `GioHang`, lọc theo `NguoiMuaId` của người dùng đã đăng nhập. Kết quả gồm `MaGioHang`, `NgayTao`, `NgayCapNhat`.

### 2.2 Lấy danh sách sản phẩm trong giỏ

- Bảng `ChiTietGioHang` kết hợp với `SanPham`, `AnhSanPham` (ưu tiên ảnh chính), `PhanLoai` (nếu có), `CuaHang`.
- Các thông tin cần lấy cho mỗi sản phẩm:
  - `MaChiTietGioHang`, `SoLuong`, `DonGia` (giá tại thời điểm thêm)
  - `MaSanPham`, `TieuDe`, `DaHetHang`
  - `DuongDanAnh` (ảnh đại diện)
  - `TenPhanLoai`, `MaPhanLoai`
  - `TenCuaHang`

### 2.3 Tính toán tổng tiền

- Tổng tiền từng dòng = `SoLuong * DonGia`
- Tổng giỏ hàng = tổng các dòng

---

## 3. Cấu trúc chi tiết từng phần

### 3.1. Danh sách sản phẩm trong giỏ (cột trái)

Mỗi sản phẩm được hiển thị dạng **card ngang**, bao gồm:

- **Ảnh sản phẩm:** Hình vuông nhỏ (khoảng 80x80 đến 100x100 pixel), hiển thị dạng `cover`, lấy từ `AnhSanPham.DuongDanAnh`.
- **Thông tin sản phẩm:**
  - Tên sản phẩm (có liên kết đến trang chi tiết sản phẩm) – từ `TieuDe`.
  - Phân loại (nếu có) – từ `PhanLoai.TenPhanLoai`.
  - Tên cửa hàng – từ `CuaHang.TenCuaHang`.
- **Đơn giá:** Hiển thị giá `DonGia` định dạng VND, có dấu phân cách hàng nghìn.
- **Số lượng:** Ô nhập số (loại number) hoặc nút tăng/giảm, giới hạn từ 1 đến tồn kho hiện tại của sản phẩm.
- **Thành tiền:** Tự động tính bằng `Số lượng * Đơn giá`, định dạng VND.
- **Hành động xóa:** Biểu tượng thùng rác, khi click sẽ xóa sản phẩm khỏi giỏ.

**Xử lý sản phẩm hết hàng:**  
Nếu `DaHetHang = 1`, hiển thị dòng chữ đỏ “Sản phẩm đã hết hàng” ngay bên dưới tên sản phẩm, vô hiệu hóa nút tăng số lượng (chỉ cho phép giảm hoặc xóa). Khi thanh toán, hệ thống sẽ kiểm tra và báo lỗi.

### 3.2. Tóm tắt đơn hàng (cột phải)

Khối này hiển thị:

- **Tổng tiền sản phẩm:** Tổng thành tiền của tất cả các dòng, định dạng VND.
- **Phí vận chuyển:** Tạm thời để trống hoặc hiển thị “Tính khi thanh toán”.
- **Tổng cộng:** Tổng tiền sản phẩm + phí vận chuyển, làm đậm, cỡ chữ lớn.
- **Nút “Tiến hành thanh toán”:** Chuyển sang trang tạo đơn hàng (checkout). Nút chỉ hoạt động khi giỏ có ít nhất một sản phẩm hợp lệ (còn hàng).

Nếu giỏ hàng trống, khối tóm tắt được ẩn hoặc thay bằng thông báo “Chưa có sản phẩm”.

### 3.3. Vùng hành động bổ sung (phía dưới danh sách sản phẩm)

- **Nút “Tiếp tục mua sắm”:** Liên kết đến trang home hoặc danh mục sản phẩm.
- (Tuỳ chọn) **Nút “Cập nhật giỏ hàng”:** Nếu không dùng cập nhật trực tiếp, có thể dùng nút này để gửi hàng loạt thay đổi số lượng. Thiết kế khuyến nghị: cập nhật trực tiếp từng sản phẩm ngay khi người dùng nhập số lượng mới (kèm debounce).

---

## 4. Luồng dữ liệu và API (mô tả hành vi)

- **Khi trang load:** Gọi API lấy giỏ hàng hiện tại dựa trên token người dùng. Nhận về danh sách sản phẩm, số lượng, đơn giá, tổng tiền.
- **Cập nhật số lượng:** Khi người dùng thay đổi số lượng (tăng/giảm hoặc nhập trực tiếp), gọi API cập nhật cho sản phẩm đó. Sau khi thành công, cập nhật lại state: thay đổi thành tiền dòng, tổng tiền toàn bộ. Nếu lỗi (ví dụ vượt tồn kho), hiển thị thông báo và khôi phục số lượng cũ.
- **Xóa sản phẩm:** Hiển thị hộp thoại xác nhận, sau đó gọi API xóa. Nếu thành công, loại bỏ sản phẩm khỏi danh sách và cập nhật tổng tiền. Nếu xóa hết, chuyển sang trạng thái giỏ trống.
- **Thanh toán:** Khi nhấn nút “Tiến hành thanh toán”, kiểm tra lại tính hợp lệ của giỏ (không trống, tất cả còn hàng). Nếu hợp lệ, chuyển hướng sang trang checkout để nhập thông tin giao hàng và tạo đơn hàng.

---

## 5. Tương tác và trạng thái (mô tả hành vi)

- **Khởi tạo:** Hiển thị skeleton loading cho danh sách sản phẩm (các khối ngang mờ nhấp nháy) và khối tóm tắt.
- **Cập nhật số lượng:** Trong lúc gọi API, hiển thị icon loading nhỏ bên cạnh sản phẩm đó. Kết thúc, cập nhật lại UI.
- **Xóa sản phẩm:** Xác nhận trước khi xóa. Sau xóa, hiển thị thông báo ngắn (toast) “Đã xóa sản phẩm”.
- **Giỏ hàng trống:** Hiển thị ảnh minh họa, dòng chữ “Giỏ hàng của bạn đang trống” và nút “Mua sắm ngay” dẫn về trang home.
- **Lỗi hết hàng khi thanh toán:** Nếu có sản phẩm hết hàng (dù đã hiển thị cảnh báo), khi nhấn thanh toán sẽ hiện thông báo lỗi và không chuyển tiếp.

---

## 6. Responsive với TailwindCSS

- **Desktop (≥1024px):** Layout 2 cột (2/3 – 1/3). Card sản phẩm dạng ngang, ảnh kích thước 100x100. Các thông tin được dàn hàng ngang: ảnh, thông tin, đơn giá, số lượng, thành tiền, nút xóa.
- **Tablet (768px – 1024px):** Vẫn 2 cột, thu nhỏ padding và ảnh 80x80. Có thể điều chỉnh bố cục các trường bên trong card cho gọn.
- **Mobile (<768px):** Chuyển thành 1 cột. Card sản phẩm chuyển sang dạng ảnh bên trái, thông tin bên phải, các trường đơn giá, số lượng, thành tiền, xóa có thể xếp thành 2 dòng. Nút thanh toán được cố định dưới đáy màn hình (sticky) để dễ thao tác.

---

## 7. Tóm tắt các thành phần chính (checklist)

- **Cột trái:**
  - Tiêu đề “Giỏ hàng của tôi” (kèm số lượng sản phẩm)
  - Danh sách sản phẩm (card ngang)
    - Ảnh, tên sản phẩm (link chi tiết), phân loại, tên cửa hàng
    - Đơn giá, số lượng (input + nút tăng/giảm), thành tiền
    - Nút xóa sản phẩm
    - Thông báo “Hết hàng” (nếu có)
  - Nút “Tiếp tục mua sắm” (link)
- **Cột phải:**
  - Khối tóm tắt đơn hàng
    - Tổng tiền sản phẩm
    - Phí vận chuyển (tạm thời)
    - Tổng cộng
    - Nút “Tiến hành thanh toán”
- **Trạng thái giỏ trống:** Thông báo + hình minh họa + nút “Mua sắm ngay”
- **Loading skeleton:** Cho cả danh sách và khối tóm tắt
- **Xử lý lỗi** (hết hàng, số lượng vượt tồn kho, mất kết nối)
- **Responsive** đầy đủ trên các thiết bị

---

## 8. Lưu ý đặc biệt từ database

- `ChiTietGioHang` có cột `PhanLoaiId`. Nếu sản phẩm có phân loại, phải hiển thị đúng tên phân loại (JOIN với `PhanLoai`). Khi thêm vào giỏ từ trước, thông tin phân loại đã được lưu.
- Giá `DonGia` trong `ChiTietGioHang` được lưu tại thời điểm thêm, không tự động thay đổi theo giá sản phẩm gốc. Điều này đảm bảo tính nhất quán cho giỏ hàng hiện tại.
- Khi thanh toán, dữ liệu từ `ChiTietGioHang` sẽ được sao chép sang `ChiTietDonHang` (cùng `SanPhamId`, `PhanLoaiId`, `SoLuong`, `DonGia`). Sau đó giỏ hàng sẽ được xóa hoặc đánh dấu đã xử lý.
- Cần kiểm tra tồn kho thực tế (cột `SoLuong` trong `SanPham`) trước khi cho phép thanh toán, vì số lượng có thể thay đổi sau khi người dùng thêm vào giỏ.

---

Kế hoạch này cung cấp đầy đủ mô tả để triển khai trang giỏ hàng của ZenTekExchange, bám sát cấu trúc database, có responsive, xử lý cập nhật số lượng, xóa sản phẩm, tính tổng tiền, và điều hướng sang thanh toán.
```

-----------------phân tách ----------------------

# Kế hoạch thiết kế trang đặt hàng (Checkout) – ZenTekExchange

> **Phạm vi:** Chỉ phần thân trang checkout (main content), không bao gồm header, footer, danh mục (đã có component layout riêng).  
> **Mục tiêu:** Mô tả chi tiết quy trình nhập thông tin giao hàng, xác nhận đơn hàng, xử lý thanh toán, hiển thị thông báo kết quả và điều hướng.  
> **Kỹ thuật:** ReactJS, TailwindCSS, responsive.  
> **Dữ liệu:** Bám sát database `ZenTekExchange` – các bảng `DonHang`, `ChiTietDonHang`, `GioHang`, `ChiTietGioHang`, `SanPham`, `NguoiDung`, `CuaHang`. Địa chỉ lấy từ API hoặc bảng có sẵn (giả định có bảng `TinhThanh`, `QuanHuyen`, `PhuongXa` hoặc dùng API bên ngoài).

---

## 1. Bố cục tổng thể của trang checkout

Trang checkout có bố cục hai cột (trên desktop) hoặc xếp chồng (trên mobile):

| Cột          | Nội dung                               | Độ rộng (desktop) |
| ------------ | -------------------------------------- | ----------------- |
| **Cột trái** | Biểu mẫu nhập thông tin giao hàng      | 2/3 (flex: 2)     |
| **Cột phải** | Tóm tắt đơn hàng (sản phẩm, tổng tiền) | 1/3 (flex: 1)     |

Trên mobile: cột trái ở trên, cột phải ở dưới, mỗi cột full width.

Trang chỉ hiển thị nếu giỏ hàng có ít nhất một sản phẩm hợp lệ (còn hàng). Nếu giỏ trống hoặc có sản phẩm hết hàng, chuyển hướng về giỏ hàng kèm thông báo lỗi.

---

## 2. Dữ liệu hiển thị – Nguồn từ database

### 2.1 Thông tin người dùng (tự động điền nếu đã đăng nhập)

- **Bảng:** `NguoiDung`
- **Các trường:** `HoTen`, `SoDienThoai`, `Email`
- Nếu người dùng đã đăng nhập, các trường này được tự động điền vào biểu mẫu và có thể sửa.
- Nếu chưa đăng nhập, yêu cầu nhập đầy đủ họ tên, số điện thoại, email (có thể tạo tài khoản sau).

### 2.2 Danh sách sản phẩm từ giỏ hàng

- **Bảng:** `ChiTietGioHang` kết hợp `SanPham`, `AnhSanPham`, `PhanLoai`, `CuaHang`
- Lấy giống như trang giỏ hàng: ảnh, tên, phân loại, đơn giá, số lượng, thành tiền.
- Tổng tiền đơn hàng được tính từ các dòng này (có thể cộng thêm phí vận chuyển – tạm thời bỏ qua).

### 2.3 Dữ liệu địa chỉ (dropdown cascade)

- **Nguồn:** Có thể dùng API miễn phí (ví dụ: https://provinces.open-api.vn) hoặc có sẵn các bảng `TinhThanh`, `QuanHuyen`, `PhuongXa` trong database.
- **Các bảng giả định:**
  - `TinhThanh`: `MaTinh`, `TenTinh`
  - `QuanHuyen`: `MaQuan`, `TenQuan`, `MaTinh`
  - `PhuongXa`: `MaPhuong`, `TenPhuong`, `MaQuan`
- Khi người dùng chọn tỉnh/thành → gọi API lấy danh sách quận/huyện thuộc tỉnh đó.  
  Chọn quận/huyện → gọi API lấy danh sách phường/xã.  
  Chọn phường/xã → hiển thị tên đầy đủ để ghép vào địa chỉ.

### 2.4 Thông tin đơn hàng cần lưu

- **Bảng `DonHang`:** Sau khi đặt hàng thành công, tạo bản ghi với:
  - `NguoiMuaId` (ID người dùng hiện tại, nếu chưa có tài khoản thì tạo mới hoặc lưu thông tin khách vãng lai – tuỳ chiến lược)
  - `HoTenNguoiNhan`, `SoDienThoaiNguoiNhan`, `DiaChiNhan` (lưu địa chỉ đầy đủ dạng text, bao gồm số nhà, đường, phường/xã, quận/huyện, tỉnh/thành)
  - `TrangThaiDon` = `N'Chờ xử lý'`
  - `NgayTao`, `NgayCapNhat` = thời điểm hiện tại
- **Bảng `ChiTietDonHang`:** Mỗi sản phẩm trong giỏ tạo một bản ghi với:
  - `DonHangId`, `SanPhamId`, `PhanLoaiId` (nếu có)
  - `SoLuong`, `DonGia` (lấy từ `ChiTietGioHang`)
  - `GhiChu` (có thể nhập thêm từ người dùng)
- Sau khi tạo đơn, xóa toàn bộ `ChiTietGioHang` tương ứng với giỏ hàng hiện tại (hoặc đánh dấu đã thanh toán).

---

## 3. Cấu trúc chi tiết từng phần

### 3.1. Biểu mẫu thông tin giao hàng (cột trái)

Biểu mẫu gồm các nhóm trường:

- **Thông tin người nhận:**
  - Họ và tên (bắt buộc, text)
  - Số điện thoại (bắt buộc, số, 10 chữ số)
  - Email (bắt buộc, định dạng email)

- **Địa chỉ giao hàng:**
  - **Tỉnh/Thành phố:** Dropdown, dữ liệu từ `TinhThanh`. Khi thay đổi sẽ load danh sách quận/huyện.
  - **Quận/Huyện:** Dropdown, dữ liệu từ `QuanHuyen` theo `MaTinh` đã chọn. Khi thay đổi sẽ load danh sách phường/xã.
  - **Phường/Xã:** Dropdown, dữ liệu từ `PhuongXa` theo `MaQuan` đã chọn.
  - **Địa chỉ cụ thể:** Input text (số nhà, tên đường) – bắt buộc.

- **Ghi chú đơn hàng (không bắt buộc):**
  - Textarea, lưu vào `ChiTietDonHang.GhiChu` hoặc một cột riêng (nếu có)

- **Phương thức thanh toán (nếu có nhiều):**
  - Tạm thời chỉ hỗ trợ “Thanh toán khi nhận hàng (COD)” để đơn giản.

**Hiển thị:** Mỗi trường có label, input/dropdown full width, khoảng cách dọc. Kiểm tra lỗi real-time (số điện thoại, email, địa chỉ bắt buộc). Dropdown cascade có trạng thái loading khi chuyển cấp.

### 3.2. Tóm tắt đơn hàng (cột phải)

- **Danh sách sản phẩm (rút gọn):**
  - Mỗi dòng: Ảnh nhỏ (40x40), tên sản phẩm + phân loại (ngắn), số lượng, thành tiền.
  - Có thể cuộn nếu nhiều sản phẩm (max-height 300px).
- **Tổng tiền sản phẩm:** Hiển thị tổng cộng (định dạng VND).
- **Phí vận chuyển:** Tạm thời để “Liên hệ” hoặc “0đ”.
- **Tổng cộng:** Bằng tổng tiền sản phẩm.
- **Nút “Đặt hàng”:** Gửi biểu mẫu, tạo đơn hàng.

### 3.3. Xử lý khi nhấn “Đặt hàng”

1. Kiểm tra client-side: các trường bắt buộc đã nhập (họ tên, số điện thoại, email, tỉnh, huyện, xã, địa chỉ cụ thể), định dạng hợp lệ.
2. Ghép địa chỉ hoàn chỉnh: `Địa chỉ cụ thể, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố`
3. Kiểm tra lại giỏ hàng trên server (còn hàng, không thay đổi số lượng).
4. Tạo bản ghi `DonHang` và `ChiTietDonHang` trong transaction.
5. Xóa giỏ hàng hiện tại (các `ChiTietGioHang`).
6. Trả về `MaDonHang` cho client.
7. Hiển thị thông báo thành công với hai lựa chọn:
   - **Xem chi tiết đơn hàng** → chuyển đến trang đơn hàng vừa tạo (ví dụ: `/don-hang/{MaDonHang}`)
   - **Về trang chủ** → chuyển về home

Trong trường hợp lỗi (hết hàng, mất kết nối, validation fail), hiển thị thông báo lỗi, giữ nguyên biểu mẫu và dữ liệu đã nhập.

---

## 4. Thông báo sau khi đặt hàng thành công

- **Loại thông báo:** Modal (popup) hoặc một trang xác nhận riêng (redirect). Đề xuất dùng **modal thông báo** để không làm gián đoạn trải nghiệm, nhưng vẫn có thể chuyển hướng.
- **Nội dung modal:**
  - Tiêu đề: “Đặt hàng thành công!”
  - Nội dung: “Cảm ơn bạn đã mua hàng. Mã đơn hàng: #ABCD1234”
  - Hai nút:
    - “Xem đơn hàng” → chuyển đến trang `/don-hang/{maDonHang}`
    - “Tiếp tục mua sắm” → chuyển về trang chủ (`/`)
- **Hành vi:** Modal tự động hiển thị, background mờ, không thể click ra ngoài (bắt buộc chọn một trong hai hướng).
- **Nếu không dùng modal:** Có thể chuyển hướng đến trang xác nhận đơn hàng riêng (ví dụ `/dat-hang-thanh-cong?donHangId=...`), trang này hiển thị thông tin đơn hàng và hai nút tương tự.

---

## 5. Luồng dữ liệu và API (mô tả)

### 5.1. Lấy dữ liệu địa chỉ (cascade)

- **Tỉnh/Thành:** Gọi `GET /api/provinces` lấy toàn bộ danh sách.
- **Quận/Huyện:** Gọi `GET /api/districts?provinceId={maTinh}` khi chọn tỉnh.
- **Phường/Xã:** Gọi `GET /api/wards?districtId={maQuan}` khi chọn quận/huyện.
- Có thể gộp chung một endpoint hoặc dùng API bên ngoài.

### 5.2. Khi vào trang checkout

- Gọi API `GET /api/cart/checkout-data` để lấy:
  - Thông tin người dùng hiện tại (nếu đã đăng nhập)
  - Danh sách sản phẩm trong giỏ (tính tổng tiền)
- Nếu giỏ trống hoặc có sản phẩm hết hàng, redirect về giỏ hàng với thông báo lỗi.

### 5.3. Gửi đơn hàng

- `POST /api/orders` với body:
  ```json
  {
    "hoTen": "Nguyễn Văn A",
    "soDienThoai": "0912345678",
    "email": "a@example.com",
    "diaChi": "123 Đường ABC, Phường XYZ, Quận 1, TP.HCM",
    "ghiChu": "Giao hàng giờ hành chính",
    "phuongThucThanhToan": "COD"
  }
  ```

--------------Phân tách------------

```markdown
# Kế hoạch thiết kế trang “Đơn mua” và “Hóa đơn bán hàng” – ZenTekExchange

> **Phạm vi:** Chỉ phần thân trang (main content), không bao gồm header, footer, danh mục (đã có component layout riêng).  
> **Kỹ thuật:** ReactJS, TailwindCSS, responsive.  
> **Dữ liệu:** Bám sát database `ZenTekExchange` – các bảng `DonHang`, `ChiTietDonHang`, `SanPham`, `AnhSanPham`, `CuaHang`, `DanhGiaSanPham`.

---

## 1. Trang “Đơn mua” (Lịch sử mua hàng)

**Mục đích:** Hiển thị danh sách các đơn hàng của người dùng đã mua, cho phép lọc theo trạng thái. Tham khảo giao diện Shopee nhưng cắt giảm, chỉ giữ các tab trạng thái: **Tất cả**, **Chờ xử lý**, **Đã hủy**, **Đang giao**, **Đã nhận**.

> **Lưu ý:** “Tất cả” là tùy chọn hiển thị toàn bộ đơn hàng, không phải giá trị trong database. Các trạng thái còn lại tương ứng với cột `TrangThaiDon` trong bảng `DonHang` (giá trị: `N'Chờ xử lý'`, `N'Đã hủy'`, `N'Đang giao'`, `N'Đã nhận'`).

### 1.1. Bố cục tổng thể

Trang gồm:

- **Thanh tab** để lọc trạng thái (5 tab: Tất cả, Chờ xử lý, Đang giao, Đã nhận, Đã hủy – thứ tự có thể sắp xếp logic).
- **Danh sách đơn hàng** dạng card (mỗi đơn hàng là một khối riêng).
- **Phân trang** (nếu nhiều đơn hàng).

### 1.2. Dữ liệu hiển thị

- **Nguồn:** Bảng `DonHang` kết hợp `ChiTietDonHang`, `SanPham`, `AnhSanPham`, `CuaHang`.
- **Lọc theo người mua:** `DonHang.NguoiMuaId = {id người dùng hiện tại}`.
- **Lọc theo trạng thái:** Nếu tab không phải “Tất cả”, thêm điều kiện `DonHang.TrangThaiDon = N'...'`.
- **Sắp xếp:** Theo `NgayTao` giảm dần (đơn mới nhất lên đầu).
- **Phân trang:** Mỗi lần tải 5–10 đơn hàng, dùng offset/limit.

### 1.3. Cấu trúc một card đơn hàng

Mỗi đơn hàng hiển thị:

- **Thông tin chung:**
  - Mã đơn hàng (hiển thị dạng rút gọn, ví dụ `#DH001`)
  - Ngày đặt hàng (`NgayTao`)
  - Trạng thái đơn hàng (badge màu: Chờ xử lý – vàng, Đang giao – xanh, Đã nhận – xanh lá, Đã hủy – đỏ)

- **Danh sách sản phẩm trong đơn (tóm tắt):**
  - Mỗi dòng sản phẩm gồm: ảnh nhỏ (50x50), tên sản phẩm, phân loại (nếu có), số lượng, đơn giá.
  - Có thể hiển thị tối đa 2–3 dòng, nếu nhiều thì thu gọn + xem thêm.

- **Tổng tiền đơn hàng:** (tổng thành tiền của các sản phẩm).
- **Nút hành động (tuỳ theo trạng thái):**
  - **Chờ xử lý:** Nút “Hủy đơn” (gọi API cập nhật trạng thái thành `N'Đã hủy'`), nút “Liên hệ người bán” (chuyển đến chat).
  - **Đang giao:** Nút “Đã nhận hàng” (xác nhận đã nhận, cập nhật thành `N'Đã nhận'`), nút “Liên hệ người bán”.
  - **Đã nhận:** Nút “Mua lại” (thêm các sản phẩm vào giỏ), nút “Đánh giá” (nếu chưa đánh giá – hiển thị modal).
  - **Đã hủy:** Nút “Mua lại” (thêm vào giỏ).

> **Lưu ý:** “Liên hệ người bán” sẽ mở cuộc trò chuyện với cửa hàng tương ứng (mỗi đơn có thể nhiều cửa hàng, cần xác định). Để đơn giản, có thể liên hệ với từng cửa hàng qua nút riêng.

### 1.4. Tương tác và xử lý

- **Khởi tạo:** Gọi API `GET /api/orders?status={tab}&limit=10&offset=0`. Hiển thị skeleton loading.
- **Chuyển tab:** Reset offset, gọi lại API với status mới.
- **Hủy đơn:** Hiện confirm, nếu OK thì gọi `PUT /api/orders/{orderId}/cancel`. Sau thành công cập nhật lại danh sách (hoặc reload tab).
- **Đã nhận hàng:** Gọi `PUT /api/orders/{orderId}/confirm-received`. Cập nhật trạng thái.
- **Mua lại:** Lấy danh sách `ChiTietDonHang` của đơn đó, gọi API thêm từng sản phẩm vào giỏ hiện tại (kiểm tra tồn kho, phân loại). Thông báo thành công.
- **Đánh giá:** Mở modal (xem chi tiết ở phần “Hóa đơn bán hàng”).

### 1.5. Responsive

- Desktop: Card đơn hàng hiển thị đầy đủ thông tin, các nút nằm ngang.
- Mobile: Card xếp dọc, các nút xếp thành cột, ảnh sản phẩm nhỏ hơn.

---

## 2. Trang “Hóa đơn bán hàng” (Chi tiết đơn hàng từ góc nhìn người mua)

**Mục đích:** Hiển thị chi tiết một đơn hàng cụ thể (hóa đơn), tham khảo Shopee, có các nút: **Đánh giá**, **Liên hệ người bán**, **Mua lại**. Trang này thường được truy cập từ danh sách đơn mua bằng cách click vào đơn hàng.

> **Lưu ý:** “Hóa đơn bán hàng” ở đây hiểu là trang chi tiết đơn hàng dành cho người mua, không phải hóa đơn dành cho người bán.

### 2.1. Bố cục tổng thể

Trang chia làm 2 phần chính:

- **Thông tin đơn hàng:** Mã đơn, trạng thái, ngày đặt, địa chỉ giao hàng, thông tin người nhận.
- **Danh sách sản phẩm:** Chi tiết từng sản phẩm trong đơn, kèm theo ảnh, tên, phân loại, số lượng, đơn giá, thành tiền.
- **Tổng kết:** Tổng tiền hàng, phí vận chuyển (nếu có), tổng cộng.
- **Khu vực nút hành động** (phía trên hoặc dưới cùng): **Đánh giá**, **Liên hệ người bán**, **Mua lại**.

### 2.2. Dữ liệu hiển thị

- **Nguồn:** `DonHang` JOIN `ChiTietDonHang`, `SanPham`, `AnhSanPham`, `CuaHang`, `DanhGiaSanPham` (để biết đã đánh giá chưa).
- **Điều kiện:** `DonHang.MaDonHang = {id từ URL}` và `NguoiMuaId` khớp với người dùng hiện tại (bảo mật).
- **Lấy thông tin:** `HoTenNguoiNhan`, `SoDienThoaiNguoiNhan`, `DiaChiNhan`, `NgayTao`, `TrangThaiDon`, danh sách sản phẩm.

### 2.3. Cấu trúc chi tiết từng phần

#### Thông tin đơn hàng (tóm tắt)

- Mã đơn hàng
- Ngày đặt
- Trạng thái (badge)
- Địa chỉ nhận hàng
- Tên người nhận, số điện thoại

#### Danh sách sản phẩm (dạng bảng hoặc card ngang)

Mỗi dòng sản phẩm bao gồm:

- Ảnh (60x60)
- Tên sản phẩm (link đến chi tiết)
- Phân loại (nếu có)
- Đơn giá
- Số lượng
- Thành tiền

#### Khu vực nút hành động

- **Đánh giá:** Chỉ hiển thị nếu đơn hàng đã ở trạng thái `Đã nhận` và người dùng chưa đánh giá sản phẩm nào trong đơn (có thể đánh giá từng sản phẩm riêng hoặc đánh giá chung cho đơn). Thiết kế tham khảo Shopee: Mỗi sản phẩm có nút “Đánh giá” riêng, nhưng yêu cầu chỉ có một nút “Đánh giá” chung? Cần làm rõ: Theo mô tả “có nút Đánh giá”, để đơn giản, tôi thiết kế nút “Đánh giá” ở đầu trang, khi click hiện modal cho phép đánh giá các sản phẩm trong đơn (có thể chọn sản phẩm). Tuy nhiên, thực tế Shopee thường có đánh giá riêng từng sản phẩm. Tôi sẽ chọn phương án: **Mỗi sản phẩm có một nút “Đánh giá” riêng** (chỉ hiển thị nếu đơn đã nhận và chưa đánh giá sản phẩm đó). Nút “Đánh giá” trong yêu cầu có thể hiểu là tính năng đánh giá, không nhất thiết chỉ một nút duy nhất.
- **Liên hệ người bán:** Dẫn đến trang chat với cửa hàng của sản phẩm (nếu đơn có nhiều cửa hàng, cần chọn shop để chat – có thể có nút “Liên hệ” cho từng shop).
- **Mua lại:** Thêm tất cả sản phẩm trong đơn vào giỏ hàng hiện tại.

Để đáp ứng yêu cầu “có nút Đánh giá, có nút Liên hệ người bán, có nút Mua Lại”, tôi sẽ bố trí 3 nút này ở phía trên cùng của trang (cạnh thông tin đơn hàng) hoặc dưới cùng. Tuy nhiên, để tránh rối, có thể đặt ở header của trang.

**Quyết định:** Đặt 3 nút ở khu vực phía trên, bên phải thông tin đơn hàng.

- Nút “Đánh giá”: chỉ hiện khi đơn đã nhận. Click mở modal đánh giá (cho phép đánh giá từng sản phẩm chưa được đánh giá).
- Nút “Liên hệ người bán”: mở hộp thoại chat với người bán (cần xác định shop nào? Có thể liên hệ shop đầu tiên hoặc hiển thị danh sách shop). Đơn giản: liên hệ với shop của sản phẩm đầu tiên.
- Nút “Mua lại”: luôn hiển thị (trừ đơn đã hủy? vẫn có thể mua lại).

### 2.4. Modal đánh giá

Khi click nút “Đánh giá”, mở modal với:

- Danh sách các sản phẩm trong đơn **chưa được đánh giá** (kiểm tra bảng `DanhGiaSanPham` với `DonHangId` và `NguoiMuaId`).
- Mỗi sản phẩm cho phép chọn số sao (1–5), nhập nội dung đánh giá (text), có thể thêm ảnh/video (tuỳ chọn – gắn với bảng `PhanHoiMedia` nhưng bỏ qua nếu phức tạp).
- Nút “Gửi đánh giá”: Gọi API `POST /api/reviews` cho từng sản phẩm, lưu vào `DanhGiaSanPham` (các trường `SoSao`, `NoiDung`, `DonHangId`, `SanPhamId`, `NguoiMuaId`). Có thể thêm ảnh sau.
- Sau khi gửi, cập nhật lại trạng thái (ẩn nút đánh giá cho sản phẩm đó).

### 2.5. Responsive

- Desktop: bố trí 2 cột cho thông tin và sản phẩm (hoặc 1 cột dài).
- Mobile: thông tin đơn hàng xếp dọc, bảng sản phẩm chuyển thành card, các nút hành động xếp chồng.

---

## 3. Tóm tắt các thành phần chính

### Trang “Đơn mua”

- [x] Thanh tab: Tất cả, Chờ xử lý, Đang giao, Đã nhận, Đã hủy
- [x] Danh sách đơn hàng dạng card
- [x] Mỗi card: mã đơn, ngày, trạng thái, danh sách sản phẩm (tóm tắt), tổng tiền, các nút (Hủy, Đã nhận hàng, Mua lại, Liên hệ, Đánh giá – tuỳ trạng thái)
- [x] Phân trang (offset/limit)
- [x] Responsive

### Trang “Hóa đơn bán hàng” (Chi tiết đơn)

- [x] Thông tin đơn hàng (mã, ngày, trạng thái, địa chỉ, người nhận)
- [x] Danh sách sản phẩm chi tiết (ảnh, tên, phân loại, giá, số lượng, thành tiền)
- [x] Tổng kết đơn hàng
- [x] Các nút: Đánh giá, Liên hệ người bán, Mua lại
- [x] Modal đánh giá (sao, nội dung, gửi)
- [x] Responsive

---

## 4. Lưu ý đặc biệt từ database

- `TrangThaiDon` có các giá trị: `N'Chờ xử lý'`, `N'Đã hủy'`, `N'Đang giao'`, `N'Đã nhận'`. Không có `N'Hoàn thành'` riêng, `Đã nhận` được coi là hoàn thành.
- Khi người dùng xác nhận “Đã nhận hàng” từ trang đơn mua (đối với đơn đang giao), cần cập nhật `TrangThaiDon` thành `N'Đã nhận'`.
- Đánh giá sản phẩm: bảng `DanhGiaSanPham` có cột `DonHangId` để biết đánh giá thuộc đơn hàng nào. Một sản phẩm trong một đơn hàng chỉ được đánh giá một lần (có thể dùng unique constraint).
- Ảnh đánh giá lưu trong bảng `PhanHoiMedia` với `LoaiPhanHoi = 'danh_gia'`, nhưng để đơn giản có thể bỏ qua trong giai đoạn đầu.
- “Liên hệ người bán”: cần dẫn đến trang chat với `CuaHang` tương ứng. Trong database, mỗi sản phẩm thuộc một cửa hàng. Có thể dùng `CuocTroChuyen` và `ThanhVienCuocTroChuyen` để tạo chat room giữa người mua và chủ shop.

---

Kế hoạch này cung cấp đầy đủ mô tả để triển khai hai trang “Đơn mua” và “Hóa đơn bán hàng”, bám sát database ZenTekExchange, có các nút tương tác và modal đánh giá.
```

```markdown
# Kế hoạch thiết kế trang “Quản lý đơn hàng” và “Thông tin đơn hàng” (Vai trò Người bán) – ZenTekExchange

> **Phạm vi:** Chỉ phần thân trang (main content), không bao gồm header, footer, danh mục (đã có component layout riêng).  
> **Vai trò:** Người bán (chủ cửa hàng).  
> **Kỹ thuật:** ReactJS, TailwindCSS, responsive.  
> **Dữ liệu:** Bám sát database `ZenTekExchange` – các bảng `DonHang`, `ChiTietDonHang`, `SanPham`, `AnhSanPham`, `CuaHang`, `NguoiDung`.

> **Nguyên tắc:** Thiết kế tương tự các trang “Đơn mua” và “Hóa đơn bán hàng” của khách hàng, nhưng điều chỉnh chức năng, nút hành động và quyền truy cập phù hợp với vai trò **người bán** (quản lý đơn hàng của cửa hàng mình).

---

## 1. Trang “Quản lý đơn hàng” (dành cho người bán)

**Mục đích:** Hiển thị danh sách các đơn hàng có chứa sản phẩm thuộc cửa hàng của người bán đang đăng nhập. Cho phép lọc theo trạng thái, xem chi tiết, cập nhật trạng thái đơn hàng (xác nhận, đóng gói, giao hàng, hủy).

### 1.1. Bố cục tổng thể

Trang gồm:

- **Thanh tab** lọc trạng thái (5 tab): Tất cả, Chờ xử lý, Đang giao, Đã nhận, Đã hủy.
- **Danh sách đơn hàng** dạng card (mỗi đơn hàng là một khối).
- **Phân trang** (offset/limit, mỗi lần 5–10 đơn).

### 1.2. Dữ liệu hiển thị

- **Nguồn:** Bảng `DonHang` kết hợp `ChiTietDonHang`, `SanPham`, `CuaHang`.
- **Lọc theo người bán:** `CuaHang.NguoiBanId = {id người dùng hiện tại}` (mỗi người bán có một cửa hàng duy nhất, lấy từ `CuaHang` dựa trên `NguoiBanId`).
- **Lọc theo trạng thái:** Tương tự khách hàng, trừ tab “Tất cả” (không có trong DB).
- **Nhóm đơn hàng:** Một đơn hàng có thể gồm sản phẩm từ nhiều cửa hàng khác nhau. Trong danh sách của người bán, mỗi đơn hàng chỉ hiển thị **các sản phẩm thuộc cửa hàng của họ** (các sản phẩm của shop khác trong cùng đơn sẽ không hiển thị ở đây). Tuy nhiên, để đơn giản và dễ quản lý, mỗi đơn hàng nên được hiển thị như một card riêng, bên trong chỉ liệt kê các sản phẩm của shop hiện tại.
- **Sắp xếp:** Theo `NgayTao` giảm dần.

### 1.3. Cấu trúc một card đơn hàng (góc nhìn người bán)

Mỗi card hiển thị:

- **Thông tin chung:**
  - Mã đơn hàng (link đến trang chi tiết)
  - Ngày đặt hàng (`NgayTao`)
  - Trạng thái đơn hàng (badge màu)
  - Thông tin người nhận (họ tên, số điện thoại, địa chỉ – rút gọn)

- **Danh sách sản phẩm của shop (trong đơn này):**
  - Mỗi dòng: ảnh nhỏ (50x50), tên sản phẩm, phân loại (nếu có), số lượng, đơn giá, thành tiền.

- **Tổng tiền phần của shop:** Tổng thành tiền các sản phẩm thuộc shop (không phải toàn đơn hàng).

- **Các nút hành động (theo trạng thái hiện tại):**
  - **Chờ xử lý:**
    - “Xác nhận đơn” (chuyển trạng thái thành `Đang giao` hoặc một trạng thái trung gian như “Đang chuẩn bị” – nhưng trong DB chỉ có `Đang giao`. Đề xuất: gọi là “Xác nhận và chuyển giao”)
    - “Hủy đơn” (chuyển thành `Đã hủy`, cần lý do)
  - **Đang giao:**
    - “Cập nhật vận chuyển” (tùy chọn, có thể bỏ qua)
    - “Xác nhận đã giao” (nếu người mua chưa xác nhận, người bán có thể tự xác nhận – nhưng thường không nên)
  - **Đã nhận:** Chỉ xem, không có nút tác động (trừ “Liên hệ người mua”).
  - **Đã hủy:** Chỉ xem, không có nút tác động.

- **Nút chung:**
  - “Liên hệ người mua” (mở chat với khách hàng)
  - “Xem chi tiết” (dẫn đến trang “Thông tin đơn hàng” bên dưới)

### 1.4. Tương tác và xử lý

- **Khởi tạo:** Gọi API `GET /api/seller/orders?status={tab}&limit=10&offset=0`. Hiển thị skeleton.
- **Chuyển tab:** Reset offset, gọi lại API.
- **Xác nhận đơn (Chờ xử lý → Đang giao):** Gọi `PUT /api/seller/orders/{orderId}/confirm`, cập nhật trạng thái đơn hàng thành `Đang giao`. Lưu ý: Nếu đơn hàng có sản phẩm từ nhiều shop, chỉ shop hiện tại xác nhận phần của mình? Nhưng trạng thái đơn hàng là chung cho toàn đơn. Cần cơ chế: đơn hàng chỉ chuyển sang `Đang giao` khi **tất cả các shop trong đơn đều xác nhận**? Để đơn giản, giả định mỗi đơn hàng chỉ có sản phẩm từ một shop (hoặc hệ thống tách đơn theo shop). Trong database hiện tại không có cơ chế tách, nên tạm coi mỗi đơn chỉ thuộc một shop. Nếu không, cần thiết kế bảng trung gian. **Khuyến nghị:** Ở bước hiện tại, giả định mỗi đơn hàng chỉ gồm sản phẩm của một cửa hàng (điều này có thể đảm bảo bằng logic giỏ hàng và thanh toán). Như vậy, người bán sẽ quản lý toàn bộ đơn hàng đó.
- **Hủy đơn (Chờ xử lý → Đã hủy):** Gọi `PUT /api/seller/orders/{orderId}/cancel`, yêu cầu nhập lý do hủy (lưu vào `LyDoHuy` của `DonHang`).
- **Liên hệ người mua:** Mở chat với `NguoiMuaId` (tạo cuộc trò chuyện hoặc dẫn đến trang chat).

### 1.5. Responsive

- Desktop: Card hiển thị đầy đủ thông tin, các nút nằm ngang.
- Mobile: Card xếp dọc, các nút xếp thành cột.

---

## 2. Trang “Thông tin đơn hàng” (dành cho người bán)

**Mục đích:** Hiển thị chi tiết toàn bộ đơn hàng (dưới góc nhìn của người bán), bao gồm thông tin khách hàng, danh sách sản phẩm của shop, tổng tiền, lịch sử cập nhật trạng thái, và các nút hành động tương tự như trên trang quản lý.

### 2.1. Bố cục tổng thể

Trang chia làm 3 phần chính:

- **Thông tin đơn hàng:** Mã đơn, ngày đặt, trạng thái, thông tin người nhận (họ tên, số điện thoại, địa chỉ).
- **Danh sách sản phẩm (chỉ của shop này):** Chi tiết từng sản phẩm (ảnh, tên, phân loại, số lượng, đơn giá, thành tiền).
- **Tổng kết:** Tổng tiền sản phẩm, phí vận chuyển (nếu có), tổng cộng.
- **Khu vực nút hành động:** (phía trên hoặc dưới) gồm các nút phù hợp với trạng thái hiện tại: Xác nhận đơn, Hủy đơn, Liên hệ người mua, … và nút “In hóa đơn” (tùy chọn).

### 2.2. Dữ liệu hiển thị

- **Nguồn:** `DonHang` JOIN `ChiTietDonHang`, `SanPham`, `AnhSanPham`, `CuaHang`, `NguoiDung` (người mua).
- **Điều kiện:** `DonHang.MaDonHang = {id từ URL}` và `CuaHang.NguoiBanId = {id người bán hiện tại}` (đảm bảo đơn hàng có chứa sản phẩm của shop này).
- **Lấy thông tin:** `HoTenNguoiNhan`, `SoDienThoaiNguoiNhan`, `DiaChiNhan`, `NgayTao`, `TrangThaiDon`, `LyDoHuy`, danh sách sản phẩm (chỉ lọc `SanPham.CuaHangId` thuộc shop của người bán).

### 2.3. Cấu trúc chi tiết từng phần

#### Thông tin đơn hàng (tóm tắt)

- Mã đơn hàng
- Ngày đặt
- Trạng thái (badge)
- Thông tin người nhận (họ tên, số điện thoại, địa chỉ)
- Nếu đơn bị hủy: hiển thị lý do hủy (`LyDoHuy`)

#### Danh sách sản phẩm

Hiển thị dạng bảng (desktop) hoặc card (mobile), mỗi dòng:

- Ảnh (60x60)
- Tên sản phẩm (link đến chi tiết sản phẩm)
- Phân loại (nếu có)
- Đơn giá
- Số lượng
- Thành tiền

#### Tổng kết

- Tổng tiền sản phẩm (của shop)
- Phí vận chuyển (nếu có, tạm thời bỏ qua)
- Tổng cộng

#### Khu vực nút hành động

Đặt ở đầu trang (cạnh thông tin) hoặc cuối trang. Gồm:

- **Xác nhận đơn** (chỉ hiển thị nếu trạng thái = `Chờ xử lý`)
- **Hủy đơn** (chỉ hiển thị nếu trạng thái = `Chờ xử lý` hoặc `Đang giao`? Thường chỉ hủy được khi chưa giao)
- **Liên hệ người mua** (luôn hiển thị, mở chat)
- **In hóa đơn** (tùy chọn)

### 2.4. Modal xác nhận / hủy đơn (tương tự trang quản lý)

- Khi nhấn “Hủy đơn”, mở modal nhập lý do hủy.
- Khi nhấn “Xác nhận đơn”, hiển thị confirm, sau đó gọi API cập nhật trạng thái thành `Đang giao`.

### 2.5. Responsive

- Desktop: Bố trí 2 cột cho thông tin và tổng kết (hoặc 1 cột). Bảng sản phẩm có thể cuộn ngang.
- Mobile: Chuyển bảng thành danh sách dạng card, thông tin xếp dọc, các nút xếp chồng.

---

## 3. Tóm tắt các thành phần chính

### Trang “Quản lý đơn hàng” (seller)

- [x] Thanh tab lọc trạng thái (Tất cả, Chờ xử lý, Đang giao, Đã nhận, Đã hủy)
- [x] Danh sách đơn hàng dạng card, mỗi card gồm:
  - Mã đơn (link chi tiết), ngày đặt, trạng thái
  - Thông tin người nhận (tóm tắt)
  - Danh sách sản phẩm của shop (ảnh, tên, số lượng, giá)
  - Tổng tiền phần shop
  - Các nút: Xác nhận đơn, Hủy đơn, Liên hệ người mua (tùy trạng thái)
- [x] Phân trang (offset/limit)
- [x] Responsive

### Trang “Thông tin đơn hàng” (seller)

- [x] Thông tin đơn hàng đầy đủ (mã, ngày, trạng thái, thông tin người nhận, lý do hủy nếu có)
- [x] Danh sách sản phẩm chi tiết (bảng/card)
- [x] Tổng kết tiền
- [x] Các nút hành động: Xác nhận đơn, Hủy đơn, Liên hệ người mua, In hóa đơn
- [x] Modal xác nhận / hủy đơn với lý do
- [x] Responsive

---

## 4. Lưu ý đặc biệt từ database và vai trò

- Người bán được xác định qua bảng `CuaHang`: `NguoiBanId` liên kết với `NguoiDung`. Mỗi người bán có một cửa hàng (do `NguoiBanId` là UNIQUE trong `CuaHang`).
- Khi truy vấn đơn hàng cho người bán, cần JOIN: `DonHang` -> `ChiTietDonHang` -> `SanPham` -> `CuaHang` với điều kiện `CuaHang.NguoiBanId = @currentUserId`. Điều này đảm bảo chỉ lấy các đơn có chứa sản phẩm của shop.
- Trạng thái đơn hàng được cập nhật bởi người bán (từ `Chờ xử lý` sang `Đang giao`), và bởi người mua (từ `Đang giao` sang `Đã nhận`). Người bán không thể tự ý chuyển sang `Đã nhận`.
- Khi người bán hủy đơn (lúc đang `Chờ xử lý`), cập nhật `TrangThaiDon = N'Đã hủy'` và ghi lý do vào `LyDoHuy`.
- Chức năng “Liên hệ người mua” sử dụng bảng `CuocTroChuyen` và `ThanhVienCuocTroChuyen` để tạo hoặc lấy cuộc trò chuyện giữa người bán (id hiện tại) và người mua (`DonHang.NguoiMuaId`).

---

Kế hoạch này cung cấp đầy đủ mô tả để triển khai hai trang quản lý đơn hàng cho người bán, bám sát database và tương thích với thiết kế của khách hàng nhưng điều chỉnh chức năng phù hợp.
```
