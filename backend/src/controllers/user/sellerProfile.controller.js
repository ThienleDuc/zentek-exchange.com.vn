const userRepository = require('../../repositories/auth/user.repository');
const shopRepository = require('../../repositories/shop/shop.repository');
const otpService = require('../../services/auth/otp.service');

class SellerProfileController {
  /**
   * GET /api/seller/profile
   */
  async getProfile(req, res) {
    try {
      const userId = req.user.userId;
      
      const user = await userRepository.getUserById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin tài khoản người bán.' });
      }

      const shop = await shopRepository.getShopBySellerId(userId);

      return res.status(200).json({
        success: true,
        data: {
          user: {
            maNguoiDung: user.MaNguoiDung,
            tenDangNhap: user.TenDangNhap,
            hoTen: user.HoTen,
            email: user.Email,
            soDienThoai: user.SoDienThoai ? user.SoDienThoai.trim() : null,
            anhDaiDien: user.AnhDaiDien,
            ngayTao: user.NgayTao
          },
          shop: shop ? {
            maCuaHang: shop.MaCuaHang,
            tenCuaHang: shop.TenCuaHang,
            moTa: shop.MoTa,
            logo: shop.Logo,
            diaChi: shop.DiaChi,
            phuongXa: shop.PhuongXa,
            quanHuyen: shop.QuanHuyen,
            tinhThanh: shop.TinhThanh,
            soDienThoai: shop.SoDienThoai ? shop.SoDienThoai.trim() : null,
            loaiHinhCuaHang: shop.LoaiHinhCuaHang,
            maSoThue: shop.MaSoThue,
            daXacThucPhapLy: shop.DaXacThucPhapLy,
            ngayTao: shop.NgayTao
          } : null
        }
      });
    } catch (error) {
      console.error('Error in SellerProfileController.getProfile:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * PUT /api/seller/profile
   */
  async updateProfile(req, res) {
    try {
      const userId = req.user.userId;
      const { user: userData, shop: shopData, otp } = req.body;

      if (!userData || !shopData) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin cập nhật (user hoặc shop).' });
      }

      // Lấy thông tin hiện tại của user để đối chiếu
      const currentUser = await userRepository.getUserById(userId);
      if (!currentUser) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy người bán.' });
      }

      // Xác định xem số điện thoại có thay đổi không
      const currentPhone = currentUser.SoDienThoai ? currentUser.SoDienThoai.trim() : '';
      const newPhone = userData.soDienThoai ? userData.soDienThoai.trim() : '';
      const isPhoneChanged = currentPhone !== newPhone;

      // Nếu số điện thoại thay đổi hoặc client gửi kèm OTP, tiến hành kiểm tra OTP
      if (isPhoneChanged || otp) {
        if (!otp) {
          return res.status(400).json({ success: false, message: 'Cần mã OTP để xác nhận thay đổi số điện thoại.' });
        }
        try {
          otpService.verifyOTP(newPhone, otp);
          otpService.clearOTP(newPhone);
        } catch (err) {
          return res.status(400).json({ success: false, message: err.message || 'Mã OTP không chính xác hoặc hết hạn.' });
        }
      }

      // Kiểm tra trùng email với người dùng khác
      const isEmailTaken = await userRepository.isEmailTakenByOther(userData.email, userId);
      if (isEmailTaken) {
        return res.status(400).json({ success: false, message: 'Email đã được sử dụng bởi người dùng khác.' });
      }

      // Kiểm tra trùng SĐT với người dùng khác
      if (newPhone) {
        const isPhoneTaken = await userRepository.isPhoneTakenByOther(newPhone, userId);
        if (isPhoneTaken) {
          return res.status(400).json({ success: false, message: 'Số điện thoại này đã được sử dụng bởi tài khoản khác.' });
        }
      }

      // Chuẩn bị payload để cập nhật
      const userPayload = {
        hoTen: userData.hoTen,
        email: userData.email,
        soDienThoai: newPhone,
        anhDaiDien: userData.anhDaiDien
      };

      const shopPayload = {
        tenCuaHang: shopData.tenCuaHang,
        soDienThoai: shopData.soDienThoai,
        moTa: shopData.moTa,
        diaChi: shopData.diaChi,
        phuongXa: shopData.phuongXa,
        quanHuyen: shopData.quanHuyen,
        tinhThanh: shopData.tinhThanh,
        loaiHinhCuaHang: shopData.loaiHinhCuaHang,
        maSoThue: shopData.maSoThue,
        logo: shopData.logo
      };

      // Thực hiện cập nhật trong 1 transaction
      await shopRepository.updateShopAndUser(userId, userPayload, shopPayload);

      // Trả về dữ liệu mới sau khi lưu thành công
      return res.status(200).json({
        success: true,
        message: 'Cập nhật hồ sơ cửa hàng thành công!',
        data: {
          user: {
            ...userData,
            soDienThoai: newPhone
          },
          shop: shopData
        }
      });
    } catch (error) {
      console.error('Error in SellerProfileController.updateProfile:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new SellerProfileController();
