import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

interface MainLayoutProps {
  children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const isChatPage = location.pathname.includes('/buyer/tin-nhan');

  return (
    <div className={isChatPage ? "flex flex-col h-screen overflow-hidden bg-gray-50" : "flex flex-col min-h-screen bg-gray-50"}>
      <Header />
      
      <main 
        className={
          isChatPage 
            ? "flex-grow min-h-0 w-full max-w-[1200px] mx-auto px-4 py-4 md:py-6 overflow-hidden" 
            : "main-layout-content"
        }
      >
        {isChatPage ? (
          <div className="h-full w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {children || <Outlet />}
          </div>
        ) : (
          children || <Outlet />
        )}
      </main>

      {!isChatPage && <Footer variant="default" />}
    </div>
  );
};

export default MainLayout;
