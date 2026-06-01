import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { getUserFromStorage, isBuyer } from '../../utils/role.utils';
import { PUBLIC_NAV_ITEMS, BUYER_NAV_ITEMS } from '../../utils/nav.utils';

// Định nghĩa interface cho Danh Mục (trùng với DB + API)
export interface Category {
  MaDanhMuc: string;
  TenDanhMuc: string;
  MoTa: string;
  DanhMucChaId: string | null;
  Icon: string;
  ThuTuHienThi: number;
  children?: Category[];
}

// Component helper để render icon động từ lucide-react
const DynamicIcon = ({ iconName, size = 20 }: { iconName: string; size?: number }) => {
  const IconComponent = (Icons as any)[iconName] || Icons.Box; // Fallback là Box icon
  return <IconComponent size={size} />;
};

const CategoryNav: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = getUserFromStorage();
  const isUserBuyer = isBuyer(currentUser);
  const navItems = isUserBuyer ? BUYER_NAV_ITEMS : PUBLIC_NAV_ITEMS;

  const renderNavIcon = (iconName: string, className?: string) => {
    const IconComponent = (Icons as any)[iconName];
    if (!IconComponent) return null;
    return <IconComponent size={16} className={className} />;
  };

  useEffect(() => {
    // Gọi API lấy danh sách danh mục (dạng tree)
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/categories?format=tree');
        const data = await response.json();
        if (data.success) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error('Lỗi khi fetch danh mục:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <nav className="category-nav-skeleton bg-white border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-4 h-12 flex items-center gap-6">
          <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="category-nav bg-white border-b border-gray-200 relative z-50 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-4 h-[48px] flex items-center justify-between relative">
          
          {/* Nút Danh Mục Sản Phẩm (Nổi bật) */}
          <div className="category-dropdown-wrapper h-full flex items-center static">
            <div className="category-dropdown-trigger flex items-center gap-2 font-medium text-gray-800 hover:text-blue-600 cursor-pointer h-full px-2 -ml-2">
              <Icons.Menu size={20} />
              <span>Danh mục sản phẩm</span>
              <Icons.ChevronDown size={16} className="text-gray-500" />
            </div>
            
            {/* Menu thả xuống chứa tất cả danh mục */}
            {/* left-4 right-4 để căn đúng phần content bên trong container padding px-4 */}
            <div className="category-dropdown-menu absolute top-[48px] left-4 right-4 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-gray-100 border-t-[3px] border-t-blue-500 rounded-b-2xl hidden">
              <div className="flex relative w-full">
                
                {/* Cột trái: Danh mục cấp 1 */}
                <ul className="w-1/4 border-r border-gray-100 bg-gray-50/50 py-2">
                {categories.map((cat) => (
                  <li key={cat.MaDanhMuc} className="category-item-level1 group static">
                    <div 
                      onClick={() => navigate(`/search?category=${cat.MaDanhMuc}`)}
                      className="flex items-center justify-between px-4 py-3 hover:bg-white hover:text-blue-600 hover:shadow-sm cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <DynamicIcon iconName={cat.Icon} size={18} />
                        <span className="font-medium text-sm">{cat.TenDanhMuc}</span>
                      </div>
                      <Icons.ChevronRight size={16} className="text-gray-400 group-hover:text-blue-600" />
                    </div>
                    
                    {/* Panel phải: Danh mục cấp 2 (Hiển thị khi hover vào cấp 1) */}
                    {cat.children && cat.children.length > 0 && (
                      <div className="category-submenu absolute top-0 left-1/4 w-3/4 min-h-full bg-white p-6 hidden group-hover:block z-50 shadow-[4px_0_16px_rgba(0,0,0,0.04)] border-l border-gray-100 rounded-br-2xl">
                        <h3 
                          onClick={() => navigate(`/search?category=${cat.MaDanhMuc}`)}
                          className="font-semibold text-lg text-gray-900 mb-4 pb-2 border-b border-gray-100 cursor-pointer hover:text-blue-600 transition-colors"
                        >
                          {cat.TenDanhMuc}
                        </h3>
                        <div className="grid grid-cols-3 gap-x-8 gap-y-4">
                          {cat.children.map(child => (
                            <Link 
                              key={child.MaDanhMuc} 
                              to={`/search?category=${child.MaDanhMuc}`}
                              className="text-gray-600 hover:text-blue-600 text-sm py-1 transition-colors flex items-center gap-2"
                            >
                              {child.TenDanhMuc}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Các liên kết nhanh (Ngang) */}
        <div className="flex items-center gap-8 h-full">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className="text-gray-600 hover:text-primary text-sm font-medium transition-colors flex items-center gap-1.5"
            >
              {renderNavIcon(item.icon, item.color)} {item.label}
            </Link>
          ))}
        </div>

      </div>
    </nav>
    <div className="category-overlay fixed inset-0 bg-black/50 z-40 hidden transition-opacity"></div>
    </>
  );
};

export default CategoryNav;
