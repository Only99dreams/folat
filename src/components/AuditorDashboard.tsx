import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  FileSearch,
  Shield,
  AlertTriangle,
  FileText,
  Activity,
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

/* ─── Mock Data ─── */
const complianceData = [
  { month: "Jan", compliant: 45, issues: 3 },
  { month: "Feb", compliant: 48, issues: 2 },
  { month: "Mar", compliant: 44, issues: 5 },
  { month: "Apr", compliant: 50, issues: 1 },
  { month: "May", compliant: 47, issues: 4 },
  { month: "Jun", compliant: 52, issues: 2 },
];

const stats = [
  { label: "Audit Entries Reviewed", value: "342", change: "This month", icon: FileSearch, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Compliance Score", value: "94%", change: "+2% from last month", icon: Shield, color: "text-green-600", bg: "bg-green-50" },
  { label: "Flagged Transactions", value: "7", change: "Pending review", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
  { label: "Reports Generated", value: "12", change: "This quarter", icon: FileText, color: "text-purple-600", bg: "bg-purple-50" },
];

const auditFindings = [
  { severity: "High", desc: "Loan #L1955 disbursed without complete documentation", date: "2 days ago", status: "Open" },
  { severity: "Medium", desc: "Branch expense report missing 3 receipts (Ikeja)", date: "5 days ago", status: "Under Review" },
  { severity: "Low", desc: "Staff attendance discrepancy — Abuja branch", date: "1 week ago", status: "Resolved" },
  { severity: "High", desc: "Unauthorized access attempt to finance module", date: "1 week ago", status: "Escalated" },
  { severity: "Medium", desc: "Savings withdrawal above limit without approval", date: "2 weeks ago", status: "Open" },
];

const recentAuditLogs = [
  { user: "Branch Mgr (Ikeja)", action: "Approved loan #L2043", time: "10 mins ago", ip: "192.168.1.45" },
  { user: "Finance Officer", action: "Recorded expense ₦250,000", time: "30 mins ago", ip: "192.168.1.12" },
  { user: "Front Desk (PH)", action: "Registered new member", time: "1 hour ago", ip: "10.0.0.88" },
  { user: "Super Admin", action: "Updated system settings", time: "2 hours ago", ip: "192.168.1.1" },
  { user: "Loan Officer", action: "Created loan application #L2046", time: "3 hours ago", ip: "192.168.1.67" },
];

export default function AuditorDashboard() {
  const { user } = useAuth();

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
        {stats.map((s) => (
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
            {recentAuditLogs.map((l, i) => (
              <div key={i} className="flex gap-3">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                <div>
                  <p className="text-sm text-navy-900"><span className="font-medium">{l.user}</span> — {l.action}</p>
                  <p className="text-xs text-gray-400">{l.time} · {l.ip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Findings */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-navy-900 mb-4">Audit Findings</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="pb-3 font-medium">Severity</th>
                <th className="pb-3 font-medium">Finding</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {auditFindings.map((f, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0">
                  <td className="py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      f.severity === "High" ? "bg-red-100 text-red-700" :
                      f.severity === "Medium" ? "bg-amber-100 text-amber-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>{f.severity}</span>
                  </td>
                  <td className="py-3 font-medium text-navy-900 max-w-md">{f.desc}</td>
                  <td className="py-3 text-gray-400">{f.date}</td>
                  <td className="py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      f.status === "Open" ? "bg-red-100 text-red-700" :
                      f.status === "Resolved" ? "bg-green-100 text-green-700" :
                      f.status === "Escalated" ? "bg-purple-100 text-purple-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>{f.status}</span>
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
