import { useState } from "react";
import {
  Search,
  Download,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  UserCheck,
  UserX,
  Users,
  LogIn,
  LogOut,
  Filter,
  AlertCircle,
} from "lucide-react";

/* ─── Attendance Data ─── */
interface AttendanceRecord {
  id: string;
  employee: string;
  role: string;
  avatar: string;
  branch: string;
  date: string;
  clockIn: string;
  clockOut: string;
  hoursWorked: string;
  status: "Present" | "Late" | "Absent" | "Half Day" | "On Leave";
}

const attendanceRecords: AttendanceRecord[] = [
  { id: "1", employee: "Adebayo Ogunlesi", role: "Branch Manager", avatar: "AO", branch: "Lagos Central", date: "Oct 24, 2023", clockIn: "08:02 AM", clockOut: "05:15 PM", hoursWorked: "9h 13m", status: "Present" },
  { id: "2", employee: "Chioma Nwosu", role: "Finance Officer", avatar: "CN", branch: "Lagos Central", date: "Oct 24, 2023", clockIn: "08:45 AM", clockOut: "05:30 PM", hoursWorked: "8h 45m", status: "Late" },
  { id: "3", employee: "Ibrahim Musa", role: "Loan Officer", avatar: "IM", branch: "Abuja Branch", date: "Oct 24, 2023", clockIn: "07:55 AM", clockOut: "05:00 PM", hoursWorked: "9h 05m", status: "Present" },
  { id: "4", employee: "Grace Adeyemi", role: "Front Desk", avatar: "GA", branch: "Lagos Central", date: "Oct 24, 2023", clockIn: "—", clockOut: "—", hoursWorked: "—", status: "Absent" },
  { id: "5", employee: "Emeka Obi", role: "Loan Officer", avatar: "EO", branch: "Port Harcourt", date: "Oct 24, 2023", clockIn: "08:00 AM", clockOut: "01:00 PM", hoursWorked: "5h 00m", status: "Half Day" },
  { id: "6", employee: "Fatima Abdullahi", role: "Finance Officer", avatar: "FA", branch: "Kano North", date: "Oct 24, 2023", clockIn: "—", clockOut: "—", hoursWorked: "—", status: "On Leave" },
  { id: "7", employee: "Tunde Bakare", role: "IT Support", avatar: "TB", branch: "Lagos Central", date: "Oct 24, 2023", clockIn: "07:50 AM", clockOut: "05:10 PM", hoursWorked: "9h 20m", status: "Present" },
  { id: "8", employee: "Amaka Eze", role: "HR Officer", avatar: "AE", branch: "Abuja Branch", date: "Oct 24, 2023", clockIn: "09:10 AM", clockOut: "05:30 PM", hoursWorked: "8h 20m", status: "Late" },
];

const statusBadge = (status: AttendanceRecord["status"]) => {
  const s: Record<string, string> = {
    Present: "bg-green-100 text-green-700",
    Late: "bg-amber-100 text-amber-700",
    Absent: "bg-red-100 text-red-600",
    "Half Day": "bg-blue-100 text-blue-700",
    "On Leave": "bg-purple-100 text-purple-700",
  };
  return (
    <span className={`inline-flex px-2.5 py-1 rounded text-[10px] font-bold tracking-wider ${s[status]}`}>
      {status.toUpperCase()}
    </span>
  );
};

export default function AttendanceLogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const statuses = ["All", "Present", "Late", "Absent", "Half Day", "On Leave"];

  const filtered = attendanceRecords.filter((r) => {
    const matchesSearch = r.employee.toLowerCase().includes(searchQuery.toLowerCase()) || r.branch.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "All" || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const presentCount = attendanceRecords.filter((r) => r.status === "Present").length;
  const lateCount = attendanceRecords.filter((r) => r.status === "Late").length;
  const absentCount = attendanceRecords.filter((r) => r.status === "Absent").length;
  const onLeaveCount = attendanceRecords.filter((r) => r.status === "On Leave" || r.status === "Half Day").length;

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Attendance Log</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track daily staff attendance, clock-in/out times, and attendance trends.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            Oct 24, 2023
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* ─── Stats ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="w-4 h-4 text-green-600" />
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Present</p>
          </div>
          <p className="text-2xl font-bold text-navy-900">{presentCount}</p>
          <p className="text-xs text-green-600 font-medium mt-1">{Math.round((presentCount / attendanceRecords.length) * 100)}% of staff</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Late</p>
          </div>
          <p className="text-2xl font-bold text-navy-900">{lateCount}</p>
          <p className="text-xs text-amber-500 font-medium mt-1">After 8:30 AM</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <UserX className="w-4 h-4 text-red-500" />
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Absent</p>
          </div>
          <p className="text-2xl font-bold text-navy-900">{absentCount}</p>
          <p className="text-xs text-red-500 font-medium mt-1">Unexcused</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-purple-600" />
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">On Leave / Half Day</p>
          </div>
          <p className="text-2xl font-bold text-navy-900">{onLeaveCount}</p>
          <p className="text-xs text-purple-600 font-medium mt-1">Approved</p>
        </div>
      </div>

      {/* ─── Attendance Table ─── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-2">
            {statuses.map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterStatus === st
                    ? "bg-navy-900 text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search staff..."
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
              <th className="px-6 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Employee</th>
              <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Branch</th>
              <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Clock In</th>
              <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Clock Out</th>
              <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Hours Worked</th>
              <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((record) => (
              <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-navy-900 text-white flex items-center justify-center text-xs font-bold">
                      {record.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-navy-900">{record.employee}</p>
                      <p className="text-xs text-gray-400">{record.role}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">{record.branch}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1.5">
                    <LogIn className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-sm text-gray-600">{record.clockIn}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1.5">
                    <LogOut className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-sm text-gray-600">{record.clockOut}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className={`text-sm font-medium ${record.hoursWorked === "—" ? "text-gray-400" : "text-navy-900"}`}>
                    {record.hoursWorked}
                  </span>
                </td>
                <td className="px-4 py-4">{statusBadge(record.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-navy-900">1 to {filtered.length}</span> of{" "}
            <span className="font-semibold text-navy-900">85</span> staff
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
