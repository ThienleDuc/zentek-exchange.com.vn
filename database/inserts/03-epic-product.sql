USE ZenTekExchange;
GO

-- Epic 3: Product Management (Khởi tạo dữ liệu sản phẩm, danh mục tĩnh)

DECLARE @DienThoaiId UNIQUEIDENTIFIER = NEWID();
DECLARE @LaptopId UNIQUEIDENTIFIER = NEWID();
DECLARE @LinhKienId UNIQUEIDENTIFIER = NEWID();
DECLARE @AmThanhId UNIQUEIDENTIFIER = NEWID();
DECLARE @PhuKienId UNIQUEIDENTIFIER = NEWID();

-- 1. Insert Parent Categories (Danh mục cấp 1)
INSERT INTO DanhMuc (MaDanhMuc, TenDanhMuc, MoTa, DanhMucChaId, Icon, ThuTuHienThi)
VALUES 
(@DienThoaiId, N'Điện thoại & Tablet', N'Các loại điện thoại thông minh, máy tính bảng', NULL, 'Smartphone', 1),
(@LaptopId, N'Máy tính xách tay', N'Laptop văn phòng, laptop gaming, macbook', NULL, 'Laptop', 2),
(@LinhKienId, N'Linh kiện máy tính', N'CPU, RAM, VGA, Mainboard, Ổ cứng', NULL, 'Cpu', 3),
(@AmThanhId, N'Thiết bị âm thanh', N'Tai nghe, loa bluetooth, thiết bị thu âm', NULL, 'Headphones', 4),
(@PhuKienId, N'Phụ kiện & Khác', N'Cáp sạc, pin dự phòng, chuột, bàn phím', NULL, 'Cable', 5);

-- 2. Insert Child Categories (Danh mục cấp 2) cho Điện thoại & Tablet
INSERT INTO DanhMuc (TenDanhMuc, MoTa, DanhMucChaId, Icon, ThuTuHienThi)
VALUES 
(N'Điện thoại Apple (iPhone)', N'Các dòng máy Apple iPhone', @DienThoaiId, 'Smartphone', 1),
(N'Điện thoại Android', N'Samsung, Xiaomi, Oppo, v.v.', @DienThoaiId, 'Smartphone', 2),
(N'Máy tính bảng (iPad/Tab)', N'iPad, Galaxy Tab, v.v.', @DienThoaiId, 'Tablet', 3);

-- 3. Insert Child Categories (Danh mục cấp 2) cho Laptop
INSERT INTO DanhMuc (TenDanhMuc, MoTa, DanhMucChaId, Icon, ThuTuHienThi)
VALUES 
(N'Laptop Gaming', N'Laptop cấu hình cao dành cho game thủ', @LaptopId, 'Gamepad2', 1),
(N'Laptop Văn phòng', N'Laptop mỏng nhẹ, pin trâu', @LaptopId, 'Briefcase', 2),
(N'MacBook', N'Các dòng máy tính xách tay của Apple', @LaptopId, 'Laptop', 3);

-- 4. Insert Child Categories (Danh mục cấp 2) cho Linh kiện máy tính
INSERT INTO DanhMuc (TenDanhMuc, MoTa, DanhMucChaId, Icon, ThuTuHienThi)
VALUES 
(N'Vi xử lý (CPU)', N'CPU Intel, AMD', @LinhKienId, 'Cpu', 1),
(N'Card màn hình (VGA)', N'Card đồ họa NVIDIA, AMD', @LinhKienId, 'MonitorPlay', 2),
(N'Bộ nhớ trong (RAM)', N'RAM DDR4, DDR5 cho PC và Laptop', @LinhKienId, 'MemoryStick', 3),
(N'Bo mạch chủ (Mainboard)', N'Mainboard các hãng ASUS, Gigabyte, MSI...', @LinhKienId, 'CircuitBoard', 4),
(N'Ổ cứng (SSD/HDD)', N'Ổ cứng lưu trữ dữ liệu', @LinhKienId, 'HardDrive', 5);

-- 5. Insert Child Categories (Danh mục cấp 2) cho Thiết bị âm thanh
INSERT INTO DanhMuc (TenDanhMuc, MoTa, DanhMucChaId, Icon, ThuTuHienThi)
VALUES 
(N'Tai nghe không dây', N'Tai nghe Bluetooth, True Wireless', @AmThanhId, 'Headphones', 1),
(N'Tai nghe có dây', N'Tai nghe Gaming, In-ear, Over-ear', @AmThanhId, 'Headset', 2),
(N'Loa di động', N'Loa Bluetooth di động', @AmThanhId, 'Speaker', 3);

-- 6. Insert Child Categories (Danh mục cấp 2) cho Phụ kiện
INSERT INTO DanhMuc (TenDanhMuc, MoTa, DanhMucChaId, Icon, ThuTuHienThi)
VALUES 
(N'Chuột & Bàn phím', N'Chuột không dây, bàn phím cơ', @PhuKienId, 'Mouse', 1),
(N'Cáp, Sạc, Pin dự phòng', N'Phụ kiện sạc cáp các loại', @PhuKienId, 'BatteryCharging', 2),
(N'Balo, Túi chống sốc', N'Balo đựng laptop, túi chống sốc', @PhuKienId, 'Briefcase', 3);
