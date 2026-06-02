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
  async getSellerProducts(req, res) {
    try {
      const sellerId = req.user.userId;
      const products = await productService.getSellerProducts(sellerId);
      res.json({ success: true, data: products });
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sản phẩm seller:', error);
      res.status(500).json({ success: false, message: error.message || 'Lỗi server' });
    }
  }

  async getSellerProductDetail(req, res) {
    try {
      const { id } = req.params;
      const sellerId = req.user.userId;
      const product = await productService.getSellerProductDetail(id, sellerId);
      res.json({ success: true, data: product });
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết sản phẩm seller:', error);
      res.status(500).json({ success: false, message: error.message || 'Lỗi server' });
    }
  }

  async getSellerStats(req, res) {
    try {
      const sellerId = req.user.userId;
      const { tuNgay, denNgay } = req.query;
      const stats = await productService.getSellerStats(sellerId, tuNgay, denNgay);
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Lỗi khi lấy thống kê sản phẩm seller:', error);
      res.status(500).json({ success: false, message: error.message || 'Lỗi server' });
    }
  }

  async createProduct(req, res) {
    try {
      const sellerId = req.user.userId;
      const productData = req.body;
      const newProduct = await productService.createProduct(sellerId, productData);
      res.status(201).json({ success: true, message: 'Thêm sản phẩm thành công', data: newProduct });
    } catch (error) {
      console.error('Lỗi khi thêm sản phẩm:', error);
      res.status(500).json({ success: false, message: error.message || 'Lỗi server' });
    }
  }

  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const sellerId = req.user.userId;
      const productData = req.body;
      const updatedProduct = await productService.updateProduct(id, sellerId, productData);
      res.json({ success: true, message: 'Cập nhật sản phẩm thành công', data: updatedProduct });
    } catch (error) {
      console.error('Lỗi khi cập nhật sản phẩm:', error);
      res.status(500).json({ success: false, message: error.message || 'Lỗi server' });
    }
  }

  async setOutOfStock(req, res) {
    try {
      const { id } = req.params;
      const sellerId = req.user.userId;
      const product = await productService.setOutOfStock(id, sellerId);
      res.json({ success: true, message: 'Xác nhận hết hàng thành công', data: product });
    } catch (error) {
      console.error('Lỗi khi xác nhận hết hàng:', error);
      res.status(500).json({ success: false, message: error.message || 'Lỗi server' });
    }
  }

  async setInStock(req, res) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      const sellerId = req.user.userId;
      const product = await productService.setInStock(id, sellerId, Number(quantity) || 1);
      res.json({ success: true, message: 'Xác nhận còn hàng thành công', data: product });
    } catch (error) {
      console.error('Lỗi khi xác nhận còn hàng:', error);
      res.status(500).json({ success: false, message: error.message || 'Lỗi server' });
    }
  }

  async getProductReviews(req, res) {
    try {
      const { id } = req.params;
      const { sosao } = req.query;
      const reviews = await productService.getProductReviews(id, sosao ? parseInt(sosao) : 0);
      res.json({ success: true, data: reviews });
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đánh giá sản phẩm:', error);
      res.status(500).json({ success: false, message: error.message || 'Lỗi server' });
    }
  }

  async replyReview(req, res) {
    try {
      const { reviewId } = req.params;
      const sellerId = req.user.userId;
      const { noiDung } = req.body;
      const result = await productService.replyReview(reviewId, sellerId, noiDung);
      res.json({ success: true, message: 'Trả lời đánh giá thành công', data: result });
    } catch (error) {
      console.error('Lỗi khi trả lời đánh giá:', error);
      res.status(500).json({ success: false, message: error.message || 'Lỗi server' });
    }
  }
}

module.exports = new ProductController();
