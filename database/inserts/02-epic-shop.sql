USE ZenTekExchange;
GO

-- Epic 2: Shop Management (Khởi tạo dữ liệu cửa hàng, phê duyệt cửa hàng)

-- 1. Khởi tạo Người bán (Sellers)
INSERT INTO NguoiDung (TenDangNhap, MatKhauHash, Email, HoTen, SoDienThoai, VaiTroId)
SELECT src.TenDangNhap, src.MatKhauHash, src.Email, src.HoTen, src.SoDienThoai, 
       (SELECT MaVaiTro FROM VaiTro WHERE TenVaiTro = 'Seller')
FROM (VALUES 
    ('techstore', '$2b$10$naZUaVLdjGttP29GPwJzOuMOXi8EzpB1yQFsVWjerDcLybekgaW16', 'seller@zentek.com', N'Nguyễn Văn Linh', '0888888888'),
    ('seller01', '$2b$10$ZtnzXyZQ.mEXFmVPFTxJ0ezMw9f823XmbPDh2WVgeITK7BtXNgt9W', 'seller01@gmail.com', N'Đỗ Minh Trí', '0966666666'),
    ('seller02', '$2b$10$ZtnzXyZQ.mEXFmVPFTxJ0ezMw9f823XmbPDh2WVgeITK7BtXNgt9W', 'seller02@gmail.com', N'Ngô Thanh Hằng', '0977777777'),
    ('seller03', '$2b$10$ZtnzXyZQ.mEXFmVPFTxJ0ezMw9f823XmbPDh2WVgeITK7BtXNgt9W', 'seller03@gmail.com', N'Lương Quốc Vinh', '0988888888'),
    ('seller04', '$2b$10$ZtnzXyZQ.mEXFmVPFTxJ0ezMw9f823XmbPDh2WVgeITK7BtXNgt9W', 'seller04@gmail.com', N'Trịnh Xuân Phương', '0999888777'),
    ('seller05', '$2b$10$ZtnzXyZQ.mEXFmVPFTxJ0ezMw9f823XmbPDh2WVgeITK7BtXNgt9W', 'seller05@gmail.com', N'Bùi Hữu Đạt', '0912345678')
) AS src(TenDangNhap, MatKhauHash, Email, HoTen, SoDienThoai)
WHERE NOT EXISTS (SELECT 1 FROM NguoiDung n WHERE n.TenDangNhap = src.TenDangNhap);
GO

-- 2. Khởi tạo Cửa hàng liên kết (Dùng JOIN với bảng NguoiDung để lấy MaNguoiDung)
INSERT INTO CuaHang (NguoiBanId, TenCuaHang, MoTa, DiaChi, PhuongXa, QuanHuyen, TinhThanh, SoDienThoai, LoaiHinhCuaHang, MaSoThue, PdfGiayPhep, DaXacThucPhapLy, TrangThai)
SELECT 
    nd.MaNguoiDung, 
    src.TenCuaHang, src.MoTa, src.DiaChi, src.PhuongXa, src.QuanHuyen, src.TinhThanh, src.SoDienThoai, src.LoaiHinhCuaHang, src.MaSoThue, src.PdfGiayPhep, src.DaXacThucPhapLy, src.TrangThai
FROM (VALUES 
    ('techstore', N'ZenTek Official Store', N'Cửa hàng chuyên cung cấp linh kiện điện tử chính hãng', N'Số 123 Đường Công Nghệ', N'Phường Đổi Mới', N'Quận Sáng Tạo', N'Hà Nội', '0888888888', 1, 'MST_GOC_01', 'dummy-license.pdf', 1, 1),
    ('seller01', N'Minh Trí Store', N'Thời trang nam nữ cao cấp', N'Số 1 Lê Lợi', N'Phường 1', N'Quận 1', N'TP. Hồ Chí Minh', '0966666666', 1, 'MST_SHOP_01', 'license.pdf', 1, 1),
    ('seller02', N'Hằng Cosmetics', N'Mỹ phẩm chính hãng', N'Số 5 Nguyễn Huệ', N'Phường Bến Nghé', N'Quận 1', N'TP. Hồ Chí Minh', '0977777777', 1, 'MST_SHOP_02', 'license.pdf', 1, 1),
    ('seller03', N'Vinh Electronics', N'Đồ điện tử gia dụng', N'Số 10 Hùng Vương', N'Phường 4', N'Quận 5', N'TP. Hồ Chí Minh', '0988888888', 2, '0312345678', 'license.pdf', 1, 1),
    ('seller04', N'Phương Phương Books', N'Sách và văn phòng phẩm', N'Số 25 Lý Thường Kiệt', N'Phường 7', N'Quận 10', N'TP. Hồ Chí Minh', '0999888777', 1, 'MST_SHOP_04', 'license.pdf', 1, 1),
    ('seller05', N'Đạt Home Decor', N'Trang trí nội thất', N'Số 80 Nguyễn Văn Linh', N'Phường Tân Phú', N'Quận 7', N'TP. Hồ Chí Minh', '0912345678', 2, '0387654321', 'license.pdf', 1, 1)
) AS src(TenDangNhap, TenCuaHang, MoTa, DiaChi, PhuongXa, QuanHuyen, TinhThanh, SoDienThoai, LoaiHinhCuaHang, MaSoThue, PdfGiayPhep, DaXacThucPhapLy, TrangThai)
INNER JOIN NguoiDung nd ON nd.TenDangNhap = src.TenDangNhap
WHERE NOT EXISTS (SELECT 1 FROM CuaHang ch WHERE ch.NguoiBanId = nd.MaNguoiDung);
GO
