const bcrypt = require('bcrypt');
const userRepository = require('../../repositories/auth/user.repository');
const otpService = require('../../services/auth/otp.service');
const { sql, poolPromise } = require('../../config/db');

class UserProfileController {
  /**
   * GET /api/user/profile
   */
  async getProfile(req, res) {
    try {
      const userId = req.user.userId;
      const user = await userRepository.getUserById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
      }
      return res.status(200).json({ success: true, data: user });
    } catch (error) {
      console.error('Error in UserProfileController.getProfile:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * PUT /api/user/profile hoặc PUT /api/nguoidung/thong-tin
   */
  async updateProfile(req, res) {
    try {
      const userId = req.user.userId;
      const fullName = req.body.HoTen || req.body.hoTen;
      const email = req.body.Email || req.body.email;
      const phone = req.body.SoDienThoai || req.body.soDienThoai;
      const avatarUrl = req.body.AnhDaiDien || req.body.anhDaiDien;
      const otp = req.body.otp || req.body.otpCode;

      if (!fullName || !email) {
        return res.status(400).json({ success: false, message: 'Họ tên và Email không được để trống.' });
      }

      // Lấy profile hiện tại để đối chiếu
      const currentUser = await userRepository.getUserById(userId);
      if (!currentUser) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
      }

      // Kiểm tra trùng lặp email với người dùng khác
      const isEmailTaken = await userRepository.isEmailTakenByOther(email, userId);
      if (isEmailTaken) {
        return res.status(400).json({ success: false, message: 'Email đã được sử dụng bởi người dùng khác.' });
      }

      // Kiểm tra trùng lặp số điện thoại với người dùng khác
      if (phone) {
        const isPhoneTaken = await userRepository.isPhoneTakenByOther(phone, userId);
        if (isPhoneTaken) {
          return res.status(400).json({ success: false, message: 'Số điện thoại đã được sử dụng bởi người dùng khác.' });
        }
      }

      // Xác thực OTP
      // 1. Nếu Email thay đổi: Bắt buộc phải có OTP cho Email mới
      // 2. Nếu không thay đổi nhưng được truyền OTP từ client (ví dụ Buyer page luôn bắt nhập OTP): Tiến hành xác thực
      const isEmailChanged = currentUser.Email.toLowerCase().trim() !== email.toLowerCase().trim();
      if (isEmailChanged || otp) {
        if (!otp) {
          return res.status(400).json({ success: false, message: 'Cần mã OTP để xác nhận thay đổi Email.' });
        }
        try {
          otpService.verifyOTP(email, otp);
          otpService.clearOTP(email);
        } catch (err) {
          return res.status(400).json({ success: false, message: err.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.' });
        }
      }

      // Tiến hành cập nhật
      const success = await userRepository.updateUserProfile(userId, {
        fullName,
        phone,
        email,
        avatarUrl
      });

      if (!success) {
        return res.status(500).json({ success: false, message: 'Cập nhật thông tin thất bại.' });
      }

      return res.status(200).json({
        success: true,
        message: 'Cập nhật thông tin thành công!',
        data: {
          HoTen: fullName,
          Email: email,
          SoDienThoai: phone,
          AnhDaiDien: avatarUrl
        }
      });
    } catch (error) {
      console.error('Error in UserProfileController.updateProfile:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * PUT /api/nguoidung/doi-mat-khau
   */
  async changePassword(req, res) {
    try {
      const userId = req.user.userId;
      const currentPassword = req.body.currentPassword || req.body.oldPassword;
      const newPassword = req.body.newPassword;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mật khẩu cũ và mật khẩu mới.' });
      }

      if (currentPassword === newPassword) {
        return res.status(400).json({ success: false, message: 'Mật khẩu mới không được trùng với mật khẩu cũ.' });
      }

      // Kiểm tra độ dài mật khẩu mới
      if (newPassword.length < 6 || newPassword.length > 12) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu mới phải có ít nhất 6 ký tự và nhiều nhất 12 ký tự.'
        });
      }

      // Lấy mật khẩu băm hiện tại của người dùng
      const pool = await poolPromise;
      const userQuery = await pool.request()
        .input('Id', sql.UniqueIdentifier, userId)
        .query('SELECT MatKhauHash FROM NguoiDung WHERE MaNguoiDung = @Id AND DaXoa = 0');

      const user = userQuery.recordset[0];
      if (!user) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng hoặc tài khoản đã bị khóa.' });
      }

      // So sánh mật khẩu hiện tại
      const isMatch = await bcrypt.compare(currentPassword, user.MatKhauHash);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không chính xác.' });
      }

      // Mã hóa mật khẩu mới
      const saltRounds = 10;
      const newHash = await bcrypt.hash(newPassword, saltRounds);

      // Cập nhật vào DB
      const success = await userRepository.updatePassword(userId, newHash);
      if (!success) {
        return res.status(500).json({ success: false, message: 'Thay đổi mật khẩu thất bại.' });
      }

      return res.status(200).json({
        success: true,
        message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.'
      });
    } catch (error) {
      console.error('Error in UserProfileController.changePassword:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new UserProfileController();
