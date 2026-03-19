import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  Eye,
  Pencil,
  RefreshCw,
  Ban,
  SlidersHorizontal,
} from "lucide-react";

/* ─── Sample Data ─── */
interface Group {
  name: string;
  code: string;
  id: string;
  branch: string;
  leaderName: string;
  subLeaderName: string;
  members: number;
  savings: string;
  loans: string;
  status: "ACTIVE" | "INACTIVE";
  created: string;
}

const groups: Group[] = [
  {
    name: "Unity Savings Group",
    code: "USGP",
    id: "2024 - 001",
    branch: "Main HQ",
    leaderName: "Michael Chen",
    subLeaderName: "Sarah Johnson",
    members: 42,
    savings: "$124,500.00",
    loans: "$45,200.00",
    status: "ACTIVE",
    created: "Jan 12, 2024",
  },
  {
    name: "Blue Horizon Trust",
    code: "CBHT",
    id: "2024 - 006",
    branch: "East Region",
    leaderName: "Robert Wilson",
    subLeaderName: "Maria Garcia",
    members: 18,
    savings: "$56,000.00",
    loans: "$12,000.00",
    status: "ACTIVE",
    created: "Feb 05, 2024",
  },
  {
    name: "Legacy Farmers",
    code: "AGRF",
    id: "2023 - 114",
    branch: "West Region",
    leaderName: "David Osei",
    subLeaderName: "Amara Okafor",
    members: 55,
    savings: "$0.00",
    loans: "$0.00",
    status: "INACTIVE",
    created: "Nov 20, 2023",
  },
  {
    name: "Sunshine Women",
    code: "CSWC",
    id: "2024 - 015",
    branch: "Main HQ",
    leaderName: "Alice Thompson",
    subLeaderName: "Grace Kim",
    members: 12,
    savings: "$32,100.00",
    loans: "$8,500.00",
    status: "ACTIVE",
    created: "Mar 01, 2024",
  },
];

