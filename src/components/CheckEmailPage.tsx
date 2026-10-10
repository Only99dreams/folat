import { Link, useLocation } from "react-router-dom";
import { MailCheck, ArrowRight } from "lucide-react";

export default function CheckEmailPage() {
  const location = useLocation();
  const email = (location.state as { email?: string })?.email ?? "";

  if (!email) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="w-full bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="FOLAT Multipurpose Investment" className="h-10" />
            </a>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center max-w-md">
            <p className="text-gray-600">No email provided. Please sign up again.</p>
            <Link to="/signup" className="mt-4 inline-block text-green-600 font-semibold hover:underline">
              Go to Signup
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="w-full bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="FOLAT Multipurpose Investment" className="h-10" />
          </a>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center max-w-md">
          <div className="mx-auto w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
            <MailCheck className="w-7 h-7 text-green-600" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-navy-900">
            Check Your Email
          </h1>
          <p className="mt-2 text-gray-600">
            We sent a verification email to{" "}
            <span className="font-semibold text-navy-900">{email}</span>.
            Click the link in your email to verify your account.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Didn't receive the email? Check your spam folder or{" "}
            <Link to="/signup" className="text-green-600 font-semibold hover:underline">
              try again
            </Link>
          </p>
          <div className="mt-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-900 hover:text-green-600 transition-colors"
            >
              Go to Login
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}