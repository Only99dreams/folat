import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
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
  Loader2,
} from "lucide-react";
import { fetchMember, fetchSavingsAccount, fetchSavingsTransactions, fetchLoanApplications } from "../lib/db";

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("Overview");
  const tabs = ["Overview", "Savings", "Loans", "Documents", "Activity Log"];
  const [member, setMember] = useState<any>(null);
  const [savings, setSavings] = useState<any>(null);
  const [activeLoans, setActiveLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const m = await fetchMember(id);
        setMember(m);
        const sa = await fetchSavingsAccount(id).catch(() => null);
        setSavings(sa);
        const { data: loans } = await fetchLoanApplications({ member_id: id, status: "disbursed" });
        setActiveLoans(loans);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
  if (!member) return <div className="text-center py-20 text-gray-400">Member not found</div>;

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
            <div className="w-16 h-16 rounded-full bg-navy-900 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {member.first_name?.[0]}{member.last_name?.[0]}
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-navy-900">
                  {member.first_name} {member.last_name}
                </h1>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                <span className="font-medium text-navy-900">{member.member_id}</span>
                <span className="mx-1.5">·</span>
                {member.branch?.name ?? "—"}
              </p>
              <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {member.address || "—"}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5" />
                  Joined {new Date(member.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
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
          <p className="text-2xl font-bold text-navy-900 mt-1">₦{savings ? Number(savings.balance).toLocaleString() : 0}</p>
        </div>

        {/* Active Loan */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
            Active Loan
          </p>
          <p className="text-2xl font-bold text-navy-900 mt-1">₦{activeLoans.length > 0 ? Number(activeLoans[0].amount_approved ?? activeLoans[0].amount_requested).toLocaleString() : 0}</p>
          <p className="text-xs text-gray-400 mt-1.5">{activeLoans.length > 0 ? `Loan: ${activeLoans[0].loan_id}` : "No active loan"}</p>
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
          <p className="text-2xl font-bold text-navy-900 mt-1">₦{savings ? Number(savings.balance).toLocaleString() : 0}</p>
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
                    {member.first_name} {member.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
                    Email Address
                  </p>
                  <p className="text-sm font-medium text-navy-900">
                    {member.email || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
                    Phone Number
                  </p>
                  <p className="text-sm font-medium text-navy-900">
                    {member.phone || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
                    Home Address
                  </p>
                  <p className="text-sm font-medium text-navy-900">
                    {member.address || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
                    Occupation
                  </p>
                  <p className="text-sm font-medium text-navy-900">
                    {member.occupation || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
                    Date of Birth
                  </p>
                  <p className="text-sm font-medium text-navy-900">
                    {member.date_of_birth ? new Date(member.date_of_birth).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : "—"}
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
                    {member.member_id}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
                    Date Joined
                  </p>
                  <p className="text-sm font-medium text-navy-900">
                    {new Date(member.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
                    Branch
                  </p>
                  <p className="text-sm font-medium text-navy-900">
                    {member.branch?.name ?? "—"}
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
                  —
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy-900">
                    —
                  </p>
                  <p className="text-xs text-gray-400">
                    No guarantor assigned
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-0.5">
                    Contact
                  </p>
                  <p className="text-sm font-medium text-navy-900">
                    —
                  </p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-0.5">
                    Guaranteed Since
                  </p>
                  <p className="text-sm font-medium text-navy-900">—</p>
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
                    Total Dividends
                  </p>
                  <p className="text-base font-bold text-navy-900">—</p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Monthly Contribution
                  </p>
                  <p className="text-base font-bold text-navy-900">—</p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Repayment Credit Score
                  </p>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-400">—</p>
                  </div>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Membership tenure: {Math.max(0, Math.floor((Date.now() - new Date(member.created_at).getTime()) / (365.25 * 24 * 60 * 60 * 1000)))} years
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
