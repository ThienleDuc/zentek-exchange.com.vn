const categoryRepository = require('../repositories/category.repository');

class CategoryService {
  /**
   * Chuyển đổi danh sách phẳng thành cấu trúc cây (nested children)
   */
  buildTree(categories, parentId = null) {
    const result = [];
    for (const cat of categories) {
      if (cat.DanhMucChaId === parentId) {
        const children = this.buildTree(categories, cat.MaDanhMuc);
        if (children.length > 0) {
          cat.children = children;
        } else {
          cat.children = [];
        }
        result.push(cat);
      }
    }
    return result;
  }

  async getAllCategories(format = 'tree') {
    try {
      const categories = await categoryRepository.getAll();
      
      if (format === 'tree') {
        return {
          success: true,
          data: this.buildTree(categories)
        };
      }
      
      return {
        success: true,
        data: categories
      };
    } catch (error) {
      throw new Error('Lỗi khi lấy danh sách danh mục: ' + error.message);
    }
  }

  async getCategoryById(id) {
    try {
      const category = await categoryRepository.getById(id);
      if (!category) {
        return { success: false, message: 'Không tìm thấy danh mục' };
      }
      return { success: true, data: category };
    } catch (error) {
      throw new Error('Lỗi khi lấy chi tiết danh mục: ' + error.message);
    }
  }

  async createCategory(data) {
    try {
      if (!data.tenDanhMuc) {
        return { success: false, message: 'Tên danh mục là bắt buộc' };
      }

      // Kiểm tra danh mục cha nếu có truyền
      if (data.danhMucChaId) {
        const parent = await categoryRepository.getById(data.danhMucChaId);
        if (!parent) {
          return { success: false, message: 'Danh mục cha không tồn tại' };
        }
      }

      const newCategory = await categoryRepository.create(data);
      return { success: true, message: 'Tạo danh mục thành công', data: newCategory };
    } catch (error) {
      throw new Error('Lỗi khi tạo danh mục: ' + error.message);
    }
  }

  async updateCategory(id, data) {
    try {
      const existing = await categoryRepository.getById(id);
      if (!existing) {
        return { success: false, message: 'Không tìm thấy danh mục để cập nhật' };
      }

      if (data.danhMucChaId) {
        if (data.danhMucChaId === id) {
          return { success: false, message: 'Danh mục cha không thể là chính nó' };
        }
        const parent = await categoryRepository.getById(data.danhMucChaId);
        if (!parent) {
          return { success: false, message: 'Danh mục cha không tồn tại' };
        }
      }

      const updated = await categoryRepository.update(id, data);
      return { success: true, message: 'Cập nhật danh mục thành công', data: updated };
    } catch (error) {
      throw new Error('Lỗi khi cập nhật danh mục: ' + error.message);
    }
  }

  async deleteCategory(id) {
    try {
      const existing = await categoryRepository.getById(id);
      if (!existing) {
        return { success: false, message: 'Không tìm thấy danh mục để xóa' };
      }

      const childCount = await categoryRepository.countChildren(id);
      if (childCount > 0) {
        return { success: false, message: 'Không thể xóa vì danh mục này đang chứa các danh mục con' };
      }

      const productCount = await categoryRepository.countProducts(id);
      if (productCount > 0) {
        return { success: false, message: 'Không thể xóa vì đã có sản phẩm thuộc danh mục này' };
      }

      const isDeleted = await categoryRepository.delete(id);
      if (isDeleted) {
        return { success: true, message: 'Xóa danh mục thành công' };
      } else {
        return { success: false, message: 'Xóa danh mục thất bại do lỗi hệ thống' };
      }
    } catch (error) {
      throw new Error('Lỗi khi xóa danh mục: ' + error.message);
    }
  }
}

module.exports = new CategoryService();
