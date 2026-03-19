import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  UserX,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* ─── Staff Data ─── */
interface Staff {
  name: string;
  role: string;
  roleBg: string;
  branch: string;
  phone: string;
  status: "Active" | "Suspended" | "Resigned";
  dateJoined: string;
}

const staffList: Staff[] = [
  {
    name: "John Doe",
    role: "Admin",
    roleBg: "bg-blue-600 text-white",
    branch: "Main Branch",
    phone: "+234 801 234 5678",
    status: "Active",
    dateJoined: "Jan 12, 2022",
  },
  {
    name: "Jane Smith",
    role: "Loan Officer",
    roleBg: "bg-blue-600 text-white",
    branch: "Lagos West",
    phone: "+234 802 345 6789",
    status: "Suspended",
    dateJoined: "Mar 05, 2022",
  },
  {
    name: "Robert Brown",
    role: "Accountant",
    roleBg: "bg-blue-600 text-white",
    branch: "Abuja Central",
    phone: "+234 803 456 7890",
    status: "Active",
    dateJoined: "Jun 20, 2021",
  },
  {
    name: "Alice Johnson",
    role: "HR Manager",
    roleBg: "bg-navy-900 text-white",
    branch: "Main Branch",
    phone: "+234 805 567 8901",
    status: "Resigned",
    dateJoined: "May 15, 2020",
  },
  {
    name: "Mark Williams",
    role: "Branch Manager",
    roleBg: "bg-green-600 text-white",
    branch: "Lagos West",
    phone: "+234 806 678 9012",
    status: "Active",
    dateJoined: "Oct 02, 2021",
  },
];

const statusDot = (status: Staff["status"]) => {
  const colors: Record<string, string> = {
    Active: "text-green-500",
    Suspended: "text-amber-500",
    Resigned: "text-red-500",
  };
  return (
    <div className="flex items-center gap-1.5">
      <span className={`text-lg leading-none ${colors[status]}`}>•</span>
      <span className="text-sm text-gray-700">{status}</span>
    </div>
  );
};

export default function StaffListPage() {
  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">
            Staff Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View and manage staff across all branches
          </p>
        </div>
        <Link to="/hr/staff/add" className="flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition-colors">
          <Plus className="w-4 h-4" />
          Add New Staff
        </Link>
      </div>

      {/* ─── Table Card ─── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* Search & Filters */}
        <div className="px-4 sm:px-6 py-5 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Name, ID, Email, or Phone"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <select className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none min-w-[140px]">
            <option>All Branches</option>
            <option>Main Branch</option>
            <option>Lagos West</option>
            <option>Abuja Central</option>
          </select>
          <select className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none min-w-[120px]">
            <option>All Roles</option>
            <option>Admin</option>
            <option>Loan Officer</option>
            <option>Accountant</option>
            <option>HR Manager</option>
            <option>Branch Manager</option>
          </select>
          <select className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none min-w-[140px]">
            <option>Status: Active</option>
            <option>Status: Suspended</option>
            <option>Status: Resigned</option>
            <option>All Statuses</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-t border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Name
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Role
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Branch
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Phone
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Status
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Date Joined
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((staff, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  {/* Name */}
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-navy-900">
                      {staff.name}
                    </p>
                  </td>

                  {/* Role */}
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded text-[10px] font-bold tracking-wider ${staff.roleBg}`}
                    >
                      {staff.role}
                    </span>
                  </td>

                  {/* Branch */}
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-600">{staff.branch}</p>
                  </td>

                  {/* Phone */}
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-600">{staff.phone}</p>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">{statusDot(staff.status)}</td>

                  {/* Date Joined */}
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-600">{staff.dateJoined}</p>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/hr/staff/${i + 1}`} className="p-1.5 text-gray-400 hover:text-navy-900 transition-colors">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button className="p-1.5 text-gray-400 hover:text-navy-900 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                        <UserX className="w-4 h-4" />
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
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-semibold text-navy-900">1 to 20</span> of{" "}
            <span className="font-semibold text-navy-900">85</span> staff
          </p>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-navy-900 text-white text-sm font-semibold">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors">
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors">
              3
            </button>
            <span className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">
              …
            </span>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors">
              5
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
