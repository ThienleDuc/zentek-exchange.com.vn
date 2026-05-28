import { PATHS } from "./path.utils";

export const ROLE_NAMES = {
  ADMIN: 'Admin',
  SELLER: 'Seller',
  BUYER: 'Buyer',
} as const;

export type RoleNames = typeof ROLE_NAMES[keyof typeof ROLE_NAMES];

export interface User {
  id: string | number;
  username: string;
  fullName: string;
  email: string;
  roleName: string;
  role?: string; // Tương thích ngược nếu cần
  phone?: string;
  avatar?: string;
  createdAt?: string;
}

export const isAdmin = (user?: User | null): boolean => {
  const role = user?.roleName || user?.role;
  return role?.toUpperCase() === ROLE_NAMES.ADMIN.toUpperCase();
};

export const isSeller = (user?: User | null): boolean => {
  const role = user?.roleName || user?.role;
  return role?.toUpperCase() === ROLE_NAMES.SELLER.toUpperCase();
};

export const isBuyer = (user?: User | null): boolean => {
  const role = user?.roleName || user?.role;
  return role?.toUpperCase() === ROLE_NAMES.BUYER.toUpperCase();
};

export const hasAnyRole = (user: User | null, allowedRoles: RoleNames[]) => {
  if (!user) return false;
  const userRole = (user.roleName || user.role)?.trim();
  if (!userRole) return false;
  return allowedRoles.map(role => role.toUpperCase()).includes(userRole.toUpperCase());
};

export const getUserFromStorage = (): User | null => {
  const userJson = localStorage.getItem('user');
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
};

export const getDashboardPath = (role: RoleNames | undefined): string => {
  switch (role) {
    case ROLE_NAMES.ADMIN:
      return PATHS.ADMIN.DASHBOARD;
    case ROLE_NAMES.SELLER:
      return PATHS.Seller.DASHBOARD;
    case ROLE_NAMES.BUYER:
      return '/';
    default:
      return '/';
  }
};
