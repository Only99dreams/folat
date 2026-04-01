import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Loader2,
} from "lucide-react";
import { fetchLoanApplications } from "../lib/db";

export default function LoanOfficerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [overdueAlerts, setOverdueAlerts] = useState<any[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    (async () => {
      try {
        const [recent, pending, overdue, approved] = await Promise.all([
          fetchLoanApplications({ page: 1, pageSize: 5 }),
          fetchLoanApplications({ status: "pending", page: 1, pageSize: 1 }),
          fetchLoanApplications({ status: "overdue", page: 1, pageSize: 5 }),
          fetchLoanApplications({ status: "approved", page: 1, pageSize: 1 }),
        ]);
        setRecentApplications(recent.data);
        setPendingCount(pending.count);
        setOverdueAlerts(overdue.data);
        setOverdueCount(overdue.count);
        setApprovedCount(approved.count);
        setActiveCount(recent.count);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const loanStatusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    disbursed: "bg-blue-100 text-blue-700",
    active: "bg-blue-100 text-blue-700",
    rejected: "bg-red-100 text-red-700",
    overdue: "bg-red-100 text-red-700",
    completed: "bg-gray-100 text-gray-600",
  };

  const stats = [
    { label: "Total Applications", value: String(activeCount), change: "", icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Pending Review", value: String(pendingCount), change: "Awaiting approval", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Approved", value: String(approvedCount), change: "", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
    { label: "Overdue Loans", value: String(overdueCount), change: overdueCount > 0 ? "Follow up needed" : "", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Loan Officer Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome, {user?.name} — {user?.branch}</p>
        </div>
        <Link to="/loans/new" className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700">
          <FileText className="w-4 h-4" /> New Application
        </Link>
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
            {s.change && <p className="text-xs text-gray-400">{s.change}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-navy-900">Recent Applications</h2>
            <Link to="/loans" className="text-sm font-medium text-green-600 hover:text-green-700">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                  <th className="pb-3 font-medium">Loan ID</th>
                  <th className="pb-3 font-medium">Member</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentApplications.length === 0 ? (
                  <tr><td colSpan={5} className="py-6 text-center text-gray-400 text-sm">No applications yet.</td></tr>
                ) : recentApplications.map((l: any) => {
                  const memberName = l.member ? `${l.member.first_name} ${l.member.last_name}` : "—";
                  const mins = Math.floor((now - new Date(l.created_at).getTime()) / 60000);
                  const ago = mins < 60 ? `${mins}m ago` : mins < 1440 ? `${Math.floor(mins / 60)}h ago` : `${Math.floor(mins / 1440)}d ago`;
                  return (
                  <tr key={l.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 font-mono text-navy-900 font-medium">{l.loan_id || l.id?.slice(0, 8)}</td>
                    <td className="py-3 text-navy-900">{memberName}</td>
                    <td className="py-3 font-bold text-navy-900">₦ {Number(l.amount_requested).toLocaleString()}</td>
                    <td className="py-3"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${loanStatusColor[l.status] || "bg-gray-100 text-gray-600"}`}>{l.status?.charAt(0).toUpperCase() + l.status?.slice(1)}</span></td>
                    <td className="py-3 text-gray-400">{ago}</td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Overdue Alerts */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" /> Overdue Alerts
            </h2>
            <div className="space-y-3">
              {overdueAlerts.length === 0 ? (
                <p className="text-sm text-gray-400">No overdue loans.</p>
              ) : overdueAlerts.map((o: any) => {
                const memberName = o.member ? `${o.member.first_name} ${o.member.last_name}` : "—";
                return (
                <div key={o.id} className="p-3 rounded-xl bg-red-50 border border-red-100">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-navy-900">{memberName}</p>
                    <p className="text-xs font-bold text-red-600">Overdue</p>
                  </div>
                  <p className="text-xs text-gray-500">{o.loan_id || o.id?.slice(0, 8)} — ₦ {Number(o.amount_requested).toLocaleString()}</p>
                </div>
                );
              })}
            </div>
          </div>

          {/* Today's Tasks */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-navy-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {[
                { task: "View all loan applications", to: "/loans" },
                { task: "Create new loan application", to: "/loans/new" },
                { task: "Record loan repayment", to: "/loans/record-repayment" },
                { task: "Check overdue loans", to: "/loans/overdue" },
              ].map((t, i) => (
                <Link key={i} to={t.to} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50">
                  <ClipboardList className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-navy-900">{t.task}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
