import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth, type Permission } from "../auth/AuthContext";

interface ProtectedRouteProps {
  /** If set, user must have at least one of these permissions */
  requiredPermissions?: Permission[];
  children?: React.ReactNode;
}

export default function ProtectedRoute({ requiredPermissions, children }: ProtectedRouteProps) {
  const { user, isAuthenticated, loading, hasAnyPermission } = useAuth();
  const location = useLocation();

  if (loading) return null; // still resolving session

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Unassigned users can only access /dashboard
  if (user?.role === "unassigned" && location.pathname !== "/dashboard") {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredPermissions && requiredPermissions.length > 0 && !hasAnyPermission(requiredPermissions)) {
    return <Navigate to="/access-denied" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
