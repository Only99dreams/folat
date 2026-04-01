import { useState, useEffect } from "react";
import {
  Shield,
  Users,
  Search,
  Edit2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Lock,
  Key,
  Loader2,
  Plus,
} from "lucide-react";
import { fetchAllProfiles, updateProfileRole } from "../lib/db";

/* ─── Role definitions ─── */
const roleDefinitions: Record<string, { label: string; description: string; color: string }> = {
  super_admin: { label: "Super Admin", description: "Full system access with all permissions", color: "bg-red-100 text-red-700" },
  branch_manager: { label: "Branch Manager", description: "Manage branch operations, members, and staff", color: "bg-blue-100 text-blue-700" },
  finance_officer: { label: "Finance Officer", description: "Handle financial transactions and reporting", color: "bg-green-100 text-green-700" },
  loan_officer: { label: "Loan Officer", description: "Process and manage loan applications", color: "bg-amber-100 text-amber-700" },
  front_desk: { label: "Front Desk", description: "Basic member registration and enquiries", color: "bg-purple-100 text-purple-700" },
  auditor: { label: "Auditor", description: "Read-only access for audit and compliance", color: "bg-gray-100 text-gray-700" },
  hr_manager: { label: "HR Manager", description: "Manage staff, leave, and attendance", color: "bg-teal-100 text-teal-700" },
  unassigned: { label: "Unassigned", description: "No role assigned yet", color: "bg-gray-100 text-gray-500" },
};

const roleKeys = Object.keys(roleDefinitions);

/* ─── Permission Matrix ─── */
const permissionModules = [
  {
    module: "Members",
    permissions: [
      { name: "View Members", admin: true, branchMgr: true, finance: true, loan: true, frontDesk: true, auditor: true },
      { name: "Add Members", admin: true, branchMgr: true, finance: false, loan: false, frontDesk: true, auditor: false },
      { name: "Edit Members", admin: true, branchMgr: true, finance: false, loan: false, frontDesk: false, auditor: false },
      { name: "Delete Members", admin: true, branchMgr: false, finance: false, loan: false, frontDesk: false, auditor: false },
    ],
  },
  {
    module: "Loans",
    permissions: [
      { name: "View Loans", admin: true, branchMgr: true, finance: true, loan: true, frontDesk: false, auditor: true },
      { name: "Create Loans", admin: true, branchMgr: true, finance: false, loan: true, frontDesk: false, auditor: false },
      { name: "Approve Loans", admin: true, branchMgr: true, finance: false, loan: false, frontDesk: false, auditor: false },
      { name: "Disburse Loans", admin: true, branchMgr: false, finance: true, loan: false, frontDesk: false, auditor: false },
    ],
  },
  {
    module: "Finance",
    permissions: [
      { name: "View Transactions", admin: true, branchMgr: true, finance: true, loan: false, frontDesk: false, auditor: true },
      { name: "Record Income", admin: true, branchMgr: false, finance: true, loan: false, frontDesk: false, auditor: false },
      { name: "Record Expense", admin: true, branchMgr: false, finance: true, loan: false, frontDesk: false, auditor: false },
      { name: "Approve Requests", admin: true, branchMgr: true, finance: false, loan: false, frontDesk: false, auditor: false },
    ],
  },
];

export default function AccessControlPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"roles" | "matrix">("roles");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState("");

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

  // Build role summary 
  const roleSummary = roleKeys.map((key) => ({
    key,
    ...roleDefinitions[key],
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
        <button className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors">
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
          <p className="text-2xl font-bold text-navy-900">{roleKeys.length}</p>
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
          <p className="text-2xl font-bold text-navy-900">{profiles.filter(p => p.role && p.role !== 'unassigned').length}</p>
          <p className="text-xs text-amber-500 font-medium mt-1">With roles</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-red-500" />
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Unassigned</p>
          </div>
          <p className="text-2xl font-bold text-navy-900">{profiles.filter(p => !p.role || p.role === 'unassigned').length}</p>
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
                placeholder="Search roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-64"
              />
            </div>
          )}
        </div>

        {/* ─── Roles Tab ─── */}
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
                  const rd = roleDefinitions[profile.role] || roleDefinitions.unassigned;
                  return (
                  <tr key={profile.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-navy-900">{profile.full_name || 'Unnamed'}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">{profile.email}</td>
                    <td className="px-4 py-4">
                      {editingId === profile.id ? (
                        <select value={editRole} onChange={(e) => setEditRole(e.target.value)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm">
                          {roleKeys.map((k) => <option key={k} value={k}>{roleDefinitions[k].label}</option>)}
                        </select>
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold ${rd.color}`}>
                          <Shield className="w-3 h-3" /> {rd.label}
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
                          <button onClick={() => { setEditingId(profile.id); setEditRole(profile.role || 'unassigned'); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
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

        {/* ─── Permission Matrix Tab ─── */}
        {activeTab === "matrix" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold min-w-[200px]">Permission</th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">Admin</th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">Branch Mgr</th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">Finance</th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">Loan Officer</th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">Front Desk</th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">Auditor</th>
                </tr>
              </thead>
              <tbody>
                {permissionModules.map((mod) => (
                  <>
                    <tr key={mod.module} className="bg-gray-50/80">
                      <td colSpan={7} className="px-6 py-2.5">
                        <p className="text-xs font-bold text-navy-900 uppercase tracking-wider">{mod.module}</p>
                      </td>
                    </tr>
                    {mod.permissions.map((perm, pi) => (
                      <tr key={pi} className="border-b border-gray-50">
                        <td className="px-6 py-3 text-sm text-gray-600">{perm.name}</td>
                        {["admin", "branchMgr", "finance", "loan", "frontDesk", "auditor"].map((role) => (
                          <td key={role} className="px-4 py-3 text-center">
                            {(perm as any)[role] ? (
                              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                                <Check className="w-3.5 h-3.5 text-green-600" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                                <X className="w-3.5 h-3.5 text-gray-400" />
                              </div>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
