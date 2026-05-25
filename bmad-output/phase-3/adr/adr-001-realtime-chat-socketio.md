# ADR-001: Lựa chọn Công nghệ Real-time Chat (Socket.IO)

**Ngày quyết định**: 2026-05-24
**Trạng thái**: Accepted

## 1. Bối cảnh
ZenTek Exchange có yêu cầu bắt buộc (Must-Have) là cung cấp hệ thống Chat đa dạng (Chat cộng đồng phòng chung, Chat 1-1 Buyer-Seller, Chat 1-1 User-User). Hệ thống cần đảm bảo tin nhắn gửi nhận tức thì (real-time).

Các lựa chọn được xem xét:
1. **Long-polling (HTTP) truyền thống**: Gọi API liên tục mỗi 3 giây.
2. **Native WebSockets (ws package)**: Sử dụng giao thức WebSocket thuần.
3. **Socket.IO**: Thư viện bọc WebSocket, cung cấp thêm tính năng.
4. **Third-party SaaS (Firebase Realtime DB, Pusher)**: Dùng dịch vụ ngoài.

## 2. Phân tích
- **Long-polling**: Tốn tài nguyên server nếu số lượng user lớn, độ trễ cao -> Loại bỏ.
- **Native WebSockets**: Nhanh, chuẩn nhưng thiếu các tính năng quản lý kết nối (auto-reconnect, fallback, broadcasting, rooms) -> Mất công tự code từ đầu.
- **Third-party SaaS**: Firebase/Pusher rất mạnh nhưng lại không đáp ứng tiêu chí "tự xây dựng backend hoàn chỉnh" của một đồ án môn học thuần túy. Khó giải thích sâu sắc về cơ sở dữ liệu nếu lưu chat ở dịch vụ ngoài.
- **Socket.IO**:
  - Hỗ trợ mô hình **Rooms (Phòng)** mặc định -> Cực kỳ hoàn hảo cho yêu cầu chia "Phòng chat chung" và "Phòng chat 1-1".
  - Auto-reconnection (tự động kết nối lại khi rớt mạng).
  - Tích hợp rất tốt với Node.js/Express.

## 3. Quyết định (Decision)
Chọn **Socket.IO** làm Real-time engine.

## 4. Hậu quả (Consequences)
- **Tích cực**: Tiết kiệm 50% thời gian code hệ thống logic cho các phòng chat (do dùng `socket.join(room)` có sẵn). Tăng độ tin cậy kết nối mạng cho user.
- **Thách thức**: Cần cấu hình lưu trữ Message vào SQL Server (MSSQL) đồng thời với việc push real-time. Cần xử lý cẩn thận middleware auth trên Socket để tránh lỗ hổng bảo mật.
