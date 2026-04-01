import { useState } from "react";
import { Mail, KeyRound, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmed = email.trim();
    if (!trimmed) {
      setError("Please enter your email address.");
      return;
    }

    setSubmitting(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setSubmitting(false);

    if (resetError) {
      setError(resetError.message);
    } else {
      setSent(true);
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
            {/* Icon */}
            <div className="w-14 h-14 rounded-full bg-navy-50 flex items-center justify-center">
              <KeyRound className="w-6 h-6 text-navy-900" />
            </div>

            {/* Heading */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-navy-900">
                Forgot password?
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
                No worries, it happens. Enter your details below and we'll send
                you a link to reset your password.
              </p>
            </div>

            {/* Success state */}
            {sent ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  <p className="text-sm text-green-700">
                    Password reset link sent! Check your inbox for <span className="font-semibold">{email}</span>.
                  </p>
                </div>
                <p className="text-xs text-gray-400">Didn't get the email? Check your spam folder or try again.</p>
                <button
                  onClick={() => setSent(false)}
                  className="text-sm font-medium text-green-600 hover:underline"
                >
                  Try a different email
                </button>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-navy-900 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. alex@company.com"
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-navy-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-navy-900 text-white font-semibold rounded-xl hover:bg-navy-800 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>
            )}

            {/* Back to Login */}
            <div className="text-center space-y-3 pt-2">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-900 hover:text-green-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
              <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">
                If you no longer have access to your email, please contact your
                department administrator.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
