# Kế hoạch thiết kế trang Dashboard (Người bán) – ZenTekExchange

> **Phạm vi:** Chỉ phần thân trang dashboard (main content), không bao gồm header, footer, menu sidebar (đã có layout riêng).  
> **Vai trò:** Người bán (chủ cửa hàng).  
> **Kỹ thuật:** ReactJS, TailwindCSS, thư viện biểu đồ (ví dụ: Recharts, Chart.js).  
> **Dữ liệu:** Bám sát database `ZenTekExchange` – các bảng `DonHang`, `ChiTietDonHang`, `SanPham`, `CuaHang`, `DanhGiaSanPham`.

---

## 1. Mục đích và bố cục tổng thể

**Mục đích:** Cung cấp cho người bán cái nhìn tổng quan về hiệu suất cửa hàng: doanh thu, đơn hàng, sản phẩm bán chạy, đánh giá, xu hướng tăng trưởng theo thời gian.

**Bố cục:** Trang được chia thành các khối (cards) sắp xếp theo lưới (grid) responsive:

| Hàng     | Nội dung                                                                                                                                                            |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hàng 1   | **Các chỉ số KPI chính** (4–6 thẻ nhỏ): Tổng doanh thu, Số đơn hàng, Số sản phẩm đã bán, Đánh giá trung bình, Tỷ lệ hủy đơn, Số sản phẩm tồn kho                    |
| Hàng 2   | **Biểu đồ doanh thu & đơn hàng** (2 biểu đồ cạnh nhau hoặc 1 biểu đồ kép): Doanh thu theo tháng/tuần, Số lượng đơn hàng theo thời gian                              |
| Hàng 3   | **Biểu đồ tăng trưởng** (so sánh kỳ hiện tại với kỳ trước): % tăng trưởng doanh thu, % tăng đơn hàng, % tăng sản phẩm bán ra (dạng indicator hoặc thanh tiến trình) |
| Hàng 4   | **Bảng sản phẩm bán chạy nhất** (Top 10 sản phẩm): Tên, ảnh, số lượng đã bán, doanh thu, đánh giá trung bình                                                        |
| (Hàng 5) | **Biểu đồ đánh giá sao** (phân bố số sao 1–5) – tùy chọn                                                                                                            |

---

## 2. Dữ liệu thống kê từ database

Tất cả dữ liệu chỉ tính trên các đơn hàng **đã hoàn thành** (trạng thái `N'Đã nhận'`) và thuộc về cửa hàng của người bán hiện tại (lấy `CuaHangId` từ `NguoiBanId`).

### 2.1. Các chỉ số KPI

- **Tổng doanh thu:** `SUM(ChiTietDonHang.SoLuong * ChiTietDonHang.DonGia)` từ các đơn hàng có `TrangThaiDon = N'Đã nhận'` và sản phẩm thuộc cửa hàng.
- **Số đơn hàng:** `COUNT(DISTINCT DonHang.MaDonHang)` với điều kiện trên.
- **Số sản phẩm đã bán:** `SUM(ChiTietDonHang.SoLuong)`.
- **Đánh giá trung bình:** `AVG(DanhGiaSanPham.SoSao)` cho các sản phẩm của cửa hàng (chỉ đánh giá từ đơn đã nhận).
- **Tỷ lệ hủy đơn:** `(Số đơn bị hủy / Tổng số đơn) * 100%` (đơn hủy có `TrangThaiDon = N'Đã hủy'`).
- **Số sản phẩm tồn kho:** `SUM(SanPham.SoLuong)` cho các sản phẩm đang bán (`TrangThaiHienThi = 1`).

### 2.2. Biểu đồ doanh thu và đơn hàng theo thời gian

- **Chọn khoảng thời gian:** Mặc định 30 ngày qua hoặc 12 tháng qua. Có dropdown chọn: 7 ngày, 30 ngày, 3 tháng, 12 tháng.
- **Doanh thu theo ngày:** Nhóm theo `NgayTao` của `DonHang` (chỉ `Đã nhận`), tính tổng doanh thu mỗi ngày.
- **Số đơn hàng theo ngày:** Đếm số đơn mỗi ngày.
- **Biểu đồ đường (line chart)** hoặc cột (bar chart) hiển thị 2 đường (doanh thu và số đơn) trên cùng một biểu đồ (với 2 trục y khác nhau).

### 2.3. Tăng trưởng (so sánh kỳ hiện tại với kỳ trước)

