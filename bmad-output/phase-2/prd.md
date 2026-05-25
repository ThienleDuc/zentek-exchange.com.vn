# Product Requirements Document (PRD) – ZenTek Exchange

**Trạng thái**: Draft
**Ngày tạo**: 2026-05-24
**Tạo bởi**: Product Manager Agent
**Dựa trên**: Phase 1 (Project Brief, Market Research, Brainstorm)

---

## 1. Executive Summary

ZenTek Exchange là sàn giao dịch thương mại điện tử chuyên biệt dành cho mặt hàng điện tử tại Việt Nam. Khác biệt với các nền tảng rao vặt thiếu kiểm soát (Chợ Tốt, Facebook) và các sàn thương mại điện tử lớn với thủ tục phức tạp (Shopee, Lazada), ZenTek định vị mình là một "sàn giao dịch lai" kết hợp **sự đơn giản** của việc đăng bán cá nhân với **cơ chế Trust System mạnh mẽ** (kiểm duyệt, rating, review). Đặc biệt, hệ thống cung cấp **Chat đa dạng** bao gồm chat cộng đồng và chat 1-1 (buyer-seller, user-user) để tăng tương tác và tạo lập một môi trường giao dịch minh bạch, đáng tin cậy.

Dự án này được phát triển dưới dạng đồ án (MVP 1.0) nhằm giải quyết nhu cầu mua bán đồ điện tử cũ/mới của sinh viên và người dùng cá nhân.

---

## 2. Problem Statement

Thị trường mua bán điện tử cá nhân (C2C) tại Việt Nam đang gặp 4 vấn đề lớn:
1. **Thiếu Trust System**: Người mua không có căn cứ đánh giá độ uy tín của người bán trên các trang rao vặt.
2. **Scam/Hàng giả tràn lan**: Việc đăng tin không kiểm duyệt khiến rủi ro lừa đảo cao.
3. **Thiếu lịch sử giao dịch**: Mua bán qua tin nhắn không lưu lại bằng chứng đơn hàng chuẩn mực.
4. **Thiếu tương tác cộng đồng**: Không có nơi để trao đổi, hỏi han kinh nghiệm về các món đồ điện tử đặc thù.

**Giải pháp của ZenTek:**
- Buộc mọi sản phẩm phải qua **kiểm duyệt** của Admin trước khi hiển thị.
- Tích hợp hệ thống **đánh giá/review sao** công khai cho cửa hàng.
- Quy chuẩn hóa luồng **đơn hàng** (Tạo → Xác nhận → Giao → Nhận).
- Cung cấp tính năng **Chat cộng đồng và Chat 1-1** real-time để tư vấn và trao đổi thông tin.

---

## 3. Goals & KPIs

### Mục tiêu Kinh doanh & Kỹ thuật
- Xây dựng thành công sàn giao dịch C2C chuyên điện tử, có kiểm duyệt và tính năng chat real-time.
- Tạo quy trình đăng bán dễ dàng, thu hút người bán nhỏ lẻ.
- Đạt yêu cầu đồ án: Kiến trúc chuẩn xác, UX thân thiện, chức năng chạy ổn định.

### KPIs cho MVP (Demo)
- Hoàn thành **100% (48/48)** các tính năng Must-Have.
- Dữ liệu demo: ≥ 20 sản phẩm, ≥ 5 cửa hàng, ≥ 10 đơn hàng hoàn tất.
- Luồng tạo đơn hàng đến hoàn thành: 100% hoạt động tốt.
- Chat: Gửi nhận tin nhắn real-time không delay (phòng chat chung + 1-1).
- Response time trang chủ < 3 giây (localhost).

---

## 4. User Personas

1. **Minh (Seller - 25 tuổi, IT)**: Bán linh kiện sau giờ làm. Muốn một trang bán hàng cá nhân chuyên nghiệp, tạo uy tín qua rating, không bị thu phí cao hay đòi hỏi giấy tờ phức tạp như Shopee.
2. **Lan (Buyer - 20 tuổi, Sinh viên)**: Ngân sách ít, muốn mua laptop cũ. Cần đọc review, hỏi trong nhóm chat cộng đồng và chat trực tiếp với người bán trước khi quyết định.
3. **Tuấn (Admin - 22 tuổi, Sinh viên)**: Quản lý hệ thống. Cần một dashboard tổng quan để duyệt/từ chối sản phẩm nhanh chóng và chặn các user lừa đảo.

---

## 5. Feature Requirements (MoSCoW)

Dựa trên Brainstorming, phạm vi của MVP 1.0 bao gồm **48 tính năng Must-Have** được chia thành 8 Epic:

