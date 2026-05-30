USE ZenTekExchange;
GO

-- Epic 5: Order Management (Khởi tạo dữ liệu giỏ hàng, đơn hàng, trạng thái đơn)

-- 1. Khởi tạo Giỏ hàng
INSERT INTO GioHang (NguoiMuaId)
SELECT 
    (SELECT TOP 1 MaNguoiDung FROM NguoiDung WHERE TenDangNhap = src.TenDangNhapBuyer)
FROM (VALUES 
    ('buyer01')
) AS src(TenDangNhapBuyer)
WHERE NOT EXISTS (SELECT 1 FROM GioHang g 
                  JOIN NguoiDung n ON g.NguoiMuaId = n.MaNguoiDung 
                  WHERE n.TenDangNhap = src.TenDangNhapBuyer);
GO

-- 2. Khởi tạo Chi tiết giỏ hàng
INSERT INTO ChiTietGioHang (GioHangId, SanPhamId, PhanLoaiId, SoLuong, DonGia)
SELECT 
    (SELECT TOP 1 g.MaGioHang FROM GioHang g JOIN NguoiDung n ON g.NguoiMuaId = n.MaNguoiDung WHERE n.TenDangNhap = src.TenDangNhapBuyer),
    (SELECT TOP 1 MaSanPham FROM SanPham WHERE LinkSanPham = src.LinkSanPham),
    (SELECT TOP 1 MaPhanLoai FROM PhanLoai pl JOIN SanPham sp ON pl.SanPhamId = sp.MaSanPham WHERE sp.LinkSanPham = src.LinkSanPham AND pl.TenPhanLoai = src.TenPhanLoai),
    src.SoLuong, src.DonGia
FROM (VALUES 
    ('buyer01', 'asus-rog-strix-g15', N'Màu Đen - 16GB RAM', 1, 25000000)
) AS src(TenDangNhapBuyer, LinkSanPham, TenPhanLoai, SoLuong, DonGia)
WHERE NOT EXISTS (SELECT 1 FROM ChiTietGioHang ct 
                  JOIN GioHang g ON ct.GioHangId = g.MaGioHang 
                  JOIN NguoiDung n ON g.NguoiMuaId = n.MaNguoiDung 
                  JOIN SanPham sp ON ct.SanPhamId = sp.MaSanPham
                  WHERE n.TenDangNhap = src.TenDangNhapBuyer AND sp.LinkSanPham = src.LinkSanPham);
GO

-- 3. Khởi tạo Đơn hàng (Đã giao thành công để có thể đánh giá ở Epic 06)
INSERT INTO DonHang (NguoiMuaId, HoTenNguoiNhan, SoDienThoaiNguoiNhan, DiaChiNhan, TrangThaiDon)
SELECT 
    (SELECT TOP 1 MaNguoiDung FROM NguoiDung WHERE TenDangNhap = src.TenDangNhapBuyer),
    src.HoTenNguoiNhan, src.SoDienThoaiNguoiNhan, src.DiaChiNhan, src.TrangThaiDon
FROM (VALUES 
    ('buyer01', N'Trần Thị Bích', '0911111111', N'Số 10 Lê Duẩn, Quận 1, TP.HCM', N'Đã nhận')
) AS src(TenDangNhapBuyer, HoTenNguoiNhan, SoDienThoaiNguoiNhan, DiaChiNhan, TrangThaiDon)
WHERE NOT EXISTS (SELECT 1 FROM DonHang dh 
                  JOIN NguoiDung n ON dh.NguoiMuaId = n.MaNguoiDung 
                  WHERE n.TenDangNhap = src.TenDangNhapBuyer AND dh.TrangThaiDon = src.TrangThaiDon);
GO

-- 4. Khởi tạo Chi tiết Đơn hàng
INSERT INTO ChiTietDonHang (DonHangId, SanPhamId, PhanLoaiId, SoLuong, DonGia, GhiChu)
SELECT 
    (SELECT TOP 1 dh.MaDonHang FROM DonHang dh JOIN NguoiDung n ON dh.NguoiMuaId = n.MaNguoiDung WHERE n.TenDangNhap = src.TenDangNhapBuyer AND dh.TrangThaiDon = src.TrangThaiDon),
    (SELECT TOP 1 MaSanPham FROM SanPham WHERE LinkSanPham = src.LinkSanPham),
    (SELECT TOP 1 MaPhanLoai FROM PhanLoai pl JOIN SanPham sp ON pl.SanPhamId = sp.MaSanPham WHERE sp.LinkSanPham = src.LinkSanPham AND pl.TenPhanLoai = src.TenPhanLoai),
    src.SoLuong, src.DonGia, src.GhiChu
FROM (VALUES 
    ('buyer01', N'Đã nhận', 'asus-rog-strix-g15', N'Màu Đen - 16GB RAM', 1, 25000000, N'Giao giờ hành chính')
) AS src(TenDangNhapBuyer, TrangThaiDon, LinkSanPham, TenPhanLoai, SoLuong, DonGia, GhiChu)
WHERE NOT EXISTS (SELECT 1 FROM ChiTietDonHang ct 
                  JOIN DonHang dh ON ct.DonHangId = dh.MaDonHang 
                  JOIN NguoiDung n ON dh.NguoiMuaId = n.MaNguoiDung 
                  JOIN SanPham sp ON ct.SanPhamId = sp.MaSanPham
                  WHERE n.TenDangNhap = src.TenDangNhapBuyer AND sp.LinkSanPham = src.LinkSanPham);
GO
