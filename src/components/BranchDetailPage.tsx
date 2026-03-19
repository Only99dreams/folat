import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  FileText,
  Users,
  PiggyBank,
  Landmark,
  Percent,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  Map,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

/* ─── Mock data ─── */
const performanceData = [
  { day: "Mon", savings: 4200, loans: 3100, repayments: 1800 },
  { day: "Tue", savings: 3800, loans: 2800, repayments: 2200 },
  { day: "Wed", savings: 5200, loans: 4500, repayments: 3000 },
  { day: "Thu", savings: 4100, loans: 3600, repayments: 2500 },
  { day: "Fri", savings: 3500, loans: 2900, repayments: 1900 },
  { day: "Sat", savings: 2000, loans: 1500, repayments: 900 },
  { day: "Sun", savings: 1200, loans: 800, repayments: 500 },
];

const tabs = ["Overview", "Staff", "Members", "Loans", "Finance", "Reports"];

export default function BranchDetailPage() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [chartRange, setChartRange] = useState("7d");

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div>
        <Link
          to="/branches"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-900 uppercase tracking-wide hover:text-green-600 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Branches
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">
              Lagos Mainland Branch (LMB001)
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Main operations hub for Central Lagos district
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
              <Pencil className="w-4 h-4" />
              Edit Branch
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-red-200 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
              <Trash2 className="w-4 h-4" />
              Disable
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition-colors">
              <FileText className="w-4 h-4" />
              View Reports
            </button>
          </div>
        </div>
      </div>

      {/* ─── Stats Row ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon={Users}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          label="Total Members"
          value="2,145"
          sub="+12% vs last month"
          subColor="text-green-600"
          subIcon="up"
        />
        <StatCard
          icon={PiggyBank}
          iconBg="bg-green-50"
          iconColor="text-green-600"
          label="Total Savings"
          value="₦420.5M"
          sub="+8% increase"
          subColor="text-green-600"
          subIcon="up"
        />
        <StatCard
          icon={Landmark}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
          label="Active Loans"
          value="₦150.2M"
          sub="482 active loan files"
          subColor="text-gray-400"
        />
        <StatCard
          icon={Percent}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          label="Repayment Rate"
          value="92.4%"
          progressPct={92.4}
        />
        <StatCard
          icon={Briefcase}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
          label="Staff Count"
          value="24"
          sub="4 departments"
          subColor="text-gray-400"
        />
      </div>

      {/* ─── Tabs ─── */}
      <div className="border-b border-gray-200">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-navy-900 text-navy-900"
                  : "border-transparent text-gray-400 hover:text-navy-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Tab Content: Overview ─── */}
      {activeTab === "Overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Branch Info */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
            <h3 className="text-base font-bold text-navy-900">
              Branch Information
            </h3>

            {/* Manager */}
            <div className="space-y-1">
              <p className="text-[10px] tracking-[0.12em] uppercase text-gray-400 font-semibold">
                Branch Manager
              </p>
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">
                  EO
                </span>
                <span className="text-sm font-medium text-navy-900">
                  Emeka Okafor
                </span>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1">
              <p className="text-[10px] tracking-[0.12em] uppercase text-gray-400 font-semibold">
                Primary Address
              </p>
              <div className="flex items-start gap-2 text-sm text-navy-900">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span>
                  128 Herbert Macaulay Way, Yaba,
                  <br />
                  Lagos State, Nigeria
                </span>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-2">
              <p className="text-[10px] tracking-[0.12em] uppercase text-gray-400 font-semibold">
                Contact Details
              </p>
              <div className="flex items-center gap-2 text-sm text-navy-900">
                <Phone className="w-4 h-4 text-gray-400" />
                +234 802 345 6789
              </div>
              <div className="flex items-center gap-2 text-sm text-navy-900">
                <Mail className="w-4 h-4 text-gray-400" />
                mainland@folat-coop.ng
              </div>
            </div>

            {/* Map placeholder */}
            <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "#C8E6D2" }}>
              <div className="h-32 flex items-center justify-center">
                <Map className="w-10 h-10 text-navy-900/20" />
              </div>
            </div>
          </div>

          {/* Right: Performance Chart */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-navy-900">
                  Branch Performance
                </h3>
                <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
                  {["7d", "30d", "1y"].map((r) => (
                    <button
                      key={r}
                      onClick={() => setChartRange(r)}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        chartRange === r
                          ? "bg-white text-navy-900 shadow-sm"
                          : "text-gray-400 hover:text-navy-900"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  Savings
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-navy-900" />
                  Loans
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                  Repayments
                </span>
              </div>

              {/* Chart */}
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData} barGap={2} barSize={14}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #e5e7eb",
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="savings" fill="#22c55e" radius={[3, 3, 0, 0]} name="Savings" />
                    <Bar dataKey="loans" fill="#1a2744" radius={[3, 3, 0, 0]} name="Loans" />
                    <Bar dataKey="repayments" fill="#fb923c" radius={[3, 3, 0, 0]} name="Repayments" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bottom mini cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <p className="text-xs text-gray-500">Weekly Loan Issuance</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-xl font-bold text-navy-900">₦14.5M</p>
                  <span className="text-xs font-semibold text-red-500 flex items-center gap-0.5">
                    <TrendingDown className="w-3 h-3" />
                    -2.4%
                  </span>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <p className="text-xs text-gray-500">New Savings Deposits</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-xl font-bold text-navy-900">₦32.1M</p>
                  <span className="text-xs font-semibold text-green-600 flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" />
                    +15.8%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Placeholder for other tabs */}
      {activeTab !== "Overview" && (
        <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
          <p className="text-gray-400 text-sm">
            {activeTab} tab content coming soon...
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Stat Card ─── */
function StatCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  sub,
  subColor,
  subIcon,
  progressPct,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
  subIcon?: "up" | "down";
  progressPct?: number;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
          {label}
        </p>
      </div>
      <p className="text-xl font-bold text-navy-900">{value}</p>
      {sub && (
        <p className={`text-[10px] mt-1 flex items-center gap-0.5 ${subColor}`}>
          {subIcon === "up" && <TrendingUp className="w-3 h-3" />}
          {subIcon === "down" && <TrendingDown className="w-3 h-3" />}
          {sub}
        </p>
      )}
      {progressPct !== undefined && (
        <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-navy-900 rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}
    </div>
  );
}
