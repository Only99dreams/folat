import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  PiggyBank,
  Landmark,
  AlertTriangle,
  Briefcase,
  MapPin,
  UserPlus,
  CreditCard,
  FileBarChart,
  Send,
  TrendingUp,
  TrendingDown,
  Diamond,
  Megaphone,
  ShieldAlert,
  X,
  Loader2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "../lib/supabase";
import { fetchDashboardStats, fetchRecentTransactions, fetchLoanApplications, fetchFundRequests, fetchAuditLog } from "../lib/db";
import { type UserRole, ROLE_LABELS } from "../auth/types";

/* ─── Chart data placeholder (populated from real data) ─── */
const defaultChartData = [
  { month: "JAN", savings: 0, loans: 0 },
  { month: "FEB", savings: 0, loans: 0 },
  { month: "MAR", savings: 0, loans: 0 },
  { month: "APR", savings: 0, loans: 0 },
  { month: "MAY", savings: 0, loans: 0 },
  { month: "JUN", savings: 0, loans: 0 },
  { month: "JUL", savings: 0, loans: 0 },
  { month: "AUG", savings: 0, loans: 0 },
  { month: "SEP", savings: 0, loans: 0 },
  { month: "OCT", savings: 0, loans: 0 },
  { month: "NOV", savings: 0, loans: 0 },
  { month: "DEC", savings: 0, loans: 0 },
];

