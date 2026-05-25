# UX/UI Brief – ZenTek Exchange (Phase: Auth)

**Trạng thái**: Draft
**Ngày cập nhật**: 2026-05-25

---

## 1. Tổng quan UX (Auth)
- **Simplicity (Đơn giản hóa)**: Form đăng nhập và đăng ký cần được thiết kế gọn gàng, chia bố cục rõ ràng, tập trung vào các trường dữ liệu cần thiết.
- **Trust First (Tin cậy)**: Hiển thị các thông báo lỗi rõ ràng (Validation) ngay khi người dùng nhập sai, giúp họ nhận biết lỗi lập tức (ví dụ: mật khẩu không khớp, email đã tồn tại).
- **Vietnamese First**: 100% sử dụng tiếng Việt (Ví dụ: "Tên đăng nhập", "Mật khẩu", "Xác nhận mật khẩu").
- **Progressive Disclosure**: Sắp xếp các trường dữ liệu hợp lý, phân chia cột trên desktop để tránh form bị quá dài.

---

## 2. Information Architecture (IA) - Auth
```
ZenTek Exchange
├── 🔐 Trang Đăng Nhập (/login)
└── 📝 Trang Đăng Ký (/register)
```

---

## 3. Page Layouts & Wireframes

### 3.1 Trang Đăng Nhập & Đăng Ký
Sử dụng Card layout đặt ở giữa màn hình (Centered Card), với Background màu xám nhạt (`#F9FAFB`) và Card màu trắng (`#FFFFFF`) để làm nổi bật form.

**Trang Đăng Nhập:**
```text
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│       ┌──────────────────────────────────────────────┐       │
│       │                                              │       │
│       │                   [Logo]                     │       │
│       │           ĐĂNG NHẬP TÀI KHOẢN                │       │
│       │                                              │       │
│       │   Tên đăng nhập hoặc Email *                 │       │
│       │   [ Nhập tên đăng nhập hoặc email...     ]   │       │
│       │                                              │       │
│       │   Mật khẩu *                                 │       │
│       │   [ Nhập mật khẩu...                  ] [👁]  │       │
│       │                                              │       │
│       │   [ ] Ghi nhớ đăng nhập   Quên mật khẩu?     │       │
│       │                                              │       │
│       │   [            ĐĂNG NHẬP (Primary)       ]   │       │
│       │                                              │       │
│       │   Chưa có tài khoản? [ Đăng ký ngay ]        │       │
│       │                                              │       │
│       └──────────────────────────────────────────────┘       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

*(Lưu ý: Form Đăng ký có cấu trúc tương tự, chia làm 2 cột đối với các trường: Họ tên, SĐT, Username, Email, Mật khẩu, Xác nhận mật khẩu trên Desktop).*

---

## 4. Visual Design Guidelines

### 4.1 Color Palette
| Token | Hex | Sử dụng |
|-------|-----|---------|
| **Primary** | `#2563EB` (Blue 600) | Buttons chính (Đăng nhập, Đăng ký), links |
| **Secondary** | `#059669` (Emerald 600) | Thông báo thành công |
| **Danger** | `#DC2626` (Red 600) | Thông báo lỗi (Validation error) |
| **Surface** | `#FFFFFF` | Form Card background |
| **Background** | `#F9FAFB` (Gray 50) | Page background |

---

## 5. Interaction Patterns & States

| Trường hợp | Pattern |
|-----------|---------|
| **Validate Form Auth**| Real-time validation khi blur input (ví dụ sai định dạng email, mật khẩu không khớp). Báo lỗi text đỏ bên dưới. |
| **Form Đang Xử Lý** | Khi bấm nút Đăng nhập/Đăng ký, nút chuyển trạng thái mờ (disabled), hiển thị icon loading (spinner). |
| **Hiển thị mật khẩu** | Có icon `[👁]` cho phép người dùng click để xem dạng text thô của mật khẩu đã nhập. |
| **Trùng dữ liệu (Đăng ký)** | Thông báo text đỏ hoặc Toast nếu Username/Email/SĐT đã tồn tại. |
