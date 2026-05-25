# Project Brief – ZenTek Exchange

**Trạng thái**: Draft
**Ngày tạo**: 2026-05-23
**Tạo bởi**: Analyst Agent
**Reviewed by**: Product Owner (chưa review)

---

## 1. Tổng quan dự án

**Tên project**: ZenTek Exchange
**Loại**: Marketplace (Sàn giao dịch C2C chuyên mặt hàng điện tử)
**Phiên bản**: MVP 1.0

### Mô tả ngắn gọn

ZenTek Exchange là sàn giao dịch thương mại điện tử chuyên biệt cho mặt hàng điện tử tại thị trường Việt Nam. Nền tảng cho phép người bán mở cửa hàng, đăng bán sản phẩm (mới & đã qua sử dụng), người mua tìm kiếm – đặt hàng – đánh giá – tất cả trong một quy trình minh bạch. Điểm khác biệt cốt lõi: cơ chế kiểm duyệt bài đăng chặt chẽ, hệ thống đánh giá uy tín sản phẩm, và nhóm chat cộng đồng tích hợp — kết hợp ưu điểm quản lý uy tín từ sàn TMĐT lớn (Shopee) với sự đơn giản trong thủ tục (Chợ Tốt), phù hợp giao dịch nhỏ lẻ và khuôn khổ đồ án sinh viên.

---

## 2. Vấn đề cần giải quyết (Problem Statement)

### Vấn đề hiện tại

Thị trường mua bán sản phẩm điện tử tại Việt Nam đang tồn tại **4 vấn đề nghiêm trọng**:

| #   | Vấn đề                                       | Hiện trạng                                                                                                                                                                             |
| --- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Thiếu cơ chế đánh giá & phản hồi uy tín**  | Các nền tảng rao vặt (Chợ Tốt, Facebook Marketplace) không có hệ thống rating sản phẩm cho người bán. Người mua không có căn cứ để tin tưởng, rủi ro lừa đảo cao.                      |
| 2   | **Bài đăng tràn lan, thiếu kiểm duyệt**      | Trên các kênh cộng đồng (Facebook Groups) và rao vặt, hàng giả, hàng nhái, thông tin sai lệch lan tràn do không có kiểm duyệt nội dung trước khi hiển thị.                             |
| 3   | **Giao dịch không minh bạch, thiếu lịch sử** | Mua bán diễn ra qua tin nhắn riêng, không có quy trình đặt hàng chính thức, không lưu lịch sử, dễ phát sinh tranh chấp mà không có bằng chứng.                                         |
| 4   | **Thiếu kênh cộng đồng để trao đổi**         | Không có không gian chung (nhóm chat) gắn liền với sàn giao dịch để chia sẻ kinh nghiệm, cảnh báo lừa đảo, tư vấn kỹ thuật — các kênh hiện tại (Facebook, forum) rời rạc, khó quản lý. |

### Tác động

- **Người mua**: Mất tiền cho hàng giả/kém chất lượng, không có căn cứ khiếu nại, lo sợ khi giao dịch online
- **Người bán uy tín**: Bị đánh đồng với người bán gian lận, khó xây dựng thương hiệu cá nhân, mất cơ hội kinh doanh
- **Cộng đồng chung**: Niềm tin vào mua bán điện tử online suy giảm, thị trường lành mạnh bị ảnh hưởng

### Giải pháp đề xuất

ZenTek Exchange giải quyết đồng thời 4 vấn đề trên bằng cách kết hợp:

1. **Hệ thống đánh giá uy tín sản phẩm**: Buyer đánh giá sao + nhận xét sau khi nhận hàng; Seller được phản hồi; lịch sử đánh giá hiển thị công khai trên trang shop & sản phẩm.
2. **Kiểm duyệt bài đăng tập trung**: Mọi bài đăng (mới/sửa) → trạng thái "Chờ phê duyệt" → Admin kiểm tra → Chấp nhận (hiển thị) / Từ chối (ẩn, seller biết lý do để sửa). Admin có quyền gỡ bỏ bài đã duyệt nếu phát hiện vi phạm sau.
3. **Quản lý đơn hàng minh bạch**: Quy trình chuẩn: Đặt hàng → Seller xác nhận → Đang giao → Buyer xác nhận nhận hàng. Cả hai bên xem được lịch sử đơn hàng đầy đủ.
4. **Nhóm chat cộng đồng tích hợp**: Phòng chat chung/theo danh mục sản phẩm, gửi text + ảnh + video, có moderator, lịch sử chat lưu trữ tìm kiếm được.

---

## 3. Mục tiêu dự án

### Mục tiêu kinh doanh (Business Goals)

