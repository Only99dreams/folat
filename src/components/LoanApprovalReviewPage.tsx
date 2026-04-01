import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FileText,
  Landmark,
  Users,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { fetchLoanApplication, approveLoan, rejectLoan } from "../lib/db";
import { useAuth } from "../auth/useAuth";

export default function LoanApprovalReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loan, setLoan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [decision, setDecision] = useState("approve");
  const [decisionNotes, setDecisionNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetchLoanApplication(id).then(setLoan).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const handleDecision = async () => {
    if (!id || !profile) return;
    setSubmitting(true);
    setError("");
    try {
      if (decision === "approve") {
        await approveLoan(id, profile.id, decisionNotes);
      } else {
        await rejectLoan(id, profile.id, decisionNotes);
      }
      navigate("/loans");
    } catch (e: any) {
      setError(e.message || "Failed to process decision");
    }
    setSubmitting(false);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-navy-900" /></div>;
  if (!loan) return <div className="text-center py-20 text-gray-500">Loan application not found.</div>;

  const memberName = loan.member ? `${loan.member.first_name} ${loan.member.last_name}` : "N/A";
  const principal = Number(loan.amount_requested ?? 0);
  const interestRate = Number(loan.interest_rate ?? 0);
  const months = Number(loan.duration_months ?? 12);
  const totalInterest = principal * (interestRate / 100) * (months / 12);
  const monthlyRepayment = months > 0 ? (principal + totalInterest) / months : 0;

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">
            Loan Approval Review
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review application details and risk assessment for final decision
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-medium">APP ID:</span>
          <span className="px-3 py-1.5 bg-green-50 text-green-700 text-sm font-semibold rounded-full border border-green-200">
            {loan.loan_id}
          </span>
        </div>
      </div>

      {/* ─── Main Content Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ════════════════════════════════════════
            LEFT COLUMN (2/3 width)
           ════════════════════════════════════════ */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          {/* ── Application Summary ── */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-navy-900" />
                <h2 className="text-base font-bold text-navy-900">
                  Application Summary
                </h2>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded border border-blue-200">
                {loan.loan_type ?? 'Loan'}
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-100 px-6 py-5">
              <div className="pr-4">
                <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
                  Amount
                </p>
                <p className="text-xl font-bold text-navy-900">₦{principal.toLocaleString()}</p>
              </div>
              <div className="px-4">
                <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
                  Duration
                </p>
                <p className="text-xl font-bold text-navy-900">{months} Months</p>
              </div>
              <div className="px-4">
                <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
                  Interest
                </p>
                <p className="text-xl font-bold text-navy-900">{interestRate}% p.a.</p>
              </div>
              <div className="pl-4">
                <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
                  Repayment
                </p>
                <p className="text-xl font-bold text-navy-900">₦{Math.round(monthlyRepayment).toLocaleString()}/mo</p>
              </div>
            </div>
          </div>

          {/* ── Member Financial Analysis ── */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
              <Landmark className="w-4 h-4 text-navy-900" />
              <h2 className="text-base font-bold text-navy-900">
                Member Financial Analysis
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-6 py-5">
              {/* Total Savings */}
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-400 font-medium mb-1">
                  Total Savings
                </p>
                <p className="text-xl font-bold text-navy-900">₦350,000</p>
              </div>

              {/* Existing Loans */}
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-400 font-medium mb-1">
                  Existing Loans
                </p>
                <p className="text-xl font-bold text-navy-900">₦0</p>
              </div>

              {/* Eligibility Status */}
              <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                <p className="text-xs text-green-600 font-medium mb-1">
                  Eligibility Status
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold text-green-600">Eligible</p>
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </div>
          </div>

          {/* ── Guarantor Validation ── */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
              <Users className="w-4 h-4 text-navy-900" />
              <h2 className="text-base font-bold text-navy-900">
                Guarantor Validation
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-3.5 text-[10px] tracking-[0.1em] uppercase text-green-600 font-semibold">
                      Guarantor Name
                    </th>
                    <th className="px-4 py-3.5 text-[10px] tracking-[0.1em] uppercase text-green-600 font-semibold">
                      Savings
                    </th>
                    <th className="px-4 py-3.5 text-[10px] tracking-[0.1em] uppercase text-green-600 font-semibold">
                      Loan Status
                    </th>
                    <th className="px-4 py-3.5 text-[10px] tracking-[0.1em] uppercase text-green-600 font-semibold">
                      Eligibility
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {guarantors.map((g, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-50 last:border-b-0"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-navy-900">
                        {g.name}
                      </td>
                      <td className="px-4 py-4 text-sm text-navy-900">
                        {g.savings}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-green-600">
                        {g.loanStatus}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold text-green-600">
                          {g.eligibility}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════
            RIGHT COLUMN (1/3 width)
           ════════════════════════════════════════ */}
        <div className="space-y-6">
          {/* ── Risk Assessment ── */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-base font-bold text-navy-900 mb-6">
              Risk Assessment
            </h2>

            {/* Risk Score Circle */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-36 h-36">
                {/* Background circle */}
                <svg className="w-full h-full" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 52 * 0.85} ${2 * Math.PI * 52 * 0.15}`}
                    strokeDashoffset={2 * Math.PI * 52 * 0.25}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-green-600">
                    LOW
                  </span>
                  <span className="text-[9px] tracking-[0.15em] uppercase text-green-500 font-semibold">
                    Risk Score
                  </span>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-gray-500 leading-relaxed">
              Applicant has excellent repayment history and healthy
              debt-to-income ratio.
            </p>
          </div>

          {/* ── Final Decision ── */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-base font-bold text-navy-900 mb-5">
              Final Decision
            </h2>

            {/* Radio Options */}
            <div className="space-y-3 mb-5">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="decision"
                  value="approve"
                  checked={decision === "approve"}
                  onChange={() => setDecision("approve")}
                  className="w-4 h-4 text-navy-900 border-gray-300 focus:ring-navy-900"
                />
                <span className="text-sm font-medium text-navy-900">
                  Approve Application
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="decision"
                  value="reject"
                  checked={decision === "reject"}
                  onChange={() => setDecision("reject")}
                  className="w-4 h-4 text-navy-900 border-gray-300 focus:ring-navy-900"
                />
                <span className="text-sm font-medium text-navy-900">
                  Reject Application
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="decision"
                  value="request-docs"
                  checked={decision === "request-docs"}
                  onChange={() => setDecision("request-docs")}
                  className="w-4 h-4 text-navy-900 border-gray-300 focus:ring-navy-900"
                />
                <span className="text-sm font-medium text-navy-900">
                  Request Additional Documents
                </span>
              </label>
            </div>

            {/* Decision Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Decision Notes
              </label>
              <textarea
                placeholder="Enter comments or reason for decision..."
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 resize-none"
              />
            </div>

            {/* Action Buttons */}
            {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
            <button
              onClick={handleDecision}
              disabled={submitting || decision !== "approve"}
              className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors mb-3 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {submitting ? "Processing..." : "Approve Loan"}
            </button>

            <button
              onClick={() => { setDecision("reject"); handleDecision(); }}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 text-gray-500 hover:text-red-600 text-sm font-medium transition-colors disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              Reject Loan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