- **Chọn mốc so sánh:** Tháng này vs tháng trước, hoặc tuần này vs tuần trước.
- **Các chỉ số tăng trưởng:**
  - Doanh thu: % thay đổi
  - Số đơn hàng: % thay đổi
  - Số sản phẩm bán ra: % thay đổi
- Hiển thị dạng thẻ nhỏ với mũi tên lên/xanh (tăng) hoặc xuống/đỏ (giảm).

### 2.4. Bảng sản phẩm bán chạy nhất

- **Top 10 sản phẩm** theo `SoLuongDaBan` (hoặc theo doanh thu thực tế từ `ChiTietDonHang`).
- **Các cột hiển thị:**
  - Ảnh sản phẩm (thumbnail)
  - Tên sản phẩm (link đến trang sản phẩm)
  - Số lượng đã bán (từ `SanPham.SoLuongDaBan` hoặc tính từ `ChiTietDonHang`)
  - Doanh thu (tổng thành tiền)
  - Đánh giá trung bình (sao)
- Có thể có phân trang nếu muốn hiển thị nhiều hơn.

### 2.5. (Tùy chọn) Biểu đồ phân bố đánh giá sao

- Đếm số lượng đánh giá cho mỗi mức sao (1–5) của các sản phẩm thuộc cửa hàng.
- Dùng biểu đồ thanh ngang (horizontal bar) hoặc biểu đồ tròn (donut).

---

## 3. Cấu trúc chi tiết từng khối

### 3.1. Hàng KPI (4–6 thẻ)

- Mỗi thẻ có nền trắng, đổ bóng nhẹ, bo góc.
- Nội dung mỗi thẻ: tiêu đề (ví dụ “Tổng doanh thu”), giá trị số lớn, đơn vị (₫ hoặc số).
- Có thể thêm biểu tượng (icon) phù hợp.
- Kích thước: trên desktop 2–4 thẻ mỗi hàng tùy số lượng, trên mobile 1 thẻ/hàng.

### 3.2. Biểu đồ doanh thu & đơn hàng

- Sử dụng thư viện biểu đồ (Recharts).
- Biểu đồ đường kết hợp: đường màu xanh cho doanh thu (trục y bên trái, đơn vị VND), đường màu cam cho số đơn (trục y bên phải).
- Có tooltip hiển thị chi tiết khi hover.
- Dropdown chọn khoảng thời gian ở góc phải biểu đồ.
- Nếu không có dữ liệu, hiển thị thông báo “Chưa có đơn hàng hoàn thành”.

### 3.3. Chỉ số tăng trưởng

- Hiển thị dưới dạng 3 thẻ nhỏ (ngang hàng với nhau) hoặc nằm trong một card riêng.
- Mỗi thẻ: tên chỉ số, giá trị hiện tại, phần trăm thay đổi, mũi tên lên/xuống, màu sắc tương ứng.
- Ví dụ: “Doanh thu tháng này: 50.000.000₫ ▲ +12% so với tháng trước”.

### 3.4. Bảng sản phẩm bán chạy

- Thiết kế dạng bảng (table) trên desktop, chuyển thành danh sách (list) trên mobile.
- Bảng gồm các cột: STT, Ảnh, Tên sản phẩm, Đã bán, Doanh thu, Đánh giá (sao).
- Mỗi dòng có thể click vào tên sản phẩm để xem chi tiết.
- Hỗ trợ phân trang (nếu nhiều hơn 10 sản phẩm).
- Có thể có nút “Xem tất cả” dẫn đến trang quản lý sản phẩm (nếu có).

### 3.5. (Tùy chọn) Biểu đồ phân bố đánh giá

- Đặt bên cạnh bảng sản phẩm hoặc ở hàng riêng.
- Dạng thanh ngang: mỗi sao một thanh, độ dài tỷ lệ với số lượng đánh giá.
- Hoặc dùng donut chart hiển thị tỷ lệ phần trăm.

---

## 4. Luồng dữ liệu và API (mô tả)

### 4.1. Khi vào dashboard

- Gọi API `GET /api/seller/dashboard/overview` để lấy các chỉ số KPI tổng hợp.
- Gọi API `GET /api/seller/dashboard/revenue-chart?period=30d` để lấy dữ liệu biểu đồ (mảng các ngày, doanh thu, số đơn).
- Gọi API `GET /api/seller/dashboard/growth?compare=month` để lấy % tăng trưởng.
- Gọi API `GET /api/seller/dashboard/top-products?limit=10` để lấy danh sách sản phẩm bán chạy.
- Tất cả API đều yêu cầu xác thực và kiểm tra quyền người bán (NguoiBanId từ token).

