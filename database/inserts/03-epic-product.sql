USE ZenTekExchange;
GO

-- Epic 3: Product Management (Khởi tạo dữ liệu sản phẩm, danh mục tĩnh)

-- 1. Insert Parent Categories (Danh mục cấp 1)
INSERT INTO
    DanhMuc (
        TenDanhMuc,
        MoTa,
        DanhMucChaId,
        Icon,
        ThuTuHienThi
    )
SELECT src.TenDanhMuc, src.MoTa, NULL, src.Icon, src.ThuTuHienThi
FROM (
        VALUES (
                N'Điện thoại & Tablet', N'Các loại điện thoại thông minh, máy tính bảng', 'Smartphone', 1
            ), (
                N'Máy tính xách tay', N'Laptop văn phòng, laptop gaming, macbook', 'Laptop', 2
            ), (
                N'Linh kiện máy tính', N'CPU, RAM, VGA, Mainboard, Ổ cứng', 'Cpu', 3
            ), (
                N'Thiết bị âm thanh', N'Tai nghe, loa bluetooth, thiết bị thu âm', 'Headphones', 4
            ), (
                N'Phụ kiện & Khác', N'Cáp sạc, pin dự phòng, chuột, bàn phím', 'Cable', 5
            )
    ) AS src (
        TenDanhMuc, MoTa, Icon, ThuTuHienThi
    )
WHERE
    NOT EXISTS (
        SELECT 1
        FROM DanhMuc dm
        WHERE
            dm.TenDanhMuc = src.TenDanhMuc
    );
GO

-- 2. Insert Child Categories (Danh mục cấp 2) cho Điện thoại & Tablet
INSERT INTO
    DanhMuc (
        TenDanhMuc,
        MoTa,
        DanhMucChaId,
        Icon,
        ThuTuHienThi
    )
SELECT src.TenDanhMuc, src.MoTa, (
        SELECT MaDanhMuc
        FROM DanhMuc
        WHERE
            TenDanhMuc = N'Điện thoại & Tablet'
            AND DanhMucChaId IS NULL
    ), src.Icon, src.ThuTuHienThi
FROM (
        VALUES (
                N'Điện thoại Apple (iPhone)', N'Các dòng máy Apple iPhone', 'Smartphone', 1
            ), (
                N'Điện thoại Android', N'Samsung, Xiaomi, Oppo, v.v.', 'Smartphone', 2
            ), (
                N'Máy tính bảng (iPad/Tab)', N'iPad, Galaxy Tab, v.v.', 'Tablet', 3
            )
    ) AS src (
        TenDanhMuc, MoTa, Icon, ThuTuHienThi
    )
WHERE
    NOT EXISTS (
        SELECT 1
        FROM DanhMuc dm
        WHERE
            dm.TenDanhMuc = src.TenDanhMuc
    );
GO

-- 3. Insert Child Categories (Danh mục cấp 2) cho Laptop
INSERT INTO
    DanhMuc (
        TenDanhMuc,
        MoTa,
        DanhMucChaId,
        Icon,
        ThuTuHienThi
    )
SELECT src.TenDanhMuc, src.MoTa, (
        SELECT MaDanhMuc
        FROM DanhMuc
        WHERE
            TenDanhMuc = N'Máy tính xách tay'
            AND DanhMucChaId IS NULL
    ), src.Icon, src.ThuTuHienThi
FROM (
        VALUES (
                N'Laptop Gaming', N'Laptop cấu hình cao dành cho game thủ', 'Gamepad2', 1
            ), (
                N'Laptop Văn phòng', N'Laptop mỏng nhẹ, pin trâu', 'Briefcase', 2
            ), (
                N'MacBook', N'Các dòng máy tính xách tay của Apple', 'Laptop', 3
            )
    ) AS src (
        TenDanhMuc, MoTa, Icon, ThuTuHienThi
    )
