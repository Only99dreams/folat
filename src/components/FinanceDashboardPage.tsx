import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Download,
  DollarSign,
  FileText,
  ClipboardList,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Loader2,
  PenLine,
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
import { fetchFinanceTransactions, fetchFundRequests, getTotalAvailableFunds, fetchLoanApplications, fetchDashboardStats } from "../lib/db";
import { useAuth } from "../auth/useAuth";
import { supabase } from "../lib/supabase";
import ExportMenu from "./ExportMenu";

/* ─── Quick Actions ─── */
const quickActions = [
  {
    icon: DollarSign,
    iconBg: "bg-navy-900",
    label: "Record Income",
    desc: "Log new incoming funds",
    to: "/finance/add-income",
  },
  {
    icon: ClipboardList,
    iconBg: "bg-green-600",
    label: "Record Expense",
    desc: "Document new expenditures",
    to: "/finance/add-expense",
  },
  {
    icon: BookOpen,
    iconBg: "bg-green-600",
    label: "View Ledger",
    desc: "Audit all accounting entries",
    to: "/finance/ledger",
  },
  {
    icon: FileText,
    iconBg: "bg-green-600",
    label: "Review Fund Requests",
    desc: "Approve or reject pendings",
    to: "/finance/fund-requests",
  },
  {
    icon: DollarSign,
    iconBg: "bg-navy-900",
    label: "Available Funds",
    desc: "Manage funds for loans",
    to: "/finance/available-funds",
  },
  {
    icon: CheckCircle2,
    iconBg: "bg-green-600",
    label: "Review Loans",
    desc: "Approve or reject pending",
    to: "/loans",
  },
  {
    icon: BarChart3,
    iconBg: "bg-navy-900",
    label: "Generate Reports",
    desc: "Custom business intelligence",
    to: "",
  },
];

/* ─── Transaction Data ─── */
const avatarColors = ["bg-gray-300","bg-green-600","bg-blue-500","bg-amber-500","bg-purple-500"];

const typeBadge = (type: string) => {
  const styles: Record<string, string> = {
    income: "bg-green-100 text-green-700",
    expense: "bg-red-100 text-red-600",
  };
  return (
    <span className={`inline-flex px-2.5 py-1 rounded text-[10px] font-bold tracking-wider uppercase ${styles[type] ?? "bg-gray-100 text-gray-600"}`}>
      {type}
    </span>
  );
};

