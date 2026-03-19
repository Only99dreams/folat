import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CreditCard,
  Upload,
  FileDown,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

/* ─── Chart Data ─── */
const chartData = [
  { day: "MON", deposits: 180, withdrawals: 80 },
  { day: "TUE", deposits: 250, withdrawals: 100 },
  { day: "WED", deposits: 200, withdrawals: 90 },
  { day: "THU", deposits: 220, withdrawals: 110 },
  { day: "FRI", deposits: 300, withdrawals: 60 },
  { day: "SAT", deposits: 160, withdrawals: 140 },
  { day: "SUN", deposits: 100, withdrawals: 50 },
];

/* ─── Transaction Data ─── */
interface Transaction {
  date: string;
  time: string;
  initials: string;
  initialsColor: string;
  name: string;
  txnId: string;
  branch: string;
  type: "DEPOSIT" | "WITHDRAW";
  amount: string;
}

const transactions: Transaction[] = [
  {
    date: "Oct 24,",
    time: "14:30",
    initials: "AA",
    initialsColor: "bg-navy-900 text-white",
    name: "Abiola Adeyemi",
    txnId: "TXN-89231",
    branch: "Lagos HQ",
    type: "DEPOSIT",
    amount: "₦ 450,000",
  },
  {
    date: "Oct 24,",
    time: "12:15",
    initials: "CO",
    initialsColor: "bg-green-600 text-white",
    name: "Chidi Okoro",
    txnId: "TXN-89230",
    branch: "Abuja Central",
    type: "WITHDRAW",
    amount: "₦ 75,000",
  },
  {
    date: "Oct 24,",
    time: "11:05",
    initials: "FN",
    initialsColor: "bg-amber-500 text-white",
    name: "Fatima Nnamdi",
    txnId: "TXN-89229",
    branch: "Kano North",
    type: "DEPOSIT",
    amount: "₦ 1,200,000",
  },
  {
    date: "Oct 24,",
    time: "09:45",
    initials: "MI",
    initialsColor: "bg-gray-500 text-white",
    name: "Musa Ibrahim",
    txnId: "TXN-89228",
    branch: "Lagos HQ",
    type: "DEPOSIT",
    amount: "₦ 30,000",
  },
];

/* ─── Top Savers ─── */
const topSavers = [
  {
    name: "Ngozi Obi",
    id: "Member #1024",
    amount: "₦ 12.5M",
    tier: "Diamond Tier",
    tierColor: "text-blue-500",
    initials: "NO",
    bg: "bg-navy-900",
  },
  {
    name: "Emeka Williams",
    id: "Member #6042",
    amount: "₦ 10.2M",
    tier: "Gold Tier",
    tierColor: "text-amber-500",
    initials: "EW",
    bg: "bg-green-600",
  },
  {
    name: "Sarah Bello",
    id: "Member #2211",
    amount: "₦ 9.8M",
    tier: "Gold Tier",
    tierColor: "text-amber-500",
    initials: "SB",
    bg: "bg-amber-500",
  },
  {
    name: "Oluwatobi J.",
    id: "Member #1509",
    amount: "₦ 8.4M",
    tier: "Silver Tier",
    tierColor: "text-gray-500",
    initials: "OJ",
    bg: "bg-gray-400",
  },
];

