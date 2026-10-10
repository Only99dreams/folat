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
import { fetchLoanApplications, sendOverdueReminders, sendSMS, fetchOverdueScheduleItems, fetchStaffByProfileId, fetchMemberByEmail } from "../lib/db";
import ExportMenu from "./ExportMenu";
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
  const [avgDaysOverdue, setAvgDaysOverdue] = useState(0);
  const [staffMemberEmail, setStaffMemberEmail] = useState<string | null>(null);
  const [staffMemberRecordId, setStaffMemberRecordId] = useState<string | null>(null);
  const perPage = 10;
  const totalPages = Math.max(1, Math.ceil(totalEntries / perPage));

  const isStaff = user?.role === "staff_member";

  useEffect(() => {
    if (isStaff && user?.id) {
      fetchStaffByProfileId(user.id).then(async s => {
        if (s?.email) {
          setStaffMemberEmail(s.email);
          const member = await fetchMemberByEmail(s.email);
          if (member) setStaffMemberRecordId(member.id);
        }
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    const fetchOpts: any = {
      status: "disbursed",
      page: currentPage,
      pageSize: perPage,
      user: { id: user.id, role: user.role, branch: user.branch },
    };
    if (isStaff && staffMemberRecordId) {
      fetchOpts.member_id = staffMemberRecordId;
    }
    Promise.all([
      fetchLoanApplications(fetchOpts),
      fetchOverdueScheduleItems().catch(() => []),
    ]).then(([{ data, count }, overdueItems]) => {
      setLoans(data);
      setTotalEntries(count);
      setOverdueCount(Array.isArray(overdueItems) ? overdueItems.length : 0);
      
      // Calculate average days overdue from actual data
      if (Array.isArray(overdueItems) && overdueItems.length > 0) {
        const totalDays = overdueItems.reduce((sum, item) => {
          const dueDate = new Date(item.due_date);
          const today = new Date();
          const days = Math.max(0, Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
          return sum + days;
        }, 0);
        setAvgDaysOverdue(Math.round(totalDays / overdueItems.length));
      } else {
        setAvgDaysOverdue(0);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [currentPage, staffMemberEmail]);

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
          <ExportMenu data={() => loans.map((l: any) => ({ LoanID: l.loan_id, Member: (l.member?.first_name || '') + ' ' + (l.member?.last_name || ''), Amount: l.amount_approved ?? l.amount_requested, DueDate: l.due_date, DaysOverdue: l.days_overdue || '', OutstandingBalance: l.outstanding_balance }))} filename="overdue_loans" label="Export Report" />
          {!isStaff && (
            <button
              onClick={handleBulkReminders}
              disabled={sendingBulk}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {sendingBulk ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
              {sendingBulk ? "Sending..." : "Bulk Reminders"}
            </button>
          )}
        </div>
      </div>

      {/* Bulk result message */}
      {!isStaff && bulkResult && (
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
            ₦{loans.reduce((s, l) => s + Number(l.outstanding_balance ?? l.amount_approved ?? l.amount_requested ?? 0), 0).toLocaleString()}
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
          <p className="text-3xl font-bold text-navy-900 mb-2">
            {avgDaysOverdue > 0 ? `${avgDaysOverdue} Days` : "—"}
          </p>
          <p className="text-xs text-gray-500 font-medium">
            {avgDaysOverdue > 0 ? "Based on overdue schedule items" : "No overdue items to analyze"}
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
                {!isStaff && (
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Member
                </th>
                )}
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
                <tr><td colSpan={isStaff ? 6 : 7} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin text-navy-900 mx-auto" /></td></tr>
              ) : loans.length === 0 ? (
                <tr><td colSpan={isStaff ? 6 : 7} className="text-center py-12 text-gray-400">No overdue loans found.</td></tr>
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
                  {!isStaff && (
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${avatarColors[i % avatarColors.length]}`}>
                        {initials}
                      </div>
                      <p className="text-sm font-semibold text-navy-900">{memberName}</p>
                    </div>
                  </td>
                  )}
                  <td className="px-4 py-5 text-center">
                    <p className="text-sm text-navy-900">₦{amount.toLocaleString()}</p>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <p className="text-sm font-semibold text-red-500">₦{Number(loan.outstanding_balance ?? loan.amount_approved ?? loan.amount_requested ?? 0).toLocaleString()}</p>
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
                      {!isStaff && (
                        <button
                          title="Send Reminder SMS"
                          onClick={() => handleSendReminder(loan)}
                          disabled={sendingId === loan.id}
                          className="p-2 text-gray-400 hover:text-navy-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {sendingId === loan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                        </button>
                      )}
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
            <span className="font-semibold text-navy-900">
              {totalEntries > 0 ? (currentPage - 1) * perPage + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-navy-900">
              {Math.min(currentPage * perPage, totalEntries)}
            </span>{" "}
            of{" "}
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
