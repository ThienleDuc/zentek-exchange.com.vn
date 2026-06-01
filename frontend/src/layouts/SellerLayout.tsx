import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SellerSidebar from '../components/seller/SellerSidebar';
import Footer from '../components/common/Footer';

const SellerLayout: React.FC = () => {
  const location = useLocation();
  const isChatPage = location.pathname.includes('/seller/chat');

  return (
    <div className="seller-layout-container">
      {/* Phần 1: Sidebar bên trái */}
      <SellerSidebar />
      
      {/* Phần 2: Container main chứa nội dung chính */}
      <div className="seller-layout-main-area relative">
        
        {/* Phần 2 main: Nội dung */}
        <main className={`seller-layout-content-area ${isChatPage ? '!p-0' : ''}`}>
          <div className={`seller-layout-content-inner ${isChatPage ? '!p-0 !border-none !shadow-none h-full' : ''}`}>
            <Outlet />
          </div>
        </main>

        {/* Phần 3 main: Footer */}
        {!isChatPage && <Footer variant="admin" />}
      </div>
    </div>
  );
};

export default SellerLayout;
