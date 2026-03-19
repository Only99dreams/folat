import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  FileBarChart,
  UserPlus,
  Ban,
  TrendingUp,
  CalendarDays,
  MapPin,
  Users,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ─── Chart Data ─── */
const performanceData = [
  { month: "JAN", savings: 280, loans: 180, repayments: 120 },
  { month: "FEB", savings: 300, loans: 200, repayments: 150 },
  { month: "MAR", savings: 350, loans: 170, repayments: 180 },
  { month: "APR", savings: 320, loans: 220, repayments: 160 },
  { month: "MAY", savings: 400, loans: 190, repayments: 200 },
  { month: "JUN", savings: 380, loans: 210, repayments: 190 },
];

/* ─── Activity Data ─── */
const recentActivity = [
  {
    color: "bg-green-500",
    title: "Repayment Received",
    description: "₦45,000 from Samuel Ade (Group Loan #42)",
    time: "2 hours ago",
  },
  {
    color: "bg-navy-900",
    title: "New Member Added",
    description: "Victoria Bello joined Unity Farmers",
    time: "Yesterday, 4:15 PM",
  },
  {
    color: "bg-red-500",
    title: "Loan Default Alert",
    description: "Pending repayment from Friday Silas (3 days late)",
    time: "June 12, 2024",
  },
];

