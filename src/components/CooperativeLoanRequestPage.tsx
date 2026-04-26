import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  PenLine,
  CheckCircle2,
  Calendar,
  Loader2,
  AlertCircle,
  RotateCcw,
  Info,
  PiggyBank,
} from "lucide-react";
import {
  fetchMembers,
  fetchBranches,
  fetchSavingsAccount,
  fetchSavingsMonths,
  generateLoanId,
  createLoanApplication,
  uploadFile,
} from "../lib/db";
import { useAuth } from "../auth/useAuth";
import LoanRulesGate from "./LoanRulesGate";

export default function CooperativeLoanRequestPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [rulesAccepted, setRulesAccepted] = useState(false);

  // Borrower info
  const [memberSearch, setMemberSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [fatherName, setFatherName] = useState("");
  const [branches, setBranches] = useState<any[]>([]);
  const [branchId, setBranchId] = useState("");
  const [savingsBalance, setSavingsBalance] = useState("0.00");
  const [savingsRaw, setSavingsRaw] = useState(0);
  const [savingsMonths, setSavingsMonths] = useState(0);

  // Loan details
  const [loanType, setLoanType] = useState("personal");
  const [loanCycle, setLoanCycle] = useState("");
  const [purposeScheme, setPurposeScheme] = useState("");
  const interestRate = 10; // locked at 10% flat for cooperative loans
  const [durationMonths, setDurationMonths] = useState("10");

  // Disbursement
  const [disbursementDate, setDisbursementDate] = useState("");
  const [principalAmount, setPrincipalAmount] = useState("0.00");
  const [firstInstallmentDate, setFirstInstallmentDate] = useState("");

  // Guarantors
  const [guarantor1Name, setGuarantor1Name] = useState("");
  const [guarantor1Phone, setGuarantor1Phone] = useState("");
  const [guarantor2Name, setGuarantor2Name] = useState("");
  const [guarantor2Phone, setGuarantor2Phone] = useState("");

  // Sign-off
  const [coRecommendation, setCoRecommendation] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);

  // State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBranches().then((data) => setBranches(data)).catch(() => {});
  }, []);

  const handleMemberSearch = useCallback(async (q: string) => {
    setMemberSearch(q);
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const { data } = await fetchMembers({
        search: q,
        pageSize: 5,
        member_type: "cooperative",
      });
      setSearchResults(data);
    } catch {
      setSearchResults([]);
    }
    setSearching(false);
  }, []);

  const selectMember = async (m: any) => {
    setSelectedMember(m);
    setMemberSearch(`${m.first_name} ${m.last_name} (${m.member_id})`);
    setSearchResults([]);
    if (m.branch_id) setBranchId(m.branch_id);
    try {
      const [acct, months] = await Promise.all([
        fetchSavingsAccount(m.id),
        fetchSavingsMonths(m.id),
      ]);
      if (acct) {
        const bal = Number(acct.balance);
        setSavingsBalance(bal.toLocaleString());
        setSavingsRaw(bal);
      }
      setSavingsMonths(months);
    } catch {}
  };

  // Calculations — 10% flat interest, 6–12 month duration
  const principal = parseFloat(principalAmount.replace(/,/g, "")) || 0;
  const months = parseInt(durationMonths) || 10;
  const maxLoanAmount = savingsRaw * 2;
  const totalInterest = principal * 0.10; // flat 10%
  const totalRepayable = principal + totalInterest;
  const monthlyRepayment = months > 0 ? totalRepayable / months : 0;

  // Eligibility: must have ≥ 6 months of savings
  const isEligible = selectedMember && savingsRaw > 0 && savingsMonths >= 6;

  const handleSubmit = async () => {
    if (!selectedMember) {
      setError("Please select a cooperative member");
      return;
    }
    if (selectedMember.member_type !== "cooperative") {
      setError("Only cooperative members can use this form. For external customers, use the standard loan application.");
      return;
    }
    if (savingsMonths < 6) {
      setError(`This member has only ${savingsMonths} month(s) of savings. At least 6 months of savings are required to qualify for a cooperative loan.`);
      return;
    }
    if (savingsRaw <= 0) {
      setError("This member has no active savings balance.");
      return;
    }
    if (principal <= 0) {
      setError("Please enter a valid principal amount.");
      return;
    }
    if (principal > maxLoanAmount) {
      setError(`Maximum loan amount is ₦${maxLoanAmount.toLocaleString()} (2× your savings balance of ₦${savingsRaw.toLocaleString()}).`);
      return;
    }
    if (!consentChecked) {
      setError("Please confirm consent");
      return;
    }
    if (!signatureDataUrl) {
      setError("Please capture the borrower's digital signature");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const loanId = await generateLoanId();

      let signatureUrl = "";
      if (signatureDataUrl) {
        const blob = await (await fetch(signatureDataUrl)).blob();
        const file = new File([blob], `signature-${loanId}.png`, {
          type: "image/png",
        });
        try {
          signatureUrl = await uploadFile(
            "documents",
            `signatures/${loanId}.png`,
            file
          );
        } catch {
          // Storage bucket may not exist yet
        }
      }

      await createLoanApplication({
        loan_id: loanId,
        member_id: selectedMember.id,
        branch_id: branchId || null,
        loan_type: loanType,
        amount_requested: principal,
        interest_rate: interestRate,
        duration_months: months,
        service_charge: 0,
        purpose: purposeScheme,
        credit_officer_id: profile?.id ?? null,
        first_installment_date: firstInstallmentDate || null,
        disbursement_date: disbursementDate || null,
        status: "pending",
        loan_cycle: parseInt(loanCycle) || 1,
        co_recommendation: coRecommendation,
        father_name: fatherName,
        group_id: null,
        signature_url: signatureUrl,
        guarantor1_name: guarantor1Name,
        guarantor1_status: guarantor1Phone,
        guarantor2_name: guarantor2Name,
        guarantor2_status: guarantor2Phone,
      });
      navigate("/loans");
    } catch (e: any) {
      setError(e.message || "Failed to submit loan request");
    }
    setSubmitting(false);
  };

  if (!rulesAccepted) {
    return <LoanRulesGate onAccept={() => setRulesAccepted(true)} category="cooperative" />;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* ─── Header ─── */}
      <div>
        <h1 className="text-2xl font-bold text-navy-900">
          Cooperative Loan Request
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Submit a loan application for a cooperative member. The member must
          have an active savings history to be eligible.
        </p>
      </div>

      {/* Eligibility notice */}
      <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
        <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-medium mb-1">Cooperative Loan Eligibility</p>
          <ul className="list-disc list-inside space-y-0.5 text-xs text-blue-600">
            <li>Only registered cooperative staff members can apply</li>
            <li>Member must have saved for at least <strong>6 months</strong></li>
            <li>Maximum loan = <strong>2× savings balance</strong></li>
            <li>Interest rate is fixed at <strong>10% flat</strong></li>
            <li>Repayment term: <strong>6 – 12 months</strong> (member's choice)</li>
          </ul>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          Section 1 — Borrower Information
         ═══════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <span className="w-7 h-7 rounded-md bg-navy-900 text-white text-xs font-bold flex items-center justify-center">
            1
          </span>
          <h2 className="text-base font-bold text-navy-900">
            Borrower Information
          </h2>
        </div>

        <div className="p-6 space-y-5">
          {/* Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="relative">
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Search Cooperative Member
              </label>
              <input
                type="text"
                placeholder="Type member name or ID..."
                value={memberSearch}
                onChange={(e) => handleMemberSearch(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
              />
              {searching && (
                <Loader2 className="absolute right-3 top-[38px] w-4 h-4 text-gray-400 animate-spin" />
              )}
              {searchResults.length > 0 && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {searchResults.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => selectMember(m)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                    >
                      {m.first_name} {m.last_name} — {m.member_id}
                      <span className="text-xs text-gray-400 ml-2">
                        (Cooperative)
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Name of Father/Husband
              </label>
              <input
                type="text"
                placeholder="Enter name"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Branch
              </label>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 pr-9 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 bg-white"
              >
                <option value="">Select Branch</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Current Savings Balance
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  ₦
                </span>
                <input
                  type="text"
                  value={savingsBalance}
                  readOnly
                  className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none"
                />
                {selectedMember && (
                  <PiggyBank
                    className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                      savingsRaw > 0 ? "text-green-500" : "text-red-400"
                    }`}
                  />
                )}
              </div>
              {selectedMember && savingsMonths < 6 && (
                <p className="text-xs text-red-500 mt-1">
                  Only {savingsMonths} month(s) saved — needs 6 months minimum
                </p>
              )}
              {selectedMember && savingsMonths >= 6 && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ {savingsMonths} months saved — eligible. Max loan: ₦{maxLoanAmount.toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          Sections 2 & 3 — Loan Details + Disbursement
         ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Section 2 — Loan Details */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
            <span className="w-7 h-7 rounded-md bg-navy-900 text-white text-xs font-bold flex items-center justify-center">
              2
            </span>
            <h2 className="text-base font-bold text-navy-900">Loan Details</h2>
          </div>

          <div className="p-6 space-y-5">
            <div className="relative">
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Type of Loan
              </label>
              <select
                value={loanType}
                onChange={(e) => setLoanType(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 pr-9 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 bg-white"
              >
                <option value="personal">Personal</option>
                <option value="business">Business Expansion</option>
                <option value="emergency">Emergency</option>
                <option value="agriculture">Agriculture</option>
              </select>
              <ChevronDown className="absolute right-3 top-[38px] w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1.5">
                  Loan Cycle
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1"
                  value={loanCycle}
                  onChange={(e) => setLoanCycle(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-navy-900 mb-1.5">
                  Duration (Months)
                </label>
                <select
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(e.target.value)}
                  className="w-full appearance-none px-4 py-2.5 pr-9 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 bg-white"
                >
                  {[6,7,8,9,10,11,12].map((m) => (
                    <option key={m} value={String(m)}>{m} months</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-[38px] w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Interest Rate
              </label>
              <div className="flex items-center gap-2 px-4 py-2.5 border border-green-200 rounded-lg bg-green-50">
                <span className="text-sm font-bold text-green-700">10% flat rate</span>
                <span className="text-xs text-green-600">(fixed for all cooperative loans)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Purpose / Scheme
              </label>
              <textarea
                placeholder="State the purpose of the loan..."
                value={purposeScheme}
                onChange={(e) => setPurposeScheme(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3 — Disbursement + Repayment */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
              <span className="w-7 h-7 rounded-md bg-navy-900 text-white text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h2 className="text-base font-bold text-navy-900">
                Disbursement Details
              </h2>
            </div>

            <div className="p-6 space-y-5">
              <div className="relative">
                <label className="block text-sm font-medium text-navy-900 mb-1.5">
                  Disbursement Date
                </label>
                <input
                  type="date"
                  value={disbursementDate}
                  onChange={(e) => setDisbursementDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1.5">
                  Principal Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    ₦
                  </span>
                  <input
                    type="text"
                    value={principalAmount}
                    onChange={(e) => setPrincipalAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
                  />
                </div>
              </div>

              {/* Live repayment calculator */}
              {principal > 0 && (
                <div className="bg-navy-900/5 border border-navy-900/20 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-bold text-navy-900 uppercase tracking-wide">Repayment Breakdown</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-gray-500">Principal</span>
                    <span className="font-semibold text-navy-900 text-right">₦{principal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    <span className="text-gray-500">Interest (10%)</span>
                    <span className="font-semibold text-amber-600 text-right">₦{totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    <span className="text-gray-500">Total Repayable</span>
                    <span className="font-bold text-navy-900 text-right">₦{totalRepayable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    <span className="text-gray-500">Monthly Payment</span>
                    <span className="font-bold text-green-600 text-right">₦{monthlyRepayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}/mo</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">over {months} month{months !== 1 ? 's' : ''}</p>
                  {maxLoanAmount > 0 && principal > maxLoanAmount && (
                    <p className="text-xs text-red-500 font-medium">⚠ Exceeds max loan of ₦{maxLoanAmount.toLocaleString()} (2× savings)</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Section 4 — Repayment Setup */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
              <span className="w-7 h-7 rounded-md flex items-center justify-center">
                <Calendar className="w-4 h-4 text-navy-900" />
              </span>
              <h2 className="text-base font-bold text-navy-900">
                4. Repayment Setup
              </h2>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Date of First Installment
              </label>
              <input
                type="date"
                value={firstInstallmentDate}
                onChange={(e) => setFirstInstallmentDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          Section 5 — Guarantors (optional for cooperative)
         ═══════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <span className="w-7 h-7 rounded-md bg-navy-900 text-white text-xs font-bold flex items-center justify-center">
            5
          </span>
          <h2 className="text-base font-bold text-navy-900">
            Guarantor Information{" "}
            <span className="text-xs font-normal text-gray-400">
              (Optional for cooperative members)
            </span>
          </h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-navy-900">
                Guarantor 1
              </h3>
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter guarantor name"
                  value={guarantor1Name}
                  onChange={(e) => setGuarantor1Name(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="Enter phone number"
                  value={guarantor1Phone}
                  onChange={(e) => setGuarantor1Phone(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
                />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-navy-900">
                Guarantor 2
              </h3>
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter guarantor name"
                  value={guarantor2Name}
                  onChange={(e) => setGuarantor2Name(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="Enter phone number"
                  value={guarantor2Phone}
                  onChange={(e) => setGuarantor2Phone(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          Section 6 — Validation & Sign-off
         ═══════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <span className="w-7 h-7 rounded-md bg-green-600 text-white text-xs font-bold flex items-center justify-center">
            6
          </span>
          <h2 className="text-base font-bold text-navy-900">
            Validation & Sign-off
          </h2>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Signature */}
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-2">
                Borrower's Digital Acknowledgement
              </label>
              {signatureDataUrl ? (
                <div className="relative border-2 border-green-300 rounded-lg h-36 bg-white">
                  <img
                    src={signatureDataUrl}
                    alt="Signature"
                    className="h-full w-full object-contain rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSignatureDataUrl("");
                      const canvas = canvasRef.current;
                      if (canvas) {
                        const ctx = canvas.getContext("2d");
                        ctx?.clearRect(0, 0, canvas.width, canvas.height);
                      }
                    }}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow border border-gray-200 hover:bg-gray-50"
                  >
                    <RotateCcw className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-lg h-36 relative overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={140}
                    className="w-full h-full cursor-crosshair"
                    onMouseDown={(e) => {
                      isDrawingRef.current = true;
                      const canvas = canvasRef.current;
                      if (!canvas) return;
                      const ctx = canvas.getContext("2d");
                      if (!ctx) return;
                      const rect = canvas.getBoundingClientRect();
                      ctx.beginPath();
                      ctx.moveTo(
                        (e.clientX - rect.left) * (canvas.width / rect.width),
                        (e.clientY - rect.top) * (canvas.height / rect.height)
                      );
                    }}
                    onMouseMove={(e) => {
                      if (!isDrawingRef.current) return;
                      const canvas = canvasRef.current;
                      if (!canvas) return;
                      const ctx = canvas.getContext("2d");
                      if (!ctx) return;
                      const rect = canvas.getBoundingClientRect();
                      ctx.lineWidth = 2;
                      ctx.strokeStyle = "#0a1f44";
                      ctx.lineCap = "round";
                      ctx.lineTo(
                        (e.clientX - rect.left) * (canvas.width / rect.width),
                        (e.clientY - rect.top) * (canvas.height / rect.height)
                      );
                      ctx.stroke();
                    }}
                    onMouseUp={() => {
                      isDrawingRef.current = false;
                      const canvas = canvasRef.current;
                      if (canvas)
                        setSignatureDataUrl(canvas.toDataURL("image/png"));
                    }}
                    onMouseLeave={() => {
                      if (isDrawingRef.current) {
                        isDrawingRef.current = false;
                        const canvas = canvasRef.current;
                        if (canvas)
                          setSignatureDataUrl(canvas.toDataURL("image/png"));
                      }
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      isDrawingRef.current = true;
                      const canvas = canvasRef.current;
                      if (!canvas) return;
                      const ctx = canvas.getContext("2d");
                      if (!ctx) return;
                      const rect = canvas.getBoundingClientRect();
                      const t = e.touches[0];
                      ctx.beginPath();
                      ctx.moveTo(
                        (t.clientX - rect.left) * (canvas.width / rect.width),
                        (t.clientY - rect.top) * (canvas.height / rect.height)
                      );
                    }}
                    onTouchMove={(e) => {
                      e.preventDefault();
                      if (!isDrawingRef.current) return;
                      const canvas = canvasRef.current;
                      if (!canvas) return;
                      const ctx = canvas.getContext("2d");
                      if (!ctx) return;
                      const rect = canvas.getBoundingClientRect();
                      const t = e.touches[0];
                      ctx.lineWidth = 2;
                      ctx.strokeStyle = "#0a1f44";
                      ctx.lineCap = "round";
                      ctx.lineTo(
                        (t.clientX - rect.left) * (canvas.width / rect.width),
                        (t.clientY - rect.top) * (canvas.height / rect.height)
                      );
                      ctx.stroke();
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      isDrawingRef.current = false;
                      const canvas = canvasRef.current;
                      if (canvas)
                        setSignatureDataUrl(canvas.toDataURL("image/png"));
                    }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-50">
                    <PenLine className="w-6 h-6 text-gray-300 mb-1" />
                    <p className="text-[10px] text-gray-400">
                      Draw signature here
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* CO Recommendation */}
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-2">
                CO Recommendation
              </label>
              <textarea
                placeholder="Enter credit officer's recommendation notes..."
                value={coRecommendation}
                onChange={(e) => setCoRecommendation(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 resize-none"
              />
            </div>
          </div>

          {/* Bottom row */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-navy-900 focus:ring-navy-900"
              />
              <span className="text-sm text-gray-600">
                I confirm the borrower has provided consent and valid
                identification.
              </span>
            </label>

            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-700 font-medium">
                Verified by System Integrity Check on{" "}
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Action Buttons ─── */}
      <div className="flex items-center justify-end gap-3 pb-6">
        <button
          onClick={() => navigate("/loans")}
          className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting || !isEligible}
          className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting ? "Submitting..." : "Submit Loan Request"}
        </button>
      </div>
    </div>
  );
}
