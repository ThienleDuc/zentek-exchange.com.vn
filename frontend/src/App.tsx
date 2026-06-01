import { BrowserRouter as Router, useRoutes, type RouteObject } from "react-router-dom";
import { publicRoutes, privateRoutes } from "./routes";
import PublicRoute from "./routes/public";
import PrivateRoute from "./routes/private";
import { PATHS } from "./utils/path.utils";

const AppRoutes = () => {
  const routes: RouteObject[] = [
    // Public Routes
    ...publicRoutes.map(route => ({
      ...route,
      element: <PublicRoute isGuestOnly={route.isGuestOnly}>{route.element}</PublicRoute>
    })),
    
    // Private Routes
    ...privateRoutes.map(route => ({
      ...route,
      element: <PrivateRoute allowedRoles={route.allowedRoles}>{route.element}</PrivateRoute>
    })),


    // 404 Not Found
    { path: PATHS.AUTH.NOT_FOUND, element: <div>404 Not Found</div> }
  ];

  return useRoutes(routes);
};

const App = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;