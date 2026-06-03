const { sql, poolPromise } = require('../config/db');
const chatRepository = require('../repositories/chat/chat.repository');
const { getFilenameOnly } = require('../utils/file.utils');

class ChatAdminService {
  async getConversations(adminId, filter = 'all') {
    const pool = await poolPromise;
    const userRole = await chatRepository.getUserRole(adminId);
    const isAdminUser = userRole === 'Admin' || userRole === 'Moderator';
    
    let query = '';
    
    if (isAdminUser) {
      query = `
        SELECT 
          c.MaCuocTroChuyen, 
          c.TenCuocTroChuyen, 
          c.Loai, 
          c.NgayCapNhat,
            (SELECT TOP 1 NoiDung FROM TinNhan t WHERE t.CuocTroChuyenId = c.MaCuocTroChuyen ORDER BY t.NgayGui DESC) AS LastMessage,
            (SELECT TOP 1 NgayGui FROM TinNhan t WHERE t.CuocTroChuyenId = c.MaCuocTroChuyen ORDER BY t.NgayGui DESC) AS LastMessageTime,
            (SELECT COUNT(*) FROM TinNhan t WHERE t.CuocTroChuyenId = c.MaCuocTroChuyen AND t.NguoiGuiId != @adminId AND t.DaDoc = 0 AND t.DaThuHoi = 0) AS UnreadCount,
          (
            SELECT TOP 1 n.HoTen 
            FROM ThanhVienCuocTroChuyen tv 
            JOIN NguoiDung n ON tv.NguoiDungId = n.MaNguoiDung 
            JOIN VaiTro v ON n.VaiTroId = v.MaVaiTro
            WHERE tv.CuocTroChuyenId = c.MaCuocTroChuyen AND v.TenVaiTro = 'Buyer'
          ) AS BuyerName,
          (
            SELECT TOP 1 n.AnhDaiDien 
            FROM ThanhVienCuocTroChuyen tv 
            JOIN NguoiDung n ON tv.NguoiDungId = n.MaNguoiDung 
            JOIN VaiTro v ON n.VaiTroId = v.MaVaiTro
            WHERE tv.CuocTroChuyenId = c.MaCuocTroChuyen AND v.TenVaiTro = 'Buyer'
          ) AS BuyerAvatar,
          (
            SELECT TOP 1 ch.TenCuaHang 
            FROM ThanhVienCuocTroChuyen tv 
            JOIN CuaHang ch ON tv.NguoiDungId = ch.NguoiBanId 
            WHERE tv.CuocTroChuyenId = c.MaCuocTroChuyen
          ) AS ShopName,
          (
            SELECT TOP 1 ch.Logo 
            FROM ThanhVienCuocTroChuyen tv 
            JOIN CuaHang ch ON tv.NguoiDungId = ch.NguoiBanId 
            WHERE tv.CuocTroChuyenId = c.MaCuocTroChuyen
          ) AS ShopLogo
        FROM CuocTroChuyen c
        WHERE 1=1
      `;
      
      if (filter === 'group') {
        query += ` AND c.Loai = 'nhom'`;
      } else if (filter === 'individual') {
        query += ` AND c.Loai = 'ca_nhan' AND NOT EXISTS (
          SELECT 1 FROM ThanhVienCuocTroChuyen tv2 
          JOIN NguoiDung n2 ON tv2.NguoiDungId = n2.MaNguoiDung
          JOIN VaiTro v2 ON n2.VaiTroId = v2.MaVaiTro
          WHERE tv2.CuocTroChuyenId = c.MaCuocTroChuyen AND v2.TenVaiTro = 'Seller'
        )`;
      } else if (filter === 'store') {
        query += ` AND c.Loai = 'ca_nhan' AND EXISTS (
          SELECT 1 FROM ThanhVienCuocTroChuyen tv2 
          JOIN NguoiDung n2 ON tv2.NguoiDungId = n2.MaNguoiDung
          JOIN VaiTro v2 ON n2.VaiTroId = v2.MaVaiTro
          WHERE tv2.CuocTroChuyenId = c.MaCuocTroChuyen AND v2.TenVaiTro = 'Seller'
        )`;
      }
    } else {
      query = `
        SELECT 
          c.MaCuocTroChuyen, 
          c.TenCuocTroChuyen, 
          c.Loai, 
          c.NgayCapNhat,
            (SELECT TOP 1 NoiDung FROM TinNhan t WHERE t.CuocTroChuyenId = c.MaCuocTroChuyen AND t.DaThuHoi = 0 ORDER BY t.NgayGui DESC) AS LastMessage,
            (SELECT TOP 1 NgayGui FROM TinNhan t WHERE t.CuocTroChuyenId = c.MaCuocTroChuyen AND t.DaThuHoi = 0 ORDER BY t.NgayGui DESC) AS LastMessageTime,
            (SELECT COUNT(*) FROM TinNhan t WHERE t.CuocTroChuyenId = c.MaCuocTroChuyen AND t.NguoiGuiId != @adminId AND t.DaDoc = 0 AND t.DaThuHoi = 0) AS UnreadCount,
          (
            SELECT TOP 1 n.HoTen 
            FROM ThanhVienCuocTroChuyen tv 
            JOIN NguoiDung n ON tv.NguoiDungId = n.MaNguoiDung 
            WHERE tv.CuocTroChuyenId = c.MaCuocTroChuyen AND tv.NguoiDungId != @adminId
          ) AS OtherUserName,
          (
            SELECT TOP 1 n.AnhDaiDien 
            FROM ThanhVienCuocTroChuyen tv 
            JOIN NguoiDung n ON tv.NguoiDungId = n.MaNguoiDung 
            WHERE tv.CuocTroChuyenId = c.MaCuocTroChuyen AND tv.NguoiDungId != @adminId
          ) AS OtherUserAvatar,
          (
            SELECT TOP 1 v.TenVaiTro
            FROM ThanhVienCuocTroChuyen tv 
            JOIN NguoiDung n ON tv.NguoiDungId = n.MaNguoiDung 
            JOIN VaiTro v ON n.VaiTroId = v.MaVaiTro
            WHERE tv.CuocTroChuyenId = c.MaCuocTroChuyen AND tv.NguoiDungId != @adminId
          ) AS OtherUserRole,
          (
            SELECT TOP 1 ch.TenCuaHang 
            FROM ThanhVienCuocTroChuyen tv 
            JOIN CuaHang ch ON tv.NguoiDungId = ch.NguoiBanId 
            WHERE tv.CuocTroChuyenId = c.MaCuocTroChuyen AND tv.NguoiDungId != @adminId
          ) AS OtherUserShopName,
          (
            SELECT TOP 1 ch.Logo 
            FROM ThanhVienCuocTroChuyen tv 
            JOIN CuaHang ch ON tv.NguoiDungId = ch.NguoiBanId 
            WHERE tv.CuocTroChuyenId = c.MaCuocTroChuyen AND tv.NguoiDungId != @adminId
          ) AS OtherUserShopLogo
        FROM CuocTroChuyen c
        JOIN ThanhVienCuocTroChuyen my_tv ON c.MaCuocTroChuyen = my_tv.CuocTroChuyenId
        WHERE my_tv.NguoiDungId = @adminId
      `;
      
      if (filter === 'group') {
        query += ` AND c.Loai = 'nhom'`;
      } else if (filter === 'individual') {
        query += ` AND c.Loai = 'ca_nhan' AND EXISTS (
          SELECT 1 FROM ThanhVienCuocTroChuyen tv2 
          JOIN NguoiDung n2 ON tv2.NguoiDungId = n2.MaNguoiDung
          JOIN VaiTro v2 ON n2.VaiTroId = v2.MaVaiTro
          WHERE tv2.CuocTroChuyenId = c.MaCuocTroChuyen AND tv2.NguoiDungId != @adminId AND v2.TenVaiTro = 'Buyer'
        )`;
      } else if (filter === 'store') {
        query += ` AND c.Loai = 'ca_nhan' AND EXISTS (
          SELECT 1 FROM ThanhVienCuocTroChuyen tv2 
          JOIN NguoiDung n2 ON tv2.NguoiDungId = n2.MaNguoiDung
          JOIN VaiTro v2 ON n2.VaiTroId = v2.MaVaiTro
          WHERE tv2.CuocTroChuyenId = c.MaCuocTroChuyen AND tv2.NguoiDungId != @adminId AND v2.TenVaiTro = 'Seller'
        )`;
      }
    }

    if (isAdminUser) {
      query += ` ORDER BY COALESCE((SELECT TOP 1 NgayGui FROM TinNhan t WHERE t.CuocTroChuyenId = c.MaCuocTroChuyen ORDER BY t.NgayGui DESC), c.NgayCapNhat) DESC`;
    } else {
      query += ` ORDER BY COALESCE((SELECT TOP 1 NgayGui FROM TinNhan t WHERE t.CuocTroChuyenId = c.MaCuocTroChuyen AND t.DaThuHoi = 0 ORDER BY t.NgayGui DESC), c.NgayCapNhat) DESC`;
    }

    const request = pool.request();
    request.input('adminId', sql.UniqueIdentifier, adminId);
    const result = await request.query(query);
    
    const conversations = result.recordset.map(row => {
      let name = row.TenCuocTroChuyen;
      let avatar = null;
      let type = row.Loai;
      
      if (row.Loai === 'ca_nhan') {
        if (isAdminUser) {
          if (row.BuyerName && row.ShopName) {
            name = `${row.BuyerName} (${row.ShopName})`;
            avatar = row.ShopLogo || row.BuyerAvatar || null;
            type = 'store';
          } else if (row.ShopName) {
            name = row.ShopName;
            avatar = row.ShopLogo || null;
            type = 'store';
          } else {
            name = row.BuyerName || 'Người dùng';
            avatar = row.BuyerAvatar || null;
            type = 'individual';
          }
        } else {
          if (row.OtherUserRole === 'Seller') {
            name = row.OtherUserShopName || row.OtherUserName || 'Cửa hàng';
            avatar = row.OtherUserShopLogo || row.OtherUserAvatar || null;
            type = 'store';
          } else {
            name = row.OtherUserName || 'Người dùng';
            avatar = row.OtherUserAvatar || null;
            type = 'individual';
          }
        }
      } else if (row.Loai === 'nhom') {
        type = 'group';
      }

      return {
        id: row.MaCuocTroChuyen,
        name: name,
        type: type,
        avatar: avatar,
        lastMessage: row.LastMessage,
        lastMessageTime: row.LastMessageTime || row.NgayCapNhat,
        unreadCount: row.UnreadCount || 0
      };
    });

    return conversations;
  }

