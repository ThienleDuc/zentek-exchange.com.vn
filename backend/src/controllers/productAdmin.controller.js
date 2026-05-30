const productAdminService = require('../services/productAdmin.service');

class ProductAdminController {
  async getProducts(req, res) {
    try {
      const { page, limit, search, trangThai, tuNgay, denNgay, cuaHang, danhMuc, tinhTrang } = req.query;
      const result = await productAdminService.getProducts({ 
        page, limit, search, trangThai, tuNgay, denNgay, cuaHang, danhMuc, tinhTrang 
      });
      res.json({ success: true, ...result });
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sản phẩm:', error);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  }

  async getStats(req, res) {
    try {
      const { tuNgay, denNgay } = req.query;
      const stats = await productAdminService.getStats(tuNgay, denNgay);
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Lỗi khi lấy thống kê sản phẩm:', error);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  }

  async getProductDetail(req, res) {
    try {
      const { id } = req.params;
      const product = await productAdminService.getProductDetail(id);
      res.json({ success: true, data: product });
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết sản phẩm:', error);
      res.status(404).json({ success: false, message: error.message || 'Lỗi server' });
    }
  }

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body; // 'Đã duyệt', 'Đã từ chối', 'Đã gỡ'
      // Giả sử req.user chứa thông tin admin đang đăng nhập
      const adminId = req.user.id; 
      
      const product = await productAdminService.updateStatus(id, adminId, status);
      res.json({ success: true, data: product });
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái sản phẩm:', error);
      res.status(400).json({ success: false, message: error.message || 'Lỗi cập nhật trạng thái' });
    }
  }
}

module.exports = new ProductAdminController();
