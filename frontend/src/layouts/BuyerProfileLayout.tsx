import React from 'react';
import { Outlet } from 'react-router-dom';
import MainLayout from './MainLayout';
import BuyerSidebar from '../components/buyer/BuyerSidebar';

const BuyerProfileLayout: React.FC = () => {
  return (
    <MainLayout>
      <div className="bg-background min-h-screen py-8">
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
