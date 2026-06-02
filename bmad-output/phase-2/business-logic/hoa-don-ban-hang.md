# Logic nghiệp vụ trang Hóa đơn bán hàng (dùng chung Buyer & Seller)

## 1. Mục đích trang

Hiển thị chi tiết một đơn hàng dưới dạng **hóa đơn bán hàng** (phong cách hóa đơn giấy), cung cấp các thao tác nghiệp vụ phù hợp với từng vai trò: **Người mua (Buyer)** và **Người bán (Seller)**. Trang được xây dựng để phục vụ cả hai vai trò trên cùng một giao diện, hành vi sẽ thay đổi dựa trên quyền và trạng thái đơn hàng.

## 2. Đối tượng sử dụng

- **Buyer** – người đã đặt hàng, muốn xem lại hóa đơn, in, đánh giá sản phẩm, mua lại hoặc liên hệ người bán.
- **Seller** – chủ cửa hàng, muốn xem thông tin đơn hàng của khách, in hóa đơn, liên hệ người mua (hỗ trợ). (Seller **không** thực hiện đánh giá hay mua lại trên trang này).

## 3. Các thành phần chính

| Thành phần         | Mô tả                                                                         |
| ------------------ | ----------------------------------------------------------------------------- |
| Thông tin đơn hàng | Mã đơn, ngày tạo, trạng thái, thông tin người nhận, địa chỉ giao              |
| Danh sách sản phẩm | Bảng sản phẩm kèm phân loại, số lượng, đơn giá, thành tiền                    |
| Tổng tiền          | Tổng giá trị đơn hàng (không bao gồm phí vận chuyển – đã loại bỏ)             |
| Footer hóa đơn     | Lời cảm ơn                                                                    |
| Các nút hành động  | In hóa đơn, Đánh giá, Liên hệ, Mua lại (Buyer) / In hóa đơn, Liên hệ (Seller) |

## 4. Luồng dữ liệu & khởi tạo

1. Người dùng truy cập đường dẫn có tham số `orderId`.
2. Hệ thống gọi API lấy chi tiết đơn hàng theo `orderId`.
3. Nếu tìm thấy → hiển thị hóa đơn. Nếu không → thông báo lỗi và cung cấp nút quay lại danh sách đơn hàng (theo role).
4. Khi có dữ liệu, kiểm tra:
   - Nếu `trangThai = "Đã nhận"` và có ít nhất một sản phẩm chưa đánh giá (`daDanhGia = false`) → hiển thị nút **Đánh giá** (chỉ dành cho Buyer).
   - Các nút khác (In, Liên hệ, Mua lại) hiển thị với Buyer; Seller chỉ thấy In và Liên hệ.

## 5. Logic nghiệp vụ chi tiết theo vai trò

### 5.1 Hành động dành cho Buyer (Người mua)

#### a) Xem hóa đơn

- Xem toàn bộ thông tin đơn hàng đã mua.
- Trạng thái đơn hàng gồm: `Chờ xử lý`, `Đang giao`, `Đã nhận`, `Đã hủy`.
- Nếu đơn bị hủy, hiển thị thêm **lý do hủy**.

#### b) In hóa đơn

- Gọi hàm `window.print()` để in trực tiếp giao diện hóa đơn giấy.

#### c) Đánh giá sản phẩm (chỉ khi đơn hàng `Đã nhận` và sản phẩm chưa được đánh giá)

- Mở modal đánh giá, hiển thị từng sản phẩm chưa đánh giá.
- Mỗi sản phẩm có:
  - Chọn số sao (1–5, mặc định 5 sao).
  - Nhập nhận xét (text, không bắt buộc).
- Sau khi gửi, gọi API lưu đánh giá, đóng modal và thông báo thành công.
- Trạng thái `daDanhGia` của sản phẩm sẽ được cập nhật (nếu có reload trang sẽ không còn hiển thị nút đánh giá cho sản phẩm đó).

#### d) Mua lại

- Gửi yêu cầu thêm tất cả sản phẩm trong đơn hàng vào giỏ hàng hiện tại.
- Hiển thị thông báo thành công, thực tế sẽ chuyển hướng đến trang giỏ hàng.
- Luồng: Thêm sản phẩm → tick chọn → chuyển đến giỏ hàng (đã chọn sẵn) → người dùng chỉ cần bấm thanh toán.

