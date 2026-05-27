import { type RouteObject } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import RegisterSeller from '../pages/auth/RegisterSeller';
import { PATHS } from '../utils/path.utils';

export type CustomRouteObject = RouteObject & {
  isPublic?: boolean;
};

const allRoutes: CustomRouteObject[] = [
  {
    path: PATHS.AUTH.LOGIN,
    element: <Login />,
    isPublic: true
  },
  {
    path: PATHS.AUTH.REGISTER,
    element: <Register />,
    isPublic: true
  },
  {
    path: PATHS.AUTH.REGISTER_SELLER,
    element: <RegisterSeller />,
    isPublic: true
  }
];

// Public routes (không cần đăng nhập)
export const publicRoutes = allRoutes.filter(route => route.isPublic === true);

// Private routes (cần đăng nhập)
export const privateRoutes = allRoutes.filter(route => route.isPublic === false);

export default allRoutes;