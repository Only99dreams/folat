import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ChevronDown,
  Eye,
  Pencil,
  MoreHorizontal,
  Users,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";

/* ─── Sample Data ─── */
interface Member {
  initials: string;
  initialsColor: string;
  name: string;
  id: string;
  phone: string;
  branch: string;
  group: string;
  financials: string;
  loanLabel: string | null;
  loanAmount: string | null;
  loanStatus: "ACTIVE LOAN" | "NO LOAN" | "OVERDUE" | null;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  joined: string;
}

const members: Member[] = [
  {
    initials: "EM",
    initialsColor: "bg-navy-900 text-white",
    name: "Elizabeth Morgan",
    id: "FL-2024-001",
    phone: "+234 802 345 6789",
    branch: "Main Branch",
    group: "Farmers Group A",
    financials: "₦245,000",
    loanLabel: "Loan:",
    loanAmount: "₦30,000",
    loanStatus: "ACTIVE LOAN",
    status: "ACTIVE",
    joined: "Jan 12, 2024",
  },
  {
    initials: "JO",
    initialsColor: "bg-gray-500 text-white",
    name: "James Okoro",
    id: "FL-2023-892",
    phone: "+234 903 111 2233",
    branch: "North Branch",
    group: "Retail Traders",
    financials: "₦1,200,500",
    loanLabel: "No Loan",
    loanAmount: null,
    loanStatus: "NO LOAN",
    status: "ACTIVE",
    joined: "Nov 05, 2023",
  },
  {
    initials: "AA",
    initialsColor: "bg-gray-400 text-white",
    name: "Aminu Abubakar",
    id: "FL-2023-445",
    phone: "+234 701 999 3000",
    branch: "North Branch",
    group: "Poultry Cluster",
    financials: "₦12,400",
    loanLabel: "Loan:",
    loanAmount: "₦450,000",
    loanStatus: "OVERDUE",
    status: "SUSPENDED",
    joined: "Sep 28, 2023",
  },
  {
    initials: "SM",
    initialsColor: "bg-navy-900 text-white",
    name: "Sarah Mensah",
    id: "FL-2024-112",
    phone: "+234 812 444 5556",
    branch: "Main Branch",
    group: "Micro-Entrepreneurs",
    financials: "₦89,200",
    loanLabel: "Loan:",
    loanAmount: "₦120,000",
    loanStatus: "ACTIVE LOAN",
    status: "ACTIVE",
    joined: "Feb 02, 2024",
  },
  {
    initials: "DC",
    initialsColor: "bg-green-600 text-white",
    name: "David Chen",
    id: "FL-2022-045",
    phone: "+234 809 777 6555",
    branch: "South Sector",
    group: "Individual",
    financials: "₦0",
    loanLabel: "No Loan",
    loanAmount: null,
    loanStatus: "NO LOAN",
    status: "INACTIVE",
    joined: "May 15, 2022",
  },
];

const statusBadge = (status: Member["status"]) => {
  switch (status) {
    case "ACTIVE":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 border border-green-200">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          ACTIVE
        </span>
      );
    case "INACTIVE":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-500 border border-gray-200">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
          INACTIVE
        </span>
      );
    case "SUSPENDED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          SUSPENDED
        </span>
      );
  }
};

const loanStatusBadge = (loanStatus: Member["loanStatus"]) => {
  switch (loanStatus) {
    case "ACTIVE LOAN":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 border border-green-200">
          ACTIVE LOAN
        </span>
      );
    case "NO LOAN":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-500 border border-gray-200">
          NO LOAN
        </span>
      );
    case "OVERDUE":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-600 border border-orange-200">
          OVERDUE
        </span>
      );
    default:
      return null;
  }
};

export default function MembersPage() {
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("All Branches");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [loanFilter, setLoanFilter] = useState("All Loans");
  const [currentPage, setCurrentPage] = useState(1);

  const totalMembers = 12548;
  const perPage = 20;
  const totalPages = 628;

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Members</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage cooperative members and external loan customers efficiently.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/members/add-cooperative"
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
          >
            <Users className="w-4 h-4" />
            Add Cooperative Member
          </Link>
          <Link
            to="/members/add-external"
            className="flex items-center gap-2 px-4 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add External Customer
          </Link>
        </div>
      </div>

      {/* ─── Filters ─── */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div>
            <label className="block text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search member name, ID, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
              />
            </div>
          </div>

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
                <option>Main Branch</option>
                <option>North Branch</option>
                <option>South Sector</option>
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
                <option>All Statuses</option>
                <option>Active</option>
                <option>Inactive</option>
                <option>Suspended</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Loan Status */}
          <div>
            <label className="block text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-2">
              Loan Status
            </label>
            <div className="relative">
              <select
                value={loanFilter}
                onChange={(e) => setLoanFilter(e.target.value)}
                className="w-full appearance-none px-3 py-2.5 pr-8 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 bg-white"
              >
                <option>All Loans</option>
                <option>Active Loan</option>
                <option>No Loan</option>
                <option>Overdue</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Registration Date */}
          <div>
            <label className="block text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-2">
              Registration Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Date Range"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
              />
            </div>
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
                  Member
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  ID / Phone
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Branch / Group
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Financials
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">
                  Loan Status
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">
                  Status
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Joined
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  {/* Member */}
                  <td className="px-5 py-5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${m.initialsColor}`}
                      >
                        {m.initials}
                      </div>
                      <span className="text-sm font-semibold text-navy-900">
                        {m.name}
                      </span>
                    </div>
                  </td>

                  {/* ID / Phone */}
                  <td className="px-4 py-5">
                    <p className="text-sm font-semibold text-navy-900">
                      {m.id}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{m.phone}</p>
                  </td>

                  {/* Branch / Group */}
                  <td className="px-4 py-5">
                    <p className="text-sm font-medium text-navy-900">
                      {m.branch}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{m.group}</p>
                  </td>

                  {/* Financials */}
                  <td className="px-4 py-5">
                    <p className="text-sm font-bold text-navy-900">
                      {m.financials}
                    </p>
                    {m.loanLabel && (
                      <p className="text-xs mt-0.5">
                        <span
                          className={
                            m.loanStatus === "OVERDUE"
                              ? "text-red-500"
                              : "text-gray-400"
                          }
                        >
                          {m.loanLabel}
                        </span>
                        {m.loanAmount && (
                          <span
                            className={
                              m.loanStatus === "OVERDUE"
                                ? "text-red-500 font-semibold"
                                : "text-gray-500"
                            }
                          >
                            {" "}
                            {m.loanAmount}
                          </span>
                        )}
                      </p>
                    )}
                  </td>

                  {/* Loan Status */}
                  <td className="px-4 py-5 text-center">
                    {loanStatusBadge(m.loanStatus)}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-5 text-center">
                    {statusBadge(m.status)}
                  </td>

                  {/* Joined */}
                  <td className="px-4 py-5">
                    <p className="text-sm text-gray-600">{m.joined}</p>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-5">
                    <div className="flex items-center justify-center gap-1">
                      <Link
                        to={`/members/${m.id.toLowerCase()}`}
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
                        title="More"
                        className="p-2 text-gray-400 hover:text-navy-900 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
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
              {Math.min(currentPage * perPage, totalMembers)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-green-600">
              {totalMembers.toLocaleString()}
            </span>{" "}
            members
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

            <span className="px-1 text-gray-400 text-sm">…</span>

            <button
              onClick={() => setCurrentPage(totalPages)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                currentPage === totalPages
                  ? "bg-navy-900 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {totalPages}
            </button>

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
