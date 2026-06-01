import Home from '../../../pages/public/Home';
import Search from '../../../pages/public/Search';
import Stores from '../../../pages/public/Stores';
import ProductDetail from '../../../pages/admin/ProductDetail';
import MainLayout from '../../../layouts/MainLayout';
import { type CustomRouteObject } from '../../types';
import { PATHS } from '../../../utils/path.utils';

export const publicFeatureRoutes: CustomRouteObject[] = [
  {
    path: '/',
    element: (
      <MainLayout>
        <Home />
      </MainLayout>
    ),
    isPublic: true // Public path doesn't strictly need auth, it handles redirects itself
  },
  {
    path: PATHS.PUPLIC.SEARCH,
    element: (
      <MainLayout>
        <Search />
      </MainLayout>
    ),
    isPublic: true
  },
  {
    path: PATHS.PUPLIC.PRODUCTS,
    element: (
      <MainLayout>
        <Search />
      </MainLayout>
    ),
    isPublic: true
  },
  {
    path: PATHS.PUPLIC.STORES,
    element: (
      <MainLayout>
        <Stores />
      </MainLayout>
    ),
    isPublic: true
  },
  {
    path: PATHS.PUPLIC.PRODUCT_DETAIL,
    element: (
      <MainLayout>
        <ProductDetail />
      </MainLayout>
    ),
    isPublic: true
  }
];
