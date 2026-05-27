const { sql, poolPromise } = require('../../config/db');

class ShopRepository {
  /**
   * Tạo cửa hàng mới
   * @param {Object} shopData 
   * @returns {Promise<Object>}
   */
  async createShop(shopData) {
    try {
      const pool = await poolPromise;
      const request = pool.request();

      request.input('NguoiBanId', sql.UniqueIdentifier, shopData.sellerId);
      request.input('TenCuaHang', sql.NVarChar(50), shopData.shopName);
      request.input('MoTa', sql.NVarChar(500), shopData.description || null);
      request.input('Logo', sql.VarChar(255), shopData.logo || null);
      request.input('DiaChi', sql.NVarChar(300), shopData.address);
      request.input('PhuongXa', sql.NVarChar(100), shopData.ward);
      request.input('QuanHuyen', sql.NVarChar(100), shopData.district);
      request.input('TinhThanh', sql.NVarChar(100), shopData.province);
      request.input('SoDienThoai', sql.Char(10), shopData.shopPhone);
      request.input('LoaiHinhCuaHang', sql.TinyInt, shopData.shopType || 1);
      request.input('MaSoThue', sql.NVarChar(20), shopData.taxCode || '');
      request.input('PdfGiayPhep', sql.VarChar(255), shopData.licensePdf || null);
      request.input('DaXacThucPhapLy', sql.Bit, 0); // Mặc định chưa xác thực
      request.input('TrangThai', sql.Bit, 1); // Mặc định hoạt động

      const query = `
        INSERT INTO CuaHang (
          NguoiBanId, TenCuaHang, MoTa, Logo, DiaChi, PhuongXa, QuanHuyen,
          TinhThanh, SoDienThoai, LoaiHinhCuaHang, MaSoThue, PdfGiayPhep,
          DaXacThucPhapLy, TrangThai
        )
        OUTPUT inserted.*
        VALUES (
          @NguoiBanId, @TenCuaHang, @MoTa, @Logo, @DiaChi, @PhuongXa, @QuanHuyen,
          @TinhThanh, @SoDienThoai, @LoaiHinhCuaHang, @MaSoThue, @PdfGiayPhep,
          @DaXacThucPhapLy, @TrangThai
        )
      `;

      const result = await request.query(query);
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy cửa hàng theo tên (để check unique)
   */
  async getShopByName(shopName) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('TenCuaHang', sql.NVarChar(50), shopName)
        .query('SELECT * FROM CuaHang WHERE TenCuaHang = @TenCuaHang');
      
      return result.recordset[0] || null;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ShopRepository();
