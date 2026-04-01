import { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { fetchAttendance } from "../lib/db";

const avatarColors = ["bg-blue-600","bg-green-600","bg-purple-600","bg-amber-500","bg-pink-600","bg-teal-600","bg-navy-900"];

const statusBadge = (status: string) => {
  const s: Record<string, string> = {
    present: "bg-green-100 text-green-700",
    late: "bg-amber-100 text-amber-700",
    absent: "bg-red-100 text-red-600",
    half_day: "bg-blue-100 text-blue-700",
    leave: "bg-purple-100 text-purple-700",
  };
  const labels: Record<string,string> = { present: "PRESENT", late: "LATE", absent: "ABSENT", half_day: "HALF DAY", leave: "ON LEAVE" };
  return (
    <span className={`inline-flex px-2.5 py-1 rounded text-[10px] font-bold tracking-wider ${s[status] || "bg-gray-100 text-gray-600"}`}>
      {labels[status] || status.toUpperCase()}
    </span>
  );
};

export default function AttendanceLogPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchAttendance({ date: selectedDate });
        setRecords(data);
      } catch {}
      setLoading(false);
    })();
  }, [selectedDate]);

  const statuses = ["All", "present", "late", "absent", "half_day", "leave"];
  const statusLabels: Record<string,string> = { All: "All", present: "Present", late: "Late", absent: "Absent", half_day: "Half Day", leave: "On Leave" };

  const filtered = records.filter((r: any) => {
    const name = r.staff ? `${r.staff.first_name ?? ""} ${r.staff.last_name ?? ""}` : "";
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "All" || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const presentCount = records.filter((r: any) => r.status === "present").length;
  const lateCount = records.filter((r: any) => r.status === "late").length;
  const absentCount = records.filter((r: any) => r.status === "absent").length;
  const onLeaveCount = records.filter((r: any) => r.status === "leave" || r.status === "half_day").length;

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
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500" />
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
          <p className="text-xs text-green-600 font-medium mt-1">{records.length > 0 ? Math.round((presentCount / records.length) * 100) : 0}% of staff</p>
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
                {statusLabels[st] || st}
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
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin text-navy-900 mx-auto" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">No attendance records for this date</td></tr>
            ) : filtered.map((record: any, i: number) => {
              const name = record.staff ? `${record.staff.first_name ?? ""} ${record.staff.last_name ?? ""}`.trim() : "Unknown";
              const initials = name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0,2);
              const role = record.staff?.job_role || record.staff?.staff_id || "";
              const clockIn = record.clock_in ? new Date(record.clock_in).toLocaleTimeString("en-NG", {hour:"2-digit",minute:"2-digit"}) : "—";
              const clockOut = record.clock_out ? new Date(record.clock_out).toLocaleTimeString("en-NG", {hour:"2-digit",minute:"2-digit"}) : "—";
              let hoursWorked = "—";
              if (record.clock_in && record.clock_out) {
                const diff = (new Date(record.clock_out).getTime() - new Date(record.clock_in).getTime()) / (1000*60);
                hoursWorked = `${Math.floor(diff/60)}h ${Math.round(diff%60)}m`;
              }
              return (
              <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full ${avatarColors[i % avatarColors.length]} text-white flex items-center justify-center text-xs font-bold`}>{initials}</div>
                    <div>
                      <p className="text-sm font-semibold text-navy-900">{name}</p>
                      <p className="text-xs text-gray-400">{role}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">{record.branch_id ? record.branch_id.slice(0,8) : "—"}</td>
                <td className="px-4 py-4"><div className="flex items-center gap-1.5"><LogIn className="w-3.5 h-3.5 text-green-500" /><span className="text-sm text-gray-600">{clockIn}</span></div></td>
                <td className="px-4 py-4"><div className="flex items-center gap-1.5"><LogOut className="w-3.5 h-3.5 text-red-400" /><span className="text-sm text-gray-600">{clockOut}</span></div></td>
                <td className="px-4 py-4"><span className={`text-sm font-medium ${hoursWorked === "—" ? "text-gray-400" : "text-navy-900"}`}>{hoursWorked}</span></td>
                <td className="px-4 py-4">{statusBadge(record.status)}</td>
              </tr>
              );
            })}
          </tbody>
        </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-navy-900">1 to {filtered.length}</span> of{" "}
            <span className="font-semibold text-navy-900">{records.length}</span> staff
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
