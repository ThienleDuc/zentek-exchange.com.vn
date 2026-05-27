USE ZenTekExchange;
GO

-- Epic 2: Shop Management (Khởi tạo dữ liệu cửa hàng, phê duyệt cửa hàng)

-- 1. Khai báo biến để lấy MaVaiTro của Seller
DECLARE @SellerRoleId UNIQUEIDENTIFIER;

SELECT @SellerRoleId = MaVaiTro
FROM VaiTro
WHERE TenVaiTro = 'Seller';

-- 2. Khởi tạo dữ liệu người bán (Seller)
-- Mật khẩu mẫu là '123456'
DECLARE @NguoiBanId UNIQUEIDENTIFIER = NEWID();

INSERT INTO
    NguoiDung (
        MaNguoiDung,
        TenDangNhap,
        MatKhauHash,
        Email,
        HoTen,
        SoDienThoai,
        VaiTroId
    )
VALUES (
        @NguoiBanId,
        'techstore',
        '$2b$10$naZUaVLdjGttP29GPwJzOuMOXi8EzpB1yQFsVWjerDcLybekgaW16', -- Mã băm của "123456"
        'seller@zentek.com',
        N'Nguyễn Văn Linh',
        '0888888888',
        @SellerRoleId
    );

-- 3. Khởi tạo dữ liệu Cửa Hàng liên kết với Người Bán
INSERT INTO
    CuaHang (
        NguoiBanId,
        TenCuaHang,
        MoTa,
        DiaChi,
        PhuongXa,
        QuanHuyen,
        TinhThanh,
        SoDienThoai,
        LoaiHinhCuaHang,
        MaSoThue,
        PdfGiayPhep,
        DaXacThucPhapLy,
        TrangThai
    )
VALUES (
        @NguoiBanId,
        N'ZenTek Official Store',
        N'Cửa hàng chuyên cung cấp linh kiện điện tử chính hãng',
        N'Số 123 Đường Công Nghệ',
        N'Phường Đổi Mới',
        N'Quận Sáng Tạo',
        N'Hà Nội',
        '0888888888',
        1, -- Cá nhân
        '', -- Mã số thuế rỗng cho cá nhân
        'dummy-license.pdf',
        1, -- Đã xác thực
        1  -- Hoạt động
    );
GO
