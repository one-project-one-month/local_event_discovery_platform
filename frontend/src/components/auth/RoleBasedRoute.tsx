import { Navigate, useLocation } from 'react-router-dom';
import type { UserInfo } from '../../services/api';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'support')[];
}

export default function RoleBasedRoute({
  children,
  allowedRoles = ['admin', 'support'],
}: RoleBasedRouteProps) {
  const location = useLocation();

  // Get user info from localStorage
  const userInfoString = localStorage.getItem('userInfo');
  const userInfo: UserInfo | null = userInfoString ? JSON.parse(userInfoString) : null;

  // Check if user is authenticated
  if (!userInfo || !localStorage.getItem('userToken')) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (!allowedRoles.includes(userInfo.role as 'admin' | 'support')) {
    // If support user tries to access restricted page, redirect to dashboard
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
}
