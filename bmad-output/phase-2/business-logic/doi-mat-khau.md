# Logic trang đổi mật khẩu (dùng chung cho Seller & Buyer)

## 1. Yêu cầu chung

- Người dùng đã đăng nhập (có JWT token).
- Sử dụng thư viện **bcrypt** từ `utils` để mã hóa và so sánh mật khẩu.
- Giao diện gồm 3 trường:
  - Mật khẩu hiện tại (Current Password)
  - Mật khẩu mới (New Password)
  - Xác nhận mật khẩu mới (Confirm New Password)

## 2. Luồng xử lý phía client

### 2.1. Kiểm tra đầu vào

- Mật khẩu mới và xác nhận phải khớp nhau.
- Mật khẩu mới phải đáp ứng chính sách (độ dài tối thiểu 6 ký tự, có thể thêm yêu cầu về ký tự đặc biệt, chữ hoa,... tùy theo cấu hình hệ thống).
- Mật khẩu mới không được trùng với mật khẩu hiện tại (kiểm tra phía client có thể cảnh báo sớm, nhưng server vẫn phải kiểm tra lại).

### 2.2. Gửi yêu cầu đổi mật khẩu

- API: `PUT /api/nguoidung/doi-mat-khau`
- Method: PUT
- Header: `Authorization: Bearer <token>`
- Body (JSON):

```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```
