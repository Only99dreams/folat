import { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  File,
  Calendar,
  SlidersHorizontal,
  MoreVertical,
  Loader2,
  CreditCard,
  Save,
  X,
} from "lucide-react";
import { fetchLoanRepayments, fetchBranches, fetchLoanApplications, recordLoanRepayment } from "../lib/db";
import { useAuth } from "../auth/useAuth";
import { supabase } from "../lib/supabase";
import ExportMenu from "./ExportMenu";

const avatarColors = [
  "bg-blue-600 text-white",
  "bg-purple-600 text-white",
  "bg-teal-600 text-white",
  "bg-amber-600 text-white",
  "bg-rose-600 text-white",
  "bg-green-600 text-white",
];

export default function AllLoanRepaymentsPage() {
  const { user, profile, hasPermission } = useAuth();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [repayments, setRepayments] = useState<any[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [branches, setBranches] = useState<any[]>([]);
  const [branch, setBranch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(true);
  const [eligibleLoans, setEligibleLoans] = useState<any[]>([]);
  const [approvedAwaitingDisbursement, setApprovedAwaitingDisbursement] = useState(0);
  const [loadingEligibleLoans, setLoadingEligibleLoans] = useState(false);
  const [eligibleLoansError, setEligibleLoansError] = useState("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState("");
  const [paymentForm, setPaymentForm] = useState({
    loanId: "",
    amount: "",
    paymentMethod: "Cash",
    paidDate: new Date().toISOString().slice(0, 10),
    reference: "",
    notes: "",
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const isRestricted = user?.role === "branch_manager" || user?.role === "secretary" || user?.role === "officer";
  const canRecordRepayment = hasPermission("loans.record_repayment");
  const perPage = 10;
  const totalPages = Math.max(1, Math.ceil(totalResults / perPage));
  const selectedLoan = eligibleLoans.find((loan) => loan.id === paymentForm.loanId);

  useEffect(() => {
    fetchBranches().then(data => setBranches(data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isRestricted || !user?.branch) return;
    (async () => {
      const { data } = await supabase
        .from("branches")
        .select("id")
        .ilike("name", user.branch)
        .maybeSingle();
      if (data?.id) setBranch(data.id);
    })();
  }, [isRestricted, user?.branch]);

  useEffect(() => {
    setLoading(true);
    fetchLoanRepayments({ page: currentPage, pageSize: perPage, branch_id: branch || undefined })
      .then(({ data, count }) => {
        setRepayments(data);
        setTotalResults(count);
      }).catch(() => {}).finally(() => setLoading(false));
  }, [currentPage, branch]);

  useEffect(() => {
    if (!canRecordRepayment || !user) return;
    setLoadingEligibleLoans(true);
    setEligibleLoansError("");
    fetchLoanApplications({
      status: ["approved", "disbursed", "active", "overdue", "defaulted"],
      branch_id: branch || undefined,
      pageSize: 1000,
      user: { id: user.id, role: user.role, branch: user.branch },
    }).then(({ data }) => {
      const awaitingDisbursement = data.filter((loan) => loan.status === "approved" && !loan.disbursement_date);
      const payableLoans = data.filter((loan) =>
        ["disbursed", "active", "overdue", "defaulted"].includes(loan.status)
        || (loan.status === "approved" && Boolean(loan.disbursement_date))
      );
      setApprovedAwaitingDisbursement(awaitingDisbursement.length);
      setEligibleLoans(payableLoans);
      setPaymentForm((current) => payableLoans.some((loan) => loan.id === current.loanId)
        ? current
        : { ...current, loanId: "" });
    }).catch((error: any) => {
      setEligibleLoans([]);
      setEligibleLoansError(error.message || "Could not load open loans.");
    }).finally(() => setLoadingEligibleLoans(false));
  }, [canRecordRepayment, user?.id, user?.role, user?.branch, branch, refreshKey]);

  const handleRecordPayment = async () => {
    const amount = Number(paymentForm.amount);
    const balance = Number(selectedLoan?.outstanding_balance ?? selectedLoan?.total_repayable ?? 0);
    if (!profile || !selectedLoan?.member_id) {
      setPaymentError("Select a loan with a linked member.");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0 || amount > balance) {
      setPaymentError(`Enter an amount greater than zero and no more than ₦${balance.toLocaleString()}.`);
      return;
    }
    if (!paymentForm.paidDate || !paymentForm.paymentMethod) {
      setPaymentError("Select a payment date and method.");
      return;
    }

    setSavingPayment(true);
    setPaymentError("");
    setPaymentSuccess("");
    try {
      await recordLoanRepayment({
        loan_id: selectedLoan.id,
        member_id: selectedLoan.member_id,
        amount,
        payment_method: paymentForm.paymentMethod,
        paid_date: paymentForm.paidDate,
        reference: paymentForm.reference,
        notes: paymentForm.notes,
        recorded_by: profile.id,
      });
      setPaymentForm((current) => ({ ...current, amount: "", reference: "", notes: "" }));
      setShowPaymentForm(false);
      setPaymentSuccess(`Payment recorded for ${selectedLoan.loan_id}.`);
      setRefreshKey((value) => value + 1);
      setCurrentPage(1);
      const { data, count } = await fetchLoanRepayments({ page: 1, pageSize: perPage, branch_id: branch || undefined });
      setRepayments(data);
      setTotalResults(count);
    } catch (error: any) {
      setPaymentError(error.message || "Failed to record repayment.");
    } finally {
      setSavingPayment(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Global Search ─── */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="relative max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Global search for members or loan IDs..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
          />
        </div>
      </div>

      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">
            All Loan Repayments
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor all loan repayments across the cooperative system.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canRecordRepayment && (
            <button
              type="button"
              onClick={() => { setShowPaymentForm((visible) => !visible); setPaymentError(""); }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-700 text-white rounded-lg text-sm font-semibold hover:bg-green-800"
            >
              <CreditCard className="w-4 h-4" />
              Record Payment
            </button>
          )}
          <span className="text-xs text-gray-400 font-semibold tracking-wide uppercase">
            Export Data:
          </span>
          <ExportMenu data={() => repayments.map((r: any) => ({ LoanID: r.loan?.loan_id || '', Member: (r.loan?.member?.first_name || '') + ' ' + (r.loan?.member?.last_name || ''), Amount: r.amount, Method: r.payment_method, Date: r.paid_date, Reference: r.reference || '' }))} filename="loan_repayments" label="Export" className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors" />
        </div>
      </div>

      {paymentSuccess && <p role="status" className="text-sm text-green-700">{paymentSuccess}</p>}
      {showPaymentForm && canRecordRepayment && (
        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-navy-900">Record Manual Loan Payment</h2>
              <p className="text-sm text-gray-500 mt-1">Post a member payment to the loan ledger and repayment schedule.</p>
            </div>
            <button type="button" onClick={() => setShowPaymentForm(false)} aria-label="Close payment form" className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <label className="text-sm font-medium text-navy-900 sm:col-span-2 lg:col-span-1">
              Loan
              <select value={paymentForm.loanId} disabled={loadingEligibleLoans || Boolean(eligibleLoansError)} onChange={(event) => setPaymentForm((current) => ({ ...current, loanId: event.target.value, amount: "" }))} className="mt-1.5 w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white disabled:bg-gray-50">
                <option value="">{loadingEligibleLoans ? "Loading open loans..." : eligibleLoansError ? "Loans unavailable" : eligibleLoans.length ? "Select an open loan" : "No open loans available"}</option>
                {eligibleLoans.map((loan) => {
                  const member = Array.isArray(loan.member) ? loan.member[0] : loan.member;
                  const balance = Number(loan.outstanding_balance ?? loan.total_repayable ?? 0);
                  return <option key={loan.id} value={loan.id}>{loan.loan_id} | {member ? `${member.first_name} ${member.last_name}` : "Member"} | Balance ₦{balance.toLocaleString()}</option>;
                })}
              </select>
            </label>
            {selectedLoan && (() => {
              const member = Array.isArray(selectedLoan.member) ? selectedLoan.member[0] : selectedLoan.member;
              const details = [
                ["Member", member ? `${member.first_name} ${member.last_name} (${member.member_id || "No member ID"})` : "Member details unavailable"],
                ["Loan type", selectedLoan.loan_type || "—"],
                ["Principal", `₦${Number(selectedLoan.amount_approved ?? selectedLoan.amount_requested ?? 0).toLocaleString()}`],
                ["Total repayable", `₦${Number(selectedLoan.total_repayable ?? 0).toLocaleString()}`],
                ["Scheduled installment", `₦${Number(selectedLoan.monthly_repayment ?? 0).toLocaleString()}`],
                ["Outstanding balance", `₦${Number(selectedLoan.outstanding_balance ?? selectedLoan.total_repayable ?? 0).toLocaleString()}`],
              ];
              return (
                <div className="sm:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 rounded-lg bg-gray-50 border border-gray-100 p-4">
                  {details.map(([label, value]) => (
                    <label key={label} className="text-xs font-semibold text-gray-500">
                      {label}
                      <input readOnly tabIndex={-1} value={value} className="mt-1.5 w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-normal text-gray-700 bg-white cursor-default" />
                    </label>
                  ))}
                </div>
              );
            })()}
            <label className="text-sm font-medium text-navy-900">
              Amount received (₦)
              <input type="number" min="0.01" max={selectedLoan ? Number(selectedLoan.outstanding_balance ?? selectedLoan.total_repayable ?? 0) : undefined} step="0.01" value={paymentForm.amount} onChange={(event) => setPaymentForm((current) => ({ ...current, amount: event.target.value }))} className="mt-1.5 w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
            </label>
            <label className="text-sm font-medium text-navy-900">
              Payment method
              <select value={paymentForm.paymentMethod} onChange={(event) => setPaymentForm((current) => ({ ...current, paymentMethod: event.target.value }))} className="mt-1.5 w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white">
                <option>Cash</option>
                <option>Bank Transfer</option>
                <option>Mobile Money</option>
                <option>Direct Debit</option>
                <option>Cheque</option>
              </select>
            </label>
            <label className="text-sm font-medium text-navy-900">
              Payment date
              <input type="date" value={paymentForm.paidDate} onChange={(event) => setPaymentForm((current) => ({ ...current, paidDate: event.target.value }))} className="mt-1.5 w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
            </label>
            <label className="text-sm font-medium text-navy-900">
              Reference
              <input type="text" value={paymentForm.reference} onChange={(event) => setPaymentForm((current) => ({ ...current, reference: event.target.value }))} className="mt-1.5 w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
            </label>
            <label className="text-sm font-medium text-navy-900 sm:col-span-2">
              Notes
              <textarea rows={2} value={paymentForm.notes} onChange={(event) => setPaymentForm((current) => ({ ...current, notes: event.target.value }))} className="mt-1.5 w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-y" />
            </label>
          </div>
          {eligibleLoansError && <p role="alert" className="mt-4 text-sm text-red-600">{eligibleLoansError}</p>}
          {!loadingEligibleLoans && !eligibleLoansError && eligibleLoans.length === 0 && approvedAwaitingDisbursement > 0 && <p className="mt-4 text-sm text-amber-700">{approvedAwaitingDisbursement} loan(s) are approved but not disbursed yet. They cannot receive repayments until disbursement is recorded.</p>}
          {!loadingEligibleLoans && !eligibleLoansError && eligibleLoans.length === 0 && approvedAwaitingDisbursement === 0 && <p className="mt-4 text-sm text-gray-500">There are no disbursed loans with a balance available for repayment.</p>}
          {paymentError && <p role="alert" className="mt-4 text-sm text-red-600">{paymentError}</p>}
          <div className="flex justify-end mt-5">
            <button type="button" disabled={savingPayment || loadingEligibleLoans || eligibleLoans.length === 0} onClick={handleRecordPayment} className="inline-flex items-center gap-2 px-4 py-2.5 bg-navy-900 text-white rounded-lg text-sm font-semibold disabled:opacity-50">
              {savingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {savingPayment ? "Saving..." : "Save Payment"}
            </button>
          </div>
        </section>
      )}

      {/* ─── Stat Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Repayments MTD */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-bold mb-1">
            Total Repayments (MTD)
          </p>
          <p className="text-2xl font-bold text-navy-900 mb-1">₦{repayments.reduce((s, r) => s + Number(r.amount ?? 0), 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
          <p className="text-xs font-medium flex items-center gap-1">
            <span className="text-gray-400">this page</span>
          </p>
        </div>

        {/* Total Repayments YTD */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-bold mb-1">
            Total Repayments (YTD)
          </p>
          <p className="text-2xl font-bold text-navy-900 mb-1">—</p>
          <p className="text-xs font-medium flex items-center gap-1">
            <span className="text-gray-400">year to date</span>
          </p>
        </div>

        {/* Avg Repayment Amount */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-bold mb-1">
            Avg. Repayment Amount
          </p>
          <p className="text-2xl font-bold text-navy-900 mb-1">{repayments.length > 0 ? `₦${(repayments.reduce((s, r) => s + Number(r.amount ?? 0), 0) / repayments.length).toLocaleString(undefined, {minimumFractionDigits: 2})}` : "—"}</p>
          <p className="text-xs font-medium flex items-center gap-1">
            <span className="text-gray-400">per transaction</span>
          </p>
        </div>

        {/* Active Repaying Members */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-bold mb-1">
            Active Repaying Members
          </p>
          <p className="text-2xl font-bold text-navy-900 mb-1">{totalResults.toLocaleString()}</p>
          <p className="text-xs font-medium flex items-center gap-1">
            <span className="text-gray-400">total repayments</span>
          </p>
        </div>
      </div>

      {/* ─── Filters ─── */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Member / Loan ID */}
          <div>
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1.5">
              Search Member / Loan ID
            </p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="e.g. LN-2024-001 or John Doe"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
              />
            </div>
          </div>

          {/* Branch */}
          {!isRestricted && (
            <div>
              <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1.5">
                Branch
              </p>
              <div className="relative">
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full appearance-none px-4 py-2.5 pr-9 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20 bg-white"
                >
                  <option value="">All Branches</option>
                  {branches.map((b: any) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div>
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1.5">
              Payment Method
            </p>
            <div className="relative">
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 pr-9 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20 bg-white"
              >
                <option>All Methods</option>
                <option>Bank Transfer</option>
                <option>Direct Debit</option>
                <option>Mobile Money</option>
                <option>Cash</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Date Range */}
          <div>
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1.5">
              Date Range
            </p>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Select date range..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20"
              />
            </div>
          </div>
        </div>

        <button className="flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white rounded-lg text-sm font-semibold hover:bg-navy-800 transition-colors">
          <SlidersHorizontal className="w-4 h-4" />
          Apply Filters
        </button>
      </div>

      {/* ─── Table ─── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-4 text-[10px] tracking-[0.1em] uppercase text-red-500 font-bold">
                  Payment ID
                </th>
                <th className="px-3 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Date
                </th>
                <th className="px-3 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Member Name & ID
                </th>
                <th className="px-3 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Loan ID
                </th>
                <th className="px-3 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">
                  Inst. #
                </th>
                <th className="px-3 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">
                  Amount Paid
                </th>
                <th className="px-3 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">
                  Balance
                </th>
                <th className="px-3 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">
                  Method
                </th>
                <th className="px-3 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Branch
                </th>
                <th className="w-10 px-2 py-4" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin text-navy-900 mx-auto" /></td></tr>
              ) : repayments.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-12 text-gray-400">No repayments found.</td></tr>
              ) : repayments.map((r, i) => {
                const memberName = r.member ? `${r.member.first_name} ${r.member.last_name}` : "N/A";
                const initials = memberName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
                const methodStyles: Record<string, { bg: string; color: string }> = {
                  "Bank Transfer": { bg: "bg-blue-50 border border-blue-200", color: "text-navy-700" },
                  "Cash": { bg: "bg-green-50 border border-green-200", color: "text-green-700" },
                  "Mobile Money": { bg: "bg-green-50 border border-green-200", color: "text-green-700" },
                  "Direct Debit": { bg: "bg-red-50 border border-red-200", color: "text-red-600" },
                };
                const mStyle = methodStyles[r.payment_method] ?? methodStyles["Cash"];
                return (
                <tr
                  key={r.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-5 py-5">
                    <p className="text-sm font-bold text-green-600">{r.repayment_id}</p>
                  </td>
                  <td className="px-3 py-5">
                    <p className="text-sm text-gray-600">{new Date(r.created_at).toLocaleDateString()}</p>
                  </td>
                  <td className="px-3 py-5">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${avatarColors[i % avatarColors.length]}`}>
                        {initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-navy-900">{memberName}</p>
                        <p className="text-[10px] text-gray-400">{r.member?.member_id ?? ""}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-5">
                    <p className="text-sm text-navy-900 font-medium">{r.loan?.loan_id ?? ""}</p>
                  </td>
                  <td className="px-3 py-5 text-center">
                    <p className="text-sm text-navy-900">{r.installment_number ?? "—"}</p>
                  </td>
                  <td className="px-3 py-5 text-center">
                    <p className="text-sm font-semibold text-navy-900">₦{Number(r.amount).toLocaleString()}</p>
                  </td>
                  <td className="px-3 py-5 text-center">
                    <p className="text-sm text-navy-900">₦{Number(r.outstanding_after ?? 0).toLocaleString()}</p>
                  </td>
                  <td className="px-3 py-5 text-center">
                    <span className={`inline-flex px-2 py-1 rounded text-[9px] font-bold tracking-wider ${mStyle.bg} ${mStyle.color}`}>
                      {(r.payment_method ?? "").toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-5">
                    <p className="text-sm text-gray-600">—</p>
                  </td>
                  <td className="px-2 py-5">
                    <button className="p-1.5 text-gray-400 hover:text-navy-900 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
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
              {Math.min(currentPage * perPage, totalResults)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-navy-900">{totalResults}</span>{" "}
            results
          </p>

          <div className="flex items-center gap-1">
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
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === p
                    ? "bg-navy-900 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {p}
              </button>
            ))}

            <span className="px-1 text-gray-400 text-sm">…</span>

            <button
              onClick={() => setCurrentPage(totalPages)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                currentPage === totalPages
                  ? "bg-navy-900 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {totalPages}
            </button>

            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
