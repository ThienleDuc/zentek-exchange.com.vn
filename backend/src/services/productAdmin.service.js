const { sql, poolPromise } = require('../config/db');

class ProductAdminService {
  async getProducts({ page = 1, limit = 10, search = '', trangThai = '', tuNgay = '', denNgay = '', cuaHang = '', danhMuc = '', tinhTrang = '' }) {
    const pool = await poolPromise;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        sp.MaSanPham, sp.TieuDe, sp.Gia, sp.SoLuong, sp.SoLuongDaBan, sp.NgayDang, sp.TrangThaiDuyet, sp.TinhTrang,
        ch.TenCuaHang,
        dm.TenDanhMuc,
        (SELECT TOP 1 DuongDanAnh FROM AnhSanPham WHERE SanPhamId = sp.MaSanPham AND LaAnhChinh = 1) as HinhAnh
      FROM SanPham sp
      JOIN CuaHang ch ON sp.CuaHangId = ch.MaCuaHang
      JOIN DanhMuc dm ON sp.DanhMucId = dm.MaDanhMuc
      WHERE 1=1
    `;
    
    const request = pool.request();

    if (search) {
      query += ` AND sp.TieuDe LIKE @search`;
      request.input('search', sql.NVarChar, `%${search}%`);
    }

    if (trangThai) {
      query += ` AND sp.TrangThaiDuyet = @trangThai`;
      request.input('trangThai', sql.NVarChar, trangThai);
    }

    if (tuNgay) {
      query += ` AND sp.NgayDang >= @tuNgay`;
      request.input('tuNgay', sql.DateTime, tuNgay);
    }

    if (denNgay) {
      query += ` AND sp.NgayDang <= @denNgay`;
      request.input('denNgay', sql.DateTime, denNgay);
    }

    if (cuaHang) {
      query += ` AND ch.TenCuaHang LIKE @cuaHang`;
      request.input('cuaHang', sql.NVarChar, `%${cuaHang}%`);
    }

    if (danhMuc) {
      query += ` AND sp.DanhMucId = @danhMuc`;
      request.input('danhMuc', sql.UniqueIdentifier, danhMuc);
    }

    if (tinhTrang) {
      query += ` AND sp.TinhTrang = @tinhTrang`;
      request.input('tinhTrang', sql.NVarChar, tinhTrang);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as t`;
    const countResult = await request.query(countQuery);
    const total = countResult.recordset[0].total;

    // Get paginated data
    query += ` ORDER BY sp.NgayDang DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
    request.input('offset', sql.Int, offset);
    request.input('limit', sql.Int, parseInt(limit));

    const result = await request.query(query);

    return {
      data: result.recordset,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getStats(tuNgay = '', denNgay = '') {
    const pool = await poolPromise;
    const request = pool.request();
    
    let dateFilter = '';
    if (tuNgay) {
      dateFilter += ` AND NgayDang >= @tuNgay`;
      request.input('tuNgay', sql.DateTime, tuNgay);
    }
    if (denNgay) {
      dateFilter += ` AND NgayDang <= @denNgay`;
      request.input('denNgay', sql.DateTime, denNgay);
    }

    // Thống kê tổng quan và phân bổ trạng thái
    const statsQuery = `
      SELECT 
        COUNT(MaSanPham) as TotalProducts,
        SUM(CASE WHEN TrangThaiDuyet = N'Chờ phê duyệt' THEN 1 ELSE 0 END) as PendingProducts,
        SUM(CASE WHEN TrangThaiDuyet = N'Đã duyệt' THEN 1 ELSE 0 END) as ApprovedProducts,
        SUM(CASE WHEN TrangThaiDuyet = N'Đã từ chối' THEN 1 ELSE 0 END) as RejectedProducts,
        SUM(CASE WHEN TrangThaiDuyet = N'Đã gỡ' THEN 1 ELSE 0 END) as RemovedProducts
      FROM SanPham
      WHERE 1=1 ${dateFilter}
    `;
    const statsResult = await request.query(statsQuery);

    // Thống kê tăng trưởng (7 ngày gần nhất hoặc trong khoảng thời gian lọc)
    let growthQuery = '';
    if (tuNgay && denNgay) {
      growthQuery = `
        SELECT CAST(NgayDang AS DATE) as date, COUNT(*) as count
        FROM SanPham
        WHERE 1=1 ${dateFilter}
        GROUP BY CAST(NgayDang AS DATE)
        ORDER BY date
      `;
    } else {
      growthQuery = `
        WITH Dates AS (
          SELECT CAST(DATEADD(day, -6, GETDATE()) AS DATE) as Date
          UNION ALL
          SELECT DATEADD(day, 1, Date)
          FROM Dates
          WHERE Date < CAST(GETDATE() AS DATE)
        )
        SELECT 
          FORMAT(d.Date, 'dd/MM') as date,
          COUNT(sp.MaSanPham) as count
        FROM Dates d
        LEFT JOIN SanPham sp ON CAST(sp.NgayDang AS DATE) = d.Date
        GROUP BY d.Date
        ORDER BY d.Date
      `;
    }
    const growthResult = await request.query(growthQuery);

    return {
      overview: statsResult.recordset[0],
      growth: growthResult.recordset
    };
  }

  async getProductDetail(id) {
    const pool = await poolPromise;
    
    // Thông tin cơ bản
    const basicInfoResult = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .query(`
        SELECT 
          sp.*,
          ch.TenCuaHang, ch.Logo, ch.DiaChi as CuaHangDiaChi, ch.LoaiHinhCuaHang,
          dm.TenDanhMuc,
          dmCha.TenDanhMuc as TenDanhMucCha,
          (SELECT COUNT(*) FROM ChiTietGioHang ct WHERE ct.SanPhamId = sp.MaSanPham) as SoLuongGioHangThucTe
        FROM SanPham sp
        JOIN CuaHang ch ON sp.CuaHangId = ch.MaCuaHang
        JOIN DanhMuc dm ON sp.DanhMucId = dm.MaDanhMuc
        LEFT JOIN DanhMuc dmCha ON dm.DanhMucChaId = dmCha.MaDanhMuc
        WHERE sp.MaSanPham = @id
      `);
      
    if (basicInfoResult.recordset.length === 0) {
      throw new Error('Không tìm thấy sản phẩm');
    }
    
    const product = basicInfoResult.recordset[0];

    // Lấy danh sách ảnh
    const imagesResult = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .query(`SELECT * FROM AnhSanPham WHERE SanPhamId = @id ORDER BY LaAnhChinh DESC, NgayTao ASC`);
      
    product.images = imagesResult.recordset;

    // Lấy phân loại kèm theo link hình ảnh
    const variationsResult = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .query(`
        SELECT pl.*, a.DuongDanAnh 
        FROM PhanLoai pl
        LEFT JOIN AnhSanPham a ON pl.HinhAnhId = a.MaHinhAnh
        WHERE pl.SanPhamId = @id
      `);
      
    product.variations = variationsResult.recordset;

    // Lấy đánh giá
    const reviewsResult = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .query(`
        SELECT 
          dg.*,
          nd.HoTen as TenNguoiMua, nd.AnhDaiDien
        FROM DanhGiaSanPham dg
        JOIN NguoiDung nd ON dg.NguoiMuaId = nd.MaNguoiDung
        WHERE dg.SanPhamId = @id
        ORDER BY dg.NgayTao DESC
      `);
      
    const reviews = reviewsResult.recordset;
    
    // Lấy media cho từng đánh giá
    for (let review of reviews) {
      const mediaResult = await pool.request()
        .input('reviewId', sql.UniqueIdentifier, review.MaDanhGia)
        .query(`SELECT * FROM PhanHoiMedia WHERE DanhGiaId = @reviewId`);
      review.media = mediaResult.recordset;
    }
    
    product.reviews = reviews;

    return product;
  }

  async updateStatus(id, adminId, status) {
    const pool = await poolPromise;
    
    let trangThaiHienThi = 1;
    if (status === 'Đã từ chối' || status === 'Đã gỡ') {
      trangThaiHienThi = 0;
    }
    
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .input('adminId', sql.UniqueIdentifier, adminId)
      .input('status', sql.NVarChar, status)
      .input('trangThaiHienThi', sql.Bit, trangThaiHienThi)
      .query(`
        UPDATE SanPham 
        SET 
          TrangThaiDuyet = @status,
          TrangThaiHienThi = @trangThaiHienThi,
          NguoiDuyetId = @adminId,
          NgayDuyet = GETDATE()
        OUTPUT INSERTED.*
        WHERE MaSanPham = @id
      `);
      
    if (result.recordset.length === 0) {
      throw new Error('Không tìm thấy sản phẩm');
    }
    return result.recordset[0];
  }
}

module.exports = new ProductAdminService();
