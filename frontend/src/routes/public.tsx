import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUserFromStorage, getDashboardPath } from '../utils/role.utils';

import type { RoleNames } from '../utils/role.utils';

import { storage } from '../utils/storage.utils';

interface PublicRouteProps {
  children: React.ReactNode;
  isGuestOnly?: boolean;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ 
  children,
  isGuestOnly = false
}) => {
  const isAuthenticated = !!storage.getToken();
  
  if (isAuthenticated && isGuestOnly) {
    const user = getUserFromStorage();
    
    const dashboardPath = getDashboardPath(user?.roleName as RoleNames);
    return <Navigate to={dashboardPath} replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;