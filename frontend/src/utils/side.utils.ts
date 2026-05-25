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
export const SIDE_ITEMS = {

} as const;

/**
 * Phân quyền hiển thị menu theo vai trò
 */
export const ROLE_SIDE_ITEMS: Record<RoleNames, NavItem[]> = {
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
export const getSideItemsByRole = (role: RoleNames | undefined): NavItem[] => {
  if (!role) return [];
  return ROLE_SIDE_ITEMS[role] || [];
};
