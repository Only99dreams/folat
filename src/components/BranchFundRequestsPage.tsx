import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  ClipboardList,
  CheckCircle2,
  Wallet,
  Info,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { fetchFundRequests } from "../lib/db";

const statusBadge = (status: string) => {
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-600",
  };
  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold capitalize ${styles[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
};

export default function BranchFundRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [approvedTotal, setApprovedTotal] = useState(0);
  const perPage = 10;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const filters: any = { page, pageSize: perPage };
        if (statusFilter) filters.status = statusFilter;
        const { data, count } = await fetchFundRequests(filters);
        setRequests(data);
        setTotalEntries(count);
      } catch {}
      setLoading(false);
    })();
  }, [page, statusFilter]);

  useEffect(() => {
    (async () => {
      try {
        const { count } = await fetchFundRequests({ status: "pending" });
        setPendingCount(count);
        const { data } = await fetchFundRequests({ status: "approved", pageSize: 1000 });
        setApprovedTotal(data.reduce((s: number, r: any) => s + Number(r.amount ?? 0), 0));
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
            Branch Fund Requests
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and review fund allocation requests across all cooperative
            branches.
          </p>
        </div>
        <Link to="/finance/fund-requests/new" className="flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition-colors">
          <Plus className="w-4 h-4" />
          New Request
        </Link>
      </div>

      {/* ─── Stat Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Pending */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardList className="w-4 h-4 text-amber-500" />
            <p className="text-xs font-bold text-amber-500 tracking-wider uppercase">
              Pending
            </p>
          </div>
          <p className="text-2xl font-bold text-navy-900">{pendingCount} Requests</p>
          <p className="text-xs text-gray-400 mt-1">
            Requires immediate review
          </p>
        </div>

        {/* Approved */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <p className="text-xs font-bold text-green-600 tracking-wider uppercase">
              Approved
            </p>
          </div>
          <p className="text-2xl font-bold text-navy-900">₦{approvedTotal.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">
            Total disbursed this month
          </p>
        </div>

        {/* Available Fund */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-red-500" />
            <p className="text-xs font-bold text-red-500 tracking-wider uppercase">
              Available Fund
            </p>
          </div>
          <p className="text-2xl font-bold text-navy-900">₦18,700,000</p>
          <p className="text-xs text-gray-400 mt-1">
            Central cooperative reserves
          </p>
        </div>
      </div>

      {/* ─── Requests Table ─── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Request ID
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Branch
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Amount
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Purpose
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Status
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Submitted
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" /></td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-sm text-gray-400">No fund requests found</td></tr>
              ) : requests.map((req, i) => (
                <tr key={req.id ?? i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4"><p className="text-sm font-medium text-navy-900">#{req.id?.slice(0,8)}</p></td>
                  <td className="px-4 py-4"><p className="text-sm text-gray-600">{req.branch?.name ?? '—'}</p></td>
                  <td className="px-4 py-4"><p className="text-sm font-semibold text-navy-900">₦{Number(req.amount).toLocaleString()}</p></td>
                  <td className="px-4 py-4"><p className="text-sm text-gray-600 truncate max-w-[200px]">{req.purpose}</p></td>
                  <td className="px-4 py-4">{statusBadge(req.status)}</td>
                  <td className="px-4 py-4"><p className="text-sm text-gray-600">{new Date(req.created_at).toLocaleDateString()}</p></td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/finance/fund-requests/${req.id}/review`} className="text-xs font-bold text-navy-900 hover:text-green-600 transition-colors tracking-wide">REVIEW REQUEST</Link>
                      <button className="p-1 text-gray-400 hover:text-navy-900 transition-colors"><Info className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-navy-900">{(page-1)*perPage+1} to {Math.min(page*perPage, totalEntries)}</span>{" "}
            of <span className="font-semibold text-navy-900">{totalEntries}</span> requests
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-navy-900 text-white text-sm font-semibold">{page}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page>=totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
