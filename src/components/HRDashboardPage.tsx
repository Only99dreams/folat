import { Link } from "react-router-dom";
import {
  Download,
  Plus,
  Users,
  UserCheck,
  UserX,
  Clock,
  Briefcase,
  UserPlus,
  List,
  FileText,
  CalendarCheck,
  DollarSign,
  ChevronDown,
} from "lucide-react";

/* ─── Activity Data ─── */
interface Activity {
  date: string;
  time: string;
  staffName: string;
  activity: string;
  activityColor: string;
  branch: string;
  performedBy: string;
}

const activities: Activity[] = [
  {
    date: "Oct 24,",
    time: "09:15 AM",
    staffName: "Sarah Jenkins",
    activity: "CLOCK IN",
    activityColor: "bg-green-600 text-white",
    branch: "Lagos HQ",
    performedBy: "System",
  },
  {
    date: "Oct 24,",
    time: "08:45 AM",
    staffName: "David Miller",
    activity: "LEAVE APPROVED",
    activityColor: "bg-blue-600 text-white",
    branch: "Abuja Branch",
    performedBy: "M. Adams",
  },
  {
    date: "Oct 23,",
    time: "04:30 PM",
    staffName: "Grace Ibeh",
    activity: "UPDATE INFO",
    activityColor: "bg-amber-500 text-white",
    branch: "Ibadan Hub",
    performedBy: "Admin",
  },
  {
    date: "Oct 23,",
    time: "11:20 AM",
    staffName: "John Doe",
    activity: "SALARY PAID",
    activityColor: "bg-green-600 text-white",
    branch: "Lagos HQ",
    performedBy: "Finance",
  },
];

/* ─── Branch Performance ─── */
const branchPerformance = [
  { name: "Lagos Headquarters", attendance: 94, color: "bg-green-500" },
  { name: "Abuja Office", attendance: 88, color: "bg-blue-500" },
  { name: "Ibadan Regional", attendance: 76, color: "bg-amber-500" },
];

/* ─── Upcoming Leaves ─── */
const upcomingLeaves = [
  {
    initials: "MA",
    bgColor: "bg-blue-600",
    name: "Marcus Aurelius",
    type: "Annual Leave",
    detail: "Starts tomorrow",
  },
  {
    initials: "SO",
    bgColor: "bg-amber-500",
    name: "Sandra Oh",
    type: "Sick Leave",
    detail: "Till Oct 30",
  },
];

export default function HRDashboardPage() {
  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">HR Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor staff activities, attendance, and HR operations across
            branches
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export Report
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <Link to="/hr/staff/add" className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors">
            <Plus className="w-4 h-4" />
            Add Staff
          </Link>
        </div>
      </div>

      {/* ─── Stat Cards ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Staff */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
              +2.4%
            </span>
          </div>
          <p className="text-xs text-gray-400 font-medium">Total Staff</p>
          <p className="text-2xl font-bold text-navy-900">85</p>
        </div>

        {/* Present Today */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-[10px] font-medium text-gray-400">
              Today
            </span>
          </div>
          <p className="text-xs text-gray-400 font-medium">Present Today</p>
          <p className="text-2xl font-bold text-navy-900">72</p>
        </div>

        {/* Absent Today */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
              <UserX className="w-4 h-4 text-red-500" />
            </div>
            <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
              -12%
            </span>
          </div>
          <p className="text-xs text-gray-400 font-medium">Absent Today</p>
          <p className="text-2xl font-bold text-navy-900">13</p>
        </div>

        {/* Pending Leaves */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          </div>
          <p className="text-xs text-gray-400 font-medium">Pending Leaves</p>
          <p className="text-2xl font-bold text-navy-900">6</p>
        </div>

        {/* Active Managers */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-gray-500" />
            </div>
          </div>
          <p className="text-xs text-gray-400 font-medium">Active Managers</p>
          <p className="text-2xl font-bold text-navy-900">12</p>
        </div>
      </div>

      {/* ─── Main Content: Activities + Sidebar ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Staff Activities */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-5">
            <h2 className="text-lg font-bold text-navy-900">
              Recent Staff Activities
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                    Date
                  </th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                    Staff Name
                  </th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                    Activity
                  </th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                    Branch
                  </th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                    Performed By
                  </th>
                </tr>
              </thead>
              <tbody>
                {activities.map((act, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{act.date}</p>
                      <p className="text-xs text-gray-400">{act.time}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-navy-900">
                        {act.staffName}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded text-[9px] font-bold tracking-wider ${act.activityColor}`}
                      >
                        {act.activity}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600">{act.branch}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600">
                        {act.performedBy}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── Right Sidebar ─── */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-navy-900 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Settings2Icon />
              <h2 className="text-base font-bold text-white">Quick Actions</h2>
            </div>

            <div className="space-y-1">
              {[
                {
                  icon: UserPlus,
                  label: "Add New Staff",
                  notify: false,
                  to: "/hr/staff/add",
                },
                {
                  icon: List,
                  label: "View Staff List",
                  notify: false,
                  to: "/hr/staff",
                },
                {
                  icon: FileText,
                  label: "Review Leave Requests",
                  notify: true,
                  to: "/hr/leave-requests",
                },
                {
                  icon: CalendarCheck,
                  label: "View Attendance Logs",
                  notify: false,
                  to: "/hr/attendance",
                },
                {
                  icon: DollarSign,
                  label: "Manage Salaries",
                  notify: false,
                  to: "/hr/salary-structure",
                },
              ].map((action, i) => (
                <Link
                  key={i}
                  to={action.to || "#"}
                  className="w-full flex items-center justify-between py-3 px-3 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <action.icon className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-white font-medium">
                      {action.label}
                    </span>
                  </div>
                  {action.notify && (
                    <span className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-bold text-white">
                      3
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Branch Performance */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-base font-bold text-navy-900 mb-5">
              Branch Performance
            </h2>

            <div className="space-y-4">
              {branchPerformance.map((branch, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-medium text-navy-900">
                      {branch.name}
                    </p>
                    <p className="text-xs font-semibold text-green-600">
                      {branch.attendance}% Attendance
                    </p>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${branch.color}`}
                      style={{ width: `${branch.attendance}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-5 py-2.5 border border-gray-200 rounded-full text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
              View Detailed Branch Report
            </button>
          </div>

          {/* Upcoming Leaves */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-base font-bold text-navy-900 mb-5">
              Upcoming Leaves
            </h2>

            <div className="space-y-4">
              {upcomingLeaves.map((leave, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${leave.bgColor}`}
                  >
                    {leave.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy-900">
                      {leave.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {leave.type} · {leave.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Small gear/settings icon for Quick Actions header */
function Settings2Icon() {
  return (
    <svg
      className="w-5 h-5 text-white"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}