WHERE
    NOT EXISTS (
        SELECT 1
        FROM DanhMuc dm
        WHERE
            dm.TenDanhMuc = src.TenDanhMuc
    );
GO

-- 4. Insert Child Categories (Danh mục cấp 2) cho Linh kiện máy tính
INSERT INTO
    DanhMuc (
        TenDanhMuc,
        MoTa,
        DanhMucChaId,
        Icon,
        ThuTuHienThi
    )
SELECT src.TenDanhMuc, src.MoTa, (
        SELECT MaDanhMuc
        FROM DanhMuc
        WHERE
            TenDanhMuc = N'Linh kiện máy tính'
            AND DanhMucChaId IS NULL
    ), src.Icon, src.ThuTuHienThi
FROM (
        VALUES (
                N'Vi xử lý (CPU)', N'CPU Intel, AMD', 'Cpu', 1
            ), (
                N'Card màn hình (VGA)', N'Card đồ họa NVIDIA, AMD', 'MonitorPlay', 2
            ), (
                N'Bộ nhớ trong (RAM)', N'RAM DDR4, DDR5 cho PC và Laptop', 'MemoryStick', 3
            ), (
                N'Bo mạch chủ (Mainboard)', N'Mainboard các hãng ASUS, Gigabyte, MSI...', 'CircuitBoard', 4
            ), (
                N'Ổ cứng (SSD/HDD)', N'Ổ cứng lưu trữ dữ liệu', 'HardDrive', 5
            )
    ) AS src (
        TenDanhMuc, MoTa, Icon, ThuTuHienThi
    )
WHERE
    NOT EXISTS (
        SELECT 1
        FROM DanhMuc dm
        WHERE
            dm.TenDanhMuc = src.TenDanhMuc
    );
GO

-- 5. Insert Child Categories (Danh mục cấp 2) cho Thiết bị âm thanh
INSERT INTO
    DanhMuc (
        TenDanhMuc,
        MoTa,
        DanhMucChaId,
        Icon,
        ThuTuHienThi
    )
SELECT src.TenDanhMuc, src.MoTa, (
        SELECT MaDanhMuc
        FROM DanhMuc
        WHERE
            TenDanhMuc = N'Thiết bị âm thanh'
            AND DanhMucChaId IS NULL
    ), src.Icon, src.ThuTuHienThi
FROM (
        VALUES (
                N'Tai nghe không dây', N'Tai nghe Bluetooth, True Wireless', 'Headphones', 1
            ), (
                N'Tai nghe có dây', N'Tai nghe Gaming, In-ear, Over-ear', 'Headset', 2
            ), (
                N'Loa di động', N'Loa Bluetooth di động', 'Speaker', 3
            )
    ) AS src (
        TenDanhMuc, MoTa, Icon, ThuTuHienThi
    )
WHERE
    NOT EXISTS (
        SELECT 1
        FROM DanhMuc dm
        WHERE
            dm.TenDanhMuc = src.TenDanhMuc
    );
GO

-- 6. Insert Child Categories (Danh mục cấp 2) cho Phụ kiện
INSERT INTO
    DanhMuc (
        TenDanhMuc,
        MoTa,
        DanhMucChaId,
        Icon,
        ThuTuHienThi
    )
SELECT src.TenDanhMuc, src.MoTa, (
        SELECT MaDanhMuc
        FROM DanhMuc
        WHERE
            TenDanhMuc = N'Phụ kiện & Khác'
            AND DanhMucChaId IS NULL
    ), src.Icon, src.ThuTuHienThi
FROM (
        VALUES (
                N'Chuột & Bàn phím', N'Chuột không dây, bàn phím cơ', 'Mouse', 1
            ), (
                N'Cáp, Sạc, Pin dự phòng', N'Phụ kiện sạc cáp các loại', 'BatteryCharging', 2
            ), (
                N'Balo, Túi chống sốc', N'Balo đựng laptop, túi chống sốc', 'Briefcase', 3
            )
    ) AS src (
        TenDanhMuc, MoTa, Icon, ThuTuHienThi
    )