/* ─── Stat Card ─── */
function StatCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  change,
  positive,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-3 overflow-hidden">
      <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold truncate">
            {label}
          </p>
          {change && (
            <span
              className={`text-[10px] font-semibold whitespace-nowrap flex-shrink-0 ${
                positive ? "text-green-600" : "text-red-500"
              }`}
            >
              {positive ? (
                <TrendingUp className="w-3 h-3 inline mr-0.5" />
              ) : (
                <TrendingDown className="w-3 h-3 inline mr-0.5" />
              )}
              {change}
            </span>
          )}
        </div>
        <p className={`text-xl font-bold mt-0.5 truncate ${label === "Overdue Loans" ? "text-red-500" : "text-navy-900"}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

/* ─── Pending Users Banner + Role Assignment ─── */
interface PendingUser {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
}

const assignableRoles: { value: UserRole; label: string }[] = (
  Object.entries(ROLE_LABELS) as [UserRole, string][]
)
  .filter(([key]) => key !== "unassigned" && key !== "super_admin")
  .map(([value, label]) => ({ value, label }));

function PendingUsersSection() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | "">("");
  const [assigning, setAssigning] = useState(false);

  const loadPendingUsers = useCallback(async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, created_at")
      .eq("role", "unassigned")
      .order("created_at", { ascending: false });
    if (data) setPendingUsers(data);
  }, []);

  useEffect(() => {
    loadPendingUsers();
  }, [loadPendingUsers]);

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) return;
    setAssigning(true);
    await supabase
      .from("profiles")
      .update({ role: selectedRole })
      .eq("id", selectedUser.id);
    setAssigning(false);
    setShowModal(false);
    setSelectedUser(null);
    setSelectedRole("");
    loadPendingUsers();
  };

  if (pendingUsers.length === 0) return null;

  return (
    <>
      {/* Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-amber-800">
              {pendingUsers.length} New User{pendingUsers.length > 1 ? "s" : ""} Pending Role Assignment
            </p>
            <p className="text-xs text-amber-600 truncate">
              Newly registered users are waiting for you to assign them a role.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors whitespace-nowrap"
        >
          Assign Roles
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                Pending Users ({pendingUsers.length})
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* User list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {pendingUsers.map((pu) => (
                <div
                  key={pu.id}
                  className={`border rounded-xl p-4 transition-colors ${
                    selectedUser?.id === pu.id
                      ? "border-amber-400 bg-amber-50"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {pu.full_name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{pu.email}</p>
                      <p className="text-[10px] text-gray-300 mt-0.5">
                        Registered {new Date(pu.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        value={selectedUser?.id === pu.id ? selectedRole : ""}
                        onChange={(e) => {
                          setSelectedUser(pu);
                          setSelectedRole(e.target.value as UserRole);
                        }}
                      >
                        <option value="">Select role...</option>
                        {assignableRoles.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                      <button
                        disabled={selectedUser?.id !== pu.id || !selectedRole || assigning}
                        onClick={handleAssignRole}
                        className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                      >
                        {assigning && selectedUser?.id === pu.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : null}
                        Assign
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Dashboard Page ─── */
export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentLoans, setRecentLoans] = useState<any[]>([]);
  const [urgentRequests, setUrgentRequests] = useState<any[]>([]);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [chartData, setChartData] = useState(defaultChartData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      const [dashStats, loans, fundReqs, auditRes] = await Promise.all([
        fetchDashboardStats(),
        fetchLoanApplications({ page: 1, pageSize: 5 }),
        fetchFundRequests({ status: "pending", page: 1, pageSize: 3 }),
        fetchAuditLog({ page: 1, pageSize: 5 }),
      ]);
      setStats(dashStats);
      setRecentLoans(loans.data);
      setUrgentRequests(fundReqs.data);
      setActivityLog(auditRes.data);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  }

  const fmt = (n: number) => {
    if (n >= 1e9) return `₦ ${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `₦ ${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `₦ ${(n / 1e3).toFixed(0)}K`;
    return `₦ ${n.toLocaleString()}`;
  };

  const loanStatusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    active: "bg-blue-100 text-blue-700",
    disbursed: "bg-green-100 text-green-700",
  };
  return (
    <div className="space-y-6">
      {/* ─── Pending Users Alert ─── */}
      <PendingUsersSection />

      {/* ─── Stats Row ─── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          icon={Users}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          label="Total Members"
          value={stats ? stats.totalMembers.toLocaleString() : "—"}
        />
        <StatCard
          icon={PiggyBank}
          iconBg="bg-green-50"
          iconColor="text-green-600"
          label="Total Savings"
          value={stats ? fmt(stats.totalSavings) : "—"}
        />
        <StatCard
          icon={Landmark}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
          label="Active Loans"
          value={stats ? fmt(stats.totalLoansOutstanding) : "—"}
        />
        <StatCard
          icon={AlertTriangle}
          iconBg="bg-red-50"
          iconColor="text-red-500"
          label="Overdue Loans"
          value={stats ? String(stats.pendingLoans) : "—"}
        />
        <StatCard
          icon={Briefcase}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          label="Total Staff"
          value={stats ? String(stats.totalStaff) : "—"}
        />
        <StatCard
          icon={MapPin}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
          label="Branches"
          value={stats ? String(stats.totalBranches) : "—"}
        />
      </div>

      {/* ─── Chart + Quick Actions / Loan Status ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="text-base font-bold text-navy-900">
                Savings vs Loans Trend
              </h3>
              <p className="text-xs text-gray-400">
                Performance across all branches for the current year
              </p>
            </div>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
              {["1Y", "6M", "3M"].map((t) => (
                <button
                  key={t}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    t === "1Y"
                      ? "bg-white text-navy-900 shadow-sm"
                      : "text-gray-400 hover:text-navy-900"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#109050" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#109050" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="loansGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="savings"
                  stroke="#109050"
                  strokeWidth={2}
                  fill="url(#savingsGrad)"
                  name="Savings (₦)"
                />
                <Area
                  type="monotone"
                  dataKey="loans"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#loansGrad)"
                  name="Loans (₦)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-5 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-600" />
              Savings (₦)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              Loans (₦)
            </span>
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-navy-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: UserPlus, label: "Add Member", to: "/members/add-cooperative" },
                { icon: CreditCard, label: "Disburse Loan", to: "/loans/new" },
                { icon: FileBarChart, label: "Gen Report", to: "/reports" },
                { icon: Send, label: "Bulk SMS", to: "/communication/sms" },
              ].map(({ icon: Icon, label, to }) => (
                <Link
                  key={label}
                  to={to || "#"}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50/30 transition-all text-gray-500 hover:text-green-700"
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Loan Status Overview */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-navy-900 mb-4">
              Loan Status Overview
            </h3>
            <div className="space-y-3">
              {(() => {
                const approved = stats?.activeLoans ?? 0;
                const pending = stats?.pendingLoans ?? 0;
                const total = approved + pending || 1;
                return [
                  { label: "Active / Approved", value: approved, pct: Math.round((approved / total) * 100), color: "bg-green-500" },
                  { label: "Pending", value: pending, pct: Math.round((pending / total) * 100), color: "bg-yellow-500" },
                ];
              })().map((s) => (
                <div key={s.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{s.label}</span>
                    <span className="font-semibold text-navy-900">{s.value}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${s.color}`}
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Recent Loan Applications + Urgent / Activity ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Loan Applications */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-navy-900">
              Recent Loan Applications
            </h3>
            <Link to="/loans" className="text-xs font-medium text-green-600 hover:underline">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] tracking-[0.1em] uppercase text-gray-400 border-b border-gray-100">
                  <th className="pb-3 font-semibold">Member Name</th>
                  <th className="pb-3 font-semibold">Branch</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Savings</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentLoans.length === 0 ? (
                  <tr><td colSpan={6} className="py-8 text-center text-gray-400 text-xs">No recent loan applications.</td></tr>
                ) : recentLoans.map((loan) => {
                  const memberName = loan.member ? `${loan.member.first_name} ${loan.member.last_name}` : "N/A";
                  const initials = memberName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
                  const statusCls = loanStatusColor[loan.status] || "bg-gray-100 text-gray-600";
                  return (
                  <tr key={loan.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-navy-100 text-navy-900 flex items-center justify-center text-xs font-bold">
                          {initials}
                        </span>
                        <span className="font-medium text-navy-900">
                          {memberName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-gray-500 text-xs">{loan.branch?.name || "—"}</td>
                    <td className="py-3 font-medium text-navy-900">
                      ₦ {Number(loan.amount_requested).toLocaleString()}
                    </td>
                    <td className="py-3 text-green-600 font-medium text-xs">
                      —
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusCls}`}
                      >
                        {loan.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-400 text-xs">{new Date(loan.created_at).toLocaleDateString()}</td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right panel: Urgent + Activity */}
        <div className="space-y-6">
          {/* Urgent Fund Requests */}
          <div className="bg-red-50 rounded-xl border border-red-100 p-5">
            <h3 className="text-sm font-bold text-red-600 flex items-center gap-1.5 mb-4">
              <Diamond className="w-4 h-4" />
              Pending Fund Requests ({urgentRequests.length})
            </h3>
            <div className="space-y-3">
              {urgentRequests.length === 0 ? (
                <p className="text-xs text-gray-400">No pending fund requests.</p>
              ) : urgentRequests.map((r) => (
                <div
                  key={r.id}
                  className="bg-white rounded-lg p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-navy-900">
                      {r.branch?.name || "Branch"}
                    </p>
                    <p className="text-[10px] text-gray-400">{r.description || r.purpose}</p>
                  </div>
                  <p className="text-sm font-bold text-navy-900">₦ {Number(r.amount).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-navy-900 mb-4 uppercase tracking-wide">
              Activity Log
            </h3>
            <div className="space-y-4">
              {activityLog.length === 0 ? (
                <p className="text-xs text-gray-400">No recent activity.</p>
              ) : activityLog.map((a) => {
                const ago = (() => {
                  const mins = Math.floor((Date.now() - new Date(a.created_at).getTime()) / 60000);
                  if (mins < 60) return `${mins} mins ago`;
                  if (mins < 1440) return `${Math.floor(mins / 60)} hours ago`;
                  return `${Math.floor(mins / 1440)} days ago`;
                })();
                return (
                <div key={a.id} className="flex items-start gap-3">
                  <span className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 bg-green-500" />
                  <div>
                    <p className="text-xs text-navy-900 font-medium">{a.user?.full_name || "System"} — {a.action} {a.entity_type}</p>
                    <p className="text-[10px] text-gray-400">{ago}</p>
                  </div>
                </div>
                );
              })}
            </div>
            <Link to="/audit-log" className="mt-4 text-xs font-medium text-gray-400 hover:text-navy-900 transition-colors block">
              View Full Audit Log
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Bottom Row: Ranks + Announcements + Overdue Alerts ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Branch Performance Rank */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-navy-900 mb-4">
            Branch Performance Rank
          </h3>
          <div className="space-y-3">
            <p className="text-xs text-gray-400">No branch rankings available yet.</p>
          </div>
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-navy-900">Recent Activity</h3>
            {activityLog.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">
              {Math.min(activityLog.length, 9)}
            </span>
            )}
          </div>
          <div className="space-y-4">
            {activityLog.length > 0 ? activityLog.slice(0, 2).map((a: any, i: number) => (
              <div key={a.id || i} className={`border-l-2 ${i === 0 ? 'border-orange-400' : 'border-blue-400'} pl-3`}>
                <div className="flex items-center gap-2">
                  <Megaphone className={`w-3.5 h-3.5 ${i === 0 ? 'text-orange-500' : 'text-blue-500'}`} />
                  <p className="text-xs font-bold text-navy-900 truncate">
                    {a.action} {a.entity_type}
                  </p>
                </div>
                <p className="text-[10px] text-gray-400 mb-1">
                  {a.created_at ? new Date(a.created_at).toLocaleDateString("en-NG", { month: "short", day: "numeric" }) : ""} {a.user?.full_name ? `by ${a.user.full_name}` : ""}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed truncate">
                  {a.entity_type} #{a.entity_id?.slice(0, 8) || "—"}
                </p>
              </div>
            )) : (
              <p className="text-xs text-gray-400">No recent activity</p>
            )}
          </div>
        </div>

        {/* Overdue Loan Alerts */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-navy-900 mb-4">
            Overdue Loan Alerts
          </h3>
          <div className="space-y-3">
            {recentLoans.filter(l => l.status === "overdue" || l.status === "defaulted").length === 0 ? (
              <p className="text-xs text-gray-400">No overdue loans.</p>
            ) : recentLoans.filter(l => l.status === "overdue" || l.status === "defaulted").map((a) => (
              <div key={a.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-navy-900">{a.member ? `${a.member.first_name} ${a.member.last_name}` : "N/A"}</p>
                  <p className="text-[10px] text-red-500">{a.status}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-navy-900">
                    ₦ {Number(a.amount_requested).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
