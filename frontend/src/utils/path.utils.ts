import { ROLE_NAMES, type RoleNames } from "./role.utils";

export const PATHS = {
  AUTH: {
    LOGIN: '/dang-nhap',
    REGISTER: '/dang-ky',
    REGISTER_SELLER: '/dang-ky-nguoi-ban',
    PROFILE: '/ho-so',
    SETTINGS: '/cai-dat',
    UNAUTHORIZED: '/khong-du-quyen',
    FORBIDDEN: '/403',
    NOT_FOUND: '/khong-tim-thay',
  },
  // Seller
  Seller: {
    ROOT: '/seller',
    DASHBOARD: '/seller/dashboard',
    SHOP: '/seller/cua-hang',
    MESSAGES: '/seller/chat'
  },
  // Buyer
  Buyer: {
    ROOT: '/buyer',
    DASHBOARD: '/buyer/dashboard',
    ORDERS: '/buyer/don-mua',
    MESSAGES: '/buyer/tin-nhan',
    NOTIFICATIONS: '/buyer/thong-bao',
    TAI_KHOAN_CA_NHAN: '/buyer/thay-doi-thong-tin',
    DOI_MAT_KHAU: '/buyer/doi-mat-khau',
    HOA_DON_BAN_HANG: '/buyer/hoa-don/:orderId',
    CART: '/buyer/gio-hang',
    CHECKOUT: '/buyer/thanh-toan',
  },
  // Nhóm Admin
  ADMIN: {
    ROOT: '/admin',
    DASHBOARD: '/admin/dashboard',
    USER_MANAGEMENT: '/admin/users',
    SHOP_MANAGEMENT: '/admin/shops',
    PRODUCT_MANAGEMENT: '/admin/products',
    MESSAGE_MANAGEMENT: '/admin/messages',
  },
  PUPLIC: {
    HOME: '/',
    SEARCH: '/search',
    STORES: '/stores',
    PRODUCTS: '/products',
    PRODUCT_DETAIL: '/san-pham/:id'
  }
};

/**
 * Bản đồ ánh xạ vai trò đến danh sách các đường dẫn được phép
 */
export const ROLE_ALLOWED_PATHS: Record<RoleNames, string[]> = {
  [ROLE_NAMES.ADMIN]: [
    PATHS.ADMIN.DASHBOARD,
    PATHS.ADMIN.USER_MANAGEMENT,
    PATHS.ADMIN.SHOP_MANAGEMENT,
    PATHS.ADMIN.PRODUCT_MANAGEMENT,
    PATHS.ADMIN.MESSAGE_MANAGEMENT,
    PATHS.Buyer.ORDERS,
    PATHS.Buyer.DOI_MAT_KHAU,
    PATHS.Buyer.HOA_DON_BAN_HANG,
  ],
  [ROLE_NAMES.SELLER]: [
    PATHS.Seller.DASHBOARD,
    PATHS.Seller.SHOP,
    PATHS.Seller.MESSAGES,
    PATHS.Buyer.ORDERS,
    PATHS.Buyer.DOI_MAT_KHAU,
    PATHS.Buyer.HOA_DON_BAN_HANG,
    PATHS.ADMIN.PRODUCT_MANAGEMENT,
  ],
  [ROLE_NAMES.BUYER]: [
    PATHS.Buyer.DASHBOARD,
    PATHS.Buyer.ORDERS,
    PATHS.Buyer.MESSAGES,
    PATHS.Buyer.NOTIFICATIONS,
    PATHS.Buyer.TAI_KHOAN_CA_NHAN,
    PATHS.Buyer.DOI_MAT_KHAU,
    PATHS.Buyer.HOA_DON_BAN_HANG,
    PATHS.Buyer.CART,
    PATHS.Buyer.CHECKOUT
  ]
};

/**
 * Kiểm tra xem một đường dẫn có thuộc quyền hạn của vai trò hay không
 */
export const isPathAllowed = (role: RoleNames, path: string): boolean => {
  const allowedPaths = ROLE_ALLOWED_PATHS[role];
  if (!allowedPaths) return false;
  
  // Kiểm tra chính xác hoặc bắt đầu bằng (cho các sub-routes)
  return allowedPaths.some((p) => {
    const normalizedPath = p.includes('/:') ? p.split('/:')[0] : p;
    return path === normalizedPath || path === p || path.startsWith(`${normalizedPath}/`);
  });
};
