import { ROLE_NAMES, type RoleNames } from "./role.utils";

export const PATHS = {
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    PROFILE: '/profile',
    SETTINGS: '/settings',
    UNAUTHORIZED: '/unauthorized',
    FORBIDDEN: '/403',
    NOT_FOUND: '/*',
  },
  // Seller
  Seller: {
    DASHBOARD: '/seller'
  },
  // Buyer
  Buyer: {
    DASHBOARD: '/buyer'
  },
  // Nhóm Admin
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USER_MANAGEMENT: '/admin/users',
  }
} as const;

/**
 * Bản đồ ánh xạ vai trò đến danh sách các đường dẫn được phép
 */
export const ROLE_ALLOWED_PATHS: Record<RoleNames, string[]> = {
  [ROLE_NAMES.ADMIN]: [
    PATHS.ADMIN.DASHBOARD,
  ],
  [ROLE_NAMES.SELLER]: [
    PATHS.Seller.DASHBOARD,
  ],
  [ROLE_NAMES.BUYER]: [
    PATHS.Buyer.DASHBOARD
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
