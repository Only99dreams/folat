import {
  createContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import {
  type User,
  type UserRole,
  type Permission,
  ROLE_PERMISSIONS,
  ROLE_LABELS,
} from "./types";
import { supabase } from "../lib/supabase";
import type { Session } from "@supabase/supabase-js";

/* ─── Re-exports so consumers can import from one place ─── */
export type { Permission };
export { useAuth } from "./useAuth";

/* ─── Profile shape used by pages ─── */
export interface ProfileInfo {
  id: string;
  full_name: string;
  email: string;
  role: string;
  branch: string;
  branch_id: string;
  avatar_initials: string;
}

/* ─── Context shape ─── */
export interface AuthContextValue {
  user: User | null;
  profile: ProfileInfo | null;
  isAuthenticated: boolean;
  loading: boolean;
  permissions: Permission[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, fullName: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasPermission: (p: Permission) => boolean;
  hasAnyPermission: (ps: Permission[]) => boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

/* ─── Helper: build User from profile row ─── */
function buildUser(profile: {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  branch: string | null;
  avatar_initials: string | null;
}): User {
  return {
    id: profile.id,
    name: profile.full_name,
    email: profile.email,
    role: profile.role,
    roleLabel: ROLE_LABELS[profile.role] ?? profile.role,
    branch: profile.branch ?? "",
    avatar: profile.avatar_initials ?? profile.full_name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
  };
}

/* ─── Helper: fetch profile from Supabase ─── */
async function fetchProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, branch, avatar_initials")
    .eq("id", userId)
    .single();

  if (error || !data) return null;
  return buildUser(data as {
    id: string;
    full_name: string;
    email: string;
    role: UserRole;
    branch: string | null;
    avatar_initials: string | null;
  });
}

/* ─── Provider ─── */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /* Helper inside component to access setUser/setLoading */
  const handleSession = useCallback(async (session: Session | null) => {
    if (session?.user) {
      let profile = await fetchProfile(session.user.id);
      /* Fallback: build user from auth metadata if profile can't be loaded */
      if (!profile) {
        const meta = session.user.user_metadata ?? {};
        const fallbackName = (meta.full_name as string) || session.user.email?.split("@")[0] || "User";
        profile = buildUser({
          id: session.user.id,
          full_name: fallbackName,
          email: session.user.email ?? "",
          role: "unassigned" as UserRole,
          branch: null,
          avatar_initials: null,
        });
      }
      setUser(profile);
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  /* Listen for auth state changes (session restore, login, logout) */
  useEffect(() => {
    /* Restore session on mount */
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, [handleSession]);

  const permissions: Permission[] = useMemo(
    () => (user ? ROLE_PERMISSIONS[user.role] ?? [] : []),
    [user]
  );

  /* ─── Login ─── */
  const login = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ success: boolean; error?: string }> => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { success: false, error: error.message };

      /* Eagerly load profile so isAuthenticated is true before we return */
      if (data.user) {
        let profile = await fetchProfile(data.user.id);

        /* If profile doesn't exist yet, create one from auth metadata */
        if (!profile) {
          const meta = data.user.user_metadata ?? {};
          const fullName = (meta.full_name as string) || email.split("@")[0];
          const initials = fullName
            .split(" ")
            .map((w: string) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          await supabase.from("profiles").upsert({
            id: data.user.id,
            full_name: fullName,
            email: data.user.email ?? email,
            phone: (meta.phone as string) ?? "",
            role: "unassigned" as UserRole,
            branch: "",
            avatar_initials: initials,
          });
          profile = await fetchProfile(data.user.id);
        }

        /* Fallback: build user from auth metadata if profile still can't be loaded */
        if (!profile) {
          const meta = data.user.user_metadata ?? {};
          const fallbackName = (meta.full_name as string) || email.split("@")[0];
          profile = buildUser({
            id: data.user.id,
            full_name: fallbackName,
            email: data.user.email ?? email,
            role: "unassigned" as UserRole,
            branch: null,
            avatar_initials: null,
          });
        }

        setUser(profile);
      }

      return { success: true };
    },
    []
  );

  /* ─── Signup ─── */
  const signup = useCallback(
    async (
      email: string,
      password: string,
      fullName: string,
      phone?: string
    ): Promise<{ success: boolean; error?: string }> => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, phone: phone ?? "" },
        },
      });
      if (error) return { success: false, error: error.message };

      /* Create a profile row for the new user */
      if (data.user) {
        const initials = fullName
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();

        await supabase.from("profiles").upsert({
          id: data.user.id,
          full_name: fullName,
          email,
          phone: phone ?? "",
          role: "unassigned" as UserRole, // default role for new signups
          branch: "",
          avatar_initials: initials,
        });
      }

      return { success: true };
    },
    []
  );

  /* ─── Logout ─── */
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const hasPermission = useCallback(
    (p: Permission) => permissions.includes(p),
    [permissions]
  );

  const hasAnyPermission = useCallback(
    (ps: Permission[]) => ps.some((p) => permissions.includes(p)),
    [permissions]
  );

  const profile: ProfileInfo | null = useMemo(
    () =>
      user
        ? {
            id: user.id,
            full_name: user.name,
            email: user.email,
            role: user.role,
            branch: user.branch,
            branch_id: user.branch,
            avatar_initials: user.avatar,
          }
        : null,
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user,
        loading,
        permissions,
        login,
        signup,
        logout,
        hasPermission,
        hasAnyPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
