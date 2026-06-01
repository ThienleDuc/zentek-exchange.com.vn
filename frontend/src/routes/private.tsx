import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { storage } from '../utils/storage.utils';
import { hasAnyRole } from '../utils/role.utils';
import type { RoleNames } from '../utils/role.utils';
import { PATHS, isPathAllowed } from '../utils/path.utils';
interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: RoleNames[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const location = useLocation();
  const user = storage.getUser();
  const token = storage.getToken();

  // 1. Kiểm tra đăng nhập
  if (!user || !token) {
    // Lưu lại vị trí hiện tại để quay lại sau khi đăng nhập
    return <Navigate to={PATHS.AUTH.LOGIN} state={{ from: location }} replace />;
  }

  // 2. Kiểm tra quyền truy cập (nếu có yêu cầu vai trò cụ thể)
  if (allowedRoles && !hasAnyRole(user, allowedRoles)) {
    // Nếu không có quyền, chuyển đến trang unauthorized
    return <Navigate to={PATHS.AUTH.UNAUTHORIZED} replace />;
  }

  // 3. Kiểm tra chi tiết đường dẫn (phân quyền động theo ROLE_ALLOWED_PATHS)
  const roleName = user.roleName || user.role;
  if (roleName && !isPathAllowed(roleName as RoleNames, location.pathname)) {
    return <Navigate to={PATHS.AUTH.UNAUTHORIZED} replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
