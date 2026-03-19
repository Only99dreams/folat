import { useState } from "react";
import {
  Shield,
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Lock,
  Key,
} from "lucide-react";

/* ─── Roles ─── */
interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: number;
  totalPermissions: number;
  createdAt: string;
  color: string;
}

const roles: Role[] = [
  { id: "1", name: "Super Admin", description: "Full system access with all permissions", userCount: 2, permissions: 48, totalPermissions: 48, createdAt: "Jan 01, 2023", color: "bg-red-100 text-red-700" },
  { id: "2", name: "Branch Manager", description: "Manage branch operations, members, and staff", userCount: 6, permissions: 32, totalPermissions: 48, createdAt: "Jan 15, 2023", color: "bg-blue-100 text-blue-700" },
  { id: "3", name: "Finance Officer", description: "Handle financial transactions and reporting", userCount: 4, permissions: 24, totalPermissions: 48, createdAt: "Feb 01, 2023", color: "bg-green-100 text-green-700" },
  { id: "4", name: "Loan Officer", description: "Process and manage loan applications", userCount: 8, permissions: 18, totalPermissions: 48, createdAt: "Feb 10, 2023", color: "bg-amber-100 text-amber-700" },
  { id: "5", name: "Front Desk", description: "Basic member registration and enquiries", userCount: 12, permissions: 10, totalPermissions: 48, createdAt: "Mar 01, 2023", color: "bg-purple-100 text-purple-700" },
  { id: "6", name: "Auditor", description: "Read-only access for audit and compliance", userCount: 3, permissions: 14, totalPermissions: 48, createdAt: "Mar 15, 2023", color: "bg-gray-100 text-gray-700" },
];

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
  const [activeTab, setActiveTab] = useState<"roles" | "matrix">("roles");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRoles = roles.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <p className="text-2xl font-bold text-navy-900">6</p>
          <p className="text-xs text-gray-400 font-medium mt-1">Active</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-600" />
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Total Users</p>
          </div>
          <p className="text-2xl font-bold text-navy-900">35</p>
          <p className="text-xs text-blue-600 font-medium mt-1">With Roles</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Key className="w-4 h-4 text-amber-500" />
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Permissions</p>
          </div>
          <p className="text-2xl font-bold text-navy-900">48</p>
          <p className="text-xs text-amber-500 font-medium mt-1">Across System</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-red-500" />
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Restricted</p>
          </div>
          <p className="text-2xl font-bold text-navy-900">12</p>
          <p className="text-xs text-red-500 font-medium mt-1">Admin Only</p>
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
            <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Role</th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Description</th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Users</th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Permissions</th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Created</th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoles.map((role) => (
                  <tr key={role.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${role.color}`}>
                          <Shield className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-semibold text-navy-900">{role.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 max-w-[250px]">{role.description}</td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-semibold text-navy-900">{role.userCount}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${(role.permissions / role.totalPermissions) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {role.permissions}/{role.totalPermissions}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">{role.createdAt}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                          <Edit2 className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors">
                          <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Showing <span className="font-semibold text-navy-900">{filteredRoles.length}</span> of{" "}
                <span className="font-semibold text-navy-900">{roles.length}</span> roles
              </p>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400"><ChevronLeft className="w-4 h-4" /></button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-navy-900 text-white text-sm font-semibold">1</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400"><ChevronRight className="w-4 h-4" /></button>
              </div>
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
