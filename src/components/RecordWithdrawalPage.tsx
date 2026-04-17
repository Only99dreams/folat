import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, Minus, X } from "lucide-react";
import { fetchMembers, fetchSavingsAccount, recordWithdrawal } from "../lib/db";
import { useAuth } from "../auth/useAuth";

export default function RecordWithdrawalPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [memberSearch, setMemberSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [savingsAccount, setSavingsAccount] = useState<any>(null);

  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [reference, setReference] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSearch = useCallback(async (q: string) => {
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
    try {
      const acct = await fetchSavingsAccount(m.id);
      setSavingsAccount(acct);
    } catch {
      setSavingsAccount(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMember || !amount || !profile) return;
    const withdrawalAmount = Number(amount);
    if (withdrawalAmount <= 0) { setError("Amount must be greater than zero"); return; }
    if (savingsAccount && withdrawalAmount > Number(savingsAccount.balance)) {
      setError("Withdrawal amount exceeds available balance");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await recordWithdrawal({
        member_id: selectedMember.id,
        amount: withdrawalAmount,
        payment_method: paymentMethod,
        reference,
        notes: reason ? `Reason: ${reason}${notes ? `. ${notes}` : ""}` : notes,
        recorded_by: profile.id,
        branch_id: selectedMember.branch_id ?? undefined,
      });
      setSuccess(true);
      setTimeout(() => navigate("/savings"), 1500);
    } catch (err: any) {
      setError(err.message || "Failed to record withdrawal");
    } finally {
      setSubmitting(false);
    }
  };

  const currentBalance = savingsAccount ? Number(savingsAccount.balance) : 0;
  const withdrawalAmount = Number(amount) || 0;
  const newBalance = currentBalance - withdrawalAmount;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Record Withdrawal</h1>
        <p className="text-sm text-gray-500 mt-1">Process a savings withdrawal for a cooperative member.</p>
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">
          Withdrawal recorded successfully! Redirecting...
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
      )}

      {/* Member Search */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="text-base font-bold text-navy-900">Member</h2>
        {selectedMember ? (
          <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div>
              <p className="text-sm font-semibold text-navy-900">{selectedMember.first_name} {selectedMember.last_name}</p>
              <p className="text-xs text-gray-500">{selectedMember.member_id} · {selectedMember.branch?.name ?? ""}</p>
              <p className="text-sm font-bold text-green-600 mt-1">Balance: ₦{currentBalance.toLocaleString()}</p>
            </div>
            <button onClick={() => { setSelectedMember(null); setSavingsAccount(null); setMemberSearch(""); }} className="p-1.5 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search member by name, ID, or phone..."
              value={memberSearch}
              onChange={e => handleSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20"
            />
            {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />}
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {searchResults.map((m: any) => (
                  <button key={m.id} onClick={() => selectMember(m)} className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                    <p className="text-sm font-medium text-navy-900">{m.first_name} {m.last_name}</p>
                    <p className="text-xs text-gray-400">{m.member_id} · {m.phone}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Withdrawal Details */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="text-base font-bold text-navy-900">Withdrawal Details</h2>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Amount (₦) *</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" min="0" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Reason for Withdrawal *</label>
          <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. School fees, Medical, Personal" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Payment Method</label>
            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-navy-900/20">
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
              <option value="mobile_money">Mobile Money</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Reference Number</label>
            <input type="text" value={reference} onChange={e => setReference(e.target.value)} placeholder="Optional" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Optional notes..." className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 resize-none" />
        </div>
      </div>

      {/* Balance Preview */}
      {selectedMember && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-base font-bold text-navy-900 mb-4">Balance Preview</h2>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-xs text-gray-400 font-semibold uppercase">Current Balance</p>
              <p className="text-xl font-bold text-navy-900">₦{currentBalance.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <Minus className="w-5 h-5 text-red-500 mx-auto" />
              <p className="text-xs text-gray-400 font-semibold uppercase mt-1">Withdrawal</p>
              <p className="text-xl font-bold text-red-600">₦{withdrawalAmount.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 font-semibold uppercase">=</p>
              <p className="text-xs text-gray-400 font-semibold uppercase">New Balance</p>
              <p className={`text-xl font-bold ${newBalance >= 0 ? "text-green-600" : "text-red-600"}`}>₦{newBalance.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button onClick={() => navigate("/savings")} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!selectedMember || !amount || !reason || submitting || success}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Process Withdrawal
        </button>
      </div>
    </div>
  );
}
