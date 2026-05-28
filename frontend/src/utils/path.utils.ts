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
    SHOP: '/seller/cua-hang'
  },
  // Buyer
  Buyer: {
    ROOT: '/buyer',
    DASHBOARD: '/buyer/dashboard',
    ORDERS: '/buyer/don-mua',
    MESSAGES: '/buyer/tin-nhan',
    NOTIFICATIONS: '/buyer/thong-bao'
  },
  // Nhóm Admin
  ADMIN: {
    ROOT: '/admin',
    DASHBOARD: '/admin/dashboard',
    USER_MANAGEMENT: '/admin/users',
    SHOP_MANAGEMENT: '/admin/shops',
    PRODUCT_MANAGEMENT: '/admin/products',
  }
} as const;

/**
 * Bản đồ ánh xạ vai trò đến danh sách các đường dẫn được phép
 */
export const ROLE_ALLOWED_PATHS: Record<RoleNames, string[]> = {
  [ROLE_NAMES.ADMIN]: [
    PATHS.ADMIN.DASHBOARD,
    PATHS.ADMIN.USER_MANAGEMENT,
    PATHS.ADMIN.SHOP_MANAGEMENT,
    PATHS.ADMIN.PRODUCT_MANAGEMENT,
  ],
  [ROLE_NAMES.SELLER]: [
    PATHS.Seller.DASHBOARD,
  ],
  [ROLE_NAMES.BUYER]: [
    PATHS.Buyer.DASHBOARD,
    PATHS.Buyer.ORDERS,
    PATHS.Buyer.MESSAGES,
    PATHS.Buyer.NOTIFICATIONS
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
