import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import SellerSidebar from '../components/seller/SellerSidebar';
import Footer from '../components/common/Footer';
import { storage } from '../utils/storage.utils';
import { isSeller } from '../utils/role.utils';

const AdminLayout = () => {
  const location = useLocation();
  const isChatPage = location.pathname.includes('/admin/messages');
  const user = storage.getUser();

  if (isSeller(user)) {
    const isSellerChat = location.pathname.includes('/seller/chat');
    return (
      <div className="seller-layout-container">
        <SellerSidebar />
        <div className="seller-layout-main-area relative">
          <main className={`seller-layout-content-area ${isSellerChat ? '!p-0' : ''}`}>
            <div className={`seller-layout-content-inner ${isSellerChat ? '!p-0 !border-none !shadow-none h-full' : ''}`}>
              <Outlet />
            </div>
          </main>
          {!isSellerChat && <Footer variant="admin" />}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout-container">
      {/* Phần 1: Sidebar bên trái */}
      <AdminSidebar />
      
      {/* Phần 2: Container main chứa nội dung chính */}
      <div className="admin-layout-main-area relative">
        
        {/* Phần 2 main: Nội dung */}
        <main className={`admin-layout-content-area ${isChatPage ? '!p-0' : ''}`}>
          <div className="admin-layout-content-inner h-full">
            <Outlet />
          </div>
        </main>

        {/* Phần 3 main: Footer */}
        {!isChatPage && <Footer variant="admin" />}
      </div>
    </div>
  );
};

export default AdminLayout;
