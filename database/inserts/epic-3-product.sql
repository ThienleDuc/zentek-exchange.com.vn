-- D:\225TMDT\TMDT-Website\database\inserts\epic-3-product.sql

-- Dữ liệu mẫu cho Epic 3: Product Management

-- Thêm Danh Mục
DECLARE @Cat1 UNIQUEIDENTIFIER = NEWID();
DECLARE @Cat2 UNIQUEIDENTIFIER = NEWID();

INSERT INTO DanhMuc (MaDanhMuc, TenDanhMuc, MoTa, Icon)
VALUES 
(@Cat1, N'Linh kiện điện tử', N'Mạch, vi điều khiển, IC', 'cpu-icon'),
(@Cat2, N'Thiết bị thực hành', N'Đồng hồ VOM, mỏ hàn', 'tool-icon');

-- Thêm Sản Phẩm (Lấy cửa hàng ID)
DECLARE @ShopId UNIQUEIDENTIFIER = (SELECT TOP 1 MaCuaHang FROM CuaHang);

IF @ShopId IS NOT NULL
BEGIN
    INSERT INTO SanPham (MaSanPham, CuaHangId, DanhMucId, TieuDe, Gia, TinhTrang, SoLuong, TrangThaiDuyet)
    VALUES 
    (NEWID(), @ShopId, @Cat1, N'Arduino Uno R3', 150000, N'Mới', 50, N'Đã duyệt'),
    (NEWID(), @ShopId, @Cat2, N'Đồng hồ vạn năng DT830B', 80000, N'Mới', 20, N'Đã duyệt');
END
