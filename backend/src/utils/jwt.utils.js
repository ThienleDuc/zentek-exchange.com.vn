const jwt = require('jsonwebtoken');

// Lấy Secret Key và thời gian hết hạn từ biến môi trường (.env)
// Nếu chưa có trong .env, sẽ dùng giá trị mặc định tạm thời cho lúc phát triển
const JWT_SECRET = process.env.JWT_SECRET || 'ZentekExchange_Secret_Key_2026_Secure';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'; // Token mặc định sống 7 ngày

/**
 * Tạo một JWT Token mới
 * 
 * @param {Object} payload Chứa thông tin người dùng muốn nhúng vào token (VD: { userId, roleName, username })
 * @param {string} expiresIn Thời hạn của Token (mặc định lấy từ biến môi trường, VD: '1h', '7d')
 * @returns {string} Chuỗi JWT đã ký
 */
const generateToken = (payload, expiresIn = JWT_EXPIRES_IN) => {
  try {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn });
    return token;
  } catch (error) {
    console.error('❌ Lỗi khi tạo JWT Token:', error.message);
    throw new Error('Không thể tạo xác thực (Token Generation Failed)');
  }
};

/**
 * Xác thực và giải mã chuỗi JWT Token
 * 
 * @param {string} token Chuỗi token nhận được từ phía Client (thường nằm trong headers.authorization)
 * @returns {Object|null} Payload chứa thông tin User nếu hợp lệ. Trả về null nếu sai hoặc hết hạn.
 */
const verifyToken = (token) => {
  try {
    // Giải mã và verify bằng đúng chữ ký (JWT_SECRET)
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    // Sẽ quăng lỗi nếu token bị sửa đổi, bịa đặt, hoặc đã hết hạn (TokenExpiredError)
    console.error('❌ Xác thực JWT Token thất bại:', error.message);
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken
};
