import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Download,
  TrendingUp,
  TrendingDown,
  ClipboardList,
  SlidersHorizontal,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Loader2,
} from "lucide-react";
import { fetchFinanceTransactions, fetchBranches } from "../lib/db";

const typeBadge = (type: Transaction["type"]) => {
  const styles: Record<string, string> = {
    Income: "text-green-600",
    Expense: "text-red-500",
  };
  const bgStyles: Record<string, string> = {
    Income: "bg-green-100 text-green-700",
    Expense: "bg-red-100 text-red-600",
  };
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${type === "Income" ? "bg-green-500" : "bg-red-500"}`} />
      <span className={`inline-flex px-2.5 py-0.5 rounded text-xs font-semibold ${bgStyles[type]}`}>
        {type}
      </span>
    </div>
  );
};

export default function FinancialLedgerPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [branches, setBranches] = useState<any[]>([]);
  const [branchFilter, setBranchFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const perPage = 10;

  useEffect(() => { fetchBranches().then(setBranches).catch(() => {}); }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const filters: any = { page, pageSize: perPage };
        if (branchFilter) filters.branch_id = branchFilter;
        if (typeFilter) filters.type = typeFilter;
        if (categoryFilter) filters.category = categoryFilter;
        const { data, count } = await fetchFinanceTransactions(filters);
        setTransactions(data);
        setTotalEntries(count);
      } catch {}
      setLoading(false);
    })();
  }, [page, branchFilter, typeFilter, categoryFilter]);

  useEffect(() => {
    (async () => {
      try {
        const [inc, exp] = await Promise.all([
          fetchFinanceTransactions({ type: "income", pageSize: 10000 }),
          fetchFinanceTransactions({ type: "expense", pageSize: 10000 }),
        ]);
        setTotalIncome(inc.data.reduce((s: number, t: any) => s + Number(t.amount ?? 0), 0));
        setTotalExpenses(exp.data.reduce((s: number, t: any) => s + Number(t.amount ?? 0), 0));
      } catch {}
    })();
  }, []);

  const totalPages = Math.ceil(totalEntries / perPage);
  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">
            Financial Ledger
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time tracking of cooperative financial activities across all
            branches.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/finance/add-income" className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-full text-sm font-semibold hover:bg-green-700 transition-colors">
            <Plus className="w-4 h-4" />
            Add Income
          </Link>
          <Link to="/finance/add-expense" className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-full text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
            <Plus className="w-4 h-4" />
            Add Expense
          </Link>
          <button className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-full text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export Financial Report
          </button>
        </div>
      </div>

      {/* ─── Stat Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Income */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-navy-900 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              +12.5%
            </span>
          </div>
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
            Total Income
          </p>
          <p className="text-2xl font-bold text-navy-900">₦{totalIncome.toLocaleString()}</p>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded-full">
              -5.2%
            </span>
          </div>
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
            Total Expenses
          </p>
          <p className="text-2xl font-bold text-navy-900">₦{totalExpenses.toLocaleString()}</p>
        </div>

        {/* Net Balance */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-navy-900 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              +18.1%
            </span>
          </div>
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
            Net Balance
          </p>
          <p className="text-2xl font-bold text-navy-900">₦{(totalIncome - totalExpenses).toLocaleString()}</p>
        </div>
      </div>

      {/* ─── Filters ─── */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <SlidersHorizontal className="w-4 h-4 text-navy-900" />
          <h3 className="text-sm font-bold text-navy-900">
            Filter Transactions
          </h3>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Branch */}
          <div>
            <label className="block text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1.5">
              Branch
            </label>
            <select value={branchFilter} onChange={e => { setBranchFilter(e.target.value); setPage(1); }} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none">
              <option value="">All Branches</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          {/* Transaction Type */}
          <div>
            <label className="block text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1.5">
              Transaction Type
            </label>
            <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none">
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1.5">
              Category
            </label>
            <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none">
              <option value="">All Categories</option>
              <option value="Loan Repayment">Loan Repayment</option>
              <option value="Member Dues">Member Dues</option>
              <option value="Office Supplies">Office Supplies</option>
              <option value="Salaries">Salaries</option>
              <option value="Rent">Rent</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1.5">
              Date Range
            </label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Select date range..."
                readOnly
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Transactions Table ─── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Transaction ID
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Date
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Type
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Category
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Amount
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Branch
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Balance
                </th>
                <th className="px-4 py-4" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="py-12 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" /></td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-sm text-gray-400">No transactions found</td></tr>
              ) : transactions.map((txn, i) => {
                const isExpense = txn.type === 'expense';
                return (
                  <tr key={txn.id ?? i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4"><p className="text-sm font-medium text-navy-900">#{txn.transaction_id || txn.id?.slice(0,8)}</p></td>
                    <td className="px-4 py-4"><p className="text-sm text-gray-600">{new Date(txn.date).toLocaleDateString()}</p></td>
                    <td className="px-4 py-4">{typeBadge(txn.type)}</td>
                    <td className="px-4 py-4"><p className="text-sm text-gray-600">{txn.category}</p></td>
                    <td className="px-4 py-4"><p className={`text-sm font-semibold ${isExpense ? 'text-red-500' : 'text-green-600'}`}>{isExpense ? '-' : ''}₦{Number(txn.amount).toLocaleString()}</p></td>
                    <td className="px-4 py-4"><p className="text-sm text-gray-600">{txn.branch?.name ?? '—'}</p></td>
                    <td className="px-4 py-4"><p className="text-sm font-semibold text-navy-900">—</p></td>
                    <td className="px-4 py-4"><button className="p-1 text-gray-400 hover:text-navy-900 transition-colors"><MoreVertical className="w-4 h-4" /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-navy-900">{(page-1)*perPage+1}-{Math.min(page*perPage, totalEntries)}</span> of{" "}
            <span className="font-semibold text-navy-900">{totalEntries.toLocaleString()}</span>{" "}
            transactions
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page>=totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
