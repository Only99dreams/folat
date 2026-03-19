import { useState } from "react";
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
} from "lucide-react";

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
    lastGenerated: "Oct 24, 2023",
  },
  {
    id: "2",
    name: "Membership Report",
    description: "Detailed member registration, demographics, and status analysis",
    category: "Membership",
    icon: Users,
    lastGenerated: "Oct 22, 2023",
  },
  {
    id: "3",
    name: "Loan Portfolio Report",
    description: "Active loans, repayments, overdue tracking, and risk analysis",
    category: "Loans",
    icon: Wallet,
    lastGenerated: "Oct 23, 2023",
  },
  {
    id: "4",
    name: "Savings Summary",
    description: "Total deposits, withdrawals, and savings growth across all products",
    category: "Savings",
    icon: BarChart3,
    lastGenerated: "Oct 21, 2023",
  },
  {
    id: "5",
    name: "Branch Performance",
    description: "Comparative analysis of all branches - collections, membership, and growth",
    category: "Branches",
    icon: Building2,
    lastGenerated: "Oct 20, 2023",
  },
  {
    id: "6",
    name: "Monthly Statement",
    description: "Complete monthly transactional statement for regulatory compliance",
    category: "Financial",
    icon: FileText,
    lastGenerated: "Oct 19, 2023",
  },
];

const recentReports = [
  { name: "Financial Summary - October 2023", type: "PDF", size: "2.4 MB", date: "Oct 24, 2023", generatedBy: "Admin" },
  { name: "Loan Portfolio Q3 Report", type: "Excel", size: "1.8 MB", date: "Oct 23, 2023", generatedBy: "Finance Dept" },
  { name: "Membership Growth Report", type: "PDF", size: "960 KB", date: "Oct 22, 2023", generatedBy: "Admin" },
  { name: "Branch Performance - September", type: "PDF", size: "1.2 MB", date: "Oct 20, 2023", generatedBy: "Admin" },
  { name: "Savings Analysis 2023", type: "Excel", size: "3.1 MB", date: "Oct 19, 2023", generatedBy: "Finance Dept" },
];

export default function ReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const categories = ["All", "Financial", "Membership", "Loans", "Savings", "Branches"];

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
            Oct 1 – Oct 24, 2023
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* ─── Stats ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-green-600" />
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Reports Generated</p>
          </div>
          <p className="text-2xl font-bold text-navy-900">148</p>
          <p className="text-xs text-green-600 font-medium mt-1">This Month</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Download className="w-4 h-4 text-blue-600" />
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Downloads</p>
          </div>
          <p className="text-2xl font-bold text-navy-900">312</p>
          <p className="text-xs text-blue-600 font-medium mt-1">All Time</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCcw className="w-4 h-4 text-amber-500" />
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Scheduled</p>
          </div>
          <p className="text-2xl font-bold text-navy-900">8</p>
          <p className="text-xs text-amber-500 font-medium mt-1">Auto-generated</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-purple-600" />
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Report Types</p>
          </div>
          <p className="text-2xl font-bold text-navy-900">6</p>
          <p className="text-xs text-gray-400 font-medium mt-1">Available</p>
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
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors">
                  <BarChart3 className="w-3.5 h-3.5" />
                  Generate
                </button>
                <button className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-navy-900 hover:bg-gray-50 transition-colors">
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
            {recentReports.map((r, i) => (
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
