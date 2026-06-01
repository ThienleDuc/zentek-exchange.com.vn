import AdminLayout from '../../../layouts/AdminLayout';
import AdminDashboard from '../../../pages/admin/AdminDashboard';
import UserManagement from '../../../pages/admin/UserManagement';
import ShopManagement from '../../../pages/admin/ShopManagement';
import ProductManagement from '../../../pages/admin/ProductManagement';
import ProductDetail from '../../../pages/admin/ProductDetail';
import MessageManagement from '../../../pages/admin/MessageManagement';
import { PATHS } from '../../../utils/path.utils';
import { ROLE_NAMES } from '../../../utils/role.utils';
import { type CustomRouteObject } from '../../types';

export const adminRoutes: CustomRouteObject[] = [
  {
    // Cắt bỏ phần đầu nếu cần, nhưng tốt nhất sử dụng path tương đối nếu có thể.
    // Vì AdminLayout là root của /admin, ta có thể config path như sau:
    path: PATHS.ADMIN.ROOT, 
    element: <AdminLayout />,
    isPublic: false,
    allowedRoles: [ROLE_NAMES.ADMIN],
    children: [
      {
        path: PATHS.ADMIN.DASHBOARD.replace(`${PATHS.ADMIN.ROOT}/`, ''),
        element: <AdminDashboard />
      },
      {
        path: PATHS.ADMIN.USER_MANAGEMENT.replace(`${PATHS.ADMIN.ROOT}/`, ''),
        element: <UserManagement />
      },
      {
        path: PATHS.ADMIN.SHOP_MANAGEMENT.replace(`${PATHS.ADMIN.ROOT}/`, ''),
        element: <ShopManagement />
      },
      {
        path: PATHS.ADMIN.PRODUCT_MANAGEMENT.replace(`${PATHS.ADMIN.ROOT}/`, ''),
        element: <ProductManagement />
      },
      {
        path: `${PATHS.ADMIN.PRODUCT_MANAGEMENT.replace(`${PATHS.ADMIN.ROOT}/`, '')}/:id`,
        element: <ProductDetail />
      },
      {
        path: PATHS.ADMIN.MESSAGE_MANAGEMENT.replace(`${PATHS.ADMIN.ROOT}/`, ''),
        element: <MessageManagement />
      }
    ]
  }
];