WHERE
    NOT EXISTS (
        SELECT 1
        FROM DanhMuc dm
        WHERE
            dm.TenDanhMuc = src.TenDanhMuc
    );
GO

-- 7. Insert SanPham (Sản phẩm mẫu)
INSERT INTO
    SanPham (
        CuaHangId,
        DanhMucId,
        TieuDe,
        FileMoTa,
        Gia,
        TinhTrang,
        SoLuong,
        SoLuongDaBan,
        LuotXem,
        DiemDanhGia,
        LinkSanPham,
        SoLuongGioHang,
        TrangThaiDuyet,
        NguoiDuyetId,
        NgayDuyet,
        TrangThaiHienThi,
        DaHetHang
    )
SELECT (
        SELECT TOP 1 MaCuaHang
        FROM CuaHang
        WHERE
            TenCuaHang = src.TenCuaHang
    ),
    (
        SELECT TOP 1 MaDanhMuc
        FROM DanhMuc
        WHERE
            TenDanhMuc = src.TenDanhMuc
    ),
    src.TieuDe,
    src.FileMoTa,
    src.Gia,
    src.TinhTrang,
    src.SoLuong,
    src.SoLuongDaBan,
    src.LuotXem,
    src.DiemDanhGia,
    src.LinkSanPham,
    src.SoLuongGioHang,
    src.TrangThaiDuyet,
    (
        SELECT TOP 1 MaNguoiDung
        FROM NguoiDung
        WHERE
            TenDangNhap = 'admin'
    ),
    GETDATE (),
    src.TrangThaiHienThi,
    src.DaHetHang
