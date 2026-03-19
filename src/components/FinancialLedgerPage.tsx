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
} from "lucide-react";

/* ─── Transaction Data ─── */
interface Transaction {
  id: string;
  date: string;
  type: "Income" | "Expense";
  category: string;
  amount: string;
  amountNegative?: boolean;
  branch: string;
  balance: string;
}

const transactions: Transaction[] = [
  {
    id: "#TRX-9821",
    date: "Oct 24, 2023",
    type: "Income",
    category: "Loan Repayment",
    amount: "₦250,000",
    branch: "Lagos HQ",
    balance: "₦9,000,000",
  },
  {
    id: "#TRX-9821",
    date: "Oct 24, 2023",
    type: "Income",
    category: "Loan Repayment",
    amount: "₦250,000",
    branch: "Lagos HQ",
    balance: "₦9,000,000",
  },
  {
    id: "#TRX-9821",
    date: "Oct 24, 2023",
    type: "Income",
    category: "Loan Repayment",
    amount: "₦250,000",
    branch: "Lagos HQ",
    balance: "₦9,000,000",
  },
  {
    id: "#TRX-9818",
    date: "Oct 22, 2023",
    type: "Expense",
    category: "Utility Bills",
    amount: "-₦45,000",
    amountNegative: true,
    branch: "Lagos HQ",
    balance: "₦7,950,000",
  },
  {
    id: "#TRX-9821",
    date: "Oct 24, 2023",
    type: "Income",
    category: "Loan Repayment",
    amount: "₦250,000",
    branch: "Lagos HQ",
    balance: "₦9,000,000",
  },
];

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
          <p className="text-2xl font-bold text-navy-900">₦15,000,000</p>
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
          <p className="text-2xl font-bold text-navy-900">₦6,000,000</p>
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
          <p className="text-2xl font-bold text-navy-900">₦9,000,000</p>
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
            <select className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none">
              <option>All Branches</option>
              <option>Lagos HQ</option>
              <option>Abuja Branch</option>
              <option>Port Harcourt</option>
            </select>
          </div>

          {/* Transaction Type */}
          <div>
            <label className="block text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1.5">
              Transaction Type
            </label>
            <select className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none">
              <option>All Types</option>
              <option>Income</option>
              <option>Expense</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1.5">
              Category
            </label>
            <select className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none">
              <option>All Categories</option>
              <option>Loan Repayment</option>
              <option>Member Dues</option>
              <option>Utility Bills</option>
              <option>Office Supplies</option>
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
                placeholder="Oct 01 - Oct 31, 2023"
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
              {transactions.map((txn, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  {/* Transaction ID */}
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-navy-900">
                      {txn.id}
                    </p>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-600">{txn.date}</p>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-4">{typeBadge(txn.type)}</td>

                  {/* Category */}
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-600">{txn.category}</p>
                  </td>

                  {/* Amount */}
                  <td className="px-4 py-4">
                    <p
                      className={`text-sm font-semibold ${
                        txn.amountNegative ? "text-red-500" : "text-green-600"
                      }`}
                    >
                      {txn.amount}
                    </p>
                  </td>

                  {/* Branch */}
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-600">{txn.branch}</p>
                  </td>

                  {/* Balance */}
                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold text-navy-900">
                      {txn.balance}
                    </p>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <button className="p-1 text-gray-400 hover:text-navy-900 transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-navy-900">1-5</span> of{" "}
            <span className="font-semibold text-navy-900">2,482</span>{" "}
            transactions
          </p>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
