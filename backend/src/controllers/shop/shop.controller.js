const shopService = require('../../services/shop.service');

class ShopController {
  async getShops(req, res) {
    try {
      const { page, limit, search, status, approval, type } = req.query;
      const result = await shopService.getShops({ page, limit, search, status, approval, type });
      res.json({ success: true, ...result });
    } catch (error) {
      console.error('Lỗi khi lấy danh sách cửa hàng:', error);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  }

  async getStats(req, res) {
    try {
      const stats = await shopService.getStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Lỗi khi lấy thống kê cửa hàng:', error);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  }

  async createShop(req, res) {
    try {
      const authService = require('../../services/auth/auth.service');
      const result = await authService.registerSeller({ ...req.body, bypassOtp: true });
      res.status(201).json({ success: true, data: result.shop });
    } catch (error) {
      console.error('Lỗi khi tạo cửa hàng:', error);
      res.status(400).json({ success: false, message: error.message || 'Lỗi khi tạo cửa hàng' });
    }
  }

  async updateShop(req, res) {
    try {
      const { id } = req.params;
      const shop = await shopService.updateShop(id, req.body);
      res.json({ success: true, data: shop });
    } catch (error) {
      console.error('Lỗi khi cập nhật cửa hàng:', error);
      res.status(400).json({ success: false, message: error.message || 'Lỗi khi cập nhật cửa hàng' });
    }
  }

  async toggleStatus(req, res) {
    try {
      const { id } = req.params;
      const newStatus = await shopService.toggleStatus(id);
      res.json({ success: true, data: { TrangThai: newStatus } });
    } catch (error) {
      console.error('Lỗi khi đổi trạng thái cửa hàng:', error);
      res.status(400).json({ success: false, message: error.message || 'Lỗi server' });
    }
  }

  async approveShop(req, res) {
    try {
      const { id } = req.params;
      const { isApproved, reason } = req.body;
      const newStatus = await shopService.approveShop(id, isApproved, reason);
      res.json({ success: true, data: { DaXacThucPhapLy: newStatus } });
    } catch (error) {
      console.error('Lỗi khi phê duyệt cửa hàng:', error);
      res.status(400).json({ success: false, message: error.message || 'Lỗi server' });
    }
  }
}

module.exports = new ShopController();
