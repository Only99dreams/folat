import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CreditCard,
  Upload,
  FileDown,
  ChevronDown,
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight,
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
import { fetchSavingsTransactions, fetchSavingsAccounts } from "../lib/db";
import { supabase } from "../lib/supabase";

export default function SavingsDashboardPage() {
  const [chartRange, setChartRange] = useState("7d");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalSavings: 0, activeSavers: 0, monthlyDeposits: 0, monthlyWithdrawals: 0 });
  const [recentTxns, setRecentTxns] = useState<any[]>([]);
  const [topSavers, setTopSavers] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  const ranges = ["7d", "30d", "6m", "12m"];

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // Total savings & active savers
        const { data: accounts } = await supabase.from("savings_accounts").select("balance");
        const total = (accounts ?? []).reduce((s: number, a: any) => s + Number(a.balance), 0);

        // Monthly deposits & withdrawals
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        const { data: monthTxns } = await supabase
          .from("savings_transactions")
          .select("type, amount")
          .gte("created_at", monthStart.toISOString());
        const monthlyDeposits = (monthTxns ?? []).filter((t: any) => t.type === "deposit").reduce((s: number, t: any) => s + Number(t.amount), 0);
        const monthlyWithdrawals = (monthTxns ?? []).filter((t: any) => t.type === "withdrawal").reduce((s: number, t: any) => s + Number(t.amount), 0);

        setStats({ totalSavings: total, activeSavers: accounts?.length ?? 0, monthlyDeposits, monthlyWithdrawals });

        // Recent transactions
        const { data: txns } = await fetchSavingsTransactions({ page: 1, pageSize: 6 });
        setRecentTxns(txns);

        // Top savers
        const { data: top } = await supabase
          .from("savings_accounts")
          .select("balance, member:members(first_name, last_name, member_id)")
          .order("balance", { ascending: false })
          .limit(4);
        setTopSavers(top ?? []);

        // Chart data — last 7 days from real transactions
        const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
        const now = new Date();
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 6);
        weekAgo.setHours(0, 0, 0, 0);
        const { data: chartTxns } = await supabase
          .from("savings_transactions")
          .select("type, amount, created_at")
          .gte("created_at", weekAgo.toISOString());
        const cData: any[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().slice(0, 10);
          const dayTxns = (chartTxns ?? []).filter((t: any) => t.created_at?.slice(0, 10) === dateStr);
          cData.push({
            day: days[d.getDay()],
            deposits: dayTxns.filter((t: any) => t.type === "deposit").reduce((s: number, t: any) => s + Number(t.amount), 0),
            withdrawals: dayTxns.filter((t: any) => t.type === "withdrawal").reduce((s: number, t: any) => s + Number(t.amount), 0),
          });
        }
        setChartData(cData);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

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
            <p className="text-2xl font-bold text-navy-900">₦{stats.totalSavings.toLocaleString()}</p>
          </div>
        </div>

        {/* Monthly Deposits */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
            Monthly Deposits
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold text-navy-900">₦{stats.monthlyDeposits.toLocaleString()}</p>
          </div>
        </div>

        {/* Withdrawals */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
            Withdrawals
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold text-navy-900">₦{stats.monthlyWithdrawals.toLocaleString()}</p>
          </div>
        </div>

        {/* Active Savers */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
            Active Savers
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold text-navy-900">{stats.activeSavers.toLocaleString()}</p>
          </div>
        </div>

        {/* Avg. Balance */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
            Avg. Balance
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold text-navy-900">₦{stats.activeSavers > 0 ? Math.round(stats.totalSavings / stats.activeSavers).toLocaleString() : 0}</p>
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
                  {loading ? (
                    <tr><td colSpan={6} className="text-center py-8"><Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" /></td></tr>
                  ) : recentTxns.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8 text-gray-400 text-sm">No transactions yet</td></tr>
                  ) : recentTxns.map((txn: any) => {
                    const d = new Date(txn.created_at);
                    return (
                    <tr
                      key={txn.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      {/* Date */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-navy-900">{d.toLocaleDateString()}</p>
                        <p className="text-xs text-gray-400">{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </td>

                      {/* Member */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-navy-900 flex items-center justify-center text-[10px] font-bold text-white">
                            {txn.member?.first_name?.[0]}{txn.member?.last_name?.[0]}
                          </div>
                          <span className="text-sm font-medium text-navy-900">
                            {txn.member?.first_name} {txn.member?.last_name}
                          </span>
                        </div>
                      </td>

                      {/* Transaction ID */}
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-500">{txn.transaction_id}</p>
                      </td>

                      {/* Branch */}
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-600">{txn.branch?.name ?? "—"}</p>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-4">
                        {txn.type === "deposit" ? (
                          <span className="inline-flex px-2.5 py-1 rounded text-[11px] font-bold bg-green-100 text-green-700">
                            DEPOSIT
                          </span>
                        ) : (
                          <span className="inline-flex px-2.5 py-1 rounded text-[11px] font-bold bg-red-100 text-red-600">
                            WITHDRAWAL
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-4 text-right">
                        <p className="text-sm font-semibold text-navy-900">
                          ₦{Number(txn.amount).toLocaleString()}
                        </p>
                      </td>
                    </tr>
                    );
                  })}
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
              {topSavers.map((saver: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-navy-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {saver.member?.first_name?.[0]}{saver.member?.last_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy-900">
                      {saver.member?.first_name} {saver.member?.last_name}
                    </p>
                    <p className="text-xs text-gray-400">{saver.member?.member_id}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-navy-900">
                      ₦{Number(saver.balance).toLocaleString()}
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
