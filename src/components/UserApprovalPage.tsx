import { useState, useEffect, useCallback } from "react";
import {
  UserCheck,
  UserX,
  Shield,
  Clock,
  Loader2,
  Check,
  X,
  ChevronDown,
  Search,
  Users,
  AlertCircle,
} from "lucide-react";
import { fetchPendingUsers, approveUser, rejectUser, fetchBranches, fetchAllProfiles, createNotification } from "../lib/db";

const roleOptions: { value: string; label: string; description: string; color: string }[] = [
  { value: "branch_manager", label: "Branch Manager", description: "Manage branch operations, members, and staff", color: "bg-blue-100 text-blue-700" },
  { value: "finance_officer", label: "Finance Officer", description: "Handle financial transactions and reporting", color: "bg-green-100 text-green-700" },
  { value: "loan_officer", label: "Loan Officer", description: "Process and manage loan applications", color: "bg-amber-100 text-amber-700" },
  { value: "staff_member", label: "Staff Member", description: "Access cooperative dashboard, loan menu, and staff communication tools", color: "bg-indigo-100 text-indigo-700" },
  { value: "front_desk", label: "Front Desk", description: "Basic member registration and enquiries", color: "bg-purple-100 text-purple-700" },
  { value: "auditor", label: "Auditor", description: "Read-only access for audit and compliance", color: "bg-gray-100 text-gray-700" },
  { value: "hr_manager", label: "HR Manager", description: "Manage staff, leave, and attendance", color: "bg-teal-100 text-teal-700" },
];

