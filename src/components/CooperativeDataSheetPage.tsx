import { useState, useEffect } from "react";
import {
  Download,
  ChevronDown,
  Loader2,
  Users,
  Printer,
} from "lucide-react";
import ExportMenu from "./ExportMenu";
import { supabase } from "../lib/supabase";
import { fetchBranches } from "../lib/db";

interface MemberRecord {
  id: string;
  member_id: string;
  first_name: string;
  last_name: string;
  branch_name: string;
  group_name: string;
  previous_balance: number;
  current_deposits: number;
  current_withdrawals: number;
  total_balance: number;
}

export default function CooperativeDataSheetPage() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<MemberRecord[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [branchFilter, setBranchFilter] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    fetchBranches().then(setBranches).catch(console.error);
  }, []);

  useEffect(() => {
    loadData();
  }, [selectedMonth, branchFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [year, month] = selectedMonth.split("-").map(Number);
      const monthStart = new Date(year, month - 1, 1).toISOString();
      const monthEnd = new Date(year, month, 0, 23, 59, 59).toISOString();

      // Fetch all cooperative members with savings
      let membersQuery = supabase
        .from("members")
        .select("id, member_id, first_name, last_name, branch_id, branch:branches(name), group:groups!group_id(name)")
        .eq("member_type", "cooperative")
        .eq("status", "active")
        .order("last_name");

      if (branchFilter) membersQuery = membersQuery.eq("branch_id", branchFilter);

      const { data: members } = await membersQuery;
      if (!members || members.length === 0) { setRecords([]); setLoading(false); return; }

      // Fetch savings accounts
      const memberIds = members.map(m => m.id);
      const { data: accounts } = await supabase
        .from("savings_accounts")
        .select("member_id, balance")
        .in("member_id", memberIds);

      // Fetch current month transactions
      const { data: txns } = await supabase
        .from("savings_transactions")
        .select("member_id, type, amount")
        .in("member_id", memberIds)
        .gte("created_at", monthStart)
        .lte("created_at", monthEnd);

      const accountMap = new Map(
        (accounts ?? []).map(a => [a.member_id, Number(a.balance)])
      );

      const txnMap = new Map<string, { deposits: number; withdrawals: number }>();
      for (const t of (txns ?? [])) {
        const entry = txnMap.get(t.member_id) ?? { deposits: 0, withdrawals: 0 };
        if (t.type === "deposit") entry.deposits += Number(t.amount);
        else if (t.type === "withdrawal") entry.withdrawals += Number(t.amount);
        txnMap.set(t.member_id, entry);
      }

      const result: MemberRecord[] = members.map(m => {
        const currentBalance = accountMap.get(m.id) ?? 0;
        const monthTxns = txnMap.get(m.id) ?? { deposits: 0, withdrawals: 0 };
        const previousBalance = currentBalance - monthTxns.deposits + monthTxns.withdrawals;

        return {
          id: m.id,
          member_id: m.member_id,
          first_name: m.first_name,
          last_name: m.last_name,
          branch_name: (m.branch as any)?.name ?? "—",
          group_name: (m.group as any)?.name ?? "—",
          previous_balance: previousBalance,
          current_deposits: monthTxns.deposits,
          current_withdrawals: monthTxns.withdrawals,
          total_balance: currentBalance,
        };
      });

      setRecords(result);
    } catch (err) {
      console.error("Failed to load data sheet:", err);
    } finally {
      setLoading(false);
    }
  };

  const totals = records.reduce(
    (acc, r) => ({
      previous: acc.previous + r.previous_balance,
      deposits: acc.deposits + r.current_deposits,
      withdrawals: acc.withdrawals + r.current_withdrawals,
      total: acc.total + r.total_balance,
    }),
    { previous: 0, deposits: 0, withdrawals: 0, total: 0 }
  );

  const monthLabel = (() => {
    const [y, m] = selectedMonth.split("-").map(Number);
    return new Date(y, m - 1).toLocaleDateString("en-NG", { month: "long", year: "numeric" });
  })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Cooperative Data Sheet</h1>
          <p className="text-sm text-gray-500 mt-1">
            Comprehensive view of all cooperative members' savings records — {monthLabel}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <ExportMenu data={() => records.map((r: any) => ({ Name: r.first_name + ' ' + r.last_name, MemberID: r.member_id, Phone: r.phone, Branch: r.branch?.name || '', Group: r.group?.name || '', Status: r.status, Joined: r.created_at }))} filename="cooperative_data_sheet" label="Export" />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Members</p>
          <div className="flex items-center gap-2 mt-1">
            <Users className="w-5 h-5 text-navy-900" />
            <p className="text-2xl font-bold text-navy-900">{records.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Previous Month Total</p>
          <p className="text-2xl font-bold text-gray-600 mt-1">₦{totals.previous.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Current Month Savings</p>
          <p className="text-2xl font-bold text-green-600 mt-1">₦{totals.deposits.toLocaleString()}</p>
          {totals.withdrawals > 0 && (
            <p className="text-xs text-red-500 mt-0.5">Withdrawals: ₦{totals.withdrawals.toLocaleString()}</p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Total Balance</p>
          <p className="text-2xl font-bold text-navy-900 mt-1">₦{totals.total.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-2">Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20"
            />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-2">Branch</label>
            <div className="relative">
              <select value={branchFilter} onChange={e => setBranchFilter(e.target.value)} className="w-full appearance-none px-3 py-2.5 pr-8 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20 bg-white">
                <option value="">All Branches</option>
                {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex items-end">
            <p className="text-xs text-gray-400">
              Previous Month + Current Deposits − Withdrawals = Total Balance
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden print:shadow-none print:border">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">#</th>
                <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Member</th>
                <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">ID</th>
                <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Branch</th>
                <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Group</th>
                <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-right">Previous Balance</th>
                <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-right">Deposits</th>
                <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-right">Withdrawals</th>
                <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-right">Total Balance</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-5 py-16 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-400 mt-2">Loading data sheet…</p>
                </td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={9} className="px-5 py-16 text-center">
                  <p className="text-sm text-gray-400">No cooperative members found.</p>
                </td></tr>
              ) : records.map((r, i) => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-xs text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-navy-900">{r.last_name}, {r.first_name}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{r.member_id}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{r.branch_name}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{r.group_name}</td>
                  <td className="px-4 py-3 text-right text-sm text-gray-600">₦{r.previous_balance.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-green-600">
                    {r.current_deposits > 0 ? `+₦${r.current_deposits.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-red-600">
                    {r.current_withdrawals > 0 ? `-₦${r.current_withdrawals.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-navy-900">₦{r.total_balance.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            {records.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-navy-900 bg-gray-50">
                  <td colSpan={5} className="px-4 py-3 text-sm font-bold text-navy-900">TOTALS</td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-gray-600">₦{totals.previous.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-green-600">+₦{totals.deposits.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-red-600">{totals.withdrawals > 0 ? `-₦${totals.withdrawals.toLocaleString()}` : "—"}</td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-navy-900">₦{totals.total.toLocaleString()}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