- [x] Tạo sàn giao dịch chuyên biệt cho điện tử, tăng niềm tin người dùng thông qua trust system
- [x] Giảm thiểu rủi ro lừa đảo qua kiểm duyệt bài đăng và hệ thống uy tín
- [x] Xây dựng cộng đồng giao dịch điện tử lành mạnh, có kiểm soát
- [x] Đơn giản hóa quy trình bán hàng so với sàn TMĐT lớn, thu hút seller nhỏ lẻ

### Mục tiêu kỹ thuật (Technical Goals)

- [x] Xây dựng web application có kiến trúc rõ ràng, khả năng mở rộng
- [x] Đảm bảo UX thân thiện, giao diện tiếng Việt, phù hợp người dùng Việt Nam
- [x] Tích hợp hệ thống chat real-time (WebSocket) cho cộng đồng
- [x] Đạt tiêu chuẩn đồ án sinh viên: demo được, bảo vệ được, giải thích được

### Mục tiêu đồ án (Academic Goals)

- [x] Hoàn thành đầy đủ chức năng TMĐT cơ bản (CRUD, Auth, Order, Review)
- [x] Chứng minh khả năng phân tích, thiết kế, triển khai hệ thống phần mềm hoàn chỉnh
- [x] Làm nền tảng có thể phát triển thực tế nếu có cơ hội trong tương lai

### KPIs thành công

| KPI                           | Target                                               | Timeframe |
| ----------------------------- | ---------------------------------------------------- | --------- |
| Hoàn thành chức năng core MVP | 100% features Must-Have                              | Hết đồ án |
| Seed data demo realistic      | ≥ 20 sản phẩm, ≥ 5 sellers, ≥ 10 đơn hàng            | Demo      |
| Quy trình đơn hàng end-to-end | Hoạt động 100% (tạo → xác nhận → giao → nhận)        | Demo      |
| Chat cộng đồng real-time      | Hoạt động ổn định, không lag                         | Demo      |
| Kiểm duyệt bài đăng           | 100% bài qua kiểm duyệt trước khi hiển thị công khai | Demo      |
| Response time trang chủ       | < 3 giây trên localhost                              | Demo      |

---

## 4. Target Users

### Primary User 1: Người bán (Seller)

- **Demographics**: Cá nhân, cửa hàng nhỏ, người bán lẻ tại Việt Nam; 18–40 tuổi; quen sử dụng internet và mạng xã hội
- **Goals**: Đăng bán sản phẩm điện tử (mới & cũ) nhanh chóng, mở cửa hàng trực tuyến chuyên nghiệp, xây dựng uy tín qua đánh giá
- **Pain Points**: Thủ tục bán trên sàn lớn (Shopee, Lazada) quá phức tạp (CCCD, tài khoản ngân hàng, kho), phí bán cao (6-15% commission); bán trên Facebook Groups thì không có hệ thống quản lý, thiếu trust
- **Sản phẩm bán**: Điện thoại, laptop, máy tính bảng, tai nghe, linh kiện, phụ kiện, thiết bị gia dụng điện tử (mới hoặc đã qua sử dụng)

### Primary User 2: Người mua (Buyer)

- **Demographics**: Người dùng cuối tại Việt Nam; 16–45 tuổi; có nhu cầu mua sản phẩm điện tử với mức giá đa dạng
- **Goals**: Tìm sản phẩm tốt – giá hợp lý, kiểm tra uy tín người bán trước khi mua, trao đổi trực tiếp qua chat, xem đánh giá thực tế từ cộng đồng
- **Pain Points**: Sợ mua hàng giả/lỗi, không có cơ chế kiểm chứng uy tín trên rao vặt, thiếu kênh hỏi ý kiến cộng đồng trước khi mua

### Secondary User: Quản trị viên (Admin)

- **Demographics**: Quản lý hệ thống (team phát triển / admin kỹ thuật)
- **Goals**: Kiểm duyệt bài đăng, quản lý người dùng, duy trì sàn sạch & minh bạch
- **Responsibilities**: Approve/reject bài đăng, tạo/sửa/xóa/khóa tài khoản, gỡ bài vi phạm, xem thống kê

---

## 5. Phạm vi dự án (Scope)

### Trong phạm vi (In Scope – MVP)

