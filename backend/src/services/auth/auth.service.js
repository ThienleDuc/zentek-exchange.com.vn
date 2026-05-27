const bcrypt = require('bcrypt');
const userRepository = require('../../repositories/auth/user.repository');
const roleService = require('./role.service');
const otpService = require('./otp.service');
const { generateToken } = require('../../utils/jwt.utils');
const { sendOTPEmail } = require('../../utils/mail.utils');

class AuthService {
  async sendOTP({ email }) {
    try {
      const existingUserByEmail = await userRepository.getUserByEmail(email);
      if (existingUserByEmail) {
        throw new Error('Địa chỉ email đã tồn tại trên hệ thống.');
      }
      
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      otpService.storeOTP(email, otp, 5);
      await sendOTPEmail(email, otp);
      
      return { otpSent: true, email };
    } catch (error) {
      console.error('Error in AuthService.sendOTP:', error.message);
      throw error;
    }
  }

  async register({ username, password, email, fullName, roleName, otp }) {
    try {
      // 1. Kiểm tra username, email
      const existingUserByUsername = await userRepository.getUserByUsername(username);
      if (existingUserByUsername) throw new Error('Tên đăng nhập đã tồn tại trên hệ thống.');
      
      const existingUserByEmail = await userRepository.getUserByEmail(email);
      if (existingUserByEmail) throw new Error('Địa chỉ email đã tồn tại trên hệ thống.');

      // 2. Xác minh OTP (ném lỗi nếu sai/hết hạn)
      otpService.verifyOTP(email, otp);

      // 3. Lấy Vai Trò
      const selectedRole = roleName || 'Buyer';
      const roleId = await roleService.getRoleIdByName(selectedRole);
      if (!roleId) throw new Error(`Vai trò '${selectedRole}' không tồn tại.`);

      // 4. Hash và Lưu DB
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const newUser = await userRepository.createUser({
        username,
        passwordHash,
        email,
        fullName,
        phone: null,
        roleId
      });

      // 5. Ký token
      const token = generateToken({
        userId: newUser.MaNguoiDung,
        username: newUser.TenDangNhap,
        roleName: selectedRole
      });

      // 6. Xóa OTP
      otpService.clearOTP(email);

      return {
        token,
        user: {
          id: newUser.MaNguoiDung,
          username: newUser.TenDangNhap,
          email: newUser.Email,
          fullName: newUser.HoTen,
          roleName: selectedRole,
          createdAt: newUser.NgayTao
        }
      };
    } catch (error) {
      console.error('Error in AuthService.register:', error.message);
      throw error;
    }
  }

  async registerSeller({ username, password, email, fullName, otp, shopName, province, district, ward, address, shopPhone, shopType, taxCode, logo, description, licensePdf }) {
    try {
      const existingUserByUsername = await userRepository.getUserByUsername(username);
      if (existingUserByUsername) throw new Error('Tên đăng nhập đã tồn tại trên hệ thống.');
      
      const existingUserByEmail = await userRepository.getUserByEmail(email);
      if (existingUserByEmail) throw new Error('Địa chỉ email đã tồn tại trên hệ thống.');

      const shopRepository = require('../../repositories/shop/shop.repository');
      const existingShop = await shopRepository.getShopByName(shopName);
      if (existingShop) throw new Error('Tên cửa hàng đã tồn tại trên hệ thống.');

      otpService.verifyOTP(email, otp);

      const roleId = await roleService.getRoleIdByName('Seller');
      if (!roleId) throw new Error(`Vai trò 'Seller' không tồn tại.`);

      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const newUser = await userRepository.createUser({
        username,
        passwordHash,
        email,
        fullName,
        phone: shopPhone,
        roleId
      });

      const sellerId = newUser.MaNguoiDung;

      const newShop = await shopRepository.createShop({
        sellerId,
        shopName,
        description,
        logo,
        address,
        ward,
        district,
        province,
        shopPhone,
        shopType,
        taxCode,
        licensePdf
      });

      const token = generateToken({
        userId: sellerId,
        username: newUser.TenDangNhap,
        roleName: 'Seller'
      });

      otpService.clearOTP(email);

      return {
        token,
        user: {
          id: sellerId,
          username: newUser.TenDangNhap,
          email: newUser.Email,
          fullName: newUser.HoTen,
          roleName: 'Seller',
          createdAt: newUser.NgayTao
        },
        shop: {
          id: newShop.MaCuaHang,
          shopName: newShop.TenCuaHang
        }
      };
    } catch (error) {
      console.error('Error in AuthService.registerSeller:', error.message);
      throw error;
    }
  }

  async login({ identifier, password }) {
    try {
      const user = await userRepository.getUserByIdentifier(identifier);
      if (!user) throw new Error('Tên đăng nhập hoặc mật khẩu không chính xác.');

      const isPasswordValid = await bcrypt.compare(password, user.MatKhauHash);
      if (!isPasswordValid) throw new Error('Tên đăng nhập hoặc mật khẩu không chính xác.');

      const token = generateToken({
        userId: user.MaNguoiDung,
        username: user.TenDangNhap,
        roleName: user.roleName
      });

      return {
        token,
        user: {
          id: user.MaNguoiDung,
          username: user.TenDangNhap,
          email: user.Email,
          fullName: user.HoTen,
          phone: user.SoDienThoai,
          avatar: user.AnhDaiDien,
          roleName: user.roleName,
          createdAt: user.NgayTao
        }
      };
    } catch (error) {
      console.error('Error in AuthService.login:', error.message);
      throw error;
    }
  }
}

module.exports = new AuthService();
