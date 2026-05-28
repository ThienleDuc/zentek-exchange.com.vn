import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../../utils/storage.utils';
import { getDashboardPath } from '../../utils/role.utils';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const user = storage.getUser();
  const token = storage.getToken();

  useEffect(() => {
    if (user && token && user.roleName) {
      const dashboardPath = getDashboardPath(user.roleName as any);
      navigate(dashboardPath, { replace: true });
    }
  }, [user, token, navigate]);

  if (user && token && user.roleName) {
    return null; // Tránh render nháy trang trong lúc chờ redirect
  }

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">ZenTek Exchange</h1>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl">
        Nền tảng thương mại điện tử chuyên biệt dành cho các sản phẩm đồ điện tử, linh kiện công nghệ. 
        Khám phá ngay hàng nghìn sản phẩm chất lượng hoặc trở thành nhà bán hàng cùng chúng tôi.
      </p>
    </div>
  );
};

export default Home;
