const { poolPromise, sql } = require('../config/db');

class CategoryRepository {
  async getAll() {
    const pool = await poolPromise;
    const result = await pool.request()
      .query(`
        SELECT 
          MaDanhMuc, 
          TenDanhMuc, 
          MoTa, 
          DanhMucChaId, 
          Icon, 
          ThuTuHienThi, 
          NgayTao
        FROM DanhMuc
        ORDER BY ThuTuHienThi ASC, NgayTao DESC
      `);
    return result.recordset;
  }

  async getById(id) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('MaDanhMuc', sql.UniqueIdentifier, id)
      .query(`
        SELECT 
          MaDanhMuc, 
          TenDanhMuc, 
          MoTa, 
          DanhMucChaId, 
          Icon, 
          ThuTuHienThi, 
          NgayTao
        FROM DanhMuc
        WHERE MaDanhMuc = @MaDanhMuc
      `);
    return result.recordset[0];
  }

  async create(categoryData) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('TenDanhMuc', sql.NVarChar(100), categoryData.tenDanhMuc)
      .input('MoTa', sql.NVarChar(sql.MAX), categoryData.moTa || null)
      .input('DanhMucChaId', sql.UniqueIdentifier, categoryData.danhMucChaId || null)
      .input('Icon', sql.VarChar(sql.MAX), categoryData.icon || 'Box')
      .input('ThuTuHienThi', sql.Int, categoryData.thuTuHienThi || 1)
      .query(`
        INSERT INTO DanhMuc (TenDanhMuc, MoTa, DanhMucChaId, Icon, ThuTuHienThi)
        OUTPUT inserted.*
        VALUES (@TenDanhMuc, @MoTa, @DanhMucChaId, @Icon, @ThuTuHienThi)
      `);
    return result.recordset[0];
  }

  async update(id, categoryData) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('MaDanhMuc', sql.UniqueIdentifier, id)
      .input('TenDanhMuc', sql.NVarChar(100), categoryData.tenDanhMuc)
      .input('MoTa', sql.NVarChar(sql.MAX), categoryData.moTa || null)
      .input('DanhMucChaId', sql.UniqueIdentifier, categoryData.danhMucChaId || null)
      .input('Icon', sql.VarChar(sql.MAX), categoryData.icon || 'Box')
      .input('ThuTuHienThi', sql.Int, categoryData.thuTuHienThi || 1)
      .query(`
        UPDATE DanhMuc 
        SET 
          TenDanhMuc = @TenDanhMuc,
          MoTa = @MoTa,
          DanhMucChaId = @DanhMucChaId,
          Icon = @Icon,
          ThuTuHienThi = @ThuTuHienThi
        OUTPUT inserted.*
        WHERE MaDanhMuc = @MaDanhMuc
      `);
    return result.recordset[0];
  }

  async delete(id) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('MaDanhMuc', sql.UniqueIdentifier, id)
      .query(`
        DELETE FROM DanhMuc
        WHERE MaDanhMuc = @MaDanhMuc
      `);
    return result.rowsAffected[0] > 0;
  }
  
  // Hàm phụ trợ để đếm số lượng danh mục con
  async countChildren(id) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('MaDanhMuc', sql.UniqueIdentifier, id)
      .query(`
        SELECT COUNT(*) as Count
        FROM DanhMuc
        WHERE DanhMucChaId = @MaDanhMuc
      `);
    return result.recordset[0].Count;
  }

  // Hàm phụ trợ đếm số sản phẩm tham chiếu tới danh mục
  async countProducts(id) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('MaDanhMuc', sql.UniqueIdentifier, id)
      .query(`
        SELECT COUNT(*) as Count
        FROM SanPham
        WHERE DanhMucId = @MaDanhMuc
      `);
    return result.recordset[0].Count;
  }
}

module.exports = new CategoryRepository();
