import { createContext, useState, useCallback, type ReactNode } from "react";
import {
  type User,
  type Permission,
  ROLE_PERMISSIONS,
  DEMO_USERS,
} from "./types";

/* ─── Re-exports so consumers can import from one place ─── */
export { DEMO_USERS };
export type { Permission };
export { useAuth } from "./useAuth";

/* ─── Context shape ─── */
export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  permissions: Permission[];
  login: (email: string, password: string) => boolean;
  logout: () => void;
  hasPermission: (p: Permission) => boolean;
  hasAnyPermission: (ps: Permission[]) => boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

/* ─── Provider ─── */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = sessionStorage.getItem("folat_auth_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const permissions: Permission[] = user
    ? ROLE_PERMISSIONS[user.role] ?? []
    : [];

  const login = useCallback((email: string, password: string): boolean => {
    const found = DEMO_USERS.find(
      (d) => d.email === email && d.password === password
    );
    if (found) {
      setUser(found.user);
      sessionStorage.setItem("folat_auth_user", JSON.stringify(found.user));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem("folat_auth_user");
  }, []);

  const hasPermission = useCallback(
    (p: Permission) => permissions.includes(p),
    [permissions]
  );

  const hasAnyPermission = useCallback(
    (ps: Permission[]) => ps.some((p) => permissions.includes(p)),
    [permissions]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        permissions,
        login,
        logout,
        hasPermission,
        hasAnyPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
