import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Building2,
  Globe,
  Landmark,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import heroImg from "../assets/hero.png";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: handle signup logic
    console.log({ fullName, email, phone, password, confirmPassword, agreeTerms });
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
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* ── Left Column: Hero ── */}
          <div className="p-8 space-y-8" style={{ backgroundColor: '#C8E6D2' }}>
            {/* Hero image */}
            <div className="overflow-hidden rounded-2xl shadow-lg">
              <img 
              src={heroImg}
                alt="Team collaborating in modern office"
                className="w-full h-56 sm:h-64 object-cover"
              />
            </div>

            {/* Heading */}
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight text-navy-900">
                Join Our{" "}
                <span className="text-green-600">Cooperative Community</span>
              </h1>
              <p className="text-gray-500 text-base leading-relaxed max-w-md">
                Create your account to start managing savings, accessing loans,
                and participating in cooperative activities.
              </p>
            </div>

            {/* Security badge */}
            <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-5 py-4 max-w-md">
              <ShieldCheck className="w-6 h-6 text-navy-900" />
              <div>
                <p className="text-sm font-semibold text-navy-900">
                  Your Data is Protected
                </p>
                <p className="text-xs text-gray-400">
                  256-bit encryption &amp; secure onboarding
                </p>
              </div>
            </div>
          </div>

          {/* ── Right Column: Signup Form ── */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="space-y-6">
              {/* Heading */}
              <div>
                <h2 className="text-2xl font-bold text-navy-900">
                  Create Account
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Fill in your details to get started
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-navy-900 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-navy-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

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
                      placeholder="you@example.com"
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-navy-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-navy-900 mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 800 000 0000"
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-navy-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-navy-900 mb-1.5">
                    Password
                  </label>
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

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-navy-900 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-xl text-sm text-navy-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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

                {/* Terms & Conditions + Log In link */}
                <div className="flex items-start justify-between text-sm gap-4">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-gray-500 leading-snug">
                      I agree to the{" "}
                      <button
                        type="button"
                        className="text-green-600 font-semibold hover:underline"
                      >
                        Terms &amp; Conditions
                      </button>
                    </span>
                  </label>
                  <p className="text-gray-500 text-xs whitespace-nowrap pt-0.5">
                    Already a member?{" "}
                    <Link
                      to="/"
                      className="text-green-600 font-semibold hover:underline"
                    >
                      Log In
                    </Link>
                  </p>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-navy-900 text-white font-semibold rounded-xl hover:bg-navy-800 active:scale-[0.99] transition-all"
                >
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Trust section */}
              <div className="pt-2 text-center space-y-3">
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
