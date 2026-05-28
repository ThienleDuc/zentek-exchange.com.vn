import BuyerDashboard from '../../../pages/buyer/BuyerDashboard';
import BuyerProfileLayout from '../../../layouts/BuyerProfileLayout';
import ChatLayout from '../../../layouts/ChatLayout';
import BuyerChatPage from '../../../pages/chat/BuyerChatPage';
import MainLayout from '../../../layouts/MainLayout';
import { PATHS } from '../../../utils/path.utils';
import { ROLE_NAMES } from '../../../utils/role.utils';
import { type CustomRouteObject } from '../../types';

export const buyerRoutes: CustomRouteObject[] = [
  {
    path: PATHS.Buyer.ROOT,
    element: <BuyerProfileLayout />,
    isPublic: false,
    allowedRoles: [ROLE_NAMES.BUYER],
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
        element: <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">Tính năng Quản lý Đơn Mua đang được phát triển...</div>
      },
      {
        path: 'thong-bao',
        element: <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">Tính năng Thông báo đang được phát triển...</div>
      }
    ]
  },
  {
    path: PATHS.Buyer.MESSAGES,
    element: (
      <MainLayout>
        <ChatLayout />
      </MainLayout>
    ),
    isPublic: false,
    allowedRoles: [ROLE_NAMES.BUYER],
    children: [
      {
        path: '',
        element: <BuyerChatPage />
      }
    ]
  }
];
