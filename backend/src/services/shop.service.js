const { sql, poolPromise } = require('../config/db');

class ShopService {
  async getShops({ page = 1, limit = 10, search = '', status = '', approval = '', type = '' }) {
    const pool = await poolPromise;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        ch.*,
        nd.HoTen as TenNguoiBan,
        nd.Email,
        nd.TenDangNhap
      FROM CuaHang ch
      JOIN NguoiDung nd ON ch.NguoiBanId = nd.MaNguoiDung
      WHERE nd.DaXoa = 0
    `;
    
    const request = pool.request();

    if (search) {
      query += ` AND (ch.TenCuaHang LIKE @search OR nd.HoTen LIKE @search OR ch.MaSoThue LIKE @search)`;
      request.input('search', sql.NVarChar, `%${search}%`);
    }

    if (approval) {
      if (approval === 'pending') {
        query += ` AND ch.DaXacThucPhapLy = 0`;
      } else if (approval === 'verified') {
        query += ` AND ch.DaXacThucPhapLy = 1`;
      }
    }

    if (status) {
      if (status === 'active') {
        query += ` AND ch.TrangThai = 1`;
      } else if (status === 'suspended') {
        query += ` AND ch.TrangThai = 0`;
      }
    }

    if (type) {
      query += ` AND ch.LoaiHinhCuaHang = @type`;
      request.input('type', sql.TinyInt, type);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as t`;
    const countResult = await request.query(countQuery);
    const total = countResult.recordset[0].total;

    // Get paginated data
    query += ` ORDER BY ch.NgayTao DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
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

  async getStats() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        COUNT(ch.MaCuaHang) as TotalShops,
        SUM(CASE WHEN ch.DaXacThucPhapLy = 1 AND ch.TrangThai = 1 THEN 1 ELSE 0 END) as ActiveShops,
        SUM(CASE WHEN ch.DaXacThucPhapLy = 0 THEN 1 ELSE 0 END) as PendingShops,
        SUM(CASE WHEN ch.DaXacThucPhapLy = 1 AND ch.TrangThai = 0 THEN 1 ELSE 0 END) as SuspendedShops
      FROM CuaHang ch
      JOIN NguoiDung nd ON ch.NguoiBanId = nd.MaNguoiDung
      WHERE nd.DaXoa = 0
    `);
    
    const last7DaysResult = await pool.request().query(`
      WITH Dates AS (
        SELECT CAST(DATEADD(day, -6, GETDATE()) AS DATE) as Date
        UNION ALL
        SELECT DATEADD(day, 1, Date)
        FROM Dates
        WHERE Date < CAST(GETDATE() AS DATE)
      )
      SELECT 
        FORMAT(d.Date, 'dd/MM') as date,
        SUM(CASE WHEN ch.MaCuaHang IS NOT NULL AND ch.DaXacThucPhapLy = 1 AND ch.TrangThai = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN ch.MaCuaHang IS NOT NULL AND ch.DaXacThucPhapLy = 0 THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN ch.MaCuaHang IS NOT NULL AND ch.DaXacThucPhapLy = 1 AND ch.TrangThai = 0 THEN 1 ELSE 0 END) as suspended
      FROM Dates d
      LEFT JOIN (
          SELECT c.* FROM CuaHang c 
          JOIN NguoiDung n ON c.NguoiBanId = n.MaNguoiDung 
          WHERE n.DaXoa = 0
      ) ch ON CAST(ch.NgayTao AS DATE) = d.Date
      GROUP BY d.Date
      ORDER BY d.Date
    `);
    
