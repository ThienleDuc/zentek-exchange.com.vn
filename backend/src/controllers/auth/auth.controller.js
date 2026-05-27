const authService = require('../../services/auth/auth.service');

class AuthController {
  async sendOTP(req, res) {
    try {
      const { email } = req.body;
      const result = await authService.sendOTP({ email: email.trim() });
      return res.status(200).json({ success: true, message: 'Mã xác thực OTP đã được gửi tới email của bạn.', email: result.email });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message || 'Có lỗi khi gửi OTP.' });
    }
  }

  async register(req, res) {
    try {
      const { username, password, email, fullName, roleName, otp } = req.body;
      const result = await authService.register({
        username: username.trim(),
        password,
        email: email.trim(),
        fullName: fullName.trim(),
        roleName,
        otp: otp.trim()
      });
      return res.status(201).json({ success: true, message: 'Đăng ký tài khoản thành công.', token: result.token, user: result.user });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message || 'Có lỗi xảy ra trong quá trình đăng ký.' });
    }
  }

  async registerSeller(req, res) {
    try {
      const { 
        username, password, email, fullName, otp,
        shopName, province, district, ward, address, shopPhone, shopType, taxCode, licensePdf
      } = req.body;
      
      const result = await authService.registerSeller({
        username: username.trim(),
        password,
        email: email.trim(),
        fullName: fullName.trim(),
        otp: otp.trim(),
        shopName: shopName.trim(),
        province: province.trim(),
        district: district.trim(),
        ward: ward.trim(),
        address: address.trim(),
        shopPhone: shopPhone.trim(),
        shopType,
        taxCode: taxCode ? taxCode.trim() : null,
        licensePdf
      });

      return res.status(201).json({ 
        success: true, 
        message: 'Đăng ký tài khoản cửa hàng thành công.', 
        token: result.token, 
        user: result.user,
        shop: result.shop
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message || 'Có lỗi xảy ra trong quá trình đăng ký cửa hàng.' });
    }
  }

  async login(req, res) {
    try {
      const { identifier, password } = req.body;
      const result = await authService.login({ identifier: identifier.trim(), password });
      return res.status(200).json({ success: true, message: 'Đăng nhập thành công.', token: result.token, user: result.user });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message || 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
    }
  }
}

module.exports = new AuthController();
