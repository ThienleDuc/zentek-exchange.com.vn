USE ZenTekExchange;
GO

-- 1. Trigger for INSERT actions
CREATE OR ALTER TRIGGER trg_UpdateProductRating_Insert
ON DanhGiaSanPham
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE sp
    SET DiemDanhGia = (
        SELECT CAST(ROUND(AVG(CAST(SoSao AS DECIMAL(3,1))), 1) AS DECIMAL(2,1))
        FROM DanhGiaSanPham dg
        WHERE dg.SanPhamId = sp.MaSanPham
    )
    FROM SanPham sp
    INNER JOIN inserted i ON sp.MaSanPham = i.SanPhamId;
END;
GO

-- 2. Trigger for UPDATE actions
CREATE OR ALTER TRIGGER trg_UpdateProductRating_Update
ON DanhGiaSanPham
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE sp
    SET DiemDanhGia = (
        SELECT CAST(ROUND(AVG(CAST(SoSao AS DECIMAL(3,1))), 1) AS DECIMAL(2,1))
        FROM DanhGiaSanPham dg
        WHERE dg.SanPhamId = sp.MaSanPham
    )
    FROM SanPham sp
    INNER JOIN inserted i ON sp.MaSanPham = i.SanPhamId;
END;
GO

-- 3. Trigger for DELETE actions
CREATE OR ALTER TRIGGER trg_UpdateProductRating_Delete
ON DanhGiaSanPham
AFTER DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE sp
    SET DiemDanhGia = (
        SELECT ISNULL(CAST(ROUND(AVG(CAST(SoSao AS DECIMAL(3,1))), 1) AS DECIMAL(2,1)), 0.0)
        FROM DanhGiaSanPham dg
        WHERE dg.SanPhamId = sp.MaSanPham
    )
    FROM SanPham sp
    INNER JOIN deleted d ON sp.MaSanPham = d.SanPhamId;
END;
GO
