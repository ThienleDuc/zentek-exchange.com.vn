const { sql, poolPromise } = require('../../config/db');

class SellerDashboardController {
  /**
   * Helper để lấy MaCuaHang từ NguoiBanId (userId)
   */
  async getStoreId(userId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('NguoiBanId', sql.UniqueIdentifier, userId)
      .query('SELECT MaCuaHang FROM CuaHang WHERE NguoiBanId = @NguoiBanId');
    
    if (result.recordset.length === 0) {
      throw new Error('Tài khoản này chưa đăng ký cửa hàng.');
    }
    return result.recordset[0].MaCuaHang;
  }

  /**
   * GET /api/seller/dashboard/overview
   */
  async getOverview(req, res) {
    try {
      const userId = req.user.userId;
      const storeId = await this.getStoreId(userId);

      const pool = await poolPromise;
      const result = await pool.request()
        .input('storeId', sql.UniqueIdentifier, storeId)
        .query(`
          DECLARE @TotalRevenue DECIMAL(18,2);
          DECLARE @TotalOrders INT;
          DECLARE @TotalSold INT;
          DECLARE @AvgRating DECIMAL(3,2);
          DECLARE @CancelRate DECIMAL(5,2);
          DECLARE @StockItems INT;

          -- 1. Revenue & Products Sold
          SELECT 
            @TotalRevenue = ISNULL(SUM(ctdh.SoLuong * ctdh.DonGia), 0),
            @TotalSold = ISNULL(SUM(ctdh.SoLuong), 0)
          FROM ChiTietDonHang ctdh
          INNER JOIN DonHang dh ON ctdh.DonHangId = dh.MaDonHang
          INNER JOIN SanPham sp ON ctdh.SanPhamId = sp.MaSanPham
          WHERE sp.CuaHangId = @storeId AND dh.TrangThaiDon != N'Đã hủy';

          -- 2. Total Orders & Cancel Rate
          SELECT 
            @TotalOrders = COUNT(DISTINCT dh.MaDonHang),
            @CancelRate = CASE WHEN COUNT(DISTINCT dh.MaDonHang) > 0 
                               THEN (SUM(CASE WHEN dh.TrangThaiDon = N'Đã hủy' THEN 1 ELSE 0 END) * 100.0) / COUNT(DISTINCT dh.MaDonHang)
                               ELSE 0.0 END
          FROM ChiTietDonHang ctdh
          INNER JOIN DonHang dh ON ctdh.DonHangId = dh.MaDonHang
          INNER JOIN SanPham sp ON ctdh.SanPhamId = sp.MaSanPham
          WHERE sp.CuaHangId = @storeId;

          -- 3. Avg Rating
          SELECT @AvgRating = ISNULL(AVG(CAST(dg.SoSao AS DECIMAL(3,2))), 5.0)
          FROM DanhGiaSanPham dg
          INNER JOIN SanPham sp ON dg.SanPhamId = sp.MaSanPham
          WHERE sp.CuaHangId = @storeId;

          -- 4. Stock Items
          SELECT @StockItems = ISNULL(SUM(SoLuong), 0)
          FROM SanPham
          WHERE CuaHangId = @storeId;

          SELECT 
            @TotalRevenue AS totalRevenue,
            @TotalOrders AS totalOrders,
            @TotalSold AS totalProductsSold,
            CAST(@AvgRating AS DECIMAL(2,1)) AS averageRating,
            CAST(@CancelRate AS DECIMAL(3,1)) AS cancelRate,
            @StockItems AS stockItems;
        `);

      return res.status(200).json({
        success: true,
        data: result.recordset[0] || {
          totalRevenue: 0,
          totalOrders: 0,
          totalProductsSold: 0,
          averageRating: 5.0,
          cancelRate: 0.0,
          stockItems: 0
        }
      });
    } catch (error) {
      console.error('Error in SellerDashboardController.getOverview:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /api/seller/dashboard/revenue-chart
   */
  async getRevenueChart(req, res) {
    try {
      const userId = req.user.userId;
      const storeId = await this.getStoreId(userId);
      const periodParam = req.query.period || '30d';
      const days = parseInt(periodParam.replace('d', '')) || 30;

      const pool = await poolPromise;
      const result = await pool.request()
        .input('storeId', sql.UniqueIdentifier, storeId)
        .input('period', sql.Int, days)
        .query(`
          DECLARE @StartDate DATETIME = DATEADD(day, -@period, GETDATE());

          WITH Dates AS (
            SELECT CAST(@StartDate AS DATE) as Date
            UNION ALL
            SELECT DATEADD(day, 1, Date)
            FROM Dates
            WHERE Date < CAST(GETDATE() AS DATE)
          )
          SELECT 
            FORMAT(d.Date, 'yyyy-MM-dd') as date,
            ISNULL(SUM(ctdh.SoLuong * ctdh.DonGia), 0) as revenue,
            COUNT(DISTINCT ctdh.DonHangId) as orders
          FROM Dates d
          LEFT JOIN DonHang dh ON CAST(dh.NgayTao AS DATE) = d.Date AND dh.TrangThaiDon != N'Đã hủy'
          LEFT JOIN ChiTietDonHang ctdh ON ctdh.DonHangId = dh.MaDonHang
          LEFT JOIN SanPham sp ON ctdh.SanPhamId = sp.MaSanPham AND sp.CuaHangId = @storeId
          GROUP BY d.Date
          ORDER BY d.Date
          OPTION (MAXRECURSION 366);
        `);

      return res.status(200).json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      console.error('Error in SellerDashboardController.getRevenueChart:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /api/seller/dashboard/growth
   */
  async getGrowth(req, res) {
    try {
      const userId = req.user.userId;
      const storeId = await this.getStoreId(userId);
      const periodParam = req.query.period || '30d';
      const days = parseInt(periodParam.replace('d', '')) || 30;

      const pool = await poolPromise;
      const result = await pool.request()
        .input('storeId', sql.UniqueIdentifier, storeId)
        .input('period', sql.Int, days)
        .query(`
          DECLARE @PeriodDays INT = @period;
          DECLARE @Now DATETIME = GETDATE();
          DECLARE @CurStart DATETIME = DATEADD(day, -@PeriodDays, @Now);
          DECLARE @PrevStart DATETIME = DATEADD(day, -2 * @PeriodDays, @Now);

          -- Current stats
          DECLARE @CurRevenue DECIMAL(18,2) = 0;
          DECLARE @CurOrders INT = 0;
          DECLARE @CurSold INT = 0;

          SELECT 
            @CurRevenue = ISNULL(SUM(ctdh.SoLuong * ctdh.DonGia), 0),
            @CurSold = ISNULL(SUM(ctdh.SoLuong), 0),
            @CurOrders = COUNT(DISTINCT ctdh.DonHangId)
          FROM ChiTietDonHang ctdh
          INNER JOIN DonHang dh ON ctdh.DonHangId = dh.MaDonHang
          INNER JOIN SanPham sp ON ctdh.SanPhamId = sp.MaSanPham
          WHERE sp.CuaHangId = @storeId 
            AND dh.TrangThaiDon != N'Đã hủy'
            AND dh.NgayTao >= @CurStart;

          -- Previous stats
          DECLARE @PrevRevenue DECIMAL(18,2) = 0;
          DECLARE @PrevOrders INT = 0;
          DECLARE @PrevSold INT = 0;

          SELECT 
            @PrevRevenue = ISNULL(SUM(ctdh.SoLuong * ctdh.DonGia), 0),
            @PrevSold = ISNULL(SUM(ctdh.SoLuong), 0),
            @PrevOrders = COUNT(DISTINCT ctdh.DonHangId)
          FROM ChiTietDonHang ctdh
          INNER JOIN DonHang dh ON ctdh.DonHangId = dh.MaDonHang
          INNER JOIN SanPham sp ON ctdh.SanPhamId = sp.MaSanPham
          WHERE sp.CuaHangId = @storeId 
            AND dh.TrangThaiDon != N'Đã hủy'
            AND dh.NgayTao >= @PrevStart 
            AND dh.NgayTao < @CurStart;

          SELECT
            -- Revenue
            @CurRevenue AS revCurrent,
            @PrevRevenue AS revPrevious,
            CAST(CASE WHEN @PrevRevenue > 0 THEN ((@CurRevenue - @PrevRevenue) * 100.0) / @PrevRevenue ELSE 0.0 END AS DECIMAL(5,1)) AS revPercent,
            -- Orders
            @CurOrders AS ordCurrent,
            @PrevOrders AS ordPrevious,
            CAST(CASE WHEN @PrevOrders > 0 THEN ((@CurOrders - @PrevOrders) * 100.0) / @PrevOrders ELSE 0.0 END AS DECIMAL(5,1)) AS ordPercent,
            -- Sold
            @CurSold AS soldCurrent,
            @PrevSold AS soldPrevious,
            CAST(CASE WHEN @PrevSold > 0 THEN ((@CurSold - @PrevSold) * 100.0) / @PrevSold ELSE 0.0 END AS DECIMAL(5,1)) AS soldPercent;
        `);

      const r = result.recordset[0];
      return res.status(200).json({
        success: true,
        data: {
          revenue: { current: r.revCurrent, previous: r.revPrevious, percent: r.revPercent },
          orders: { current: r.ordCurrent, previous: r.ordPrevious, percent: r.ordPercent },
          productsSold: { current: r.soldCurrent, previous: r.soldPrevious, percent: r.soldPercent },
        }
      });
    } catch (error) {
      console.error('Error in SellerDashboardController.getGrowth:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /api/seller/dashboard/top-products
   */
  async getTopProducts(req, res) {
    try {
      const userId = req.user.userId;
      const storeId = await this.getStoreId(userId);
      const limit = parseInt(req.query.limit) || 10;

      const pool = await poolPromise;
      const result = await pool.request()
        .input('storeId', sql.UniqueIdentifier, storeId)
        .input('limit', sql.Int, limit)
        .query(`
          SELECT TOP (@limit)
            sp.MaSanPham AS id,
            sp.TieuDe AS name,
            (SELECT TOP 1 DuongDanAnh FROM AnhSanPham WHERE SanPhamId = sp.MaSanPham ORDER BY LaAnhChinh DESC, NgayTao ASC) AS image,
            ISNULL(SUM(ctdh.SoLuong), 0) AS sold,
            ISNULL(SUM(ctdh.SoLuong * ctdh.DonGia), 0) AS revenue,
            sp.DiemDanhGia AS rating
          FROM SanPham sp
          LEFT JOIN ChiTietDonHang ctdh ON ctdh.SanPhamId = sp.MaSanPham
          LEFT JOIN DonHang dh ON ctdh.DonHangId = dh.MaDonHang AND dh.TrangThaiDon != N'Đã hủy'
          WHERE sp.CuaHangId = @storeId
          GROUP BY sp.MaSanPham, sp.TieuDe, sp.DiemDanhGia
          ORDER BY sold DESC, revenue DESC;
        `);

      return res.status(200).json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      console.error('Error in SellerDashboardController.getTopProducts:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /api/seller/dashboard/rating-distribution
   */
  async getRatingDistribution(req, res) {
    try {
      const userId = req.user.userId;
      const storeId = await this.getStoreId(userId);

      const pool = await poolPromise;
      const result = await pool.request()
        .input('storeId', sql.UniqueIdentifier, storeId)
        .query(`
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
          LEFT JOIN SanPham sp ON sp.CuaHangId = @storeId
          LEFT JOIN DanhGiaSanPham dg ON dg.SanPhamId = sp.MaSanPham AND dg.SoSao = stars.Stars
          GROUP BY stars.Stars
          ORDER BY stars.Stars DESC;
        `);

      return res.status(200).json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      console.error('Error in SellerDashboardController.getRatingDistribution:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new SellerDashboardController();
