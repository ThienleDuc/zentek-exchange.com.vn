# Epic 1: Authentication & User Management (UX/UI Brief)

---

## 1. Information Architecture (IA)
```text
ZenTek Exchange
├── 🔐 Trang Đăng Nhập (/login)
└── 📝 Trang Đăng Ký (/register)
```

---

## 2. Page Layouts & Grid System (Tailwind CSS 12-col)

Toàn bộ giao diện áp dụng **Hệ thống Grid 12 cột của Tailwind CSS** để đảm bảo Responsive hoàn hảo trên mọi thiết bị:
- **Mobile (mặc định)**: Container form chiếm trọn 12/12 cột màn hình (`w-full px-4`).
- **Tablet (`md:`)**: Container form chiếm 8/12 cột, căn giữa (`md:w-8/12 md:mx-auto`).
- **Desktop (`lg:`)**: 
  - Form Đăng nhập chiếm **4/12 cột** (`lg:w-4/12` hoặc `lg:max-w-md`), căn giữa màn hình.
  - Form Đăng ký chiếm **6/12 cột** (`lg:w-6/12` hoặc `lg:max-w-2xl`), căn giữa màn hình.

### 2.1 Trang Đăng Nhập & Đăng Ký
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

*(Lưu ý: Form Đăng ký có cấu trúc tương tự. Bên trong Form Đăng ký, sử dụng CSS Grid `grid grid-cols-12 gap-4`. Trên Desktop (`lg:`), các trường như Họ tên, SĐT, Username, Email được set `lg:col-span-6` (chiếm 6/12 cột của form) để tạo thành giao diện 2 cột. Còn trên Mobile, chúng tự động chuyển về `col-span-12` để hiển thị thành 1 cột từ trên xuống dưới).*

---

## 3. Interaction Patterns & States

| Trường hợp | Pattern |
|-----------|---------|
| **Validate Form Auth**| Real-time validation khi blur input (ví dụ sai định dạng email, mật khẩu không khớp). Báo lỗi text đỏ bên dưới. |
| **Form Đang Xử Lý** | Khi bấm nút Đăng nhập/Đăng ký, nút chuyển trạng thái mờ (disabled), hiển thị icon loading (spinner). |
| **Hiển thị mật khẩu** | Có icon `[👁]` cho phép người dùng click để xem dạng text thô của mật khẩu đã nhập. |
| **Trùng dữ liệu (Đăng ký)** | Thông báo text đỏ hoặc Toast nếu Username/Email/SĐT đã tồn tại. |
