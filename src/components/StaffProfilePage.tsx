import { useState } from "react";
import {
  MapPin,
  Mail,
  Phone,
  CalendarDays,
  Briefcase,
  DollarSign,
} from "lucide-react";

/* ─── Tab options ─── */
const tabs = ["Overview", "Leaves", "Salary", "Documents", "Activity"];

/* ─── Personal Info ─── */
const personalInfo = [
  { label: "Full Name", value: "Adeola Olabisi Musa" },
  { label: "Date of Birth", value: "May 12, 1992" },
  { label: "Gender", value: "Female" },
  { label: "Marital Status", value: "Married" },
  { label: "Address", value: "12, Adekunle St, Yaba, Lagos." },
];

/* ─── Employment Details ─── */
const employmentDetails = [
  { label: "Job Title", value: "Loan Officer" },
  { label: "Department", value: "Retail Lending" },
  { label: "Hired Date", value: "Oct 15, 2021" },
  { label: "Reporting To", value: "Chinedu Okafor (BM)" },
  { label: "Employment Type", value: "Full-time Permanent" },
];

/* ─── Earnings ─── */
const earnings = [
  { label: "Basic Salary", amount: "₦150,000.00" },
  { label: "Housing Allowance", amount: "₦40,000.00" },
  { label: "Transport Allowance", amount: "₦35,000.00" },
  { label: "Other Allowances", amount: "₦25,000.00" },
];

/* ─── Deductions ─── */
const deductions = [
  { label: "PAYE Tax", amount: "-₦18,500.00" },
  { label: "Pension (8%)", amount: "-₦12,000.00" },
  { label: "Loan Repayment", amount: "-₦20,000.00" },
];

/* ─── Recent Leaves ─── */
const recentLeaves = [
  {
    type: "Casual Leave",
    startDate: "Aug 10, 2024",
    endDate: "Aug 11, 2024",
    days: "2 Days",
    status: "APPROVED",
  },
  {
    type: "Sick Leave",
    startDate: "June 04, 2024",
    endDate: "June 06, 2024",
    days: "3 Days",
    status: "APPROVED",
  },
];

export default function StaffProfilePage() {
  const [activeTab, setActiveTab] = useState("Overview");

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
          <p className="text-2xl font-bold text-navy-900">3 Years</p>
          <p className="text-xs text-green-600 font-medium mt-1">
            Promoted last year
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
          <p className="text-2xl font-bold text-navy-900">5 Days</p>
          <p className="text-xs text-gray-400 font-medium mt-1">
            15 days remaining
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
      <div>
        <h2 className="text-base font-bold text-navy-900 mb-4">
          Monthly Compensation Breakdown
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Earnings */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                Earnings
              </p>
            </div>
            <div className="px-5 py-3 space-y-3">
              {earnings.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">{item.label}</p>
                  <p className="text-sm font-medium text-navy-900">
                    {item.amount}
                  </p>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-green-600">
                  Gross Pay
                </p>
                <p className="text-sm font-bold text-green-600">
                  ₦250,000.00
                </p>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <p className="text-[10px] tracking-[0.1em] uppercase text-red-400 font-semibold">
                Deductions
              </p>
            </div>
            <div className="px-5 py-3 space-y-3">
              {deductions.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">{item.label}</p>
                  <p className="text-sm font-medium text-red-500">
                    {item.amount}
                  </p>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-navy-900">
                  Net Salary
                </p>
                <p className="text-sm font-bold text-navy-900">
                  ₦199,500.00
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                {recentLeaves.map((leave, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm text-navy-900">{leave.type}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600">
                        {leave.startDate}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600">{leave.endDate}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600">{leave.days}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex px-2.5 py-1 rounded text-[9px] font-bold tracking-wider bg-green-600 text-white">
                        {leave.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
