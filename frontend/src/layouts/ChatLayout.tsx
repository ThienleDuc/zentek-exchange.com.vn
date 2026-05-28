import React from 'react';
import { Outlet } from 'react-router-dom';

const ChatLayout: React.FC = () => {
  return (
    <div className="flex h-[calc(100vh-160px)] min-h-[500px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <Outlet />
    </div>
  );
};

export default ChatLayout;
