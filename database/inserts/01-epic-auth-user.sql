USE ZenTekExchange;
GO
-- Epic 1: Authentication & User Management (Khởi tạo dữ liệu người dùng, quyền, profile)

-- 1. Khởi tạo dữ liệu bảng VaiTro
INSERT INTO
    VaiTro (TenVaiTro, MoTa)
VALUES (
        'Admin',
        N'Quản trị viên hệ thống'
    ),
    (
        'Seller',
        N'Người bán hàng (Chủ cửa hàng)'
    ),
    (
        'Buyer',
        N'Người mua hàng (Khách hàng)'
    );

-- 2. Khai báo biến để lấy MaVaiTro tương ứng
DECLARE @AdminRoleId UNIQUEIDENTIFIER;

-- Lấy MaVaiTro của Admin
SELECT @AdminRoleId = MaVaiTro
FROM VaiTro
WHERE
    TenVaiTro = 'Admin';

-- 3. Khởi tạo dữ liệu người dùng (Admin)
-- Mật khẩu mẫu là '123456' (Bcrypt Hash 10 rounds)
INSERT INTO
    NguoiDung (
        TenDangNhap,
        MatKhauHash,
        Email,
        HoTen,
        SoDienThoai,
        VaiTroId
    )
VALUES (
        'admin',
        '$2b$10$ZtnzXyZQ.mEXFmVPFTxJ0ezMw9f823XmbPDh2WVgeITK7BtXNgt9W', -- Mã băm của "123456"
        'admin@zentek.com',
        N'Quản trị viên',
        '0999999999',
        @AdminRoleId
    );