### 4.2. Tương tác thay đổi khoảng thời gian

- Khi người dùng chọn khoảng thời gian khác (dropdown), gọi lại API biểu đồ và tăng trưởng với tham số mới.
- Cập nhật biểu đồ và các chỉ số tăng trưởng mà không cần reload toàn trang.

### 4.3. Xử lý lỗi và loading

- Hiển thị skeleton loading cho từng khối (biểu đồ, bảng, thẻ KPI).
- Nếu API lỗi, hiển thị thông báo và nút thử lại.

---

## 5. Responsive với TailwindCSS

- **Desktop (≥1024px):** Grid 2 cột cho biểu đồ và tăng trưởng? Bố trí linh hoạt: hàng KPI 4 thẻ mỗi hàng, hàng biểu đồ chiếm full width, hàng tăng trưởng 3 thẻ ngang, hàng bảng sản phẩm full width.
- **Tablet (768px–1024px):** Giảm số thẻ KPI xuống 2-3 thẻ/hàng, bảng có thể cuộn ngang.
- **Mobile (<768px):** Mỗi khối chiếm full width, các thẻ KPI xếp dọc (1 thẻ/hàng), bảng chuyển thành danh sách dạng card cho từng sản phẩm.

---

## 6. Tóm tắt các thành phần chính

- [x] **Các thẻ KPI:** Tổng doanh thu, số đơn hàng, số sản phẩm bán, đánh giá trung bình, tỷ lệ hủy, tồn kho.
- [x] **Biểu đồ doanh thu & số đơn hàng** (line chart, chọn khoảng thời gian)
- [x] **Chỉ số tăng trưởng** (so sánh % với kỳ trước)
- [x] **Bảng sản phẩm bán chạy nhất** (Top 10, có ảnh, tên, số lượng, doanh thu, đánh giá)
- [x] (Tùy chọn) **Biểu đồ phân bố đánh giá sao**
- [x] **Loading skeleton** cho từng khối
- [x] **Xử lý lỗi** và thử lại
- [x] **Responsive** hoàn chỉnh

---

## 7. Lưu ý đặc biệt từ database

- Chỉ tính đơn hàng có `TrangThaiDon = N'Đã nhận'` mới được coi là hoàn thành. Đơn `Đang giao` chưa tính vào doanh thu.
- `CuaHang` của người bán được xác định qua `NguoiBanId`. Mỗi người bán chỉ có một cửa hàng (do `NguoiBanId` là UNIQUE trong `CuaHang`).
- `SanPham.SoLuongDaBan` có thể được cập nhật dần từ các đơn hàng đã nhận, hoặc tính trực tiếp từ `ChiTietDonHang` khi cần. Để đảm bảo chính xác, nên tính từ `ChiTietDonHang` với điều kiện `DonHang.TrangThaiDon = N'Đã nhận'`.
- Đánh giá trung bình lấy từ bảng `DanhGiaSanPham` (cột `SoSao`), chỉ lấy các đánh giá của sản phẩm thuộc cửa hàng.
- Tỷ lệ hủy đơn: đơn hủy có `TrangThaiDon = N'Đã hủy'`. Tổng số đơn bao gồm tất cả trạng thái (trừ đơn đã nhận? cần định nghĩa rõ: tổng đơn = tất cả đơn có chứa sản phẩm shop, không phân biệt trạng thái).

---

Kế hoạch này cung cấp đầy đủ mô tả để thiết kế trang dashboard cho người bán, với các biểu đồ thống kê, chỉ số tăng trưởng và bảng sản phẩm bán chạy, bám sát database ZenTekExchange và có responsive.

