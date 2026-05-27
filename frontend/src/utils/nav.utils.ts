import {ROLE_NAMES, type RoleNames } from "./role.utils";
import { PATHS } from "./path.utils";

export interface NavItem {
  path: string;
  label: string;
  icon: string;
}

/**
 * Định nghĩa tất cả các mục menu khả dụng
 */
export const NAV_ITEMS = {

} as const;

export const ROLE_NAV_ITEMS: Record<RoleNames, NavItem[]> = {
  [ROLE_NAMES.ADMIN]: [

  ],
  [ROLE_NAMES.SELLER]: [

  ],
  [ROLE_NAMES.BUYER]: [

  ]
};

/**
 * Lấy danh sách menu dựa trên vai trò
 */
export const getNavItemsByRole = (role: RoleNames | undefined): NavItem[] => {
  if (!role) return [];
  return ROLE_NAV_ITEMS[role] || [];
};
