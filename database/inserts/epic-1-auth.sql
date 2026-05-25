-- D:\225TMDT\TMDT-Website\database\inserts\epic-1-auth.sql

-- Dữ liệu mẫu cho Epic 1: Authentication & User Management

-- Tạo Vai Trò
DECLARE @AdminRole UNIQUEIDENTIFIER = NEWID();
DECLARE @SellerRole UNIQUEIDENTIFIER = NEWID();
DECLARE @BuyerRole UNIQUEIDENTIFIER = NEWID();

INSERT INTO VaiTro (MaVaiTro, TenVaiTro, MoTa)
VALUES 
(@AdminRole, 'quantri', N'Quản trị viên hệ thống'),
(@SellerRole, 'nguoiban', N'Người bán hàng (Sinh viên/Hộ kinh doanh)'),
(@BuyerRole, 'nguoimua', N'Người mua hàng (Sinh viên)');

-- Tạo Người Dùng
INSERT INTO NguoiDung (MaNguoiDung, TenDangNhap, MatKhauHash, Email, HoTen, SoDienThoai, VaiTroId)
VALUES 
(NEWID(), 'admin', '$2b$10$wTf2zD.aX5A0H5c8w/2uDO...', 'admin@zentek.vn', N'Quản trị viên', '0901234567', @AdminRole),
(NEWID(), 'seller1', '$2b$10$wTf2zD.aX5A0H5c8w/2uDO...', 'seller1@zentek.vn', N'Nguyễn Văn A', '0912345678', @SellerRole),
(NEWID(), 'buyer1', '$2b$10$wTf2zD.aX5A0H5c8w/2uDO...', 'buyer1@zentek.vn', N'Trần Thị B', '0923456789', @BuyerRole);
