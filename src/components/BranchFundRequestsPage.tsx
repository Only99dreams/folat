import { Link } from "react-router-dom";
import {
  Plus,
  ClipboardList,
  CheckCircle2,
  Wallet,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* ─── Request Data ─── */
interface FundRequest {
  id: string;
  branch: string;
  amount: string;
  purpose: string;
  status: "Pending" | "Approved" | "Rejected";
  submitted: string;
}

const requests: FundRequest[] = [
  {
    id: "REQ-001",
    branch: "Lagos Main",
    amount: "₦500,000",
    purpose: "Office Supplies & Stationery and...",
    status: "Pending",
    submitted: "Oct 24, 2023",
  },
  {
    id: "REQ-001",
    branch: "Lagos Main",
    amount: "₦500,000",
    purpose: "Office Supplies & Stationery",
    status: "Pending",
    submitted: "Oct 24, 2023",
  },
  {
    id: "REQ-001",
    branch: "Lagos Main",
    amount: "₦500,000",
    purpose: "Office Supplies & Stationery",
    status: "Pending",
    submitted: "Oct 24, 2023",
  },
  {
    id: "REQ-001",
    branch: "Lagos Main",
    amount: "₦500,000",
    purpose: "Office Supplies & Stationery",
    status: "Pending",
    submitted: "Oct 24, 2023",
  },
];

const statusBadge = (status: FundRequest["status"]) => {
  const styles: Record<string, string> = {
    Pending: "bg-amber-100 text-amber-700",
    Approved: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-600",
  };
  return (
    <span
      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
};

export default function BranchFundRequestsPage() {
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
          <p className="text-2xl font-bold text-navy-900">12 Requests</p>
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
          <p className="text-2xl font-bold text-navy-900">₦4,250,000</p>
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
              {requests.map((req, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  {/* Request ID */}
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-navy-900">
                      {req.id}
                    </p>
                  </td>

                  {/* Branch */}
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-600">{req.branch}</p>
                  </td>

                  {/* Amount */}
                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold text-navy-900">
                      {req.amount}
                    </p>
                  </td>

                  {/* Purpose */}
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-600 truncate max-w-[200px]">
                      {req.purpose}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">{statusBadge(req.status)}</td>

                  {/* Submitted */}
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-600">{req.submitted}</p>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/finance/fund-requests/${req.id}/review`}
                        className="text-xs font-bold text-navy-900 hover:text-green-600 transition-colors tracking-wide"
                      >
                        REVIEW REQUEST
                      </Link>
                      <button className="p-1 text-gray-400 hover:text-navy-900 transition-colors">
                        <Info className="w-4 h-4" />
                      </button>
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
            Showing <span className="font-semibold text-navy-900">1 to 4</span>{" "}
            of <span className="font-semibold text-navy-900">24</span> requests
          </p>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-navy-900 text-white text-sm font-semibold">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors">
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors">
              3
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
