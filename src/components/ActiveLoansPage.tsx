import { useState } from "react";
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
} from "lucide-react";

/* ─── Loan Data ─── */
interface ActiveLoan {
  id: string;
  avatar: string;
  avatarColor: string;
  name: string;
  loanAmount: string;
  balanceLeft: string;
  balancePercent: number;
  barColor: string;
  monthlyPmt: string;
  nextDue: string;
  nextDueColor: string;
  status: "On Track" | "Late" | "Overdue";
}

const loans: ActiveLoan[] = [
  {
    id: "#LN-8821",
    avatar: "JD",
    avatarColor: "bg-navy-900 text-white",
    name: "John Doe",
    loanAmount: "$5,000",
    balanceLeft: "$3,400 left",
    balancePercent: 68,
    barColor: "bg-blue-500",
    monthlyPmt: "$250",
    nextDue: "Oct 12, 2023",
    nextDueColor: "text-navy-900",
    status: "On Track",
  },
  {
    id: "#LN-7742",
    avatar: "SS",
    avatarColor: "bg-purple-100 text-purple-700",
    name: "Sarah Smith",
    loanAmount: "$12,000",
    balanceLeft: "$10,200 left",
    balancePercent: 85,
    barColor: "bg-blue-500",
    monthlyPmt: "$600",
    nextDue: "Oct 05, 2023",
    nextDueColor: "text-red-500",
    status: "Late",
  },
  {
    id: "#LN-9903",
    avatar: "MB",
    avatarColor: "bg-navy-900 text-white",
    name: "Michael Brown",
    loanAmount: "$2,500",
    balanceLeft: "$375 left",
    balancePercent: 15,
    barColor: "bg-amber-400",
    monthlyPmt: "$150",
    nextDue: "Sep 28, 2023",
    nextDueColor: "text-navy-900",
    status: "Overdue",
  },
  {
    id: "#LN-6621",
    avatar: "EJ",
    avatarColor: "bg-blue-100 text-blue-700",
    name: "Emily Jackson",
    loanAmount: "$8,500",
    balanceLeft: "$7,800 left",
    balancePercent: 92,
    barColor: "bg-green-500",
    monthlyPmt: "$450",
    nextDue: "Oct 18, 2023",
    nextDueColor: "text-navy-900",
    status: "On Track",
  },
];

const statusBadge = (status: ActiveLoan["status"]) => {
  const styles: Record<string, string> = {
    "On Track": "text-green-600",
    Late: "text-orange-500",
    Overdue: "text-red-500",
  };
  return (
    <span className={`text-sm font-semibold ${styles[status]}`}>{status}</span>
  );
};

/* ─── Branch Distribution Data ─── */
const branches = [
  { name: "Main Office", amount: "$540,200", percent: 100 },
  { name: "North Region", amount: "$412,800", percent: 76 },
  { name: "South Region", amount: "$287,000", percent: 53 },
];

export default function ActiveLoansPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const totalLoans = 412;
  const perPage = 4;
  const totalPages = 2;

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
            <p className="text-2xl font-bold text-navy-900">$1.24M</p>
            <span className="text-xs font-semibold text-green-600">+4.2%</span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
            Total Active Loans
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-navy-900">412</p>
            <span className="text-xs text-gray-400">Active</span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-red-500 font-semibold mb-1">
            At Risk Capital
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-navy-900">$42,500</p>
            <span className="text-xs font-semibold text-red-500">12 Late</span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
            Recovery Rate
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-navy-900">98.2%</p>
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
              {loans.map((loan, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  {/* Loan ID */}
                  <td className="px-6 py-5">
                    <p className="text-sm font-semibold text-navy-900">
                      {loan.id}
                    </p>
                  </td>

                  {/* Member */}
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${loan.avatarColor}`}
                      >
                        {loan.avatar}
                      </div>
                      <p className="text-sm font-medium text-navy-900">
                        {loan.name}
                      </p>
                    </div>
                  </td>

                  {/* Loan Amount */}
                  <td className="px-4 py-5">
                    <p className="text-sm font-semibold text-navy-900">
                      {loan.loanAmount}
                    </p>
                  </td>

                  {/* Balance Remaining */}
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <span className="text-xs font-semibold text-navy-900 bg-navy-50 px-2 py-0.5 rounded whitespace-nowrap">
                          {loan.balanceLeft}
                        </span>
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${loan.barColor}`}
                            style={{ width: `${loan.balancePercent}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {loan.balancePercent}%
                      </span>
                    </div>
                  </td>

                  {/* Monthly PMT */}
                  <td className="px-4 py-5">
                    <p className="text-sm text-navy-900">{loan.monthlyPmt}</p>
                  </td>

                  {/* Next Due */}
                  <td className="px-4 py-5">
                    <p className={`text-sm font-medium ${loan.nextDueColor}`}>
                      {loan.nextDue}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-5">{statusBadge(loan.status)}</td>

                  {/* Actions */}
                  <td className="px-4 py-5">
                    <div className="flex items-center justify-center gap-1">
                      <Link
                        title="Details"
                        to={`/loans/${encodeURIComponent(loan.id)}`}
                        className="p-2 text-gray-400 hover:text-navy-900 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                      </Link>
                      <button
                        title="Message"
                        className="p-2 text-gray-400 hover:text-navy-900 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <Link
                        title="View"
                        to={`/loans/${encodeURIComponent(loan.id)}`}
                        className="p-2 text-gray-400 hover:text-navy-900 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
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
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-navy-900">
                    {b.name}
                  </span>
                  <span className="text-sm font-semibold text-navy-900">
                    {b.amount}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-navy-900 rounded-full transition-all duration-500"
                    style={{ width: `${b.percent}%` }}
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
