import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  CreditCard,
  Save,
  PlusCircle,
  CircleEqual,
} from "lucide-react";

export default function RecordDepositPage() {
  const navigate = useNavigate();

  /* ── Member Search ── */
  const [memberQuery, setMemberQuery] = useState("Ajibola Christopher");
  const [memberFound, setMemberFound] = useState(true);

  /* ── Deposit Details ── */
  const [amount, setAmount] = useState("50000");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [txnDate, setTxnDate] = useState("2023-10-27");
  const [refNumber, setRefNumber] = useState("TRX-992031-AB");
  const [notes, setNotes] = useState("");

  /* ── Balance calc ── */
  const currentBalance = 350000;
  const depositAmount = Number(amount) || 0;
  const newBalance = currentBalance + depositAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/savings");
  };

  return (
    <div className="max-w-3xl mx-auto pb-8">
      {/* ─── Page Header ─── */}
      <h1 className="text-2xl font-bold text-navy-900 mb-6">
        Record Savings Deposit
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ═══════════ Member Search ═══════════ */}
        <div>
          <h2 className="text-sm font-bold text-navy-900 mb-3">
            Member Search
          </h2>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, ID, or phone..."
              value={memberQuery}
              onChange={(e) => {
                setMemberQuery(e.target.value);
                setMemberFound(e.target.value.length > 2);
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
            />
          </div>
        </div>

        {/* ═══════════ Selected Member Card ═══════════ */}
        {memberFound && memberQuery && (
          <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                <img
                  src="https://ui-avatars.com/api/?name=Ajibola+Christopher&size=96&background=cccccc&color=1a2744&bold=true"
                  alt="Ajibola Christopher"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-[10px] tracking-[0.1em] uppercase text-green-600 font-bold">
                  Active Member
                </p>
                <p className="text-base font-bold text-navy-900">
                  Ajibola Christopher
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  MBR-000234 · Lagos Mainland
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                Current Balance
              </p>
              <p className="text-2xl font-bold text-navy-900">
                ₦{currentBalance.toLocaleString()}.00
              </p>
            </div>
          </div>
        )}

        {/* ═══════════ Deposit Details ═══════════ */}
        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <CreditCard className="w-5 h-5 text-navy-900" />
            <h2 className="text-lg font-bold text-navy-900">
              Deposit Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Amount (₦)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Payment Method
              </label>
              <div className="relative">
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full appearance-none px-4 py-2.5 pr-9 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 bg-white"
                >
                  <option>Bank Transfer</option>
                  <option>Cash</option>
                  <option>Mobile Money</option>
                  <option>Cheque</option>
                  <option>POS</option>
                </select>
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {/* Transaction Date */}
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Transaction Date
              </label>
              <input
                type="date"
                value={txnDate}
                onChange={(e) => setTxnDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
              />
            </div>

            {/* Reference Number */}
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Reference Number
              </label>
              <input
                type="text"
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                placeholder="TRX-000000-XX"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
              />
            </div>

            {/* Notes — full width */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Notes{" "}
                <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={2}
                placeholder="Enter any additional information..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
              />
            </div>
          </div>
        </section>

        {/* ═══════════ Balance Preview ═══════════ */}
        <div className="bg-navy-900 rounded-xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-navy-800 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Balance Preview</p>
              <p className="text-xs text-navy-300 mt-0.5">
                Review the updated balance before saving
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Current */}
            <div className="text-right">
              <p className="text-[9px] tracking-[0.1em] uppercase text-navy-400 font-semibold">
                Current
              </p>
              <p className="text-sm font-bold text-white">
                ₦{currentBalance.toLocaleString()}
              </p>
            </div>

            <PlusCircle className="w-5 h-5 text-navy-400" />

            {/* Deposit */}
            <div className="text-right">
              <p className="text-[9px] tracking-[0.1em] uppercase text-navy-400 font-semibold">
                Deposit
              </p>
              <p className="text-sm font-bold text-white">
                ₦{depositAmount.toLocaleString()}
              </p>
            </div>

            <CircleEqual className="w-5 h-5 text-navy-400" />

            {/* New Balance */}
            <div className="bg-navy-800 rounded-lg px-4 py-2 text-right">
              <p className="text-[9px] tracking-[0.1em] uppercase text-navy-400 font-semibold">
                New Balance
              </p>
              <p className="text-lg font-bold text-white">
                ₦{newBalance.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* ═══════════ Footer Actions ═══════════ */}
        <div className="flex items-center justify-end gap-4 pt-2">
          <Link
            to="/savings"
            className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Deposit
          </button>
        </div>
      </form>
    </div>
  );
}
