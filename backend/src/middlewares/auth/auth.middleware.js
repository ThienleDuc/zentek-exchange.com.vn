const { verifyToken } = require('../../utils/jwt.utils');
const { hasAnyRole } = require('../../utils/role.utils');

/**
 * Middleware 1: Xác thực người dùng (Đã đăng nhập hay chưa)
 * Middleware này kiểm tra xem request có gửi kèm JWT Token hợp lệ hay không.
 */
const authenticateToken = (req, res, next) => {
  // Lấy chuỗi Token từ Headers (Chuẩn: Authorization: Bearer <token>)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // 1. Kiểm tra xem có token không
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Truy cập bị từ chối. Vui lòng đăng nhập (Missing Token).'
    });
  }

  // 2. Xác thực và giải mã token
  const decodedPayload = verifyToken(token);

  if (!decodedPayload) {
    return res.status(403).json({
      success: false,
      message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.'
    });
  }

  // 3. Nếu thành công, gán thông tin user vào req để các controller phía sau có thể sử dụng (req.user)
  req.user = decodedPayload;
  next();
};

/**
 * Middleware 2: Kiểm tra phân quyền theo Vai Trò (Roles)
 * Middleware này phải được chạy sau `authenticateToken`.
 * 
 * @param  {...string} allowedRoles Các vai trò được phép (VD: 'Admin', 'Seller')
 * @returns {Function} Express middleware
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // 1. Kiểm tra thông tin user (được gắn từ middleware authenticateToken trước đó)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Lỗi hệ thống: Không tìm thấy dữ liệu định danh người dùng.'
      });
    }

    // 2. So sánh quyền của user hiện tại với danh sách quyền được yêu cầu
    if (!hasAnyRole(req.user, allowedRoles)) {
      return res.status(403).json({
        success: false,
        message: 'Truy cập bị từ chối. Bạn không có quyền (Role) thực hiện hành động này.'
      });
    }

    // 3. Hợp lệ -> Chuyển quyền xử lý cho Controller
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles
};
