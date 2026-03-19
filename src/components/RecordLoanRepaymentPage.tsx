import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Info,
  CreditCard,
} from "lucide-react";

export default function RecordLoanRepaymentPage() {
  const [searchQuery, setSearchQuery] = useState("John Oladele");
  const [memberFound, setMemberFound] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState("45000");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [paymentDate, setPaymentDate] = useState("10/25/2023");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [remarks, setRemarks] = useState("");

  /* ─── Mock Member Data ─── */
  const member = {
    name: "John Oladele",
    loanId: "FL-2023-001",
    monthlyInstallment: 45000,
    nextDueDate: "Oct 30, 2023",
    loanBalance: 200000,
  };

  const amount = parseFloat(paymentAmount.replace(/,/g, "")) || 0;
  const newBalance = member.loanBalance - amount;

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
              placeholder="John Oladele"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
            />
          </div>
          <button
            onClick={() => setMemberFound(true)}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {memberFound && (
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
                        Member: {member.name}
                      </h2>
                      <p className="text-sm text-blue-500">
                        Loan ID: {member.loanId}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                        Loan Balance
                      </p>
                      <p className="text-2xl font-bold text-navy-900">
                        ₦ {member.loanBalance.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 mt-4">
                    <div>
                      <p className="text-xs text-gray-400">
                        Monthly Installment
                      </p>
                      <p className="text-sm font-bold text-navy-900">
                        ₦{member.monthlyInstallment.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Next Due Date</p>
                      <p className="text-sm font-bold text-red-500">
                        {member.nextDueDate}
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
                    ₦{member.loanBalance.toLocaleString()}
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
            <button className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
              <CheckCircle2 className="w-4 h-4" />
              Record Payment
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
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-navy-900">
                      ₦ 45,000
                    </p>
                    <p className="text-xs text-gray-400">Sept 28, 2023</p>
                  </div>
                  <span className="text-[10px] font-bold tracking-wider text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                    Verified
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-navy-900">
                      ₦ 45,000
                    </p>
                    <p className="text-xs text-gray-400">Aug 30, 2023</p>
                  </div>
                  <span className="text-[10px] font-bold tracking-wider text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                    Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
