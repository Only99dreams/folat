import { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Calendar,
  BarChart3,
  TrendingUp,
  Users,
  Wallet,
  Building2,
  ChevronDown,
  RefreshCcw,
  Eye,
  Printer,
  Loader2,
} from "lucide-react";
import {
  fetchDashboardStats,
  fetchMembers,
  fetchLoanApplications,
  fetchSavingsTransactions,
  fetchFinanceTransactions,
  fetchBranches,
} from "../lib/db";

/* ─── Report Types ─── */
interface ReportType {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ElementType;
  lastGenerated: string;
}

const reportTypes: ReportType[] = [
  {
    id: "1",
    name: "Financial Summary",
    description: "Comprehensive overview of income, expenses, and net position",
    category: "Financial",
    icon: TrendingUp,
    lastGenerated: "—",
  },
  {
    id: "2",
    name: "Membership Report",
    description: "Detailed member registration, demographics, and status analysis",
    category: "Membership",
    icon: Users,
    lastGenerated: "—",
  },
  {
    id: "3",
    name: "Loan Portfolio Report",
    description: "Active loans, repayments, overdue tracking, and risk analysis",
    category: "Loans",
    icon: Wallet,
    lastGenerated: "—",
  },
  {
    id: "4",
    name: "Savings Summary",
    description: "Total deposits, withdrawals, and savings growth across all products",
    category: "Savings",
    icon: BarChart3,
    lastGenerated: "—",
  },
  {
    id: "5",
    name: "Branch Performance",
    description: "Comparative analysis of all branches - collections, membership, and growth",
    category: "Branches",
    icon: Building2,
    lastGenerated: "—",
  },
  {
    id: "6",
    name: "Monthly Statement",
    description: "Complete monthly transactional statement for regulatory compliance",
    category: "Financial",
    icon: FileText,
    lastGenerated: "—",
  },
];

const recentReports: { name: string; type: string; size: string; date: string; generatedBy: string }[] = [];

