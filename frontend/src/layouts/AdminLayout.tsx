import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import Footer from '../components/common/Footer';

const AdminLayout = () => {
  return (
    <div className="admin-layout-container">
      {/* Phần 1: Sidebar bên trái */}
      <AdminSidebar />
      
      {/* Phần 2: Container main chứa nội dung chính */}
      <div className="admin-layout-main-area">
        
        {/* Phần 2 main: Nội dung */}
        <main className="admin-layout-content-area">
          <div className="admin-layout-content-inner">
            <Outlet />
          </div>
        </main>

        {/* Phần 3 main: Footer */}
        <Footer variant="admin" />
      </div>
    </div>
  );
};

export default AdminLayout;
