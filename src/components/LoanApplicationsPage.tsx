import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  Eye,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { fetchLoanApplications, fetchBranches } from "../lib/db";

const avatarColors = [
  "bg-amber-100 text-amber-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-purple-100 text-purple-700",
];

const loanTypeBadge = (type: string) => {
  const styles: Record<string, string> = {
    personal: "bg-blue-50 text-blue-600 border border-blue-200",
    mortgage: "bg-orange-50 text-orange-600 border border-orange-200",
    business: "bg-teal-50 text-teal-600 border border-teal-200",
    emergency: "bg-red-50 text-red-600 border border-red-200",
  };
  return (
    <span className={`inline-flex px-2.5 py-1 rounded text-xs font-medium ${styles[type] || "bg-gray-50 text-gray-600 border border-gray-200"}`}>
      {type ? type.charAt(0).toUpperCase() + type.slice(1) : "—"}
    </span>
  );
};

const statusBadge = (status: string) => {
  const styles: Record<string, string> = {
    pending: "bg-amber-50 text-amber-600 border border-amber-200",
    approved: "bg-green-50 text-green-600 border border-green-200",
    rejected: "bg-red-50 text-red-600 border border-red-200",
    disbursed: "bg-blue-50 text-blue-600 border border-blue-200",
    completed: "bg-gray-50 text-gray-600 border border-gray-200",
  };
  return (
    <span className={`inline-flex px-2.5 py-1 rounded text-xs font-medium ${styles[status] || "bg-gray-50 text-gray-600 border border-gray-200"}`}>
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : "—"}
    </span>
  );
};

export default function LoanApplicationsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [amountFilter, setAmountFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loans, setLoans] = useState<any[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const perPage = 10;
  const totalPages = Math.ceil(totalResults / perPage) || 1;

  useEffect(() => {
    fetchBranches().then(setBranches).catch(console.error);
  }, []);

  useEffect(() => {
    loadLoans();
  }, [currentPage, statusFilter, branchFilter, search]);

  async function loadLoans() {
    setLoading(true);
    try {
      const filters: any = { page: currentPage, per_page: perPage };
      if (statusFilter) filters.status = statusFilter;
      if (branchFilter) filters.branch_id = branchFilter;
      if (search.trim()) filters.search = search.trim();
      const { data, count } = await fetchLoanApplications(filters);
      setLoans(data);
      setTotalResults(count ?? 0);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(loans.map((_, i) => i)));
    }
    setSelectAll(!selectAll);
  };

  const toggleRow = (idx: number) => {
    const next = new Set(selectedRows);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setSelectedRows(next);
    setSelectAll(next.size === loans.length);
  };

  const clearFilters = () => {
    setStatusFilter("");
    setBranchFilter("");
    setAmountFilter("");
    setDateFilter("");
    setSearch("");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">
            Loan Applications
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View and manage loan applications submitted by cooperative members.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <Link to="/loans/new" className="flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition-colors">
            <Plus className="w-4 h-4" />
            New Application
          </Link>
        </div>
      </div>

      {/* ─── Search & Filters ─── */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search member name or loan ID (e.g. LN-2024-001)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
          />
        </div>

        {/* Filter Row */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Status */}
          <div className="relative">
            <span className="text-xs text-gray-500 font-medium mr-1">
              STATUS:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-1 pr-6 py-2 border border-gray-200 rounded-lg text-sm font-medium text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-900/20 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="disbursed">Disbursed</option>
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Branch */}
          <div className="relative">
            <span className="text-xs text-gray-500 font-medium mr-1">
              BRANCH:
            </span>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="appearance-none pl-1 pr-6 py-2 border border-gray-200 rounded-lg text-sm font-medium text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-900/20 bg-white"
            >
              <option value="">All Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Amount */}
          <div className="relative">
            <span className="text-xs text-gray-500 font-medium mr-1">
              AMOUNT:
            </span>
            <select
              value={amountFilter}
              onChange={(e) => setAmountFilter(e.target.value)}
              className="appearance-none pl-1 pr-6 py-2 border border-gray-200 rounded-lg text-sm font-medium text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-900/20 bg-white"
            >
              <option>Any Range</option>
              <option>Under ₦5,000</option>
              <option>₦5,000 - ₦20,000</option>
              <option>₦20,000 - ₦50,000</option>
              <option>Over ₦50,000</option>
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Date */}
          <div className="relative">
            <span className="text-xs text-gray-500 font-medium mr-1">
              DATE:
            </span>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="appearance-none pl-1 pr-6 py-2 border border-gray-200 rounded-lg text-sm font-medium text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-900/20 bg-white"
            >
              <option>All Time</option>
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
              <option>Last 3 Months</option>
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>

          <div className="flex-1" />

          <button
            onClick={clearFilters}
            className="text-sm font-medium text-navy-900 hover:text-navy-700 transition-colors underline underline-offset-2"
          >
            Clear All Filters
          </button>
        </div>
      </div>

      {/* ─── Table ─── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* Bulk Actions Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-gray-300 text-navy-900 focus:ring-navy-900"
            />
            <span className="text-sm text-gray-500">
              <span className="font-semibold text-navy-900">
                {selectedRows.size}
              </span>{" "}
              applications selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-green-600 hover:bg-green-50 rounded-lg transition-colors">
              <CheckCircle2 className="w-4 h-4" />
              Approve
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              <XCircle className="w-4 h-4" />
              Reject
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="w-12 px-6 py-4" />
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Loan ID
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Member
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Branch
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Amount Requested
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">
                  Loan Type
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">
                  Status
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Date Applied
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-6 py-12 text-center"><Loader2 className="w-6 h-6 animate-spin text-navy-900 mx-auto" /></td></tr>
              ) : loans.length === 0 ? (
                <tr><td colSpan={9} className="px-6 py-12 text-center text-sm text-gray-400">No loan applications found.</td></tr>
              ) : loans.map((loan, i) => (
                <tr
                  key={loan.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-5">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(i)}
                      onChange={() => toggleRow(i)}
                      className="w-4 h-4 rounded border-gray-300 text-navy-900 focus:ring-navy-900"
                    />
                  </td>
                  <td className="px-4 py-5">
                    <p className="text-sm font-semibold text-navy-900">{loan.loan_id}</p>
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${avatarColors[i % avatarColors.length]}`}>
                        {loan.member?.first_name?.[0]}{loan.member?.last_name?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-navy-900">{loan.member?.first_name} {loan.member?.last_name}</p>
                        <p className="text-xs text-gray-400">{loan.member?.member_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-5">
                    <p className="text-sm text-gray-600">{loan.branch?.name || "—"}</p>
                  </td>
                  <td className="px-4 py-5">
                    <p className="text-sm font-semibold text-navy-900">₦{Number(loan.amount).toLocaleString()}</p>
                  </td>
                  <td className="px-4 py-5 text-center">
                    {loanTypeBadge(loan.loan_type)}
                  </td>
                  <td className="px-4 py-5 text-center">
                    {statusBadge(loan.status)}
                  </td>
                  <td className="px-4 py-5">
                    <p className="text-sm text-gray-600">{new Date(loan.created_at).toLocaleDateString()}</p>
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex items-center justify-center gap-1">
                      <Link title="View" to={`/loans/${loan.id}`}
                        className="p-2 text-gray-400 hover:text-navy-900 hover:bg-gray-100 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
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
            -{" "}
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
