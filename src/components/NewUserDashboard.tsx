import { Clock, ShieldCheck, LogOut } from "lucide-react";
import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router-dom";

export default function NewUserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center space-y-6">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
            <Clock className="w-8 h-8 text-amber-500" />
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {user?.name ?? "User"}!
            </h1>
            <p className="text-gray-500 mt-2 text-sm leading-relaxed">
              Your account has been created successfully. A Super Admin will review
              your account and assign you a role shortly.
            </p>
          </div>

          {/* Status badge */}
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-sm font-medium px-4 py-2 rounded-full">
            <ShieldCheck className="w-4 h-4" />
            Role Pending Assignment
          </div>

          {/* Info */}
          <div className="bg-gray-50 rounded-xl p-5 text-left space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              What happens next?
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                The Super Admin has been notified about your registration.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                Once a role is assigned, you'll gain access to the relevant modules.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                You can log out and check back later, or stay on this page.
              </li>
            </ul>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 mt-4">
          If you believe this is taking too long, please contact your administrator.
        </p>
      </div>
    </div>
  );
}
