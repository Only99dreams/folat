import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Download,
  Plus,
  Eye,
  Pencil,
  Ban,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Building2,
} from "lucide-react";

/* ─── Mock data ─── */
const branches = [
  {
    name: "Lagos Headquarters",
    code: "LAG-001",
    location: "Victoria Island, Lagos",
    manager: "Babatunde O.",
    managerInitials: "BO",
    members: 1240,
    savings: "₦45.2M",
    activeLoans: 124,
    staff: 24,
    status: "Active" as const,
  },
  {
    name: "Abuja Central",
    code: "ABJ-004",
    location: "Wuse II, Abuja",
    manager: "Chioma A.",
    managerInitials: "CA",
    members: 856,
    savings: "₦22.8M",
    activeLoans: 92,
    staff: 12,
    status: "Active" as const,
  },
  {
    name: "Ibadan North",
    code: "IBD-012",
    location: "Bodija, Ibadan",
    manager: "Samuel L.",
    managerInitials: "SL",
    members: 312,
    savings: "₦5.4M",
    activeLoans: 15,
    staff: 4,
    status: "Inactive" as const,
  },
];

export default function BranchesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage] = useState(1);

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Branches</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage all cooperative branches, view performance, and assign staff.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <Link to="/branches/add" className="flex items-center gap-2 px-4 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition-colors">
            <Plus className="w-4 h-4" />
            Add Branch
          </Link>
        </div>
      </div>

      {/* ─── Filters ─── */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-2">
              Search Branch
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Branch name or code..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-navy-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-2">
              Location
            </label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-navy-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="all">All Regions</option>
              <option value="lagos">Lagos</option>
              <option value="abuja">Abuja</option>
              <option value="ibadan">Ibadan</option>
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-2">
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-navy-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="headquarters">Headquarters</option>
              <option value="regional">Regional</option>
              <option value="satellite">Satellite</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── Table ─── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold border-b border-gray-100">
                <th className="px-6 py-4">Branch Details</th>
                <th className="px-4 py-4">Location</th>
                <th className="px-4 py-4">Manager</th>
                <th className="px-4 py-4 text-center">Metrics</th>
                <th className="px-4 py-4 text-center">Staff</th>
                <th className="px-4 py-4 text-center">Status</th>
                <th className="px-4 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((branch, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                >
                  {/* Branch Details */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-navy-900" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-navy-900">
                          {branch.name}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          CODE: {branch.code}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="px-4 py-5 text-sm text-gray-500">
                    {branch.location}
                  </td>

                  {/* Manager */}
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {branch.managerInitials}
                      </span>
                      <span className="text-sm font-medium text-navy-900">
                        {branch.manager}
                      </span>
                    </div>
                  </td>

                  {/* Metrics */}
                  <td className="px-4 py-5 text-center">
                    <p className="text-sm font-bold text-navy-900">
                      {branch.members.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-gray-400">Members</p>
                    <p className="text-xs font-semibold text-green-600 mt-1">
                      {branch.savings}
                    </p>
                    <p className="text-[10px] text-green-500">Savings</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {branch.activeLoans} Active Loans
                    </p>
                  </td>

                  {/* Staff */}
                  <td className="px-4 py-5 text-center">
                    <p className="text-sm font-bold text-navy-900">
                      {branch.staff}
                    </p>
                    <p className="text-[10px] text-gray-400">Staff</p>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-5 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        branch.status === "Active"
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          branch.status === "Active"
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      />
                      {branch.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-5">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        to={`/branches/${branch.code.toLowerCase()}`}
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
                      <button
                        title={
                          branch.status === "Active" ? "Deactivate" : "Activate"
                        }
                        className="p-2 text-gray-400 hover:text-navy-900 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {branch.status === "Active" ? (
                          <Ban className="w-4 h-4" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
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
          <p className="text-sm text-green-600">
            Showing 1 to 3 of 12 branches
          </p>
          <div className="flex items-center gap-1">
            <button className="p-2 text-gray-400 hover:text-navy-900 rounded-lg transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                  page === currentPage
                    ? "bg-navy-900 text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}
            <button className="p-2 text-gray-400 hover:text-navy-900 rounded-lg transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
