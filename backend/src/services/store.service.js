const { sql, poolPromise } = require('../config/db');

class StoreService {
  async getStores({ search = '', province = '', district = '', ward = '', businessType = '', verified = true, minRating = 0, sort = '', page = 1, limit = 12 }) {
    const pool = await poolPromise;
    const offset = (page - 1) * limit;
    const request = pool.request();

    request.input('offset', sql.Int, offset);
    request.input('limit', sql.Int, parseInt(limit));

    // Base query
    let whereClause = `WHERE ch.TrangThai = 1 AND nd.DaXoa = 0`;

    if (search) {
      whereClause += ` AND (ch.TenCuaHang LIKE @search OR ch.MoTa LIKE @search)`;
      request.input('search', sql.NVarChar, `%${search}%`);
    }

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

    if (businessType) {
      // Map business type string (e.g. 'Cá nhân', 'Hộ kinh doanh', 'Doanh nghiệp nhỏ') to number (1, 2, 3)
      let typeId = null;
      if (businessType === 'Cá nhân') typeId = 1;
      else if (businessType === 'Hộ kinh doanh') typeId = 2;
      else if (businessType === 'Doanh nghiệp nhỏ' || businessType === 'Doanh nghiệp') typeId = 3;

      if (typeId) {
        whereClause += ` AND ch.LoaiHinhCuaHang = @businessType`;
        request.input('businessType', sql.TinyInt, typeId);
      }
    }

    if (verified === true || verified === 'true') {
      whereClause += ` AND ch.DaXacThucPhapLy = 1`;
    }

    // Since rating filter is dynamic, we'll calculate it
    let havingClause = '';
    if (Number(minRating) > 0) {
      havingClause = `HAVING AVG(CAST(dg.SoSao AS FLOAT)) >= @minRating`;
      request.input('minRating', sql.Float, Number(minRating));
    }

    // Dynamic stats and aggregates query
    const baseStatsSubquery = `
      SELECT 
        ch.MaCuaHang, ch.TenCuaHang, ch.Logo, ch.MoTa, ch.TinhThanh, ch.LoaiHinhCuaHang, ch.DaXacThucPhapLy, ch.NgayTao,
        nd.HoTen as NguoiBanHoTen,
        COUNT(DISTINCT sp.MaSanPham) as SoSanPham,
        ISNULL(SUM(sp.SoLuongDaBan), 0) as SoLuongDaBan,
        ISNULL(AVG(CAST(dg.SoSao AS FLOAT)), 0) as DiemDanhGia,
        COUNT(DISTINCT dg.MaDanhGia) as SoLuongDanhGia
      FROM CuaHang ch
      JOIN NguoiDung nd ON ch.NguoiBanId = nd.MaNguoiDung
      LEFT JOIN SanPham sp ON sp.CuaHangId = ch.MaCuaHang AND sp.TrangThaiDuyet = N'Đã duyệt' AND sp.TrangThaiHienThi = 1
      LEFT JOIN DanhGiaSanPham dg ON dg.SanPhamId = sp.MaSanPham
      ${whereClause}
      GROUP BY 
        ch.MaCuaHang, ch.TenCuaHang, ch.Logo, ch.MoTa, ch.TinhThanh, ch.LoaiHinhCuaHang, ch.DaXacThucPhapLy, ch.NgayTao, nd.HoTen
      ${havingClause}
    `;

    // Count total matched stores
    const countQuery = `SELECT COUNT(*) as total FROM (${baseStatsSubquery}) as t`;
    const countResult = await request.query(countQuery);
    const total = countResult.recordset[0].total;

    // Sorting
    let orderBy = 'NgayTao DESC';
    switch (sort) {
      case 'name_asc':
        orderBy = 'TenCuaHang ASC';
        break;
      case 'name_desc':
        orderBy = 'TenCuaHang DESC';
        break;
      case 'newest':
        orderBy = 'NgayTao DESC';
        break;
      case 'top_rated':
        orderBy = 'DiemDanhGia DESC';
        break;
      case 'best_seller':
        orderBy = 'SoLuongDaBan DESC';
        break;
      case 'most_products':
        orderBy = 'SoSanPham DESC';
        break;
      default:
        break;
    }

    const dataQuery = `
      SELECT * FROM (${baseStatsSubquery}) as s
      ORDER BY ${orderBy}
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;
    const dataResult = await request.query(dataQuery);

    // Map business type ID to Name
    const mapType = (id) => {
      if (id === 1) return 'Cá nhân';
      if (id === 2) return 'Hộ kinh doanh';
      if (id === 3) return 'Doanh nghiệp nhỏ';
      return 'Khác';
    };

    const data = dataResult.recordset.map(store => ({
      ...store,
      LoaiHinhTen: mapType(store.LoaiHinhCuaHang),
      LoaiHinh: store.LoaiHinhCuaHang
    }));

    return {
      success: true,
      data,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    };
  }

  async getStoreFilters() {
    const pool = await poolPromise;
    const result = await pool.query(`
      SELECT DISTINCT TinhThanh 
      FROM CuaHang 
      WHERE TrangThai = 1 AND TinhThanh IS NOT NULL AND TinhThanh <> ''
    `);
    return {
      success: true,
      provinces: result.recordset.map(r => r.TinhThanh)
    };
  }
}

module.exports = new StoreService();
