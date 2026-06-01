import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { PATHS } from '../../utils/path.utils';
import { storage } from '../../utils/storage.utils';
import { isBuyer, isSeller, type User } from '../../utils/role.utils';
import { User as UserIcon, LogOut, Store, ShoppingBag, ChevronDown, Search, ShoppingCart, X } from 'lucide-react';
import CategoryNav from './CategoryNav';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(storage.getUser());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi chuyển trang
  useEffect(() => {
    setIsDropdownOpen(false);
  }, [location.pathname]);

  // Đồng bộ ô tìm kiếm với query URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('q') || '';
    if (location.pathname === PATHS.PUPLIC.SEARCH) {
      setSearchQuery(query);
    } else {
      setSearchQuery('');
    }
  }, [location.pathname, location.search]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`${PATHS.PUPLIC.SEARCH}?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      if (location.pathname === PATHS.PUPLIC.SEARCH) {
        const searchParams = new URLSearchParams(location.search);
        searchParams.delete('q');
        const searchStr = searchParams.toString();
        navigate(`${PATHS.PUPLIC.SEARCH}${searchStr ? `?${searchStr}` : ''}`, { replace: true });
      } else {
        navigate(PATHS.PUPLIC.SEARCH);
      }
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    if (location.pathname === PATHS.PUPLIC.SEARCH) {
      const searchParams = new URLSearchParams(location.search);
      searchParams.delete('q');
      const searchStr = searchParams.toString();
      navigate(`${PATHS.PUPLIC.SEARCH}${searchStr ? `?${searchStr}` : ''}`, { replace: true });
    }
  };

  const containerClass = "max-w-[1200px] mx-auto px-4";

  // Cập nhật state nếu storage thay đổi
  useEffect(() => {
    const handleStorageChange = () => {
      setUser(storage.getUser());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    storage.clearAuth();
    setUser(null);
    navigate(PATHS.AUTH.LOGIN);
  };

  return (
    <header className="header-container shadow-sm border-b sticky top-0 z-50 bg-white border-gray-200">
      <div className={containerClass}>
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <div className="flex items-center justify-center w-10 h-10 bg-primary border border-primary-hover rounded-lg text-white font-bold text-xl shadow-sm">
                Z
              </div>
              <span className="text-2xl font-bold text-primary">
                ZenTek
              </span>
            </Link>
          </div>

          {/* Thanh tìm kiếm */}
          <div className="flex-1 max-w-2xl mx-8 hidden md:block">
            <form onSubmit={handleSearchSubmit} className="flex items-stretch border-2 border-primary rounded-lg overflow-hidden bg-white relative">
              <input 
                type="text" 
                placeholder="Tìm kiếm sản phẩm, thương hiệu..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 pl-4 pr-12 py-2 bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none border-none min-w-0"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-20 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none border-none bg-transparent cursor-pointer p-1"
                >
                  <X size={18} />
                </button>
              )}
              <button type="submit" className="bg-primary px-6 text-white hover:bg-primary-hover transition-colors flex items-center justify-center border-none cursor-pointer !rounded-none">
                <Search size={20} />
              </button>
            </form>
          </div>

          {/* Navigation & Auth */}
          <div className="flex items-center gap-6">
            {/* Giỏ hàng (chỉ hiện khi KHÔNG phải seller) */}
            {(!user || !isSeller(user)) && (
              <Link to={PATHS.Buyer.CART} className="relative text-gray-600 hover:text-primary transition-colors mr-2">
                <ShoppingCart size={26} />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                  0
                </span>
              </Link>
            )}

            {!user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={PATHS.AUTH.REGISTER}
                  className="text-gray-700 hover:text-primary hover:bg-primary/5 font-medium px-4 py-2 rounded-lg transition-all border border-transparent"
                >
                  Đăng ký
                </Link>
                <Link
                  to={PATHS.AUTH.LOGIN}
                  className="btn-login font-medium px-5 py-2 rounded-lg shadow-sm flex items-center justify-center"
                >
                  Đăng nhập
                </Link>
              </div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 focus:outline-none p-2 rounded-md transition-colors hover:bg-gray-50"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 overflow-hidden border border-blue-200">
                    {user.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon size={16} />
                    )}
                  </div>
                  <span className="text-sm font-medium hidden sm:block text-gray-700">
                    {user.fullName || user.username}
                  </span>
                  <ChevronDown size={16} className={`text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg border py-1 overflow-hidden z-50 bg-white border-gray-100">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm leading-5 font-medium truncate text-gray-900">{user.fullName}</p>
                      <p className="text-xs leading-5 truncate text-gray-500">{user.email}</p>
                    </div>

                    <Link
                      to={isBuyer(user) ? PATHS.Buyer.DASHBOARD : (isSeller(user) ? PATHS.Seller.DASHBOARD : PATHS.AUTH.PROFILE)}
                      className="flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-gray-50 text-gray-700"
                      onClick={() => setTimeout(() => setIsDropdownOpen(false), 0)}
                    >
                      <UserIcon size={16} className="text-gray-400 pointer-events-none" />
                      Trang cá nhân
                    </Link>

                    {isBuyer(user) && (
                      <Link
                        to={PATHS.Buyer.ORDERS}
                        className="flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-gray-50 text-gray-700"
                        onClick={() => setTimeout(() => setIsDropdownOpen(false), 0)}
                      >
                        <ShoppingBag size={16} className="text-gray-400 pointer-events-none" />
                        Đơn mua
                      </Link>
                    )}

                    {isSeller(user) && (
                      <Link
                        to={PATHS.Seller.SHOP}
                        className="flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-gray-50 text-gray-700"
                        onClick={() => setTimeout(() => setIsDropdownOpen(false), 0)}
                      >
                        <Store size={16} className="text-gray-400 pointer-events-none" />
                        Cửa hàng của tôi
                      </Link>
                    )}

                    <div className="border-t mt-1 border-gray-100">
                      <button
                        onClick={() => {
                          setTimeout(() => setIsDropdownOpen(false), 0);
                          handleLogout();
                        }}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm transition-colors text-red-600 hover:bg-red-50"
                      >
                        <LogOut size={16} className="text-red-500 pointer-events-none" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <CategoryNav />
    </header>
  );
};

export default Header;
