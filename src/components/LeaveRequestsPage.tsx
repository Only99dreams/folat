import { Link } from "react-router-dom";
import {
  Plus,
  CheckCircle2,
  XCircle,
  Eye,
  Filter,
} from "lucide-react";

/* ─── Leave Request Data ─── */
interface LeaveRequest {
  id: string;
  staffName: string;
  initials: string;
  initialsBg: string;
  leaveType: string;
  leaveTypeBg: string;
  startDate: string;
  endDate: string;
  status: "Pending" | "Approved" | "Rejected";
}

const leaveRequests: LeaveRequest[] = [
  {
    id: "LR-2023-0101",
    staffName: "Alice Johnson",
    initials: "AJ",
    initialsBg: "bg-blue-600",
    leaveType: "Annual",
    leaveTypeBg: "bg-blue-600 text-white",
    startDate: "Oct 1, 2023",
    endDate: "Oct 5, 2023",
    status: "Pending",
  },
  {
    id: "LR-2023-0102",
    staffName: "Bob Smith",
    initials: "BS",
    initialsBg: "bg-green-600",
    leaveType: "Sick",
    leaveTypeBg: "bg-green-100 text-green-700",
    startDate: "Oct 3, 2023",
    endDate: "Oct 3, 2023",
    status: "Approved",
  },
  {
    id: "LR-2023-0103",
    staffName: "Charlie Brown",
    initials: "CB",
    initialsBg: "bg-amber-500",
    leaveType: "Emergency",
    leaveTypeBg: "bg-red-500 text-white",
    startDate: "Oct 10, 2023",
    endDate: "Oct 12, 2023",
    status: "Rejected",
  },
];

const statusDisplay = (status: LeaveRequest["status"]) => {
  const styles: Record<string, string> = {
    Pending: "text-amber-500",
    Approved: "text-green-600",
    Rejected: "text-red-500",
  };
  return (
    <div className="flex items-center gap-1.5">
      <span className={`text-lg leading-none ${styles[status]}`}>•</span>
      <span className={`text-sm font-medium ${styles[status]}`}>{status}</span>
    </div>
  );
};

export default function LeaveRequestsPage() {
  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Leave Requests</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review and manage employee absence applications
          </p>
        </div>
        <Link to="/hr/leave-requests/new" className="flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition-colors">
          <Plus className="w-4 h-4" />
          New Request
        </Link>
      </div>

      {/* ─── Filters ─── */}
      <div className="bg-white rounded-xl border border-gray-100 px-4 sm:px-6 py-5">
        <div className="flex flex-wrap items-end gap-4">
          {/* Leave Type */}
          <div>
            <label className="block text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1.5">
              Leave Type
            </label>
            <select className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none min-w-[130px]">
              <option>All Types</option>
              <option>Annual</option>
              <option>Sick</option>
              <option>Emergency</option>
              <option>Maternity</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1.5">
              Status
            </label>
            <select className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none min-w-[120px]">
              <option>All Status</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
            </select>
          </div>

          {/* Branch */}
          <div>
            <label className="block text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1.5">
              Branch
            </label>
            <select className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none min-w-[130px]">
              <option>All Branches</option>
              <option>Lagos HQ</option>
              <option>Abuja Branch</option>
              <option>Ibadan Hub</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1.5">
              Date Range
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                placeholder="mm/dd/yyyy"
                className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-[140px]"
              />
              <span className="text-xs text-gray-400">to</span>
              <input
                type="date"
                placeholder="mm/dd/yyyy"
                className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-[140px]"
              />
            </div>
          </div>

          {/* Filter Button */}
          <button className="p-2.5 bg-navy-900 text-white rounded-xl hover:bg-navy-800 transition-colors">
            <Filter className="w-4 h-4" />
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
                  Request ID
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Staff Name
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Leave Type
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Start Date
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  End Date
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Status
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.map((req, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  {/* Request ID */}
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">{req.id}</p>
                  </td>

                  {/* Staff Name */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 ${req.initialsBg}`}
                      >
                        {req.initials}
                      </div>
                      <p className="text-sm font-semibold text-navy-900">
                        {req.staffName}
                      </p>
                    </div>
                  </td>

                  {/* Leave Type */}
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded text-[10px] font-bold tracking-wider ${req.leaveTypeBg}`}
                    >
                      {req.leaveType}
                    </span>
                  </td>

                  {/* Start Date */}
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-600">{req.startDate}</p>
                  </td>

                  {/* End Date */}
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-600">{req.endDate}</p>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">{statusDisplay(req.status)}</td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      {req.status === "Pending" && (
                        <>
                          <button className="p-1.5 text-green-600 hover:text-green-700 transition-colors">
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                          <button className="p-1.5 text-red-500 hover:text-red-600 transition-colors">
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      <button className="p-1.5 text-gray-400 hover:text-navy-900 transition-colors">
                        <Eye className="w-5 h-5" />
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
            Showing{" "}
            <span className="font-semibold text-navy-900">1 to 3</span> of{" "}
            <span className="font-semibold text-navy-900">42</span> entries
          </p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors">
              Previous
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-navy-900 text-white text-sm font-semibold">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors">
              2
            </button>
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