### Epic 1: Authentication & User (6 Features)
- **AUTH-01/02**: Đăng ký, đăng nhập, đăng xuất (Khách hàng, Người bán, Admin) với JWT + bcrypt.
- **AUTH-03**: Role-based access control.
- **AUTH-04**: Quản lý thông tin cá nhân (Profile).
- **AUTH-06**: Admin quản lý User (khóa, mở khóa).

### Epic 2: Shop Management (4 Features)
- **SHOP-01**: Đăng ký mở cửa hàng (thông tin shop, địa chỉ, giấy tờ pháp lý).
- **SHOP-02**: Trang cửa hàng công khai (thông tin, danh sách sản phẩm, rating trung bình).
- **SHOP-03**: Quản lý thông tin cửa hàng.
- **SHOP-04**: Admin kiểm duyệt cửa hàng (xác thực pháp lý, approve/reject).

### Epic 3: Product Management (5 Features)
- **PROD-01/02/03**: Đăng bán, Sửa (cần duyệt lại), Xóa sản phẩm.
- **PROD-04**: Hệ thống danh mục tĩnh (Điện thoại, Laptop, Phụ kiện...).
- **PROD-05**: Trang chi tiết sản phẩm.

### Epic 4: Moderation (5 Features)
- **MOD-01**: Hàng đợi bài viết "Chờ phê duyệt" cho Admin.
- **MOD-02/03/04**: Thao tác Duyệt, Từ chối, Gỡ bài của Admin.
- **MOD-05**: Workflow Draft → Chờ duyệt → Đã duyệt/Từ chối/Gỡ.

### Epic 5: Order Management (7 Features)
- **ORD-01/02**: Giỏ hàng và Tạo đơn hàng (nhập địa chỉ thủ công).
- **ORD-03/04**: Seller xác nhận đơn → Giao hàng; Buyer xác nhận nhận hàng.
- **ORD-05**: Hủy đơn hàng (trước khi giao).
- **ORD-06/07**: Lịch sử đơn hàng và chi tiết đơn.

### Epic 6: Rating & Review (4 Features)
- **REV-01**: Đánh giá 1-5 sao và nhận xét (chỉ thực hiện sau khi Đã nhận hàng).
- **REV-02**: Seller trả lời nhận xét.
- **REV-03/04**: Hiển thị điểm trung bình và danh sách nhận xét.

### Epic 7: Chat System (8 Features)
- **CHAT-01/02/03/04/05**: Phòng Chat cộng đồng "General" real-time (Socket.IO), lưu lịch sử chat.
- **CHAT-06/07**: Chat 1-1 giữa Buyer và Seller (Nút "Chat ngay" ở sản phẩm/shop).
- **CHAT-08**: Chat 1-1 giữa User và User.

### Epic 8: Admin Dashboard (5 Features) & UI (6 Features)
- **ADM-01..05**: Thống kê cơ bản, quản lý người dùng, quản lý bài đăng, quản lý danh mục, quản lý cửa hàng (khóa/mở khóa).
- **UI-01..06**: Trang chủ, Danh mục, Responsive Desktop, Layout chuẩn, Loading, Error handling.

*Note: Thanh toán và Vận chuyển thực tế là **Out of Scope** (chỉ ghi nhận phương thức, không tích hợp API bên thứ ba).*

---

## 6. Non-functional Requirements

1. **Performance**: API load < 500ms, chat tin nhắn xuất hiện < 100ms.
2. **Security**: Mật khẩu hash (Bcrypt), JWT tokens hết hạn sau 24h, kiểm tra quyền truy cập nghiêm ngặt tại Backend.
3. **Scalability**: Backend tổ chức code theo module rõ ràng để dễ thêm tính năng mới.
4. **Usability**: 100% tiếng Việt, thân thiện, format tiền VND.
5. **Tech Stack**: React.js, Node.js/Express, SQL Server (MSSQL), Socket.IO.

---

## 7. Timeline & Milestones (Gợi ý)

Dự án nên triển khai qua 6 Sprint cốt lõi:
- **Sprint 1 (Tuần 1)**: Database Design, Auth, Profile.
- **Sprint 2 (Tuần 2)**: Đăng ký Shop, CRUD Sản phẩm, Phân mục.
- **Sprint 3 (Tuần 3)**: Kiểm duyệt của Admin, Homepage, Search/Filter đơn giản.
- **Sprint 4 (Tuần 4)**: Giỏ hàng, Đặt hàng, Quản lý trạng thái Đơn hàng.
- **Sprint 5 (Tuần 5)**: Rating/Review, Real-time Chat cộng đồng và Chat 1-1.
- **Sprint 6 (Tuần 6)**: Hoàn thiện Admin Dashboard, UI Polish, Bug fix, Seed data chuẩn bị Demo.