    return {
      ...result.recordset[0],
      last7Days: last7DaysResult.recordset
    };
  }

  async createShop(shopData) {
    const pool = await poolPromise;
    const request = pool.request();

    // Check if user already has a shop
    request.input('nguoiBanId', sql.UniqueIdentifier, shopData.NguoiBanId);
    const checkResult = await request.query(`SELECT 1 FROM CuaHang WHERE NguoiBanId = @nguoiBanId`);
    if (checkResult.recordset.length > 0) {
      throw new Error('Người dùng này đã sở hữu một cửa hàng.');
    }

    // Check MST exists
    request.input('maSoThue', sql.NVarChar, shopData.MaSoThue);
    const mstCheck = await request.query(`SELECT 1 FROM CuaHang WHERE MaSoThue = @maSoThue`);
    if (mstCheck.recordset.length > 0) {
      throw new Error('Mã số thuế này đã được đăng ký.');
    }

    request.input('tenCuaHang', sql.NVarChar, shopData.TenCuaHang);
    request.input('moTa', sql.NVarChar, shopData.MoTa || '');
    request.input('diaChi', sql.NVarChar, shopData.DiaChi);
    request.input('phuongXa', sql.NVarChar, shopData.PhuongXa);
    request.input('quanHuyen', sql.NVarChar, shopData.QuanHuyen);
    request.input('tinhThanh', sql.NVarChar, shopData.TinhThanh);
    request.input('soDienThoai', sql.VarChar, shopData.SoDienThoai);
    request.input('loaiHinh', sql.TinyInt, shopData.LoaiHinhCuaHang);
    request.input('pdfGiayPhep', sql.VarChar, shopData.PdfGiayPhep || 'admin-created.pdf');

    const result = await request.query(`
      INSERT INTO CuaHang (
        NguoiBanId, TenCuaHang, MoTa, DiaChi, PhuongXa, QuanHuyen, 
        TinhThanh, SoDienThoai, LoaiHinhCuaHang, MaSoThue, PdfGiayPhep,
        DaXacThucPhapLy, TrangThai
      )
      OUTPUT INSERTED.*
      VALUES (
        @nguoiBanId, @tenCuaHang, @moTa, @diaChi, @phuongXa, @quanHuyen,
        @tinhThanh, @soDienThoai, @loaiHinh, @maSoThue, @pdfGiayPhep,
        1, 1 -- Default approved if created by admin
      )
    `);

    // Update user role to Seller if they are not already
    await request.query(`
      UPDATE NguoiDung 
      SET VaiTroId = (SELECT MaVaiTro FROM VaiTro WHERE TenVaiTro = 'Seller')
      WHERE MaNguoiDung = @nguoiBanId
    `);

    return result.recordset[0];
  }

  async updateShop(id, updateData) {
    const pool = await poolPromise;
    const request = pool.request();
    
    request.input('id', sql.UniqueIdentifier, id);
    request.input('tenCuaHang', sql.NVarChar, updateData.TenCuaHang);
    request.input('moTa', sql.NVarChar, updateData.MoTa || '');
    request.input('diaChi', sql.NVarChar, updateData.DiaChi);
    request.input('soDienThoai', sql.VarChar, updateData.SoDienThoai);
    request.input('loaiHinh', sql.TinyInt, updateData.LoaiHinhCuaHang);

    const result = await request.query(`
      UPDATE CuaHang
      SET 
        TenCuaHang = @tenCuaHang,
        MoTa = @moTa,
        DiaChi = @diaChi,
        SoDienThoai = @soDienThoai,
        LoaiHinhCuaHang = @loaiHinh
      OUTPUT INSERTED.*
      WHERE MaCuaHang = @id
    `);
    
    if (result.recordset.length === 0) {
      throw new Error('Không tìm thấy cửa hàng');
    }
    
    return result.recordset[0];
  }

  async toggleStatus(id) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .query(`
        UPDATE CuaHang 
        SET TrangThai = CASE WHEN TrangThai = 1 THEN 0 ELSE 1 END
        OUTPUT INSERTED.TrangThai
        WHERE MaCuaHang = @id
      `);
      
    if (result.recordset.length === 0) {
      throw new Error('Không tìm thấy cửa hàng');
    }
    return result.recordset[0].TrangThai;
  }

  async approveShop(id, isApproved, reason = '') {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .input('isApproved', sql.Bit, isApproved ? 1 : 0)
      .input('reason', sql.NVarChar, reason)
      .query(`
        UPDATE CuaHang 
        SET 
          DaXacThucPhapLy = @isApproved,
          LyDoTuChoi = @reason
        OUTPUT INSERTED.DaXacThucPhapLy
        WHERE MaCuaHang = @id
      `);
      
    if (result.recordset.length === 0) {
      throw new Error('Không tìm thấy cửa hàng');
    }
    return result.recordset[0].DaXacThucPhapLy;
  }
}

module.exports = new ShopService();
