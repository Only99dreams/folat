import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import {
  FileSearch,
  Shield,
  AlertTriangle,
  FileText,
  Activity,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchAuditLog } from "../lib/db";

/* ─── Chart placeholder ─── */
const defaultComplianceData = [
  { month: "Jan", compliant: 0, issues: 0 },
  { month: "Feb", compliant: 0, issues: 0 },
  { month: "Mar", compliant: 0, issues: 0 },
  { month: "Apr", compliant: 0, issues: 0 },
  { month: "May", compliant: 0, issues: 0 },
  { month: "Jun", compliant: 0, issues: 0 },
];

export default function AuditorDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [totalEntries, setTotalEntries] = useState(0);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [complianceData] = useState(defaultComplianceData);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    (async () => {
      try {
        const [logRes] = await Promise.all([
          fetchAuditLog({ page: 1, pageSize: 5 }),
        ]);
        setTotalEntries(logRes.count);
        setRecentLogs(logRes.data);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const stats = [
    { label: "Audit Entries", value: String(totalEntries), change: "All time", icon: FileSearch, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Compliance Score", value: "—", change: "Not tracked", icon: Shield, color: "text-green-600", bg: "bg-green-50" },
    { label: "Recent Entries", value: String(recentLogs.length), change: "Latest batch", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
    { label: "Reports", value: "—", change: "See Reports page", icon: FileText, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Audit & Compliance Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            <Shield className="inline w-3.5 h-3.5 mr-1" />
            Read-only access — {user?.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/security/audit" className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50">
            <Activity className="w-4 h-4" /> Full Audit Log
          </Link>
          <Link to="/reports" className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700">
            <FileText className="w-4 h-4" /> Generate Report
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-4 flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-green-600" /></div>
        ) : stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-navy-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            <p className="text-xs text-gray-400">{s.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-navy-900 mb-4">Compliance Trend</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={complianceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} />
                <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} />
                <Tooltip />
                <Bar dataKey="compliant" fill="#109050" radius={[4, 4, 0, 0]} name="Compliant" />
                <Bar dataKey="issues" fill="#ef4444" radius={[4, 4, 0, 0]} name="Issues" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Logs */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-navy-900">Live Activity</h2>
            <Link to="/security/audit" className="text-sm text-green-600 font-medium hover:text-green-700">View Full Log</Link>
          </div>
          <div className="space-y-4">
            {recentLogs.length === 0 ? (
              <p className="text-sm text-gray-400">No recent activity.</p>
            ) : recentLogs.map((l: any) => {
              const mins = Math.floor((now - new Date(l.created_at).getTime()) / 60000);
              const ago = mins < 60 ? `${mins}m ago` : mins < 1440 ? `${Math.floor(mins / 60)}h ago` : `${Math.floor(mins / 1440)}d ago`;
              return (
              <div key={l.id} className="flex gap-3">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                <div>
                  <p className="text-sm text-navy-900"><span className="font-medium">{l.user?.full_name || "System"}</span> — {l.action} {l.entity_type}</p>
                  <p className="text-xs text-gray-400">{ago} · {l.ip_address || "—"}</p>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Audit Log as Table */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-navy-900">Recent Audit Entries</h2>
          <Link to="/security/audit" className="text-sm font-medium text-green-600 hover:text-green-700">View Full Log</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">Action</th>
                <th className="pb-3 font-medium">Entity</th>
                <th className="pb-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.length === 0 ? (
                <tr><td colSpan={4} className="py-6 text-center text-gray-400 text-sm">No audit entries.</td></tr>
              ) : recentLogs.map((f: any) => {
                const mins = Math.floor((now - new Date(f.created_at).getTime()) / 60000);
                const ago = mins < 60 ? `${mins}m ago` : mins < 1440 ? `${Math.floor(mins / 60)}h ago` : `${Math.floor(mins / 1440)}d ago`;
                return (
                <tr key={f.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-3 font-medium text-navy-900">{f.user?.full_name || "System"}</td>
                  <td className="py-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">{f.action}</span>
                  </td>
                  <td className="py-3 text-gray-500">{f.entity_type}</td>
                  <td className="py-3 text-gray-400">{ago}</td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
