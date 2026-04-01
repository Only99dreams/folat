import { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { fetchStaff, fetchLeaveRequests, fetchAttendance, fetchBranches } from "../lib/db";

export default function HRDashboardPage() {
  const [totalStaff, setTotalStaff] = useState(0);
  const [presentToday, setPresentToday] = useState(0);
  const [absentToday, setAbsentToday] = useState(0);
  const [managerCount, setManagerCount] = useState(0);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [upcomingLeaves, setUpcomingLeaves] = useState<any[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<any[]>([]);
  const [branchPerformance, setBranchPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [staff, leaves, approved, attendance, branches] = await Promise.all([
          fetchStaff(),
          fetchLeaveRequests({ status: "pending" }),
          fetchLeaveRequests({ status: "approved" }),
          fetchAttendance(),
          fetchBranches(),
        ]);
        setTotalStaff(staff.length);
        setManagerCount(staff.filter((s: any) => (s.role || s.position || '').toLowerCase().includes('manager')).length);
        setPendingLeaves(leaves.length);
        setUpcomingLeaves(approved.slice(0, 3));

        // Today's attendance
        const today = new Date().toISOString().split('T')[0];
        const todayRecords = attendance.filter((a: any) => a.date === today || a.created_at?.startsWith(today));
        const presentIds = new Set(todayRecords.filter((a: any) => a.status === 'present' || a.clock_in).map((a: any) => a.staff_id));
        setPresentToday(presentIds.size);
        setAbsentToday(Math.max(0, staff.length - presentIds.size));
        setRecentAttendance(attendance.slice(0, 4));

        // Branch performance from attendance
        if (branches.length > 0) {
          const bColors = ['bg-green-500','bg-blue-500','bg-amber-500','bg-red-400','bg-purple-500'];
          const bPerf = branches.slice(0, 5).map((b: any, idx: number) => {
            const branchStaff = staff.filter((s: any) => s.branch_id === b.id).length;
            const branchPresent = todayRecords.filter((a: any) => {
              const s = staff.find((st: any) => st.id === a.staff_id);
              return s?.branch_id === b.id && (a.status === 'present' || a.clock_in);
            }).length;
            const pct = branchStaff > 0 ? Math.round((branchPresent / branchStaff) * 100) : 0;
            return { name: b.name, attendance: pct, color: bColors[idx % bColors.length] };
          });
          setBranchPerformance(bPerf);
        }
      } catch {}
      setLoading(false);
    })();
  }, []);
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
            <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
              Active
            </span>
          </div>
          <p className="text-xs text-gray-400 font-medium">Total Staff</p>
          <p className="text-2xl font-bold text-navy-900">{loading ? '...' : totalStaff}</p>
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
          <p className="text-2xl font-bold text-navy-900">{loading ? '...' : presentToday}</p>
        </div>

        {/* Absent Today */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
              <UserX className="w-4 h-4 text-red-500" />
            </div>
          </div>
          <p className="text-xs text-gray-400 font-medium">Absent Today</p>
          <p className="text-2xl font-bold text-navy-900">{loading ? '...' : absentToday}</p>
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
          <p className="text-2xl font-bold text-navy-900">{loading ? '...' : pendingLeaves}</p>
        </div>

        {/* Active Managers */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-gray-500" />
            </div>
          </div>
          <p className="text-xs text-gray-400 font-medium">Active Managers</p>
          <p className="text-2xl font-bold text-navy-900">{loading ? '...' : managerCount}</p>
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
                {recentAttendance.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400 text-sm">No recent activity</td></tr>
                ) : recentAttendance.map((act: any, i: number) => {
                  const dateStr = act.date || (act.created_at ? new Date(act.created_at).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" }) : "—");
                  const timeStr = act.clock_in ? new Date(act.clock_in).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" }) : (act.created_at ? new Date(act.created_at).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" }) : "");
                  const staffName = act.staff ? `${act.staff.first_name || ""} ${act.staff.last_name || ""}`.trim() : "Staff";
                  const activity = act.clock_in ? "CLOCK IN" : act.clock_out ? "CLOCK OUT" : (act.status || "PRESENT").toUpperCase();
                  const actColor = act.clock_in ? "bg-green-100 text-green-700" : act.clock_out ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700";
                  return (
                  <tr key={act.id || i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{dateStr}</p>
                      <p className="text-xs text-gray-400">{timeStr}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-navy-900">
                        {staffName}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded text-[9px] font-bold tracking-wider ${actColor}`}
                      >
                        {activity}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600">{act.branch?.name || "—"}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600">System</p>
                    </td>
                  </tr>
                  );
                })}
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
              {upcomingLeaves.length === 0 ? (
                <p className="text-sm text-gray-400">No upcoming leaves</p>
              ) : upcomingLeaves.map((leave, i) => {
                const initials = (leave.staff?.first_name?.[0] ?? '') + (leave.staff?.last_name?.[0] ?? '');
                const bgColors = ['bg-blue-600','bg-amber-500','bg-green-600'];
                return (
                  <div key={leave.id ?? i} className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${bgColors[i % bgColors.length]}`}>
                      {initials.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-navy-900">
                        {leave.staff?.first_name} {leave.staff?.last_name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {leave.leave_type} \u00b7 {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
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
