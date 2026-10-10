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
import { isEmailAllowed } from "../lib/emailValidation";
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
  avatar_url?: string;
}

/* ─── Context shape ─── */
export interface AuthContextValue {
  user: User | null;
  profile: ProfileInfo | null;
  isAuthenticated: boolean;
  loading: boolean;
  permissions: Permission[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, fullName: string, phone?: string, role?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasPermission: (p: Permission) => boolean;
  hasAnyPermission: (ps: Permission[]) => boolean;
  refreshProfile: () => Promise<void>;
  acceptCodeOfConduct: () => Promise<void>;
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
  avatar_url?: string | null;
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
    avatarUrl: profile.avatar_url ?? undefined,
    cocAccepted: false,
  };
}

/* ─── Helper: fetch profile from Supabase ─── */
async function fetchProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, branch, avatar_initials, avatar_url")
    .eq("id", userId)
    .single();

  if (error || !data) return null;

  // Try to read coc_accepted separately (column may not exist in older schemas)
  let cocAccepted = false;
  try {
    const { data: cocData } = await supabase
      .from("profiles")
      .select("coc_accepted")
      .eq("id", userId)
      .single();
    if (cocData) cocAccepted = cocData.coc_accepted ?? false;
  } catch {
    // column doesn't exist yet — default to false
  }

  const user = buildUser(data as {
    id: string;
    full_name: string;
    email: string;
    role: UserRole;
    branch: string | null;
    avatar_initials: string | null;
    avatar_url?: string | null;
  });
  user.cocAccepted = cocAccepted;
  return user;
}

/* ─── Provider ─── */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /* Helper inside component to access setUser/setLoading */
  const handleSession = useCallback(async (session: Session | null) => {
    if (session?.user) {
      try {
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
      } catch (err) {
        console.error("Failed to load profile:", err);
        const meta = session.user.user_metadata ?? {};
        const fallbackName = (meta.full_name as string) || session.user.email?.split("@")[0] || "User";
        setUser(buildUser({
          id: session.user.id,
          full_name: fallbackName,
          email: session.user.email ?? "",
          role: "unassigned" as UserRole,
          branch: null,
          avatar_initials: null,
        }));
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  /* Listen for auth state changes (session restore, login, logout) */
  useEffect(() => {
    let cancelled = false;

    /* Restore session on mount */
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!cancelled) handleSession(session);
      })
      .catch((err) => {
        console.error("Failed to restore session:", err);
        if (!cancelled) setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) handleSession(session);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
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
      let loginEmail = email.trim();

      // Allow staff sign-in using staff ID by resolving it to a staff email.
      if (loginEmail && !loginEmail.includes("@")) {
        const { data: staffRow, error: staffLookupError } = await supabase
          .from("staff")
          .select("email")
          .ilike("staff_id", loginEmail)
          .maybeSingle();

        if (staffLookupError || !staffRow?.email) {
          return { success: false, error: "Staff ID not found. Use your email address or contact admin." };
        }

        loginEmail = staffRow.email;
      }

      // Validate email - only FOLAT emails allowed (with superadmin exception)
      if (!isEmailAllowed(loginEmail)) {
        return { success: false, error: "Only FOLAT organization email addresses are allowed to sign in." };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });
      if (error) return { success: false, error: error.message };

      /* Eagerly load profile so isAuthenticated is true before we return */
      if (data.user) {
        let profile = await fetchProfile(data.user.id);

        /* If profile doesn't exist yet, create one from auth metadata */
        if (!profile) {
          // Double-check the profile really doesn't exist before creating one
          const { count } = await supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .eq("id", data.user.id);

          if (!count) {
            const meta = data.user.user_metadata ?? {};
            const fullName = (meta.full_name as string) || loginEmail.split("@")[0];
            const initials = fullName
              .split(" ")
              .map((w: string) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            await supabase.from("profiles").insert({
              id: data.user.id,
              full_name: fullName,
              email: data.user.email ?? loginEmail,
              phone: (meta.phone as string) ?? "",
              role: "unassigned" as UserRole,
              branch: "",
              avatar_initials: initials,
            });
          }

          profile = await fetchProfile(data.user.id);
        }

        /* Fallback: build user from auth metadata if profile still can't be loaded */
        if (!profile) {
          const meta = data.user.user_metadata ?? {};
          const fallbackName = (meta.full_name as string) || loginEmail.split("@")[0];
          profile = buildUser({
            id: data.user.id,
            full_name: fallbackName,
            email: data.user.email ?? loginEmail,
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
        phone?: string,
        role?: string
      ): Promise<{ success: boolean; error?: string }> => {
        // Validate email - only FOLAT emails allowed (with superadmin exception)
        if (!isEmailAllowed(email)) {
          return { success: false, error: "Only FOLAT organization email addresses are allowed." };
        }

         try {
           const res = await fetch(
             `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/signup`,
             {
               method: "POST",
               headers: {
                 "Content-Type": "application/json",
                 Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
               },
               body: JSON.stringify({
                 email,
                 password,
                 fullName,
                 phone: phone || "",
                 role: role || "front_desk",
               }),
             }
           );
           const data = await res.json().catch(() => ({}));
           if (!res.ok || data?.success === false) {
             throw new Error(data?.error || "Signup failed");
           }

          return { success: true };
        } catch (err) {
          console.error('Sign up error:', err);
          return { success: false, error: err instanceof Error ? err.message : 'Sign up failed' };
        }
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

  const refreshProfile = useCallback(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const profile = await fetchProfile(authUser.id);
      if (profile) setUser(profile);
    }
  }, []);

  const acceptCodeOfConduct = useCallback(async () => {
    if (!user?.id) return;
    try {
      await supabase.from("profiles").update({ coc_accepted: true }).eq("id", user.id);
    } catch {
      // column may not exist yet — ignore
    }
    setUser((prev) => (prev ? { ...prev, cocAccepted: true } : prev));
  }, [user?.id]);

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
            avatar_url: user.avatarUrl,
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
        refreshProfile,
        acceptCodeOfConduct,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
