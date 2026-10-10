import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Loader2,
  ChevronRight,
  PiggyBank,
  ArrowLeft,
} from "lucide-react";
import ExportMenu from "./ExportMenu";
import { fetchStaffByProfileId, fetchLoanApplications, fetchMemberByEmail, fetchSavingsAccount, fetchSavingsTransactions, fetchLoanRepayments } from "../lib/db";
import { useAuth } from "../auth/useAuth";

export default function StaffPortfolioPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeLoans, setActiveLoans] = useState<any[]>([]);
  const [overdueLoans, setOverdueLoans] = useState<any[]>([]);
  const [otherLoans, setOtherLoans] = useState<any[]>([]);
  const [savingsAccount, setSavingsAccount] = useState<any>(null);
  const [savingsTxns, setSavingsTxns] = useState<any[]>([]);
  const [repayments, setRepayments] = useState<any[]>([]);
  const [paidBackLoans, setPaidBackLoans] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      setLoading(true);
      try {
        const staff = await fetchStaffByProfileId(user.id);
        if (staff?.email) {
          const member = await fetchMemberByEmail(staff.email);
          const mid = member?.id;
          if (mid) {
            const [active, overdue, allLoans, savings, txns, reps, paidBack] = await Promise.all([
              fetchLoanApplications({ status: ["approved", "disbursed"], member_id: mid, pageSize: 50, user: { id: user.id, role: user.role, branch: user.branch } }),
              fetchLoanApplications({ status: "overdue", member_id: mid, pageSize: 50, user: { id: user.id, role: user.role, branch: user.branch } }),
              fetchLoanApplications({ member_id: mid, pageSize: 50, user: { id: user.id, role: user.role, branch: user.branch } }),
               fetchSavingsAccount(mid),
               fetchSavingsTransactions({ member_id: mid, pageSize: 50 }),
               fetchLoanRepayments({ member_id: mid, pageSize: 50 }),
               fetchLoanApplications({ status: "completed", member_id: mid, pageSize: 50, user: { id: user.id, role: user.role, branch: user.branch } }),
             ]);
             setActiveLoans(active.data || []);
             setOverdueLoans(overdue.data || []);
             setOtherLoans((allLoans.data || []).filter((l: any) => l.status !== "disbursed" && l.status !== "overdue" && l.status !== "approved"));
            setSavingsAccount(savings);
            setSavingsTxns(txns.data || []);
            setRepayments(reps.data || []);
            setPaidBackLoans(paidBack.data || []);
          }
        }
      } catch {}
      setLoading(false);
    })();
  }, [user?.id]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-navy-900" /></div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-navy-900 mb-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-navy-900">My Portfolio</h1>
          <p className="text-sm text-gray-500 mt-1">Complete view of your loans, savings, and repayment history.</p>
        </div>
        <ExportMenu
          data={() => [
            ...activeLoans.map((l: any) => ({ Type: "Active Loan", ID: l.loan_id, Amount: l.outstanding_balance ?? l.amount_approved ?? l.amount_requested ?? 0, Status: l.status })),
            ...overdueLoans.map((l: any) => ({ Type: "Overdue Loan", ID: l.loan_id, Amount: l.outstanding_balance ?? l.amount_approved ?? l.amount_requested ?? 0, Status: l.status })),
             ...paidBackLoans.map((l: any) => ({ Type: "Paid Back Loan", ID: l.loan_id, Amount: l.amount_approved ?? l.amount_requested ?? 0, Status: l.status })),
            ...savingsTxns.map((t: any) => ({ Type: "Savings " + t.type, ID: t.transaction_id || t.id, Amount: t.amount, Date: t.created_at })),
            ...repayments.map((r: any) => ({ Type: "Loan Repayment", ID: r.repayment_id || r.id, Loan: r.loan?.loan_id || "", Amount: r.amount, Date: r.created_at })),
          ]}
          filename="my_portfolio"
          label="Export Portfolio"
        />
        {activeLoans.length > 0 && (
          <div></div>
        )}
      </div>

      {/* Savings Overview */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-green-50 flex items-center justify-center">
            <PiggyBank className="w-7 h-7 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Savings Balance</p>
            <p className="text-3xl font-bold text-navy-900">₦{Number(savingsAccount?.balance ?? 0).toLocaleString()}</p>
            {savingsAccount?.account_number && (
              <p className="text-xs text-gray-400 mt-1">Account: {savingsAccount.account_number}</p>
            )}
          </div>
        </div>
        {savingsTxns.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-navy-900 mb-3">Recent Savings Transactions</h3>
            <div className="space-y-2">
              {savingsTxns.slice(0, 5).map((t: any) => (
                <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-navy-900 capitalize">{t.type}</p>
                    <p className="text-xs text-gray-400">{t.created_at ? new Date(t.created_at).toLocaleDateString() : ""}</p>
                  </div>
                  <p className={`text-sm font-semibold ${t.type === "deposit" ? "text-green-600" : "text-red-500"}`}>
                    {t.type === "deposit" ? "+" : "-"}₦{Number(t.amount).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Active Loans */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-navy-900">Active Loans ({activeLoans.length})</h2>
        </div>
        {activeLoans.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No active loans</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Loan ID</th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Amount</th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Monthly PMT</th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Status</th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {activeLoans.map((loan: any) => (
                  <tr key={loan.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-navy-900">{loan.loan_id}</p>
                    </td>
                     <td className="px-4 py-4">
                       <p className="text-sm text-navy-900">₦{Number(loan.outstanding_balance ?? loan.amount_approved ?? loan.amount_requested ?? 0).toLocaleString()}</p>
                     </td>
                     <td className="px-4 py-4">
                       <p className="text-sm text-navy-900">₦{Number(loan.monthly_repayment ?? 0).toLocaleString()}</p>
                     </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-semibold text-green-600">Active</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link to={`/loans/${loan.id}`} className="inline-flex items-center gap-1 text-xs font-medium text-green-600 hover:text-green-700">
                        View <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Overdue Loans */}
      {overdueLoans.length > 0 && (
        <div className="bg-white rounded-xl border border-red-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-red-100">
            <h2 className="text-lg font-bold text-red-600">Overdue Loans ({overdueLoans.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-red-50">
                  <th className="px-6 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Loan ID</th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Amount</th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Status</th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {overdueLoans.map((loan: any) => (
                  <tr key={loan.id} className="border-b border-red-50 hover:bg-red-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-navy-900">{loan.loan_id}</p>
                    </td>
                     <td className="px-4 py-4">
                       <p className="text-sm text-navy-900">₦{Number(loan.outstanding_balance ?? loan.amount_approved ?? loan.amount_requested ?? 0).toLocaleString()}</p>
                     </td>
                     <td className="px-4 py-4">
                       <span className="text-sm font-semibold text-red-500">Overdue</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link to={`/loans/${loan.id}`} className="inline-flex items-center gap-1 text-xs font-medium text-green-600 hover:text-green-700">
                        View <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Other Loans */}
      {otherLoans.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-navy-900">Other Loan Applications ({otherLoans.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Loan ID</th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Amount</th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Status</th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {otherLoans.map((loan: any) => (
                  <tr key={loan.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-navy-900">{loan.loan_id}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-navy-900">₦{Number(loan.amount_requested ?? 0).toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-semibold capitalize text-gray-600">{loan.status}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link to={`/loans/${loan.id}`} className="inline-flex items-center gap-1 text-xs font-medium text-green-600 hover:text-green-700">
                        View <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Paid Back Loans */}
      {paidBackLoans.length > 0 && (
        <div className="bg-white rounded-xl border border-green-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-green-100">
            <h2 className="text-lg font-bold text-green-700">Paid Back Loans ({paidBackLoans.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-green-50">
                  <th className="px-6 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Loan ID</th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Type</th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Amount</th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {paidBackLoans.map((loan: any) => (
                  <tr key={loan.id} className="border-b border-green-50 hover:bg-green-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/loans/${loan.id}`} className="text-sm font-semibold text-navy-900 hover:text-green-700">{loan.loan_id}</Link>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-navy-900 capitalize">{loan.loan_type}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-green-600">₦{Number(loan.outstanding_balance ?? loan.amount_approved ?? loan.amount_requested ?? 0).toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-500">{loan.updated_at ? new Date(loan.updated_at).toLocaleDateString() : "—"}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Repayment History */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-navy-900">Repayment History ({repayments.length})</h2>
        </div>
        {repayments.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No repayments recorded yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Repayment ID</th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Loan</th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Amount</th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Method</th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {repayments.map((r: any) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-navy-900">{r.repayment_id || r.id?.slice(0, 8)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-navy-900">{r.loan?.loan_id || "—"}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-green-600">₦{Number(r.amount).toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600 capitalize">{r.payment_method || "—"}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600">{r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
