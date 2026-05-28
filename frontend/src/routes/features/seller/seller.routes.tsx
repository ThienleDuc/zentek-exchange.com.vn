import SellerDashboard from '../../../pages/seller/SellerDashboard';
import SellerLayout from '../../../layouts/SellerLayout';
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
        element: <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">Cài đặt Cửa hàng đang phát triển...</div>
      },
      {
        path: 'orders',
        element: <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">Tính năng Quản lý Đơn Hàng đang phát triển...</div>
      },
      {
        path: 'products',
        element: <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">Tính năng Quản lý Sản Phẩm đang phát triển...</div>
      }
    ]
  }
];
