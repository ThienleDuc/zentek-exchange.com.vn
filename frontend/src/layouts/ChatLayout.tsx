import React from 'react';
import { Outlet } from 'react-router-dom';

const ChatLayout: React.FC = () => {
  return (
    <div className="flex h-full w-full bg-surface rounded-xl shadow-sm border border-border-default overflow-hidden">
      <Outlet />
    </div>
  );
};

export default ChatLayout;
