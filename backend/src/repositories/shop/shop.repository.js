const { sql, poolPromise } = require('../../config/db');
const { getFilenameOnly } = require('../../utils/file.utils');

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
      request.input('Logo', sql.VarChar(255), getFilenameOnly(shopData.logo) || null);
      request.input('DiaChi', sql.NVarChar(300), shopData.address);
      request.input('PhuongXa', sql.NVarChar(100), shopData.ward);
      request.input('QuanHuyen', sql.NVarChar(100), shopData.district);
      request.input('TinhThanh', sql.NVarChar(100), shopData.province);
      request.input('SoDienThoai', sql.Char(10), shopData.shopPhone);
      request.input('LoaiHinhCuaHang', sql.TinyInt, shopData.shopType || 1);
      request.input('MaSoThue', sql.NVarChar(20), shopData.taxCode || '');
      request.input('PdfGiayPhep', sql.VarChar(255), getFilenameOnly(shopData.licensePdf) || null);
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

  /**
   * Lấy cửa hàng theo NguoiBanId (ID người bán)
   */
  async getShopBySellerId(sellerId) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('NguoiBanId', sql.UniqueIdentifier, sellerId)
        .query('SELECT * FROM CuaHang WHERE NguoiBanId = @NguoiBanId');
      return result.recordset[0] || null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cập nhật thông tin cửa hàng và người bán trong 1 Transaction
   */
  async updateShopAndUser(sellerId, userPayload, shopPayload) {
    const pool = await poolPromise;
    
    // Kiểm tra tên cửa hàng đã tồn tại cho cửa hàng khác chưa
    const nameCheck = await pool.request()
      .input('TenCuaHang', sql.NVarChar(50), shopPayload.tenCuaHang)
      .input('NguoiBanId', sql.UniqueIdentifier, sellerId)
      .query('SELECT 1 FROM CuaHang WHERE TenCuaHang = @TenCuaHang AND NguoiBanId != @NguoiBanId');
    if (nameCheck.recordset.length > 0) {
      throw new Error('Tên cửa hàng đã tồn tại trên hệ thống.');
    }

    // Kiểm tra mã số thuế đã tồn tại cho cửa hàng khác chưa
    const taxCheck = await pool.request()
      .input('MaSoThue', sql.NVarChar(20), shopPayload.maSoThue)
      .input('NguoiBanId', sql.UniqueIdentifier, sellerId)
      .query('SELECT 1 FROM CuaHang WHERE MaSoThue = @MaSoThue AND NguoiBanId != @NguoiBanId');
    if (taxCheck.recordset.length > 0) {
      throw new Error('Mã số thuế này đã được đăng ký cho cửa hàng khác.');
    }

    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // 1. Cập nhật thông tin NguoiDung của Seller
      const userReq = new sql.Request(transaction);
      userReq.input('SellerId', sql.UniqueIdentifier, sellerId);
      userReq.input('HoTen', sql.NVarChar(100), userPayload.hoTen);
      userReq.input('Email', sql.VarChar(100), userPayload.email);
      userReq.input('SoDienThoai', sql.Char(10), userPayload.soDienThoai ? userPayload.soDienThoai.trim() : null);
      userReq.input('AnhDaiDien', sql.VarChar(sql.MAX), getFilenameOnly(userPayload.anhDaiDien) || null);

      await userReq.query(`
        UPDATE NguoiDung
        SET HoTen = @HoTen, Email = @Email, SoDienThoai = @SoDienThoai, AnhDaiDien = @AnhDaiDien, NgayCapNhat = GETDATE()
        WHERE MaNguoiDung = @SellerId AND DaXoa = 0
      `);

      // 2. Cập nhật thông tin CuaHang
      const shopReq = new sql.Request(transaction);
      shopReq.input('SellerId', sql.UniqueIdentifier, sellerId);
      shopReq.input('TenCuaHang', sql.NVarChar(50), shopPayload.tenCuaHang);
      shopReq.input('MoTa', sql.NVarChar(500), shopPayload.moTa || null);
      shopReq.input('Logo', sql.VarChar(255), getFilenameOnly(shopPayload.logo) || null);
      shopReq.input('DiaChi', sql.NVarChar(300), shopPayload.diaChi);
      shopReq.input('PhuongXa', sql.NVarChar(100), shopPayload.phuongXa);
      shopReq.input('QuanHuyen', sql.NVarChar(100), shopPayload.quanHuyen);
      shopReq.input('TinhThanh', sql.NVarChar(100), shopPayload.tinhThanh);
      shopReq.input('SoDienThoai', sql.Char(10), shopPayload.soDienThoai ? shopPayload.soDienThoai.trim() : '');
      shopReq.input('LoaiHinhCuaHang', sql.TinyInt, shopPayload.loaiHinhCuaHang || 1);
      shopReq.input('MaSoThue', sql.NVarChar(20), shopPayload.maSoThue);

      await shopReq.query(`
        UPDATE CuaHang
        SET 
          TenCuaHang = @TenCuaHang, 
          MoTa = @MoTa, 
          Logo = @Logo, 
          DiaChi = @DiaChi, 
          PhuongXa = @PhuongXa, 
          QuanHuyen = @QuanHuyen, 
          TinhThanh = @TinhThanh, 
          SoDienThoai = @SoDienThoai, 
          LoaiHinhCuaHang = @LoaiHinhCuaHang, 
          MaSoThue = @MaSoThue,
          DaXacThucPhapLy = 0
        WHERE NguoiBanId = @SellerId
      `);

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}


module.exports = new ShopRepository();
