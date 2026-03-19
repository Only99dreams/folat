import { Ban, LayoutGrid, ShieldQuestion, Info, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function AccessDeniedPage() {
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
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        {/* Icon card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 mb-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <Ban className="w-8 h-8 text-navy-900" />
            </div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-navy-900 font-bold">
              Error 403
            </p>
          </div>
        </div>

        {/* Heading & description */}
        <div className="text-center space-y-3 mb-8">
          <h1 className="text-2xl font-bold text-navy-900">
            Access Restricted
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
            It looks like you've reached a restricted area. This page is only
            accessible to HR administrators and executive staff.
          </p>
        </div>

        {/* Actions */}
        <div className="w-full max-w-sm space-y-3 mb-10">
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-navy-900 text-white font-semibold rounded-xl hover:bg-navy-800 active:scale-[0.99] transition-all"
          >
            <LayoutGrid className="w-5 h-5" />
            Back to Dashboard
          </Link>
          <button className="w-full flex items-center justify-center gap-2 py-3.5 border border-gray-200 text-navy-900 font-semibold rounded-xl hover:bg-gray-50 transition-all">
            <ShieldQuestion className="w-5 h-5" />
            Request Permissions
          </button>
        </div>

        {/* Footer info */}
        <div className="border-t border-gray-200 pt-6 w-full max-w-lg">
          <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              Reference ID: #REQ-403-9182
            </span>
            <button className="flex items-center gap-1.5 hover:text-navy-900 transition-colors">
              <HelpCircle className="w-3.5 h-3.5" />
              View Security Guidelines
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
