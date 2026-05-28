import React from 'react';
import { Outlet } from 'react-router-dom';
import SellerSidebar from '../components/seller/SellerSidebar';
import Footer from '../components/common/Footer';

const SellerLayout: React.FC = () => {
  return (
    <div className="seller-layout-container">
      {/* Phần 1: Sidebar bên trái */}
      <SellerSidebar />
      
      {/* Phần 2: Container main chứa nội dung chính */}
      <div className="seller-layout-main-area">
        
        {/* Phần 2 main: Nội dung */}
        <main className="seller-layout-content-area">
          <div className="seller-layout-content-inner">
            <Outlet />
          </div>
        </main>

        {/* Phần 3 main: Footer */}
        <Footer variant="admin" />
      </div>
    </div>
  );
};

export default SellerLayout;
