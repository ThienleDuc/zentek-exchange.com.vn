import React from 'react';
import { Outlet } from 'react-router-dom';

const ChatLayout: React.FC = () => {
  return (
    <div className="flex h-full w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <Outlet />
    </div>
  );
};

export default ChatLayout;