export default function ReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [generating, setGenerating] = useState<string | null>(null);
  const [generatedReports, setGeneratedReports] = useState<typeof recentReports>([]);
  const [stats, setStats] = useState({ totalMembers: 0, activeLoans: 0, totalSavings: 0, totalBranches: 0 });
  const [loading, setLoading] = useState(true);
  const categories = ["All", "Financial", "Membership", "Loans", "Savings", "Branches"];

  useEffect(() => {
    (async () => {
      try {
        const ds = await fetchDashboardStats();
        setStats(ds as any);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const handleGenerate = async (reportId: string, reportName: string) => {
    setGenerating(reportId);
    try {
      let csvContent = "";
      let rows: string[][] = [];
      if (reportId === "1" || reportId === "6") {
        const { data } = await fetchFinanceTransactions({ page: 1, pageSize: 500 });
        rows = [["Date", "Type", "Category", "Description", "Amount", "Branch"]];
        data.forEach((t: any) => rows.push([t.date, t.type, t.category, t.description, t.amount, t.branch?.name || ""]));
      } else if (reportId === "2") {
        const { data } = await fetchMembers({ page: 1, pageSize: 500 });
        rows = [["Member ID", "First Name", "Last Name", "Email", "Phone", "Status", "Type", "Created"]];
        data.forEach((m: any) => rows.push([m.member_id, m.first_name, m.last_name, m.email || "", m.phone || "", m.status, m.member_type || "", m.created_at]));
      } else if (reportId === "3") {
        const { data } = await fetchLoanApplications({ page: 1, pageSize: 500 });
        rows = [["Loan ID", "Member", "Amount Requested", "Amount Approved", "Status", "Type", "Created"]];
        data.forEach((l: any) => rows.push([l.loan_id || "", l.member ? `${l.member.first_name} ${l.member.last_name}` : "", l.amount_requested, l.amount_approved || "", l.status, l.loan_type || "", l.created_at]));
      } else if (reportId === "4") {
        const { data } = await fetchSavingsTransactions({ page: 1, pageSize: 500 });
        rows = [["Transaction ID", "Member", "Type", "Amount", "Date"]];
        data.forEach((t: any) => rows.push([t.transaction_id || "", t.member ? `${t.member.first_name} ${t.member.last_name}` : "", t.type, t.amount, t.created_at]));
      } else if (reportId === "5") {
        const branches = await fetchBranches();
        rows = [["Branch Name", "Code", "Location", "Manager", "Status"]];
        branches.forEach((b: any) => rows.push([b.name, b.code || "", b.location || "", b.manager?.full_name || "", b.status]));
      }
      csvContent = rows.map(r => r.map(c => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportName.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setGeneratedReports(prev => [{ name: `${reportName} - ${new Date().toLocaleDateString()}`, type: "CSV", size: `${(csvContent.length / 1024).toFixed(0)} KB`, date: new Date().toLocaleDateString(), generatedBy: "You" }, ...prev]);
    } catch (e) { console.error(e); }
    setGenerating(null);
  };

  const filtered =
    selectedCategory === "All"
      ? reportTypes
      : reportTypes.filter((r) => r.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">
            Generate, view, and download reports across all modules.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            {new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString("en-NG", { month: "short", day: "numeric" })} – {new Date().toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* ─── Stats ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-green-600" />
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Total Members</p>
          </div>
          <p className="text-2xl font-bold text-navy-900">{loading ? "—" : stats.totalMembers}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-blue-600" />
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Active Loans</p>
          </div>
          <p className="text-2xl font-bold text-navy-900">{loading ? "—" : stats.activeLoans}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Total Savings</p>
          </div>
          <p className="text-2xl font-bold text-navy-900">{loading ? "—" : `₦ ${stats.totalSavings.toLocaleString()}`}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-purple-600" />
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Branches</p>
          </div>
          <p className="text-2xl font-bold text-navy-900">{loading ? "—" : stats.totalBranches}</p>
        </div>
      </div>

      {/* ─── Report Types Grid ─── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-[11px] tracking-[0.12em] uppercase font-bold text-navy-900">
            Generate Report
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedCategory === cat
                    ? "bg-navy-900 text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          {filtered.map((report) => (
            <div
              key={report.id}
              className="border border-gray-100 rounded-xl p-5 hover:shadow-md hover:border-green-200 transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                  <report.icon className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-navy-900 group-hover:text-green-600 transition-colors">
                    {report.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{report.description}</p>
                  <p className="text-[10px] text-gray-400 mt-2">
                    Last generated: {report.lastGenerated}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => handleGenerate(report.id, report.name)}
                  disabled={generating === report.id}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {generating === report.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BarChart3 className="w-3.5 h-3.5" />}
                  {generating === report.id ? "Generating..." : "Generate"}
                </button>
                <button
                  onClick={() => handleGenerate(report.id, report.name)}
                  disabled={generating === report.id}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-navy-900 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Recent Reports ─── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-[11px] tracking-[0.12em] uppercase font-bold text-navy-900">
            Recently Generated Reports
          </h2>
          <button className="text-sm text-green-600 font-semibold hover:text-green-700">
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-6 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Report Name</th>
              <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Type</th>
              <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Size</th>
              <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Date</th>
              <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Generated By</th>
              <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {generatedReports.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400 text-sm">No reports generated yet. Click "Generate" above to create one.</td></tr>
            ) : generatedReports.map((r, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-red-500" />
                    </div>
                    <p className="text-sm font-medium text-navy-900">{r.name}</p>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider ${
                      r.type === "PDF" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"
                    }`}
                  >
                    {r.type}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-500">{r.size}</td>
                <td className="px-4 py-4 text-sm text-gray-500">{r.date}</td>
                <td className="px-4 py-4 text-sm text-gray-500">{r.generatedBy}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                      <Eye className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                      <Download className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                      <Printer className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
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
