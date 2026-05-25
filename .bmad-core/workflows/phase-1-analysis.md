# Phase 1: Analysis & Discovery Workflow

## Mục tiêu

Thiết lập context đầy đủ cho project: hiểu ý tưởng, nghiên cứu thị trường,
và brainstorm giải pháp trước khi đi vào planning chi tiết.

## Điều kiện bắt đầu

- Project mới hoặc không có artifacts nào trong bmad-output/phase-1/

## Điều kiện hoàn thành

- [ ] `bmad-output/phase-1/project-brief.md` đã được tạo và PO approved
- [ ] `bmad-output/phase-1/market-research.md` đã được tạo
- [ ] `bmad-output/phase-1/brainstorm.md` đã được tạo

---

## Bước 1: Activate Analyst Agent

**Prompt mẫu:**

```
Tôi muốn bắt đầu project [tên project].
Hãy đóng vai Business Analyst và giúp tôi:
1. Phân tích ý tưởng và xác định vấn đề cần giải quyết
2. Research thị trường và đối thủ cạnh tranh
3. Brainstorm các tính năng và giải pháp
4. Tạo các artifacts theo chuẩn BMAD vào bmad-output/phase-1/
```

**Context cần cung cấp:**

- Mô tả ý tưởng của bạn:
  - Xây dựng một sàn giao dịch thân thiện, minh bạch dành riêng cho mặt hàng điện tử, nơi người mua và người bán có thể tin tưởng lẫn nhau thông qua cơ chế đánh giá, phản hồi, nhóm chat cộng đồng và kiểm duyệt bài đăng – kế thừa ưu điểm quản lý uy tín từ sàn TMĐT lớn nhưng đơn giản hóa thủ tục.
  - Tích hợp đầy đủ chức năng thương mại điện tử cơ bản: đăng bán, tìm kiếm, đặt hàng, quản lý đơn hàng, xác nhận giao nhận – kế thừa từ các sàn TMĐT nhưng cắt giảm phần vận chuyển phức tạp.
  - Hỗ trợ người bán mở cửa hàng trước khi đăng bán, tạo không gian kinh doanh chuyên nghiệp.
  - Cho phép admin quản lý người dùng một cách chủ động (tạo, sửa, xóa, khóa tài khoản) nhằm kiểm soát hệ thống chặt chẽ.
  - Cung cấp cơ chế gỡ bỏ bài đăng vi phạm sau khi đã phê duyệt, giúp xử lý kịp thời các nội dung không phù hợp.
  - Đảm bảo khả năng mở rộng và bảo trì trong khuôn khổ đồ án sinh viên, đồng thời làm nền tảng để phát triển thực tế sau này.

- Target market:
  - Người bán: Cá nhân, cửa hàng nhỏ, người bán lẻ có nhu cầu đăng bán các sản phẩm điện tử (mới hoặc đã qua sử dụng) như điện thoại, laptop, máy tính bảng, tai nghe, linh kiện, phụ kiện, thiết bị gia dụng điện tử… – ưu tiên những người thấy thủ tục trên sàn lớn quá phức tạp hoặc muốn giao dịch cộng đồng hơn.
  - Người mua: Người dùng cuối có nhu cầu tìm mua sản phẩm điện tử với mức giá đa dạng, muốn kiểm tra uy tín người bán, có thể trao đổi trực tiếp qua chat và xem đánh giá thực tế từ cộng đồng.
  - Quản trị viên (Admin): Người quản lý hệ thống, duyệt bài đăng sản phẩm, quản lý người dùng.

