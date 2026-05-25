const { sql, poolPromise } = require('../../config/db');

class RoleRepository {
  /**
   * Lấy thông tin vai trò (gồm MaVaiTro) dựa trên tên vai trò
   * @param {string} tenVaiTro Tên vai trò (VD: 'Admin', 'Seller', 'Buyer')
   * @returns {Promise<Object|null>} Trả về Object { MaVaiTro, TenVaiTro, MoTa } hoặc null
   */
  async getRoleByName(tenVaiTro) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('TenVaiTro', sql.NVarChar(50), tenVaiTro)
        .query('SELECT MaVaiTro, TenVaiTro, MoTa FROM VaiTro WHERE TenVaiTro = @TenVaiTro');
      
      if (result.recordset.length > 0) {
        return result.recordset[0];
      }
      return null;
    } catch (error) {
      console.error('Error in RoleRepository.getRoleByName:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách tất cả các vai trò
   * @returns {Promise<Array>}
   */
  async getAllRoles() {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .query('SELECT MaVaiTro, TenVaiTro, MoTa FROM VaiTro');
      
      return result.recordset;
    } catch (error) {
      console.error('Error in RoleRepository.getAllRoles:', error);
      throw error;
    }
  }
}

module.exports = new RoleRepository();
