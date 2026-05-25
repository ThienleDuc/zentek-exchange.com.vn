const roleRepository = require('../../repositories/auth/role.repository');
const { hasAnyRole } = require('../../utils/role.utils');

class RoleService {
  constructor() {
    // Sử dụng Map làm Memory Cache để hạn chế gọi DB liên tục khi cần lấy MaVaiTro
    this.roleCache = new Map();
  }

  /**
   * Lấy MaVaiTro thông qua TenVaiTro (Admin, Seller, Buyer).
   * Hệ thống sẽ kiểm tra cache trước, nếu không có mới query xuống DB.
   * 
   * @param {string} tenVaiTro 
   * @returns {Promise<string|null>} MaVaiTro (UUID)
   */
  async getRoleIdByName(tenVaiTro) {
    if (!tenVaiTro) return null;
    
    // Đưa về chữ hoa để dễ so sánh (case-insensitive)
    const key = tenVaiTro.toUpperCase();
    
    // 1. Lấy từ Cache nếu có
    if (this.roleCache.has(key)) {
      return this.roleCache.get(key);
    }

    // 2. Nếu chưa có trong cache, gọi Repository lấy từ Database
    const role = await roleRepository.getRoleByName(tenVaiTro);
    
    if (role) {
      // Lưu lại MaVaiTro vào cache để dùng cho các Request sau
      this.roleCache.set(key, role.MaVaiTro);
      return role.MaVaiTro;
    }

    return null;
  }

  /**
   * Hàm hỗ trợ lấy toàn bộ roles nạp vào cache ngay khi khởi động Server (Tuỳ chọn)
   */
  async preloadRolesToCache() {
    try {
      const roles = await roleRepository.getAllRoles();
      roles.forEach(role => {
        this.roleCache.set(role.TenVaiTro.toUpperCase(), role.MaVaiTro);
      });
      console.log('✅ VaiTro đã được nạp vào Cache thành công.');
    } catch (error) {
      console.error('❌ Lỗi khi preload VaiTro vào cache:', error);
    }
  }

  /**
   * Phương thức kiểm tra quyền của User (Business Layer)
   * 
   * @param {Object} user 
   * @param {Array<string>} requiredRoles Danh sách vai trò được phép
   * @returns {boolean}
   */
  checkUserHasAccess(user, requiredRoles = []) {
    return hasAnyRole(user, requiredRoles);
  }
}

module.exports = new RoleService();
