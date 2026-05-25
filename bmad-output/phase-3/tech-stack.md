# Tech Stack & Tools – ZenTek Exchange

**Trạng thái**: Draft
**Ngày tạo**: 2026-05-24
**Tạo bởi**: Software Architect Agent

---

## 1. Core Stack (MERN/SERN Stack biến thể)

Do yêu cầu đồ án sử dụng **SQL Server (MSSQL)** thay vì MongoDB, hệ thống sử dụng stack SERN (SQL Server, Express, React, Node).

### 1.1 Frontend

- **Framework**: **React.js TypeScript + SWC** (Vite.js)
  - _Lý do_: Build nhanh hơn Create React App, cộng đồng lớn, component-based giúp tái sử dụng UI (Product Card, Chat Bubble).
- **Styling**: **Tailwind CSS**
  - _Lý do_: Utility-first CSS, code giao diện nhanh, dễ maintain, không phải suy nghĩ về đặt tên class.
- **Routing**: **React Router DOM v6**
  - _Lý do_: Chuẩn công nghiệp cho Single Page Application (SPA) trên React.
- **State Management**: **Zustand** hoặc **Redux Toolkit**
  - _Lý do_: Quản lý global state như thông tin user đăng nhập (Auth State) và giỏ hàng (Cart State).
- **HTTP Client**: **Axios**
  - _Lý do_: Hỗ trợ interceptors (tự động gắn JWT token vào mọi request).

### 1.2 Backend

- **Runtime**: **Node.js**
- **Framework**: **Express.js**
  - _Lý do_: Nhẹ, linh hoạt, rất phổ biến cho đồ án sinh viên, có rất nhiều tài liệu.
- **Real-time Engine**: **Socket.IO**
  - _Lý do_: Hỗ trợ auto-reconnect, fallback sang long-polling nếu WebSocket fail, dễ dàng quản lý "Rooms" cho các tính năng chat 1-1 và chat cộng đồng.
- **File Upload**: **Multer**
  - _Lý do_: Middleware chuẩn để xử lý multipart/form-data trong Express.
- **Security**: **Bcrypt** (hash password), **jsonwebtoken** (JWT auth), **CORS** (cross-origin).

### 1.3 Database

- **RDBMS**: **Microsoft SQL Server (MSSQL)**
  - _Lý do_: Yêu cầu bắt buộc/được chỉ định của môn học, tính toàn vẹn dữ liệu cao (ACID), mạnh mẽ trong các query quan hệ (quan trọng cho Orders, Products).
- **Driver**: **mssql** package (hoặc ORM như **Sequelize** / **Prisma**)
  - _Khuyến nghị_: Sử dụng package `mssql` thuần kết hợp Stored Procedures (nếu yêu cầu đồ án gắt gao về SQL) hoặc **Prisma** (ORM hiện đại, type-safe) nếu được phép.

---

## 2. Development & Deployment Tools

- **Version Control**: **Git** / **GitHub**
- **Linter & Formatter**: **ESLint** + **Prettier**
- **API Testing**: **Postman** hoặc **Hoppscotch**
- **Database GUI**: **SQL Server Management Studio (SSMS)** hoặc **Azure Data Studio**
- **Local Dev**: **Nodemon** (Backend auto-restart), **Vite HMR** (Frontend)

## 3. Tại sao chọn Tech Stack này cho Đồ án?

1. **Hiệu suất phát triển cao**: React + Tailwind + Express là combo giúp code cực nhanh, dễ tìm tutorial.
2. **Khả năng demo tốt**: Socket.IO mang lại hiệu ứng real-time ấn tượng cho giám khảo (wow-factor).
3. **Phù hợp scope**: Hệ thống Monolithic với file upload local là đủ cho yêu cầu đồ án (không cần Microservices hay Cloud AWS/S3 phức tạp gây lãng phí thời gian cấu hình).
