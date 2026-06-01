const storeService = require('../services/store.service');

class StoreController {
  async getStores(req, res) {
    try {
      const { search, province, district, ward, businessType, verified, minRating, sort, page, limit } = req.query;
      const result = await storeService.getStores({
        search,
        province,
        district,
        ward,
        businessType,
        verified,
        minRating: minRating ? parseFloat(minRating) : 0,
        sort,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 12
      });
      res.json(result);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách cửa hàng:', error);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  }

  async getFilters(req, res) {
    try {
      const result = await storeService.getStoreFilters();
      res.json(result);
    } catch (error) {
      console.error('Lỗi khi lấy bộ lọc cửa hàng:', error);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  }
}

module.exports = new StoreController();
