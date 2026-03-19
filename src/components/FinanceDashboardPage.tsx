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
  Shield,
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

/* ─── Chart Data ─── */
const chartData = [
  { month: "Jan", income: 1800, expenses: 900, profit: 900 },
  { month: "Feb", income: 2200, expenses: 1100, profit: 1100 },
  { month: "Mar", income: 2000, expenses: 800, profit: 1200 },
  { month: "Apr", income: 2600, expenses: 1200, profit: 1400 },
  { month: "May", income: 2400, expenses: 1000, profit: 1400 },
  { month: "Jun", income: 2800, expenses: 1100, profit: 1700 },
];

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
    icon: BarChart3,
    iconBg: "bg-navy-900",
    label: "Generate Reports",
    desc: "Custom business intelligence",
    to: "",
  },
];

/* ─── Transaction Data ─── */
interface Transaction {
  date: string;
  type: "Income" | "Expense";
  category: string;
  amount: string;
  branch: string;
  recordedBy: string;
  avatarColor: string;
}

const transactions: Transaction[] = [
  {
    date: "Oct 24, 2023",
    type: "Income",
    category: "Member Dues",
    amount: "₦450,000",
    branch: "Lagos Central",
    recordedBy: "Adebayo O.",
    avatarColor: "bg-gray-300",
  },
  {
    date: "Oct 23, 2023",
    type: "Expense",
    category: "Office Supplies",
    amount: "₦28,500",
    branch: "Abuja Branch",
    recordedBy: "Sarah J.",
    avatarColor: "bg-green-600",
  },
  {
    date: "Oct 24, 2023",
    type: "Income",
    category: "Member Dues",
    amount: "₦450,000",
    branch: "Lagos Central",
    recordedBy: "Adebayo O.",
    avatarColor: "bg-gray-300",
  },
  {
    date: "Oct 23, 2023",
    type: "Expense",
    category: "Office Supplies",
    amount: "₦28,500",
    branch: "Abuja Branch",
    recordedBy: "Sarah J.",
    avatarColor: "bg-green-600",
  },
];

const typeBadge = (type: Transaction["type"]) => {
  const styles: Record<string, string> = {
    Income: "bg-green-100 text-green-700",
    Expense: "bg-red-100 text-red-600",
  };
  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded text-[10px] font-bold tracking-wider ${styles[type]}`}
    >
      {type}
    </span>
  );
};

export default function FinanceDashboardPage() {
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
          <button className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export Financial Report
          </button>
        </div>
      </div>

      {/* ─── Stat Cards ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Income */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs text-gray-400 font-medium mb-1">
            Total Income
          </p>
          <p className="text-2xl font-bold text-navy-900">₦12.4M</p>
          <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
            <span>↗</span> +12.5%
          </p>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs text-gray-400 font-medium mb-1">
            Total Expenses
          </p>
          <p className="text-2xl font-bold text-navy-900">₦5.2M</p>
          <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
            <span>↘</span> -5.2%
          </p>
        </div>

        {/* Net Profit */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs text-gray-400 font-medium mb-1">Net Profit</p>
          <p className="text-2xl font-bold text-green-600">₦7.2M</p>
          <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
            <span>↗</span> +8.4%
          </p>
        </div>

        {/* Total Cash Balance */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs text-gray-400 font-medium mb-1">
            Total Cash Balance
          </p>
          <p className="text-2xl font-bold text-navy-900">₦25.6M</p>
          <p className="text-xs text-gray-400 font-medium mt-1 flex items-center gap-1">
            <Shield className="w-3 h-3" /> Current
          </p>
        </div>

        {/* Pending Requests */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs text-gray-400 font-medium mb-1">
            Pending Requests
          </p>
          <p className="text-2xl font-bold text-navy-900">14</p>
          <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
            <span>⚡</span> Action Required
          </p>
        </div>
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
                hide
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
              {transactions.map((txn, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  {/* Date */}
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">{txn.date}</p>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-4">{typeBadge(txn.type)}</td>

                  {/* Category */}
                  <td className="px-4 py-4">
                    <p className="text-sm text-navy-900">{txn.category}</p>
                  </td>

                  {/* Amount */}
                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold text-navy-900">
                      {txn.amount}
                    </p>
                  </td>

                  {/* Branch */}
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-600">{txn.branch}</p>
                  </td>

                  {/* Recorded By */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-full flex-shrink-0 ${txn.avatarColor}`}
                      />
                      <p className="text-sm text-gray-600">{txn.recordedBy}</p>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4 text-center">
                    <CheckCircle2 className="w-5 h-5 text-green-500 inline-block" />
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
