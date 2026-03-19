import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Download,
  Bell,
  Mail,
  MonitorSmartphone,
  Eye,
  Banknote,
  Users,
  Clock,
} from "lucide-react";

/* ─── Delinquent Loan Data ─── */
interface OverdueLoan {
  id: string;
  avatar: string;
  avatarColor: string;
  name: string;
  loanAmount: string;
  amountOverdue: string;
  daysOverdue: number;
  daysBadgeColor: string;
  lastPayment: string;
}

const loans: OverdueLoan[] = [
  {
    id: "#FL-4892",
    avatar: "EO",
    avatarColor: "bg-green-600 text-white",
    name: "Emeka Okafor",
    loanAmount: "₦2,500,000",
    amountOverdue: "₦ 850,000",
    daysOverdue: 45,
    daysBadgeColor: "bg-red-100 text-red-600",
    lastPayment: "Oct 12, 2023",
  },
  {
    id: "#FL-3102",
    avatar: "AS",
    avatarColor: "bg-purple-500 text-white",
    name: "Aisha Sani",
    loanAmount: "₦1,200,000",
    amountOverdue: "₦ 120,000",
    daysOverdue: 12,
    daysBadgeColor: "bg-amber-100 text-amber-600",
    lastPayment: "Nov 28, 2023",
  },
  {
    id: "#FL-5120",
    avatar: "CO",
    avatarColor: "bg-blue-600 text-white",
    name: "Chinwe Okoro",
    loanAmount: "₦4,000,000",
    amountOverdue: "₦ 2,100,000",
    daysOverdue: 68,
    daysBadgeColor: "bg-red-100 text-red-600",
    lastPayment: "Sep 05, 2023",
  },
  {
    id: "#FL-2219",
    avatar: "BM",
    avatarColor: "bg-teal-600 text-white",
    name: "Babatunde Musa",
    loanAmount: "₦850,000",
    amountOverdue: "₦ 85,000",
    daysOverdue: 8,
    daysBadgeColor: "bg-amber-100 text-amber-600",
    lastPayment: "Dec 01, 2023",
  },
];

export default function OverdueLoansPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalEntries = 126;
  const totalPages = Math.ceil(totalEntries / 4);

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Overdue Loans</h1>
          <p className="text-sm text-gray-500 mt-1">
            Active monitoring and recovery dashboard for delinquent accounts
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors">
            <Bell className="w-4 h-4" />
            Bulk Reminders
          </button>
        </div>
      </div>

      {/* ─── Stat Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Total Overdue Amount */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-start justify-between mb-3">
            <p className="text-[10px] tracking-[0.1em] uppercase text-red-500 font-bold">
              Total Overdue Amount
            </p>
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <Banknote className="w-5 h-5 text-red-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-navy-900 mb-2">
            ₦180,000,000
          </p>
          <p className="text-xs text-red-500 font-medium flex items-center gap-1">
            <span>↗</span> +12.5% vs last month
          </p>
        </div>

        {/* Number of Overdue Loans */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-start justify-between mb-3">
            <p className="text-[10px] tracking-[0.1em] uppercase text-navy-900 font-bold">
              Number of Overdue Loans
            </p>
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-navy-900 mb-2">126</p>
          <p className="text-xs text-green-600 font-medium flex items-center gap-1">
            <span>↗</span> +5.2% active alerts
          </p>
        </div>

        {/* Average Days Overdue */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-start justify-between mb-3">
            <p className="text-[10px] tracking-[0.1em] uppercase text-red-500 font-bold">
              Average Days Overdue
            </p>
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-red-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-navy-900 mb-2">32 Days</p>
          <p className="text-xs text-green-600 font-medium flex items-center gap-1">
            <span>↘</span> -2.1% recovery speed improved
          </p>
        </div>
      </div>

      {/* ─── Delinquent Loan Records ─── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-navy-900">
            Delinquent Loan Records
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-sm font-medium text-navy-900">
                Critical High
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-sm font-medium text-navy-900">
                Medium Risk
              </span>
            </div>
          </div>
        </div>

        {/* Table */}
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
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">
                  Loan Amount
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">
                  Amount Overdue
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">
                  Days Overdue
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Last Payment
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
                      <p className="text-sm font-semibold text-navy-900">
                        {loan.name}
                      </p>
                    </div>
                  </td>

                  {/* Loan Amount */}
                  <td className="px-4 py-5 text-center">
                    <p className="text-sm text-navy-900">{loan.loanAmount}</p>
                  </td>

                  {/* Amount Overdue */}
                  <td className="px-4 py-5 text-center">
                    <p className="text-sm font-semibold text-red-500">
                      x {loan.amountOverdue.replace("₦ ", "")}
                    </p>
                  </td>

                  {/* Days Overdue */}
                  <td className="px-4 py-5 text-center">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${loan.daysBadgeColor}`}
                    >
                      {loan.daysOverdue} Days
                    </span>
                  </td>

                  {/* Last Payment */}
                  <td className="px-4 py-5">
                    <p className="text-sm text-gray-600">{loan.lastPayment}</p>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-5">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        title="Send Reminder"
                        className="p-2 text-gray-400 hover:text-navy-900 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      <button
                        title="Schedule"
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <MonitorSmartphone className="w-4 h-4" />
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
            <span className="font-semibold text-navy-900">4</span> of{" "}
            <span className="font-semibold text-navy-900">{totalEntries}</span>{" "}
            entries
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
              className="px-5 py-2 bg-navy-900 text-white text-sm font-semibold rounded-lg hover:bg-navy-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
