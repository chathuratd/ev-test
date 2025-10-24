import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ReactNode } from 'react';
import { UserRole } from '../../types';

interface RoleBasedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

const RoleBasedRoute = ({ children, allowedRoles }: RoleBasedRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Check if user's role is in the allowed roles
  if (user && !allowedRoles.includes(user.Role as UserRole)) {
    // Redirect to stations page if user doesn't have access
    return <Navigate to="/stations" replace />;
  }

  return <>{children}</>;
};

export default RoleBasedRoute;
