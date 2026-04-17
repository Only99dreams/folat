import { useState, useEffect } from "react";
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
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import { fetchLoanApplications, sendOverdueReminders, sendSMS, fetchOverdueScheduleItems } from "../lib/db";
import { useAuth } from "../auth/useAuth";

const avatarColors = [
  "bg-green-600 text-white",
  "bg-purple-500 text-white",
  "bg-blue-600 text-white",
  "bg-teal-600 text-white",
  "bg-amber-600 text-white",
  "bg-rose-600 text-white",
];

export default function OverdueLoansPage() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [loans, setLoans] = useState<any[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sendingBulk, setSendingBulk] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [bulkResult, setBulkResult] = useState("");
  const [overdueCount, setOverdueCount] = useState(0);
  const perPage = 10;
  const totalPages = Math.max(1, Math.ceil(totalEntries / perPage));

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchLoanApplications({ status: "disbursed", page: currentPage, pageSize: perPage }),
      fetchOverdueScheduleItems().catch(() => []),
    ]).then(([{ data, count }, overdueItems]) => {
      setLoans(data);
      setTotalEntries(count);
      setOverdueCount(Array.isArray(overdueItems) ? overdueItems.length : 0);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [currentPage]);

  const handleBulkReminders = async () => {
    if (!user?.id) return;
    setSendingBulk(true);
    setBulkResult("");
    try {
      const result = await sendOverdueReminders(user.id);
      setBulkResult(`SMS reminders sent to ${result.sent} of ${result.total ?? result.sent} overdue members.`);
    } catch (err: any) {
      setBulkResult("Failed to send reminders: " + (err.message || "Unknown error"));
    }
    setSendingBulk(false);
    setTimeout(() => setBulkResult(""), 5000);
  };

  const handleSendReminder = async (loan: any) => {
    if (!user?.id) return;
    const phone = loan.member?.phone;
    if (!phone) return;
    setSendingId(loan.id);
    try {
      const memberName = `${loan.member?.first_name ?? ""} ${loan.member?.last_name ?? ""}`.trim();
      const amount = Number(loan.amount_approved ?? loan.amount_requested ?? 0);
      const message = `Dear ${memberName}, your loan ${loan.loan_id} of NGN ${amount.toLocaleString()} is overdue. Please make payment to avoid penalties. - FOLAT`;
      await sendSMS({ sent_by: user.id, recipients: [phone], message });
    } catch (err) {
      console.error("Failed to send reminder:", err);
    }
    setSendingId(null);
  };

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
          <button
            onClick={handleBulkReminders}
            disabled={sendingBulk}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {sendingBulk ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
            {sendingBulk ? "Sending..." : "Bulk Reminders"}
          </button>
        </div>
      </div>

      {/* Bulk result message */}
      {bulkResult && (
        <div className={`flex items-center gap-2 rounded-xl px-4 py-3 ${bulkResult.includes("Failed") ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}>
          {bulkResult.includes("Failed") ? <AlertCircle className="w-4 h-4 text-red-500 shrink-0" /> : <Check className="w-4 h-4 text-green-500 shrink-0" />}
          <p className={`text-sm ${bulkResult.includes("Failed") ? "text-red-600" : "text-green-600"}`}>{bulkResult}</p>
        </div>
      )}

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
            ₦{loans.reduce((s, l) => s + Number(l.amount_approved ?? l.amount_requested ?? 0), 0).toLocaleString()}
          </p>
          <p className="text-xs text-red-500 font-medium flex items-center gap-1">
            <span>↗</span> overdue balance
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
          <p className="text-3xl font-bold text-navy-900 mb-2">{totalEntries}</p>
          <p className="text-xs text-green-600 font-medium flex items-center gap-1">
            <span>↗</span> active alerts
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
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin text-navy-900 mx-auto" /></td></tr>
              ) : loans.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No overdue loans found.</td></tr>
              ) : loans.map((loan, i) => {
                const memberName = loan.member ? `${loan.member.first_name} ${loan.member.last_name}` : "N/A";
                const initials = memberName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
                const amount = Number(loan.amount_approved ?? loan.amount_requested ?? 0);
                const monthlyPmt = Number(loan.monthly_repayment ?? 0);
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
                      <p className="text-sm font-semibold text-navy-900">{memberName}</p>
                    </div>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <p className="text-sm text-navy-900">₦{amount.toLocaleString()}</p>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <p className="text-sm font-semibold text-red-500">₦{monthlyPmt.toLocaleString()}</p>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-600">
                      Disbursed
                    </span>
                  </td>
                  <td className="px-4 py-5">
                    <p className="text-sm text-gray-600">
                      {loan.disbursement_date ? new Date(loan.disbursement_date).toLocaleDateString() : "—"}
                    </p>
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        title="Send Reminder SMS"
                        onClick={() => handleSendReminder(loan)}
                        disabled={sendingId === loan.id}
                        className="p-2 text-gray-400 hover:text-navy-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {sendingId === loan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                      </button>
                      <Link title="View" to={`/loans/${loan.id}`} className="p-2 text-gray-400 hover:text-navy-900 hover:bg-gray-100 rounded-lg transition-colors">
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