FROM (
        VALUES (
                N'ZenTek Official Store', N'Laptop Gaming', N'Laptop Gaming ASUS ROG Strix G15', 'data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nDPU0NAzNFIwULAwMjE0MTYzt1QwqgQKBQA43gP0CmVuZHN0cmVhbQplbmRvYmoKCjMgMCBvYmoKMTcKZW5kb2JqCgo0IDAgb2JqCjw8L1R5cGUvUGFnZS9NZWRpYUJveFswIDAgNTk1LjI4IDg0MS44OV0vUmVzb3VyY2VzPDwvRm9udDw8L0YxIDEgMCBSPj4+Pi9Db250ZW50cyAyIDAgUi9QYXJlbnQgNSAwIFI+PgplbmRvYmoKCjEgMCBvYmoKPDwvVHlwZS9Gb250L1N1YnR5cGUvVHlwZTEvQmFzZUZvbnQvSGVsdmV0aWNhPj4KZW5kb2JqCgo1IDAgb2JqCjw8L1R5cGUvUGFnZXMvQ291bnQgMS9LaWRzWzQgMCBSXT4+CmVuZG9iagoKNiAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgNSAwIFI+PgplbmRvYmoKCjcgMCBvYmoKPDwvUHJvZHVjZXIoUHlQREYyKS9DcmVhdG9yKFB5UERGMik+PgplbmRvYmoKeHJlZgowIDgKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMjUxIDAwMDAwIG4gCjAwMDAwMDAwMTUgMDAwMDAgbiAKMDAwMDAwMDA4OSAwMDAwMCBuIAowMDAwMDAwMTA5IDAwMDAwIG4gCjAwMDAwMDAzMzkgMDAwMDAgbiAKMDAwMDAwMDM5NiAwMDAwMCBuIAowMDAwMDAwNDQ1IDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSA4L1Jvb3QgNiAwIFIvSW5mbyA3IDAgUj4+CnN0YXJ0eHJlZgo1MDEKJSVFT0YK', 25000000, N'Mới', 50, 10, 1500, 4.8, 'asus-rog-strix-g15', 5, N'Đã duyệt', 1, 0
            ), (
                N'ZenTek Official Store', N'Điện thoại Apple (iPhone)', N'iPhone 15 Pro Max 256GB', 'data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nDPU0NAzNFIwULAwMjE0MTYzt1QwqgQKBQA43gP0CmVuZHN0cmVhbQplbmRvYmoKCjMgMCBvYmoKMTcKZW5kb2JqCgo0IDAgb2JqCjw8L1R5cGUvUGFnZS9NZWRpYUJveFswIDAgNTk1LjI4IDg0MS44OV0vUmVzb3VyY2VzPDwvRm9udDw8L0YxIDEgMCBSPj4+Pi9Db250ZW50cyAyIDAgUi9QYXJlbnQgNSAwIFI+PgplbmRvYmoKCjEgMCBvYmoKPDwvVHlwZS9Gb250L1N1YnR5cGUvVHlwZTEvQmFzZUZvbnQvSGVsdmV0aWNhPj4KZW5kb2JqCgo1IDAgb2JqCjw8L1R5cGUvUGFnZXMvQ291bnQgMS9LaWRzWzQgMCBSXT4+CmVuZG9iagoKNiAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgNSAwIFI+PgplbmRvYmoKCjcgMCBvYmoKPDwvUHJvZHVjZXIoUHlQREYyKS9DcmVhdG9yKFB5UERGMik+PgplbmRvYmoKeHJlZgowIDgKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMjUxIDAwMDAwIG4gCjAwMDAwMDAwMTUgMDAwMDAgbiAKMDAwMDAwMDA4OSAwMDAwMCBuIAowMDAwMDAwMTA5IDAwMDAwIG4gCjAwMDAwMDAzMzkgMDAwMDAgbiAKMDAwMDAwMDM5NiAwMDAwMCBuIAowMDAwMDAwNDQ1IDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSA4L1Jvb3QgNiAwIFIvSW5mbyA3IDAgUj4+CnN0YXJ0eHJlZgo1MDEKJSVFT0YK', 29000000, N'Mới', 30, 25, 3000, 4.9, 'iphone-15-pro-max', 12, N'Đã duyệt', 1, 0
            )
    ) AS src (
        TenCuaHang, TenDanhMuc, TieuDe, FileMoTa, Gia, TinhTrang, SoLuong, SoLuongDaBan, LuotXem, DiemDanhGia, LinkSanPham, SoLuongGioHang, TrangThaiDuyet, TrangThaiHienThi, DaHetHang
    )
WHERE
    NOT EXISTS (
        SELECT 1
        FROM SanPham sp
        WHERE
            sp.LinkSanPham = src.LinkSanPham
    );
GO

-- 8. Insert AnhSanPham (Ảnh sản phẩm mẫu)
INSERT INTO
    AnhSanPham (
        SanPhamId,
        DuongDanAnh,
        LaAnhChinh
    )
SELECT (
        SELECT TOP 1 MaSanPham
        FROM SanPham
        WHERE
            LinkSanPham = src.LinkSanPham
    ), src.DuongDanAnh, src.LaAnhChinh
FROM (
        VALUES (
                'asus-rog-strix-g15', 'asus-rog-1.jpg', 1
            ), (
                'asus-rog-strix-g15', 'asus-rog-2.jpg', 0
            ), (
                'iphone-15-pro-max', 'iphone-15-1.jpg', 1
            ), (
                'iphone-15-pro-max', 'iphone-15-2.jpg', 0
            )
    ) AS src (
        LinkSanPham, DuongDanAnh, LaAnhChinh
    )
WHERE
    NOT EXISTS (
        SELECT 1
        FROM AnhSanPham a
        WHERE
            a.DuongDanAnh = src.DuongDanAnh
    );
GO

-- 9. Insert PhanLoai (Phân loại chi tiết mẫu)
INSERT INTO
    PhanLoai (
        TenPhanLoai,
        SanPhamId,
        HinhAnhId
    )
