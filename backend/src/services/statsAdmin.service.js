const { sql, poolPromise } = require('../config/db');

class StatsAdminService {
  async getOverview(start, end) {
    const pool = await poolPromise;
    const request = pool.request();
    request.input('start', sql.VarChar, start);
    request.input('end', sql.VarChar, end);

    const query = `
      DECLARE @NewUsers INT;
      DECLARE @NewStores INT;
      DECLARE @NewProducts INT;
      DECLARE @TotalOrders INT;
      DECLARE @TotalRevenue DECIMAL(18,2);
      DECLARE @AvgRating DECIMAL(3,2);
      DECLARE @CancelRate DECIMAL(5,2);
      DECLARE @PendingProducts INT;

      -- 1. New Users
      SELECT @NewUsers = COUNT(MaNguoiDung) FROM NguoiDung WHERE DaXoa = 0 AND NgayTao >= @start AND NgayTao <= @end;

      -- 2. New Stores
      SELECT @NewStores = COUNT(MaCuaHang) FROM CuaHang WHERE NgayTao >= @start AND NgayTao <= @end;

      -- 3. New Products
      SELECT @NewProducts = COUNT(MaSanPham) FROM SanPham WHERE NgayDang >= @start AND NgayDang <= @end;

      -- 4. Orders & Revenue
      SELECT 
        @TotalOrders = COUNT(DISTINCT dh.MaDonHang),
        @TotalRevenue = ISNULL(SUM(ctdh.SoLuong * ctdh.DonGia), 0)
      FROM ChiTietDonHang ctdh
      INNER JOIN DonHang dh ON ctdh.DonHangId = dh.MaDonHang
      WHERE dh.TrangThaiDon != N'Đã hủy' AND dh.NgayTao >= @start AND dh.NgayTao <= @end;

      -- 5. Avg Rating
      SELECT @AvgRating = ISNULL(AVG(CAST(SoSao AS DECIMAL(3,2))), 5.0)
      FROM DanhGiaSanPham
      WHERE NgayTao >= @start AND NgayTao <= @end;

      -- 6. Cancel Rate
      SELECT 
        @CancelRate = CASE WHEN COUNT(DISTINCT dh.MaDonHang) > 0 
                           THEN (SUM(CASE WHEN dh.TrangThaiDon = N'Đã hủy' THEN 1 ELSE 0 END) * 100.0) / COUNT(DISTINCT dh.MaDonHang)
                           ELSE 0.0 END
      FROM DonHang dh
      WHERE dh.NgayTao >= @start AND dh.NgayTao <= @end;

      -- 7. Pending Products
      SELECT @PendingProducts = COUNT(MaSanPham) FROM SanPham WHERE TrangThaiDuyet = N'Chờ phê duyệt';

      SELECT 
        @NewUsers AS newUsers,
        @NewStores AS newStores,
        @NewProducts AS newProducts,
        @TotalOrders AS totalOrders,
        @TotalRevenue AS totalRevenue,
        CAST(@AvgRating AS DECIMAL(2,1)) AS avgRating,
        CAST(@CancelRate AS DECIMAL(3,1)) AS cancelRate,
        @PendingProducts AS pendingProducts;
    `;

    const result = await request.query(query);
    return result.recordset[0];
  }

  async getRevenueChart(start, end) {
    const pool = await poolPromise;
    const request = pool.request();
    request.input('start', sql.VarChar, start);
    request.input('end', sql.VarChar, end);

    const query = `
      WITH Dates AS (
        SELECT CAST(@start AS DATE) as Date
        UNION ALL
        SELECT DATEADD(day, 1, Date)
        FROM Dates
        WHERE Date < CAST(@end AS DATE)
      )
      SELECT 
        FORMAT(d.Date, 'yyyy-MM-dd') as date,
        ISNULL(SUM(ctdh.SoLuong * ctdh.DonGia), 0) as revenue,
        COUNT(DISTINCT ctdh.DonHangId) as orders
      FROM Dates d
      LEFT JOIN DonHang dh ON CAST(dh.NgayTao AS DATE) = d.Date AND dh.TrangThaiDon != N'Đã hủy'
      LEFT JOIN ChiTietDonHang ctdh ON ctdh.DonHangId = dh.MaDonHang
      GROUP BY d.Date
      ORDER BY d.Date
      OPTION (MAXRECURSION 366);
    `;

    const result = await request.query(query);
    return result.recordset;
  }