  async getMessages(conversationId, adminId) {
    const pool = await poolPromise;
    const userRole = await chatRepository.getUserRole(adminId);
    const isAdminUser = userRole === 'Admin' || userRole === 'Moderator';
    
    if (!isAdminUser) {
      const isMember = await chatRepository.isMember(conversationId, adminId);
      if (!isMember) {
        throw new Error('Bạn không có quyền xem cuộc trò chuyện này');
      }
    }

    const request = pool.request();
    request.input('convId', sql.UniqueIdentifier, conversationId);
    request.input('userId', sql.UniqueIdentifier, adminId);

    // Mark messages in this conversation sent by others as read
    await request.query(`
      UPDATE TinNhan 
      SET DaDoc = 1 
      WHERE CuocTroChuyenId = @convId AND NguoiGuiId != @userId AND DaDoc = 0
    `);

    request.input('isAdminUser', sql.Bit, isAdminUser ? 1 : 0);

    const result = await request.query(`
      SELECT 
        t.MaTinNhan,
        CASE WHEN t.DaThuHoi = 1 AND @isAdminUser = 0 THEN N'Tin nhắn đã được thu hồi' ELSE t.NoiDung END as NoiDung,
        t.NgayGui,
        t.NguoiGuiId,
        t.DaDoc,
        t.DaThuHoi,
        n.HoTen as SenderName,
        n.AnhDaiDien as SenderAvatar,
        v.TenVaiTro as UserRole,
        ch.TenCuaHang as ShopName,
        ch.Logo as ShopLogo,
        tv.VaiTro as SenderRole,
        (
           SELECT LoaiMedia, DuongDanMedia 
           FROM PhanHoiMedia 
           WHERE TinNhanId = t.MaTinNhan AND (t.DaThuHoi = 0 OR @isAdminUser = 1)
           FOR JSON PATH
        ) as MediaFiles
      FROM TinNhan t
      JOIN NguoiDung n ON t.NguoiGuiId = n.MaNguoiDung
      JOIN VaiTro v ON n.VaiTroId = v.MaVaiTro
      LEFT JOIN CuaHang ch ON n.MaNguoiDung = ch.NguoiBanId
      LEFT JOIN ThanhVienCuocTroChuyen tv ON t.NguoiGuiId = tv.NguoiDungId AND t.CuocTroChuyenId = tv.CuocTroChuyenId
      WHERE t.CuocTroChuyenId = @convId
      ORDER BY t.NgayGui ASC
    `);
      
    return result.recordset.map(row => {
      let mediaList = [];
      if (row.MediaFiles) {
        try {
          const parsed = JSON.parse(row.MediaFiles);
          mediaList = parsed.map(m => ({
            type: m.LoaiMedia === 'anh' ? 'image' : 'video',
            url: m.DuongDanMedia
          }));
        } catch (e) {
          console.error('Error parsing MediaFiles:', e);
        }
      }
      
      let name = row.SenderName;
      let avatar = row.SenderAvatar;
      if (row.UserRole === 'Seller') {
        name = row.ShopName || row.SenderName;
        avatar = row.ShopLogo || row.SenderAvatar || null;
      }
      
      return {
        id: row.MaTinNhan,
        content: row.NoiDung,
        timestamp: row.NgayGui,
        senderId: row.NguoiGuiId,
        senderName: name,
        senderAvatar: avatar,
        senderRole: row.SenderRole,
        isMe: row.NguoiGuiId === adminId,
        isRead: row.DaDoc,
        isRecalled: row.DaThuHoi,
        media: mediaList
      };
    });
  }