#### e) Liên hệ người bán

- Mở khung chat / gửi tin nhắn đến người bán (tích hợp sau). Hành động chung cho cả Buyer và Seller.

### 5.2 Hành động dành cho Seller (Người bán)

| Hành động   | Mô tả                                                                   |
| ----------- | ----------------------------------------------------------------------- |
| Xem hóa đơn | Xem chi tiết đơn hàng của khách, bao gồm thông tin người nhận, sản phẩm |
| In hóa đơn  | In hóa đơn để giao hàng hoặc lưu trữ                                    |
| Liên hệ     | Liên hệ với người mua để hỗ trợ hoặc xác nhận đơn hàng                  |

> **Lưu ý:** Seller **không** thấy nút **Đánh giá** và **Mua lại**.

## 6. Điều kiện hiển thị nút hành động

| Hành động  | Buyer                                                                     | Seller             |
| ---------- | ------------------------------------------------------------------------- | ------------------ |
| In hóa đơn | Luôn hiển thị                                                             | Luôn hiển thị      |
| Liên hệ    | Luôn hiển thị                                                             | Luôn hiển thị      |
| Mua lại    | Luôn hiển thị (với mọi trạng thái đơn)                                    | **Không hiển thị** |
| Đánh giá   | Chỉ hiển thị khi `trangThai = "Đã nhận"` và có sản phẩm `daDanhGia=false` | **Không hiển thị** |

## 7. Xử lý lỗi & trường hợp đặc biệt

- **Không tìm thấy đơn hàng** – hiển thị thông báo lỗi, nút “Quay lại đơn mua” (Buyer) hoặc “Quay lại danh sách đơn hàng” (Seller).
- **Loading** – hiển thị trạng thái đang tải.
- **Đơn hàng đã hủy** – hiển thị lý do hủy, không cho phép đánh giá hay mua lại (logic từ phía backend nên chặn, frontend có thể ẩn nút tương ứng).

## 8. Các API giả định (cần triển khai thực tế)

| API                      | Method | Mô tả                                           |
| ------------------------ | ------ | ----------------------------------------------- |
| `/api/orders/{orderId}`  | GET    | Lấy chi tiết đơn hàng theo mã                   |
| `/api/cart/add-multiple` | POST   | Thêm nhiều sản phẩm vào giỏ (mua lại)           |
| `/api/reviews`           | POST   | Gửi đánh giá cho sản phẩm (kèm rating, comment) |
| (Chat)                   | -      | Mở kênh liên hệ giữa Buyer và Seller            |

## 9. Ghi chú triển khai kỹ thuật (từ code mẫu)

- **State quản lý:** `order`, `loading`, `showReviewModal`, `reviewData`.
- **Định dạng:** ngày (vi-VN), tiền tệ (VNĐ).
- **Mock data** dùng để phát triển, cần thay bằng API thật.
- **Xử lý đánh giá:** lưu tạm `reviewData` theo `maSanPham` trước khi submit.
- **Phân quyền role:** cần truyền role từ context hoặc session để quyết định hiển thị nút (đoạn code hiện tại chưa có phần này – cần bổ sung logic phân quyền).

## 10. Tóm tắt luồng chính (Buyer)

1. Truy cập trang Hóa đơn với `orderId`
2. Xem thông tin đơn + sản phẩm
3. In hóa đơn nếu cần
4. Nếu đơn đã nhận và có sản phẩm chưa đánh giá → đánh giá từng sản phẩm
5. Có thể mua lại toàn bộ giỏ
6. Liên hệ người bán nếu có vấn đề

## 11. Tóm tắt luồng chính (Seller)

1. Truy cập trang (có quyền seller) xem đơn hàng của khách
2. Xem thông tin giao hàng, sản phẩm
3. In hóa đơn để gửi kèm kiện hàng
4. Liên hệ khách hàng nếu cần xác nhận hoặc hỗ trợ

---

_Trang được thiết kế dùng chung, hành vi thay đổi theo role. Mọi thao tác đều cần kiểm tra quyền ở cả frontend và backend._
