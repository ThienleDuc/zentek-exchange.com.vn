import { ROLE_NAMES, type RoleNames } from "./role.utils";
import { PATHS } from "./path.utils";

export interface NavItem {
  path: string;
  label: string;
  icon: string;
  color?: string;
}

export const PUBLIC_NAV_ITEMS: NavItem[] = [
  { path: PATHS.PUPLIC.HOME, label: 'Trang chủ', icon: 'Home', color: 'text-primary' },
  { path: PATHS.PUPLIC.PRODUCTS, label: 'Tất cả sản phẩm', icon: 'ShoppingBag', color: 'text-secondary' },
  { path: PATHS.PUPLIC.STORES, label: 'Khám phá cửa hàng', icon: 'Store', color: 'text-accent' },
  { path: '/chat', label: 'Chat cộng đồng', icon: 'MessageCircle', color: 'text-info' }
];

export const BUYER_NAV_ITEMS: NavItem[] = [
  { path: PATHS.PUPLIC.HOME, label: 'Trang chủ', icon: 'Home', color: 'text-primary' },
  { path: PATHS.PUPLIC.SEARCH, label: 'Tìm kiếm', icon: 'Search', color: 'text-secondary' },
  { path: PATHS.PUPLIC.STORES, label: 'Khám phá cửa hàng', icon: 'Store', color: 'text-accent' },
  { path: `${PATHS.Buyer.MESSAGES}?community=true`, label: 'Chat cộng đồng', icon: 'MessageCircle', color: 'text-info' }
];

export const ROLE_NAV_ITEMS: Record<RoleNames, NavItem[]> = {
  [ROLE_NAMES.ADMIN]: [],
  [ROLE_NAMES.SELLER]: [],
  [ROLE_NAMES.BUYER]: BUYER_NAV_ITEMS
};

/**
 * Lấy danh sách menu dựa trên vai trò
 */
export const getNavItemsByRole = (role: RoleNames | undefined): NavItem[] => {
  if (!role) return PUBLIC_NAV_ITEMS;
  return ROLE_NAV_ITEMS[role] || PUBLIC_NAV_ITEMS;
};
