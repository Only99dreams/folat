import { Link } from "react-router-dom";
import { FileText, MessageSquare, CalendarDays, ArrowRight } from "lucide-react";

export default function StaffDashboardPage() {
  const quickLinks = [
    {
      title: "Cooperative Loan Request",
      description: "Apply for a cooperative loan for yourself.",
      to: "/loans/cooperative-request",
      icon: FileText,
    },
    {
      title: "Messages",
      description: "Send and receive internal communication.",
      to: "/communication/messages",
      icon: MessageSquare,
    },
    {
      title: "Leave Requests",
      description: "Submit and track your leave applications.",
      to: "/hr/leave-requests",
      icon: CalendarDays,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Staff Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome. Use the quick actions below to access your daily tools.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {quickLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              to={item.to}
              className="group rounded-xl border border-gray-100 bg-white p-5 transition hover:border-green-200 hover:shadow-sm"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="text-base font-bold text-navy-900">{item.title}</h2>
              <p className="mt-1 text-sm text-gray-500">{item.description}</p>
              <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-green-600">
                Open
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
