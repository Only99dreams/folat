import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Eye,
  CheckCircle2,
  XCircle,
  Loader2,
  CreditCard,
} from "lucide-react";
import { fetchLoanApplications, fetchBranches, updateLoanApplication, disburseLoan } from "../lib/db";
import { useAuth } from "../auth/useAuth";
import { supabase } from "../lib/supabase";
import { confirmToast, toastSuccess, toastError } from "../lib/toast";
import ExportMenu from "./ExportMenu";

type BranchRow = {
  id: string;
  name: string;
};

type LoanRow = {
  id: string;
  loan_id: string;
  amount_requested: number;
  purpose?: string;
  loan_type: string;
  status: string;
  created_at: string;
  guarantor1_name?: string;
  guarantor1_approval_status?: string;
  guarantor2_name?: string;
  guarantor2_approval_status?: string;
  member?: {
    first_name?: string;
    last_name?: string;
    member_id?: string;
  };
  branch?: {
    name?: string;
  };
};

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

const guarantorBadge = (loan: LoanRow) => {
  const hasG1 = Boolean(loan.guarantor1_name?.trim());
  const hasG2 = Boolean(loan.guarantor2_name?.trim());

  if (!hasG1 && !hasG2) {
    return (
      <span className="inline-flex px-2.5 py-1 rounded text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200">
        Not Set
      </span>
    );
  }

  const g1Status = hasG1 ? loan.guarantor1_approval_status : null;
  const g2Status = hasG2 ? loan.guarantor2_approval_status : null;

  if (g1Status === "rejected" || g2Status === "rejected") {
    return (
      <span className="inline-flex px-2.5 py-1 rounded text-xs font-medium bg-red-50 text-red-600 border border-red-200">
        Rejected
      </span>
    );
  }

  const g1Done = !hasG1 || g1Status === "approved";
  const g2Done = !hasG2 || g2Status === "approved";
  if (g1Done && g2Done) {
    return (
      <span className="inline-flex px-2.5 py-1 rounded text-xs font-medium bg-green-50 text-green-600 border border-green-200">
        Approved
      </span>
    );
  }

  if (g1Status === "pending" || g2Status === "pending") {
    return (
      <span className="inline-flex px-2.5 py-1 rounded text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200">
        Pending
      </span>
    );
  }

  return (
    <span className="inline-flex px-2.5 py-1 rounded text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
      Mixed
    </span>
  );
};