- Vấn đề đang giải quyết:
  1. Thiếu cơ chế đánh giá và phản hồi uy tín
     Trên các nền tảng rao vặt thông thường, không có hệ thống lưu trữ điểm uy tín (rating) sản phẩm dành cho người bán. ZenTek Exchange giải quyết bằng cách cho phép: + Khách hàng sau khi nhận hàng có thể đánh giá sản phẩm (sao, nội dung nhận xét). + Người bán có quyền trả lời đánh giá, thể hiện thái độ và trách nhiệm. + Lịch sử bán hàng và điểm đánh giá được hiển thị công khai.
  2. Bài đăng tràn lan, thiếu kiểm duyệt trên các kênh cộng đồng
     Để tránh hàng giả, hàng nhái, thông tin sai lệch, mọi bài đăng của người bán sau khi tạo hoặc sửa đều phải chuyển sang trạng thái “Chờ phê duyệt”. Quản trị viên sẽ kiểm duyệt và: + Chấp nhận → thành “Đã duyệt” (hiển thị công khai). + Từ chối → thành “Đã từ chối” (không hiển thị, người bán biết để sửa).
  3. Giao dịch không minh bạch và không có lịch sử
     Nhiều giao dịch mua bán diễn ra qua tin nhắn, không có hợp đồng, dễ phát sinh tranh chấp. Hệ thống quy định rõ ràng: + Khách hàng tạo đơn hàng với thông tin sản phẩm, giá, địa chỉ nhận hàng. + Người bán cập nhật trạng thái đơn (xác nhận đang giao, xác nhận hủy). + Khách hàng xác nhận đã nhận hàng hoặc hủy đơn (trước khi giao). + Cả hai bên đều xem được lịch sử đơn hàng đã bán/mua và chi tiết.
  4. Thiếu kênh trò chuyện cộng đồng để trao đổi, chia sẻ kinh nghiệm
     Trên các nền tảng rao vặt hoặc sàn TMĐT hiện nay, người dùng chỉ có thể tương tác qua tin nhắn riêng. Không có một không gian chung như nhóm chat cộng đồng, nơi người mua, người bán, người quan tâm có thể: Thảo luận về xu hướng thiết bị, cách kiểm tra hàng chính hãng, Cảnh báo lừa đảo, chia sẻ kinh nghiệm giao dịch an toàn, Hỏi đáp nhanh các vấn đề kỹ thuật, tư vấn lẫn nhau. ZenTek Exchange giải quyết bằng cách cung cấp tính năng nhóm chat cộng đồng cho phép: + Người dùng đã đăng nhập có thể tham gia, gửi tin nhắn văn bản, ảnh, video. + Admin hoặc người dùng có uy tín có thể làm điều phối viên (moderator). + Lịch sử trò chuyện được lưu trữ, có thể tìm kiếm lại.

- Constraints:
  - Hệ thống được xây dựng dưới dạng ứng dụng web (website), hoạt động trên trình duyệt máy tính.
  - Các giao dịch tập trung chủ yếu vào mặt hàng điện tử, không mở rộng sang các ngành hàng khác (thời trang, mỹ phẩm, thực phẩm…).
  - Phạm vi địa lý: hướng đến thị trường Việt Nam (giao diện tiếng Việt, đơn vị tiền tệ VND, phương thức thanh toán mô phỏng chuyển khoản/tiền mặt khi nhận hàng).
  - Chưa tích hợp cổng thanh toán trực tuyến thực tế và vận chuyển thực (giao hàng giả định, người dùng tự thỏa thuận).

---

## Bước 2: PO Review

**Prompt mẫu:**

```
Hãy đóng vai Product Owner và review artifacts trong bmad-output/phase-1/
Đánh giá xem project-brief.md có đủ rõ ràng để move sang Phase 2 không.
```

---

## Output Files

```
bmad-output/phase-1/
├── project-brief.md       # Tóm tắt dự án
├── market-research.md     # Phân tích thị trường
└── brainstorm.md          # Brainstorming tính năng
```

## Chuyển sang Phase 2

Khi tất cả artifacts được tạo và PO approve, bắt đầu Phase 2 với:

```
Đọc bmad-output/phase-1/ và bắt đầu Phase 2 với vai trò Product Manager
```
