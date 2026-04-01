import { useState, useEffect } from "react";
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  LogIn,
  Shield,
  Edit2,
  Calendar,
  ChevronDown,
  Activity,
  Loader2,
} from "lucide-react";
import { fetchAuditLog } from "../lib/db";

const actionIcons: Record<string, React.ElementType> = {
  login: LogIn,
  create: Edit2,
  update: Edit2,
  delete: Shield,
  send: Edit2,
  approve: Edit2,
  reject: Shield,
  disburse: Edit2,
};

export default function AuditLogPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModule, setFilterModule] = useState("All");
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const modules = ["All", "members", "loans", "savings", "finance", "fund_requests", "staff", "sms", "settings"];
  const moduleLabels: Record<string, string> = {
    All: "All", members: "Members", loans: "Loans", savings: "Savings",
    finance: "Finance", fund_requests: "Fund Requests", staff: "Staff", sms: "SMS", settings: "Settings",
  };

  useEffect(() => {
    loadData();
  }, [filterModule, page]);

  async function loadData() {
    try {
      setLoading(true);
      const filters: any = { page, pageSize };
      if (filterModule !== "All") filters.entity_type = filterModule;
      const { data, count } = await fetchAuditLog(filters);
      setEntries(data);
      setTotalEntries(count);
    } catch (err) {
      console.error("Failed to load audit log:", err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = entries.filter((e) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const userName = e.user?.full_name || e.user?.email || "";
    return (
      userName.toLowerCase().includes(q) ||
      (e.action || "").toLowerCase().includes(q) ||
      JSON.stringify(e.details || {}).toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));

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
          <p className="text-2xl font-bold text-navy-900">{totalEntries.toLocaleString()}</p>
          <p className="text-xs text-green-600 font-medium mt-1">All time</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <LogIn className="w-4 h-4 text-blue-600" />
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Current Page</p>
          </div>
          <p className="text-2xl font-bold text-navy-900">{filtered.length}</p>
          <p className="text-xs text-blue-600 font-medium mt-1">Showing on this page</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-red-500" />
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Delete Actions</p>
          </div>
          <p className="text-2xl font-bold text-navy-900">{entries.filter(e => e.action === 'delete').length}</p>
          <p className="text-xs text-red-500 font-medium mt-1">On this page</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Edit2 className="w-4 h-4 text-amber-500" />
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Data Changes</p>
          </div>
          <p className="text-2xl font-bold text-navy-900">{entries.filter(e => ['create','update','delete'].includes(e.action)).length}</p>
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
                onClick={() => { setFilterModule(mod); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterModule === mod
                    ? "bg-navy-900 text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {moduleLabels[mod] || mod}
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
            {loading ? (
              <tr><td colSpan={6} className="py-16 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-green-600 mx-auto" />
              </td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="py-16 text-center text-gray-400">No audit entries found.</td></tr>
            ) : filtered.map((entry) => {
              const Icon = actionIcons[entry.action] || Activity;
              const userName = entry.user?.full_name || entry.user?.email || "System";
              const ts = new Date(entry.created_at);
              return (
              <tr key={entry.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-600 whitespace-nowrap">{ts.toLocaleDateString()} {ts.toLocaleTimeString()}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm font-medium text-navy-900">{userName}</p>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Icon className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-navy-900 capitalize">{entry.action}</p>
                      <p className="text-[10px] text-gray-400">{entry.entity_type}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 max-w-[280px]">
                  <p className="text-sm text-gray-500 truncate">{entry.entity_id ? `${entry.entity_type}#${entry.entity_id}` : entry.entity_type}</p>
                </td>
                <td className="px-4 py-4">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono">
                    {entry.ip_address || "—"}
                  </code>
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex px-2.5 py-1 rounded text-[10px] font-bold tracking-wider bg-green-100 text-green-700">LOGGED</span>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-navy-900">{(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalEntries)}</span> of{" "}
            <span className="font-semibold text-navy-900">{totalEntries.toLocaleString()}</span> entries
          </p>
          <div className="flex items-center gap-1">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold ${p === page ? 'bg-navy-900 text-white' : 'border border-gray-200 text-gray-600'}`}>{p}</button>
            ))}
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
