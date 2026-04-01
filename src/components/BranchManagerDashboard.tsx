import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import {
  Users,
  PiggyBank,
  Landmark,
  AlertTriangle,
  MapPin,
  CreditCard,
  FileBarChart,
  ClipboardCheck,
  Calendar,
  Clock,
  UserCheck,
  Loader2,
} from "lucide-react";
import { fetchDashboardStats, fetchAuditLog, fetchAttendance } from "../lib/db";

export default function BranchManagerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [dashStats, auditRes, attRecords] = await Promise.all([
        fetchDashboardStats(),
        fetchAuditLog({ page: 1, pageSize: 5 }),
        fetchAttendance({ date: new Date().toISOString().slice(0, 10) }),
      ]);
      setStats(dashStats);
      setActivity(auditRes.data);
      setAttendance(attRecords);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  }

  const fmt = (n: number) => {
    if (n >= 1e9) return `₦ ${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `₦ ${(n / 1e6).toFixed(1)}M`;
    return `₦ ${n.toLocaleString()}`;
  };

  const statCards = stats ? [
    { label: "Branch Members", value: stats.totalMembers.toLocaleString(), icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active Savings", value: fmt(stats.totalSavings), icon: PiggyBank, color: "text-green-600", bg: "bg-green-50" },
    { label: "Active Loans", value: String(stats.activeLoans), icon: Landmark, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Total Staff", value: String(stats.totalStaff), icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
  ] : [];

  const pendingTasks = [
    { label: "Loan applications awaiting review", count: stats?.pendingLoans ?? 0, to: "/loans", icon: ClipboardCheck },
    { label: "Fund requests pending approval", count: 0, to: "/finance/fund-requests", icon: CreditCard },
    { label: "Leave requests to review", count: 0, to: "/hr/leave-requests", icon: Calendar },
    { label: "Member registrations to verify", count: 0, to: "/members", icon: UserCheck },
  ];

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
        {loading ? (
          <div className="col-span-4 text-center py-8"><Loader2 className="w-6 h-6 animate-spin text-green-600 mx-auto" /></div>
        ) : statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-navy-900">{s.value}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-400">{s.label}</p>
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
            {activity.length === 0 ? (
              <p className="text-xs text-gray-400">No recent activity.</p>
            ) : activity.map((a) => {
              const mins = Math.floor((Date.now() - new Date(a.created_at).getTime()) / 60000);
              const ago = mins < 60 ? `${mins} mins ago` : mins < 1440 ? `${Math.floor(mins / 60)} hours ago` : `${Math.floor(mins / 1440)} days ago`;
              return (
              <div key={a.id} className="flex gap-3">
                <span className="mt-1.5 w-2 h-2 rounded-full shrink-0 bg-green-500" />
                <div>
                  <p className="text-sm text-navy-900">{a.user?.full_name || "System"} — {a.action} {a.entity_type}</p>
                  <p className="text-xs text-gray-400">{ago}</p>
                </div>
              </div>
              );
            })}
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
              {attendance.length === 0 ? (
                <tr><td colSpan={3} className="py-6 text-center text-gray-400 text-sm">No attendance records today.</td></tr>
              ) : attendance.map((s: any) => (
                <tr key={s.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-3 font-medium text-navy-900">{s.staff?.full_name || "—"}</td>
                  <td className="py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      s.status === "present" ? "bg-green-100 text-green-700" :
                      s.status === "late" ? "bg-amber-100 text-amber-700" :
                      s.status === "leave" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>{s.status?.charAt(0).toUpperCase() + s.status?.slice(1)}</span>
                  </td>
                  <td className="py-3 text-gray-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />{s.clock_in ? new Date(s.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
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
