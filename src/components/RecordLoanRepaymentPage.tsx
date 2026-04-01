import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Info,
  CreditCard,
  Loader2,
} from "lucide-react";
import { fetchLoanApplications, fetchLoanRepayments, recordLoanRepayment } from "../lib/db";
import { useAuth } from "../auth/useAuth";

export default function RecordLoanRepaymentPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const { data } = await fetchLoanApplications({ search: searchQuery, status: "disbursed", pageSize: 5 });
      setSearchResults(data);
    } catch { setSearchResults([]); }
    setSearching(false);
  }, [searchQuery]);

  const selectLoan = async (loan: any) => {
    setSelectedLoan(loan);
    setSearchResults([]);
    setSearchQuery(loan.loan_id);
    setPaymentAmount(String(loan.monthly_repayment ?? ""));
    try {
      const { data } = await fetchLoanRepayments({ loan_id: loan.id, pageSize: 3 });
      setRecentPayments(data);
    } catch {}
  };

  const amount = parseFloat(paymentAmount.replace(/,/g, "")) || 0;
  const loanBalance = selectedLoan ? Number(selectedLoan.total_repayable ?? 0) : 0;
  const previouslyPaid = recentPayments.reduce((sum, r) => sum + Number(r.amount ?? 0), 0);
  const currentBalance = loanBalance - previouslyPaid;
  const newBalance = currentBalance - amount;

  const handleSubmit = async () => {
    if (!selectedLoan) { setError("Please select a loan"); return; }
    if (amount <= 0) { setError("Please enter a valid amount"); return; }
    setError("");
    setSubmitting(true);
    try {
      await recordLoanRepayment({
        loan_id: selectedLoan.id,
        member_id: selectedLoan.member_id,
        amount,
        payment_method: paymentMethod,
        reference: referenceNumber,
        notes: remarks,
        recorded_by: profile?.id ?? "",
      });
      setSuccess(true);
      setTimeout(() => navigate("/loans/repayments"), 1500);
    } catch (e: any) {
      setError(e.message || "Failed to record payment");
    }
    setSubmitting(false);
  };

  const memberName = selectedLoan?.member ? `${selectedLoan.member.first_name} ${selectedLoan.member.last_name}` : "";

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div>
        <h1 className="text-2xl font-bold text-navy-900">
          Record Loan Repayment
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Enter payment details to update the member's loan balance in
          real-time.
        </p>
      </div>

      {/* ─── Search Bar ─── */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <p className="text-sm font-medium text-navy-900 mb-2">
          Search Member or Loan ID
        </p>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Enter loan ID e.g. LN-2024-001"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
            />
            {searchResults.length > 0 && (
              <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {searchResults.map(l => {
                  const name = l.member ? `${l.member.first_name} ${l.member.last_name}` : "N/A";
                  return (
                    <button key={l.id} onClick={() => selectLoan(l)} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">
                      {l.loan_id} — {name} — ₦{Number(l.amount_requested).toLocaleString()}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <button
            onClick={handleSearch}
            disabled={searching}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {searching && <Loader2 className="w-4 h-4 animate-spin" />}
            Search
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <p className="text-sm text-green-700">Payment recorded successfully! Redirecting...</p>
        </div>
      )}

      {selectedLoan && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ════════════════════════════════════════
              LEFT COLUMN (2/3)
             ════════════════════════════════════════ */}
          <div className="col-span-1 lg:col-span-2 space-y-6">
            {/* ── Member Card ── */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex gap-5">
                {/* Photo placeholder */}
                <div className="w-32 h-28 rounded-xl bg-gray-200 overflow-hidden flex-shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face"
                    alt="Member"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-flex px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold tracking-wider rounded mb-1">
                        ACTIVE LOAN
                      </span>
                      <h2 className="text-lg font-bold text-navy-900">
                        Member: {memberName}
                      </h2>
                      <p className="text-sm text-blue-500">
                        Loan ID: {selectedLoan.loan_id}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                        Loan Balance
                      </p>
                      <p className="text-2xl font-bold text-navy-900">
                        ₦ {currentBalance.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 mt-4">
                    <div>
                      <p className="text-xs text-gray-400">
                        Monthly Installment
                      </p>
                      <p className="text-sm font-bold text-navy-900">
                        ₦{Number(selectedLoan.monthly_repayment ?? 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Disbursement Date</p>
                      <p className="text-sm font-bold text-navy-900">
                        {selectedLoan.disbursement_date ? new Date(selectedLoan.disbursement_date).toLocaleDateString() : '—'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Repayment Details ── */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
                <CreditCard className="w-4 h-4 text-navy-900" />
                <h2 className="text-base font-bold text-navy-900">
                  Repayment Details
                </h2>
              </div>

              <div className="p-6 space-y-5">
                {/* Row 1: Amount + Method */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-navy-900 mb-1.5">
                      Payment Amount (₦)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                        ₦
                      </span>
                      <input
                        type="text"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-navy-900 mb-1.5">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full appearance-none px-4 py-2.5 pr-9 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20 bg-white"
                    >
                      <option>Bank Transfer</option>
                      <option>Cash</option>
                      <option>Mobile Money</option>
                      <option>Direct Debit</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-[38px] w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Row 2: Date + Reference */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-navy-900 mb-1.5">
                      Payment Date
                    </label>
                    <input
                      type="text"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-900 mb-1.5">
                      Reference Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. TRN-12345678"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
                    />
                  </div>
                </div>

                {/* Remarks */}
                <div>
                  <label className="block text-sm font-medium text-navy-900 mb-1.5">
                    Remarks (Optional)
                  </label>
                  <textarea
                    placeholder="Add any additional notes..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════
              RIGHT COLUMN (1/3)
             ════════════════════════════════════════ */}
          <div className="space-y-6">
            {/* ── Balance Preview ── */}
            <div className="bg-blue-600 rounded-xl p-5 text-white">
              <p className="text-[10px] tracking-[0.15em] uppercase font-bold text-blue-200 mb-4">
                Balance Preview
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-100">
                    Previous Balance
                  </span>
                  <span className="text-sm font-bold">
                    ₦{currentBalance.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-100">
                    Current Payment
                  </span>
                  <span className="text-sm font-bold bg-white/20 px-2.5 py-0.5 rounded">
                    -₦{amount.toLocaleString()}
                  </span>
                </div>

                <div className="border-t border-blue-400 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-100">New Balance</span>
                    <span className="text-xl font-bold">
                      ₦ {newBalance.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info Note */}
              <div className="mt-4 bg-blue-700/50 rounded-lg p-3 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-200 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-100 leading-relaxed">
                  Recording this payment will update the member's ledger and
                  generate a digital receipt.
                </p>
              </div>
            </div>

            {/* ── Action Buttons ── */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {submitting ? 'Recording...' : 'Record Payment'}
            </button>

            <Link to="/loans/repayments" className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 text-gray-500 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
              <XCircle className="w-4 h-4" />
              Cancel
            </Link>

            {/* ── Recent Payments ── */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-sm font-bold text-navy-900 mb-4">
                Recent Payments
              </h3>

              <div className="space-y-3">
                {recentPayments.length === 0 && (
                  <p className="text-xs text-gray-400">No recent payments</p>
                )}
                {recentPayments.map(rp => (
                  <div key={rp.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-navy-900">
                        ₦ {Number(rp.amount).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">{new Date(rp.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className="text-[10px] font-bold tracking-wider text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                      {rp.payment_method ?? 'Paid'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