SELECT src.TenPhanLoai, (
        SELECT TOP 1 MaSanPham
        FROM SanPham
        WHERE
            LinkSanPham = src.LinkSanPham
    ), (
        SELECT TOP 1 MaHinhAnh
        FROM AnhSanPham
        WHERE
            DuongDanAnh = src.DuongDanAnh
    )
FROM (
        VALUES (
                N'Màu Đen - 16GB RAM', 'asus-rog-strix-g15', 'asus-rog-1.jpg'
            ), (
                N'Màu Xám - 32GB RAM', 'asus-rog-strix-g15', 'asus-rog-2.jpg'
            ), (
                N'Màu Titan Tự nhiên - 256GB', 'iphone-15-pro-max', 'iphone-15-1.jpg'
            ), (
                N'Màu Xanh Titan - 512GB', 'iphone-15-pro-max', 'iphone-15-2.jpg'
            )
    ) AS src (
        TenPhanLoai, LinkSanPham, DuongDanAnh
    )
WHERE
    NOT EXISTS (
        SELECT 1
        FROM PhanLoai pl
            JOIN SanPham sp ON pl.SanPhamId = sp.MaSanPham
        WHERE
            sp.LinkSanPham = src.LinkSanPham
            AND pl.TenPhanLoai = src.TenPhanLoai
    );
GO


---------tính toán nhân lên số lượng-------------
USE ZenTekExchange;
GO

-- ============================================================
-- INSERT 50 sản phẩm + ảnh + phân loại (fix lỗi điểm 0-5 và ảnh phân loại duy nhất)
-- ============================================================

-- 1. Tạo bảng số (0..99)
WITH Numbers AS (
    SELECT ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) - 1 AS n
    FROM (VALUES (0),(0),(0),(0),(0),(0),(0),(0),(0),(0)) a(n)
    CROSS JOIN (VALUES (0),(0),(0),(0),(0),(0),(0),(0),(0),(0)) b(n)
),
-- 2. Danh sách mẫu sản phẩm (10 mẫu)
SampleProducts AS (
    SELECT 
        ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS id,
        TenCuaHang,
        TenDanhMuc,
        TieuDeGoc,
        GiaGoc,
        SoLuongGoc,
        LinkGoc
    FROM (VALUES
        (N'ZenTek Official Store', N'Điện thoại Apple (iPhone)', N'iPhone 15 Pro Max', 29900000, 15, 'iphone-15-pro-max'),
        (N'ZenTek Official Store', N'Laptop Gaming', N'ASUS ROG Strix G18', 34900000, 8, 'asus-rog-strix-g18'),
        (N'ZenTek Official Store', N'Card màn hình (VGA)', N'NVIDIA RTX 4070', 14900000, 10, 'rtx-4070'),
        (N'ZenTek Official Store', N'Tai nghe không dây', N'Sony WH-1000XM5', 6990000, 12, 'sony-wh1000xm5'),
        (N'Minh Trí Store', N'Laptop Văn phòng', N'Dell XPS 13', 28900000, 6, 'dell-xps-13'),
        (N'Minh Trí Store', N'Chuột & Bàn phím', N'Logitech MX Master 3S', 1890000, 20, 'logitech-mx-master-3s'),
        (N'Hằng Cosmetics', N'Balo, Túi chống sốc', N'Túi chống sốc 15.6 inch', 450000, 30, 'tui-chong-soc'),
        (N'Vinh Electronics', N'Loa di động', N'JBL Charge 5', 3590000, 18, 'jbl-charge-5'),
        (N'Vinh Electronics', N'Cáp, Sạc, Pin dự phòng', N'Pin sạc dự phòng 20000mAh', 550000, 40, 'powerbank-20000'),
        (N'Phương Phương Books', N'Chuột & Bàn phím', N'Bàn phím cơ Keychron K2', 1990000, 15, 'keychron-k2')
    ) AS t(TenCuaHang, TenDanhMuc, TieuDeGoc, GiaGoc, SoLuongGoc, LinkGoc)
),
-- 3. Nhân mỗi mẫu 5 lần = 50 sản phẩm
ProductsRaw AS (
    SELECT 
        s.TenCuaHang,
        s.TenDanhMuc,
        CONCAT(s.TieuDeGoc, ' (Ver ', n.n + 1, ')') AS TieuDe,
        s.GiaGoc + (n.n * 50000) AS Gia,
        s.SoLuongGoc + (n.n * 2) AS SoLuong,
        CONCAT(s.LinkGoc, '-ver-', n.n + 1) AS LinkSanPham,
        ROW_NUMBER() OVER (ORDER BY s.id, n.n) AS rn
    FROM SampleProducts s
    CROSS JOIN Numbers n
    WHERE n.n BETWEEN 0 AND 4
),
Products AS (
    SELECT * FROM ProductsRaw WHERE rn <= 50
)
-- 4. Insert vào SanPham (điểm đánh giá 0.0 - 5.0)
INSERT INTO SanPham (
    CuaHangId, DanhMucId, TieuDe, FileMoTa, Gia, TinhTrang, SoLuong,
    SoLuongDaBan, LuotXem, DiemDanhGia, LinkSanPham, SoLuongGioHang,
    TrangThaiDuyet, NguoiDuyetId, NgayDuyet, TrangThaiHienThi, DaHetHang
)
SELECT 
    (SELECT TOP 1 MaCuaHang FROM CuaHang WHERE TenCuaHang = p.TenCuaHang AND TrangThai = 1),
    (SELECT TOP 1 MaDanhMuc FROM DanhMuc WHERE TenDanhMuc = p.TenDanhMuc),
    p.TieuDe,
    NULL,
    p.Gia,
    N'Mới',
    p.SoLuong,
    0,
    ABS(CHECKSUM(NEWID())) % 1000,
    CAST(ROUND((ABS(CHECKSUM(NEWID())) % 51) / 10.0, 1) AS DECIMAL(2,1)), -- 0.0 -> 5.0
    p.LinkSanPham,
    0,
    N'Đã duyệt',
    NULL,
    GETDATE(),
    1,
    0
