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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-navy-900 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Unassigned users can only access /dashboard and /code-of-conduct
  if (user?.role === "unassigned" && location.pathname !== "/dashboard" && location.pathname !== "/code-of-conduct") {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredPermissions && requiredPermissions.length > 0 && !hasAnyPermission(requiredPermissions)) {
    return <Navigate to="/access-denied" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
