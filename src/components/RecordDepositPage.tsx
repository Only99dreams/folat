import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  CreditCard,
  Save,
  PlusCircle,
  CircleEqual,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { fetchMembers, fetchSavingsAccount, recordDeposit } from "../lib/db";
import { useAuth } from "../auth/AuthContext";

export default function RecordDepositPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  /* ── Member Search ── */
  const [memberQuery, setMemberQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [searching, setSearching] = useState(false);

  /* ── Deposit Details ── */
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [txnDate, setTxnDate] = useState(new Date().toISOString().split("T")[0]);
  const [refNumber, setRefNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  /* ── Balance calc ── */
  const depositAmount = Number(amount) || 0;
  const newBalance = currentBalance + depositAmount;

  // Search members
  useEffect(() => {
    if (memberQuery.length < 2) { setSearchResults([]); return; }
    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await fetchMembers({ search: memberQuery, pageSize: 5 });
        setSearchResults(data);
      } catch { setSearchResults([]); }
      setSearching(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [memberQuery]);

  const selectMember = async (member: any) => {
    setSelectedMember(member);
    setSearchResults([]);
    setMemberQuery(`${member.first_name} ${member.last_name}`);
    try {
      const account = await fetchSavingsAccount(member.id);
      setCurrentBalance(Number(account?.balance ?? 0));
    } catch {
      setCurrentBalance(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!selectedMember) { setError("Please select a member."); return; }
    if (!depositAmount || depositAmount <= 0) { setError("Please enter a valid amount."); return; }
    setSubmitting(true);
    try {
      await recordDeposit({
        member_id: selectedMember.id,
        amount: depositAmount,
        payment_method: paymentMethod,
        reference: refNumber,
        notes,
        recorded_by: user!.id,
        branch_id: selectedMember.branch_id ?? undefined,
      });
      navigate("/savings");
    } catch (err: any) {
      setError(err.message || "Failed to record deposit.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-8">
      {/* ─── Page Header ─── */}
      <h1 className="text-2xl font-bold text-navy-900 mb-6">
        Record Savings Deposit
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

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
                if (selectedMember) setSelectedMember(null);
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
            />
            {searching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />}
          </div>
          {searchResults.length > 0 && !selectedMember && (
            <div className="mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto z-10 relative">
              {searchResults.map((m: any) => (
                <button key={m.id} type="button" onClick={() => selectMember(m)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                >
                  <p className="text-sm font-semibold text-navy-900">{m.first_name} {m.last_name}</p>
                  <p className="text-xs text-gray-400">{m.member_id} · {m.phone}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ═══════════ Selected Member Card ═══════════ */}
        {selectedMember && (
          <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-navy-900 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {selectedMember.first_name?.[0]}{selectedMember.last_name?.[0]}
              </div>
              <div>
                <p className="text-[10px] tracking-[0.1em] uppercase text-green-600 font-bold">
                  {selectedMember.status === "active" ? "Active Member" : selectedMember.status}
                </p>
                <p className="text-base font-bold text-navy-900">
                  {selectedMember.first_name} {selectedMember.last_name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {selectedMember.member_id} · {selectedMember.branch?.name ?? ""}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                Current Balance
              </p>
              <p className="text-2xl font-bold text-navy-900">
                ₦{currentBalance.toLocaleString()}
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
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="cheque">Cheque</option>
                  <option value="online">Online</option>
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
            disabled={submitting || !selectedMember}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {submitting ? 'Saving…' : 'Save Deposit'}
          </button>
        </div>
      </form>
    </div>
  );
}