export default function GroupsPage() {
  const [branchFilter, setBranchFilter] = useState("All Branches");
  const [statusFilter, setStatusFilter] = useState("Active");
  const [leaderFilter, setLeaderFilter] = useState("Any Leader");
  const [sizeFilter, setSizeFilter] = useState("All Sizes");
  const [currentPage, setCurrentPage] = useState(1);

  const totalGroups = 24;
  const perPage = 4;
  const totalPages = 3;

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Groups</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage cooperative groups, assign leaders, and monitor group
            activity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <Link
            to="/groups/add"
            className="flex items-center gap-2 px-4 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Group
          </Link>
        </div>
      </div>

      {/* ─── Stats Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Groups */}
        <div className="bg-green-600 rounded-xl p-5 text-white">
          <p className="text-[10px] tracking-[0.1em] uppercase font-semibold text-green-200">
            Total Groups
          </p>
          <p className="text-3xl font-bold mt-1">24</p>
        </div>

        {/* Total Savings */}
        <div className="bg-green-600 rounded-xl p-5 text-white">
          <p className="text-[10px] tracking-[0.1em] uppercase font-semibold text-green-200">
            Total Savings
          </p>
          <p className="text-3xl font-bold mt-1">₦1.2M</p>
        </div>

        {/* Active Loans */}
        <div className="bg-orange-500 rounded-xl p-5 text-white">
          <p className="text-[10px] tracking-[0.1em] uppercase font-semibold text-orange-200">
            Active Loans
          </p>
          <p className="text-3xl font-bold mt-1">₦452K</p>
        </div>

        {/* Total Members */}
        <div className="bg-navy-900 rounded-xl p-5 text-white">
          <p className="text-[10px] tracking-[0.1em] uppercase font-semibold text-navy-300">
            Total Members
          </p>
          <p className="text-3xl font-bold mt-1">1,248</p>
        </div>
      </div>

      {/* ─── Filters ─── */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          {/* Branch */}
          <div>
            <label className="block text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-2">
              Branch
            </label>
            <div className="relative">
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="w-full appearance-none px-3 py-2.5 pr-8 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 bg-white"
              >
                <option>All Branches</option>
                <option>Main HQ</option>
                <option>East Region</option>
                <option>West Region</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-2">
              Status
            </label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none px-3 py-2.5 pr-8 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 bg-white"
              >
                <option>Active</option>
                <option>Inactive</option>
                <option>All</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Leader */}
          <div>
            <label className="block text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-2">
              Leader
            </label>
            <div className="relative">
              <select
                value={leaderFilter}
                onChange={(e) => setLeaderFilter(e.target.value)}
                className="w-full appearance-none px-3 py-2.5 pr-8 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 bg-white"
              >
                <option>Any Leader</option>
                <option>Michael Chen</option>
                <option>Robert Wilson</option>
                <option>David Osei</option>
                <option>Alice Thompson</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Group Size */}
          <div>
            <label className="block text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-2">
              Group Size
            </label>
            <div className="relative">
              <select
                value={sizeFilter}
                onChange={(e) => setSizeFilter(e.target.value)}
                className="w-full appearance-none px-3 py-2.5 pr-8 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 bg-white"
              >
                <option>All Sizes</option>
                <option>1-10</option>
                <option>11-25</option>
                <option>26-50</option>
                <option>50+</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Filter Icon */}
          <div>
            <button className="p-2.5 border border-gray-200 rounded-lg text-gray-400 hover:text-navy-900 hover:bg-gray-50 transition-colors">
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Table ─── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Group Name & ID
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Branch
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Leaders
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">
                  Members
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Financials
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">
                  Status
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Created
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  {/* Group Name & ID */}
                  <td className="px-5 py-5">
                    <p className="text-sm font-semibold text-navy-900">
                      {g.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      <span className="font-medium text-gray-500">
                        {g.code}
                      </span>
                    </p>
                    <p className="text-[11px] text-gray-400">{g.id}</p>
                  </td>

                  {/* Branch */}
                  <td className="px-4 py-5">
                    <p className="text-sm text-navy-900">{g.branch}</p>
                  </td>

                  {/* Leaders */}
                  <td className="px-4 py-5">
                    <p className="text-sm text-navy-900">
                      <span className="text-gray-400">L:</span> {g.leaderName}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      <span>S:</span> {g.subLeaderName}
                    </p>
                  </td>

                  {/* Members */}
                  <td className="px-4 py-5 text-center">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-navy-50 text-sm font-bold text-navy-900">
                      {g.members}
                    </span>
                  </td>

                  {/* Financials */}
                  <td className="px-4 py-5">
                    <p className="text-xs">
                      <span className="text-green-600 font-medium">S:</span>{" "}
                      <span className="text-green-600 font-semibold">
                        {g.savings}
                      </span>
                    </p>
                    <p className="text-xs mt-0.5">
                      <span className="text-orange-500 font-medium">L:</span>{" "}
                      <span className="text-orange-500 font-semibold">
                        {g.loans}
                      </span>
                    </p>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-5 text-center">
                    {g.status === "ACTIVE" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 border border-green-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        ACTIVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        INACTIVE
                      </span>
                    )}
                  </td>

                  {/* Created */}
                  <td className="px-4 py-5">
                    <p className="text-sm text-gray-600">{g.created}</p>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-5">
                    <div className="flex items-center justify-center gap-1">
                      <Link
                        to={`/groups/${g.id.replace(/\s/g, "")}`}
                        title="View"
                        className="p-2 text-gray-400 hover:text-navy-900 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        title="Edit"
                        className="p-2 text-gray-400 hover:text-navy-900 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {g.status === "ACTIVE" ? (
                        <button
                          title="Deactivate"
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          title="Reactivate"
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ─── Pagination ─── */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-medium text-navy-900">
              {(currentPage - 1) * perPage + 1}-
              {Math.min(currentPage * perPage, totalGroups)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-green-600">
              {totalGroups}
            </span>{" "}
            groups
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {[1, 2, 3].map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === p
                    ? "bg-navy-900 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
