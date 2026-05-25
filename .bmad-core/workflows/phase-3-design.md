# Phase 3: Technical Design Workflow (ZenTek Exchange)

## Mục tiêu
Thiết kế kiến trúc hệ thống, lựa chọn chi tiết tech stack, thiết kế Database Schema (cho SQL Server) và định nghĩa các API contracts (RESTful & WebSocket) dựa trên PRD và User Stories của Phase 2.

## Điều kiện bắt đầu
- `bmad-output/phase-2/prd.md` đã được PO approved.
- `bmad-output/phase-2/user-stories.md` đã đầy đủ.
- `bmad-output/phase-2/ux-brief.md` đã được thông qua.

## Điều kiện hoàn thành
- [ ] `bmad-output/phase-3/architecture.md` (System Architecture, bao gồm WebSocket cho Chat).
- [ ] `bmad-output/phase-3/tech-stack.md` (Chi tiết Frontend, Backend, Database, Real-time).
- [ ] `bmad-output/phase-3/database-schema.md` (Thiết kế chi tiết các bảng cho MSSQL, bao gồm quan hệ khóa ngoại).
- [ ] `bmad-output/phase-3/api-contracts.md` (REST APIs cho Auth, Shop, Product, Moderation, Order, Review + WebSocket events cho Chat).
- [ ] `bmad-output/phase-3/adr/` (Lưu các quyết định kiến trúc quan trọng - ví dụ: tại sao chọn Socket.IO, cách lưu trữ ảnh).

---

## Bước 1: System Architecture & Tech Stack
**Prompt mẫu:**
```text
Đóng vai Software Architect. Dựa trên PRD ở bmad-output/phase-2, hãy tạo:
1. bmad-output/phase-3/architecture.md: Sơ đồ kiến trúc tổng thể (sử dụng Mermaid), flow xử lý ảnh upload và flow WebSocket cho hệ thống Chat đa dạng.
2. bmad-output/phase-3/tech-stack.md: Phân tích và chốt stack: React.js, Node.js/Express, SQL Server (MSSQL), Socket.IO. Đưa ra lý do chọn (justification) phù hợp với đồ án sinh viên.
3. Tạo 1-2 ADR quan trọng vào bmad-output/phase-3/adr/ (ví dụ: Quyết định kiến trúc xử lý Chat real-time).
```

---

## Bước 2: Database Design (SQL Server)
**Prompt mẫu:**
```text
Đóng vai Database Designer. Dựa trên PRD và User Stories, thiết kế schema cho hệ thống ZenTek.
Lưu vào bmad-output/phase-3/database-schema.md. Yêu cầu:
- Sử dụng Mermaid ERD để trực quan hóa.
- Định nghĩa chi tiết các bảng, kiểu dữ liệu phù hợp với SQL Server (NVARCHAR, DATETIME...).
- Đảm bảo có đủ bảng cho: Users, Shops, Products, Categories, Orders, OrderDetails, Reviews, ChatRooms, ChatMessages.
- Chú ý các trường trạng thái (Trạng thái duyệt sản phẩm, Trạng thái đơn hàng).
```

---

## Bước 3: API Contracts (REST & WebSocket)
**Prompt mẫu:**
```text
Đóng vai API Designer. Tạo bmad-output/phase-3/api-contracts.md bao gồm:
1. RESTful Endpoints cho 6 Epics chính (Auth, Shop, Product, Moderation, Order, Review). Xác định rõ HTTP Method, URL, Request Body, Response.
2. WebSocket Events Definition cho Chat System (Gửi tin nhắn phòng chung, Gửi tin nhắn 1-1, Thông báo tin nhắn mới).
Yêu cầu: Thiết kế chuẩn RESTful, có middleware phân quyền rõ ràng.
```

---

## Bước 4: Tech Lead Review
**Prompt mẫu:**
```text
Đóng vai Tech Lead, review toàn bộ thư mục bmad-output/phase-3/.
Kiểm tra tính khả thi của Database Schema, khả năng mở rộng của API và kiến trúc WebSocket. Đưa ra phê duyệt (APPROVED) hoặc yêu cầu chỉnh sửa (NEEDS REVISION).
```

---

## Output Files

```
bmad-output/phase-3/
├── architecture.md         # System & WebSocket architecture
├── tech-stack.md           # Tech stack details
├── database-schema.md      # SQL Server ERD & Table specs
├── api-contracts.md        # RESTful API & Socket.IO events
└── adr/
    ├── adr-001-realtime-chat-socketio.md
    └── adr-002-image-storage.md
```

## Chuyển sang Phase 4
```text
Sau khi toàn bộ phase-3 được APPROVED, đóng vai Scrum Master để đọc phase-2 và phase-3, chuẩn bị lập kế hoạch Sprint cho Phase 4 (Implementation).
```
