import { useState } from "react";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Building2,
  Globe,
  Landmark,
  ArrowRight,
  AlertCircle,
  Shield,
} from "lucide-react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import heroImg from "../assets/hero.png";
import { useAuth, DEMO_USERS } from "../auth/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (login(email, password)) {
      navigate("/dashboard");
    } else {
      setError("Invalid email or password. Use a demo account below.");
    }
  };

  const fillDemo = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ───── Top Navbar ───── */}
      <header className="w-full bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="FOLAT Multipurpose Investment" className="h-10" />
          </Link>

          {/* Help Center button */}
          <button className="px-4 py-2 text-sm font-medium text-white bg-navy-900 rounded-lg hover:bg-navy-800 transition-colors">
            Help Center
          </button>
        </div>
      </header>

      {/* ───── Main Content ───── */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* ── Left Column: Hero ── */}
          <div className="p-8 space-y-8" style={{ backgroundColor: '#C8E6D2' }}>
            {/* Hero image */}
            <div className="overflow-hidden rounded-2xl shadow-lg">
              <img
                src={heroImg}
                alt="Cooperative team working together"
                className="w-full h-56 sm:h-64 object-cover"
              />
            </div>

            {/* Heading */}
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight text-navy-900">
                Secure Cooperative{" "}
                <span className="text-green-600">Management System</span>
              </h1>
              <p className="text-gray-500 text-base leading-relaxed max-w-md">
                Sign in to access the internal platform for managing members,
                loans, savings, and cooperative operations securely.
              </p>
            </div>

            {/* Security badge */}
            <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-5 py-4 max-w-md">
              <ShieldCheck className="w-6 h-6 text-navy-900" />
              <div>
                <p className="text-sm font-semibold text-navy-900">
                  Enterprise Security
                </p>
                <p className="text-xs text-gray-400">
                  256-bit encryption active
                </p>
              </div>
            </div>
          </div>

          {/* ── Right Column: Login Form ── */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="space-y-6">
              {/* Heading */}
              <div>
                <h2 className="text-2xl font-bold text-navy-900">
                  Welcome Back
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Log in to your staff or member account
                </p>
              </div>

              {/* Demo accounts panel */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm font-medium text-green-800 mb-2 flex items-center gap-1.5">
                  <Shield className="w-4 h-4" /> Demo Accounts — Click to auto-fill
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DEMO_USERS.map((d) => (
                    <button
                      key={d.email}
                      type="button"
                      onClick={() => fillDemo(d.email, d.password)}
                      className={`text-left px-3 py-2 rounded-lg border transition-colors text-xs ${
                        email === d.email
                          ? "border-green-500 bg-green-100"
                          : "border-green-200 hover:bg-green-100/70"
                      }`}
                    >
                      <p className="font-semibold text-green-900">{d.user.roleLabel}</p>
                      <p className="text-green-700 font-mono">{d.email}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email / Staff ID */}
                <div>
                  <label className="block text-sm font-medium text-navy-900 mb-1.5">
                    Email or Staff ID
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="staff_123@coop.com"
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-navy-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-navy-900">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-medium text-navy-900 hover:text-green-600 transition-colors"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-xl text-sm text-navy-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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

                {/* Keep logged in + Sign Up */}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={keepLoggedIn}
                      onChange={(e) => setKeepLoggedIn(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-gray-500">
                      Keep me logged in on this device
                    </span>
                  </label>
                  <p className="text-gray-500 text-xs">
                    Don't Have an Account?{" "}
                    <Link
                      to="/signup"
                      className="text-green-600 font-semibold hover:underline"
                    >
                      Sign Up
                    </Link>
                  </p>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-navy-900 text-white font-semibold rounded-xl hover:bg-navy-800 active:scale-[0.99] transition-all"
                >
                  Log In
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Trust section */}
              <div className="pt-4 text-center space-y-3">
                <p className="text-[10px] tracking-[0.15em] uppercase text-gray-400 font-medium">
                  Trusted by cooperatives worldwide
                </p>
                <div className="flex items-center justify-center gap-5 text-gray-300">
                  <Building2 className="w-6 h-6" />
                  <Globe className="w-6 h-6" />
                  <Landmark className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


