import BuyerDashboard from '../../../pages/buyer/BuyerDashboard';
import BuyerProfileLayout from '../../../layouts/BuyerProfileLayout';
import MessageManagement from '../../../pages/admin/MessageManagement';
import TaiKhoanCaNhan from '../../../pages/buyer/TaiKhoanCaNhan';
import DoiMatKhau from '../../../pages/buyer/DoiMatKhau';
import DonMua from '../../../pages/buyer/DonMua';
import HoaDonBanHang from '../../../pages/buyer/HoaDonBanHang';
import Cart from '../../../pages/buyer/GioHang';
import Checkout from '../../../pages/buyer/ThanhToan';
import MainLayout from '../../../layouts/MainLayout';
import { PATHS } from '../../../utils/path.utils';
import { ROLE_NAMES } from '../../../utils/role.utils';
import { type CustomRouteObject } from '../../types';

export const buyerRoutes: CustomRouteObject[] = [
  {
    path: PATHS.Buyer.ROOT,
    element: <BuyerProfileLayout />,
    isPublic: false,
    allowedRoles: [ROLE_NAMES.BUYER, ROLE_NAMES.SELLER, ROLE_NAMES.ADMIN],
    children: [
      {
        index: true,
        element: <BuyerDashboard />
      },
      {
        path: 'dashboard',
        element: <BuyerDashboard />
      },
      {
        path: 'don-mua',
        element: <DonMua />
      },
      {
        path: 'hoa-don/:orderId',
        element: <HoaDonBanHang />
      },
      {
        path: 'thong-bao',
        element: <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">Tính năng Thông báo đang được phát triển...</div>
      },
      {
        path: 'thay-doi-thong-tin',
        element: <TaiKhoanCaNhan />
      },
      {
        path: 'doi-mat-khau',
        element: <DoiMatKhau />
      }
    ]
  },
  {
    path: '',
    element: <MainLayout />,
    isPublic: false,
    allowedRoles: [ROLE_NAMES.BUYER],
    children: [
      {
        path: PATHS.Buyer.CART,
        element: <Cart />
      },
      {
        path: PATHS.Buyer.CHECKOUT,
        element: <Checkout />
      },
      {
        path: PATHS.Buyer.MESSAGES,
        element: <MessageManagement />
      }
    ]
  }
];
