import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import MainLayout from './MainLayout';
import BuyerSidebar from '../components/buyer/BuyerSidebar';
import SellerSidebar from '../components/seller/SellerSidebar';
import AdminSidebar from '../components/admin/AdminSidebar';
import Footer from '../components/common/Footer';
import { storage } from '../utils/storage.utils';
import { isSeller, isAdmin } from '../utils/role.utils';

const BuyerProfileLayout: React.FC = () => {
  const user = storage.getUser();
  const location = useLocation();

  if (isSeller(user)) {
    const isChatPage = location.pathname.includes('/seller/chat');
    return (
      <div className="seller-layout-container">
        <SellerSidebar />
        <div className="seller-layout-main-area relative">
          <main className={`seller-layout-content-area ${isChatPage ? '!p-0' : ''}`}>
            <div className={`seller-layout-content-inner ${isChatPage ? '!p-0 !border-none !shadow-none h-full' : ''}`}>
              <Outlet />
            </div>
          </main>
          {!isChatPage && <Footer variant="admin" />}
        </div>
      </div>
    );
  }

  if (isAdmin(user)) {
    const isChatPage = location.pathname.includes('/admin/messages');
    return (
      <div className="admin-layout-container">
        <AdminSidebar />
        <div className="admin-layout-main-area relative">
          <main className={`admin-layout-content-area ${isChatPage ? '!p-0' : ''}`}>
            <div className="admin-layout-content-inner h-full">
              <Outlet />
            </div>
          </main>
          {!isChatPage && <Footer variant="admin" />}
        </div>
      </div>
    );
  }

  // Mặc định cho Buyer
  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-[1200px] mx-auto px-4 flex gap-6">
          <BuyerSidebar />
          
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </MainLayout>
  );
};

export default BuyerProfileLayout;
