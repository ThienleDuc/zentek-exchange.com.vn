import { type RouteObject } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

export type CustomRouteObject = RouteObject & {
  isPublic?: boolean;
};

const allRoutes: CustomRouteObject[] = [
  {
    path: '/login',
    element: <Login />,
    isPublic: true
  },
  {
    path: '/register',
    element: <Register />,
    isPublic: true
  }
  // Các Private Routes sẽ thêm sau với `isPublic: false`
];

// Public routes (không cần đăng nhập)
export const publicRoutes = allRoutes.filter(route => route.isPublic === true);

// Private routes (cần đăng nhập)
export const privateRoutes = allRoutes.filter(route => route.isPublic === false);

export default allRoutes;