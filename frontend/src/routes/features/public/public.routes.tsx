import Home from '../../../pages/public/Home';
import MainLayout from '../../../layouts/MainLayout';
import { type CustomRouteObject } from '../../types';

export const publicFeatureRoutes: CustomRouteObject[] = [
  {
    path: '/',
    element: (
      <MainLayout>
        <Home />
      </MainLayout>
    ),
    isPublic: true // Public path doesn't strictly need auth, it handles redirects itself
  }
];
