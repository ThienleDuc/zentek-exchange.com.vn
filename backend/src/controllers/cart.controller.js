const { sql, poolPromise } = require('../config/db');

class CartController {
  // Add item to cart
  async addToCart(req, res) {
    try {
      const NguoiMuaId = req.user.userId;
      const { SanPhamId, PhanLoaiId, SoLuong = 1 } = req.body;

      if (!SanPhamId) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin sản phẩm (SanPhamId).' });
      }

      if (SoLuong < 1) {
        return res.status(400).json({ success: false, message: 'Số lượng thêm phải lớn hơn hoặc bằng 1.' });
      }

      const pool = await poolPromise;

      // 1. Get or Create Cart
      let cartResult = await pool.request()
        .input('NguoiMuaId', sql.UniqueIdentifier, NguoiMuaId)
        .query('SELECT MaGioHang FROM GioHang WHERE NguoiMuaId = @NguoiMuaId');

      let GioHangId;
      if (cartResult.recordset.length === 0) {
        const insertCart = await pool.request()
          .input('NguoiMuaId', sql.UniqueIdentifier, NguoiMuaId)
          .query('INSERT INTO GioHang (NguoiMuaId) OUTPUT INSERTED.MaGioHang VALUES (@NguoiMuaId)');
        GioHangId = insertCart.recordset[0].MaGioHang;
      } else {
        GioHangId = cartResult.recordset[0].MaGioHang;
      }

      // 2. Fetch product info & verify approval and visibility
      const productInfo = await pool.request()
        .input('SanPhamId', sql.UniqueIdentifier, SanPhamId)
        .query(`
          SELECT Gia, SoLuong AS TonKho, TrangThaiDuyet, TrangThaiHienThi, DaHetHang 
          FROM SanPham 
          WHERE MaSanPham = @SanPhamId
        `);

      if (productInfo.recordset.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm.' });
      }

      const product = productInfo.recordset[0];
      if (product.TrangThaiDuyet !== 'Đã duyệt' || !product.TrangThaiHienThi) {
        return res.status(400).json({ success: false, message: 'Sản phẩm chưa được phê duyệt hoặc đang bị ẩn.' });
      }

      if (product.DaHetHang || product.TonKho <= 0) {
        return res.status(400).json({ success: false, message: 'Sản phẩm hiện tại đã hết hàng.' });
      }

      if (product.TonKho < SoLuong) {
        return res.status(400).json({ success: false, message: `Số lượng yêu cầu (${SoLuong}) vượt quá tồn kho (${product.TonKho}).` });
      }

      // 3. Resolve PhanLoaiId
      let resolvedPhanLoaiId = PhanLoaiId;
      if (!resolvedPhanLoaiId) {
        const plResult = await pool.request()
          .input('SanPhamId', sql.UniqueIdentifier, SanPhamId)
          .query('SELECT TOP 1 MaPhanLoai FROM PhanLoai WHERE SanPhamId = @SanPhamId');
        if (plResult.recordset.length > 0) {
          resolvedPhanLoaiId = plResult.recordset[0].MaPhanLoai;
        } else {
          return res.status(400).json({ success: false, message: 'Sản phẩm này yêu cầu phân loại nhưng chưa có phân loại nào được định nghĩa.' });
        }
      } else {
        // Verify classification belongs to product
        const plCheck = await pool.request()
          .input('PhanLoaiId', sql.UniqueIdentifier, resolvedPhanLoaiId)
          .input('SanPhamId', sql.UniqueIdentifier, SanPhamId)
          .query('SELECT MaPhanLoai FROM PhanLoai WHERE MaPhanLoai = @PhanLoaiId AND SanPhamId = @SanPhamId');
        if (plCheck.recordset.length === 0) {
          return res.status(400).json({ success: false, message: 'Phân loại hàng không hợp lệ cho sản phẩm này.' });
        }
      }

      // 4. Add/Update Item in Cart Detail
      const itemCheck = await pool.request()
        .input('GioHangId', sql.UniqueIdentifier, GioHangId)
        .input('SanPhamId', sql.UniqueIdentifier, SanPhamId)
        .input('PhanLoaiId', sql.UniqueIdentifier, resolvedPhanLoaiId)
        .query('SELECT MaChiTietGioHang, SoLuong FROM ChiTietGioHang WHERE GioHangId = @GioHangId AND SanPhamId = @SanPhamId AND PhanLoaiId = @PhanLoaiId');

      if (itemCheck.recordset.length > 0) {
        const existingItem = itemCheck.recordset[0];
        const newQuantity = existingItem.SoLuong + SoLuong;
        if (product.TonKho < newQuantity) {
          return res.status(400).json({ success: false, message: `Tổng số lượng trong giỏ hàng (${newQuantity}) vượt quá tồn kho (${product.TonKho}).` });
        }
        await pool.request()
          .input('ItemId', sql.UniqueIdentifier, existingItem.MaChiTietGioHang)
          .input('NewQuantity', sql.Int, newQuantity)
          .query('UPDATE ChiTietGioHang SET SoLuong = @NewQuantity WHERE MaChiTietGioHang = @ItemId');
      } else {
        await pool.request()
          .input('GioHangId', sql.UniqueIdentifier, GioHangId)
          .input('SanPhamId', sql.UniqueIdentifier, SanPhamId)
          .input('PhanLoaiId', sql.UniqueIdentifier, resolvedPhanLoaiId)
          .input('SoLuong', sql.Int, SoLuong)
          .input('DonGia', sql.Decimal, product.Gia)
          .query('INSERT INTO ChiTietGioHang (GioHangId, SanPhamId, PhanLoaiId, SoLuong, DonGia) VALUES (@GioHangId, @SanPhamId, @PhanLoaiId, @SoLuong, @DonGia)');
      }

      // Update cart update timestamp
      await pool.request()
        .input('GioHangId', sql.UniqueIdentifier, GioHangId)
        .query('UPDATE GioHang SET NgayCapNhat = GETDATE() WHERE MaGioHang = @GioHangId');

      return res.status(200).json({ success: true, message: 'Đã thêm sản phẩm vào giỏ hàng thành công.' });
    } catch (error) {
      console.error('Error in CartController.addToCart:', error);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi thêm sản phẩm vào giỏ hàng.', error: error.message });
    }
  }

  // Get user cart items
  async getCart(req, res) {
    try {
      const NguoiMuaId = req.user.userId;
      const pool = await poolPromise;

      // 1. Get or Create Cart to ensure consistency
      let cartResult = await pool.request()
        .input('NguoiMuaId', sql.UniqueIdentifier, NguoiMuaId)
        .query('SELECT MaGioHang FROM GioHang WHERE NguoiMuaId = @NguoiMuaId');

      let GioHangId;
      if (cartResult.recordset.length === 0) {
        const insertCart = await pool.request()
          .input('NguoiMuaId', sql.UniqueIdentifier, NguoiMuaId)
          .query('INSERT INTO GioHang (NguoiMuaId) OUTPUT INSERTED.MaGioHang VALUES (@NguoiMuaId)');
        GioHangId = insertCart.recordset[0].MaGioHang;
      } else {
        GioHangId = cartResult.recordset[0].MaGioHang;
      }

      // 2. Fetch cart items
      const cartItems = await pool.request()
        .input('GioHangId', sql.UniqueIdentifier, GioHangId)
        .query(`
          SELECT 
            ct.MaChiTietGioHang AS maChiTietGioHang,
            ct.SanPhamId AS sanPhamId,
            sp.TieuDe AS tenSanPham,
            pl.TenPhanLoai AS phanLoai,
            ch.TenCuaHang AS tenCuaHang,
            ct.DonGia AS donGia,
            ct.SoLuong AS soLuong,
            sp.SoLuong AS tonKho,
            CASE WHEN (sp.DaHetHang = 1 OR sp.SoLuong <= 0) THEN 1 ELSE 0 END AS daHetHang,
            (SELECT TOP 1 DuongDanAnh FROM AnhSanPham WHERE SanPhamId = sp.MaSanPham AND LaAnhChinh = 1) AS anh
          FROM ChiTietGioHang ct
          JOIN SanPham sp ON ct.SanPhamId = sp.MaSanPham
          LEFT JOIN PhanLoai pl ON ct.PhanLoaiId = pl.MaPhanLoai
          JOIN CuaHang ch ON sp.CuaHangId = ch.MaCuaHang
          WHERE ct.GioHangId = @GioHangId
        `);

      // Convert daHetHang to boolean format
      const formattedItems = cartItems.recordset.map(item => ({
        ...item,
        daHetHang: !!item.daHetHang
      }));

      return res.status(200).json({ success: true, data: formattedItems });
    } catch (error) {
      console.error('Error in CartController.getCart:', error);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy giỏ hàng.', error: error.message });
    }
  }

  // Update item quantity
  async updateQuantity(req, res) {
    try {
      const NguoiMuaId = req.user.userId;
      const { itemId, newQuantity } = req.body;

      if (!itemId || newQuantity === undefined) {
        return res.status(400).json({ success: false, message: 'Thiếu itemId hoặc newQuantity.' });
      }

      if (newQuantity < 1) {
        return res.status(400).json({ success: false, message: 'Số lượng phải lớn hơn hoặc bằng 1.' });
      }

      const pool = await poolPromise;

      // Check item ownership and inventory
      const checkResult = await pool.request()
        .input('ItemId', sql.UniqueIdentifier, itemId)
        .input('NguoiMuaId', sql.UniqueIdentifier, NguoiMuaId)
        .query(`
          SELECT ct.MaChiTietGioHang, sp.SoLuong AS TonKho, sp.TieuDe, ct.GioHangId
          FROM ChiTietGioHang ct
          JOIN GioHang g ON ct.GioHangId = g.MaGioHang
          JOIN SanPham sp ON ct.SanPhamId = sp.MaSanPham
          WHERE ct.MaChiTietGioHang = @ItemId AND g.NguoiMuaId = @NguoiMuaId
        `);

      if (checkResult.recordset.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm này trong giỏ hàng của bạn.' });
      }

      const { TonKho, GioHangId } = checkResult.recordset[0];
      if (TonKho < newQuantity) {
        return res.status(400).json({ success: false, message: `Số lượng yêu cầu (${newQuantity}) vượt quá số lượng tồn kho (${TonKho}).` });
      }

      // Update quantity
      await pool.request()
        .input('ItemId', sql.UniqueIdentifier, itemId)
        .input('NewQuantity', sql.Int, newQuantity)
        .query('UPDATE ChiTietGioHang SET SoLuong = @NewQuantity WHERE MaChiTietGioHang = @ItemId');

      // Update cart update timestamp
      await pool.request()
        .input('GioHangId', sql.UniqueIdentifier, GioHangId)
        .query('UPDATE GioHang SET NgayCapNhat = GETDATE() WHERE MaGioHang = @GioHangId');

      return res.status(200).json({ success: true, message: 'Cập nhật số lượng thành công.' });
    } catch (error) {
      console.error('Error in CartController.updateQuantity:', error);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi cập nhật số lượng.', error: error.message });
    }
  }

  // Remove item from cart
  async removeItem(req, res) {
    try {
      const NguoiMuaId = req.user.userId;
      const { itemId } = req.params;

      if (!itemId) {
        return res.status(400).json({ success: false, message: 'Thiếu itemId.' });
      }

      const pool = await poolPromise;

      // Delete if belongs to user
      const deleteResult = await pool.request()
        .input('ItemId', sql.UniqueIdentifier, itemId)
        .input('NguoiMuaId', sql.UniqueIdentifier, NguoiMuaId)
        .query(`
          DELETE ct
          OUTPUT DELETED.GioHangId
          FROM ChiTietGioHang ct
          JOIN GioHang g ON ct.GioHangId = g.MaGioHang
          WHERE ct.MaChiTietGioHang = @ItemId AND g.NguoiMuaId = @NguoiMuaId
        `);

      if (deleteResult.recordset.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm này trong giỏ hàng của bạn.' });
      }

      const GioHangId = deleteResult.recordset[0].GioHangId;
      // Update cart update timestamp
      await pool.request()
        .input('GioHangId', sql.UniqueIdentifier, GioHangId)
        .query('UPDATE GioHang SET NgayCapNhat = GETDATE() WHERE MaGioHang = @GioHangId');

      return res.status(200).json({ success: true, message: 'Đã xóa sản phẩm khỏi giỏ hàng.' });
    } catch (error) {
      console.error('Error in CartController.removeItem:', error);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi xóa sản phẩm khỏi giỏ hàng.', error: error.message });
    }
  }
}

module.exports = new CartController();