  async getGrowth(start, end) {
    const pool = await poolPromise;
    const request = pool.request();
    request.input('start', sql.VarChar, start);
    request.input('end', sql.VarChar, end);

    const query = `
      DECLARE @Days INT = DATEDIFF(day, @start, @end) + 1;
      DECLARE @PrevStart DATETIME = DATEADD(day, -@Days, @start);
      DECLARE @PrevEnd DATETIME = DATEADD(second, -1, @start);

      -- Current stats
      DECLARE @CurRevenue DECIMAL(18,2) = 0;
      DECLARE @CurOrders INT = 0;
      DECLARE @CurUsers INT = 0;
      DECLARE @CurStores INT = 0;

      SELECT @CurRevenue = ISNULL(SUM(ct.SoLuong * ct.DonGia), 0), @CurOrders = COUNT(DISTINCT dh.MaDonHang)
      FROM ChiTietDonHang ct INNER JOIN DonHang dh ON ct.DonHangId = dh.MaDonHang
      WHERE dh.TrangThaiDon != N'Đã hủy' AND dh.NgayTao >= @start AND dh.NgayTao <= @end;

      SELECT @CurUsers = COUNT(*) FROM NguoiDung WHERE DaXoa = 0 AND NgayTao >= @start AND NgayTao <= @end;
      SELECT @CurStores = COUNT(*) FROM CuaHang WHERE NgayTao >= @start AND NgayTao <= @end;

      -- Previous stats
      DECLARE @PrevRevenue DECIMAL(18,2) = 0;
      DECLARE @PrevOrders INT = 0;
      DECLARE @PrevUsers INT = 0;
      DECLARE @PrevStores INT = 0;

      SELECT @PrevRevenue = ISNULL(SUM(ct.SoLuong * ct.DonGia), 0), @PrevOrders = COUNT(DISTINCT dh.MaDonHang)
      FROM ChiTietDonHang ct INNER JOIN DonHang dh ON ct.DonHangId = dh.MaDonHang
      WHERE dh.TrangThaiDon != N'Đã hủy' AND dh.NgayTao >= @PrevStart AND dh.NgayTao <= @PrevEnd;

      SELECT @PrevUsers = COUNT(*) FROM NguoiDung WHERE DaXoa = 0 AND NgayTao >= @PrevStart AND NgayTao <= @PrevEnd;
      SELECT @PrevStores = COUNT(*) FROM CuaHang WHERE NgayTao >= @PrevStart AND NgayTao <= @PrevEnd;

      SELECT
        CAST(CASE WHEN @PrevRevenue > 0 THEN ((@CurRevenue - @PrevRevenue) * 100.0) / @PrevRevenue ELSE 0.0 END AS DECIMAL(5,1)) AS revenue,
        CAST(CASE WHEN @PrevOrders > 0 THEN ((@CurOrders - @PrevOrders) * 100.0) / @PrevOrders ELSE 0.0 END AS DECIMAL(5,1)) AS orders,
        CAST(CASE WHEN @PrevUsers > 0 THEN ((@CurUsers - @PrevUsers) * 100.0) / @PrevUsers ELSE 0.0 END AS DECIMAL(5,1)) AS users,
        CAST(CASE WHEN @PrevStores > 0 THEN ((@CurStores - @PrevStores) * 100.0) / @PrevStores ELSE 0.0 END AS DECIMAL(5,1)) AS stores;
    `;

    const result = await request.query(query);
    return result.recordset[0];
  }

  async getRatingDistribution(start, end) {
    const pool = await poolPromise;
    const request = pool.request();
    request.input('start', sql.VarChar, start);
    request.input('end', sql.VarChar, end);

    const query = `
      SELECT 
        stars.Stars AS stars,
        COUNT(dg.MaDanhGia) AS count
      FROM (
        SELECT 5 AS Stars UNION ALL
        SELECT 4 UNION ALL
        SELECT 3 UNION ALL
        SELECT 2 UNION ALL
        SELECT 1
      ) stars
      LEFT JOIN DanhGiaSanPham dg ON dg.SoSao = stars.Stars AND dg.NgayTao >= @start AND dg.NgayTao <= @end
      GROUP BY stars.Stars
      ORDER BY stars.Stars DESC;
    `;

    const result = await request.query(query);
    return result.recordset;
  }

  async getCategoryRevenue(start, end) {
    const pool = await poolPromise;
    const request = pool.request();
    request.input('start', sql.VarChar, start);
    request.input('end', sql.VarChar, end);

    const query = `
      WITH CategoryRoot AS (
        SELECT MaDanhMuc, MaDanhMuc AS RootId, TenDanhMuc AS RootName
        FROM DanhMuc
        WHERE DanhMucChaId IS NULL
        UNION ALL
        SELECT dm.MaDanhMuc, cr.RootId, cr.RootName
        FROM DanhMuc dm
        INNER JOIN CategoryRoot cr ON dm.DanhMucChaId = cr.MaDanhMuc
      )
      SELECT 
        cr.RootName AS name,
        ISNULL(SUM(ctdh.SoLuong * ctdh.DonGia), 0) AS revenue
      FROM CategoryRoot cr
      INNER JOIN SanPham sp ON sp.DanhMucId = cr.MaDanhMuc
      INNER JOIN ChiTietDonHang ctdh ON ctdh.SanPhamId = sp.MaSanPham
      INNER JOIN DonHang dh ON ctdh.DonHangId = dh.MaDonHang
      WHERE dh.TrangThaiDon != N'Đã hủy'
        AND dh.NgayTao >= @start AND dh.NgayTao <= @end
      GROUP BY cr.RootId, cr.RootName
      ORDER BY revenue DESC;
    `;

    const result = await request.query(query);
    return result.recordset;
  }
}

module.exports = new StatsAdminService();
