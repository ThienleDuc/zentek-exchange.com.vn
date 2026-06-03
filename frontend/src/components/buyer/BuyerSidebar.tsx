import React, { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { User, ClipboardList, Bell, MessageCircle, Edit3 } from 'lucide-react';
import { getUserFromStorage, type User as UserType } from '../../utils/role.utils';
import { PATHS } from '../../utils/path.utils';
import { getUserAvatarUrl } from '../../utils/image.utils';
import { chatAdminService } from '../../services/chatAdmin.service';

const BuyerSidebar: React.FC = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [unreadChatCount, setUnreadChatCount] = useState<number>(0);

  useEffect(() => {
    setUser(getUserFromStorage());
    
    const handleUserUpdate = () => {
      setUser(getUserFromStorage());
    };
    window.addEventListener('user-updated', handleUserUpdate);

    const fetchChatData = async () => {
      try {
        const conversations = await chatAdminService.getConversations('all');
        if (Array.isArray(conversations)) {
          const totalUnread = conversations.reduce((sum: number, c: any) => sum + (c.unreadCount || 0), 0);
          setUnreadChatCount(totalUnread);
        }
      } catch (err) {
        console.error('Lỗi khi tải tin nhắn ở buyer sidebar:', err);
      }
    };

    fetchChatData();
    const interval = setInterval(fetchChatData, 15000); // Poll every 15s

    window.addEventListener('chat-updated', fetchChatData);

    return () => {
      clearInterval(interval);
      window.removeEventListener('chat-updated', fetchChatData);
      window.removeEventListener('user-updated', handleUserUpdate);
    };
  }, []);

  return (
    <aside className="buyer-sidebar w-[250px] shrink-0">
      {/* Profile summary */}
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 border border-gray-200">
          {user?.avatar ? (
            <img src={getUserAvatarUrl(user.avatar)} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gray-100">
              <User size={24} />
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-gray-800 truncate w-32" title={user?.fullName || user?.username}>
            {user?.fullName || user?.username || 'Khách hàng'}
          </span>
          <Link to={PATHS.Buyer.TAI_KHOAN_CA_NHAN} className="text-sm text-gray-500 hover:text-primary flex items-center gap-1 mt-0.5">
            <Edit3 size={12} /> Sửa hồ sơ
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        <NavLink 
          to={PATHS.Buyer.DASHBOARD}
          end
          className={({ isActive }) => 
            `buyer-nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive ? 'text-primary bg-primary/5' : 'text-gray-600 hover:text-primary hover:bg-gray-50'
            }`
          }
        >
          <User size={18} className="text-blue-500" />
          Tài khoản cá nhân
        </NavLink>
        
        <NavLink 
          to={PATHS.Buyer.ORDERS}
          className={({ isActive }) => 
            `buyer-nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive ? 'text-primary bg-primary/5' : 'text-gray-600 hover:text-primary hover:bg-gray-50'
            }`
          }
        >
          <ClipboardList size={18} className="text-emerald-500" />
          Đơn mua
        </NavLink>

        <NavLink 
          to={PATHS.Buyer.MESSAGES}
          className={({ isActive }) => 
            `buyer-nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive ? 'text-primary bg-primary/5' : 'text-gray-600 hover:text-primary hover:bg-gray-50'
            }`
          }
        >
          <div className="relative flex items-center justify-center">
            <MessageCircle size={18} className="text-blue-400" />
            {unreadChatCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                {unreadChatCount}
              </span>
            )}
          </div>
          Tin nhắn
        </NavLink>

        <NavLink 
          to={PATHS.Buyer.NOTIFICATIONS}
          className={({ isActive }) => 
            `buyer-nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive ? 'text-primary bg-primary/5' : 'text-gray-600 hover:text-primary hover:bg-gray-50'
            }`
          }
        >
          <Bell size={18} className="text-orange-500" />
          Thông báo
        </NavLink>
      </nav>
    </aside>
  );
};

export default BuyerSidebar;
