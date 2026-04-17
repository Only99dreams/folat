import { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  Loader2,
  AlertCircle,
  CheckCircle2,
  LogIn,
  LogOut,
  Clock,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { fetchStaff, fetchBranches, recordAttendance, fetchAttendance } from "../lib/db";

const avatarColors = [
  "bg-blue-600",
  "bg-green-600",
  "bg-purple-600",
  "bg-amber-500",
  "bg-pink-600",
  "bg-teal-600",
  "bg-navy-900",
];

const statusBadge = (status: string) => {
  const s: Record<string, string> = {
    present: "bg-green-100 text-green-700",
    late: "bg-amber-100 text-amber-700",
    absent: "bg-red-100 text-red-600",
    half_day: "bg-blue-100 text-blue-700",
    leave: "bg-purple-100 text-purple-700",
  };
  const labels: Record<string, string> = {
    present: "PRESENT",
    late: "LATE",
    absent: "ABSENT",
    half_day: "HALF DAY",
    leave: "ON LEAVE",
  };
  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded text-[10px] font-bold tracking-wider ${
        s[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {labels[status] || status.toUpperCase()}
    </span>
  );
};

export default function RecordAttendancePage() {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [processing, setProcessing] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, [selectedDate, branchFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [staffData, branchData, attendanceData] = await Promise.all([
        fetchStaff({ branch_id: branchFilter || undefined }),
        fetchBranches(),
        fetchAttendance({ date: selectedDate, branch_id: branchFilter || undefined }),
      ]);
      setStaffList(staffData);
      setBranches(branchData);

      // Map attendance records by staff_id
      const attendanceMap: Record<string, any> = {};
      attendanceData.forEach((r: any) => {
        attendanceMap[r.staff_id] = r;
      });
      setAttendance(attendanceMap);
    } catch {
      setError("Failed to load data");
    }
    setLoading(false);
  };

  const handleClockIn = async (staff: any) => {
    const now = new Date().toISOString();
    const hour = new Date().getHours();
    const minute = new Date().getMinutes();
    const isLate = hour > 8 || (hour === 8 && minute > 30);

    setProcessing(staff.id);
    setError("");
    setSuccess("");
    try {
      const record = await recordAttendance({
        staff_id: staff.id,
        date: selectedDate,
        clock_in: now,
        status: isLate ? "late" : "present",
        branch_id: staff.branch_id || undefined,
      });
      setAttendance((prev) => ({ ...prev, [staff.id]: record }));
      setSuccess(
        `${staff.first_name} ${staff.last_name} clocked in at ${new Date(now).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}${isLate ? " (Late)" : ""}`
      );
    } catch (e: any) {
      setError(e.message || "Failed to record clock-in");
    }
    setProcessing(null);
  };

  const handleClockOut = async (staff: any) => {
    const now = new Date().toISOString();
    const existing = attendance[staff.id];

    setProcessing(staff.id);
    setError("");
    setSuccess("");
    try {
      const record = await recordAttendance({
        staff_id: staff.id,
        date: selectedDate,
        clock_in: existing?.clock_in || undefined,
        clock_out: now,
        status: existing?.status || "present",
        branch_id: staff.branch_id || undefined,
      });
      setAttendance((prev) => ({ ...prev, [staff.id]: record }));
      setSuccess(
        `${staff.first_name} ${staff.last_name} clocked out at ${new Date(now).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}`
      );
    } catch (e: any) {
      setError(e.message || "Failed to record clock-out");
    }
    setProcessing(null);
  };

  const handleMarkAbsent = async (staff: any) => {
    setProcessing(staff.id);
    setError("");
    setSuccess("");
    try {
      const record = await recordAttendance({
        staff_id: staff.id,
        date: selectedDate,
        status: "absent",
        branch_id: staff.branch_id || undefined,
      });
      setAttendance((prev) => ({ ...prev, [staff.id]: record }));
      setSuccess(`${staff.first_name} ${staff.last_name} marked as absent`);
    } catch (e: any) {
      setError(e.message || "Failed to mark absent");
    }
    setProcessing(null);
  };

  const handleMarkLeave = async (staff: any) => {
    setProcessing(staff.id);
    setError("");
    setSuccess("");
    try {
      const record = await recordAttendance({
        staff_id: staff.id,
        date: selectedDate,
        status: "leave",
        branch_id: staff.branch_id || undefined,
      });
      setAttendance((prev) => ({ ...prev, [staff.id]: record }));
      setSuccess(
        `${staff.first_name} ${staff.last_name} marked as on leave`
      );
    } catch (e: any) {
      setError(e.message || "Failed to mark leave");
    }
    setProcessing(null);
  };

  // Filter staff
  const filtered = staffList.filter((s: any) => {
    if (s.employment_status !== "active") return false;
    const name = `${s.first_name ?? ""} ${s.last_name ?? ""}`;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Summary counts
  const presentCount = Object.values(attendance).filter(
    (r: any) => r.status === "present"
  ).length;
  const lateCount = Object.values(attendance).filter(
    (r: any) => r.status === "late"
  ).length;
  const absentCount = Object.values(attendance).filter(
    (r: any) => r.status === "absent"
  ).length;
  const onLeaveCount = Object.values(attendance).filter(
    (r: any) => r.status === "leave" || r.status === "half_day"
  ).length;
  const notRecorded = filtered.filter((s: any) => !attendance[s.id]).length;

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">
            Record Attendance
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Record staff clock-in and clock-out times. Select a date and use the
            action buttons for each staff member.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <div className="relative">
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="appearance-none px-4 py-2.5 pr-9 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
              <option value="">All Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ─── Alerts ─── */}
      {success && (
        <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* ─── Summary Stats ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="w-4 h-4 text-green-600" />
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
              Present
            </p>
          </div>
          <p className="text-2xl font-bold text-navy-900">{presentCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
              Late
            </p>
          </div>
          <p className="text-2xl font-bold text-navy-900">{lateCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <UserX className="w-4 h-4 text-red-500" />
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
              Absent
            </p>
          </div>
          <p className="text-2xl font-bold text-navy-900">{absentCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-purple-600" />
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
              On Leave
            </p>
          </div>
          <p className="text-2xl font-bold text-navy-900">{onLeaveCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-gray-400" />
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
              Not Recorded
            </p>
          </div>
          <p className="text-2xl font-bold text-navy-900">{notRecorded}</p>
        </div>
      </div>

      {/* ─── Staff Attendance Table ─── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-navy-900">
            Staff (
            {selectedDate === new Date().toISOString().split("T")[0]
              ? "Today"
              : new Date(selectedDate).toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
            )
          </h2>
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
                <th className="px-6 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Employee
                </th>
                <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Branch
                </th>
                <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Clock In
                </th>
                <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Clock Out
                </th>
                <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Status
                </th>
                <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-navy-900 mx-auto" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-gray-400 text-sm"
                  >
                    No active staff found
                  </td>
                </tr>
              ) : (
                filtered.map((staff: any, i: number) => {
                  const name = `${staff.first_name ?? ""} ${staff.last_name ?? ""}`.trim();
                  const initials = name
                    .split(" ")
                    .map((w: string) => w[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);
                  const record = attendance[staff.id];
                  const clockIn = record?.clock_in
                    ? new Date(record.clock_in).toLocaleTimeString("en-NG", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—";
                  const clockOut = record?.clock_out
                    ? new Date(record.clock_out).toLocaleTimeString("en-NG", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—";
                  const hasClockedIn = !!record?.clock_in;
                  const hasClockedOut = !!record?.clock_out;
                  const branchName = staff.branch?.name || "—";
                  const isProcessing = processing === staff.id;

                  return (
                    <tr
                      key={staff.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full ${
                              avatarColors[i % avatarColors.length]
                            } text-white flex items-center justify-center text-xs font-bold`}
                          >
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-navy-900">
                              {name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {staff.job_role || staff.staff_id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {branchName}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <LogIn
                            className={`w-3.5 h-3.5 ${
                              hasClockedIn ? "text-green-500" : "text-gray-300"
                            }`}
                          />
                          <span className="text-sm text-gray-600">
                            {clockIn}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <LogOut
                            className={`w-3.5 h-3.5 ${
                              hasClockedOut ? "text-red-400" : "text-gray-300"
                            }`}
                          />
                          <span className="text-sm text-gray-600">
                            {clockOut}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {record ? (
                          statusBadge(record.status)
                        ) : (
                          <span className="inline-flex px-2.5 py-1 rounded text-[10px] font-bold tracking-wider bg-gray-100 text-gray-400">
                            NOT RECORDED
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          {isProcessing ? (
                            <Loader2 className="w-4 h-4 animate-spin text-navy-900" />
                          ) : (
                            <>
                              {/* Clock In button — show if not clocked in yet */}
                              {!hasClockedIn &&
                                record?.status !== "absent" &&
                                record?.status !== "leave" && (
                                  <button
                                    onClick={() => handleClockIn(staff)}
                                    className="flex items-center gap-1 px-2.5 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors"
                                  >
                                    <LogIn className="w-3 h-3" />
                                    In
                                  </button>
                                )}

                              {/* Clock Out button — show if clocked in but not clocked out */}
                              {hasClockedIn && !hasClockedOut && (
                                <button
                                  onClick={() => handleClockOut(staff)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors"
                                >
                                  <LogOut className="w-3 h-3" />
                                  Out
                                </button>
                              )}

                              {/* Mark Absent — show if no record yet */}
                              {!record && (
                                <button
                                  onClick={() => handleMarkAbsent(staff)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors"
                                >
                                  <UserX className="w-3 h-3" />
                                  Absent
                                </button>
                              )}

                              {/* Mark Leave — show if no record yet */}
                              {!record && (
                                <button
                                  onClick={() => handleMarkLeave(staff)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 border border-purple-200 text-purple-600 rounded-lg text-xs font-semibold hover:bg-purple-50 transition-colors"
                                >
                                  <Users className="w-3 h-3" />
                                  Leave
                                </button>
                              )}

                              {/* Done indicator */}
                              {hasClockedIn && hasClockedOut && (
                                <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Complete
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-semibold text-navy-900">
              {filtered.length}
            </span>{" "}
            active staff members
          </p>
          <p className="text-xs text-gray-400">
            {Object.keys(attendance).length} of {filtered.length} recorded
          </p>
        </div>
      </div>
    </div>
  );
}
