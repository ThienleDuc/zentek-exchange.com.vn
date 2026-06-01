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
  /**
   * Lấy danh sách người dùng có phân trang và tìm kiếm
   */
  async getUsersPaging({ limit, offset, search }) {
    try {
      const pool = await poolPromise;
      const request = pool.request();
      let query = `
        SELECT 
          nd.MaNguoiDung, nd.TenDangNhap, nd.MatKhauHash, nd.Email, nd.HoTen, nd.SoDienThoai, 
          nd.VaiTroId, nd.AnhDaiDien, nd.NgayTao, nd.NgayCapNhat, nd.DaXoa, vt.TenVaiTro AS roleName
        FROM NguoiDung nd
        INNER JOIN VaiTro vt ON nd.VaiTroId = vt.MaVaiTro
        WHERE nd.DaXoa = 0 AND vt.TenVaiTro != 'Admin'
      `;
      let countQuery = `
        SELECT COUNT(*) as total 
        FROM NguoiDung nd 
        INNER JOIN VaiTro vt ON nd.VaiTroId = vt.MaVaiTro
        WHERE nd.DaXoa = 0 AND vt.TenVaiTro != 'Admin'
      `;

      if (search) {
        query += ` AND (nd.HoTen LIKE @Search OR nd.Email LIKE @Search OR nd.TenDangNhap LIKE @Search OR nd.SoDienThoai LIKE @Search)`;
        countQuery += ` AND (nd.HoTen LIKE @Search OR nd.Email LIKE @Search OR nd.TenDangNhap LIKE @Search OR nd.SoDienThoai LIKE @Search)`;
        request.input('Search', sql.NVarChar(100), `%${search}%`);
      }

      query += `
        ORDER BY nd.NgayTao DESC
        OFFSET @Offset ROWS
        FETCH NEXT @Limit ROWS ONLY
      `;
      request.input('Offset', sql.Int, offset);
      request.input('Limit', sql.Int, limit);

      const [dataResult, countResult] = await Promise.all([
        request.query(query),
        request.query(countQuery)
      ]);

      return {
        data: dataResult.recordset,
        total: countResult.recordset[0].total
      };
    } catch (error) {
      console.error('Error in UserRepository.getUsersPaging:', error);
      throw error;
    }
  }

  /**
   * Cập nhật thông tin người dùng
   */
  async updateUser(id, { fullName, phone, roleId }) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('Id', sql.UniqueIdentifier, id)
        .input('HoTen', sql.NVarChar(100), fullName)
        .input('SoDienThoai', sql.Char(10), phone ? phone.trim() : null)
        .input('VaiTroId', sql.UniqueIdentifier, roleId)
        .query(`
          UPDATE NguoiDung
          SET HoTen = @HoTen, SoDienThoai = @SoDienThoai, VaiTroId = @VaiTroId, NgayCapNhat = GETDATE()
          WHERE MaNguoiDung = @Id
        `);
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error('Error in UserRepository.updateUser:', error);
      throw error;
    }
  }

  /**
   * Xoá mềm người dùng (và thay đổi trạng thái Cửa hàng liên quan)
   */
  async deleteUser(id) {
    let pool;
    try {
      pool = await poolPromise;
      const transaction = new sql.Transaction(pool);
      await transaction.begin();

      try {
        const request = new sql.Request(transaction);
        request.input('Id', sql.UniqueIdentifier, id);
        
        // 1. Cập nhật trạng thái CuaHang (nếu có) thành ngưng hoạt động (0)
        await request.query(`
          UPDATE CuaHang SET TrangThai = 0 WHERE NguoiBanId = @Id
        `);

        // 2. Xoá mềm NguoiDung (DaXoa = 1)
        const result = await request.query(`
          UPDATE NguoiDung SET DaXoa = 1, NgayCapNhat = GETDATE() WHERE MaNguoiDung = @Id
        `);
        
        await transaction.commit();
        return result.rowsAffected[0] > 0;
      } catch (err) {
        await transaction.rollback();
        throw err;
      }
    } catch (error) {
      console.error('Error in UserRepository.deleteUser:', error);
      throw error;
    }
  }

  /**
   * Cấp lại mật khẩu
   */
  async resetPassword(id, passwordHash) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('Id', sql.UniqueIdentifier, id)
        .input('MatKhauHash', sql.VarChar(255), passwordHash)
        .query(`
          UPDATE NguoiDung
          SET MatKhauHash = @MatKhauHash, NgayCapNhat = GETDATE()
          WHERE MaNguoiDung = @Id
        `);
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error('Error in UserRepository.resetPassword:', error);
      throw error;
    }
  }

  /**
   * Lấy dữ liệu thống kê người dùng (Vai trò & Đăng ký trong 7 ngày)
   */
  async getUserStats() {
    try {
      const pool = await poolPromise;
      // Thống kê vai trò
      const rolesResult = await pool.request().query(`
        SELECT vt.TenVaiTro AS name, COUNT(nd.MaNguoiDung) AS value
        FROM VaiTro vt
        LEFT JOIN NguoiDung nd ON vt.MaVaiTro = nd.VaiTroId AND nd.DaXoa = 0
        WHERE vt.TenVaiTro IN ('Buyer', 'Seller')
        GROUP BY vt.TenVaiTro
      `);

      // Thống kê 7 ngày qua
      const last7DaysResult = await pool.request().query(`
        WITH Last7Days AS (
          SELECT CAST(GETDATE() - 6 AS DATE) AS date
          UNION ALL
          SELECT DATEADD(day, 1, date) FROM Last7Days WHERE date < CAST(GETDATE() AS DATE)
        )
        SELECT 
          FORMAT(d.date, 'dd/MM') AS date,
          COUNT(nd.MaNguoiDung) AS newUsers
        FROM Last7Days d
        LEFT JOIN NguoiDung nd ON CAST(nd.NgayTao AS DATE) = d.date AND nd.DaXoa = 0
        GROUP BY d.date
        ORDER BY d.date ASC
      `);

      return {
        roles: rolesResult.recordset,
        last7Days: last7DaysResult.recordset
      };
    } catch (error) {
      console.error('Error in UserRepository.getUserStats:', error);
      throw error;
    }
  }
}

module.exports = new UserRepository();
