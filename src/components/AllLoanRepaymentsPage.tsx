import { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  File,
  Calendar,
  SlidersHorizontal,
  MoreVertical,
  Loader2,
} from "lucide-react";
import { fetchLoanRepayments, fetchBranches } from "../lib/db";

const avatarColors = [
  "bg-blue-600 text-white",
  "bg-purple-600 text-white",
  "bg-teal-600 text-white",
  "bg-amber-600 text-white",
  "bg-rose-600 text-white",
  "bg-green-600 text-white",
];

export default function AllLoanRepaymentsPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [repayments, setRepayments] = useState<any[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [branches, setBranches] = useState<any[]>([]);
  const [branch, setBranch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(true);
  const perPage = 10;
  const totalPages = Math.max(1, Math.ceil(totalResults / perPage));

  useEffect(() => {
    fetchBranches().then(data => setBranches(data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchLoanRepayments({ page: currentPage, pageSize: perPage })
      .then(({ data, count }) => {
        setRepayments(data);
        setTotalResults(count);
      }).catch(() => {}).finally(() => setLoading(false));
  }, [currentPage]);

  return (
    <div className="space-y-6">
      {/* ─── Global Search ─── */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="relative max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Global search for members or loan IDs..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
          />
        </div>
      </div>

      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">
            All Loan Repayments
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor all loan repayments across the cooperative system.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-400 font-semibold tracking-wide uppercase">
            Export Data:
          </span>
          <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
            <FileSpreadsheet className="w-4 h-4" />
            EXCEL
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
            <FileText className="w-4 h-4" />
            PDF
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
            <File className="w-4 h-4" />
            CSV
          </button>
        </div>
      </div>

      {/* ─── Stat Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Repayments MTD */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-bold mb-1">
            Total Repayments (MTD)
          </p>
          <p className="text-2xl font-bold text-navy-900 mb-1">₦{repayments.reduce((s, r) => s + Number(r.amount ?? 0), 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
          <p className="text-xs font-medium flex items-center gap-1">
            <span className="text-gray-400">this page</span>
          </p>
        </div>

        {/* Total Repayments YTD */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-bold mb-1">
            Total Repayments (YTD)
          </p>
          <p className="text-2xl font-bold text-navy-900 mb-1">—</p>
          <p className="text-xs font-medium flex items-center gap-1">
            <span className="text-gray-400">year to date</span>
          </p>
        </div>

        {/* Avg Repayment Amount */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-bold mb-1">
            Avg. Repayment Amount
          </p>
          <p className="text-2xl font-bold text-navy-900 mb-1">{repayments.length > 0 ? `₦${(repayments.reduce((s, r) => s + Number(r.amount ?? 0), 0) / repayments.length).toLocaleString(undefined, {minimumFractionDigits: 2})}` : "—"}</p>
          <p className="text-xs font-medium flex items-center gap-1">
            <span className="text-gray-400">per transaction</span>
          </p>
        </div>

        {/* Active Repaying Members */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-bold mb-1">
            Active Repaying Members
          </p>
          <p className="text-2xl font-bold text-navy-900 mb-1">{totalResults.toLocaleString()}</p>
          <p className="text-xs font-medium flex items-center gap-1">
            <span className="text-gray-400">total repayments</span>
          </p>
        </div>
      </div>

      {/* ─── Filters ─── */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Member / Loan ID */}
          <div>
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1.5">
              Search Member / Loan ID
            </p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="e.g. LN-2024-001 or John Doe"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
              />
            </div>
          </div>

          {/* Branch */}
          <div>
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1.5">
              Branch
            </p>
            <div className="relative">
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 pr-9 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20 bg-white"
              >
                <option value="">All Branches</option>
                {branches.map((b: any) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1.5">
              Payment Method
            </p>
            <div className="relative">
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 pr-9 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20 bg-white"
              >
                <option>All Methods</option>
                <option>Bank Transfer</option>
                <option>Direct Debit</option>
                <option>Mobile Money</option>
                <option>Cash</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Date Range */}
          <div>
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1.5">
              Date Range
            </p>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Select date range..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20"
              />
            </div>
          </div>
        </div>

        <button className="flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white rounded-lg text-sm font-semibold hover:bg-navy-800 transition-colors">
          <SlidersHorizontal className="w-4 h-4" />
          Apply Filters
        </button>
      </div>

      {/* ─── Table ─── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-4 text-[10px] tracking-[0.1em] uppercase text-red-500 font-bold">
                  Payment ID
                </th>
                <th className="px-3 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Date
                </th>
                <th className="px-3 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Member Name & ID
                </th>
                <th className="px-3 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Loan ID
                </th>
                <th className="px-3 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">
                  Inst. #
                </th>
                <th className="px-3 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">
                  Amount Paid
                </th>
                <th className="px-3 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">
                  Balance
                </th>
                <th className="px-3 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">
                  Method
                </th>
                <th className="px-3 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Branch
                </th>
                <th className="w-10 px-2 py-4" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin text-navy-900 mx-auto" /></td></tr>
              ) : repayments.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-12 text-gray-400">No repayments found.</td></tr>
              ) : repayments.map((r, i) => {
                const memberName = r.member ? `${r.member.first_name} ${r.member.last_name}` : "N/A";
                const initials = memberName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
                const methodStyles: Record<string, { bg: string; color: string }> = {
                  "Bank Transfer": { bg: "bg-blue-50 border border-blue-200", color: "text-navy-700" },
                  "Cash": { bg: "bg-green-50 border border-green-200", color: "text-green-700" },
                  "Mobile Money": { bg: "bg-green-50 border border-green-200", color: "text-green-700" },
                  "Direct Debit": { bg: "bg-red-50 border border-red-200", color: "text-red-600" },
                };
                const mStyle = methodStyles[r.payment_method] ?? methodStyles["Cash"];
                return (
                <tr
                  key={r.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-5 py-5">
                    <p className="text-sm font-bold text-green-600">{r.repayment_id}</p>
                  </td>
                  <td className="px-3 py-5">
                    <p className="text-sm text-gray-600">{new Date(r.created_at).toLocaleDateString()}</p>
                  </td>
                  <td className="px-3 py-5">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${avatarColors[i % avatarColors.length]}`}>
                        {initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-navy-900">{memberName}</p>
                        <p className="text-[10px] text-gray-400">{r.member?.member_id ?? ""}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-5">
                    <p className="text-sm text-navy-900 font-medium">{r.loan?.loan_id ?? ""}</p>
                  </td>
                  <td className="px-3 py-5 text-center">
                    <p className="text-sm text-navy-900">{r.installment_number ?? "—"}</p>
                  </td>
                  <td className="px-3 py-5 text-center">
                    <p className="text-sm font-semibold text-navy-900">₦{Number(r.amount).toLocaleString()}</p>
                  </td>
                  <td className="px-3 py-5 text-center">
                    <p className="text-sm text-navy-900">₦{Number(r.outstanding_after ?? 0).toLocaleString()}</p>
                  </td>
                  <td className="px-3 py-5 text-center">
                    <span className={`inline-flex px-2 py-1 rounded text-[9px] font-bold tracking-wider ${mStyle.bg} ${mStyle.color}`}>
                      {(r.payment_method ?? "").toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-5">
                    <p className="text-sm text-gray-600">—</p>
                  </td>
                  <td className="px-2 py-5">
                    <button className="p-1.5 text-gray-400 hover:text-navy-900 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-400">
            Showing{" "}
            <span className="font-semibold text-navy-900">
              {(currentPage - 1) * perPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-navy-900">
              {Math.min(currentPage * perPage, totalResults)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-navy-900">{totalResults}</span>{" "}
            results
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
