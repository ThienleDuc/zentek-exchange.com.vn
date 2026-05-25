# Test Plan (Giai đoạn 4: Hoàn thiện và triển khai)

**Dự án:**greenlife.danang.vn.com
**Phiên bản:** 4.0
**Ngày tạo:** 2026-05-26
**Người tạo:** AI Assistant
**Mục tiêu:** Kiểm tra tất cả các tính năng đã phát triển, đảm bảo hệ thống hoạt động ổn định và sẵn sàng triển khai.

## 1. Danh sách các tính năng cần kiểm thử

### 1.1 Quản lý kế hoạch (Dashboard)

- [ ] Tạo kế hoạch mới (trạng thái: Đã gửi)
- [ ] Xem chi tiết kế hoạch
- [ ] Sửa kế hoạch (chỉ sửa được khi: Mới tạo hoặc Đang thẩm định, chưa quá hạn 15 ngày)
- [ ] Xóa kế hoạch (chỉ xóa được khi: Mới tạo, chưa có người duyệt)
- [ ] Gửi lại kế hoạch (chỉ NVKT gửi lại khi bị từ chối, không quá 15 ngày)
- [ ] Hủy phê duyệt (chỉ CBQL hủy khi chưa quá hạn 15 ngày)

### 1.2. Lịch/Thời gian biểu

- [ ] Đồng bộ lịch với Google Calendar
- [ ] Xem chi tiết lịch
- [ ] Đồng bộ ngày nghỉ, sự kiện đặc biệt
- [ ] Thông báo sự kiện sắp tới

### 1.3. Tự động hóa quy trình

- [ ] Tự động hủy kế hoạch quá hạn (15 ngày)
- [ ] Thông báo quy trình phê duyệt
- [ ] Đặt lịch chạy định kỳ (Cron job)

### 1.4. Báo cáo và phân tích

- [ ] Báo cáo tiến độ công việc
- [ ] Phân tích hiệu suất làm việc
- [ ] Biểu đồ trực quan
- [ ] Xuất báo cáo (Excel/PDF)

### 1.5. Quản lý dự án

- [ ] Tạo dự án
- [ ] Giao việc cho nhân viên
- [ ] Theo dõi tiến độ
- [ ] Đánh giá hiệu suất

### 1.6. Quản lý người dùng

- [ ] Thêm, sửa, xóa tài khoản nhân viên/cán bộ quản lý
- [ ] Phân quyền theo vai trò (NVKT, CBQL, Admin)
- [ ] Reset mật khẩu
- [ ] Quản lý thông tin cá nhân

### 1.7. Quản lý thiết bị

- [ ] Tạo/cập nhật thông tin thiết bị
- [ ] Gán thiết bị vào kế hoạch
- [ ] Theo dõi tình trạng sử dụng
- [ ] Lịch bảo trì thiết bị

### 1.8. Quản lý vật tư

- [ ] Tạo/cập nhật vật tư
- [ ] Gán vật tư vào kế hoạch
- [ ] Theo dõi tồn kho
- [ ] Lịch bổ sung vật tư

### 1.9. Xác thực và bảo mật

- [ ] Đăng nhập/đăng xuất
- [ ] Đổi mật khẩu
- [ ] Quản lý session
- [ ] Kiểm tra quyền truy cập

## 2. Kịch bản kiểm thử chi tiết

### 2.1 Kịch bản 1: Tạo và phê duyệt kế hoạch (luồng chính)

| Bước | Mô tả                                         |
| ---- | --------------------------------------------- |
| 1    | Đăng nhập với tài khoản NVKT                  |
| 2    | Tạo kế hoạch mới (ngày tạo hiện tại + 2 ngày) |
| 3    | Kiểm tra trạng thái: "Đã gửi"                 |
| 4    | Đăng xuất và đăng nhập với tài khoản CBQL     |
| 5    | Tìm kế hoạch vừa tạo                          |
| 6    | Phê duyệt kế hoạch                            |
| 7    | Kiểm tra trạng thái: "Đã phê duyệt"           |
| 8    | Xuất PDF và kiểm tra nội dung                 |

### 2.2 Kịch bản 2: Tạo kế hoạch bị từ chối

