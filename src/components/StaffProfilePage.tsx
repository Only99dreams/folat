import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  MapPin,
  Mail,
  Phone,
  CalendarDays,
  Briefcase,
  Loader2,
} from "lucide-react";
import { fetchStaffMember, fetchLeaveRequests } from "../lib/db";

/* ─── Tab options ─── */
const tabs = ["Overview", "Leaves", "Salary", "Documents", "Activity"];

const avatarColors = ["bg-blue-600","bg-green-600","bg-purple-600","bg-amber-500","bg-pink-600","bg-teal-600"];

export default function StaffProfilePage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Overview");
  const [staff, setStaff] = useState<any>(null);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const s = await fetchStaffMember(id);
        setStaff(s);
        const lr = await fetchLeaveRequests({ staff_id: id });
        setLeaves(lr);
      } catch {}
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-navy-900" /></div>;
  if (!staff) return <div className="text-center py-20 text-gray-500">Staff member not found.</div>;

  const fullName = `${staff.first_name ?? ""} ${staff.last_name ?? ""}`.trim();
  const initials = `${(staff.first_name?.[0] ?? "").toUpperCase()}${(staff.last_name?.[0] ?? "").toUpperCase()}`;
  const avatarBg = avatarColors[(fullName.length) % avatarColors.length];
  const joinedDate = staff.date_joined ? new Date(staff.date_joined) : null;
  const yearsInOrg = joinedDate ? Math.floor((Date.now() - joinedDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0;
  const approvedLeaves = leaves.filter(l => l.status === "approved");
  const leaveDaysUsed = approvedLeaves.reduce((sum: number, l: any) => {
    if (!l.start_date || !l.end_date) return sum;
    const d = Math.ceil((new Date(l.end_date).getTime() - new Date(l.start_date).getTime()) / (1000*60*60*24)) + 1;
    return sum + Math.max(d, 0);
  }, 0);

  const personalInfo = [
    { label: "Full Name", value: fullName },
    { label: "Date of Birth", value: staff.date_of_birth ? new Date(staff.date_of_birth).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" }) : "—" },
    { label: "Gender", value: staff.gender ? staff.gender.charAt(0).toUpperCase() + staff.gender.slice(1) : "—" },
    { label: "Address", value: staff.address || "—" },
  ];

  const employmentDetails = [
    { label: "Job Title", value: staff.position || staff.role || "—" },
    { label: "Branch", value: staff.branch?.name || "—" },
    { label: "Hired Date", value: joinedDate ? joinedDate.toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" }) : "—" },
    { label: "Employment Type", value: staff.employment_type || "Full-time" },
    { label: "Status", value: staff.status ? staff.status.charAt(0).toUpperCase() + staff.status.slice(1) : "—" },
  ];

  return (
    <div className="space-y-6">
      {/* ─── Profile Header ─── */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=JohnDoe"
                alt="Staff avatar"
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-bold text-navy-900">John Doe</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-navy-900 text-white text-[10px] font-bold tracking-wider">
                  STF-00245
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-2">Loan Officer</p>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  Lagos Mainland Branch
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  adeola.musa@organization.com
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                <Phone className="w-3.5 h-3.5" />
                +234 801 234 5678
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-5 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition-colors">
              Edit Profile
            </button>
            <button className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
              Actions
            </button>
          </div>
        </div>
      </div>

      {/* ─── Stat Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Years in Org */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-400 font-medium">Years in Org</p>
            <CalendarDays className="w-4 h-4 text-gray-300" />
          </div>
          <p className="text-2xl font-bold text-navy-900">{yearsInOrg} {yearsInOrg === 1 ? "Year" : "Years"}</p>
          <p className="text-xs text-green-600 font-medium mt-1">
            Since {joinedDate ? joinedDate.getFullYear() : "—"}
          </p>
        </div>

        {/* Leave Days Used */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-400 font-medium">
              Leave Days Used
            </p>
            <CalendarDays className="w-4 h-4 text-gray-300" />
          </div>
          <p className="text-2xl font-bold text-navy-900">{leaveDaysUsed} Days</p>
          <p className="text-xs text-gray-400 font-medium mt-1">
            {Math.max(20 - leaveDaysUsed, 0)} days remaining
          </p>
        </div>

        {/* Monthly Salary */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-400 font-medium">Monthly Salary</p>
            <Briefcase className="w-4 h-4 text-gray-300" />
          </div>
          <p className="text-2xl font-bold text-navy-900">₦250,000</p>
          <p className="text-xs text-gray-400 font-medium mt-1">
            Gross earnings
          </p>
        </div>
      </div>

      {/* ─── Tabs ─── */}
      <div className="border-b border-gray-100">
        <div className="flex items-center gap-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                activeTab === tab
                  ? "text-navy-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-navy-900"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Personal Info + Employment Details ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-navy-900 rounded-full" />
            <h2 className="text-base font-bold text-navy-900">
              Personal Information
            </h2>
          </div>

          <div className="space-y-3">
            {personalInfo.map((item, i) => (
              <div key={i} className="flex items-start">
                <p className="text-sm text-gray-400 w-32 flex-shrink-0">
                  {item.label}
                </p>
                <p className="text-sm font-semibold text-navy-900">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Employment Details */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-green-600 rounded-full" />
            <h2 className="text-base font-bold text-navy-900">
              Employment Details
            </h2>
          </div>

          <div className="space-y-3">
            {employmentDetails.map((item, i) => (
              <div key={i} className="flex items-start">
                <p className="text-sm text-gray-400 w-36 flex-shrink-0">
                  {item.label}
                </p>
                <p className="text-sm font-semibold text-navy-900">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Monthly Compensation Breakdown ─── */}
      {/* Salary data can be added when salary tables are implemented */}

      {/* ─── Recent Leaves ─── */}
      <div>
        <h2 className="text-base font-bold text-navy-900 mb-4">
          Recent Leaves
        </h2>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                    Leave Type
                  </th>
                  <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                    Start Date
                  </th>
                  <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                    End Date
                  </th>
                  <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                    Days
                  </th>
                  <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaves.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400 text-sm">No leave records</td></tr>
                ) : leaves.slice(0, 5).map((leave: any, i: number) => {
                  const days = leave.start_date && leave.end_date ? Math.ceil((new Date(leave.end_date).getTime() - new Date(leave.start_date).getTime()) / (1000*60*60*24)) + 1 : 0;
                  const statusColors: Record<string,string> = { approved: "bg-green-600 text-white", pending: "bg-amber-100 text-amber-700", rejected: "bg-red-100 text-red-600" };
                  return (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4"><p className="text-sm text-navy-900">{leave.leave_type ? leave.leave_type.charAt(0).toUpperCase() + leave.leave_type.slice(1) : "—"} Leave</p></td>
                    <td className="px-4 py-4"><p className="text-sm text-gray-600">{leave.start_date ? new Date(leave.start_date).toLocaleDateString("en-NG", {year:"numeric",month:"short",day:"numeric"}) : "—"}</p></td>
                    <td className="px-4 py-4"><p className="text-sm text-gray-600">{leave.end_date ? new Date(leave.end_date).toLocaleDateString("en-NG", {year:"numeric",month:"short",day:"numeric"}) : "—"}</p></td>
                    <td className="px-4 py-4"><p className="text-sm text-gray-600">{days} {days === 1 ? "Day" : "Days"}</p></td>
                    <td className="px-4 py-4"><span className={`inline-flex px-2.5 py-1 rounded text-[9px] font-bold tracking-wider ${statusColors[leave.status] || "bg-gray-100 text-gray-600"}`}>{(leave.status || "").toUpperCase()}</span></td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
