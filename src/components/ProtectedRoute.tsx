import { Navigate, Outlet } from "react-router-dom";
import { useAuth, type Permission } from "../auth/AuthContext";

interface ProtectedRouteProps {
  /** If set, user must have at least one of these permissions */
  requiredPermissions?: Permission[];
  children?: React.ReactNode;
}

export default function ProtectedRoute({ requiredPermissions, children }: ProtectedRouteProps) {
  const { isAuthenticated, hasAnyPermission } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requiredPermissions && requiredPermissions.length > 0 && !hasAnyPermission(requiredPermissions)) {
    return <Navigate to="/access-denied" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
