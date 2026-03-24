import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  Users,
  PiggyBank,
  Landmark,
  AlertTriangle,
  MapPin,
  CreditCard,
  FileBarChart,
  TrendingUp,
  ClipboardCheck,
  Calendar,
  Clock,
  UserCheck,
} from "lucide-react";

/* ─── Mock Data ─── */
const stats = [
  { label: "Branch Members", value: "1,247", change: "+12%", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Active Savings", value: "₦ 84.2M", change: "+8.4%", icon: PiggyBank, color: "text-green-600", bg: "bg-green-50" },
  { label: "Active Loans", value: "89", change: "-3%", icon: Landmark, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Overdue Loans", value: "7", change: "+2", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
];

const recentActivities = [
  { color: "bg-green-500", text: "New member Fatima Hassan registered", time: "10 mins ago" },
  { color: "bg-blue-500", text: "Loan #L2043 approved for ₦350,000", time: "25 mins ago" },
  { color: "bg-amber-500", text: "Deposit of ₦150,000 recorded for Musa Ali", time: "1 hour ago" },
  { color: "bg-red-500", text: "Overdue notice sent to 3 borrowers", time: "2 hours ago" },
  { color: "bg-purple-500", text: "Staff leave request from Grace Ibe", time: "3 hours ago" },
];

const pendingTasks = [
  { label: "Loan applications awaiting review", count: 5, to: "/loans", icon: ClipboardCheck },
  { label: "Fund requests pending approval", count: 3, to: "/finance/fund-requests", icon: CreditCard },
  { label: "Leave requests to review", count: 2, to: "/hr/leave-requests", icon: Calendar },
  { label: "Member registrations to verify", count: 8, to: "/members", icon: UserCheck },
];

const staffAttendance = [
  { name: "Aisha Mohammed", status: "Present", time: "08:15 AM" },
  { name: "David Okafor", status: "Present", time: "08:30 AM" },
  { name: "Grace Ibe", status: "On Leave", time: "—" },
  { name: "James Udo", status: "Late", time: "09:45 AM" },
];

export default function BranchManagerDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Branch Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            <MapPin className="inline w-3.5 h-3.5 mr-1" />
            {user?.branch} — Overview for today
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/reports" className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50">
            <FileBarChart className="w-4 h-4" /> Reports
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-navy-900">{s.value}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-400">{s.label}</p>
              <span className={`text-xs font-medium ${s.change.startsWith("+") ? "text-green-600" : "text-red-500"}`}>
                <TrendingUp className="inline w-3 h-3 mr-0.5" />{s.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Tasks */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-navy-900 mb-4">Pending Tasks</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pendingTasks.map((t) => (
              <Link key={t.label} to={t.to} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50/50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <t.icon className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-navy-900">{t.label}</p>
                  <p className="text-xs text-gray-400">{t.count} items</p>
                </div>
                <span className="w-7 h-7 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center">{t.count}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-navy-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivities.map((a, i) => (
              <div key={i} className="flex gap-3">
                <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${a.color}`} />
                <div>
                  <p className="text-sm text-navy-900">{a.text}</p>
                  <p className="text-xs text-gray-400">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Staff Attendance */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-navy-900">Today's Staff Attendance</h2>
          <Link to="/hr/attendance" className="text-sm font-medium text-green-600 hover:text-green-700">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="pb-3 font-medium">Staff</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Clock In</th>
              </tr>
            </thead>
            <tbody>
              {staffAttendance.map((s, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0">
                  <td className="py-3 font-medium text-navy-900">{s.name}</td>
                  <td className="py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      s.status === "Present" ? "bg-green-100 text-green-700" :
                      s.status === "Late" ? "bg-amber-100 text-amber-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>{s.status}</span>
                  </td>
                  <td className="py-3 text-gray-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />{s.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
