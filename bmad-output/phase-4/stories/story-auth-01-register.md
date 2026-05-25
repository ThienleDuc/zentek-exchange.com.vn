# Story: AUTH-01 - Đăng ký tài khoản

**Status**: Ready
**Assignee**: Developer

## Description
Là một khách truy cập, tôi muốn đăng ký một tài khoản mới để có thể mua hàng hoặc trao đổi trên hệ thống.

## Acceptance Criteria
- **AC1**: Form đăng ký yêu cầu: Tên đăng nhập, Email, Mật khẩu, Họ tên.
- **AC2**: Mật khẩu phải được mã hóa (bcrypt) trước khi lưu.
- **AC3**: Email và Tên đăng nhập phải là unique. Hệ thống báo lỗi nếu trùng.

## Technical Tasks
- [ ] Thiết lập bảng `Users` trong mssql.
- [ ] Viết API `POST /api/auth/register`.
- [ ] Implement UI `Register.jsx`.
