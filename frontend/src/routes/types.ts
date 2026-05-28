import { type RouteObject } from 'react-router-dom';
import { type RoleNames } from '../utils/role.utils';

export type CustomRouteObject = RouteObject & {
  isPublic?: boolean;
  isGuestOnly?: boolean;
  allowedRoles?: RoleNames[];
};
