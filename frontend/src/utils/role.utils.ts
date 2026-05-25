import { PATHS } from "./path.utils";

export const ROLE_NAMES = {
  ADMIN: 'Admin',
  SELLER: 'Seller',
  BUYER: 'Buyer',
} as const;

export type RoleNames = typeof ROLE_NAMES[keyof typeof ROLE_NAMES];

export interface User {
  tenDangNhap: string;
  hoTen: string;
  email: string;
  role: string;
  roleName?: string;
  avatar?:string
}

export const isAdmin = (user?: User | null): boolean => {
  return user?.roleName === ROLE_NAMES.ADMIN;
};

export const isSeller = (user?: User | null): boolean => {
  return user?.roleName === ROLE_NAMES.SELLER;
};

export const isBuyer = (user?: User | null): boolean => {
  return user?.roleName === ROLE_NAMES.BUYER;
};

export const hasAnyRole = (user: User | null, allowedRoles: RoleNames[]) => {
  if (!user || !user.roleName) return false;
  return allowedRoles.map(role => role.toUpperCase()).includes(user.roleName.toUpperCase());
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
      return PATHS.Buyer.DASHBOARD;
    default:
      return PATHS.Buyer.DASHBOARD;
  }
};
