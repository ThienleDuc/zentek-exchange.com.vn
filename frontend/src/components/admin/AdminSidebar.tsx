import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { PATHS } from '../../utils/path.utils';
import { LayoutDashboard, Users, Store, Package, LogOut, ChevronDown, User as UserIcon, MessageSquare } from 'lucide-react';
import { storage } from '../../utils/storage.utils';
import { type User } from '../../utils/role.utils';

const AdminSidebar = () => {
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
      title: 'Thống kê',
      path: PATHS.ADMIN.DASHBOARD,
      icon: <LayoutDashboard size={20} />,
    },
    {
      title: 'Quản lý người dùng',
      path: PATHS.ADMIN.USER_MANAGEMENT,
      icon: <Users size={20} />,
    },
    {
      title: 'Quản lý cửa hàng',
      path: PATHS.ADMIN.SHOP_MANAGEMENT,
      icon: <Store size={20} />,
    },
    {
      title: 'Quản lý sản phẩm',
      path: PATHS.ADMIN.PRODUCT_MANAGEMENT,
      icon: <Package size={20} />,
    },
    {
      title: 'Quản lý tin nhắn',
      path: PATHS.ADMIN.MESSAGE_MANAGEMENT,
      icon: <MessageSquare size={20} />,
    },
  ];

  return (
    <div 
      className={`admin-sidebar-wrapper ${isExpanded ? 'expanded' : ''}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <aside className={`admin-sidebar-container ${isExpanded ? 'expanded' : ''}`}>
        {/* User Info Header */}
        <div className="admin-sidebar-user-section" ref={dropdownRef}>
          <div 
            className="admin-sidebar-user-header" 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="admin-sidebar-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" />
              ) : (
                <UserIcon size={20} />
              )}
            </div>
            <div className="admin-sidebar-user-info">
              <p className="admin-sidebar-username">{user?.fullName || user?.username || 'Admin'}</p>
              <p className="admin-sidebar-role">
                Xem thêm <ChevronDown size={14} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </p>
            </div>
          </div>

          {isDropdownOpen && (
            <div className="admin-sidebar-dropdown">
              <div className="admin-sidebar-dropdown-header">
                <p className="admin-sidebar-dropdown-name">{user?.fullName || user?.username || 'Admin'}</p>
                <p className="admin-sidebar-dropdown-email">{user?.email || 'admin@zentek.com'}</p>
                <p className="admin-sidebar-dropdown-role-badge">Quyền: Quản trị viên</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Navigation */}
        <nav className="admin-sidebar-nav">
          <ul className="admin-sidebar-menu">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `admin-sidebar-link ${isActive ? 'active' : ''}`
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
        <div className="admin-sidebar-footer">
          <button
            onClick={handleLogout}
            className="admin-sidebar-logout-btn"
          >
            <LogOut size={20} />
            <span className="admin-sidebar-logout-text">Đăng xuất</span>
          </button>
        </div>
      </aside>
    </div>
  );
};

export default AdminSidebar;