  async recallMessage(messageId, adminId) {
    const msg = await chatRepository.getMessageById(messageId);
    if (!msg) {
      throw new Error('Tin nhắn không tồn tại');
    }
    if (msg.NguoiGuiId !== adminId) {
      throw new Error('Bạn không có quyền thu hồi tin nhắn của người khác');
    }
    const hoursDiff = (new Date() - new Date(msg.NgayGui)) / (1000 * 60 * 60);
    if (hoursDiff > 24) {
      throw new Error('Chỉ có thể thu hồi tin nhắn trong vòng 24 giờ');
    }

    await chatRepository.markMessageAsRecalled(messageId);

    // Ẩn media
    const { hideFile } = require('../utils/file.utils');
    const mediaList = await chatRepository.getMediaByMessageId(messageId);
    for (const media of mediaList) {
      let currentUrl = media.DuongDanMedia;
      if (!currentUrl.startsWith('/')) currentUrl = '/uploads/media/' + currentUrl;
      const newUrl = hideFile(currentUrl);
      if (newUrl) {
        await chatRepository.updateMediaUrl(media.MaPhanHoi, newUrl);
      }
    }

    return true;
  }

  async deleteMessagePermanently(messageId, adminId) {
    const msg = await chatRepository.getMessageById(messageId);
    if (!msg) {
      throw new Error('Tin nhắn không tồn tại');
    }
    const convId = msg.CuocTroChuyenId;

    const userRole = await chatRepository.getUserRole(adminId);
    const isAdminUser = userRole === 'Admin' || userRole === 'Moderator';
    if (!isAdminUser) {
      throw new Error('Bạn không có quyền xóa tin nhắn này');
    }

    // Xóa file media khỏi disk
    const { deleteFile } = require('../utils/file.utils');
    const mediaList = await chatRepository.getMediaByMessageId(messageId);
    for (const media of mediaList) {
      let currentUrl = media.DuongDanMedia;
      if (!currentUrl.startsWith('/')) currentUrl = '/uploads/media/' + currentUrl;
      deleteFile(currentUrl);
    }

    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    try {
      const txRequest = new sql.Request(transaction);
      txRequest.input('msgId', sql.UniqueIdentifier, messageId);
      txRequest.input('convId', sql.UniqueIdentifier, convId);

      await txRequest.query(`
        UPDATE CuocTroChuyen 
        SET TinNhanCuoiId = NULL 
        WHERE MaCuocTroChuyen = @convId AND TinNhanCuoiId = @msgId
      `);

      await txRequest.query(`DELETE FROM PhanHoiMedia WHERE TinNhanId = @msgId`);
      await txRequest.query(`DELETE FROM TinNhan WHERE MaTinNhan = @msgId`);

      await txRequest.query(`
        UPDATE CuocTroChuyen
        SET TinNhanCuoiId = (
          SELECT TOP 1 MaTinNhan FROM TinNhan 
          WHERE CuocTroChuyenId = @convId 
          ORDER BY NgayGui DESC
        )
        WHERE MaCuocTroChuyen = @convId AND TinNhanCuoiId IS NULL
      `);

      await transaction.commit();
      return true;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  async sendMessage(conversationId, adminId, content, files) {
    const pool = await poolPromise;
    const userRole = await chatRepository.getUserRole(adminId);
    const isAdminUser = userRole === 'Admin' || userRole === 'Moderator';

    if (!isAdminUser) {
      const isMember = await chatRepository.isMember(conversationId, adminId);
      if (!isMember) {
        throw new Error('Bạn không có quyền gửi tin nhắn vào cuộc trò chuyện này');
      }
    }

    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    
    try {
      const request = new sql.Request(transaction);
      const insertResult = await request
        .input('convId', sql.UniqueIdentifier, conversationId)
        .input('senderId', sql.UniqueIdentifier, adminId)
        .input('content', sql.NVarChar, content || '')
        .query(`
          INSERT INTO TinNhan (CuocTroChuyenId, NguoiGuiId, NoiDung)
          OUTPUT INSERTED.MaTinNhan, INSERTED.NgayGui
          VALUES (@convId, @senderId, @content)
        `);
        
      const newMessage = insertResult.recordset[0];
      
      await request
        .input('lastMsgId', sql.UniqueIdentifier, newMessage.MaTinNhan)
        .query(`
          UPDATE CuocTroChuyen 
          SET NgayCapNhat = GETDATE(), TinNhanCuoiId = @lastMsgId
          WHERE MaCuocTroChuyen = @convId
        `);
      
      const mediaList = [];
      if (files && files.length > 0) {
        for (const file of files) {
          const isImage = file.mimetype.startsWith('image/');
          const loaiMedia = isImage ? 'anh' : 'video';
          const duongDanMedia = `/uploads/media/${file.filename}`;
          
          const mediaReq = new sql.Request(transaction);
          await mediaReq
            .input('tinNhanId', sql.UniqueIdentifier, newMessage.MaTinNhan)
            .input('loaiPhanHoi', sql.NVarChar(20), 'tin_nhan')
            .input('loaiMedia', sql.NVarChar(10), loaiMedia)
            .input('duongDanMedia', sql.VarChar(500), getFilenameOnly(duongDanMedia))
            .query(`
              INSERT INTO PhanHoiMedia (TinNhanId, LoaiPhanHoi, LoaiMedia, DuongDanMedia)
              VALUES (@tinNhanId, @loaiPhanHoi, @loaiMedia, @duongDanMedia)
            `);
          
          mediaList.push({
            type: loaiMedia === 'anh' ? 'image' : 'video',
            url: duongDanMedia
          });
        }
      }

      await transaction.commit();
      
      const userInfo = await chatRepository.getUserInfo(adminId);
      let name = userInfo.HoTen;
      let avatar = userInfo.AnhDaiDien;
      if (userInfo.TenVaiTro === 'Seller') {
        name = userInfo.TenCuaHang || userInfo.HoTen;
        avatar = userInfo.Logo || userInfo.AnhDaiDien || null;
      }
        
      return {
        id: newMessage.MaTinNhan,
        content: content || '',
        timestamp: newMessage.NgayGui,
        senderId: adminId,
        senderName: name,
        senderAvatar: avatar,
        isMe: true,
        media: mediaList
      };
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  async createGroup(adminId, name, memberIds) {
    if (!name || name.trim() === '') {
      throw new Error('Tên nhóm không được để trống');
    }
    if (!memberIds) {
      throw new Error('Danh sách thành viên không hợp lệ');
    }

    const uniqueMemberIds = [...new Set(memberIds)].filter(id => id !== adminId);
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      const request = new sql.Request(transaction);
      const insertConvResult = await request
        .input('name', sql.NVarChar(255), name.trim())
        .input('type', sql.VarChar(50), 'nhom')
        .query(`
          INSERT INTO CuocTroChuyen (TenCuocTroChuyen, Loai, NgayTao, NgayCapNhat)
          OUTPUT INSERTED.MaCuocTroChuyen
          VALUES (@name, @type, GETDATE(), GETDATE())
        `);
      
      const convId = insertConvResult.recordset[0].MaCuocTroChuyen;

      // Thêm Admin (chu_nhom)
      await request
        .input('convId', sql.UniqueIdentifier, convId)
        .input('adminId', sql.UniqueIdentifier, adminId)
        .input('roleAdmin', sql.VarChar(50), 'chu_nhom')
        .query(`
          INSERT INTO ThanhVienCuocTroChuyen (CuocTroChuyenId, NguoiDungId, VaiTro)
          VALUES (@convId, @adminId, @roleAdmin)
        `);

      // Thêm thành viên
      for (const memberId of uniqueMemberIds) {
        const memberReq = new sql.Request(transaction);
        await memberReq
          .input('convId', sql.UniqueIdentifier, convId)
          .input('memberId', sql.UniqueIdentifier, memberId)
          .input('roleMember', sql.VarChar(50), 'thanh_vien')
          .query(`
            INSERT INTO ThanhVienCuocTroChuyen (CuocTroChuyenId, NguoiDungId, VaiTro)
            VALUES (@convId, @memberId, @roleMember)
          `);
      }

      // Tin nhắn chào mừng
      const welcomeReq = new sql.Request(transaction);
      await welcomeReq
        .input('convId', sql.UniqueIdentifier, convId)
        .input('adminId', sql.UniqueIdentifier, adminId)
        .input('content', sql.NVarChar(sql.MAX), 'Nhóm đã được tạo. Chào mừng các thành viên!')
        .query(`
          INSERT INTO TinNhan (CuocTroChuyenId, NguoiGuiId, NoiDung, NgayGui, DaDoc)
          VALUES (@convId, @adminId, @content, GETDATE(), 0)
        `);

      await welcomeReq.query(`
        UPDATE CuocTroChuyen
        SET TinNhanCuoiId = (SELECT TOP 1 MaTinNhan FROM TinNhan WHERE CuocTroChuyenId = @convId ORDER BY NgayGui DESC),
            NgayCapNhat = GETDATE()
        WHERE MaCuocTroChuyen = @convId
      `);

      await transaction.commit();

      return {
        id: convId,
        name: name,
        type: 'group',
        avatar: null,
        lastMessage: 'Nhóm vừa được tạo',
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0
      };
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  async deleteGroup(groupId) {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      const request = new sql.Request(transaction);
      request.input('groupId', sql.UniqueIdentifier, groupId);

      await request.query(`UPDATE CuocTroChuyen SET TinNhanCuoiId = NULL WHERE MaCuocTroChuyen = @groupId`);
      await request.query(`DELETE FROM PhanHoiMedia WHERE TinNhanId IN (SELECT MaTinNhan FROM TinNhan WHERE CuocTroChuyenId = @groupId)`);
      await request.query(`DELETE FROM TinNhan WHERE CuocTroChuyenId = @groupId`);
      await request.query(`DELETE FROM ThanhVienCuocTroChuyen WHERE CuocTroChuyenId = @groupId`);
      await request.query(`DELETE FROM CuocTroChuyen WHERE MaCuocTroChuyen = @groupId`);

      await transaction.commit();
      return true;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  async addMembersToGroup(groupId, memberIds) {
    if (!memberIds || memberIds.length === 0) {
      throw new Error('Danh sách thành viên không hợp lệ');
    }

    for (const memberId of memberIds) {
      const isMember = await chatRepository.isMember(groupId, memberId);
      if (!isMember) {
        await chatRepository.addMember(groupId, memberId, 'thanh_vien');
      }
    }
    return true;
  }
}

module.exports = new ChatAdminService();
