const { sql, poolPromise } = require('../config/db');

class ProductService {
  async getProducts({ sortBy = 'best_seller', offset = 0, limit = 20 }) {
    const pool = await poolPromise;
    const request = pool.request();

    // Query total count first
    const countResult = await pool.request()
      .query(`
        SELECT COUNT(*) as total 
        FROM SanPham sp
        WHERE sp.TrangThaiDuyet = N'Đã duyệt' AND sp.TrangThaiHienThi = 1
      `);
    const total = countResult.recordset[0].total;

    let orderBy = 'sp.SoLuongDaBan DESC, sp.NgayDang DESC';
    if (sortBy === 'newest') {
      orderBy = 'sp.NgayDang DESC';
    }

    const query = `
      SELECT sp.MaSanPham, sp.TieuDe, sp.Gia, sp.SoLuongDaBan, sp.TinhTrang, sp.DaHetHang,
             (SELECT TOP 1 DuongDanAnh FROM AnhSanPham WHERE SanPhamId = sp.MaSanPham AND LaAnhChinh = 1) AS HinhAnh
      FROM SanPham sp
      WHERE sp.TrangThaiDuyet = N'Đã duyệt' AND sp.TrangThaiHienThi = 1
      ORDER BY ${orderBy}
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
    `;

    request.input('offset', sql.Int, offset);
    request.input('limit', sql.Int, limit);

    const result = await request.query(query);
    const data = result.recordset;

    return {
      success: true,
      data,
      hasMore: offset + limit < total,
      total
    };
  }

  async searchProducts({ q = '', category = '', priceMin = '', priceMax = '', rating = 0, condition = '', store = '', province = '', district = '', ward = '', sort = 'relevance', page = 1, limit = 12 }) {
    const pool = await poolPromise;
    const request = pool.request();
    const offset = (page - 1) * limit;

    request.input('offset', sql.Int, offset);
    request.input('limit', sql.Int, parseInt(limit));

    let whereClause = `WHERE sp.TrangThaiDuyet = N'Đã duyệt' AND sp.TrangThaiHienThi = 1`;

    if (province) {
      const normProvince = province.replace(/^Thành phố\s+/i, '').replace(/^Tỉnh\s+/i, '').replace(/^TP\.\s+/i, '').trim();
      whereClause += ` AND (ch.TinhThanh = @province OR REPLACE(REPLACE(REPLACE(ch.TinhThanh, N'Thành phố ', ''), N'Tỉnh ', ''), N'TP. ', '') = @normProvince)`;
      request.input('province', sql.NVarChar, province);
      request.input('normProvince', sql.NVarChar, normProvince);
    }

    if (district) {
      const normDistrict = district.replace(/^Quận\s+/i, '').replace(/^Huyện\s+/i, '').replace(/^Thành phố\s+/i, '').replace(/^Thị xã\s+/i, '').trim();
      whereClause += ` AND (ch.QuanHuyen = @district OR REPLACE(REPLACE(REPLACE(REPLACE(ch.QuanHuyen, N'Quận ', ''), N'Huyện ', ''), N'Thành phố ', ''), N'Thị xã ', '') = @normDistrict)`;
      request.input('district', sql.NVarChar, district);
      request.input('normDistrict', sql.NVarChar, normDistrict);
    }

    if (ward) {
      const normWard = ward.replace(/^Phường\s+/i, '').replace(/^Xã\s+/i, '').replace(/^Thị trấn\s+/i, '').trim();
      whereClause += ` AND (ch.PhuongXa = @ward OR REPLACE(REPLACE(REPLACE(ch.PhuongXa, N'Phường ', ''), N'Xã ', ''), N'Thị trấn ', '') = @normWard)`;
      request.input('ward', sql.NVarChar, ward);
      request.input('normWard', sql.NVarChar, normWard);
    }

    if (q) {
      whereClause += ` AND sp.TieuDe LIKE @q`;
      request.input('q', sql.NVarChar, `%${q}%`);
    }

    if (category) {
      whereClause += ` AND sp.DanhMucId IN (
        WITH CategoryCTE AS (
          SELECT MaDanhMuc FROM DanhMuc 
          WHERE MaDanhMuc = @category OR TenDanhMuc = @category
          UNION ALL
          SELECT dm.MaDanhMuc FROM DanhMuc dm
          INNER JOIN CategoryCTE c ON dm.DanhMucChaId = c.MaDanhMuc
        )
        SELECT MaDanhMuc FROM CategoryCTE
      )`;
      // Check if category is a UUID or string
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category);
      request.input('category', isUuid ? sql.UniqueIdentifier : sql.NVarChar, category);
    }

