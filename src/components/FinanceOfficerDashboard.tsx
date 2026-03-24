import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
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
const revenueData = [
  { month: "Jan", income: 1800, expenses: 900 },
  { month: "Feb", income: 2200, expenses: 1100 },
  { month: "Mar", income: 2000, expenses: 800 },
  { month: "Apr", income: 2600, expenses: 1200 },
  { month: "May", income: 2400, expenses: 1000 },
  { month: "Jun", income: 2800, expenses: 1100 },
];

const stats = [
  { label: "Total Income (MTD)", value: "₦ 14.8M", change: "+12.5%", up: true, icon: ArrowUpRight, color: "text-green-600", bg: "bg-green-50" },
  { label: "Total Expenses (MTD)", value: "₦ 6.1M", change: "+3.2%", up: false, icon: ArrowDownRight, color: "text-red-600", bg: "bg-red-50" },
  { label: "Net Profit", value: "₦ 8.7M", change: "+18.1%", up: true, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Pending Disbursements", value: "₦ 2.3M", change: "4 loans", up: false, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
];

const recentTransactions = [
  { type: "income", desc: "Loan interest — Batch #B421", amount: "+₦ 425,000", time: "10 mins ago", status: "Recorded" },
  { type: "expense", desc: "Office supplies — Lagos HQ", amount: "-₦ 85,000", time: "45 mins ago", status: "Approved" },
  { type: "income", desc: "Membership fees — 12 new members", amount: "+₦ 120,000", time: "2 hours ago", status: "Recorded" },
  { type: "expense", desc: "Staff welfare — Abuja branch", amount: "-₦ 150,000", time: "3 hours ago", status: "Pending" },
  { type: "income", desc: "Loan repayment — Batch #B420", amount: "+₦ 890,000", time: "5 hours ago", status: "Recorded" },
];

const pendingApprovals = [
  { from: "Ikeja Branch", desc: "Petty cash top-up", amount: "₦ 75,000" },
  { from: "PH Branch", desc: "Equipment purchase", amount: "₦ 250,000" },
  { from: "Abuja Branch", desc: "Office maintenance", amount: "₦ 125,000" },
];

export default function FinanceOfficerDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Finance Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.name}. Here's your financial overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/finance/add-income" className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700">
            <DollarSign className="w-4 h-4" /> Record Income
          </Link>
          <Link to="/finance/add-expense" className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50">
            <CreditCard className="w-4 h-4" /> Record Expense
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
              <span className={`text-xs font-medium ${s.up ? "text-green-600" : "text-red-500"}`}>{s.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-navy-900">Income vs Expenses</h2>
            <Link to="/finance/ledger" className="text-sm text-green-600 font-medium hover:text-green-700">View Ledger</Link>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} />
                <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} />
                <Tooltip />
                <Area type="monotone" dataKey="income" stroke="#109050" fill="#109050" fillOpacity={0.1} />
                <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pending Fund Requests */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-navy-900">Pending Requests</h2>
            <Link to="/finance/fund-requests" className="text-sm text-green-600 font-medium hover:text-green-700">View All</Link>
          </div>
          <div className="space-y-4">
            {pendingApprovals.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-100">
                <div>
                  <p className="text-sm font-medium text-navy-900">{p.from}</p>
                  <p className="text-xs text-gray-500">{p.desc}</p>
                </div>
                <p className="text-sm font-bold text-amber-700">{p.amount}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-navy-900">Recent Transactions</h2>
          <Link to="/finance/ledger" className="text-sm font-medium text-green-600 hover:text-green-700">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Description</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((t, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0">
                  <td className="py-3">
                    {t.type === "income" ? (
                      <span className="flex items-center gap-1 text-green-600"><TrendingUp className="w-3.5 h-3.5" /> Income</span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-500"><TrendingDown className="w-3.5 h-3.5" /> Expense</span>
                    )}
                  </td>
                  <td className="py-3 font-medium text-navy-900">{t.desc}</td>
                  <td className={`py-3 font-bold ${t.type === "income" ? "text-green-600" : "text-red-500"}`}>{t.amount}</td>
                  <td className="py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      t.status === "Recorded" ? "bg-green-100 text-green-700" :
                      t.status === "Approved" ? "bg-blue-100 text-blue-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>{t.status}</span>
                  </td>
                  <td className="py-3 text-gray-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{t.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
