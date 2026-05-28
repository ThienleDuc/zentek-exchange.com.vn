import Login from '../../../pages/auth/Login';
import Register from '../../../pages/auth/Register';
import RegisterSeller from '../../../pages/auth/RegisterSeller';
import { PATHS } from '../../../utils/path.utils';
import { type CustomRouteObject } from '../../types';

export const authRoutes: CustomRouteObject[] = [
  {
    path: PATHS.AUTH.LOGIN,
    element: <Login />,
    isPublic: true,
    isGuestOnly: true
  },
  {
    path: PATHS.AUTH.REGISTER,
    element: <Register />,
    isPublic: true,
    isGuestOnly: true
  },
  {
    path: PATHS.AUTH.REGISTER_SELLER,
    element: <RegisterSeller />,
    isPublic: true,
    isGuestOnly: true
  }
];
