const bcrypt = require('bcrypt');
const userRepository = require('../../repositories/auth/user.repository');

class UserService {
  async getUsersPaging(page = 1, limit = 10, search = '') {
    const offset = (page - 1) * limit;
    const result = await userRepository.getUsersPaging({ limit, offset, search });
    
    return {
      data: result.data,
      total: result.total,
      currentPage: page,
      totalPages: Math.ceil(result.total / limit)
    };
  }

  async getStats() {
    return await userRepository.getUserStats();
  }

  async createUser(userData) {
    const { username, password, email, fullName, phone, roleId } = userData;
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    return await userRepository.createUser({
      username,
      passwordHash,
      email,
      fullName,
      phone,
      roleId
    });
  }

  async updateUser(id, userData) {
    // Thêm logic xác thực hoặc check nghiệp vụ nếu cần
    const updated = await userRepository.updateUser(id, userData);
    if (!updated) {
      throw new Error('Không thể cập nhật người dùng hoặc người dùng không tồn tại.');
    }
    return true;
  }

  async deleteUser(id) {
    const deleted = await userRepository.deleteUser(id);
    if (!deleted) {
      throw new Error('Không thể xoá người dùng hoặc người dùng không tồn tại. (Lưu ý: Không thể xoá người dùng đã có đơn hàng)');
    }
    return true;
  }

  async resetPassword(id, newPassword) {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);
    
    const reset = await userRepository.resetPassword(id, passwordHash);
    if (!reset) {
      throw new Error('Không thể cấp lại mật khẩu hoặc người dùng không tồn tại.');
    }
    return true;
  }

  async getUserById(userId) {
    return await userRepository.getUserById(userId);
  }

  async searchContacts(q) {
    if (!q || q.trim() === '') return [];
    return await userRepository.searchContacts(q.trim());
  }

  async searchStores(q) {
    if (!q || q.trim() === '') return [];
    return await userRepository.searchStores(q.trim());
  }
}

module.exports = new UserService();
