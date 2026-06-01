import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import Footer from '../components/common/Footer';

const AdminLayout = () => {
  const location = useLocation();
  const isChatPage = location.pathname.includes('/admin/messages');

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