FROM Products p
WHERE NOT EXISTS (SELECT 1 FROM SanPham WHERE LinkSanPham = p.LinkSanPham);

-- ============================================================
-- 5. Insert Ảnh cho mỗi sản phẩm (2-4 ảnh, ảnh chính đầu tiên)
-- ============================================================
WITH SanPhamList AS (
    SELECT MaSanPham, LinkSanPham
    FROM SanPham
    WHERE LinkSanPham LIKE '%-ver-%'
      AND NOT EXISTS (SELECT 1 FROM AnhSanPham WHERE SanPhamId = SanPham.MaSanPham)
),
ImageNumbers AS (
    SELECT n FROM (VALUES (1),(2),(3),(4)) AS t(n)
),
Images AS (
    SELECT 
        sp.MaSanPham,
        sp.LinkSanPham,
        img.n AS ThuTu,
        CASE WHEN img.n = 1 THEN 1 ELSE 0 END AS LaAnhChinh,
        CONCAT('https://picsum.photos/id/', 
               (ABS(CHECKSUM(CAST(sp.LinkSanPham AS NVARCHAR(255))) + img.n) % 1000), 
               '/400/400') AS DuongDanAnh
    FROM SanPhamList sp
    CROSS JOIN ImageNumbers img
    WHERE img.n <= (
        CASE 
            WHEN ABS(CHECKSUM(CAST(sp.LinkSanPham AS NVARCHAR(255)))) % 3 = 0 THEN 2
            WHEN ABS(CHECKSUM(CAST(sp.LinkSanPham AS NVARCHAR(255)))) % 3 = 1 THEN 3
            ELSE 4
        END
    )
)
INSERT INTO AnhSanPham (SanPhamId, DuongDanAnh, LaAnhChinh)
SELECT MaSanPham, DuongDanAnh, LaAnhChinh
FROM Images
WHERE NOT EXISTS (
    SELECT 1 FROM AnhSanPham a 
    WHERE a.SanPhamId = Images.MaSanPham AND a.DuongDanAnh = Images.DuongDanAnh
);

