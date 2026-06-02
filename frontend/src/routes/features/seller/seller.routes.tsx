import SellerDashboard from '../../../pages/seller/SellerDashboard';
import SellerProfile from '../../../pages/seller/SellerProfile';
import SellerLayout from '../../../layouts/SellerLayout';
import MessageManagement from '../../../pages/admin/MessageManagement';
import ProductManagement from '../../../pages/admin/ProductManagement';
import ProductDetail from '../../../pages/admin/ProductDetail';
import { PATHS } from '../../../utils/path.utils';
import { ROLE_NAMES } from '../../../utils/role.utils';
import { type CustomRouteObject } from '../../types';

export const sellerRoutes: CustomRouteObject[] = [
  {
    path: PATHS.Seller.ROOT,
    element: <SellerLayout />,
    isPublic: false,
    allowedRoles: [ROLE_NAMES.SELLER],
    children: [
      {
        index: true,
        element: <SellerDashboard />
      },
      {
        path: 'dashboard',
        element: <SellerDashboard />
      },
      {
        path: 'cua-hang',
        element: <SellerProfile />
      },
      {
        path: 'chat',
        element: <MessageManagement />
      },
      {
        path: 'san-pham',
        element: <ProductManagement />
      },
      {
        path: 'san-pham/:id',
        element: <ProductDetail />
      }
    ]
  }
];
