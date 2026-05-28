const categoryService = require('../services/category.service');

class CategoryController {
  async getAllCategories(req, res) {
    try {
      const format = req.query.format || 'tree'; // Mặc định trả về dạng cây
      const result = await categoryService.getAllCategories(format);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getCategoryById(req, res) {
    try {
      const { id } = req.params;
      const result = await categoryService.getCategoryById(id);
      if (!result.success) {
        return res.status(404).json(result);
      }
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createCategory(req, res) {
    try {
      const result = await categoryService.createCategory(req.body);
      if (!result.success) {
        return res.status(400).json(result);
      }
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const result = await categoryService.updateCategory(id, req.body);
      if (!result.success) {
        return res.status(400).json(result);
      }
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      const result = await categoryService.deleteCategory(id);
      if (!result.success) {
        return res.status(400).json(result);
      }
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new CategoryController();
