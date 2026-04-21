import { useState, useEffect, Fragment } from "react";
import {
  Shield,
  Users,
  Search,
  Edit2,
  Check,
  X,
  Lock,
  Key,
  Loader2,
  Plus,
  Save,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { fetchAllProfiles, updateProfileRole } from "../lib/db";
import { ROLE_PERMISSIONS, ROLE_LABELS, type Permission, type UserRole } from "../auth/types";

/* ─── All permissions grouped by module ─── */
const PERMISSION_MODULES: { module: string; permissions: { key: Permission; label: string }[] }[] = [
  {
    module: "Members",
    permissions: [
      { key: "members.view", label: "View Members" },
      { key: "members.add", label: "Add Members" },
      { key: "members.edit", label: "Edit Members" },
      { key: "members.delete", label: "Delete Members" },
    ],
  },
  {
    module: "Savings",
    permissions: [
      { key: "savings.view", label: "View Savings" },
      { key: "savings.deposit", label: "Record Deposit" },
      { key: "savings.bulk_upload", label: "Bulk Upload" },
      { key: "savings.transactions", label: "View Transactions" },
      { key: "savings.statement", label: "View Statement" },
      { key: "savings.withdrawal", label: "Record Withdrawal" },
      { key: "savings.data_sheet", label: "Data Sheet" },
    ],
  },
  {
    module: "Loans",
    permissions: [
      { key: "loans.view", label: "View Loans" },
      { key: "loans.create", label: "Create Loans" },
      { key: "loans.approve", label: "Approve Loans" },
      { key: "loans.disburse", label: "Disburse Loans" },
      { key: "loans.repayments", label: "View Repayments" },
      { key: "loans.record_repayment", label: "Record Repayment" },
      { key: "loans.weekly_tracking", label: "Weekly Tracking" },
    ],
  },
  {
    module: "Groups",
    permissions: [
      { key: "groups.view", label: "View Groups" },
      { key: "groups.create", label: "Create Groups" },
    ],
  },
  {
    module: "Finance",
    permissions: [
      { key: "finance.view", label: "View Finance" },
      { key: "finance.add_income", label: "Record Income" },
      { key: "finance.add_expense", label: "Record Expense" },
      { key: "finance.ledger", label: "View Ledger" },
      { key: "finance.fund_requests", label: "Fund Requests" },
      { key: "finance.approve_requests", label: "Approve Requests" },
    ],
  },
  {
    module: "HR",
    permissions: [
      { key: "hr.view", label: "View HR" },
      { key: "hr.staff_list", label: "Staff List" },
      { key: "hr.add_staff", label: "Add Staff" },
      { key: "hr.leave_requests", label: "Leave Requests" },
      { key: "hr.salary_structure", label: "Salary Structure" },
      { key: "hr.attendance", label: "Attendance" },
    ],
  },
  {
    module: "Branches",
    permissions: [
      { key: "branches.view", label: "View Branches" },
      { key: "branches.add", label: "Add Branch" },
    ],
  },
  {
    module: "Communication",
    permissions: [
      { key: "communication.messages", label: "Messages" },
      { key: "communication.sms", label: "Bulk SMS" },
    ],
  },
  {
    module: "Reports",
    permissions: [
      { key: "reports.view", label: "View Reports" },
    ],
  },
  {
    module: "Security",
    permissions: [
      { key: "security.access_control", label: "Access Control" },
      { key: "security.audit_log", label: "Audit Log" },
    ],
  },
  {
    module: "Settings",
    permissions: [
      { key: "settings.general", label: "General Settings" },
      { key: "settings.notifications", label: "Notification Settings" },
    ],
  },
];

const roleColors: Record<string, string> = {
  super_admin: "bg-red-100 text-red-700",
  branch_manager: "bg-blue-100 text-blue-700",
  finance_officer: "bg-green-100 text-green-700",
  loan_officer: "bg-amber-100 text-amber-700",
  front_desk: "bg-purple-100 text-purple-700",
  auditor: "bg-gray-100 text-gray-700",
  hr_manager: "bg-teal-100 text-teal-700",
  unassigned: "bg-gray-100 text-gray-500",
};

/**
 * We keep a mutable copy of ROLE_PERMISSIONS in-memory so admin can toggle permissions.
 * (Persists only for the session — to truly persist, store in DB.)
 */
const livePermissions: Record<string, Permission[]> = {};
for (const [role, perms] of Object.entries(ROLE_PERMISSIONS)) {
  livePermissions[role] = [...perms];
}

/** Custom roles added by admin during session */
const customRoles: { key: string; label: string }[] = [];

function getAllRoleKeys() {
  const base = Object.keys(ROLE_PERMISSIONS) as string[];
  return [...base, ...customRoles.map((r) => r.key)];
}

function getRoleLabel(key: string): string {
  return (ROLE_LABELS as Record<string, string>)[key] || customRoles.find((r) => r.key === key)?.label || key;
}

export default function AccessControlPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"roles" | "matrix">("roles");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState("");

  /* ─── Permission editing state ─── */
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [dirtyPerms, setDirtyPerms] = useState<Permission[]>([]);
  const [permSaved, setPermSaved] = useState(false);

  /* ─── Create Role modal ─── */
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleKey, setNewRoleKey] = useState("");
  const [newRolePerms, setNewRolePerms] = useState<Permission[]>([]);
  const [, forceUpdate] = useState(0);

  useEffect(() => { loadProfiles(); }, []);

  async function loadProfiles() {
    try {
      setLoading(true);
      const data = await fetchAllProfiles();
      setProfiles(data);
    } catch (err) {
      console.error("Failed to load profiles:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveRole(profileId: string) {
    try {
      await updateProfileRole(profileId, editRole);
      setEditingId(null);
      await loadProfiles();
    } catch (err) {
      console.error("Failed to update role:", err);
    }
  }

  /* ─── Permission matrix helpers ─── */
  const roleKeys = getAllRoleKeys().filter((k) => k !== "unassigned");

  function startEditingPerms(role: string) {
    setEditingRole(role);
    setDirtyPerms([...(livePermissions[role] || [])]);
    setPermSaved(false);
  }

  function togglePerm(perm: Permission) {
    setDirtyPerms((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  }

  function savePerms() {
    if (!editingRole) return;
    livePermissions[editingRole] = [...dirtyPerms];
    // Also update the imported ROLE_PERMISSIONS if it's a built-in role
    if ((ROLE_PERMISSIONS as Record<string, Permission[]>)[editingRole]) {
      (ROLE_PERMISSIONS as Record<string, Permission[]>)[editingRole] = [...dirtyPerms];
    }
    setPermSaved(true);
    setTimeout(() => { setEditingRole(null); setPermSaved(false); }, 800);
  }

  function handleCreateRole() {
    const key = newRoleKey.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    if (!key || !newRoleName.trim()) return;
    customRoles.push({ key, label: newRoleName.trim() });
    livePermissions[key] = [...newRolePerms];
    roleColors[key] = "bg-indigo-100 text-indigo-700";
    setShowCreateRole(false);
    setNewRoleName("");
    setNewRoleKey("");
    setNewRolePerms([]);
    forceUpdate((n) => n + 1);
  }

  /* ─── Derived data ─── */
  const allRoleKeys = getAllRoleKeys();
  const roleSummary = allRoleKeys.map((key) => ({
    key,
    label: getRoleLabel(key),
    color: roleColors[key] || "bg-gray-100 text-gray-600",
    count: profiles.filter((p) => p.role === key).length,
  }));

  const filteredProfiles = profiles.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p.full_name || "").toLowerCase().includes(q) ||
      (p.email || "").toLowerCase().includes(q) ||
      (p.role || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Access Control</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage user roles, permissions, and access levels across the system.
          </p>
        </div>
        <button
          onClick={() => { setShowCreateRole(true); setNewRoleName(""); setNewRoleKey(""); setNewRolePerms([]); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Role
        </button>
      </div>

      {/* ─── Stats ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-green-600" />
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Total Roles</p>
          </div>
          <p className="text-2xl font-bold text-navy-900">{allRoleKeys.length}</p>
          <p className="text-xs text-gray-400 font-medium mt-1">System roles</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-600" />
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Total Users</p>
          </div>
          <p className="text-2xl font-bold text-navy-900">{profiles.length}</p>
          <p className="text-xs text-blue-600 font-medium mt-1">Registered</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Key className="w-4 h-4 text-amber-500" />
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Assigned</p>
          </div>
          <p className="text-2xl font-bold text-navy-900">{profiles.filter((p) => p.role && p.role !== "unassigned").length}</p>
          <p className="text-xs text-amber-500 font-medium mt-1">With roles</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-red-500" />
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Unassigned</p>
          </div>
          <p className="text-2xl font-bold text-navy-900">{profiles.filter((p) => !p.role || p.role === "unassigned").length}</p>
          <p className="text-xs text-red-500 font-medium mt-1">Pending assignment</p>
        </div>
      </div>

      {/* ─── Tabs ─── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab("roles")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === "roles" ? "bg-navy-900 text-white" : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              Roles & Users
            </button>
            <button
              onClick={() => setActiveTab("matrix")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === "matrix" ? "bg-navy-900 text-white" : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              Permission Matrix
            </button>
          </div>

          {activeTab === "roles" && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-64"
              />
            </div>
          )}
        </div>

        {/* ═══════════ Roles & Users Tab ═══════════ */}
        {activeTab === "roles" && (
          <>
            {/* Role Summary */}
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex flex-wrap gap-2">
                {roleSummary.map((r) => (
                  <span key={r.key} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${r.color}`}>
                    <Shield className="w-3 h-3" /> {r.label}: {r.count}
                  </span>
                ))}
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">User</th>
                    <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Email</th>
                    <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Current Role</th>
                    <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Joined</th>
                    <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin text-green-600 mx-auto" /></td></tr>
                  ) : filteredProfiles.length === 0 ? (
                    <tr><td colSpan={5} className="py-16 text-center text-gray-400">No users found.</td></tr>
                  ) : filteredProfiles.map((profile) => {
                    const color = roleColors[profile.role] || roleColors.unassigned;
                    return (
                      <tr key={profile.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-navy-900">{profile.full_name || "Unnamed"}</p>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">{profile.email}</td>
                        <td className="px-4 py-4">
                          {editingId === profile.id ? (
                            <select value={editRole} onChange={(e) => setEditRole(e.target.value)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm">
                              {allRoleKeys.map((k) => (
                                <option key={k} value={k}>{getRoleLabel(k)}</option>
                              ))}
                            </select>
                          ) : (
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold ${color}`}>
                              <Shield className="w-3 h-3" /> {getRoleLabel(profile.role || "unassigned")}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">{new Date(profile.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1">
                            {editingId === profile.id ? (
                              <>
                                <button onClick={() => handleSaveRole(profile.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-green-50 transition-colors">
                                  <Check className="w-4 h-4 text-green-600" />
                                </button>
                                <button onClick={() => setEditingId(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors">
                                  <X className="w-4 h-4 text-red-500" />
                                </button>
                              </>
                            ) : (
                              <button onClick={() => { setEditingId(profile.id); setEditRole(profile.role || "unassigned"); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                                <Edit2 className="w-4 h-4 text-gray-400" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Showing <span className="font-semibold text-navy-900">{filteredProfiles.length}</span> of{" "}
                <span className="font-semibold text-navy-900">{profiles.length}</span> users
              </p>
            </div>
          </>
        )}

        {/* ═══════════ Permission Matrix Tab ═══════════ */}
        {activeTab === "matrix" && (
          <div>
            <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-500">Click the <Edit2 className="w-3 h-3 inline" /> icon on a role column header to edit its permissions. Toggle individual permissions on/off.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold min-w-[180px] sticky left-0 bg-white z-10">Permission</th>
                    {roleKeys.map((role) => (
                      <th key={role} className="px-3 py-3 text-center min-w-[100px]">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">{getRoleLabel(role)}</span>
                          {editingRole === role ? (
                            <div className="flex items-center gap-1">
                              <button onClick={savePerms} className="p-1 rounded bg-green-100 hover:bg-green-200" title="Save">
                                <Save className="w-3 h-3 text-green-600" />
                              </button>
                              <button onClick={() => setEditingRole(null)} className="p-1 rounded bg-red-100 hover:bg-red-200" title="Cancel">
                                <X className="w-3 h-3 text-red-500" />
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => startEditingPerms(role)} className="p-1 rounded hover:bg-gray-100" title="Edit permissions">
                              <Edit2 className="w-3 h-3 text-gray-400" />
                            </button>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PERMISSION_MODULES.map((mod) => (
                    <Fragment key={mod.module}>
                      <tr className="bg-gray-50/80">
                        <td colSpan={roleKeys.length + 1} className="px-6 py-2.5">
                          <p className="text-xs font-bold text-navy-900 uppercase tracking-wider">{mod.module}</p>
                        </td>
                      </tr>
                      {mod.permissions.map((perm) => (
                        <tr key={perm.key} className="border-b border-gray-50">
                          <td className="px-6 py-3 text-sm text-gray-600 sticky left-0 bg-white">{perm.label}</td>
                          {roleKeys.map((role) => {
                            const isEditing = editingRole === role;
                            const permsArr = isEditing ? dirtyPerms : (livePermissions[role] || []);
                            const has = permsArr.includes(perm.key);

                            if (isEditing) {
                              return (
                                <td key={role} className="px-3 py-3 text-center">
                                  <button onClick={() => togglePerm(perm.key)} className="mx-auto flex items-center justify-center">
                                    {has ? (
                                      <ToggleRight className="w-6 h-6 text-green-600" />
                                    ) : (
                                      <ToggleLeft className="w-6 h-6 text-gray-300" />
                                    )}
                                  </button>
                                </td>
                              );
                            }

                            return (
                              <td key={role} className="px-3 py-3 text-center">
                                {has ? (
                                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                                    <Check className="w-3.5 h-3.5 text-green-600" />
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                                    <X className="w-3.5 h-3.5 text-gray-400" />
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            {permSaved && (
              <div className="px-6 py-3 bg-green-50 border-t border-green-200 text-sm text-green-700 font-medium">
                Permissions updated successfully.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══════════ Create Role Modal ═══════════ */}
      {showCreateRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-navy-900">Create New Role</h3>
              <button onClick={() => setShowCreateRole(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Role Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Data Entry Clerk"
                    value={newRoleName}
                    onChange={(e) => {
                      setNewRoleName(e.target.value);
                      setNewRoleKey(e.target.value.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""));
                    }}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Role Key (auto)</label>
                  <input
                    type="text"
                    value={newRoleKey}
                    readOnly
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500"
                  />
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-navy-900 mb-3">Select Permissions</p>
                <div className="space-y-4 max-h-[50vh] overflow-y-auto">
                  {PERMISSION_MODULES.map((mod) => (
                    <div key={mod.module}>
                      <p className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-2">{mod.module}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {mod.permissions.map((perm) => {
                          const selected = newRolePerms.includes(perm.key);
                          return (
                            <button
                              key={perm.key}
                              onClick={() =>
                                setNewRolePerms((prev) =>
                                  selected ? prev.filter((p) => p !== perm.key) : [...prev, perm.key]
                                )
                              }
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                                selected
                                  ? "bg-green-50 border-green-300 text-green-700"
                                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              {selected ? <Check className="w-3 h-3" /> : <span className="w-3 h-3" />}
                              {perm.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white">
              <p className="text-xs text-gray-400">{newRolePerms.length} permissions selected</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setShowCreateRole(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50">Cancel</button>
                <button
                  onClick={handleCreateRole}
                  disabled={!newRoleName.trim() || !newRoleKey.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  Create Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

