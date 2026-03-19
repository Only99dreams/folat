import { useState } from "react";
import {
  Search,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  LogIn,
  LogOut,
  UserPlus,
  Edit2,
  Trash2,
  Shield,
  Eye,
  Calendar,
  ChevronDown,
  Activity,
} from "lucide-react";

/* ─── Audit Data ─── */
interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  module: string;
  description: string;
  ipAddress: string;
  status: "Success" | "Warning" | "Failed";
  icon: React.ElementType;
}

const auditEntries: AuditEntry[] = [
  { id: "AUD-001", timestamp: "Oct 24, 2023 14:32:18", user: "Admin User", role: "Super Admin", action: "Login", module: "Auth", description: "Successful login from 192.168.1.100", ipAddress: "192.168.1.100", status: "Success", icon: LogIn },
  { id: "AUD-002", timestamp: "Oct 24, 2023 14:28:05", user: "Jane Okafor", role: "Finance Officer", action: "Create", module: "Finance", description: "Recorded new income entry - ₦2,500,000 membership dues", ipAddress: "192.168.1.105", status: "Success", icon: UserPlus },
  { id: "AUD-003", timestamp: "Oct 24, 2023 13:45:22", user: "Michael Eze", role: "Loan Officer", action: "Update", module: "Loans", description: "Updated loan application LON-2023-0842 status to Approved", ipAddress: "192.168.1.108", status: "Success", icon: Edit2 },
  { id: "AUD-004", timestamp: "Oct 24, 2023 13:12:00", user: "Unknown", role: "N/A", action: "Failed Login", module: "Auth", description: "Failed login attempt - invalid credentials (3rd attempt)", ipAddress: "203.45.67.89", status: "Failed", icon: Shield },
  { id: "AUD-005", timestamp: "Oct 24, 2023 12:58:44", user: "Sarah Adamu", role: "Branch Manager", action: "Delete", module: "Members", description: "Deactivated member account MEM-2023-0156", ipAddress: "192.168.1.112", status: "Warning", icon: Trash2 },
  { id: "AUD-006", timestamp: "Oct 24, 2023 12:30:10", user: "Admin User", role: "Super Admin", action: "Export", module: "Reports", description: "Exported Financial Summary report as PDF", ipAddress: "192.168.1.100", status: "Success", icon: Download },
  { id: "AUD-007", timestamp: "Oct 24, 2023 11:45:33", user: "David Okoro", role: "Front Desk", action: "Create", module: "Members", description: "Registered new cooperative member - Amina Bello", ipAddress: "192.168.1.115", status: "Success", icon: UserPlus },
  { id: "AUD-008", timestamp: "Oct 24, 2023 11:20:15", user: "Jane Okafor", role: "Finance Officer", action: "View", module: "Finance", description: "Accessed General Ledger page", ipAddress: "192.168.1.105", status: "Success", icon: Eye },
  { id: "AUD-009", timestamp: "Oct 24, 2023 10:55:00", user: "Admin User", role: "Super Admin", action: "Update", module: "Settings", description: "Updated system notification preferences", ipAddress: "192.168.1.100", status: "Success", icon: Edit2 },
  { id: "AUD-010", timestamp: "Oct 24, 2023 10:15:28", user: "Michael Eze", role: "Loan Officer", action: "Logout", module: "Auth", description: "User session ended", ipAddress: "192.168.1.108", status: "Success", icon: LogOut },
];

const statusBadge = (status: AuditEntry["status"]) => {
  const s: Record<string, string> = {
    Success: "bg-green-100 text-green-700",
    Warning: "bg-amber-100 text-amber-700",
    Failed: "bg-red-100 text-red-600",
  };
  return (
    <span className={`inline-flex px-2.5 py-1 rounded text-[10px] font-bold tracking-wider ${s[status]}`}>
      {status.toUpperCase()}
    </span>
  );
};

export default function AuditLogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModule, setFilterModule] = useState("All");

  const modules = ["All", "Auth", "Members", "Loans", "Finance", "Reports", "Settings"];

  const filtered = auditEntries.filter((e) => {
    const matchesSearch =
      e.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.action.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModule = filterModule === "All" || e.module === filterModule;
    return matchesSearch && matchesModule;
  });

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Audit Log</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track and review all system activities and user actions for compliance.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            Today
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors">
            <Download className="w-4 h-4" />
            Export Log
          </button>
        </div>
      </div>

      {/* ─── Stats ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-green-600" />
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Total Activities</p>
          </div>
          <p className="text-2xl font-bold text-navy-900">1,284</p>
          <p className="text-xs text-green-600 font-medium mt-1">Today</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <LogIn className="w-4 h-4 text-blue-600" />
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Login Events</p>
          </div>
          <p className="text-2xl font-bold text-navy-900">86</p>
          <p className="text-xs text-blue-600 font-medium mt-1">Active Sessions: 24</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-red-500" />
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Failed Attempts</p>
          </div>
          <p className="text-2xl font-bold text-navy-900">7</p>
          <p className="text-xs text-red-500 font-medium mt-1">Blocked: 3</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Edit2 className="w-4 h-4 text-amber-500" />
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Data Changes</p>
          </div>
          <p className="text-2xl font-bold text-navy-900">342</p>
          <p className="text-xs text-amber-500 font-medium mt-1">Create/Update/Delete</p>
        </div>
      </div>

      {/* ─── Activity Log Table ─── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-2">
            {modules.map((mod) => (
              <button
                key={mod}
                onClick={() => setFilterModule(mod)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterModule === mod
                    ? "bg-navy-900 text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {mod}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-6 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Timestamp</th>
              <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">User</th>
              <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Action</th>
              <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Description</th>
              <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">IP Address</th>
              <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry) => (
              <tr key={entry.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-600 whitespace-nowrap">{entry.timestamp}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm font-medium text-navy-900">{entry.user}</p>
                  <p className="text-xs text-gray-400">{entry.role}</p>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                      <entry.icon className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-navy-900">{entry.action}</p>
                      <p className="text-[10px] text-gray-400">{entry.module}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 max-w-[280px]">
                  <p className="text-sm text-gray-500 truncate">{entry.description}</p>
                </td>
                <td className="px-4 py-4">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono">
                    {entry.ipAddress}
                  </code>
                </td>
                <td className="px-4 py-4">{statusBadge(entry.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-navy-900">1 to {filtered.length}</span> of{" "}
            <span className="font-semibold text-navy-900">1,284</span> entries
          </p>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400"><ChevronLeft className="w-4 h-4" /></button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-navy-900 text-white text-sm font-semibold">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 text-sm">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 text-sm">3</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
