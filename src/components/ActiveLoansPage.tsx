import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Download,
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  FileText,
  MessageSquare,
  Eye,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { fetchLoanApplications, fetchBranches } from "../lib/db";

const avatarColors = [
  "bg-navy-900 text-white",
  "bg-purple-100 text-purple-700",
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-amber-100 text-amber-700",
];

export default function ActiveLoansPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [loans, setLoans] = useState<any[]>([]);
  const [totalLoans, setTotalLoans] = useState(0);
  const [branches, setBranches] = useState<any[]>([]);
  const [branchFilter, setBranchFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const perPage = 10;
  const totalPages = Math.max(1, Math.ceil(totalLoans / perPage));

  useEffect(() => {
    fetchBranches().then(data => setBranches(data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchLoanApplications({
      status: "disbursed",
      branch_id: branchFilter || undefined,
      page: currentPage,
      pageSize: perPage,
    }).then(({ data, count }) => {
      setLoans(data);
      setTotalLoans(count);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [currentPage, branchFilter]);

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Active Loans</h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor distribution, repayment health, and portfolio performance in
            real-time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <Link to="/loans/new" className="flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition-colors">
            <Plus className="w-4 h-4" />
            New Loan
          </Link>
        </div>
      </div>

      {/* ─── Stat Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
            Total Active Capital
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-navy-900">₦{loans.reduce((s, l) => s + Number(l.amount_approved ?? l.amount_requested ?? 0), 0).toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
            Total Active Loans
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-navy-900">{totalLoans}</p>
            <span className="text-xs text-gray-400">Active</span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-red-500 font-semibold mb-1">
            At Risk Capital
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-navy-900">—</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
            Recovery Rate
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-navy-900">—</p>
            <span className="text-xs text-gray-400">Portfolio</span>
          </div>
        </div>
      </div>

      {/* ─── Filters ─── */}
      <div className="flex flex-wrap items-center gap-3">
        <button className="p-2.5 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 transition-colors">
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        {["All Branches", "Loan Type", "Repayment Status", "Amount Range"].map(
          (label) => (
            <div key={label} className="relative">
              <select className="appearance-none px-4 py-2.5 pr-8 border border-gray-200 rounded-lg text-sm font-medium text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-900/20 bg-white">
                <option>{label}</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          )
        )}

        <div className="flex-1" />

        <button className="text-sm font-medium text-navy-900 hover:text-navy-700 transition-colors">
          Clear All
        </button>
      </div>

      {/* ─── Active Loans Table ─── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Loan ID
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Member
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Loan Amount
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Balance Remaining
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Monthly PMT
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Next Due
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Status
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin text-navy-900 mx-auto" /></td></tr>
              ) : loans.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">No active loans found.</td></tr>
              ) : loans.map((loan, i) => {
                const memberName = loan.member ? `${loan.member.first_name} ${loan.member.last_name}` : "N/A";
                const initials = memberName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
                const amount = Number(loan.amount_approved ?? loan.amount_requested ?? 0);
                const totalRepayable = Number(loan.total_repayable ?? amount);
                const monthlyPmt = Number(loan.monthly_repayment ?? 0);
                // Placeholder balance calculation
                const balancePercent = totalRepayable > 0 ? 100 : 0;
                return (
                <tr
                  key={loan.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-5">
                    <p className="text-sm font-semibold text-navy-900">{loan.loan_id}</p>
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${avatarColors[i % avatarColors.length]}`}>
                        {initials}
                      </div>
                      <p className="text-sm font-medium text-navy-900">{memberName}</p>
                    </div>
                  </td>
                  <td className="px-4 py-5">
                    <p className="text-sm font-semibold text-navy-900">₦{amount.toLocaleString()}</p>
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-navy-900 bg-navy-50 px-2 py-0.5 rounded whitespace-nowrap">
                        ₦{totalRepayable.toLocaleString()} total
                      </span>
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${balancePercent}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-5">
                    <p className="text-sm text-navy-900">₦{monthlyPmt.toLocaleString()}</p>
                  </td>
                  <td className="px-4 py-5">
                    <p className="text-sm font-medium text-navy-900">
                      {loan.disbursement_date ? new Date(loan.disbursement_date).toLocaleDateString() : "—"}
                    </p>
                  </td>
                  <td className="px-4 py-5">
                    <span className="text-sm font-semibold text-green-600">Active</span>
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex items-center justify-center gap-1">
                      <Link title="Details" to={`/loans/${loan.id}`} className="p-2 text-gray-400 hover:text-navy-900 hover:bg-gray-100 rounded-lg transition-colors">
                        <FileText className="w-4 h-4" />
                      </Link>
                      <Link title="Schedule" to={`/loans/${loan.id}/schedule`} className="p-2 text-gray-400 hover:text-navy-900 hover:bg-gray-100 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-400">
            Showing{" "}
            <span className="font-semibold text-navy-900">
              {(currentPage - 1) * perPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-navy-900">
              {Math.min(currentPage * perPage, totalLoans)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-navy-900">{totalLoans}</span>{" "}
            active loans
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            {[1, 2].map((p) => (
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
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ─── Bottom Section: Branch Distribution + Portfolio Health ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Branch Distribution */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-base font-bold text-navy-900 mb-5">
            Branch Distribution
          </h2>

          <div className="space-y-4">
            {branches.map((b, i) => (
              <div key={b.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-navy-900">
                    {b.name}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-navy-900 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(20, 100 - i * 25)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio Health */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mb-4">
            <TrendingUp className="w-7 h-7 text-green-600" />
          </div>
          <h2 className="text-lg font-bold text-navy-900 mb-2">
            Portfolio Healthy
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
            94% of active loans are currently 'On Track'.
            <br />
            Repayment efficiency is up 3% from last month.
          </p>
          <button className="mt-4 text-sm font-semibold text-navy-900 underline underline-offset-2 hover:text-navy-700 transition-colors">
            View Trend Analytics
          </button>
        </div>
      </div>
    </div>
  );
}
