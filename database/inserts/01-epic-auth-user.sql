USE ZenTekExchange;
GO

-- Epic 1: Authentication & User Management (Khởi tạo dữ liệu người dùng, quyền, profile)

-- 1. Khởi tạo dữ liệu bảng VaiTro
INSERT INTO VaiTro (TenVaiTro, MoTa)
SELECT src.TenVaiTro, src.MoTa
FROM (VALUES 
    ('Admin', N'Quản trị viên hệ thống'),
    ('Seller', N'Người bán hàng (Chủ cửa hàng)'),
    ('Buyer', N'Người mua hàng (Khách hàng)')
) AS src(TenVaiTro, MoTa)
WHERE NOT EXISTS (SELECT 1 FROM VaiTro v WHERE v.TenVaiTro = src.TenVaiTro);
GO

-- 2. Khởi tạo Admin
INSERT INTO NguoiDung (TenDangNhap, MatKhauHash, Email, HoTen, SoDienThoai, VaiTroId)
SELECT 'admin', '$2b$10$ZtnzXyZQ.mEXFmVPFTxJ0ezMw9f823XmbPDh2WVgeITK7BtXNgt9W', 'admin@zentek.com', N'Quản trị viên', '0999999999', 
       (SELECT MaVaiTro FROM VaiTro WHERE TenVaiTro = 'Admin')
WHERE NOT EXISTS (SELECT 1 FROM NguoiDung WHERE TenDangNhap = 'admin');
GO

-- 3. Khởi tạo Buyers
INSERT INTO NguoiDung (TenDangNhap, MatKhauHash, Email, HoTen, SoDienThoai, VaiTroId)
SELECT src.TenDangNhap, src.MatKhauHash, src.Email, src.HoTen, src.SoDienThoai, 
       (SELECT MaVaiTro FROM VaiTro WHERE TenVaiTro = 'Buyer')
FROM (VALUES 
    ('buyer01', '$2b$10$ZtnzXyZQ.mEXFmVPFTxJ0ezMw9f823XmbPDh2WVgeITK7BtXNgt9W', 'buyer01@gmail.com', N'Trần Thị Bích', '0911111111'),
    ('buyer02', '$2b$10$ZtnzXyZQ.mEXFmVPFTxJ0ezMw9f823XmbPDh2WVgeITK7BtXNgt9W', 'buyer02@gmail.com', N'Lê Hoàng Nam', '0922222222'),
    ('buyer03', '$2b$10$ZtnzXyZQ.mEXFmVPFTxJ0ezMw9f823XmbPDh2WVgeITK7BtXNgt9W', 'buyer03@gmail.com', N'Phạm Văn Cường', '0933333333'),
    ('buyer04', '$2b$10$ZtnzXyZQ.mEXFmVPFTxJ0ezMw9f823XmbPDh2WVgeITK7BtXNgt9W', 'buyer04@gmail.com', N'Hoàng Thu Thảo', '0944444444'),
    ('buyer05', '$2b$10$ZtnzXyZQ.mEXFmVPFTxJ0ezMw9f823XmbPDh2WVgeITK7BtXNgt9W', 'buyer05@gmail.com', N'Vũ Đức Anh', '0955555555')
) AS src(TenDangNhap, MatKhauHash, Email, HoTen, SoDienThoai)
WHERE NOT EXISTS (SELECT 1 FROM NguoiDung n WHERE n.TenDangNhap = src.TenDangNhap);
GO