| Nhóm chức năng            | Mô tả                                                                                     |
| ------------------------- | ----------------------------------------------------------------------------------------- |
| **Authentication & User** | Đăng ký/đăng nhập/đăng xuất, phân quyền (Buyer/Seller/Admin), quản lý profile             |
| **Seller Shop**           | Mở cửa hàng, trang shop, quản lý thông tin shop                                           |
| **Product Management**    | CRUD sản phẩm, danh mục, tình trạng (mới/cũ), upload nhiều ảnh, trang chi tiết            |
| **Kiểm duyệt bài đăng**   | Workflow: Draft → Chờ duyệt → Đã duyệt / Từ chối / Đã gỡ. Admin duyệt/từ chối/gỡ          |
| **Order Management**      | Tạo đơn, seller xác nhận, cập nhật trạng thái, buyer xác nhận nhận hàng, hủy đơn, lịch sử |
| **Rating & Review**       | Buyer đánh giá sao + nhận xét, seller phản hồi, hiển thị trung bình trên shop & sản phẩm  |
| **Community Chat**        | Phòng chat chung (real-time WebSocket), gửi text, hiển thị user info, lịch sử chat        |
| **Admin Dashboard**       | Quản lý user (CRUD + khóa), quản lý kiểm duyệt, quản lý danh mục, thống kê cơ bản         |
| **UI/UX Frontend**        | Trang chủ, trang danh mục, trang chi tiết, navigation, responsive desktop                 |

### Ngoài phạm vi (Out of Scope)

- ❌ Tích hợp cổng thanh toán trực tuyến thực tế (chỉ mô phỏng COD / chuyển khoản)
- ❌ Tích hợp vận chuyển thực (giao hàng giả định, người dùng tự thỏa thuận)
- ❌ Ứng dụng mobile native (iOS / Android)
- ❌ Mở rộng sang ngành hàng khác (thời trang, mỹ phẩm, thực phẩm…)
- ❌ Đa ngôn ngữ (chỉ giao diện tiếng Việt)
- ❌ Hệ thống affiliate / tiếp thị liên kết
- ❌ Chức năng đấu giá
- ❌ Ví điện tử / wallet nội bộ
- ❌ AI/ML recommendation engine

---

## 6. Constraints & Assumptions

### Constraints

- **Platform**: Ứng dụng web (website), hoạt động trên trình duyệt máy tính
- **Ngành hàng**: Chỉ điện tử (điện thoại, laptop, máy tính bảng, tai nghe, linh kiện, phụ kiện, gia dụng điện tử)
- **Địa lý**: Thị trường Việt Nam (giao diện Tiếng Việt, đơn vị VND)
- **Thanh toán**: Mô phỏng (COD / chuyển khoản — chỉ ghi nhận phương thức, không xử lý tiền thật)
- **Vận chuyển**: Giả định (người mua – bán tự thỏa thuận ngoài hệ thống)
- **Tính chất**: Đồ án sinh viên (225TMDT) — cần demo được, bảo vệ được
- **Team**: Sinh viên (resource & kinh nghiệm hạn chế)
- **Budget**: Không có budget (sử dụng free tier services hoặc local development)

### Assumptions

- Người dùng có trình duyệt web hiện đại (Chrome, Firefox, Edge phiên bản mới)
- Người dùng có kết nối internet ổn định
- Người bán tự chịu trách nhiệm về tính chính xác thông tin sản phẩm
- Giao dịch thanh toán & vận chuyển diễn ra ngoài hệ thống (hệ thống chỉ quản lý trạng thái đơn hàng)
- Admin kiểm duyệt bài đăng trong giờ hành chính (chấp nhận thời gian chờ duyệt)
- Dữ liệu demo sẽ được seed sẵn cho buổi bảo vệ đồ án

---

## 7. Risks & Mitigations

| Risk                                              | Probability | Impact     | Mitigation                                                                 |
| ------------------------------------------------- | ----------- | ---------- | -------------------------------------------------------------------------- |
| Chat real-time phức tạp hơn dự kiến               | Trung bình  | Cao        | Sử dụng Socket.IO — thư viện phổ biến, nhiều tài liệu hướng dẫn            |
| Thiếu kinh nghiệm full-stack development          | Cao         | Trung bình | Chọn tech stack phổ biến có nhiều tutorial (VD: React + Node.js + MongoDB) |
| Kiểm duyệt bài đăng gây delay UX (seller chờ lâu) | Thấp        | Trung bình | Hiển thị rõ trạng thái cho seller, thông báo kết quả duyệt                 |
| Dữ liệu test không đủ realistic cho demo          | Trung bình  | Thấp       | Chuẩn bị seed data chi tiết với hình ảnh thật và mô tả thật                |
| Scope creep (thêm tính năng ngoài kế hoạch)       | Cao         | Cao        | Bám sát MoSCoW priority, PO review mỗi phase                               |
| Performance chat với nhiều tin nhắn               | Thấp        | Trung bình | Phân room, lazy load, pagination lịch sử chat                              |

---

## 8. Bước tiếp theo

1. ✅ Project Brief — hoàn thành (file này)
2. ➡️ Market Research — xem `market-research.md`
3. ➡️ Brainstorm tính năng — xem `brainstorm.md`
4. 🔲 PO Review & Approve Phase 1
5. 🔲 Chuyển sang Phase 2: Product Manager tạo PRD chi tiết
