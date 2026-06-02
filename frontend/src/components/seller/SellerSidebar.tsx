import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Store, MessageSquare, LogOut, ChevronDown, User as UserIcon, Key } from 'lucide-react';
import { PATHS } from '../../utils/path.utils';
import { storage } from '../../utils/storage.utils';
import { type User } from '../../utils/role.utils';

const SellerSidebar: React.FC = () => {
  const navigate = useNavigate();
  const [user] = useState<User | null>(storage.getUser());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    storage.clearAuth();
    navigate(PATHS.AUTH.LOGIN);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    {
      title: 'Tổng quan',
      icon: <LayoutDashboard size={20} />,
      path: PATHS.Seller.DASHBOARD
    },
    {
      title: 'Quản lý Đơn hàng',
      icon: <ShoppingCart size={20} />,
      path: PATHS.Buyer.ORDERS
    },
    {
      title: 'Quản lý Sản phẩm',
      icon: <Package size={20} />,
      path: PATHS.Seller.PRODUCTS
    },
    {
      title: 'Hồ sơ Shop',
      icon: <Store size={20} />,
      path: PATHS.Seller.SHOP
    },
    {
      title: 'Khách hàng & Chat',
      icon: <MessageSquare size={20} />,
      path: PATHS.Seller.MESSAGES
    },
    {
      title: 'Đổi mật khẩu',
      icon: <Key size={20} />,
      path: PATHS.Buyer.DOI_MAT_KHAU
    }
  ];

  return (
    <div 
      className={`seller-sidebar-wrapper ${isExpanded ? 'expanded' : ''}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <aside className={`seller-sidebar-container ${isExpanded ? 'expanded' : ''}`}>
        {/* User Info Header */}
        <div className="seller-sidebar-user-section" ref={dropdownRef}>
          <div 
            className="seller-sidebar-user-header" 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="seller-sidebar-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" />
              ) : (
                <UserIcon size={20} />
              )}
            </div>
            <div className="seller-sidebar-user-info">
              <p className="seller-sidebar-username">{user?.fullName || user?.username || 'Seller'}</p>
              <p className="seller-sidebar-role">
                Xem thêm <ChevronDown size={14} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </p>
            </div>
          </div>

          {isDropdownOpen && (
            <div className="seller-sidebar-dropdown">
              <div className="seller-sidebar-dropdown-header">
                <p className="seller-sidebar-dropdown-name">{user?.fullName || user?.username || 'Seller'}</p>
                <p className="seller-sidebar-dropdown-email">{user?.email || 'seller@zentek.com'}</p>
                <p className="seller-sidebar-dropdown-role-badge">Quyền: Người bán</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Navigation */}
        <nav className="seller-sidebar-nav">
          <ul className="seller-sidebar-menu">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === PATHS.Seller.DASHBOARD}
                  className={({ isActive }) =>
                    `seller-sidebar-link ${isActive ? 'active' : ''}`
                  }
                >
                  {item.icon}
                  <span>{item.title}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Footer (Logout) */}
        <div className="seller-sidebar-footer">
          <button
            onClick={handleLogout}
            className="seller-sidebar-logout-btn"
          >
            <LogOut size={20} />
            <span className="seller-sidebar-logout-text">Đăng xuất</span>
          </button>
        </div>
      </aside>
    </div>
  );
};

export default SellerSidebar;
