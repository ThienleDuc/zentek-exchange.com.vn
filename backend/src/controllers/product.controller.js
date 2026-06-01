const productService = require('../services/product.service');

class ProductController {
  async getProducts(req, res) {
    try {
      const { sortBy, offset, limit } = req.query;
      const result = await productService.getProducts({
        sortBy,
        offset: offset ? parseInt(offset) : 0,
        limit: limit ? parseInt(limit) : 20
      });
      res.json(result);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sản phẩm trang chủ:', error);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  }

  async searchProducts(req, res) {
    try {
      const { q, category, priceMin, priceMax, rating, condition, store, province, district, ward, sort, page, limit } = req.query;
      const result = await productService.searchProducts({
        q,
        category,
        priceMin,
        priceMax,
        rating: rating ? parseFloat(rating) : 0,
        condition,
        store,
        province,
        district,
        ward,
        sort,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 12
      });
      res.json(result);
    } catch (error) {
      console.error('Lỗi khi tìm kiếm sản phẩm:', error);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  }

  async getProductDetail(req, res) {
    try {
      const { id } = req.params;
      const product = await productService.getProductDetail(id);
      res.json({ success: true, data: product });
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết sản phẩm công khai:', error);
      res.status(404).json({ success: false, message: error.message || 'Lỗi server' });
    }
  }
}

module.exports = new ProductController();