export default function LoanApplicationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isStaff = user?.role === "staff_member";
  const canApprove = user?.role === "super_admin" || user?.role === "finance_officer";
  const canDisburse = user?.role === "super_admin" || user?.role === "finance_officer";
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [amountFilter, setAmountFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loans, setLoans] = useState<LoanRow[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [branches, setBranches] = useState<BranchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [disbursingId, setDisbursingId] = useState<string | null>(null);
  const [disbursementDate, setDisbursementDate] = useState("");
  const isRestricted = user?.role === "branch_manager" || user?.role === "secretary" || user?.role === "officer";

  const perPage = 10;
  const totalPages = Math.ceil(totalResults / perPage) || 1;

  useEffect(() => {
    fetchBranches().then((data) => setBranches((data ?? []) as BranchRow[])).catch(console.error);
  }, []);

  useEffect(() => {
    if (!isRestricted || !user?.branch) return;
    (async () => {
      const { data } = await supabase
        .from("branches")
        .select("id")
        .ilike("name", user.branch)
        .maybeSingle();
      if (data?.id) setBranchFilter(data.id);
    })();
  }, [isRestricted, user?.branch]);

  const loadLoans = useCallback(async () => {
    setLoading(true);
    try {
      const filters: {
        page: number;
        per_page: number;
        status?: string;
        branch_id?: string;
        search?: string;
        user?: { id: string; role: string; branch: string };
      } = { page: currentPage, per_page: perPage };
      if (statusFilter) filters.status = statusFilter;
      if (branchFilter) filters.branch_id = branchFilter;
      if (search.trim()) filters.search = search.trim();
      if (user) filters.user = { id: user.id, role: user.role, branch: user.branch };
      const { data, count } = await fetchLoanApplications(filters);
      setLoans((data ?? []) as LoanRow[]);
      setTotalResults(count ?? 0);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [branchFilter, currentPage, perPage, search, statusFilter, user]);

  useEffect(() => {
    const t = setTimeout(() => {
      void loadLoans();
    }, 0);
    return () => clearTimeout(t);
  }, [loadLoans]);

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

  const handleApprove = async (loanIds: string[]) => {
    const confirmed = await confirmToast(`Approve ${loanIds.length > 1 ? loanIds.length + " loans" : "this loan"}?`);
    if (!confirmed) return;
    try {
      await Promise.all(loanIds.map((id) => updateLoanApplication(id, { status: "approved" })));
      toastSuccess(`${loanIds.length > 1 ? loanIds.length + " loans" : "Loan"} approved.`);
      setSelectedRows(new Set());
      setSelectAll(false);
      void loadLoans();
    } catch (err) {
      toastError((err as Error)?.message || "Failed to approve.");
    }
  };

  const handleReject = async (loanIds: string[]) => {
    const confirmed = await confirmToast(`Reject ${loanIds.length > 1 ? loanIds.length + " loans" : "this loan"}?`);
    if (!confirmed) return;
    try {
      await Promise.all(loanIds.map((id) => updateLoanApplication(id, { status: "rejected" })));
      toastSuccess(`${loanIds.length > 1 ? loanIds.length + " loans" : "Loan"} rejected.`);
      setSelectedRows(new Set());
      setSelectAll(false);
      void loadLoans();
    } catch (err) {
      toastError((err as Error)?.message || "Failed to reject.");
    }
  };

  const handleDisburse = async (loanId: string) => {
    if (!disbursementDate) {
      toastError("Please select a disbursement date.");
      return;
    }
    if (!user?.id) {
      toastError("User not authenticated.");
      return;
    }
    try {
      await disburseLoan(loanId, disbursementDate, user.id);
      toastSuccess("Loan disbursed successfully.");
      setDisbursingId(null);
      setDisbursementDate("");
      void loadLoans();
    } catch (err) {
      toastError((err as Error)?.message || "Failed to disburse loan.");
    }
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
          <ExportMenu data={() => loans.map((l) => ({ LoanID: l.loan_id, Member: (l.member?.first_name || '') + ' ' + (l.member?.last_name || ''), Amount: l.amount_requested, Purpose: l.purpose || '', Status: l.status, Applied: l.created_at }))} filename="loan_applications" label="Export" />
          <Link to={isStaff ? "/loans/cooperative-request" : "/loans/new"} className="flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition-colors">
            <Plus className="w-4 h-4" />
            {isStaff ? "Cooperative Loan" : "New Application"}
          </Link>
        </div>
      </div>

      {/* ─── Search & Filters ─── */}
      {!isStaff && <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
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
          {!isRestricted && (
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
          )}

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
      </div>}

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
            {canApprove && selectedRows.size > 0 && (
              <>
                <button
                  onClick={() => handleApprove(Array.from(selectedRows).map((i) => loans[i].id))}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                  <CheckCircle2 className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => handleReject(Array.from(selectedRows).map((i) => loans[i].id))}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </>
            )}
          </div>
        </div>

        {/* Disbursement Form */}
        {disbursingId && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold text-navy-900">Disburse Loan</p>
            <input
              type="date"
              value={disbursementDate}
              onChange={(e) => setDisbursementDate(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20"
            />
            <button
              onClick={() => handleDisburse(disbursingId)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
              Confirm Disbursement
            </button>
            <button
              onClick={() => { setDisbursingId(null); setDisbursementDate(""); }}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        )}

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
                  Guarantor
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
                <tr><td colSpan={10} className="px-6 py-12 text-center"><Loader2 className="w-6 h-6 animate-spin text-navy-900 mx-auto" /></td></tr>
              ) : loans.length === 0 ? (
                <tr><td colSpan={10} className="px-6 py-12 text-center text-sm text-gray-400">No loan applications found.</td></tr>
              ) : loans.map((loan, i) => (
                <tr
                  key={loan.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/loans/${loan.id}`)}
                >
                  <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedRows.has(i)}
                      onChange={() => toggleRow(i)}
                      className="w-4 h-4 rounded border-gray-300 text-navy-900 focus:ring-navy-900"
                    />
                  </td>
                  <td className="px-4 py-5">
                    <Link to={`/loans/${loan.id}`} onClick={(e) => e.stopPropagation()} className="text-sm font-semibold text-navy-900 hover:text-blue-600 hover:underline transition-colors">
                      {loan.loan_id}
                    </Link>
                  </td>
                  <td className="px-4 py-5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${avatarColors[i % avatarColors.length]}`}>
                        {loan.member?.first_name?.[0]}{loan.member?.last_name?.[0]}
                      </div>
                      <div>
                        <Link to={`/loans/${loan.id}`} className="text-sm font-semibold text-navy-900 hover:text-blue-600 hover:underline transition-colors">{loan.member?.first_name} {loan.member?.last_name}</Link>
                        <p className="text-xs text-gray-400">{loan.member?.member_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-5">
                    <p className="text-sm text-gray-600">{loan.branch?.name || "—"}</p>
                  </td>
                  <td className="px-4 py-5">
                    <p className="text-sm font-semibold text-navy-900">₦{Number(loan.amount_requested).toLocaleString()}</p>
                  </td>
                  <td className="px-4 py-5 text-center">
                    {loanTypeBadge(loan.loan_type)}
                  </td>
                  <td className="px-4 py-5 text-center">
                    {guarantorBadge(loan)}
                  </td>
                  <td className="px-4 py-5 text-center">
                    {statusBadge(loan.status)}
                  </td>
                  <td className="px-4 py-5">
                    <p className="text-sm text-gray-600">{new Date(loan.created_at).toLocaleDateString()}</p>
                  </td>
                  <td className="px-4 py-5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                      <Link title="View" to={`/loans/${loan.id}`}
                        className="p-2 text-gray-400 hover:text-navy-900 hover:bg-gray-100 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </Link>
                       {canApprove && (loan.status === "pending" || loan.status === "under_review") && (
                         <>
                           <button
                             title="Approve"
                             onClick={() => handleApprove([loan.id])}
                             className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                             <CheckCircle2 className="w-4 h-4" />
                           </button>
                           <button
                             title="Reject"
                             onClick={() => handleReject([loan.id])}
                             className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                             <XCircle className="w-4 h-4" />
                           </button>
                         </>
                       )}
                       {canDisburse && loan.status === "approved" && (
                         <button
                           title="Disburse"
                           onClick={() => { setDisbursingId(loan.id); setDisbursementDate(new Date().toISOString().split("T")[0]); }}
                           className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                           <CreditCard className="w-4 h-4" />
                         </button>
                       )}
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
