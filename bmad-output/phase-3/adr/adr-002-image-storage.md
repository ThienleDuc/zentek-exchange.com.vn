# ADR-002: Lựa chọn Phương thức Lưu trữ Hình ảnh

**Ngày quyết định**: 2026-05-24
**Trạng thái**: Accepted

## 1. Bối cảnh
Hệ thống TMĐT ZenTek cần lưu trữ rất nhiều hình ảnh: Ảnh đại diện user, Logo cửa hàng, và đặc biệt là ảnh chi tiết của Sản phẩm (một sản phẩm có thể có 3-5 ảnh). 

Các lựa chọn được xem xét:
1. **Lưu dưới dạng Base64 string / Binary trong CSDL SQL Server**.
2. **Lưu trữ đám mây (Cloud Storage) như AWS S3, Cloudinary**.
3. **Lưu trữ cục bộ trên máy chủ (Local File System)**.

## 2. Phân tích
- **Lưu Base64 / Binary trong MSSQL**:
  - *Nhược điểm*: Làm phình to CSDL cực kì nhanh. Query chậm. Không tận dụng được bộ đệm cache của trình duyệt cho static assets. -> Loại bỏ hoàn toàn.
- **Cloud Storage (AWS S3 / Cloudinary)**:
  - *Ưu điểm*: Chuẩn công nghiệp, scalable, nhanh (CDN).
  - *Nhược điểm*: Yêu cầu tài khoản thẻ tín dụng, cấu hình khóa API phức tạp, có rủi ro bị tính phí nếu code lỗi (infinite loop upload). Không cần thiết cho một hệ thống đang ở mức MVP / Đồ án môn học.
- **Local File System (sử dụng thư viện Multer + Express Static)**:
  - *Ưu điểm*: Setup cực nhanh. 0 đồng phí. Khi demo localhost chạy lập tức.
  - *Nhược điểm*: Khó scale ngang (nghĩa là nếu chạy 2 server backend, ảnh upload lên server 1 sẽ không thấy ở server 2). 

## 3. Quyết định (Decision)
Sử dụng **Local File System (Multer)** lưu trực tiếp vào thư mục `/public/uploads/` của thư mục backend. Trong CSDL (SQL Server) chỉ lưu đường dẫn chuỗi tĩnh (ví dụ: `/uploads/products/image123.png`).

## 4. Hậu quả (Consequences)
- **Tích cực**: Phù hợp 100% với môi trường đồ án sinh viên. Development nhanh, demo mượt mà, không phụ thuộc internet ngoại vi khi demo.
- **Rủi ro**: Quản lý rác (nếu xóa sản phẩm trong CSDL, cần code thêm logic để vào thư mục vật lý xóa file ảnh, nếu không sẽ tốn ổ cứng). Nếu sau này dự án scale thật (Startup), bắt buộc phải migrate ảnh sang AWS S3.
