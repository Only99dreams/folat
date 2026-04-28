import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  KeyRound,
  UserX,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
} from "lucide-react";
import { fetchStaff, fetchBranches, updateStaff, sendStaffPasswordReset, provisionStaffAuthUser } from "../lib/db";
import { useAuth } from "../auth/useAuth";
import { confirmToast, toastError, toastSuccess } from "../lib/toast";

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
  const navigate = useNavigate();
  const { user } = useAuth();
  const [staffList, setStaffList] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [branchFilter, setBranchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [suspending, setSuspending] = useState<string | null>(null);
  const [resettingPassword, setResettingPassword] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const canResetPassword = user?.role === "super_admin";

  // Create Login Access modal state
  const [loginAccessStaff, setLoginAccessStaff] = useState<any | null>(null);
  const [loginPassword, setLoginPassword] = useState("");
  const [provisioningLogin, setProvisioningLogin] = useState(false);

  function generatePassword() {
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!";
    return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  }

  function openLoginAccessModal(staff: any) {
    setLoginAccessStaff(staff);
    setLoginPassword(generatePassword());
  }

  function closeLoginAccessModal() {
    setLoginAccessStaff(null);
    setLoginPassword("");
  }

  const handleCreateLoginAccess = async () => {
    if (!loginAccessStaff) return;
    if (loginPassword.length < 6) {
      toastError("Password must be at least 6 characters.");
      return;
    }
    setProvisioningLogin(true);
    try {
      const result = await provisionStaffAuthUser({
        email: loginAccessStaff.email,
        password: loginPassword,
        full_name: `${loginAccessStaff.first_name} ${loginAccessStaff.last_name}`,
        phone: loginAccessStaff.phone ?? "",
        role: loginAccessStaff.job_role ?? "staff_member",
        branch: loginAccessStaff.branch_id ?? "",
      });
      await updateStaff(loginAccessStaff.id, { profile_id: result.user_id });
      setStaffList(prev =>
        prev.map(s => s.id === loginAccessStaff.id ? { ...s, profile_id: result.user_id } : s)
      );
      closeLoginAccessModal();
      toastSuccess(`Login access created for ${loginAccessStaff.first_name}. Temp password: ${loginPassword}`);
    } catch (err: any) {
      toastError(err?.message || "Failed to create login access.");
    } finally {
      setProvisioningLogin(false);
    }
  };

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

  const handleSuspend = async (staffId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    const confirmed = await confirmToast(
      `Are you sure you want to ${newStatus === "suspended" ? "suspend" : "reactivate"} this staff member?`
    );
    if (!confirmed) return;

    setSuspending(staffId);
    try {
      await updateStaff(staffId, { employment_status: newStatus });
      setStaffList(prev => prev.map(s => s.id === staffId ? { ...s, employment_status: newStatus } : s));
      toastSuccess(`Staff member ${newStatus === "suspended" ? "suspended" : "reactivated"}.`);
    } catch (err) {
      console.error("Failed to update staff status:", err);
      toastError("Failed to update staff status.");
    }
    setSuspending(null);
  };

  const handlePasswordReset = async (staffId: string, staffName: string) => {
    if (!canResetPassword) return;
    const confirmed = await confirmToast(`Send a password reset email to ${staffName}?`);
    if (!confirmed) return;

    setResettingPassword(staffId);
    try {
      await sendStaffPasswordReset(staffId);
      toastSuccess(`Password reset email sent to ${staffName}.`);
    } catch (err: any) {
      toastError(err?.message || "Failed to send password reset email.");
    } finally {
      setResettingPassword(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(staffList.length / pageSize));
  const paginatedStaff = staffList.slice((page - 1) * pageSize, page * pageSize);
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
              ) : paginatedStaff.map((staff) => (
                <tr key={staff.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-navy-100 text-navy-900 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {(staff.first_name?.[0] ?? "").toUpperCase()}{(staff.last_name?.[0] ?? "").toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-navy-900">{staff.first_name} {staff.last_name}</p>
                        <p className="text-[10px] text-gray-400">{staff.staff_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4"><span className="inline-flex px-2.5 py-1 rounded text-[10px] font-bold tracking-wider bg-blue-600 text-white capitalize">{staff.job_role || '\u2014'}</span></td>
                  <td className="px-4 py-4"><p className="text-sm text-gray-600">{staff.branch?.name ?? '\u2014'}</p></td>
                  <td className="px-4 py-4"><p className="text-sm text-gray-600">{staff.phone ?? '\u2014'}</p></td>
                  <td className="px-4 py-4">{statusDot(staff.employment_status ?? 'active')}</td>
                  <td className="px-4 py-4"><p className="text-sm text-gray-600">{staff.date_joined ? new Date(staff.date_joined).toLocaleDateString() : '\u2014'}</p></td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/hr/staff/${staff.id}`} title="View Profile" className="p-1.5 text-gray-400 hover:text-navy-900 transition-colors"><Eye className="w-4 h-4" /></Link>
                      <button onClick={() => navigate(`/hr/staff/${staff.id}?edit=true`)} title="Edit" className="p-1.5 text-gray-400 hover:text-navy-900 transition-colors"><Pencil className="w-4 h-4" /></button>
                      {canResetPassword && !staff.profile_id && (
                        <button
                          onClick={() => openLoginAccessModal(staff)}
                          title="Create Login Access"
                          className="p-1.5 text-gray-400 hover:text-green-600 transition-colors"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                      )}
                      {canResetPassword && staff.profile_id && (
                        <button
                          onClick={() => handlePasswordReset(staff.id, `${staff.first_name} ${staff.last_name}`)}
                          disabled={resettingPassword === staff.id}
                          title="Resend Access / Reset Password"
                          className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-40"
                        >
                          {resettingPassword === staff.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                        </button>
                      )}
                      <button
                        onClick={() => handleSuspend(staff.id, staff.employment_status ?? "active")}
                        disabled={suspending === staff.id}
                        title={staff.employment_status === "active" ? "Suspend" : "Reactivate"}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
                      >
                        {suspending === staff.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
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
            Showing <span className="font-semibold text-navy-900">{Math.min((page - 1) * pageSize + 1, staffList.length)}</span>–<span className="font-semibold text-navy-900">{Math.min(page * pageSize, staffList.length)}</span> of <span className="font-semibold text-navy-900">{staffList.length}</span> staff
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold ${
                  p === page ? "bg-navy-900 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                } transition-colors`}
              >
                {p}
              </button>
            ))}
            {totalPages > 5 && <span className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">…</span>}
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Create Login Access Modal ─── */}
      {loginAccessStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-navy-900">Create Login Access</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {loginAccessStaff.first_name} {loginAccessStaff.last_name} &middot; {loginAccessStaff.email}
                </p>
              </div>
              <button onClick={closeLoginAccessModal} className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">Temporary Password</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
                  placeholder="Enter or generate password"
                />
                <button
                  onClick={() => setLoginPassword(generatePassword())}
                  type="button"
                  className="px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Regenerate
                </button>
              </div>
              <p className="text-[11px] text-gray-400">Copy this password and share it with the staff member after creating access.</p>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={closeLoginAccessModal}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateLoginAccess}
                disabled={provisioningLogin}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition-colors disabled:opacity-50"
              >
                {provisioningLogin ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {provisioningLogin ? "Creating..." : "Create Login Access"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