| Bước | Mô tả                                 |
| ---- | ------------------------------------- |
| 1    | Đăng nhập với tài khoản NVKT          |
| 2    | Tạo kế hoạch                          |
| 3    | Đăng nhập với tài khoản CBQL          |
| 4    | Từ chối phê duyệt và ghi chú lý do    |
| 5    | Kiểm tra trạng thái: "Bị từ chối"     |
| 6    | Đăng nhập lại với tài khoản NVKT      |
| 7    | Gửi lại kế hoạch                      |
| 8    | Kiểm tra trạng thái: "Đã gửi"         |
| 9    | Đăng nhập với tài khoản CBQL          |
| 10   | Hủy phê duyệt (chuyển về thẩm định)   |
| 11   | Kiểm tra trạng thái: "Đang thẩm định" |

### 2.3 Kịch bản 3: Tự động hủy kế hoạch quá hạn

| Bước | Mô tả                                              |
| ---- | -------------------------------------------------- |
| 1    | Tạo kế hoạch với ngày tạo hiện tại - 20 ngày       |
| 2    | Kiểm tra trạng thái: "Đã hủy" (do quá hạn 15 ngày) |
| 3    | Kiểm tra email thông báo                           |
| 4    | Kiểm tra log chạy Cron job                         |

### 2.4 Kịch bản 4: Đồng bộ Google Calendar

| Bước | Mô tả                                     |
| ---- | ----------------------------------------- |
| 1    | Cấu hình Google Calendar                  |
| 2    | Tạo sự kiện trên Google Calendar          |
| 3    | Kích hoạt đồng bộ                         |
| 4    | Kiểm tra kế hoạch xuất hiện trên hệ thống |
| 5    | Cập nhật sự kiện trên Google Calendar     |
| 6    | Kiểm tra cập nhật trên hệ thống           |
| 7    | Xóa sự kiện trên Google Calendar          |
| 8    | Kiểm tra loại bỏ sự kiện trên hệ thống    |

### 2.5 Kịch bản 5: Báo cáo và xuất file

| Bước | Mô tả                                       |
| ---- | ------------------------------------------- |
| 1    | Tạo nhiều kế hoạch với trạng thái khác nhau |
| 2    | Chọn khoảng thời gian                       |
| 3    | Xuất báo cáo Excel                          |
| 4    | Mở file Excel và kiểm tra dữ liệu           |
| 5    | Xuất báo cáo PDF                            |
| 6    | Mở file PDF và kiểm tra định dạng           |
| 7    | Kiểm tra biểu đồ trực quan                  |

## 3. Kiểm thử hiệu năng

### 3.1 Kiểm thử tải

- [ ] Tải đồng thời 50 người dùng truy cập
- [ ] Tạo 1000 kế hoạch trong 1 phút
- [ ] Xuất báo cáo với dữ liệu lớn
- [ ] Kiểm tra thời gian phản hồi dưới 3 giây

### 3.2 Kiểm thử độ bền

- [ ] Chạy hệ thống liên tục 24 giờ
- [ ] Kiểm tra rò rỉ bộ nhớ
- [ ] Kiểm tra kết nối database
- [ ] Đảm bảo không có lỗi sau 1000 request

## 4. Kiểm thử bảo mật

### 4.1 Kiểm thử XSS

- [ ] Thử nhập script vào ô tìm kiếm
- [ ] Thử nhập script vào mô tả kế hoạch
- [ ] Thử nhập script vào tên người dùng

### 4.2 Kiểm thử SQL Injection

- [ ] Thử nhập SQL command vào các trường input
- [ ] Kiểm tra tham số hóa câu lệnh SQL
- [ ] Đảm bảo không có lỗ hổng

### 4.3 Kiểm thử CSRF

- [ ] Tạo request giả mạo
- [ ] Kiểm tra CSRF token
- [ ] Đảm bảo bảo vệ CSRF hoạt động

### 4.4 Kiểm thử quyền truy cập

- [ ] NVKT truy cập trang admin
- [ ] CBQL truy cập tính năng chỉ dành cho NVKT
- [ ] Admin truy cập database trực tiếp
- [ ] Kiểm tra lỗi 403 Forbidden

### 4.5 Kiểm thử mã hóa

- [ ] Kiểm tra mã hóa mật khẩu (bcrypt)
- [ ] Kiểm tra mã hóa token (JWT)
- [ ] Kiểm tra HTTPS
- [ ] Kiểm tra key API

## 5. Kiểm thử khả năng sử dụng

### 5.1 Kiểm thử giao diện

- [ ] Kiểm tra responsive trên mobile (360px, 480px)
- [ ] Kiểm tra responsive trên tablet (768px, 1024px)
- [ ] Kiểm tra responsive trên desktop (1200px, 1440px)
- [ ] Kiểm tra chế độ tối (dark mode) nếu có