export default function SavingsDashboardPage() {
  const [chartRange, setChartRange] = useState("7d");
  const [currentPage, setCurrentPage] = useState(1);

  const ranges = ["7d", "30d", "6m", "12m"];

  return (
    <div className="space-y-6">
      {/* ─── Header Actions ─── */}
      <div className="flex items-center gap-3">
        <Link to="/savings/deposit" className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-full text-sm font-semibold hover:bg-green-700 transition-colors">
          <CreditCard className="w-4 h-4" />
          Record Deposit
        </Link>
        <Link to="/savings/bulk-upload" className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-full text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
          <Upload className="w-4 h-4" />
          Upload CSV
        </Link>
        <button className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-full text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
          <FileDown className="w-4 h-4" />
          Export Reports
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ─── Stats Row ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Savings */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
            Total Savings
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold text-navy-900">₦2.45B</p>
            <span className="flex items-center gap-0.5 text-xs font-semibold text-green-600">
              <TrendingUp className="w-3 h-3" />
              +2.4%
            </span>
          </div>
        </div>

        {/* Monthly Deposits */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
            Monthly Deposits
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold text-navy-900">₦120M</p>
            <span className="flex items-center gap-0.5 text-xs font-semibold text-green-600">
              <TrendingUp className="w-3 h-3" />
              +1.2%
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
            <div className="bg-green-500 h-1 rounded-full w-3/4" />
          </div>
        </div>

        {/* Withdrawals */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
            Withdrawals
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold text-navy-900">₦45M</p>
            <span className="flex items-center gap-0.5 text-xs font-semibold text-red-500">
              <TrendingDown className="w-3 h-3" />
              -0.5%
            </span>
          </div>
        </div>

        {/* Active Savers */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
            Active Savers
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold text-navy-900">10,540</p>
            <span className="flex items-center gap-0.5 text-xs font-semibold text-green-600">
              <TrendingUp className="w-3 h-3" />
              +4.1%
            </span>
          </div>
        </div>

        {/* Avg. Balance */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
            Avg. Balance
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold text-navy-900">₦232K</p>
            <span className="flex items-center gap-0.5 text-xs font-semibold text-green-600">
              <TrendingUp className="w-3 h-3" />
              +0.8%
            </span>
          </div>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ─── Left Column (2/3) ─── */}
        <div className="col-span-1 lg:col-span-2 space-y-5">
          {/* Savings Growth Over Time */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-navy-900">
                  Savings Growth Over Time
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Comparing deposits vs withdrawals inflow
                </p>
              </div>
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                {ranges.map((r) => (
                  <button
                    key={r}
                    onClick={() => setChartRange(r)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      chartRange === r
                        ? "bg-white text-navy-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  barCategoryGap="25%"
                  barGap={4}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 8,
                      border: "1px solid #e5e7eb",
                    }}
                  />
                  <Bar
                    dataKey="deposits"
                    fill="#d1e7dd"
                    radius={[4, 4, 0, 0]}
                    name="Total Deposits"
                  />
                  <Bar
                    dataKey="withdrawals"
                    fill="#1a2744"
                    radius={[4, 4, 0, 0]}
                    name="Total Withdrawals"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-3">
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-3 h-3 rounded bg-[#d1e7dd]" />
                Total Deposits
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-3 h-3 rounded bg-navy-900" />
                Total Withdrawals
              </span>
            </div>
          </div>

          {/* Recent Savings Transactions */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h3 className="text-base font-bold text-navy-900">
                Recent Savings Transactions
              </h3>
              <Link to="/savings/transactions" className="text-xs font-medium text-navy-900 hover:underline">
                View All
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                      Date
                    </th>
                    <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                      Member
                    </th>
                    <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                      Transaction ID
                    </th>
                    <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                      Branch
                    </th>
                    <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                      Type
                    </th>
                    <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-right">
                      Amount
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
                        <p className="text-sm text-navy-900">{txn.date}</p>
                        <p className="text-xs text-gray-400">{txn.time}</p>
                      </td>

                      {/* Member */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${txn.initialsColor}`}
                          >
                            {txn.initials}
                          </div>
                          <span className="text-sm font-medium text-navy-900">
                            {txn.name}
                          </span>
                        </div>
                      </td>

                      {/* Transaction ID */}
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-500">{txn.txnId}</p>
                      </td>

                      {/* Branch */}
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-600">{txn.branch}</p>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-4">
                        {txn.type === "DEPOSIT" ? (
                          <span className="inline-flex px-2.5 py-1 rounded text-[11px] font-bold bg-green-100 text-green-700">
                            DEPOSIT
                          </span>
                        ) : (
                          <span className="inline-flex px-2.5 py-1 rounded text-[11px] font-bold bg-red-100 text-red-600">
                            WITHDRAW
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-4 text-right">
                        <p className="text-sm font-semibold text-navy-900">
                          {txn.amount}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center py-4 gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {[1, 2, 3].map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === p
                      ? "bg-navy-900 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(3, p + 1))}
                disabled={currentPage === 3}
                className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ─── Right Column (1/3) ─── */}
        <div className="space-y-5">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-base font-bold text-navy-900 mb-4">
              Quick Actions
            </h3>

            <div className="space-y-2.5">
              {[
                {
                  icon: CreditCard,
                  label: "Record Deposit",
                  bg: "bg-green-600 hover:bg-green-700",
                  to: "/savings/deposit",
                },
                {
                  icon: Upload,
                  label: "Upload CSV",
                  bg: "bg-navy-900 hover:bg-navy-800",
                  to: "/savings/bulk-upload",
                },
                {
                  icon: Eye,
                  label: "View Transactions",
                  bg: "bg-navy-900 hover:bg-navy-800",
                  to: "/savings/transactions",
                },
                {
                  icon: FileText,
                  label: "Generate Statements",
                  bg: "bg-navy-900 hover:bg-navy-800",
                  to: "/savings/statement",
                },
              ].map((action, i) => (
                <Link
                  key={i}
                  to={action.to}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white transition-colors ${action.bg}`}
                >
                  <action.icon className="w-4 h-4" />
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Top Savers */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-base font-bold text-navy-900 mb-5">
              Top Savers
            </h3>

            <div className="space-y-4">
              {topSavers.map((saver, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full ${saver.bg} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                  >
                    {saver.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy-900">
                      {saver.name}
                    </p>
                    <p className="text-xs text-gray-400">{saver.id}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-navy-900">
                      {saver.amount}
                    </p>
                    <p className={`text-[10px] font-semibold ${saver.tierColor}`}>
                      {saver.tier}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
              View All Savers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
