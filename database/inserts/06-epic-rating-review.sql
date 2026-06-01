USE ZenTekExchange;
GO
-- Epic 6: Rating & Review (Khởi tạo dữ liệu đánh giá, phản hồi của người bán)

-- 1. Thêm Đánh giá sản phẩm
INSERT INTO
    DanhGiaSanPham (
        SanPhamId,
        NguoiMuaId,
        DonHangId,
        SoSao,
        NoiDung,
        DuongDanVideo,
        HuuIch,
        NgayTao,
        TraLoiNoiDung,
        TraLoiNgayTao
    )
SELECT (
        SELECT TOP 1 MaSanPham
        FROM SanPham
        WHERE
            LinkSanPham = src.LinkSanPham
    ),
    (
        SELECT TOP 1 MaNguoiDung
        FROM NguoiDung
        WHERE
            TenDangNhap = src.TenDangNhapBuyer
    ),
    (
        SELECT TOP 1 dh.MaDonHang
        FROM DonHang dh
            JOIN NguoiDung n ON dh.NguoiMuaId = n.MaNguoiDung
        WHERE
            n.TenDangNhap = src.TenDangNhapBuyer
            AND dh.TrangThaiDon = N'Đã nhận'
    ),
    src.SoSao,
    src.NoiDung,
    src.DuongDanVideo,
    src.HuuIch,
    GETDATE (),
    src.TraLoiNoiDung,
    GETDATE ()
FROM (
        VALUES (
                'asus-rog-strix-g15', 'buyer01', 5, N'Máy chạy rất mượt, đèn LED đẹp. Shop tư vấn nhiệt tình.', NULL, 15, N'Cảm ơn bạn đã ủng hộ shop nhé!'
            )
    ) AS src (
        LinkSanPham, TenDangNhapBuyer, SoSao, NoiDung, DuongDanVideo, HuuIch, TraLoiNoiDung
    )
WHERE
    NOT EXISTS (
        SELECT 1
        FROM
            DanhGiaSanPham dg
            JOIN NguoiDung n ON dg.NguoiMuaId = n.MaNguoiDung
            JOIN SanPham sp ON dg.SanPhamId = sp.MaSanPham
        WHERE
            n.TenDangNhap = src.TenDangNhapBuyer
            AND sp.LinkSanPham = src.LinkSanPham
    );
GO

-- 2. Thêm Ảnh phản hồi (PhanHoiMedia)
INSERT INTO
    PhanHoiMedia (
        DanhGiaId,
        LoaiPhanHoi,
        LoaiMedia,
        DuongDanMedia
    )
SELECT (
        SELECT TOP 1 dg.MaDanhGia
        FROM
            DanhGiaSanPham dg
            JOIN SanPham sp ON dg.SanPhamId = sp.MaSanPham
            JOIN NguoiDung n ON dg.NguoiMuaId = n.MaNguoiDung
        WHERE
            sp.LinkSanPham = src.LinkSanPham
            AND n.TenDangNhap = src.TenDangNhapBuyer
    ), src.LoaiPhanHoi, src.LoaiMedia, src.DuongDanMedia
FROM (
        VALUES (
                'asus-rog-strix-g15', 'buyer01', 'danh_gia', 'anh', 'review-asus-1.jpg'
            ), (
                'asus-rog-strix-g15', 'buyer01', 'danh_gia', 'anh', 'review-asus-2.jpg'
            )
    ) AS src (
        LinkSanPham, TenDangNhapBuyer, LoaiPhanHoi, LoaiMedia, DuongDanMedia
    )
WHERE
    NOT EXISTS (
        SELECT 1
        FROM PhanHoiMedia pm
        WHERE
            pm.DuongDanMedia = src.DuongDanMedia
    );
GO