```markdown
# Kế hoạch thiết kế trang Dashboard (Admin) – ZenTekExchange

> **Phạm vi:** Chỉ phần thân trang dashboard (main content), không bao gồm header, footer, menu sidebar (đã có component layout riêng).  
> **Vai trò:** Quản trị viên (Admin).  
> **Kỹ thuật:** ReactJS, TailwindCSS, thư viện biểu đồ (Recharts / Chart.js).  
> **Dữ liệu:** Bám sát database `ZenTekExchange` – các bảng `NguoiDung`, `CuaHang`, `SanPham`, `DonHang`, `ChiTietDonHang`, `DanhGiaSanPham`, `VaiTro`.

> **Yêu cầu đặc biệt:** Trang chỉ hiển thị các biểu đồ tổng quát và chỉ số KPI. **Không có bảng danh sách chi tiết** (sản phẩm chờ duyệt, cửa hàng chờ xác thực, top cửa hàng, hoạt động gần đây). Có bộ lọc **khoảng thời gian (ngày/tháng)** áp dụng cho các biểu đồ và chỉ số tăng trưởng.

---

## 1. Mục đích và bố cục tổng thể

**Mục đích:** Cung cấp cho admin cái nhìn tổng quan toàn hệ thống thông qua các chỉ số chính và biểu đồ theo thời gian, có thể lọc dữ liệu theo khoảng ngày tháng tùy chọn.

**Bố cục:** Trang được chia thành các khối sắp xếp theo chiều dọc, sử dụng grid linh hoạt.

| Hàng       | Nội dung                                                                                                                                                               |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Hàng 1** | **Bộ lọc thời gian** (Dropdown hoặc Date Range Picker) – đặt ở đầu trang, căn phải hoặc giữa.                                                                          |
| **Hàng 2** | **Các thẻ KPI chính** (6–8 thẻ): Tổng người dùng, tổng cửa hàng, tổng sản phẩm, tổng đơn hàng, tổng doanh thu, đánh giá trung bình, tỷ lệ hủy đơn, sản phẩm chờ duyệt. |
| **Hàng 3** | **Biểu đồ doanh thu & số đơn hàng** (kết hợp 2 đường trên cùng biểu đồ).                                                                                               |
| **Hàng 4** | **Biểu đồ tăng trưởng** (các chỉ số so sánh với kỳ trước) – có thể hiển thị dạng thẻ hoặc thanh tiến trình.                                                            |
| **Hàng 5** | **Biểu đồ phân bố đánh giá sao** (1–5 sao) – dạng thanh ngang hoặc tròn.                                                                                               |
| **Hàng 6** | **Biểu đồ top danh mục bán chạy** (doanh thu theo danh mục) – dạng cột hoặc tròn.                                                                                      |

Tất cả các biểu đồ (trừ thẻ KPI) đều phản ánh dữ liệu trong **khoảng thời gian được chọn** ở bộ lọc. Các thẻ KPI có thể hiển thị giá trị tại thời điểm hiện tại (không lọc) hoặc cũng lọc theo thời gian – nên lọc theo thời gian để đồng bộ.

---

## 2. Bộ lọc thời gian

- **Vị trí:** Đầu trang, phía trên các thẻ KPI, căn bên phải hoặc ở giữa.
- **Loại bộ lọc:** Date Range Picker (chọn khoảng ngày) hoặc Dropdown các mốc có sẵn: Hôm nay, 7 ngày qua, 30 ngày qua, Tháng này, Tháng trước, Quý này, Năm nay, Tùy chỉnh.
- **Tác động:** Khi thay đổi khoảng thời gian, tất cả biểu đồ và các chỉ số KPI (nếu có thể tính theo khoảng) sẽ được cập nhật lại.
- **Trạng thái mặc định:** 30 ngày qua.

---

## 3. Dữ liệu thống kê và biểu đồ

### 3.1. Các thẻ KPI (chỉ số chính)

Mỗi thẻ hiển thị một chỉ số tổng quan **trong khoảng thời gian đã chọn** (hoặc tổng toàn bộ nếu không áp dụng được). Đề xuất tính các chỉ số sau:

| Chỉ số                  | Cách tính (trong khoảng thời gian)                                                                                                   | Ghi chú                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------- |
| **Tổng người dùng mới** | `COUNT(NguoiDung.MaNguoiDung)` với `NgayTao` trong khoảng                                                                            | Số người đăng ký mới                    |
| **Tổng cửa hàng mới**   | `COUNT(CuaHang.MaCuaHang)` với `NgayTao` trong khoảng                                                                                | Số shop mới mở                          |
| **Tổng sản phẩm mới**   | `COUNT(SanPham.MaSanPham)` với `NgayDang` trong khoảng                                                                               | Số sản phẩm được đăng mới               |
| **Tổng đơn hàng**       | `COUNT(DonHang.MaDonHang)` với `NgayTao` trong khoảng                                                                                | Tất cả đơn (không phân biệt trạng thái) |
| **Tổng doanh thu**      | `SUM(SoLuong * DonGia)` từ `ChiTietDonHang` JOIN `DonHang` với `DonHang.TrangThaiDon = N'Đã nhận'` và `DonHang.NgayTao` trong khoảng | Doanh thu thực tế                       |
| **Đánh giá trung bình** | `AVG(DanhGiaSanPham.SoSao)` với `NgayTao` trong khoảng                                                                               | Đánh giá mới trong kỳ                   |
| **Tỷ lệ hủy đơn**       | `(Số đơn Đã hủy trong kỳ) / (Tổng số đơn trong kỳ) * 100%`                                                                           | Tính theo phần trăm                     |
| **Sản phẩm chờ duyệt**  | `COUNT(SanPham.MaSanPham)` với `TrangThaiDuyet = N'Chờ phê duyệt'` (không lọc thời gian hoặc lọc theo `NgayDang`)                    | Cần admin chú ý                         |

> **Lưu ý:** Có thể thay thế “tổng mới” bằng “tổng lũy kế đến hiện tại” nếu muốn. Nhưng để phản ánh đúng khoảng thời gian, nên dùng “mới trong kỳ”. Riêng “sản phẩm chờ duyệt” nên là tồn kho hiện tại, không lọc thời gian.

### 3.2. Biểu đồ doanh thu & số đơn hàng

- **Loại biểu đồ:** Line chart (đường) với hai trục y: trục trái cho doanh thu (đơn vị VND), trục phải cho số đơn hàng.
- **Dữ liệu:** Nhóm theo ngày (hoặc tháng) trong khoảng thời gian đã chọn. Mỗi điểm: ngày, tổng doanh thu, tổng số đơn (của các đơn `Đã nhận`).
- **Tương tác:** Hover hiển thị tooltip chi tiết. Có thể chọn hiển thị dạng cột hoặc đường.

### 3.3. Biểu đồ tăng trưởng (so sánh với kỳ trước)

Thay vì bảng, hiển thị dưới dạng **3–4 thẻ nhỏ** hoặc **thanh ngang** so sánh phần trăm tăng trưởng của các chỉ số chính:

- % tăng trưởng doanh thu
- % tăng trưởng số đơn hàng
- % tăng trưởng người dùng mới
- % tăng trưởng cửa hàng mới

Cách tính: So sánh khoảng thời gian đã chọn với khoảng thời gian tương ứng liền trước (cùng độ dài). Hiển thị mũi tên lên/xanh (tăng), xuống/đỏ (giảm), kèm phần trăm.

### 3.4. Biểu đồ phân bố đánh giá sao

- **Loại biểu đồ:** Bar chart (thanh ngang) hoặc Pie chart (tròn).
- **Dữ liệu:** Đếm số lượng đánh giá cho mỗi mức sao (1–5) trong khoảng thời gian đã chọn (dựa trên `NgayTao` của `DanhGiaSanPham`).
- **Hiển thị:** Mỗi sao một thanh, độ dài tỷ lệ với số lượng. Có thể hiển thị phần trăm.

### 3.5. Biểu đồ top danh mục bán chạy

- **Loại biểu đồ:** Bar chart (dọc) hoặc Pie chart.
- **Dữ liệu:** Tính tổng doanh thu theo `DanhMuc` (JOIN `SanPham` – `DanhMuc` – `ChiTietDonHang` – `DonHang` với `TrangThaiDon = N'Đã nhận'` trong khoảng thời gian). Lấy top 5–10 danh mục có doanh thu cao nhất.
- **Hiển thị:** Tên danh mục, doanh thu (hoặc % đóng góp).

---

## 4. Luồng dữ liệu và API

### 4.1. Các endpoint cần có

- `GET /api/admin/dashboard/overview?from=...&to=...` – trả về các chỉ số KPI (tổng số mới trong kỳ, tổng doanh thu, tỷ lệ hủy, sản phẩm chờ duyệt – riêng cái này không cần lọc thời gian).
- `GET /api/admin/dashboard/revenue-orders?from=...&to=...&groupBy=day` – trả về mảng {date, revenue, orderCount} cho biểu đồ.
- `GET /api/admin/dashboard/growth?from=...&to=...` – trả về % tăng trưởng của doanh thu, đơn hàng, người dùng, cửa hàng.
- `GET /api/admin/dashboard/rating-distribution?from=...&to=...` – trả về số lượng đánh giá theo từng sao.
- `GET /api/admin/dashboard/top-categories?from=...&to=...&limit=10` – trả về top danh mục theo doanh thu.

### 4.2. Khi thay đổi bộ lọc

- Client gửi request mới với `from` và `to` (định dạng YYYY-MM-DD hoặc datetime).
- Tất cả các API đều được gọi lại (có thể gọi song song).
- Hiển thị skeleton loading cho các biểu đồ và thẻ KPI (trừ các thẻ có thể cache).

### 4.3. Xử lý lỗi và loading

- Skeleton: hiển thị các khối mờ nhấp nháy thay cho biểu đồ và thẻ.
- Nếu lỗi API, hiển thị thông báo lỗi nhỏ trên từng khối, có nút thử lại.

---

## 5. Tương tác và trạng thái

- **Khởi tạo:** Chọn khoảng thời gian mặc định (30 ngày qua), gọi toàn bộ API, hiển thị dữ liệu.
- **Thay đổi bộ lọc:** Cập nhật state `fromDate`, `toDate`, gọi lại API, reset loading.
- **Hover biểu đồ:** Hiển thị tooltip với giá trị chi tiết (ngày, doanh thu, số đơn…).
- **Responsive:** Trên mobile, các biểu đồ chuyển sang dạng cuộn ngang hoặc thu nhỏ, các thẻ KPI xếp dọc.

---

## 6. Responsive với TailwindCSS

- **Desktop (≥1024px):** Các thẻ KPI nằm trên grid 4 cột (mỗi thẻ chiếm 1/4). Biểu đồ kép chiếm full width, biểu đồ tăng trưởng có thể 4 thẻ ngang, biểu đồ đánh giá và top danh mục có thể đặt cạnh nhau (2 cột).
- **Tablet (768px–1024px):** Thẻ KPI 2–3 cột. Biểu đồ đánh giá và top danh mục xếp dọc.
- **Mobile (<768px):** Thẻ KPI 1 cột. Biểu đồ cuộn ngang hoặc hiển thị đơn giản hơn.

---

## 7. Tóm tắt các thành phần chính

- [x] **Bộ lọc thời gian** (Date Range Picker hoặc dropdown các mốc)
- [x] **Các thẻ KPI** (8 thẻ): người dùng mới, cửa hàng mới, sản phẩm mới, tổng đơn hàng, tổng doanh thu, đánh giá trung bình, tỷ lệ hủy, sản phẩm chờ duyệt.
- [x] **Biểu đồ doanh thu & số đơn hàng** (line chart kép, theo ngày/tháng)
- [x] **Biểu đồ tăng trưởng** (thẻ % so sánh với kỳ trước)
- [x] **Biểu đồ phân bố đánh giá sao** (bar hoặc pie)
- [x] **Biểu đồ top danh mục bán chạy** (bar dọc, doanh thu)
- [x] **Loading skeleton** cho từng khối
- [x] **Xử lý lỗi** và thử lại
- [x] **Responsive** trên mọi thiết bị

---

## 8. Lưu ý đặc biệt từ database

- Đối với các chỉ số “mới trong kỳ”, cột thời gian sử dụng: `NguoiDung.NgayTao`, `CuaHang.NgayTao`, `SanPham.NgayDang`, `DonHang.NgayTao`, `DanhGiaSanPham.NgayTao`.
- Doanh thu chỉ tính trên đơn hàng có `TrangThaiDon = N'Đã nhận'` để phản ánh thực tế.
- Tỷ lệ hủy đơn: đơn hủy có `TrangThaiDon = N'Đã hủy'`. Tổng số đơn trong kỳ bao gồm tất cả trạng thái.
- Sản phẩm chờ duyệt: không lọc thời gian, là số lượng hiện tại (`TrangThaiDuyet = N'Chờ phê duyệt'`).
- Biểu đồ top danh mục: có thể dùng `DanhMuc` cấp 1 để tổng hợp, nếu muốn chi tiết hơn thì lấy theo `DanhMucId` của sản phẩm.

---

Kế hoạch này cung cấp đầy đủ mô tả để thiết kế trang dashboard cho admin, chỉ gồm các biểu đồ tổng quát và chỉ số, có bộ lọc theo khoảng thời gian, không có bảng danh sách, bám sát database ZenTekExchange.
```