-- ============================================================
-- 6. Insert Phân loại (mỗi phân loại có ảnh riêng, duy nhất trong sản phẩm)
-- ============================================================
WITH SanPhamList AS (
    SELECT MaSanPham, LinkSanPham
    FROM SanPham
    WHERE LinkSanPham LIKE '%-ver-%'
      AND NOT EXISTS (SELECT 1 FROM PhanLoai WHERE SanPhamId = SanPham.MaSanPham)
),
PhanLoaiMau AS (
    SELECT TenPhanLoai FROM (VALUES
        (N'Màu Đen'), (N'Màu Trắng'), (N'Màu Xám'),
        (N'128GB'), (N'256GB'), (N'512GB'),
        (N'8GB RAM'), (N'16GB RAM'), (N'32GB RAM')
    ) AS t(TenPhanLoai)
),
-- Chọn ngẫu nhiên 2 hoặc 3 phân loại cho mỗi sản phẩm, kèm số thứ tự
PhanLoaiChon AS (
    SELECT 
        sp.MaSanPham,
        sp.LinkSanPham,
        pl.TenPhanLoai,
        ROW_NUMBER() OVER (PARTITION BY sp.MaSanPham ORDER BY NEWID()) AS Stt
    FROM SanPhamList sp
    CROSS JOIN PhanLoaiMau pl
),
FilteredPhanLoai AS (
    SELECT 
        MaSanPham,
        TenPhanLoai,
        ROW_NUMBER() OVER (PARTITION BY MaSanPham ORDER BY Stt) AS PhanLoaiStt,
        CASE 
            WHEN ABS(CHECKSUM(CAST(LinkSanPham AS NVARCHAR(255)))) % 2 = 0 THEN 2
            ELSE 3
        END AS SoLuongPhanLoai
    FROM PhanLoaiChon
    WHERE Stt <= (
        CASE 
            WHEN ABS(CHECKSUM(CAST(LinkSanPham AS NVARCHAR(255)))) % 2 = 0 THEN 2
            ELSE 3
        END
    )
),
-- Lấy danh sách ảnh của sản phẩm, xếp hạng ưu tiên (ảnh chính lên đầu)
AnhSanPhamSorted AS (
    SELECT 
        SanPhamId,
        MaHinhAnh,
        ROW_NUMBER() OVER (PARTITION BY SanPhamId ORDER BY LaAnhChinh DESC, NgayTao) AS AnhStt
    FROM AnhSanPham
),
-- Gán ảnh cho mỗi phân loại (dùng modulo để phân phối ảnh khác nhau)
PhanLoaiWithImage AS (
    SELECT 
        f.MaSanPham,
        f.TenPhanLoai,
        (SELECT TOP 1 MaHinhAnh 
         FROM AnhSanPhamSorted a 
         WHERE a.SanPhamId = f.MaSanPham 
           AND a.AnhStt = ((f.PhanLoaiStt - 1) % (SELECT COUNT(*) FROM AnhSanPham WHERE SanPhamId = f.MaSanPham)) + 1
        ) AS HinhAnhId
    FROM FilteredPhanLoai f
)
INSERT INTO PhanLoai (TenPhanLoai, SanPhamId, HinhAnhId)
SELECT TenPhanLoai, MaSanPham, HinhAnhId
FROM PhanLoaiWithImage
WHERE HinhAnhId IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM PhanLoai pl 
      WHERE pl.SanPhamId = PhanLoaiWithImage.MaSanPham 
        AND pl.TenPhanLoai = PhanLoaiWithImage.TenPhanLoai
  );