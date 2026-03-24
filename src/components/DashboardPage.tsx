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

/* ─── Mock data ─── */
const chartData = [
  { month: "JAN", savings: 800, loans: 500 },
  { month: "FEB", savings: 950, loans: 600 },
  { month: "MAR", savings: 1100, loans: 550 },
  { month: "APR", savings: 900, loans: 700 },
  { month: "MAY", savings: 1050, loans: 800 },
  { month: "JUN", savings: 1300, loans: 750 },
  { month: "JUL", savings: 1150, loans: 650 },
  { month: "AUG", savings: 1250, loans: 700 },
  { month: "SEP", savings: 1400, loans: 800 },
  { month: "OCT", savings: 1350, loans: 900 },
  { month: "NOV", savings: 1500, loans: 850 },
  { month: "DEC", savings: 1600, loans: 950 },
];

const recentLoans = [
  {
    initials: "JD",
    name: "John Doe",
    branch: "Ikeja Central",
    amount: "₦ 250,000",
    savings: "₦ 850,000",
    status: "Under Review",
    statusColor: "bg-yellow-100 text-yellow-700",
    date: "Oct 24, 2023",
  },
  {
    initials: "AA",
    name: "Aisha Abubakar",
    branch: "Abuja North",
    amount: "₦ 1,200,000",
    savings: "₦ 4,500,000",
    status: "Pre-Approved",
    statusColor: "bg-green-100 text-green-700",
    date: "Oct 24, 2023",
  },
  {
    initials: "CN",
    name: "Chidi Nwosu",
    branch: "Enugu East",
    amount: "₦ 500,000",
    savings: "₦ 120,000",
    status: "Low Savings",
    statusColor: "bg-red-100 text-red-700",
    date: "Oct 23, 2023",
  },
];

const urgentRequests = [
  { branch: "Lagos West Branch", desc: "Petty Cash Topup", amount: "₦ 50,000" },
  { branch: "Port Harcourt", desc: "Office Maintenance", amount: "₦ 125,000" },
];

const activityLog = [
  { color: "bg-green-500", text: "Super Admin approved loan #L1922", time: "2 mins ago" },
  { color: "bg-blue-500", text: "Branch Mgr (Ikeja) logged in", time: "14 mins ago" },
  { color: "bg-gray-400", text: "System generated monthly report", time: "1 hour ago" },
];

const branchRanks = [
  { rank: "01", initial: "L", color: "bg-purple-100 text-purple-700", name: "Lagos Central", vol: "₦ 420M Vol." },
  { rank: "02", initial: "A", color: "bg-green-100 text-green-700", name: "Abuja Main", vol: "₦ 385M Vol." },
  { rank: "03", initial: "P", color: "bg-pink-100 text-pink-700", name: "Port Harcourt", vol: "₦ 290M Vol." },
];

const overdueLoanAlerts = [
  { name: "Samuel Efio", days: "14 Days Overdue", amount: "₦ 42,000" },
  { name: "Grace Odu", days: "18 Days Overdue", amount: "₦ 15,500" },
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

/* ─── Dashboard Page ─── */
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* ─── Stats Row ─── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          icon={Users}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          label="Total Members"
          value="12,845"
          change="+2.4%"
          positive
        />
        <StatCard
          icon={PiggyBank}
          iconBg="bg-green-50"
          iconColor="text-green-600"
          label="Total Savings"
          value="₦ 1.8B"
          change="+5.1%"
          positive
        />
        <StatCard
          icon={Landmark}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
          label="Active Loans"
          value="₦ 320M"
          change="-1.2%"
          positive={false}
        />
        <StatCard
          icon={AlertTriangle}
          iconBg="bg-red-50"
          iconColor="text-red-500"
          label="Overdue Loans"
          value="₦ 12.5M"
          change="+0.8%"
          positive={false}
        />
        <StatCard
          icon={Briefcase}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          label="Total Staff"
          value="145"
        />
        <StatCard
          icon={MapPin}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
          label="Branches"
          value="12"
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
                { icon: FileBarChart, label: "Gen Report", to: "" },
                { icon: Send, label: "Bulk SMS", to: "" },
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
              {[
                { label: "Approved", value: 450, pct: 74, color: "bg-green-500" },
                { label: "Pending", value: 124, pct: 20, color: "bg-yellow-500" },
                { label: "Overdue", value: 32, pct: 6, color: "bg-red-500" },
              ].map((s) => (
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
                {recentLoans.map((loan, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-navy-100 text-navy-900 flex items-center justify-center text-xs font-bold">
                          {loan.initials}
                        </span>
                        <span className="font-medium text-navy-900">
                          {loan.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-gray-500 text-xs">{loan.branch}</td>
                    <td className="py-3 font-medium text-navy-900">
                      {loan.amount}
                    </td>
                    <td className="py-3 text-green-600 font-medium text-xs">
                      {loan.savings}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${loan.statusColor}`}
                      >
                        {loan.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-400 text-xs">{loan.date}</td>
                  </tr>
                ))}
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
              Urgent Fund Requests ({urgentRequests.length})
            </h3>
            <div className="space-y-3">
              {urgentRequests.map((r, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-navy-900">
                      {r.branch}
                    </p>
                    <p className="text-[10px] text-gray-400">{r.desc}</p>
                  </div>
                  <p className="text-sm font-bold text-navy-900">{r.amount}</p>
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
              {activityLog.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span
                    className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${a.color}`}
                  />
                  <div>
                    <p className="text-xs text-navy-900 font-medium">{a.text}</p>
                    <p className="text-[10px] text-gray-400">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 text-xs font-medium text-gray-400 hover:text-navy-900 transition-colors">
              Load More Activity
            </button>
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
            {branchRanks.map((b) => (
              <div key={b.rank} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-300 w-5">
                  {b.rank}
                </span>
                <span
                  className={`w-8 h-8 rounded-lg ${b.color} flex items-center justify-center text-xs font-bold`}
                >
                  {b.initial}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-navy-900">{b.name}</p>
                </div>
                <span className="text-xs text-green-600 font-semibold">
                  {b.vol}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-navy-900">Announcements</h3>
            <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">
              2
            </span>
          </div>
          <div className="space-y-4">
            <div className="border-l-2 border-orange-400 pl-3">
              <div className="flex items-center gap-2">
                <Megaphone className="w-3.5 h-3.5 text-orange-500" />
                <p className="text-xs font-bold text-navy-900">
                  System Maintenance Schedule
                </p>
              </div>
              <p className="text-[10px] text-gray-400 mb-1">
                Posted Oct 24 by Tech Lead
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                The system will be offline for 2 hours on Sunday for database
                optimization...
              </p>
            </div>
            <div className="border-l-2 border-blue-400 pl-3">
              <div className="flex items-center gap-2">
                <Megaphone className="w-3.5 h-3.5 text-blue-500" />
                <p className="text-xs font-bold text-navy-900">
                  New Loan Policy Update
                </p>
              </div>
              <p className="text-[10px] text-gray-400 mb-1">
                Posted Oct 22 by Fin Dept
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                Effective immediately, interest rates for personal loans have
                been adjusted...
              </p>
            </div>
          </div>
        </div>

        {/* Overdue Loan Alerts */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-navy-900 mb-4">
            Overdue Loan Alerts
          </h3>
          <div className="space-y-3">
            {overdueLoanAlerts.map((a, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-navy-900">{a.name}</p>
                  <p className="text-[10px] text-red-500">{a.days}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-navy-900">
                    {a.amount}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-600">
                    Call
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
