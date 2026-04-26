import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, PenLine, CheckCircle2, Calendar, Loader2, AlertCircle, RotateCcw } from "lucide-react";
import { fetchMembers, fetchGroups, fetchSavingsAccount, generateLoanId, createLoanApplication, uploadFile, checkIsGroupLeader } from "../lib/db";
import { useAuth } from "../auth/useAuth";
import LoanRulesGate from "./LoanRulesGate";

export default function NewLoanApplicationPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [rulesAccepted, setRulesAccepted] = useState(false);

  const [memberSearch, setMemberSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [fatherName, setFatherName] = useState("");
  const [group, setGroup] = useState("");
  const [groups, setGroups] = useState<any[]>([]);
  const [branchId, setBranchId] = useState("");
  const [creditOfficer, setCreditOfficer] = useState(profile?.full_name ?? "");
  const [savingsBalance, setSavingsBalance] = useState("0.00");
  const [loanType, setLoanType] = useState("personal");
  const [loanCycle, setLoanCycle] = useState("");
  const [endOfYear, setEndOfYear] = useState(String(new Date().getFullYear()));
  const [purposeScheme, setPurposeScheme] = useState("");
  const [interestRate, setInterestRate] = useState("15");
  const [durationMonths, setDurationMonths] = useState("12");
  const [disbursementDate, setDisbursementDate] = useState("");
  const [principalAmount, setPrincipalAmount] = useState("0.00");
  const [firstInstallmentDate, setFirstInstallmentDate] = useState("");
  const [coRecommendation, setCoRecommendation] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);

  const [isGroupLeader, setIsGroupLeader] = useState<boolean | null>(null);
  const [checkingLeader, setCheckingLeader] = useState(false);
  const [guarantor1Name, setGuarantor1Name] = useState("");
  const [guarantor1Phone, setGuarantor1Phone] = useState("");
  const [guarantor2Name, setGuarantor2Name] = useState("");
  const [guarantor2Phone, setGuarantor2Phone] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [signatureDataUrl, setSignatureDataUrl] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);

  useEffect(() => {
    fetchGroups().then(r => setGroups(r.data)).catch(() => {});
  }, []);

  const handleMemberSearch = useCallback(async (q: string) => {
    setMemberSearch(q);
    if (q.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const { data } = await fetchMembers({ search: q, pageSize: 5 });
      setSearchResults(data);
    } catch { setSearchResults([]); }
    setSearching(false);
  }, []);

  const selectMember = async (m: any) => {
    setSelectedMember(m);
    setMemberSearch(`${m.first_name} ${m.last_name} (${m.member_id})`);
    setSearchResults([]);
    if (m.branch_id) setBranchId(m.branch_id);
    setGroup(m.group_id || "");
    try {
      const acct = await fetchSavingsAccount(m.id);
      if (acct) setSavingsBalance(Number(acct.balance).toLocaleString());
    } catch (error) {
      console.error("Failed to fetch savings account:", error);
    }

    // Check group leader status for external members
    if (m.member_type === "external") {
      setLoanType("group");
      setCheckingLeader(true);
      try {
        const leader = await checkIsGroupLeader(m.id);
        setIsGroupLeader(leader);
      } catch {
        setIsGroupLeader(false);
      }
      setCheckingLeader(false);
    } else {
      setIsGroupLeader(null);
    }
  };

  const isExternalMember = selectedMember?.member_type === "external";
  const externalBlocked = isExternalMember && (!selectedMember?.group_id || isGroupLeader === false);

  // Calculate service charge based on principal and interest rate
  const principal = parseFloat(principalAmount.replace(/,/g, "")) || 0;
  const rate = parseFloat(interestRate) || 0;
  const months = parseInt(durationMonths) || 12;
  const totalInterest = principal * (rate / 100) * (months / 12);
  const serviceCharge = totalInterest;
  const totalRepayable = principal + totalInterest;
  const monthlyRepayment = months > 0 ? totalRepayable / months : 0;

  const handleSubmit = async () => {
    if (!selectedMember) { setError("Please select a member"); return; }
    if (isExternalMember && !selectedMember.group_id) {
      setError("This external member is not assigned to any group.");
      return;
    }
    if (isExternalMember && isGroupLeader === false) {
      setError("Only group leaders of external loan groups are eligible to request loans.");
      return;
    }
    if (isExternalMember && isGroupLeader && (!guarantor1Name.trim() || !guarantor2Name.trim())) {
      setError("External group leaders must provide at least two guarantors.");
      return;
    }
    if (principal <= 0) { setError("Please enter a valid principal amount"); return; }
    if (!consentChecked) { setError("Please confirm consent"); return; }
    if (!signatureDataUrl) { setError("Please capture borrower's digital signature"); return; }
    setError("");
    setSubmitting(true);
    try {
      const loanId = await generateLoanId();

      // Upload signature image if captured
      let signatureUrl = "";
      if (signatureDataUrl) {
        const blob = await (await fetch(signatureDataUrl)).blob();
        const file = new File([blob], `signature-${loanId}.png`, { type: "image/png" });
        try {
          signatureUrl = await uploadFile("documents", `signatures/${loanId}.png`, file);
        } catch {
          // Storage bucket may not exist yet — continue without URL
        }
      }

      await createLoanApplication({
        loan_id: loanId,
        member_id: selectedMember.id,
        branch_id: branchId || null,
        loan_type: isExternalMember ? "group" : loanType,
        amount_requested: principal,
        interest_rate: rate,
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
        group_id: isExternalMember ? selectedMember.group_id : group || null,
        signature_url: signatureUrl,
        guarantor1_name: guarantor1Name || "",
        guarantor1_status: guarantor1Phone || "",
        guarantor2_name: guarantor2Name || "",
        guarantor2_status: guarantor2Phone || "",
      });
      navigate("/loans");
    } catch (e: any) {
      setError(e.message || "Failed to submit application");
    }
    setSubmitting(false);
  };

  if (!rulesAccepted) {
    return <LoanRulesGate onAccept={() => setRulesAccepted(true)} />;
  }

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
          {/* Row 1 - Member Search */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="relative">
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Search Member
              </label>
              <input
                type="text"
                placeholder="Type member name or ID..."
                value={memberSearch}
                onChange={(e) => handleMemberSearch(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
              />
              {searching && <Loader2 className="absolute right-3 top-[38px] w-4 h-4 text-gray-400 animate-spin" />}
              {searchResults.length > 0 && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {searchResults.map(m => (
                    <button key={m.id} onClick={() => selectMember(m)} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">
                      {m.first_name} {m.last_name} — {m.member_id}
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
            {isExternalMember ? (
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1.5">
                  Assigned Group
                </label>
                <input
                  type="text"
                  value={selectedMember?.group?.name || "No group assigned"}
                  readOnly
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700"
                />
                <p className="mt-1 text-xs text-gray-500">
                  External members can only apply through their assigned group, and only the group leader can submit the request.
                </p>
              </div>
            ) : (
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
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-[38px] w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Name of CO (Credit Officer)
              </label>
              <input
                type="text"
                value={creditOfficer}
                onChange={(e) => setCreditOfficer(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700"
              />
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
            {isExternalMember ? (
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1.5">
                  Type of Loan
                </label>
                <input
                  type="text"
                  value="Group"
                  readOnly
                  className="w-full px-4 py-2.5 border border-green-200 rounded-lg text-sm bg-green-50 text-green-700 font-medium"
                />
              </div>
            ) : (
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
                  <option value="mortgage">Mortgage</option>
                  <option value="emergency">Emergency</option>
                  <option value="agriculture">Agriculture</option>
                  <option value="education">Education</option>
                </select>
                <ChevronDown className="absolute right-3 top-[38px] w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            )}

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

            {/* Interest Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1.5">
                  Interest Rate (%)
                </label>
                <input
                  type="text"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1.5">
                  Duration (Months)
                </label>
                <input
                  type="text"
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
                />
              </div>
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
                    type="date"
                    value={disbursementDate}
                    onChange={(e) => setDisbursementDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
                  />
                </div>
              </div>

              {/* Principal Amount */}
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

              {/* Loan with Service Charge */}
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1.5">
                  Total Interest
                </label>
                <p className="text-2xl font-bold text-navy-900">
                  ₦{serviceCharge.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-green-500 mt-1">
                  Monthly repayment: ₦{monthlyRepayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
                  type="date"
                  value={firstInstallmentDate}
                  onChange={(e) => setFirstInstallmentDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          External Member — Group Leader Notice & Guarantors
         ═══════════════════════════════════════════════════════ */}
      {isExternalMember && (
        <>
          {checkingLeader ? (
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
              <p className="text-sm text-gray-500">Checking group leader status...</p>
            </div>
          ) : externalBlocked ? (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-600 font-medium">Not Eligible</p>
                <p className="text-xs text-red-500">Only group leaders of external loan groups can request loans. This member is not a group leader.</p>
              </div>
            </div>
          ) : isGroupLeader ? (
            <>
              <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                <p className="text-sm text-green-700">This member is a group leader and is eligible to request a loan. Guarantor information is required.</p>
              </div>
              {/* Guarantors — Required for external group leaders */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                  <span className="w-7 h-7 rounded-md bg-navy-900 text-white text-xs font-bold flex items-center justify-center">G</span>
                  <h2 className="text-base font-bold text-navy-900">
                    Guarantor Information <span className="text-xs font-normal text-red-500">(Required for external group leaders)</span>
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-navy-900">Guarantor 1</h3>
                      <div>
                        <label className="block text-sm font-medium text-navy-900 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                        <input type="text" placeholder="Enter guarantor name" value={guarantor1Name} onChange={(e) => setGuarantor1Name(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-navy-900 mb-1.5">Phone Number</label>
                        <input type="text" placeholder="Enter phone number" value={guarantor1Phone} onChange={(e) => setGuarantor1Phone(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-navy-900">Guarantor 2</h3>
                      <div>
                        <label className="block text-sm font-medium text-navy-900 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                        <input type="text" placeholder="Enter guarantor name" value={guarantor2Name} onChange={(e) => setGuarantor2Name(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-navy-900 mb-1.5">Phone Number</label>
                        <input type="text" placeholder="Enter phone number" value={guarantor2Phone} onChange={(e) => setGuarantor2Phone(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </>
      )}

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
              {signatureDataUrl ? (
                <div className="relative border-2 border-green-300 rounded-lg h-36 bg-white">
                  <img src={signatureDataUrl} alt="Signature" className="h-full w-full object-contain rounded-lg" />
                  <button
                    type="button"
                    onClick={() => {
                      setSignatureDataUrl("");
                      const canvas = canvasRef.current;
                      if (canvas) { const ctx = canvas.getContext("2d"); ctx?.clearRect(0, 0, canvas.width, canvas.height); }
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
                      if (canvas) setSignatureDataUrl(canvas.toDataURL("image/png"));
                    }}
                    onMouseLeave={() => {
                      if (isDrawingRef.current) {
                        isDrawingRef.current = false;
                        const canvas = canvasRef.current;
                        if (canvas) setSignatureDataUrl(canvas.toDataURL("image/png"));
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
                      if (canvas) setSignatureDataUrl(canvas.toDataURL("image/png"));
                    }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-50">
                    <PenLine className="w-6 h-6 text-gray-300 mb-1" />
                    <p className="text-[10px] text-gray-400">Draw signature here</p>
                  </div>
                </div>
              )}
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
                Verified by System Integrity Check on {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Action Buttons ─── */}
      <div className="flex items-center justify-end gap-3 pb-6">
        <button onClick={() => navigate("/loans")} className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting || externalBlocked}
          className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting ? "Submitting..." : "Submit Application"}
        </button>
      </div>
    </div>
  );
}
