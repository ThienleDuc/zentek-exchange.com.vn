import { authRoutes } from './features/auth/auth.routes';
import { adminRoutes } from './features/admin/admin.routes';
import { buyerRoutes } from './features/buyer/buyer.routes';
import { sellerRoutes } from './features/seller/seller.routes';
import { publicFeatureRoutes } from './features/public/public.routes';
import { type CustomRouteObject } from './types';

// Re-export type để tương thích ngược nếu các file khác đang import từ index.tsx
export type { CustomRouteObject };

const allRoutes: CustomRouteObject[] = [
  ...publicFeatureRoutes,
  ...authRoutes,
  ...adminRoutes,
  ...buyerRoutes,
  ...sellerRoutes
];

// Public routes (không cần đăng nhập)
export const publicRoutes = allRoutes.filter(route => route.isPublic === true);

// Private routes (cần đăng nhập)
export const privateRoutes = allRoutes.filter(route => route.isPublic === false);

export default allRoutes;