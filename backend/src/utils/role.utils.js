const ROLE_NAMES = {
  ADMIN: 'Admin',
  SELLER: 'Seller',
  BUYER: 'Buyer',
};

/**
 * Kiểm tra người dùng có phải là Admin hay không
 * @param {Object} user 
 * @returns {boolean}
 */
const isAdmin = (user) => {
  return user?.roleName === ROLE_NAMES.ADMIN;
};

/**
 * Kiểm tra người dùng có phải là Seller hay không
 * @param {Object} user 
 * @returns {boolean}
 */
const isSeller = (user) => {
  return user?.roleName === ROLE_NAMES.SELLER;
};

/**
 * Kiểm tra người dùng có phải là Buyer hay không
 * @param {Object} user 
 * @returns {boolean}
 */
const isBuyer = (user) => {
  return user?.roleName === ROLE_NAMES.BUYER;
};

/**
 * Kiểm tra xem role của user có nằm trong danh sách cho phép không
 * @param {Object} user Object chứa thông tin user (cần có property roleName)
 * @param {Array<string>} allowedRoles Danh sách các RoleName cho phép
 * @returns {boolean}
 */
const hasAnyRole = (user, allowedRoles = []) => {
  if (!user || !user.roleName) return false;
  const userRole = user.roleName.toUpperCase();
  return allowedRoles.some(role => role.toUpperCase() === userRole);
};

module.exports = {
  ROLE_NAMES,
  isAdmin,
  isSeller,
  isBuyer,
  hasAnyRole,
};
