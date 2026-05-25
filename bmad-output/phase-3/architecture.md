# System Architecture – ZenTek Exchange

**Trạng thái**: Draft
**Ngày tạo**: 2026-05-24
**Tạo bởi**: Software Architect Agent

---

## 1. High-Level Architecture

Hệ thống được thiết kế theo mô hình Client-Server (Monolithic Backend kết hợp Real-time qua WebSocket). Do đây là đồ án sinh viên, kiến trúc ưu tiên tính đơn giản, dễ triển khai nhưng vẫn đảm bảo tách biệt rõ ràng giữa Frontend và Backend.

```mermaid
graph TD
    Client[Client Browser<br/>React.js + TailwindCSS]
    
    subgraph Backend [Node.js / Express Server]
        API[REST API Controllers]
        AuthMW[Auth & Role Middleware<br/>JWT]
        UploadMW[File Upload Middleware<br/>Multer]
        SocketServer[WebSocket Server<br/>Socket.IO]
        Services[Business Logic Services]
        DAL[Data Access Layer<br/>mssql]
    end
    
    DB[(SQL Server<br/>MSSQL)]
    Storage[Local File Storage<br/>/public/uploads]
    
    Client -- HTTP/REST --> AuthMW
    Client -- ws:// --> SocketServer
    Client -- Multipart/form-data --> UploadMW
    
    AuthMW --> API
    UploadMW --> Storage
    UploadMW --> API
    
    API --> Services
    SocketServer --> Services
    
    Services --> DAL
    DAL --> DB
```

## 2. Flow Xử lý Chat Đa dạng (WebSocket)

ZenTek hỗ trợ 3 loại chat (Cộng đồng, 1-1 Buyer-Seller, 1-1 User-User). Tất cả đều chung một kiến trúc Socket.IO Room.

```mermaid
sequenceDiagram
    participant UserA as Client (User A)
    participant Server as Socket.IO Server
    participant DB as SQL Server
    participant UserB as Client (User B)

    UserA->>Server: connect() + gửi JWT Token
    Server->>Server: Xác thực Token
    UserA->>Server: emit("join_room", roomId)
    Server-->>UserA: Xác nhận join room
    
    UserA->>Server: emit("send_message", {roomId, text})
    Server->>DB: INSERT INTO ChatMessages
    DB-->>Server: Trả về MessageID
    Server->>UserB: emit("receive_message", {MessageID, text, sender: User A}) (nếu User B trong room)
```

## 3. Storage Architecture

Để tối ưu chi phí và đơn giản hóa môi trường Local, file hình ảnh (Avatar, Ảnh sản phẩm) sẽ được upload và lưu trữ cục bộ tại server backend.

1. Client gửi request `multipart/form-data`.
2. Middleware `multer` nhận file, lưu vào thư mục `public/uploads/products/` hoặc `public/uploads/avatars/`.
3. Backend lấy filename/path do `multer` sinh ra, lưu chuỗi URL tĩnh (ví dụ: `/uploads/products/12345.jpg`) vào SQL Server.
4. Client hiển thị ảnh thông qua việc truy cập trực tiếp Static File Server của Express (`express.static('public')`).

## 4. Security Architecture

- **Authentication**: Stateless với JSON Web Token (JWT). Token được lưu ở `localStorage` hoặc `httpOnly cookie` ở phía Client.
- **Password Hashing**: `bcrypt` với vòng lặp salt (10 rounds).
- **Authorization**: Middleware kiểm tra `VaiTro` (Role) trong JWT Payload trước khi cho phép vào các route đặc thù (`/api/admin/*` chỉ dành cho Admin, `/api/seller/*` chỉ dành cho Seller).
- **Socket Security**: Yêu cầu truyền JWT Token vào lúc handshake connection. Ngắt kết nối ngay nếu token không hợp lệ.
