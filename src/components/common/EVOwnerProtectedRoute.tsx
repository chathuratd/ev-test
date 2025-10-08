import { Navigate } from 'react-router-dom';

interface EVOwnerProtectedRouteProps {
  children: React.ReactNode;
}

const EVOwnerProtectedRoute: React.FC<EVOwnerProtectedRouteProps> = ({ children }) => {
  const evOwnerNic = localStorage.getItem('evOwnerNic') || localStorage.getItem('userNic');
  
  if (!evOwnerNic) {
    return <Navigate to="/ev-owner-login" replace />;
  }

  return <>{children}</>;
};

export default EVOwnerProtectedRoute;