    if (priceMin !== '' && priceMin != null) {
      whereClause += ` AND sp.Gia >= @priceMin`;
      request.input('priceMin', sql.Decimal, Number(priceMin));
    }

    if (priceMax !== '' && priceMax != null) {
      whereClause += ` AND sp.Gia <= @priceMax`;
      request.input('priceMax', sql.Decimal, Number(priceMax));
    }

    if (rating > 0) {
      whereClause += ` AND sp.DiemDanhGia >= @rating`;
      request.input('rating', sql.Float, Number(rating));
    }

    if (condition) {
      whereClause += ` AND sp.TinhTrang = @condition`;
      request.input('condition', sql.NVarChar, condition);
    }

    if (store) {
      whereClause += ` AND (ch.TenCuaHang = @store OR ch.MaCuaHang = @store)`;
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(store);
      request.input('store', isUuid ? sql.UniqueIdentifier : sql.NVarChar, store);
    }

    let orderBy = 'sp.NgayDang DESC';
    switch (sort) {
      case 'newest':
        orderBy = 'sp.NgayDang DESC';
        break;
      case 'price_asc':
        orderBy = 'sp.Gia ASC';
        break;
      case 'price_desc':
        orderBy = 'sp.Gia DESC';
        break;
      case 'best_seller':
        orderBy = 'sp.SoLuongDaBan DESC';
        break;
      case 'top_rated':
        orderBy = 'sp.DiemDanhGia DESC';
        break;
      default:
        break;
    }

    const countQuery = `
      SELECT COUNT(DISTINCT sp.MaSanPham) as total
      FROM SanPham sp
      JOIN CuaHang ch ON sp.CuaHangId = ch.MaCuaHang
      ${whereClause}
    `;

    const countResult = await request.query(countQuery);
    const total = countResult.recordset[0].total;

    const dataQuery = `
      SELECT 
        sp.MaSanPham, sp.TieuDe, sp.Gia, sp.SoLuongDaBan, sp.DiemDanhGia, sp.TinhTrang, sp.DaHetHang, sp.NgayDang, sp.DanhMucId as MaDanhMuc, sp.CuaHangId as MaCuaHang,
        ch.TenCuaHang,
        dm.TenDanhMuc,
        (SELECT TOP 1 DuongDanAnh FROM AnhSanPham WHERE SanPhamId = sp.MaSanPham AND LaAnhChinh = 1) AS HinhAnh
      FROM SanPham sp
      JOIN CuaHang ch ON sp.CuaHangId = ch.MaCuaHang
      JOIN DanhMuc dm ON sp.DanhMucId = dm.MaDanhMuc
      ${whereClause}
      ORDER BY ${orderBy}
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;
    const dataResult = await request.query(dataQuery);

    return {
      success: true,
      data: dataResult.recordset,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    };
  }

  async getProductDetail(id) {
    const pool = await poolPromise;
    
    // Basic Info for approved & visible product
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
        WHERE sp.MaSanPham = @id AND sp.TrangThaiDuyet = N'Đã duyệt' AND sp.TrangThaiHienThi = 1
      `);
      
    if (basicInfoResult.recordset.length === 0) {
      throw new Error('Không tìm thấy sản phẩm hoặc sản phẩm chưa được duyệt');
    }
    
    const product = basicInfoResult.recordset[0];

    // Get images
    const imagesResult = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .query(`SELECT * FROM AnhSanPham WHERE SanPhamId = @id ORDER BY LaAnhChinh DESC, NgayTao ASC`);
    product.images = imagesResult.recordset;

    // Get variations with image links
    const variationsResult = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .query(`
        SELECT pl.*, a.DuongDanAnh 
        FROM PhanLoai pl
        LEFT JOIN AnhSanPham a ON pl.HinhAnhId = a.MaHinhAnh
        WHERE pl.SanPhamId = @id
      `);
    product.variations = variationsResult.recordset;

    // Get reviews
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
    
    // Get media for each review
    for (let review of reviews) {
      const mediaResult = await pool.request()
        .input('reviewId', sql.UniqueIdentifier, review.MaDanhGia)
        .query(`SELECT * FROM PhanHoiMedia WHERE DanhGiaId = @reviewId`);
      review.media = mediaResult.recordset;
    }
    
    product.reviews = reviews;

    return product;
  }
}

module.exports = new ProductService();
