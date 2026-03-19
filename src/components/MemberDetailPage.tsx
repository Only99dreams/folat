import { useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  CalendarDays,
  Pencil,
  FileText,
  CreditCard,
  Landmark,
  UserX,
  ChevronRight,
  TrendingUp,
  ArrowLeft,
} from "lucide-react";

export default function MemberDetailPage() {
  const [activeTab, setActiveTab] = useState("Overview");
  const tabs = ["Overview", "Savings", "Loans", "Documents", "Activity Log"];

  return (
    <div className="space-y-6">
      {/* ─── Back Link ─── */}
      <Link
        to="/members"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Members
      </Link>

      {/* ═══════════ Header ═══════════ */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
              <img
                src="https://ui-avatars.com/api/?name=Ajibola+Christopher&size=128&background=cccccc&color=1a2744&bold=true"
                alt="Ajibola Christopher"
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-navy-900">
                  Ajibola Christopher
                </h1>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                <span className="font-medium text-navy-900">MBR-001245</span>
                <span className="mx-1.5">·</span>
                Lagos Mainland Branch
              </p>
              <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  New York, USA
                </span>
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5" />
                  Joined Jan 2022
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
              <FileText className="w-3.5 h-3.5" />
              Statement
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-lg text-sm font-semibold hover:bg-navy-800 transition-colors">
              <CreditCard className="w-4 h-4" />
              Record Deposit
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════ Quick Actions ═══════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            icon: CreditCard,
            label: "Record Deposit",
            color: "text-navy-900",
          },
          { icon: Landmark, label: "Apply Loan", color: "text-navy-900" },
          { icon: UserX, label: "Suspend Member", color: "text-navy-900" },
        ].map((action, i) => (
          <button
            key={i}
            className="flex flex-col items-center gap-2.5 py-5 bg-white rounded-xl border border-gray-100 hover:border-navy-200 hover:shadow-sm transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
              <action.icon className={`w-5 h-5 ${action.color}`} />
            </div>
            <span className="text-sm font-medium text-navy-900">
              {action.label}
            </span>
          </button>
        ))}
      </div>

      {/* ═══════════ Stats Row ═══════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Savings Balance */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
            Savings Balance
          </p>
          <p className="text-2xl font-bold text-navy-900 mt-1">₦350,000</p>
          <p className="flex items-center gap-1 text-xs text-green-600 mt-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            +2.4% this month
          </p>
        </div>

        {/* Active Loan */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
            Active Loan
          </p>
          <p className="text-2xl font-bold text-navy-900 mt-1">₦120,000</p>
          <p className="text-xs text-gray-400 mt-1.5">Next due: 12 Oct</p>
        </div>

        {/* Loan Status */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
            Loan Status
          </p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-2xl font-bold text-navy-900">Active</p>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            On track for repayment
          </p>
        </div>

        {/* Total Deposits */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
            Total Deposits
          </p>
          <p className="text-2xl font-bold text-navy-900 mt-1">₦800,000</p>
          <p className="text-xs text-gray-400 mt-1.5">Lifetime total value</p>
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
            {/* Personal Information */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-navy-900">
                  Personal Information
                </h3>
                <button className="text-sm text-navy-900 font-medium hover:underline">
                  Update
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
                <div>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
                    Full Name
                  </p>
                  <p className="text-sm font-medium text-navy-900">
                    Ajibola Christopher
                  </p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
                    Email Address
                  </p>
                  <p className="text-sm font-medium text-navy-900">
                    ajibola.c@example.com
                  </p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
                    Phone Number
                  </p>
                  <p className="text-sm font-medium text-navy-900">
                    +234 812 345 6789
                  </p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
                    Home Address
                  </p>
                  <p className="text-sm font-medium text-navy-900">
                    12, Adeniyi Jones, Ikeja, Lagos
                  </p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
                    Occupation
                  </p>
                  <p className="text-sm font-medium text-navy-900">
                    Software Engineer
                  </p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
                    Date of Birth
                  </p>
                  <p className="text-sm font-medium text-navy-900">
                    15 May, 1988
                  </p>
                </div>
              </div>
            </div>

            {/* Cooperative Details */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-base font-bold text-navy-900 mb-5">
                Cooperative Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
                <div>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
                    Membership ID
                  </p>
                  <p className="text-sm font-medium text-navy-900">
                    MBR-001245
                  </p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
                    Date Joined
                  </p>
                  <p className="text-sm font-medium text-navy-900">
                    10 January, 2020
                  </p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
                    Branch
                  </p>
                  <p className="text-sm font-medium text-navy-900">
                    Lagos Mainland
                  </p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
                    Membership Status
                  </p>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 border border-green-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Right Column (1/3) ─── */}
          <div className="space-y-5">
            {/* Guarantor Info */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-base font-bold text-navy-900 mb-5">
                Guarantor Info
              </h3>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-navy-900 flex items-center justify-center text-white text-xs font-bold">
                  SA
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy-900">
                    Sarah Alabi
                  </p>
                  <p className="text-xs text-gray-400">
                    MBR-000982 · Senior Member
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-0.5">
                    Contact
                  </p>
                  <p className="text-sm font-medium text-navy-900">
                    +234 802 991 2233
                  </p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-0.5">
                    Guaranteed Since
                  </p>
                  <p className="text-sm font-medium text-navy-900">Feb 2021</p>
                </div>
              </div>

              <button className="flex items-center gap-1 mt-5 text-sm font-medium text-navy-900 hover:underline">
                View All Guarantors (2)
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Financial Snapshot */}
            <div className="bg-green-50 rounded-xl border border-green-100 p-6">
              <h3 className="text-base font-bold text-navy-900 mb-5">
                Financial Snapshot
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Total Dividends (2023)
                  </p>
                  <p className="text-base font-bold text-navy-900">₦42,500</p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Monthly Contribution
                  </p>
                  <p className="text-base font-bold text-navy-900">₦25,000</p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Repayment Credit Score
                  </p>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">842</p>
                    <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider">
                      Excellent
                    </p>
                  </div>
                </div>

                {/* Credit Score Bar */}
                <div className="w-full bg-green-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${((842 - 300) / 550) * 100}%` }}
                  />
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Membership tenure: 4.2 years
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Placeholder for other tabs */}
      {activeTab !== "Overview" && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400 text-sm">{activeTab} content coming soon.</p>
        </div>
      )}
    </div>
  );
}