export default function FinanceDashboardPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const isFinanceUser = user && ["finance_officer", "super_admin", "auditor"].includes(user.role);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [pendingLoanApprovals, setPendingLoanApprovals] = useState(0);
  const [approvedLoanCount, setApprovedLoanCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [availableFunds, setAvailableFunds] = useState(0);
  const [dashboardStats, setDashboardStats] = useState<{
    totalMembers: number;
    activeLoans: number;
    totalSavings: number;
    totalBranches: number;
    totalStaff: number;
  } | null>(null);
  const [branchFilterId, setBranchFilterId] = useState<string | null>(null);
  const isRestricted = user?.role === "branch_manager" || user?.role === "secretary" || user?.role === "officer";

  useEffect(() => {
    if (!isRestricted || !user?.branch) return;
    (async () => {
      const { data } = await supabase
        .from("branches")
        .select("id")
        .ilike("name", user.branch)
        .maybeSingle();
      if (data?.id) setBranchFilterId(data.id);
    })();
  }, [isRestricted, user?.branch]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const isFinanceUser = user && ["finance_officer", "super_admin", "auditor"].includes(user.role);
        const incomePageSize = isFinanceUser ? 10000 : 1000;
        const expensePageSize = isFinanceUser ? 10000 : 1000;
        const recentPageSize = isFinanceUser ? 20 : 5;

        const financeFilters = branchFilterId ? { branch_id: branchFilterId } : {};

        const [incRes, expRes, txnRes, frRes, fundsRes, pendingLoansRes, approvedLoansRes, statsRes] = await Promise.all([
          fetchFinanceTransactions({ type: "income", pageSize: incomePageSize, ...financeFilters }),
          fetchFinanceTransactions({ type: "expense", pageSize: expensePageSize, ...financeFilters }),
          fetchFinanceTransactions({ pageSize: recentPageSize, ...financeFilters }),
          fetchFundRequests({ status: "pending", ...financeFilters }),
          getTotalAvailableFunds(),
          fetchLoanApplications({ status: "pending", pageSize: 1, branch_id: branchFilterId || undefined, user: user ? { id: user.id, role: user.role, branch: user.branch } : undefined }),
          fetchLoanApplications({ status: "approved", pageSize: 1, branch_id: branchFilterId || undefined, user: user ? { id: user.id, role: user.role, branch: user.branch } : undefined }),
          fetchDashboardStats(undefined, user ? { id: user.id, role: user.role, branch: user.branch } : undefined),
        ]);

        const incTotal = incRes.data.reduce((s: number, t: any) => s + Number(t.amount ?? 0), 0);
        const expTotal = expRes.data.reduce((s: number, t: any) => s + Number(t.amount ?? 0), 0);
        setTotalIncome(incTotal);
        setTotalExpenses(expTotal);
        setAvailableFunds(Number(fundsRes) || 0);

        // If finance user, show a larger recent list; otherwise show default recent set
        setTransactions(txnRes.data);
        setPendingRequests(frRes.count);
        setPendingLoanApprovals(pendingLoansRes.count);
        setApprovedLoanCount(approvedLoansRes.count);
        setDashboardStats(statsRes);

        // Build chart data by grouping income/expense by month
        const monthOrder: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
        const months: Record<string, { income: number; expenses: number; sortKey: string }> = {};
        for (const t of incRes.data) {
          const d = new Date(t.date);
          const m = d.toLocaleString("default", { month: "short" });
          const y = d.getFullYear();
          const key = `${y}-${m}`;
          if (!months[key]) months[key] = { income: 0, expenses: 0, sortKey: `${y}-${String(monthOrder[m] ?? 0).padStart(2, "0")}` };
          months[key].income += Number(t.amount ?? 0);
        }
        for (const t of expRes.data) {
          const d = new Date(t.date);
          const m = d.toLocaleString("default", { month: "short" });
          const y = d.getFullYear();
          const key = `${y}-${m}`;
          if (!months[key]) months[key] = { income: 0, expenses: 0, sortKey: `${y}-${String(monthOrder[m] ?? 0).padStart(2, "0")}` };
          months[key].expenses += Number(t.amount ?? 0);
        }
        const sortedEntries = Object.entries(months).sort((a, b) => a[1].sortKey.localeCompare(b[1].sortKey));
        setChartData(sortedEntries.map(([key, v]) => ({ month: key.split("-")[1], income: v.income, expenses: v.expenses, profit: v.income - v.expenses })));
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    })();
  }, [user, branchFilterId]);
  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">
            Finance Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor income, expenses, and financial performance across all
            branches.
          </p>
          {isFinanceUser ? (
            <p className="text-xs text-green-600 font-semibold mt-1">Showing organization-wide transactions</p>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <Link to="/finance/add-income" className="flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition-colors">
            <Plus className="w-4 h-4" />
            Add Income
          </Link>
          <Link to="/finance/add-expense" className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
            <Plus className="w-4 h-4" />
            Add Expense
          </Link>
          <ExportMenu data={() => transactions.map((t: any) => ({ Date: t.date || t.created_at, Description: t.description, Type: t.type, Category: t.category || '', Amount: t.amount, Reference: t.reference || '' }))} filename="finance_report" label="Export Financial Report" />
        </div>
      </div>

      {/* ─── Stat Cards ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Income */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs text-gray-400 font-medium mb-1">
            Total Income
          </p>
          <p className="text-2xl font-bold text-navy-900">₦{totalIncome.toLocaleString()}</p>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs text-gray-400 font-medium mb-1">
            Total Expenses
          </p>
          <p className="text-2xl font-bold text-navy-900">₦{totalExpenses.toLocaleString()}</p>
        </div>

        {/* Net Profit */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs text-gray-400 font-medium mb-1">Net Profit</p>
          <p className="text-2xl font-bold text-green-600">₦{(totalIncome - totalExpenses).toLocaleString()}</p>
        </div>

        {/* Available Funds */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs text-gray-400 font-medium mb-1">Available Funds</p>
          <p className="text-2xl font-bold text-navy-900">₦{availableFunds.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">For loan disbursement</p>
        </div>

        {/* Pending Loan Approvals */}
        <Link to="/loans" className="bg-white rounded-xl border border-gray-100 p-5 hover:border-navy-900/30 transition-colors">
          <p className="text-xs text-gray-400 font-medium mb-1">Pending Loans</p>
          <p className="text-2xl font-bold text-navy-900">{pendingLoanApprovals}</p>
          <p className="text-xs text-amber-500 font-medium mt-1 flex items-center gap-1">
            <span>↗</span> awaiting review
          </p>
        </Link>

        {/* Approved Loans */}
        <Link to="/loans" className="bg-white rounded-xl border border-gray-100 p-5 hover:border-navy-900/30 transition-colors">
          <p className="text-xs text-gray-400 font-medium mb-1">Approved Loans</p>
          <p className="text-2xl font-bold text-navy-900">{approvedLoanCount}</p>
          <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
            <span>✓</span> ready for disbursement
          </p>
        </Link>

        {/* Total Members */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs text-gray-400 font-medium mb-1">Total Members</p>
          <p className="text-2xl font-bold text-navy-900">{dashboardStats?.totalMembers.toLocaleString() ?? "—"}</p>
        </div>

        {/* Total Branches */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs text-gray-400 font-medium mb-1">Branches</p>
          <p className="text-2xl font-bold text-navy-900">{dashboardStats?.totalBranches.toLocaleString() ?? "—"}</p>
        </div>

        {/* Total Savings */}
        <Link to="/savings" className="bg-white rounded-xl border border-gray-100 p-5 hover:border-navy-900/30 transition-colors">
          <p className="text-xs text-gray-400 font-medium mb-1">Total Savings</p>
          <p className="text-2xl font-bold text-green-600">₦{dashboardStats?.totalSavings.toLocaleString() ?? "—"}</p>
        </Link>

        {/* Active Loans */}
        <Link to="/loans/active" className="bg-white rounded-xl border border-gray-100 p-5 hover:border-navy-900/30 transition-colors">
          <p className="text-xs text-gray-400 font-medium mb-1">Active Loans</p>
          <p className="text-2xl font-bold text-navy-900">{dashboardStats?.activeLoans.toLocaleString() ?? "—"}</p>
        </Link>

        {/* Total Staff */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs text-gray-400 font-medium mb-1">Total Staff</p>
          <p className="text-2xl font-bold text-navy-900">{dashboardStats?.totalStaff.toLocaleString() ?? "—"}</p>
        </div>

        {/* Pending Requests */}
        <Link to="/finance/fund-requests" className="bg-white rounded-xl border border-gray-100 p-5 hover:border-navy-900/30 transition-colors">
          <p className="text-xs text-gray-400 font-medium mb-1">Pending Requests</p>
          <p className="text-2xl font-bold text-navy-900">{pendingRequests}</p>
          <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
            <span>⚡</span> Action Required
          </p>
        </Link>
      </div>

      {/* ─── Chart + Quick Actions ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Performance Chart */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-navy-900">
              Financial Performance
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-navy-900" />
                <span className="text-xs text-gray-500">Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="text-xs text-gray-500">Expenses</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="text-xs text-gray-500">Profit</span>
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            {chartData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-gray-400">
                {loading ? "Loading chart data..." : "No financial data available yet. Record income or expenses to see the performance chart."}
              </div>
            ) : (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1a2744" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#1a2744" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fillExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f87171" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#f87171" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fillProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#94a3b8" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#1a2744"
                strokeWidth={2}
                fill="url(#fillIncome)"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#f87171"
                strokeWidth={2}
                fill="url(#fillExpenses)"
              />
              <Area
                type="monotone"
                dataKey="profit"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#fillProfit)"
              />
            </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-navy-900 mb-5">
            Quick Actions
          </h2>

          <div className="space-y-3">
            {quickActions.map((action, i) => (
              <Link
                key={i}
                to={action.to || "#"}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${action.iconBg}`}
                >
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy-900">
                    {action.label}
                  </p>
                  <p className="text-xs text-gray-400">{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Recent Transactions ─── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-navy-900">
            Recent Transactions
          </h2>
          <Link to="/finance/ledger" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            View All Transactions
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Date
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Type
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Category
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Amount
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Branch
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Recorded By
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" /></td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-sm text-gray-400">No transactions found</td></tr>
              ) : transactions.map((txn, i) => (
                <tr key={txn.id ?? i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4"><p className="text-sm text-gray-600">{new Date(txn.date).toLocaleDateString()}</p></td>
                  <td className="px-4 py-4">{typeBadge(txn.type)}</td>
                  <td className="px-4 py-4"><p className="text-sm text-navy-900">{txn.category}</p></td>
                  <td className="px-4 py-4"><p className="text-sm font-semibold text-navy-900">₦{Number(txn.amount).toLocaleString()}</p></td>
                  <td className="px-4 py-4"><p className="text-sm text-gray-600">{txn.branch?.name ?? '—'}</p></td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex-shrink-0 ${avatarColors[i % avatarColors.length]}`} />
                      <p className="text-sm text-gray-600">{txn.recorder?.full_name ?? '—'}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center"><CheckCircle2 className="w-5 h-5 text-green-500 inline-block" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
