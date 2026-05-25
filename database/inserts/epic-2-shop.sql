-- D:\225TMDT\TMDT-Website\database\inserts\epic-2-shop.sql

-- Dữ liệu mẫu cho Epic 2: Shop Management

-- Giả định đã lấy NguoiBanId từ bảng NguoiDung
DECLARE @SellerId UNIQUEIDENTIFIER = (SELECT TOP 1 MaNguoiDung FROM NguoiDung WHERE TenDangNhap = 'seller1');

IF @SellerId IS NOT NULL
BEGIN
    INSERT INTO CuaHang (MaCuaHang, NguoiBanId, TenCuaHang, MoTa, DiaChi, PhuongXa, QuanHuyen, TinhThanh, SoDienThoai, DaXacThucPhapLy)
    VALUES 
    (NEWID(), @SellerId, N'Linh Kiện Sinh Viên', N'Chuyên cung cấp linh kiện điện tử giá rẻ', N'123 Đường Tôn Đức Thắng', N'Hòa Khánh Nam', N'Liên Chiểu', N'Đà Nẵng', '0912345678', 1);
END
