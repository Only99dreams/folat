import { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  FileSpreadsheet,
  File,
  Eye,
  RotateCcw,
  Calendar,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";
import { fetchSavingsTransactions, fetchBranches } from "../lib/db";

const typeBadge = (type: string) => {
  switch (type) {
    case "deposit":
      return (
        <span className="inline-flex px-2.5 py-1 rounded text-[10px] font-bold tracking-wider bg-green-100 text-green-700">
          DEPOSIT
        </span>
      );
    case "withdrawal":
      return (
        <span className="inline-flex px-2.5 py-1 rounded text-[10px] font-bold tracking-wider bg-red-100 text-red-600">
          WITHDRAWAL
        </span>
      );
    default:
      return (
        <span className="inline-flex px-2.5 py-1 rounded text-[10px] font-bold tracking-wider bg-amber-100 text-amber-700">
          {type?.toUpperCase()}
        </span>
      );
  }
};

export default function SavingsTransactionsPage() {
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const perPage = 20;
  const totalPages = Math.max(1, Math.ceil(totalTransactions / perPage));

  useEffect(() => { fetchBranches().then(setBranches).catch(() => {}); }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const { data, count } = await fetchSavingsTransactions({
        search: search || undefined,
        branch_id: branchFilter || undefined,
        type: typeFilter || undefined,
        page: currentPage,
        pageSize: perPage,
      });
      setTransactions(data);
      setTotalTransactions(count);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadTransactions(); }, [currentPage]);

  const handleApplyFilters = () => { setCurrentPage(1); loadTransactions(); };

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">
            Savings Transactions
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and monitor all member savings activities across branches
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
            <FileText className="w-4 h-4" />
            CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
            <File className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>

      {/* ─── Search & Filters ─── */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Name, Member ID, or Transaction ID (TxID)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
          />
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Branch */}
          <div className="relative flex-1 min-w-[140px]">
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full appearance-none px-4 py-2.5 pr-9 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 bg-white"
            >
              <option value="">All Branches</option>
              {branches.map((b: any) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Transaction Type */}
          <div className="relative flex-1 min-w-[140px]">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full appearance-none px-4 py-2.5 pr-9 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 bg-white"
            >
              <option value="">All Types</option>
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Date Range */}
          <div className="relative flex-1">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Date Range"
              className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Amount Range */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Amount Range"
              className="w-full px-4 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
            />
            <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Apply Button */}
          <button onClick={handleApplyFilters} className="flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white rounded-lg text-sm font-semibold hover:bg-navy-800 transition-colors whitespace-nowrap">
            <SlidersHorizontal className="w-4 h-4" />
            Apply
          </button>
        </div>
      </div>

      {/* ─── Table ─── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  TXID
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Date
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Member / ID
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Branch
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">
                  Type
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-right">
                  Amount
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-right">
                  Balance
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Recorded By
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" /></td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-gray-400 text-sm">No transactions found</td></tr>
              ) : transactions.map((txn: any) => {
                const d = new Date(txn.created_at);
                return (
                <tr
                  key={txn.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  {/* TXID */}
                  <td className="px-6 py-5">
                    <p className="text-sm font-semibold text-navy-900">
                      {txn.transaction_id}
                    </p>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-5">
                    <p className="text-sm text-navy-900">{d.toLocaleDateString()}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </td>

                  {/* Member / ID */}
                  <td className="px-4 py-5">
                    <p className="text-sm font-semibold text-navy-900">
                      {txn.member?.first_name} {txn.member?.last_name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {txn.member?.member_id}
                    </p>
                  </td>

                  {/* Branch */}
                  <td className="px-4 py-5">
                    <p className="text-sm text-gray-600">{txn.branch?.name ?? "—"}</p>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-5 text-center">
                    {typeBadge(txn.type)}
                  </td>

                  {/* Amount */}
                  <td className="px-4 py-5 text-right">
                    <p className={`text-sm font-semibold ${txn.type === "withdrawal" ? "text-red-500" : "text-green-600"}`}>
                      {txn.type === "withdrawal" ? "-" : "+"}₦{Number(txn.amount).toLocaleString()}
                    </p>
                  </td>

                  {/* Balance */}
                  <td className="px-4 py-5 text-right">
                    <p className="text-sm font-medium text-navy-900">
                      ₦{Number(txn.balance_after).toLocaleString()}
                    </p>
                  </td>

                  {/* Recorded By */}
                  <td className="px-4 py-5">
                    <p className="text-sm text-gray-600">{txn.recorder?.full_name ?? "—"}</p>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-5">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        title="View"
                        className="p-2 text-gray-400 hover:text-navy-900 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        title="Reverse"
                        className="p-2 text-gray-400 hover:text-navy-900 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ─── Pagination ─── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-semibold text-navy-900">
              {(currentPage - 1) * perPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-navy-900">
              {Math.min(currentPage * perPage, totalTransactions)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-navy-900">
              {totalTransactions}
            </span>{" "}
            transactions
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {[1, 2, 3].map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === p
                    ? "bg-navy-900 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {p}
              </button>
            ))}

            <span className="px-1 text-gray-400 text-sm">…</span>

            <button
              onClick={() => setCurrentPage(totalPages)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                currentPage === totalPages
                  ? "bg-navy-900 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {totalPages}
            </button>

            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
