import { useState, useCallback } from "react";
import { Search, ShieldCheck, Loader2 } from "lucide-react";
import { fetchMembers, fetchSavingsAccount, fetchSavingsTransactions } from "../lib/db";

const periods = ["30d", "3m", "6m", "Custom"] as const;

export default function SavingsStatementPage() {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [savingsAccount, setSavingsAccount] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activePeriod, setActivePeriod] = useState<string>("30d");

  const handleSearch = useCallback(async (q: string) => {
    setSearch(q);
    if (q.trim().length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const { data } = await fetchMembers({ search: q });
      setSearchResults(data.slice(0, 8));
    } catch { setSearchResults([]); }
    setSearching(false);
  }, []);

  const selectMember = async (member: any) => {
    setSelectedMember(member);
    setSearchResults([]);
    setSearch("");
    setLoading(true);
    try {
      const acct = await fetchSavingsAccount(member.id);
      setSavingsAccount(acct);
      const now = new Date();
      let dateFrom: string | undefined;
      if (activePeriod === "30d") dateFrom = new Date(now.getTime() - 30 * 86400000).toISOString();
      else if (activePeriod === "3m") dateFrom = new Date(now.getTime() - 90 * 86400000).toISOString();
      else if (activePeriod === "6m") dateFrom = new Date(now.getTime() - 180 * 86400000).toISOString();
      const { data } = await fetchSavingsTransactions({ member_id: member.id, date_from: dateFrom });
      setTransactions(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const totalDeposits = transactions.filter(t => t.type === "deposit").reduce((s, t) => s + Number(t.amount), 0);
  const totalWithdrawals = transactions.filter(t => t.type === "withdrawal").reduce((s, t) => s + Number(t.amount), 0);
  const closingBalance = Number(savingsAccount?.balance ?? 0);
  const openingBalance = closingBalance - totalDeposits + totalWithdrawals;

  return (
    <div className="space-y-6">
      {/* ─── Search Bar ─── */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Name, Member ID, or Transaction ID (TxID)..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
          />
          {searching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />}
          {searchResults.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {searchResults.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => selectMember(m)}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-gray-50 text-sm"
                >
                  <span className="font-medium text-navy-900">{m.first_name} {m.last_name}</span>
                  <span className="text-xs text-gray-500">{m.member_id}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {!selectedMember && (
        <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
          <p className="text-gray-400 text-sm">Search and select a member to view their savings statement.</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-navy-900" />
        </div>
      )}

      {selectedMember && !loading && (
      <div className="bg-white rounded-xl border border-gray-100 p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-2">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-navy-900 rounded-lg flex items-center justify-center">
              <img src="/logo.png" alt="FOLAT" className="w-8 h-8 object-contain brightness-0 invert" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-navy-900">Savings Statement</h1>
              <p className="text-sm text-gray-500 mt-1">
                Statement for: {selectedMember.first_name} {selectedMember.last_name}
              </p>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg overflow-hidden text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <div className="px-4 py-2 bg-gray-50 font-medium text-gray-500 border-b border-r border-gray-200">Member Name:</div>
              <div className="px-4 py-2 font-semibold text-navy-900 border-b border-gray-200">{selectedMember.first_name} {selectedMember.last_name}</div>
              <div className="px-4 py-2 bg-gray-50 font-medium text-gray-500 border-b border-r border-gray-200">Member ID:</div>
              <div className="px-4 py-2 font-semibold text-navy-900 border-b border-gray-200">{selectedMember.member_id}</div>
              <div className="px-4 py-2 bg-gray-50 font-medium text-gray-500 border-r border-gray-200">Branch:</div>
              <div className="px-4 py-2 font-semibold text-navy-900">{selectedMember.branch?.name || "—"}</div>
            </div>
          </div>
        </div>

        {/* Period Toggle */}
        <div className="flex items-center justify-between mt-6 mb-6">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            {periods.map((p) => (
              <button key={p} onClick={() => { setActivePeriod(p); selectMember(selectedMember); }}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activePeriod === p ? "bg-navy-900 text-white" : "text-gray-600 hover:text-navy-900"}`}
              >{p}</button>
            ))}
          </div>
          <p className="text-xs text-gray-400">Generated on: {new Date().toLocaleDateString("en-NG")}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">Opening Balance</p>
            <p className="text-xl font-bold text-navy-900">₦{openingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-[10px] tracking-[0.1em] uppercase text-green-600 font-semibold mb-1">Total Deposits</p>
            <p className="text-xl font-bold text-green-600">₦{totalDeposits.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-[10px] tracking-[0.1em] uppercase text-red-500 font-semibold mb-1">Total Withdrawals</p>
            <p className="text-xl font-bold text-red-500">₦{totalWithdrawals.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-navy-900 rounded-lg p-4">
            <p className="text-[10px] tracking-[0.1em] uppercase text-navy-200 font-semibold mb-1">Closing Balance</p>
            <p className="text-xl font-bold text-white">₦{closingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-10">
          <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3.5 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Date</th>
                <th className="px-4 py-3.5 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Transaction Details</th>
                <th className="px-4 py-3.5 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Reference</th>
                <th className="px-4 py-3.5 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-right">Amount</th>
                <th className="px-6 py-3.5 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">No transactions found for this period.</td></tr>
              ) : transactions.map((txn) => (
                <tr key={txn.id} className="border-b border-gray-100 last:border-b-0">
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(txn.created_at).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" })}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-navy-900">{txn.type === "deposit" ? "Deposit" : "Withdrawal"}{txn.description ? ` - ${txn.description}` : ""}</td>
                  <td className="px-4 py-4 text-sm text-gray-400 font-mono">{txn.transaction_id}</td>
                  <td className={`px-4 py-4 text-sm font-semibold text-right ${txn.type === "deposit" ? "text-green-600" : "text-red-500"}`}>
                    {txn.type === "deposit" ? "+" : "-"}₦{Number(txn.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-navy-900 text-right">₦{Number(txn.balance_after ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

        {/* Signatures Section */}
        <div className="flex items-end justify-between px-4 mb-10">
          <div className="text-center">
            <p className="text-[10px] tracking-[0.15em] uppercase text-green-600 font-semibold mb-8">Customer Acknowledgement</p>
            <div className="w-56 border-b border-gray-300 mb-3" />
            <p className="text-sm font-medium text-navy-900">{selectedMember.first_name} {selectedMember.last_name}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] tracking-[0.15em] uppercase text-gray-400 font-semibold mb-4">Authorized Official</p>
            <div className="flex justify-center mb-3">
              <ShieldCheck className="w-8 h-8 text-navy-900" />
            </div>
            <p className="text-sm font-medium text-navy-900">Operations Manager</p>
          </div>
        </div>

        {/* ─── Footer Disclaimer ─── */}
        <div className="border-t border-gray-100 pt-6 text-center space-y-1">
          <p className="text-xs text-gray-400">
            This is a computer-generated document. No signature is required for
            electronic verification.
          </p>
          <p className="text-xs text-gray-400">
            FOLAT Financial Services | 123 Finance Plaza, Victoria Island, Lagos
            | info@folat.com | +234 1 234 5678
          </p>
        </div>
      </div>
      )}
    </div>
  );
}
