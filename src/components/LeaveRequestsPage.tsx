import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  CheckCircle2,
  XCircle,
  Eye,
  Filter,
  Loader2,
} from "lucide-react";
import { fetchLeaveRequests, reviewLeaveRequest } from "../lib/db";

const avatarColors = ["bg-blue-600","bg-green-600","bg-purple-600","bg-amber-500","bg-pink-600","bg-teal-600"];

const statusDisplay = (status: string) => {
  const styles: Record<string, string> = {
    pending: "text-amber-500",
    approved: "text-green-600",
    rejected: "text-red-500",
  };
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <div className="flex items-center gap-1.5">
      <span className={`text-lg leading-none ${styles[status] || "text-gray-500"}`}>•</span>
      <span className={`text-sm font-medium ${styles[status] || "text-gray-500"}`}>{label}</span>
    </div>
  );
};

const leaveTypeBadge = (type: string) => {
  const styles: Record<string, string> = {
    annual: "bg-blue-600 text-white",
    sick: "bg-green-100 text-green-700",
    casual: "bg-purple-100 text-purple-700",
    emergency: "bg-red-500 text-white",
    maternity: "bg-pink-100 text-pink-700",
  };
  return styles[type] || "bg-gray-100 text-gray-700";
};

export default function LeaveRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (statusFilter) filters.status = statusFilter;
      const data = await fetchLeaveRequests(filters);
      setRequests(typeFilter ? data.filter((r: any) => r.leave_type === typeFilter) : data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [statusFilter, typeFilter]);

  const handleAction = async (id: string, status: "approved" | "rejected") => {
    try {
      await reviewLeaveRequest(id, status, "");
      loadData();
    } catch {}
  };
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
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none min-w-[130px]">
              <option value="">All Types</option>
              <option value="annual">Annual</option>
              <option value="sick">Sick</option>
              <option value="casual">Casual</option>
              <option value="emergency">Emergency</option>
              <option value="maternity">Maternity</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1.5">
              Status
            </label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none min-w-[120px]">
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
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
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin text-navy-900 mx-auto" /></td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">No leave requests found</td></tr>
              ) : requests.map((req: any, i: number) => {
                const staffName = req.staff ? `${req.staff.first_name ?? ""} ${req.staff.last_name ?? ""}`.trim() : "Unknown";
                const initials = staffName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
                const bgColor = avatarColors[i % avatarColors.length];
                return (
                <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4"><p className="text-sm text-gray-600">{req.id.slice(0,8)}</p></td>
                  <td className="px-4 py-4"><div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 ${bgColor}`}>{initials}</div><p className="text-sm font-semibold text-navy-900">{staffName}</p></div></td>
                  <td className="px-4 py-4"><span className={`inline-flex px-2.5 py-1 rounded text-[10px] font-bold tracking-wider ${leaveTypeBadge(req.leave_type)}`}>{(req.leave_type || "").charAt(0).toUpperCase() + (req.leave_type || "").slice(1)}</span></td>
                  <td className="px-4 py-4"><p className="text-sm text-gray-600">{req.start_date ? new Date(req.start_date).toLocaleDateString("en-NG",{year:"numeric",month:"short",day:"numeric"}) : "—"}</p></td>
                  <td className="px-4 py-4"><p className="text-sm text-gray-600">{req.end_date ? new Date(req.end_date).toLocaleDateString("en-NG",{year:"numeric",month:"short",day:"numeric"}) : "—"}</p></td>
                  <td className="px-4 py-4">{statusDisplay(req.status)}</td>
                  <td className="px-4 py-4"><div className="flex items-center justify-end gap-1.5">{req.status === "pending" && (<><button onClick={() => handleAction(req.id, "approved")} className="p-1.5 text-green-600 hover:text-green-700 transition-colors"><CheckCircle2 className="w-5 h-5" /></button><button onClick={() => handleAction(req.id, "rejected")} className="p-1.5 text-red-500 hover:text-red-600 transition-colors"><XCircle className="w-5 h-5" /></button></>)}<button className="p-1.5 text-gray-400 hover:text-navy-900 transition-colors"><Eye className="w-5 h-5" /></button></div></td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-semibold text-navy-900">1 to {requests.length}</span> of{" "}
            <span className="font-semibold text-navy-900">{requests.length}</span> entries
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
