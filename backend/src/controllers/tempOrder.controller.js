const crypto = require('crypto');
const { sql, poolPromise } = require('../config/db');
const tempOrderCache = require('../utils/tempOrderCache');

class TempOrderController {
  // Create temporary order
  async createTempOrder(req, res) {
    try {
      const NguoiMuaId = req.user.userId;
      const { cartItemIds, SanPhamId, PhanLoaiId, SoLuong = 1, isBuyNow = false } = req.body;
      const pool = await poolPromise;

      let items = [];
      let tempOrderId = crypto.randomUUID();

      if (isBuyNow) {
        // --- 1. Buy Now Flow ---
        if (!SanPhamId) {
          return res.status(400).json({ success: false, message: 'Thiếu SanPhamId cho đơn hàng mua ngay.' });
        }
        if (SoLuong < 1) {
          return res.status(400).json({ success: false, message: 'Số lượng mua phải lớn hơn hoặc bằng 1.' });
        }

        // Fetch product and store info
        const productInfo = await pool.request()
          .input('SanPhamId', sql.UniqueIdentifier, SanPhamId)
          .query(`
            SELECT sp.Gia, sp.SoLuong AS TonKho, sp.TieuDe AS TenSanPham, sp.TrangThaiDuyet, sp.TrangThaiHienThi, sp.DaHetHang,
                   ch.TenCuaHang, ch.Logo AS LogoCuaHang,
                   (SELECT TOP 1 DuongDanAnh FROM AnhSanPham WHERE SanPhamId = sp.MaSanPham AND LaAnhChinh = 1) AS Anh
            FROM SanPham sp
            JOIN CuaHang ch ON sp.CuaHangId = ch.MaCuaHang
            WHERE sp.MaSanPham = @SanPhamId
          `);

        if (productInfo.recordset.length === 0) {
          return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm.' });
        }

        const product = productInfo.recordset[0];
        if (product.TrangThaiDuyet !== 'Đã duyệt' || !product.TrangThaiHienThi) {
          return res.status(400).json({ success: false, message: 'Sản phẩm chưa được duyệt hoặc đang bị ẩn.' });
        }

        if (product.DaHetHang || product.TonKho <= 0) {
          return res.status(400).json({ success: false, message: 'Sản phẩm đã hết hàng.' });
        }

        if (product.TonKho < SoLuong) {
          return res.status(400).json({ success: false, message: `Số lượng đặt hàng (${SoLuong}) vượt quá tồn kho (${product.TonKho}).` });
        }

        // Resolve PhanLoaiId
        let resolvedPhanLoaiId = PhanLoaiId;
        let phanLoaiLabel = null;
        if (!resolvedPhanLoaiId) {
          const plResult = await pool.request()
            .input('SanPhamId', sql.UniqueIdentifier, SanPhamId)
            .query('SELECT TOP 1 MaPhanLoai, TenPhanLoai FROM PhanLoai WHERE SanPhamId = @SanPhamId');
          if (plResult.recordset.length > 0) {
            resolvedPhanLoaiId = plResult.recordset[0].MaPhanLoai;
            phanLoaiLabel = plResult.recordset[0].TenPhanLoai;
          } else {
            return res.status(400).json({ success: false, message: 'Sản phẩm này chưa cấu hình phân loại hàng.' });
          }
        } else {
          const plCheck = await pool.request()
            .input('PhanLoaiId', sql.UniqueIdentifier, resolvedPhanLoaiId)
            .input('SanPhamId', sql.UniqueIdentifier, SanPhamId)
            .query('SELECT MaPhanLoai, TenPhanLoai FROM PhanLoai WHERE MaPhanLoai = @PhanLoaiId AND SanPhamId = @SanPhamId');
          if (plCheck.recordset.length === 0) {
            return res.status(400).json({ success: false, message: 'Phân loại hàng không hợp lệ cho sản phẩm này.' });
          }
          phanLoaiLabel = plCheck.recordset[0].TenPhanLoai;
        }

        items.push({
          sanPhamId: SanPhamId,
          phanLoaiId: resolvedPhanLoaiId,
          soLuong: SoLuong,
          donGia: product.Gia,
          tenSanPham: product.TenSanPham,
          phanLoai: phanLoaiLabel,
          anh: product.Anh,
          tenCuaHang: product.TenCuaHang,
          logoCuaHang: product.LogoCuaHang,
          tonKho: product.TonKho
        });

      } else {
        // --- 2. Checkout from Cart Flow ---
        if (!cartItemIds || !Array.isArray(cartItemIds) || cartItemIds.length === 0) {
          return res.status(400).json({ success: false, message: 'Danh sách cartItemIds không được trống.' });
        }

        // Validate UUIDs to prevent SQL Injection
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const isValid = cartItemIds.every(id => uuidRegex.test(id));
        if (!isValid) {
          return res.status(400).json({ success: false, message: 'Danh sách ID giỏ hàng không hợp lệ.' });
        }

        const request = pool.request();
        cartItemIds.forEach((id, index) => {
          request.input(`id_${index}`, sql.UniqueIdentifier, id);
        });
        const paramNames = cartItemIds.map((_, index) => `@id_${index}`).join(',');

        request.input('NguoiMuaId', sql.UniqueIdentifier, NguoiMuaId);

        const query = `
          SELECT 
            ct.MaChiTietGioHang, ct.SanPhamId, ct.PhanLoaiId, ct.SoLuong, ct.DonGia,
            sp.TieuDe AS TenSanPham, sp.SoLuong AS TonKho, sp.DaHetHang,
            pl.TenPhanLoai AS PhanLoai,
            ch.TenCuaHang, ch.Logo AS LogoCuaHang,
            (SELECT TOP 1 DuongDanAnh FROM AnhSanPham WHERE SanPhamId = sp.MaSanPham AND LaAnhChinh = 1) AS Anh
          FROM ChiTietGioHang ct
          JOIN GioHang g ON ct.GioHangId = g.MaGioHang
          JOIN SanPham sp ON ct.SanPhamId = sp.MaSanPham
          LEFT JOIN PhanLoai pl ON ct.PhanLoaiId = pl.MaPhanLoai
          JOIN CuaHang ch ON sp.CuaHangId = ch.MaCuaHang
          WHERE g.NguoiMuaId = @NguoiMuaId AND ct.MaChiTietGioHang IN (${paramNames})
        `;

        const result = await request.query(query);
        
        if (result.recordset.length !== cartItemIds.length) {
          return res.status(400).json({ success: false, message: 'Một số sản phẩm không tồn tại trong giỏ hàng hoặc không thuộc sở hữu của bạn.' });
        }

        // Verify stock for all items
        for (const item of result.recordset) {
          if (item.DaHetHang || item.TonKho <= 0) {
            return res.status(400).json({ success: false, message: `Sản phẩm '${item.TenSanPham}' đã hết hàng.` });
          }
          if (item.TonKho < item.SoLuong) {
            return res.status(400).json({ success: false, message: `Số lượng đặt hàng cho '${item.TenSanPham}' (${item.SoLuong}) vượt quá tồn kho (${item.TonKho}).` });
          }

          items.push({
            maChiTietGioHang: item.MaChiTietGioHang,
            sanPhamId: item.SanPhamId,
            phanLoaiId: item.PhanLoaiId,
            soLuong: item.SoLuong,
            donGia: item.DonGia,
            tenSanPham: item.TenSanPham,
            phanLoai: item.PhanLoai,
            anh: item.Anh,
            tenCuaHang: item.TenCuaHang,
            logoCuaHang: item.LogoCuaHang,
            tonKho: item.TonKho
          });
        }
      }

      // 3. Store temp order in memory cache
      const tempOrderData = {
        tempOrderId,
        nguoiMuaId: NguoiMuaId,
        items,
        cartItemIds: isBuyNow ? null : cartItemIds,
        isBuyNow
      };

      tempOrderCache.set(tempOrderId, tempOrderData);

      return res.status(201).json({
        success: true,
        data: {
          tempOrderId
        }
      });
    } catch (error) {
      console.error('Error in TempOrderController.createTempOrder:', error);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi tạo đơn hàng tạm.', error: error.message });
    }
  }

  // Fetch temporary order
  async getTempOrder(req, res) {
    try {
      const NguoiMuaId = req.user.userId;
      const { tempOrderId } = req.params;

      if (!tempOrderId) {
        return res.status(400).json({ success: false, message: 'Thiếu mã đơn hàng tạm (tempOrderId).' });
      }

      const orderData = tempOrderCache.get(tempOrderId);
      if (!orderData) {
        return res.status(410).json({ success: false, message: 'Đơn hàng tạm không tồn tại hoặc đã hết hạn (30 phút).' });
      }

      // Security Check: Verify owner
      if (orderData.nguoiMuaId !== NguoiMuaId) {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập đơn hàng tạm này.' });
      }

      return res.status(200).json({
        success: true,
        data: {
          tempOrderId: orderData.tempOrderId,
          items: orderData.items,
          isBuyNow: orderData.isBuyNow
        }
      });
    } catch (error) {
      console.error('Error in TempOrderController.getTempOrder:', error);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy thông tin đơn tạm.', error: error.message });
    }
  }
}

module.exports = new TempOrderController();
