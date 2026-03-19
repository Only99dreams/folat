import { useState } from "react";
import { Mail, KeyRound, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: send reset link
    console.log({ email });
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email / Staff ID */}
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1.5">
                  Email or Staff ID
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. alex@company.com or STF-123"
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-navy-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-navy-900 text-white font-semibold rounded-xl hover:bg-navy-800 active:scale-[0.99] transition-all"
              >
                Send Reset Link
              </button>
            </form>

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
