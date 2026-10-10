import { useState, useMemo, useEffect } from "react";
import { Eye, EyeOff, CheckCircle2, Info, Loader2, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function getStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;

  if (score <= 1) return { label: "Weak", color: "#ef4444", pct: 25 };
  if (score === 2) return { label: "Fair", color: "#f59e0b", pct: 50 };
  if (score === 3) return { label: "Strong", color: "#3b82f6", pct: 75 };
  return { label: "Very Strong", color: "#22c55e", pct: 100 };
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  const strength = useMemo(() => getStrength(password), [password]);

  // Try to detect the temporary recovery session Supabase provides after the
  // user clicks the password recovery link. Be resilient to different SDK
  // helpers (getSessionFromUrl / setSession) and fall back to parsing the
  // URL fragment for access/refresh tokens.
  useEffect(() => {
    let subscription: any;
    let mounted = true;

    (async () => {
      try {
        // Subscribe to auth events (PASSWORD_RECOVERY)
        const res: any = supabase.auth.onAuthStateChange((event: string) => {
          if (event === "PASSWORD_RECOVERY") {
            if (mounted) setSessionReady(true);
          }
        });

        // Normalize possible return shapes
        if (res && res.data && res.data.subscription) subscription = res.data.subscription;
        else if (res && res.subscription) subscription = res.subscription;

        // If there's an active session already, we're ready
        const sessionResp: any = await supabase.auth.getSession();
        if (sessionResp?.data?.session) {
          if (mounted) setSessionReady(true);
          return;
        }

        // Try SDK helper if present
        if ((supabase.auth as any).getSessionFromUrl) {
          try {
            const r = await (supabase.auth as any).getSessionFromUrl();
            if (r?.data?.session) {
              if (mounted) setSessionReady(true);
              return;
            }
          } catch (err) {
            // ignore and continue to other fallbacks
          }
        }

        // Fallback: parse tokens from URL hash and set session (if supported)
        const hash = window.location.hash || "";
        if (hash) {
          const params = new URLSearchParams(hash.replace(/^#/, ""));
          const access_token = params.get("access_token");
          const refresh_token = params.get("refresh_token");
          if (access_token && refresh_token && (supabase.auth as any).setSession) {
            try {
              const { data: setData, error: setError } = await (supabase.auth as any).setSession({ access_token, refresh_token });
              if (!setError && setData?.session && mounted) {
                setSessionReady(true);
                return;
              }
            } catch (err) {
              // ignore
            }
          }
        }
      } catch (err) {
        console.error("Failed to initialize recovery session:", err);
      }
    })();

    return () => {
      mounted = false;
      if (subscription && subscription.unsubscribe) subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!sessionReady) {
      setError("Open the password recovery link in this browser before updating your password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => navigate("/", { replace: true }), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ───── Top Navbar ───── */}
      <header className="w-full bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="FOLAT Multipurpose Investment"
              className="h-10"
            />
          </Link>
          <button className="px-4 py-2 text-sm font-medium text-white bg-navy-900 rounded-lg hover:bg-navy-800 transition-colors">
            Help Center
          </button>
        </div>
      </header>

      {/* ───── Main Content ───── */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
          <div className="space-y-6">
            {/* Heading */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-navy-900">
                Reset Password
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
                Create a strong, unique password to secure your account and
                protect your personal data.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-4 pr-11 py-3 border border-gray-200 rounded-xl text-sm text-navy-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy-900 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Strength meter */}
              {password.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <p className="text-gray-500">
                      Strength:{" "}
                      <span
                        className="font-semibold"
                        style={{ color: strength.color }}
                      >
                        {strength.label}
                      </span>
                    </p>
                    <span className="text-gray-400 text-xs">{strength.pct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${strength.pct}%`,
                        backgroundColor: strength.color,
                      }}
                    />
                  </div>
                  <div className="flex items-start gap-1.5">
                    <CheckCircle2
                      className="w-4 h-4 mt-0.5 flex-shrink-0"
                      style={{ color: strength.color }}
                    />
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {strength.pct >= 75
                        ? "Great! This password meets all security requirements and is hard to guess."
                        : "Add more characters, numbers, symbols, or mixed-case letters to strengthen your password."}
                    </p>
                  </div>
                </div>
              )}

              {/* Confirm New Password */}
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full px-4 pr-11 py-3 border border-gray-200 rounded-xl text-sm text-navy-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy-900 transition-colors"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  <p className="text-sm text-green-700">Password updated! Redirecting to login…</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting || success}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-navy-900 text-white font-semibold rounded-xl hover:bg-navy-800 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating…
                  </>
                ) : (
                  "Update Password"
                )}
              </button>
            </form>

            {/* Cancel */}
            <div className="text-center">
              <Link
                to="/"
                className="text-sm font-medium text-gray-500 hover:text-navy-900 transition-colors"
              >
                Cancel and Go Back
              </Link>
            </div>

            {/* Tip */}
            <div className="flex items-start gap-3 bg-gray-50 rounded-xl px-5 py-4">
              <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-500 leading-relaxed">
                Tip: Use at least 12 characters, including numbers, symbols, and
                mixed-case letters for maximum security.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