export default function UserApprovalPage() {
  type PendingUser = {
    id: string;
    full_name: string;
    email: string;
    avatar_initials: string;
    created_at: string;
  };

  type ProfileRow = PendingUser & { role: string };
  type BranchRow = { id: string; name: string };

  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [allProfiles, setAllProfiles] = useState<ProfileRow[]>([]);
  const [branches, setBranches] = useState<BranchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Per-user editing state
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>({});
  const [selectedBranches, setSelectedBranches] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<Record<string, "approving" | "rejecting" | null>>({});
  const [confirmReject, setConfirmReject] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [pending, branchList, profiles] = await Promise.all([
        fetchPendingUsers(),
        fetchBranches(),
        fetchAllProfiles(),
      ]);
      setPendingUsers((pending ?? []) as PendingUser[]);
      setBranches((branchList ?? []) as BranchRow[]);
      setAllProfiles((profiles ?? []) as ProfileRow[]);
    } catch (err) {
      console.error("Failed to load data:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      void loadData();
    }, 0);

    return () => clearTimeout(t);
  }, [loadData]);

  async function handleApprove(profileId: string) {
    const role = selectedRoles[profileId];
    if (!role) {
      setError("Please select a role before approving.");
      return;
    }
    setError("");
    setProcessing((p) => ({ ...p, [profileId]: "approving" }));
    try {
      const branch = selectedBranches[profileId] || undefined;
      await approveUser(profileId, role, branch);

      // Send in-app notification to the approved user
      const roleLabel = roleOptions.find((r) => r.value === role)?.label ?? role;
      await createNotification({
        user_id: profileId,
        title: "Account Approved",
        body: `Your account has been approved. You have been assigned the role: ${roleLabel}. Please log in again to access the system.`,
        type: "success",
        link: "/dashboard",
      });

      setSuccessMsg("User approved successfully.");
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to approve user.");
    }
    setProcessing((p) => ({ ...p, [profileId]: null }));
    setTimeout(() => setSuccessMsg(""), 3000);
  }

  async function handleReject(profileId: string) {
    setError("");
    setProcessing((p) => ({ ...p, [profileId]: "rejecting" }));
    try {
      await rejectUser(profileId);
      setConfirmReject(null);
      setSuccessMsg("User rejected and removed.");
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to reject user.");
    }
    setProcessing((p) => ({ ...p, [profileId]: null }));
    setTimeout(() => setSuccessMsg(""), 3000);
  }

  const filteredPending = pendingUsers.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (u.full_name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q);
  });

  const assignedCount = allProfiles.filter((p) => p.role && p.role !== "unassigned").length;

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">User Approval</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review new user registrations, assign roles, and grant system access.
          </p>
        </div>
      </div>

      {/* ─── Stats ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-amber-500 rounded-xl p-5 text-white">
          <p className="text-[10px] tracking-[0.1em] uppercase font-semibold text-amber-200">Pending Approval</p>
          <p className="text-3xl font-bold mt-1">{pendingUsers.length}</p>
        </div>
        <div className="bg-green-600 rounded-xl p-5 text-white">
          <p className="text-[10px] tracking-[0.1em] uppercase font-semibold text-green-200">Total Users</p>
          <p className="text-3xl font-bold mt-1">{allProfiles.length}</p>
        </div>
        <div className="bg-navy-900 rounded-xl p-5 text-white">
          <p className="text-[10px] tracking-[0.1em] uppercase font-semibold text-gray-400">Assigned Roles</p>
          <p className="text-3xl font-bold mt-1">{assignedCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase font-semibold text-gray-400">Available Roles</p>
          <p className="text-3xl font-bold text-navy-900 mt-1">{roleOptions.length}</p>
        </div>
      </div>

      {/* ─── Messages ─── */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <Check className="w-4 h-4 text-green-500 shrink-0" />
          <p className="text-sm text-green-600">{successMsg}</p>
        </div>
      )}

      {/* ─── Pending Users Table ─── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-navy-900">Pending Registrations</h2>
            {pendingUsers.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                {pendingUsers.length}
              </span>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 w-56"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-navy-900" />
          </div>
        ) : filteredPending.length === 0 ? (
          <div className="text-center py-16">
            <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No pending user registrations.</p>
            <p className="text-xs text-gray-300 mt-1">All users have been reviewed.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredPending.map((user) => (
              <div key={user.id} className="px-6 py-5">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* User info */}
                  <div className="flex items-center gap-4 min-w-0 lg:w-1/4">
                    <div className="w-11 h-11 rounded-full bg-navy-900 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {(user.avatar_initials || user.full_name?.[0] || "U").substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-navy-900 truncate">{user.full_name || "Unnamed"}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      <p className="text-[10px] text-gray-300 mt-0.5">
                        Registered {new Date(user.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>

                  {/* Role select */}
                  <div className="lg:w-1/4">
                    <label className="block text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1.5">
                      Assign Role
                    </label>
                    <div className="relative">
                      <select
                        value={selectedRoles[user.id] || ""}
                        onChange={(e) => setSelectedRoles((prev) => ({ ...prev, [user.id]: e.target.value }))}
                        className="w-full appearance-none px-3 py-2.5 pr-9 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 bg-white"
                      >
                        <option value="">Select Role...</option>
                        {roleOptions.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Branch select */}
                  <div className="lg:w-1/4">
                    <label className="block text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1.5">
                      Assign Branch <span className="text-gray-300">(Optional)</span>
                    </label>
                    <div className="relative">
                      <select
                        value={selectedBranches[user.id] || ""}
                        onChange={(e) => setSelectedBranches((prev) => ({ ...prev, [user.id]: e.target.value }))}
                        className="w-full appearance-none px-3 py-2.5 pr-9 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 bg-white"
                      >
                        <option value="">All Branches</option>
                        {branches.map((b) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-end gap-2 lg:w-1/4 lg:justify-end">
                    <button
                      onClick={() => handleApprove(user.id)}
                      disabled={processing[user.id] === "approving"}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {processing[user.id] === "approving" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <UserCheck className="w-4 h-4" />
                      )}
                      Approve
                    </button>

                    {confirmReject === user.id ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleReject(user.id)}
                          disabled={processing[user.id] === "rejecting"}
                          className="flex items-center gap-1 px-3 py-2.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                          {processing[user.id] === "rejecting" ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmReject(null)}
                          className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmReject(user.id)}
                        className="flex items-center gap-1.5 px-4 py-2.5 border border-red-200 text-red-500 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors"
                      >
                        <UserX className="w-4 h-4" />
                        Reject
                      </button>
                    )}
                  </div>
                </div>

                {/* Role description hint */}
                {selectedRoles[user.id] && (
                  <div className="mt-3 ml-15 pl-15">
                    <p className="text-xs text-gray-400 flex items-center gap-1.5">
                      <Shield className="w-3 h-3" />
                      {roleOptions.find((r) => r.value === selectedRoles[user.id])?.description}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Recently Approved ─── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <Users className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-bold text-navy-900">Recently Approved Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">User</th>
                <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Email</th>
                <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Role</th>
                <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody>
              {allProfiles
                .filter((p) => p.role && p.role !== "unassigned")
                .slice(0, 10)
                .map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-navy-900 text-white flex items-center justify-center text-xs font-bold">
                          {(p.avatar_initials || p.full_name?.[0] || "U").substring(0, 2).toUpperCase()}
                        </div>
                        <p className="text-sm font-semibold text-navy-900">{p.full_name || "—"}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{p.email}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 border border-green-200 capitalize">
                        {(p.role || "").replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
