const userService = require('../../services/user/user.service');

class UserController {
  async getUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';

      const result = await userService.getUsersPaging(page, limit, search);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getStats(req, res) {
    try {
      const stats = await userService.getStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getRoles(req, res) {
    try {
      const roles = await require('../../repositories/auth/role.repository').getAllRoles();
      res.status(200).json({ success: true, data: roles });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      if (!user) return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
      res.json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async searchContacts(req, res) {
    try {
      const q = req.query.q || '';
      const results = await userService.searchContacts(q);
      res.json({ success: true, data: results });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async searchStores(req, res) {
    try {
      const q = req.query.q || '';
      const results = await userService.searchStores(q);
      res.json({ success: true, data: results });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createUser(req, res) {
    try {
      const { username, password, email, fullName, phone, roleId } = req.body;
      const result = await userService.createUser({ username, password, email, fullName, phone, roleId });
      res.status(201).json({ success: true, data: result, message: 'Tạo người dùng thành công.' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { fullName, phone, roleId } = req.body;
      
      await userService.updateUser(id, { fullName, phone, roleId });
      res.status(200).json({ success: true, message: 'Cập nhật thành công.' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      await userService.deleteUser(id);
      res.status(200).json({ success: true, message: 'Xoá người dùng thành công.' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async resetPassword(req, res) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;
      
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      }

      await userService.resetPassword(id, newPassword);
      res.status(200).json({ success: true, message: 'Cấp lại mật khẩu thành công.' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new UserController();
