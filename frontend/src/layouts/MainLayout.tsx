import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

interface MainLayoutProps {
  children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      {/* Vùng nội dung chính, cách 2 bên tương tự Header/Footer (max-w-[1200px]) */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 py-8">
        {children || <Outlet />}
      </main>

      <Footer variant="default" />
    </div>
  );
};

export default MainLayout;
