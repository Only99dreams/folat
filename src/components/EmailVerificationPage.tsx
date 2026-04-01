import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  MailCheck,
  AlertCircle,
  Loader2,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const CODE_LENGTH = 6;

export default function EmailVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string })?.email ?? "";

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Redirect if no email in state
  useEffect(() => {
    if (!email) navigate("/signup", { replace: true });
  }, [email, navigate]);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError("");

    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;
    const next = [...digits];
    for (let i = 0; i < CODE_LENGTH; i++) {
      next[i] = pasted[i] ?? "";
    }
    setDigits(next);
    const focusIdx = Math.min(pasted.length, CODE_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  const code = digits.join("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < CODE_LENGTH) {
      setError("Please enter the full 6-digit code.");
      return;
    }
    setError("");
    setVerifying(true);

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "signup",
    });

    setVerifying(false);

    if (verifyError) {
      setError(verifyError.message);
      return;
    }

    navigate("/", { replace: true, state: { verified: true } });
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResending(true);
    setError("");

    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    setResending(false);

    if (resendError) {
      setError(resendError.message);
    } else {
      setResendCooldown(60);
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <header className="w-full bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="FOLAT Multipurpose Investment" className="h-10" />
          </Link>
          <button className="px-4 py-2 text-sm font-medium text-white bg-navy-900 rounded-lg hover:bg-navy-800 transition-colors">
            Help Center
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
            {/* Icon */}
            <div className="mx-auto w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
              <MailCheck className="w-7 h-7 text-green-600" />
            </div>

            {/* Heading */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-navy-900">
                Verify Your Email
              </h1>
              <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                We sent a 6-digit verification code to{" "}
                <span className="font-semibold text-navy-900">{email}</span>.
                Enter the code below to verify your account.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* OTP Form */}
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={i === 0 ? handlePaste : undefined}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl text-navy-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={verifying || code.length < CODE_LENGTH}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-navy-900 text-white font-semibold rounded-xl hover:bg-navy-800 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {verifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying…
                  </>
                ) : (
                  <>
                    Verify Account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Resend */}
            <div className="text-center">
              <p className="text-sm text-gray-400">
                Didn't receive the code?{" "}
                <button
                  onClick={handleResend}
                  disabled={resending || resendCooldown > 0}
                  className="text-green-600 font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
                >
                  {resending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : "Resend Code"}
                </button>
              </p>
            </div>

            {/* Security note */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              Code expires in 10 minutes
            </div>
          </div>

          {/* Back link */}
          <p className="text-center text-xs text-gray-400 mt-4">
            Wrong email?{" "}
            <Link to="/signup" className="text-green-600 font-semibold hover:underline">
              Go back to signup
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
