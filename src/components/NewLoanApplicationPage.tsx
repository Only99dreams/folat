import { useState } from "react";
import { ChevronDown, PenLine, CheckCircle2, Calendar } from "lucide-react";

export default function NewLoanApplicationPage() {
  const [borrowerName, setBorrowerName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [group, setGroup] = useState("");
  const [creditOfficer] = useState("James Wilson");
  const [savingsBalance, setSavingsBalance] = useState("0.00");
  const [loanType, setLoanType] = useState("Business Expansion");
  const [loanCycle, setLoanCycle] = useState("");
  const [endOfYear, setEndOfYear] = useState("2024");
  const [purposeScheme, setPurposeScheme] = useState("");
  const [riskPremium, setRiskPremium] = useState("0.0");
  const [disbursementDate, setDisbursementDate] = useState("");
  const [principalAmount, setPrincipalAmount] = useState("0.00");
  const [firstInstallmentDate, setFirstInstallmentDate] = useState("");
  const [coRecommendation, setCoRecommendation] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);

  // Calculate service charge based on principal and risk premium
  const principal = parseFloat(principalAmount.replace(/,/g, "")) || 0;
  const premium = parseFloat(riskPremium) || 0;
  const serviceCharge = principal * (premium / 100);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* ─── Header ─── */}
      <div>
        <h1 className="text-2xl font-bold text-navy-900">
          New Loan Application
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Fill in the required information to process the cooperative loan
          request.
        </p>
      </div>

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
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Name of Borrower
              </label>
              <input
                type="text"
                placeholder="Enter full legal name"
                value={borrowerName}
                onChange={(e) => setBorrowerName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
              />
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
            <div className="relative">
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Name of Group
              </label>
              <select
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 pr-9 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 bg-white"
              >
                <option value="">Select Group</option>
                <option>Unity Farmers Group</option>
                <option>Market Women Association</option>
                <option>Artisan Cooperative</option>
              </select>
              <ChevronDown className="absolute right-3 top-[38px] w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Name of CO (Credit Officer)
              </label>
              <input
                type="text"
                value={creditOfficer}
                readOnly
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Current Savings Balance
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  $
                </span>
                <input
                  type="text"
                  value={savingsBalance}
                  onChange={(e) => setSavingsBalance(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          Sections 2 & 3 — Loan Details + Disbursement Details
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
            {/* Type of Loan */}
            <div className="relative">
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Type of Loan
              </label>
              <select
                value={loanType}
                onChange={(e) => setLoanType(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 pr-9 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 bg-white"
              >
                <option>Business Expansion</option>
                <option>Personal</option>
                <option>Mortgage</option>
                <option>Agriculture</option>
                <option>Education</option>
              </select>
              <ChevronDown className="absolute right-3 top-[38px] w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Loan Cycle + End of Year */}
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
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1.5">
                  End of Year
                </label>
                <input
                  type="text"
                  value={endOfYear}
                  onChange={(e) => setEndOfYear(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
                />
              </div>
            </div>

            {/* Purpose Scheme */}
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Purpose Scheme
              </label>
              <textarea
                placeholder="Briefly describe the purpose..."
                value={purposeScheme}
                onChange={(e) => setPurposeScheme(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 resize-none"
              />
            </div>

            {/* Risk Premium */}
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Risk Premium (%)
              </label>
              <input
                type="text"
                value={riskPremium}
                onChange={(e) => setRiskPremium(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
              />
            </div>
          </div>
        </div>

        {/* Section 3 — Disbursement Details + Section 4 — Repayment Setup */}
        <div className="space-y-6">
          {/* Disbursement Details */}
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
              {/* Disbursement Date */}
              <div className="relative">
                <label className="block text-sm font-medium text-navy-900 mb-1.5">
                  Disbursement Date
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="mm/dd/yyyy"
                    value={disbursementDate}
                    onChange={(e) => setDisbursementDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Principal Amount */}
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1.5">
                  Principal Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    $
                  </span>
                  <input
                    type="text"
                    value={principalAmount}
                    onChange={(e) => setPrincipalAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
                  />
                </div>
              </div>

              {/* Loan with Service Charge */}
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1.5">
                  Loan with Service Charge ($ Charge)
                </label>
                <p className="text-2xl font-bold text-navy-900">
                  ${serviceCharge.toFixed(2)}
                </p>
                <p className="text-xs text-green-500 mt-1">
                  Calculated automatically based on principal and risk premium.
                </p>
              </div>
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
              <div className="relative">
                <input
                  type="text"
                  placeholder="mm/dd/yyyy"
                  value={firstInstallmentDate}
                  onChange={(e) => setFirstInstallmentDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          Section 5 — Validation & Sign-off
         ═══════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <span className="w-7 h-7 rounded-md bg-green-600 text-white text-xs font-bold flex items-center justify-center">
            5
          </span>
          <h2 className="text-base font-bold text-navy-900">
            Validation & Sign-off
          </h2>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Borrower's Digital Acknowledgement */}
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-2">
                Borrower's Digital Acknowledgement
              </label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg h-36 flex flex-col items-center justify-center cursor-pointer hover:border-navy-300 hover:bg-gray-50 transition-colors">
                <PenLine className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-xs text-gray-400">
                  Click to capture digital signature
                </p>
              </div>
            </div>

            {/* CO Recommendation */}
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-2">
                CO Recommendation/Recr.
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
            {/* Consent checkbox */}
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

            {/* Verified badge */}
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-700 font-medium">
                Verified by System Integrity Check on Oct 24, 2023
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Action Buttons ─── */}
      <div className="flex items-center justify-end gap-3 pb-6">
        <button className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
          Save as Draft
        </button>
        <button className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">
          Submit Application
        </button>
      </div>
    </div>
  );
}
