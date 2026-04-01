import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  UserX,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { fetchStaff, fetchBranches } from "../lib/db";

const statusDot = (status: string) => {
  const colors: Record<string, string> = {
    active: "text-green-500",
    suspended: "text-amber-500",
    resigned: "text-red-500",
  };
  return (
    <div className="flex items-center gap-1.5">
      <span className={`text-lg leading-none ${colors[status] ?? "text-gray-400"}`}>•</span>
      <span className="text-sm text-gray-700 capitalize">{status}</span>
    </div>
  );
};

export default function StaffListPage() {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [branchFilter, setBranchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBranches().then(setBranches).catch(() => {}); }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const filters: any = {};
        if (branchFilter) filters.branch_id = branchFilter;
        if (statusFilter) filters.status = statusFilter;
        if (search) filters.search = search;
        const data = await fetchStaff(filters);
        setStaffList(data);
      } catch {}
      setLoading(false);
    })();
  }, [branchFilter, statusFilter, search]);
  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">
            Staff Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View and manage staff across all branches
          </p>
        </div>
        <Link to="/hr/staff/add" className="flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition-colors">
          <Plus className="w-4 h-4" />
          Add New Staff
        </Link>
      </div>

      {/* ─── Table Card ─── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* Search & Filters */}
        <div className="px-4 sm:px-6 py-5 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Name, ID, Email, or Phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <select value={branchFilter} onChange={e => setBranchFilter(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none min-w-[140px]">
            <option value="">All Branches</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none min-w-[120px]">
            <option>All Roles</option>
            <option>Admin</option>
            <option>Loan Officer</option>
            <option>Accountant</option>
            <option>HR Manager</option>
            <option>Branch Manager</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none min-w-[140px]">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="resigned">Resigned</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-t border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Name
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Role
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Branch
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Phone
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Status
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Date Joined
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" /></td></tr>
              ) : staffList.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-sm text-gray-400">No staff found</td></tr>
              ) : staffList.map((staff) => (
                <tr key={staff.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4"><p className="text-sm font-medium text-navy-900">{staff.first_name} {staff.last_name}</p></td>
                  <td className="px-4 py-4"><span className="inline-flex px-2.5 py-1 rounded text-[10px] font-bold tracking-wider bg-blue-600 text-white capitalize">{staff.role ?? staff.position ?? '\u2014'}</span></td>
                  <td className="px-4 py-4"><p className="text-sm text-gray-600">{staff.branch?.name ?? '\u2014'}</p></td>
                  <td className="px-4 py-4"><p className="text-sm text-gray-600">{staff.phone ?? '\u2014'}</p></td>
                  <td className="px-4 py-4">{statusDot(staff.status ?? 'active')}</td>
                  <td className="px-4 py-4"><p className="text-sm text-gray-600">{staff.date_joined ? new Date(staff.date_joined).toLocaleDateString() : '\u2014'}</p></td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/hr/staff/${staff.id}`} className="p-1.5 text-gray-400 hover:text-navy-900 transition-colors"><Eye className="w-4 h-4" /></Link>
                      <button className="p-1.5 text-gray-400 hover:text-navy-900 transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><UserX className="w-4 h-4" /></button>
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
            Showing <span className="font-semibold text-navy-900">{staffList.length}</span> staff
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
            <span className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">
              …
            </span>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors">
              5
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
