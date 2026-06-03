const { sql, poolPromise } = require('../../config/db');
const { getFilenameOnly } = require('../../utils/file.utils');

class ChatRepository {
  // ─── CUỘC TRÒ CHUYỆN ───

  async createConversation(type, name = null) {
    const pool = await poolPromise;
    const request = pool.request();
    request.input('Loai', sql.VarChar(20), type);
    request.input('TenCuocTroChuyen', sql.NVarChar(255), name);
    const result = await request.query(`
      INSERT INTO CuocTroChuyen (TenCuocTroChuyen, Loai, NgayTao, NgayCapNhat)
      OUTPUT INSERTED.MaCuocTroChuyen
      VALUES (@TenCuocTroChuyen, @Loai, GETDATE(), GETDATE())
    `);
    return result.recordset[0].MaCuocTroChuyen;
  }

  async getConversationById(conversationId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('MaCuocTroChuyen', sql.UniqueIdentifier, conversationId)
      .query(`SELECT * FROM CuocTroChuyen WHERE MaCuocTroChuyen = @MaCuocTroChuyen`);
    return result.recordset[0] || null;
  }

  async findGroupByName(groupName) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('TenCuocTroChuyen', sql.NVarChar(255), groupName)
      .query(`SELECT MaCuocTroChuyen FROM CuocTroChuyen WHERE TenCuocTroChuyen = @TenCuocTroChuyen AND Loai = 'nhom'`);
    return result.recordset[0] || null;
  }

  async findGroupById(groupId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('groupId', sql.UniqueIdentifier, groupId)
      .query(`SELECT TenCuocTroChuyen FROM CuocTroChuyen WHERE MaCuocTroChuyen = @groupId AND Loai = 'nhom'`);
    return result.recordset[0] || null;
  }

  async updateConversationTimestamp(conversationId, lastMessageId = null) {
    const pool = await poolPromise;
    const request = pool.request();
    request.input('MaCuocTroChuyen', sql.UniqueIdentifier, conversationId);
    request.input('TinNhanCuoiId', sql.UniqueIdentifier, lastMessageId);

    if (lastMessageId) {
      await request.query(`
        UPDATE CuocTroChuyen 
        SET NgayCapNhat = GETDATE(), TinNhanCuoiId = @TinNhanCuoiId
        WHERE MaCuocTroChuyen = @MaCuocTroChuyen
      `);
    } else {
      await request.query(`
        UPDATE CuocTroChuyen 
        SET NgayCapNhat = GETDATE()
        WHERE MaCuocTroChuyen = @MaCuocTroChuyen
      `);
    }
  }

  async nullifyLastMessageId(conversationId, messageId) {
    const pool = await poolPromise;
    await pool.request()
      .input('MaCuocTroChuyen', sql.UniqueIdentifier, conversationId)
      .input('MaTinNhan', sql.UniqueIdentifier, messageId)
      .query(`
        UPDATE CuocTroChuyen 
        SET TinNhanCuoiId = NULL 
        WHERE MaCuocTroChuyen = @MaCuocTroChuyen AND TinNhanCuoiId = @MaTinNhan
      `);
  }

  async restoreLastMessageId(conversationId) {
    const pool = await poolPromise;
    await pool.request()
      .input('MaCuocTroChuyen', sql.UniqueIdentifier, conversationId)
      .query(`
        UPDATE CuocTroChuyen
        SET TinNhanCuoiId = (
          SELECT TOP 1 MaTinNhan FROM TinNhan 
          WHERE CuocTroChuyenId = @MaCuocTroChuyen 
          ORDER BY NgayGui DESC
        )
        WHERE MaCuocTroChuyen = @MaCuocTroChuyen AND TinNhanCuoiId IS NULL
      `);
  }

  async deleteConversation(conversationId) {
    const pool = await poolPromise;
    const request = pool.request();
    request.input('MaCuocTroChuyen', sql.UniqueIdentifier, conversationId);

    // Nullify FK first
    await request.query(`UPDATE CuocTroChuyen SET TinNhanCuoiId = NULL WHERE MaCuocTroChuyen = @MaCuocTroChuyen`);
    // Delete media
    await request.query(`
      DELETE FROM PhanHoiMedia 
      WHERE TinNhanId IN (SELECT MaTinNhan FROM TinNhan WHERE CuocTroChuyenId = @MaCuocTroChuyen)
    `);
    // Delete messages
    await request.query(`DELETE FROM TinNhan WHERE CuocTroChuyenId = @MaCuocTroChuyen`);
    // Delete members
    await request.query(`DELETE FROM ThanhVienCuocTroChuyen WHERE CuocTroChuyenId = @MaCuocTroChuyen`);
    // Delete conversation
    await request.query(`DELETE FROM CuocTroChuyen WHERE MaCuocTroChuyen = @MaCuocTroChuyen`);
  }

  // ─── THÀNH VIÊN CUỘC TRÒ CHUYỆN ───

  async addMember(conversationId, userId, role = 'thanh_vien') {
    const pool = await poolPromise;
    await pool.request()
      .input('CuocTroChuyenId', sql.UniqueIdentifier, conversationId)
      .input('NguoiDungId', sql.UniqueIdentifier, userId)
      .input('VaiTro', sql.VarChar(20), role)
      .query(`
        INSERT INTO ThanhVienCuocTroChuyen (CuocTroChuyenId, NguoiDungId, VaiTro)
        VALUES (@CuocTroChuyenId, @NguoiDungId, @VaiTro)
      `);
  }

  async isMember(conversationId, userId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('CuocTroChuyenId', sql.UniqueIdentifier, conversationId)
      .input('NguoiDungId', sql.UniqueIdentifier, userId)
      .query(`SELECT 1 FROM ThanhVienCuocTroChuyen WHERE CuocTroChuyenId = @CuocTroChuyenId AND NguoiDungId = @NguoiDungId`);
    return result.recordset.length > 0;
  }

  async getMembers(conversationId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('MaCuocTroChuyen', sql.UniqueIdentifier, conversationId)
      .query(`
        SELECT tv.NguoiDungId AS userId, tv.VaiTro AS role, tv.NgayThamGia AS joinedAt,
               n.HoTen AS fullName, n.AnhDaiDien AS avatar, v.TenVaiTro AS userRole,
               ch.TenCuaHang AS storeName, ch.Logo AS storeLogo
        FROM ThanhVienCuocTroChuyen tv
        JOIN NguoiDung n ON tv.NguoiDungId = n.MaNguoiDung
        JOIN VaiTro v ON n.VaiTroId = v.MaVaiTro
        LEFT JOIN CuaHang ch ON n.MaNguoiDung = ch.NguoiBanId
        WHERE tv.CuocTroChuyenId = @MaCuocTroChuyen
      `);
    return result.recordset;
  }

  async deleteMember(conversationId, userId) {
    const pool = await poolPromise;
    await pool.request()
      .input('CuocTroChuyenId', sql.UniqueIdentifier, conversationId)
      .input('NguoiDungId', sql.UniqueIdentifier, userId)
      .query(`DELETE FROM ThanhVienCuocTroChuyen WHERE CuocTroChuyenId = @CuocTroChuyenId AND NguoiDungId = @NguoiDungId`);
  }

  // ─── TIN NHẮN ───

  async insertMessage(conversationId, senderId, content) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('CuocTroChuyenId', sql.UniqueIdentifier, conversationId)
      .input('NguoiGuiId', sql.UniqueIdentifier, senderId)
      .input('NoiDung', sql.NVarChar(sql.MAX), content || '')
      .query(`
        INSERT INTO TinNhan (CuocTroChuyenId, NguoiGuiId, NoiDung)
        OUTPUT INSERTED.MaTinNhan, INSERTED.NgayGui
        VALUES (@CuocTroChuyenId, @NguoiGuiId, @NoiDung)
      `);
    return result.recordset[0];
  }

  async getMessageById(messageId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('MaTinNhan', sql.UniqueIdentifier, messageId)
      .query(`SELECT * FROM TinNhan WHERE MaTinNhan = @MaTinNhan`);
    return result.recordset[0] || null;
  }

  async markMessageAsRecalled(messageId) {
    const pool = await poolPromise;
    await pool.request()
      .input('MaTinNhan', sql.UniqueIdentifier, messageId)
      .query(`UPDATE TinNhan SET DaThuHoi = 1 WHERE MaTinNhan = @MaTinNhan`);
  }

  async deleteMessagePermanent(messageId) {
    const pool = await poolPromise;
    await pool.request()
      .input('MaTinNhan', sql.UniqueIdentifier, messageId)
      .query(`DELETE FROM TinNhan WHERE MaTinNhan = @MaTinNhan`);
  }

  // ─── MEDIA ───

  async getMediaByMessageId(messageId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('TinNhanId', sql.UniqueIdentifier, messageId)
      .query(`SELECT MaPhanHoi, DuongDanMedia FROM PhanHoiMedia WHERE TinNhanId = @TinNhanId`);
    return result.recordset;
  }

  async insertMedia(messageId, loaiMedia, duongDanMedia, loaiPhanHoi = 'tin_nhan') {
    const pool = await poolPromise;
    await pool.request()
      .input('TinNhanId', sql.UniqueIdentifier, messageId)
      .input('LoaiPhanHoi', sql.NVarChar(20), loaiPhanHoi)
      .input('LoaiMedia', sql.NVarChar(10), loaiMedia)
      .input('DuongDanMedia', sql.VarChar(500), getFilenameOnly(duongDanMedia))
      .query(`
        INSERT INTO PhanHoiMedia (TinNhanId, LoaiPhanHoi, LoaiMedia, DuongDanMedia)
        VALUES (@TinNhanId, @LoaiPhanHoi, @LoaiMedia, @DuongDanMedia)
      `);
  }

  async updateMediaUrl(maPhanHoi, newUrl) {
    const pool = await poolPromise;
    await pool.request()
      .input('MaPhanHoi', sql.UniqueIdentifier, maPhanHoi)
      .input('newUrl', sql.VarChar(500), getFilenameOnly(newUrl))
      .query(`UPDATE PhanHoiMedia SET DuongDanMedia = @newUrl WHERE MaPhanHoi = @MaPhanHoi`);
  }

  async deleteMediaByMessageId(messageId) {
    const pool = await poolPromise;
    await pool.request()
      .input('TinNhanId', sql.UniqueIdentifier, messageId)
      .query(`DELETE FROM PhanHoiMedia WHERE TinNhanId = @TinNhanId`);
  }

  // ─── NGƯỜI DÙNG / VAI TRÒ ───

  async getUserRole(userId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .query(`
        SELECT v.TenVaiTro 
        FROM NguoiDung n
        JOIN VaiTro v ON n.VaiTroId = v.MaVaiTro
        WHERE n.MaNguoiDung = @userId
      `);
    return result.recordset[0]?.TenVaiTro || null;
  }

  async getUserInfo(userId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .query(`
        SELECT n.HoTen, n.AnhDaiDien, v.TenVaiTro, ch.TenCuaHang, ch.Logo
        FROM NguoiDung n
        JOIN VaiTro v ON n.VaiTroId = v.MaVaiTro
        LEFT JOIN CuaHang ch ON n.MaNguoiDung = ch.NguoiBanId
        WHERE n.MaNguoiDung = @userId
      `);
    return result.recordset[0] || null;
  }

  // ─── TRUY VẤN PHỨC TẠP ───

  /**
   * Tìm cuộc trò chuyện cá nhân giữa 2 người dùng
   */
  async findPrivateChat(userId, otherUserId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .input('otherUserId', sql.UniqueIdentifier, otherUserId)
      .query(`
        SELECT tv1.CuocTroChuyenId AS conversationId
        FROM ThanhVienCuocTroChuyen tv1
        JOIN ThanhVienCuocTroChuyen tv2 ON tv1.CuocTroChuyenId = tv2.CuocTroChuyenId
        JOIN CuocTroChuyen c ON tv1.CuocTroChuyenId = c.MaCuocTroChuyen
        WHERE c.Loai = 'ca_nhan'
          AND tv1.NguoiDungId = @userId
          AND tv2.NguoiDungId = @otherUserId
      `);
    return result.recordset[0]?.conversationId || null;
  }
}

module.exports = new ChatRepository();
