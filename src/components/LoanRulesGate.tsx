import { useState, useEffect } from "react";
import { ScrollText, AlertTriangle, Check, ChevronRight, Loader2 } from "lucide-react";
import { fetchLoanRules } from "../lib/db";

interface LoanRulesGateProps {
  onAccept: () => void;
  category?: string;
}

const defaultRules = [
  {
    title: "Eligibility Requirements",
    content: "Applicants must be active cooperative members with a minimum of 3 months membership. Savings account must be in good standing with no frozen status.",
  },
  {
    title: "Loan Amount Limits",
    content: "Maximum loan amount shall not exceed 3 times the applicant's total savings balance. First-time borrowers are limited to 2 times their savings.",
  },
  {
    title: "Interest Rate & Duration",
    content: "Interest rates range from 10% to 20% per annum depending on loan type and duration. Maximum loan duration is 24 months for personal loans and 36 months for business loans.",
  },
  {
    title: "Guarantor Requirements",
    content: "Cooperative loans require at least one guarantor who is an active employee in the organization. Guarantor financial eligibility is evaluated by backend policy and shown as Eligible or Not Eligible.",
  },
  {
    title: "Repayment Terms",
    content: "Repayments are due monthly starting from the first installment date. Late payments attract a penalty of 2% of the overdue amount per month.",
  },
  {
    title: "Default & Recovery",
    content: "A loan is considered in default after 90 days of non-payment. The cooperative reserves the right to recover outstanding amounts from the borrower's savings and guarantors' accounts.",
  },
  {
    title: "Loan Application Processing",
    content: "All loan applications are subject to review by the Credit Officer and approval by the Branch Manager or designated authority. Processing takes 3-5 business days.",
  },
];

const cooperativeTerms = [
  {
    title: "Minimum Savings Period",
    content: "A new member must maintain savings with the cooperative for a minimum period of six (6) months before becoming eligible to apply for a cooperative loan.",
  },
  {
    title: "Repayment Period",
    content: "The repayment period for any approved cooperative loan shall not exceed twelve (12) months.",
  },
  {
    title: "Processing Time",
    content: "Loan applications are typically processed and approved within three (3) to five (5) working days, subject to compliance with the cooperative's requirements and approval procedures.",
  },
  {
    title: "Guarantor Eligibility",
    content: "Every loan applicant must provide a guarantor who is a member of staff and is not currently servicing a cooperative loan.",
  },
  {
    title: "Concurrent Loan Eligibility",
    content: "Only managers may be eligible to obtain both an asset loan and a cooperative loan simultaneously, provided their salary can adequately support the repayments. Such approvals shall be subject to management's discretion.",
  },
  {
    title: "Asset Loan Service Requirement",
    content: "An employee must have completed a minimum of four (4) months of service before becoming eligible for an asset loan.",
  },
  {
    title: "Asset Loan Amounts",
    content: "Asset loans commence from ₦150,000 for Credit Officers, while managers are eligible from ₦200,000 and above, subject to approval and eligibility requirements.",
  },
  {
    title: "Asset Loan Guarantor",
    content: "Applicants for an asset loan must provide a guarantor within the organization who is not currently benefiting from an asset loan.",
  },
  {
    title: "Asset Loan Repayment Period",
    content: "The repayment period for an asset loan shall not exceed ten (10) months.",
  },
  {
    title: "Post-Resignation Savings Release",
    content: "Any staff member who resigns from the organization shall be entitled to receive his or her cooperative savings no earlier than one (1) month after resignation. However, where issues arise during the audit or clearance process, the payment may be delayed until all outstanding matters have been satisfactorily resolved.",
  },
];

export default function LoanRulesGate({ onAccept, category }: LoanRulesGateProps) {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepted, setAccepted] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchLoanRules(category);
        setRules(data.length > 0 ? data : (category === "cooperative" ? cooperativeTerms : defaultRules));
      } catch {
        setRules(category === "cooperative" ? cooperativeTerms : defaultRules);
      }
      setLoading(false);
    })();
  }, [category]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 50) {
      setScrolledToBottom(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-navy-900" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <ScrollText className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-navy-900">{category === "cooperative" ? "Terms & Conditions for Cooperative Members" : "Loan Rules & Regulations"}</h1>
        <p className="text-sm text-gray-500 mt-2">
          Please read and accept the following terms before proceeding with a loan application.
        </p>
      </div>

      {/* Important Notice */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-semibold">Mandatory Reading</p>
          <p className="mt-0.5">You must scroll through and read all rules before you can proceed to the loan application form.</p>
        </div>
      </div>

      {/* Rules Content */}
      <div
        className="bg-white rounded-xl border border-gray-100 max-h-[400px] overflow-y-auto"
        onScroll={handleScroll}
      >
        <div className="p-6 space-y-6">
          {rules.map((rule, i) => (
            <div key={i} className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-navy-900 text-white flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-navy-900">{rule.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{rule.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {!scrolledToBottom && (
        <p className="text-center text-xs text-gray-400 animate-pulse">
          ↓ Scroll down to read all rules
        </p>
      )}

      {/* Acceptance */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={accepted}
            onChange={e => setAccepted(e.target.checked)}
            disabled={!scrolledToBottom}
            className="mt-1 w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 disabled:opacity-40"
          />
          <span className={`text-sm ${scrolledToBottom ? "text-navy-900" : "text-gray-400"}`}>
            I have read, understood, and agree to abide by the loan rules and regulations stated above. I understand that any violation may result in penalties or rejection of my application.
          </span>
        </label>
      </div>

      {/* Action */}
      <div className="flex justify-center">
        <button
          onClick={onAccept}
          disabled={!accepted}
          className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Check className="w-4 h-4" />
          Proceed to Loan Application
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