export default function GroupDetailPage() {
  const [activeTab, setActiveTab] = useState("Overview");
  const tabs = ["Overview", "Members", "Savings", "Loans", "Activity"];

  return (
    <div className="space-y-6">
      {/* ─── Back Link ─── */}
      <Link
        to="/groups"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Groups
      </Link>

      {/* ═══════════ Header ═══════════ */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Group Icon */}
            <div className="w-14 h-14 rounded-xl bg-navy-50 flex items-center justify-center">
              <Users className="w-7 h-7 text-navy-900" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-navy-900">
                Unity Farmers Group
              </h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-50 text-green-700 text-xs font-semibold border border-green-200">
                  ID: GRP-00124
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  Lagos Mainland Branch
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
              <FileBarChart className="w-3.5 h-3.5" />
              Reports
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">
              <UserPlus className="w-4 h-4" />
              Add Members
            </button>
            <button className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-gray-200 transition-colors">
              <Ban className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════ Stats Row ═══════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Members */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
            Total Members
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-3xl font-bold text-navy-900">18</p>
            <span className="text-xs font-semibold text-green-600">
              +2 this mo
            </span>
          </div>
        </div>

        {/* Group Savings */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
            Group Savings
          </p>
          <p className="text-2xl font-bold text-navy-900 mt-1">₦2,450,000</p>
        </div>

        {/* Active Loans */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
            Active Loans
          </p>
          <p className="text-2xl font-bold text-navy-900 mt-1">₦800,000</p>
        </div>

        {/* Repayment Rate */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
            Repayment Rate
          </p>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-2xl font-bold text-navy-900">94%</p>
            <div className="flex-1 bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-green-500 h-2.5 rounded-full"
                style={{ width: "94%" }}
              />
            </div>
          </div>
        </div>

        {/* Group Age */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
            Group Age
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-3xl font-bold text-navy-900">2</p>
            <span className="text-sm text-gray-500">Years</span>
            <CalendarDays className="w-5 h-5 text-gray-300 ml-auto" />
          </div>
        </div>
      </div>

      {/* ═══════════ Tab Bar ═══════════ */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                activeTab === tab
                  ? "text-navy-900"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-navy-900 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════ Tab Content ═══════════ */}
      {activeTab === "Overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ─── Left Column (2/3) ─── */}
          <div className="col-span-1 lg:col-span-2 space-y-5">
            {/* Group Performance Chart */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-base font-bold text-navy-900">
                    Group Performance
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Savings vs Loans vs Repayments (Last 6 Months)
                  </p>
                </div>
                <select className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 bg-white focus:outline-none">
                  <option>Last 6 Months</option>
                  <option>Last 12 Months</option>
                  <option>This Year</option>
                </select>
              </div>

              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient
                        id="colorSavings"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#109050"
                          stopOpacity={0.15}
                        />
                        <stop
                          offset="95%"
                          stopColor="#109050"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorLoans"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#f59e0b"
                          stopOpacity={0.15}
                        />
                        <stop
                          offset="95%"
                          stopColor="#f59e0b"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorRepay"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#ef4444"
                          stopOpacity={0.15}
                        />
                        <stop
                          offset="95%"
                          stopColor="#ef4444"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f0f0f0"
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 8,
                        border: "1px solid #e5e7eb",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="savings"
                      stroke="#109050"
                      fill="url(#colorSavings)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="loans"
                      stroke="#f59e0b"
                      fill="url(#colorLoans)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="repayments"
                      stroke="#ef4444"
                      fill="url(#colorRepay)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-4">
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-600" />
                  Savings
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Loans
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  Repayments
                </span>
              </div>
            </div>

            {/* Group Details */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-base font-bold text-navy-900 mb-5">
                Group Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-10">
                <div className="flex items-baseline gap-2">
                  <p className="text-xs text-gray-400 whitespace-nowrap">
                    Legal Name
                  </p>
                  <p className="text-sm font-medium text-navy-900">
                    Unity Farmers Multi-Purpose
                  </p>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-xs text-gray-400 whitespace-nowrap">
                    Primary Sector
                  </p>
                  <p className="text-sm font-semibold text-green-600">
                    Agribusiness
                  </p>
                </div>

                <div className="flex items-baseline gap-2">
                  <p className="text-xs text-gray-400 whitespace-nowrap">
                    Registration Number
                  </p>
                  <p className="text-sm font-medium text-navy-900">
                    LASG-COOP-2022-882
                  </p>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-xs text-gray-400 whitespace-nowrap">
                    Loan Status
                  </p>
                  <p className="text-sm font-semibold text-green-600">
                    Healthy
                  </p>
                </div>

                <div className="flex items-baseline gap-2">
                  <p className="text-xs text-gray-400 whitespace-nowrap">
                    Date Formed
                  </p>
                  <p className="text-sm font-medium text-navy-900">
                    October 14, 2021
                  </p>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-xs text-gray-400 whitespace-nowrap">
                    Last Audit
                  </p>
                  <p className="text-sm font-medium text-navy-900">
                    Mar 02, 2024
                  </p>
                </div>

                <div className="flex items-baseline gap-2">
                  <p className="text-xs text-gray-400 whitespace-nowrap">
                    Meeting Frequency
                  </p>
                  <p className="text-sm font-medium text-navy-900">
                    Bi-Weekly (Saturdays)
                  </p>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-xs text-gray-400 whitespace-nowrap">
                    Bank Account
                  </p>
                  <p className="text-sm font-medium text-navy-900">
                    GTBank **** 4492
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Right Column (1/3) ─── */}
          <div className="space-y-5">
            {/* Group Leadership */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-base font-bold text-navy-900 mb-5">
                Group Leadership
              </h3>

              <div className="space-y-4">
                {[
                  {
                    name: "Adebola Johnson",
                    role: "PRESIDENT",
                    initials: "AJ",
                    bg: "bg-gray-400",
                  },
                  {
                    name: "Chioma Okafor",
                    role: "SECRETARY",
                    initials: "CO",
                    bg: "bg-navy-900",
                  },
                  {
                    name: "Musa Ibrahim",
                    role: "TREASURER",
                    initials: "MI",
                    bg: "bg-green-600",
                  },
                ].map((leader, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full ${leader.bg} flex items-center justify-center text-white text-xs font-bold`}
                    >
                      {leader.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-navy-900">
                        {leader.name}
                      </p>
                      <p className="text-[10px] tracking-[0.08em] uppercase text-gray-400 font-semibold">
                        {leader.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
                Update Committee
              </button>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-navy-900">
                  Recent Activity
                </h3>
                <button className="text-xs font-medium text-navy-900 hover:underline">
                  View All
                </button>
              </div>

              <div className="space-y-5">
                {recentActivity.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${item.color} flex-shrink-0 mt-1.5`}
                      />
                      {i < recentActivity.length - 1 && (
                        <span className="w-px flex-1 bg-gray-200 mt-1" />
                      )}
                    </div>
                    <div className="pb-1">
                      <p className="text-sm font-semibold text-navy-900">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.description}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {item.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="rounded-xl overflow-hidden border border-gray-100 relative h-40">
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-navy-900/30 flex flex-col items-center justify-end pb-4 text-white">
                <MapPin className="w-8 h-8 text-green-400 mb-2 drop-shadow" />
                <p className="text-sm font-bold">Lagos Mainland Hub</p>
                <p className="text-[11px] text-gray-300 mt-0.5">
                  Primary operational center for this group.
                </p>
              </div>
              <div className="w-full h-full bg-gray-200" />
            </div>
          </div>
        </div>
      )}

      {/* Placeholder for other tabs */}
      {activeTab !== "Overview" && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400 text-sm">
            {activeTab} content coming soon.
          </p>
        </div>
      )}
    </div>
  );
}
