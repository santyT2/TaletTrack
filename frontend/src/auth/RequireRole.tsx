import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, type UserRole } from './AuthContext';

interface Props {
  allowed: UserRole[];
  redirectTo?: string;
  children?: ReactNode;
}

export default function RequireRole({ allowed, redirectTo, children }: Props) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowed.includes(user.role)) {
    const fallback = user.role === 'EMPLOYEE' ? '/portal' : '/dashboard';
    return <Navigate to={redirectTo ?? fallback} replace />;
  }

  if (children) {
    return <>{children}</>;
  }

  return <Outlet />;
}
