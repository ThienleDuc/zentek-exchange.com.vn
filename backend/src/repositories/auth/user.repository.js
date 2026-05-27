const { sql, poolPromise } = require('../../config/db');

class UserRepository {
  /**
   * Tạo người dùng mới trong cơ sở dữ liệu
   * 
   * @param {Object} userData 
   * @returns {Promise<Object>} Trả về thông tin người dùng được tạo (loại trừ mật khẩu băm)
   */
  async createUser({ username, passwordHash, email, fullName, phone, roleId }) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('TenDangNhap', sql.VarChar(12), username)
        .input('MatKhauHash', sql.VarChar(255), passwordHash)
        .input('Email', sql.VarChar(100), email)
        .input('HoTen', sql.NVarChar(100), fullName)
        .input('SoDienThoai', sql.Char(10), phone ? phone.trim() : null)
        .input('VaiTroId', sql.UniqueIdentifier, roleId)
        .query(`
          INSERT INTO NguoiDung (TenDangNhap, MatKhauHash, Email, HoTen, SoDienThoai, VaiTroId)
          OUTPUT INSERTED.MaNguoiDung, INSERTED.TenDangNhap, INSERTED.Email, INSERTED.HoTen, INSERTED.SoDienThoai, INSERTED.VaiTroId, INSERTED.NgayTao
          VALUES (@TenDangNhap, @MatKhauHash, @Email, @HoTen, @SoDienThoai, @VaiTroId)
        `);
      
      return result.recordset[0];
    } catch (error) {
      console.error('Error in UserRepository.createUser:', error);
      throw error;
    }
  }

  /**
   * Lấy thông tin người dùng theo tên đăng nhập (TenDangNhap) hoặc Email
   * Dùng cho đăng nhập đa năng (Username or Email)
   * 
   * @param {string} identifier Tên đăng nhập hoặc Email
   * @returns {Promise<Object|null>}
   */
  async getUserByIdentifier(identifier) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('Identifier', sql.VarChar(100), identifier)
        .query(`
          SELECT 
            nd.MaNguoiDung, 
            nd.TenDangNhap, 
            nd.MatKhauHash, 
            nd.Email, 
            nd.HoTen, 
            nd.SoDienThoai, 
            nd.AnhDaiDien, 
            nd.NgayTao, 
            nd.NgayCapNhat, 
            vt.TenVaiTro AS roleName
          FROM NguoiDung nd
          INNER JOIN VaiTro vt ON nd.VaiTroId = vt.MaVaiTro
          WHERE nd.TenDangNhap = @Identifier OR nd.Email = @Identifier
        `);
      
      return result.recordset[0] || null;
    } catch (error) {
      console.error('Error in UserRepository.getUserByIdentifier:', error);
      throw error;
    }
  }

  /**
   * Tìm người dùng theo Tên đăng nhập
   * 
   * @param {string} username 
   * @returns {Promise<Object|null>}
   */
  async getUserByUsername(username) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('TenDangNhap', sql.VarChar(12), username)
        .query(`
          SELECT MaNguoiDung, TenDangNhap, Email 
          FROM NguoiDung 
          WHERE TenDangNhap = @TenDangNhap
        `);
      
      return result.recordset[0] || null;
    } catch (error) {
      console.error('Error in UserRepository.getUserByUsername:', error);
      throw error;
    }
  }

  /**
   * Tìm người dùng theo Email
   * 
   * @param {string} email 
   * @returns {Promise<Object|null>}
   */
  async getUserByEmail(email) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('Email', sql.VarChar(100), email)
        .query(`
          SELECT MaNguoiDung, TenDangNhap, Email 
          FROM NguoiDung 
          WHERE Email = @Email
        `);
      
      return result.recordset[0] || null;
    } catch (error) {
      console.error('Error in UserRepository.getUserByEmail:', error);
      throw error;
    }
  }
}

module.exports = new UserRepository();
