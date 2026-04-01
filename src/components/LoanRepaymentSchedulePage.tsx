import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Info, Printer, FileDown, CreditCard, Loader2 } from "lucide-react";
import { fetchLoanApplication, fetchLoanSchedule } from "../lib/db";

const statusBadge = (status: string) => {
  const styles: Record<string, string> = {
    paid: "bg-green-100 text-green-600",
    overdue: "bg-red-100 text-red-600",
    pending: "bg-amber-100 text-amber-600",
    partial: "bg-blue-100 text-blue-600",
  };
  return (
    <span className={`inline-flex px-2.5 py-1 rounded text-[10px] font-bold tracking-wider ${styles[status] ?? styles.pending}`}>
      {status.toUpperCase()}
    </span>
  );
};

export default function LoanRepaymentSchedulePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loan, setLoan] = useState<any>(null);
  const [installments, setInstallments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetchLoanApplication(id),
      fetchLoanSchedule(id),
    ]).then(([loanData, scheduleData]) => {
      setLoan(loanData);
      setInstallments(scheduleData);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-navy-900" /></div>;
  if (!loan) return <div className="text-center py-20 text-gray-500">Loan not found.</div>;

  const totalLoan = Number(loan.total_repayable ?? loan.amount_requested ?? 0);
  const totalRepaid = installments.reduce((sum, s) => sum + Number(s.amount_paid ?? 0), 0);
  const completionPercent = totalLoan > 0 ? Math.round((totalRepaid / totalLoan) * 100) : 0;
  const principal = Number(loan.amount_approved ?? loan.amount_requested ?? 0);
  const interestRate = Number(loan.interest_rate ?? 0);
  const months = Number(loan.duration_months ?? 12);
  const monthlyInstallment = Number(loan.monthly_repayment ?? 0);

  return (
    <div className="space-y-6">
      {/* ─── Breadcrumb ─── */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <button
          onClick={() => navigate("/loans")}
          className="hover:text-navy-900 transition-colors"
        >
          Loans
        </button>
        <span>/</span>
        <span className="text-navy-900 font-medium">{loan.loan_id}</span>
      </div>

      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">
            Loan Repayment Schedule
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Schedule ID: {loan.loan_id} • Issued on {new Date(loan.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
            <Printer className="w-4 h-4" />
            Print Schedule
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
            <FileDown className="w-4 h-4" />
            Download PDF
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors">
            <CreditCard className="w-4 h-4" />
            Record Payment
          </button>
        </div>
      </div>

      {/* ─── Loan Summary + Repayment Progress ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Loan Summary — 2/3 */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
            <Info className="w-4 h-4 text-navy-900" />
            <h2 className="text-base font-bold text-navy-900">Loan Summary</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-100 p-6">
            {/* Principal Amount */}
            <div className="pr-5">
              <p className="text-[10px] tracking-[0.1em] uppercase text-red-500 font-bold mb-1">
                Principal Amount
              </p>
              <p className="text-xl font-bold text-navy-900">₦{principal.toLocaleString()}</p>
            </div>

            {/* Interest Rate */}
            <div className="px-5">
              <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
                Interest Rate
              </p>
              <div className="flex items-baseline gap-1">
                <p className="text-xl font-bold text-navy-900">{interestRate}%</p>
                <span className="text-sm text-gray-400">p.a</span>
              </div>
            </div>

            {/* Loan Duration */}
            <div className="px-5">
              <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
                Loan Duration
              </p>
              <p className="text-xl font-bold text-navy-900">{months} Months</p>
            </div>

            {/* Monthly Installment */}
            <div className="pl-5">
              <div className="bg-navy-900 rounded-lg p-4 -mt-1">
                <p className="text-[10px] tracking-[0.1em] uppercase text-navy-200 font-semibold mb-1">
                  Monthly Installment
                </p>
                <p className="text-xl font-bold text-white">₦{monthlyInstallment.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Repayment Progress — 1/3 */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-base font-bold text-navy-900 mb-1">
            Repayment Progress
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            ₦{totalRepaid.toLocaleString()} of ₦{totalLoan.toLocaleString()}{" "}
            repaid
          </p>

          {/* Completion */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-navy-900">
              Completion
            </span>
            <span className="text-sm font-bold text-navy-900">
              {completionPercent}%
            </span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-400">
            Next payment due in 12 days
          </p>
        </div>
      </div>

      {/* ─── Repayment Schedule Table ─── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-navy-900">
            Repayment Schedule
          </h2>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="text-sm font-medium text-navy-900">On-track</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Installment
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Due Date
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">
                  Amount
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">
                  Payment Status
                </th>
                <th className="px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-right">
                  Payment Date
                </th>
              </tr>
            </thead>
            <tbody>
              {installments.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">No schedule entries.</td></tr>
              ) : installments.map((inst) => {
                const isOverdue = inst.status === "overdue";
                return (
                <tr
                  key={inst.id}
                  className={`border-b border-gray-50 transition-colors ${
                    isOverdue ? "bg-amber-50/50" : "hover:bg-gray-50/50"
                  }`}
                >
                  <td className="px-6 py-5">
                    <p className="text-sm font-semibold text-navy-900">
                      Installment #{inst.installment_number}
                    </p>
                  </td>
                  <td className="px-4 py-5">
                    <p className={`text-sm font-medium ${isOverdue ? "text-red-500" : "text-navy-900"}`}>
                      {new Date(inst.due_date).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <p className="text-sm font-medium text-navy-900">
                      ₦{Number(inst.total_due).toLocaleString()}
                    </p>
                  </td>
                  <td className="px-4 py-5 text-center">
                    {statusBadge(inst.status)}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <p className="text-sm text-gray-600">
                      {inst.paid_date ? new Date(inst.paid_date).toLocaleDateString() : "—"}
                    </p>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* View All */}
        <div className="flex items-center justify-center py-4 border-t border-gray-100">
          <button className="text-sm font-semibold text-navy-900 underline underline-offset-2 hover:text-navy-700 transition-colors">
            Total: {installments.length} Installments
          </button>
        </div>
      </div>
    </div>
  );
}
