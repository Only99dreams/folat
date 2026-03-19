import {
  ShieldAlert,
  Headset,
  BadgeCheck,
  Clock,
  HeadphonesIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function AccountLockedPage() {
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
      <main className="flex-1 flex flex-col items-center px-4 py-12">
        {/* Shield banner image */}
        <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-navy-900 mb-8">
          <div className="relative w-full h-40 flex items-center justify-center">
            {/* Abstract shield background */}
            <svg
              className="absolute inset-0 w-full h-full opacity-20"
              viewBox="0 0 600 160"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="300" cy="80" r="120" stroke="#3b82f6" strokeWidth="0.5" />
              <circle cx="300" cy="80" r="90" stroke="#3b82f6" strokeWidth="0.5" />
              <circle cx="300" cy="80" r="60" stroke="#3b82f6" strokeWidth="0.5" />
              <line x1="0" y1="80" x2="600" y2="80" stroke="#3b82f6" strokeWidth="0.3" />
              <line x1="300" y1="0" x2="300" y2="160" stroke="#3b82f6" strokeWidth="0.3" />
              {/* Grid lines */}
              {Array.from({ length: 20 }).map((_, i) => (
                <line
                  key={`h${i}`}
                  x1="0"
                  y1={i * 8}
                  x2="600"
                  y2={i * 8}
                  stroke="#3b82f6"
                  strokeWidth="0.15"
                />
              ))}
              {Array.from({ length: 75 }).map((_, i) => (
                <line
                  key={`v${i}`}
                  x1={i * 8}
                  y1="0"
                  x2={i * 8}
                  y2="160"
                  stroke="#3b82f6"
                  strokeWidth="0.15"
                />
              ))}
            </svg>
            {/* Shield icon */}
            <svg
              className="relative z-10 w-20 h-20 text-blue-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
        </div>

        {/* Card */}
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Icon */}
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-red-500" />
            </div>

            {/* Heading */}
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-navy-900">
                Account Temporarily Locked
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed max-w-md mx-auto">
                For your security, we have temporarily disabled access to your
                account following multiple unsuccessful login attempts. This
                proactive measure protects your data and sensitive information
                from unauthorized access.
              </p>
            </div>

            {/* How to unlock */}
            <div className="w-full text-left space-y-4 pt-2">
              <h2 className="text-base font-bold text-navy-900">
                How to unlock your account
              </h2>

              {/* Step 1 */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Headset className="w-4 h-4 text-navy-900" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy-900">
                    Contact IT Administration
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Reach out to your department's administrator to verify your
                    identity and reset your credentials.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <BadgeCheck className="w-4 h-4 text-navy-900" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy-900">
                    Identity Verification
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Please have your employee ID or secondary authentication
                    method ready for verification.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-4 h-4 text-navy-900" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy-900">
                    Wait Period
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Accounts typically remain locked for 30 minutes before
                    allowing a new attempt, unless manually reset.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="w-full space-y-3 pt-2">
              <button className="w-full flex items-center justify-center gap-2 py-3.5 bg-navy-900 text-white font-semibold rounded-xl hover:bg-navy-800 active:scale-[0.99] transition-all">
                <HeadphonesIcon className="w-5 h-5" />
                Contact Support
              </button>
              <Link
                to="/"
                className="w-full flex items-center justify-center py-3.5 border border-gray-200 text-navy-900 font-semibold rounded-xl hover:bg-gray-50 transition-all"
              >
                Return to Login
              </Link>
            </div>
          </div>
        </div>

        {/* Reference ID */}
        <p className="mt-8 text-[10px] tracking-[0.15em] uppercase text-gray-400 font-medium">
          Reference ID: SEC-403-LOCKED
        </p>
      </main>
    </div>
  );
}
