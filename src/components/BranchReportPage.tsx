import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  PiggyBank,
  Landmark,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  TrendingUp,
  TrendingDown,
  Loader2,
  FileBarChart,
  Calendar,
  AlertTriangle,
  ClipboardCheck,
  Clock,
  Download,
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
import { supabase } from "../lib/supabase";
import { fetchBranch, fetchAuditLog, fetchBranchAssignments } from "../lib/db";
import ExportMenu from "./ExportMenu";

const defaultChartData = [
  { month: "JAN", savings: 0, loans: 0 },
  { month: "FEB", savings: 0, loans: 0 },
  { month: "MAR", savings: 0, loans: 0 },
  { month: "APR", savings: 0, loans: 0 },
  { month: "MAY", savings: 0, loans: 0 },
  { month: "JUN", savings: 0, loans: 0 },
  { month: "JUL", savings: 0, loans: 0 },
  { month: "AUG", savings: 0, loans: 0 },
  { month: "SEP", savings: 0, loans: 0 },
  { month: "OCT", savings: 0, loans: 0 },
  { month: "NOV", savings: 0, loans: 0 },
  { month: "DEC", savings: 0, loans: 0 },
];

function StatCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  sub,
  subColor,
  subIcon,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
  subIcon?: "up" | "down";
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-3 overflow-hidden">
      <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold truncate">
          {label}
        </p>
        <p className="text-xl font-bold mt-0.5 truncate text-navy-900">
          {value}
        </p>
        {sub && (
          <p className={`text-[10px] mt-1 flex items-center gap-0.5 ${subColor}`}>
            {subIcon === "up" && <TrendingUp className="w-3 h-3" />}
            {subIcon === "down" && <TrendingDown className="w-3 h-3" />}
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

export default function BranchReportPage() {
  const { id } = useParams<{ id: string }>();
  const [branch, setBranch] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState(defaultChartData);
  const [recentLoans, setRecentLoans] = useState<any[]>([]);
  const [recentMembers, setRecentMembers] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadReport();
  }, [id]);

  async function loadReport() {
    if (!id) return;
    try {
      setLoading(true);

      const b = await fetchBranch(id);
      setBranch(b);

      const today = new Date().toISOString().split("T")[0];

      const [
        membersRes,
        activeLoansRes,
        pendingLoansRes,
        savingsRes,
        loanDataRes,
        staffRes,
        recentMembersRes,
        recentLoansRes,
        auditRes,
        assignmentsData,
      ] = await Promise.all([
        supabase.from("members").select("id, status, member_type, created_at, gender").eq("branch_id", id),
        supabase.from("loan_applications").select("id, status, amount_approved, amount_requested, created_at").eq("branch_id", id).in("status", ["approved", "active", "disbursed"]),
        supabase.from("loan_applications").select("id").eq("branch_id", id).eq("status", "pending"),
        (async () => {
          const { data: branchMembers } = await supabase.from("members").select("id").eq("branch_id", id);
          const memberIds = (branchMembers ?? []).map((m: any) => m.id);
          if (memberIds.length === 0) return { data: [] as any[] };
          return supabase.from("savings_accounts").select("balance, member_id").in("member_id", memberIds);
        })(),
        supabase.from("loan_applications").select("amount_requested, amount_approved, status, created_at").eq("branch_id", id),
        supabase.from("staff").select("id, first_name, last_name, job_role, employment_status, email, phone, basic_salary").eq("branch_id", id).eq("employment_status", "active"),
        supabase.from("members").select("id, first_name, last_name, member_id, status, created_at, gender").eq("branch_id", id).order("created_at", { ascending: false }).limit(10),
        supabase.from("loan_applications").select("id, loan_id, amount_requested, amount_approved, status, created_at, member:members(first_name, last_name)").eq("branch_id", id).order("created_at", { ascending: false }).limit(10),
        fetchAuditLog({ page: 1, pageSize: 10, branch_id: id }),
        fetchBranchAssignments(id),
      ]);

      setAssignments(assignmentsData);

      const allMembers = membersRes.data ?? [];
      const activeMembers = allMembers.filter((m: any) => m.status === "active").length;
      const cooperativeMembers = allMembers.filter((m: any) => m.member_type === "cooperative").length;
      const externalMembers = allMembers.filter((m: any) => m.member_type === "external").length;
      const maleMembers = allMembers.filter((m: any) => m.gender === "Male").length;
      const femaleMembers = allMembers.filter((m: any) => m.gender === "Female").length;

      const totalSavings = (savingsRes.data ?? []).reduce((sum: number, a: any) => sum + Number(a.balance || 0), 0);
      const activeLoans = activeLoansRes.data?.length ?? 0;
      const pendingLoans = pendingLoansRes.data?.length ?? 0;
      const totalLoanOutstanding = (loanDataRes.data ?? [])
        .filter((l: any) => ["approved", "active", "disbursed"].includes(l.status))
        .reduce((sum: number, l: any) => sum + Number(l.amount_approved ?? l.amount_requested), 0);
      const totalLoanDisbursed = (loanDataRes.data ?? [])
        .filter((l: any) => ["approved", "active", "disbursed"].includes(l.status))
        .reduce((sum: number, l: any) => sum + Number(l.amount_approved ?? l.amount_requested), 0);
      const totalStaff = staffRes.data?.length ?? 0;

      const totalLoanRepaid = (loanDataRes.data ?? [])
        .filter((l: any) => l.status === "completed")
        .reduce((sum: number, l: any) => sum + Number(l.amount_approved ?? l.amount_requested), 0);
      const repaymentRate = totalLoanDisbursed > 0 ? ((totalLoanRepaid / totalLoanDisbursed) * 100) : 0;

      setStats({
        totalMembers: allMembers.length,
        activeMembers,
        cooperativeMembers,
        externalMembers,
        maleMembers,
        femaleMembers,
        totalSavings,
        activeLoans,
        pendingLoans,
        totalLoanOutstanding,
        totalLoanDisbursed,
        totalStaff,
        repaymentRate,
      });

      // Build chart data
      const monthlyData: Record<string, { savings: number; loans: number }> = {};
      const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      months.forEach((m) => { monthlyData[m] = { savings: 0, loans: 0 }; });

      (savingsRes.data ?? []).forEach((s: any) => {
        // Use savings_accounts as total; for monthly we'll approximate from transactions later
      });

      (loanDataRes.data ?? []).forEach((l: any) => {
        const d = new Date(l.created_at);
        const m = months[d.getMonth()];
        if (m) monthlyData[m].loans += Number(l.amount_approved ?? l.amount_requested);
      });

      // Try to get savings transactions for chart
      try {
        const memberIds = (savingsRes.data ?? []).map((s: any) => s.member_id).filter(Boolean);
        if (memberIds.length > 0) {
          const { data: savingsTxns } = await supabase
            .from("savings_transactions")
            .select("amount, created_at, type")
            .in("member_id", memberIds)
            .eq("type", "deposit");
          (savingsTxns ?? []).forEach((t: any) => {
            const d = new Date(t.created_at);
            const m = months[d.getMonth()];
            if (m) monthlyData[m].savings += Number(t.amount || 0);
          });
        }
      } catch {}

      setChartData(months.map((m) => ({ month: m, ...monthlyData[m] })));
      setRecentMembers(recentMembersRes.data ?? []);
      setRecentLoans(recentLoansRes.data ?? []);
      setActivityLog(auditRes.data);
    } catch (err) {
      console.error("Failed to load branch report:", err);
    } finally {
      setLoading(false);
    }
  }

  const fmt = (n: number) => {
    if (n >= 1e9) return `₦ ${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `₦ ${(n / 1e6).toFixed(1)}M`;
    return `₦ ${n.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-navy-900" />
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Branch not found.</p>
        <Link to="/branches" className="text-navy-900 hover:underline text-sm mt-2 inline-block">Back to Branches</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div>
        <Link
          to={`/branches/${id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-900 uppercase tracking-wide hover:text-green-600 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Branch
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy-900 flex items-center gap-2">
              <FileBarChart className="w-6 h-6 text-green-600" />
              Branch Report
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {branch.name} ({branch.code}) — {branch.address}, {branch.city}, {branch.state}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ExportMenu
              data={() => [
                { Metric: "Total Members", Value: stats?.totalMembers ?? 0 },
                { Metric: "Active Members", Value: stats?.activeMembers ?? 0 },
                { Metric: "Total Savings", Value: stats?.totalSavings ?? 0 },
                { Metric: "Active Loans", Value: stats?.activeLoans ?? 0 },
                { Metric: "Pending Loans", Value: stats?.pendingLoans ?? 0 },
                { Metric: "Loan Outstanding", Value: stats?.totalLoanOutstanding ?? 0 },
                { Metric: "Total Staff", Value: stats?.totalStaff ?? 0 },
                { Metric: "Repayment Rate", Value: `${(stats?.repaymentRate ?? 0).toFixed(1)}%` },
              ]}
              filename={`branch-report-${branch.code}`}
              label="Export Report"
            />
          </div>
        </div>
      </div>

      {/* ─── Branch Info Bar ─── */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-navy-900 font-medium">{branch.city}, {branch.state}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="text-navy-900">{branch.phone || "—"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-navy-900">{branch.email || "—"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-gray-400" />
            <span className="text-navy-900">Manager: {branch.manager?.full_name || "Not assigned"}</span>
          </div>
          {assignments.filter((a: any) => a.assignment_type === "secretary").length > 0 && (
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-purple-400" />
              <span className="text-navy-900">Secretary: {assignments.filter((a: any) => a.assignment_type === "secretary").map((a: any) => `${a.staff?.first_name} ${a.staff?.last_name}`).join(", ")}</span>
            </div>
          )}
          {assignments.filter((a: any) => a.assignment_type === "officer").length > 0 && (
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-gray-400" />
              <span className="text-navy-900">Officer: {assignments.filter((a: any) => a.assignment_type === "officer").map((a: any) => `${a.staff?.first_name} ${a.staff?.last_name}`).join(", ")}</span>
            </div>
          )}
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${branch.status === "active" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${branch.status === "active" ? "bg-green-500" : "bg-red-500"}`} />
            {branch.status === "active" ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* ─── Stat Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          label="Total Members"
          value={String(stats?.totalMembers ?? 0)}
          sub={`${stats?.activeMembers ?? 0} active · ${stats?.cooperativeMembers ?? 0} cooperative`}
          subColor="text-gray-400"
        />
        <StatCard
          icon={PiggyBank}
          iconBg="bg-green-50"
          iconColor="text-green-600"
          label="Total Savings"
          value={fmt(stats?.totalSavings ?? 0)}
          sub="Across all members"
          subColor="text-gray-400"
        />
        <StatCard
          icon={Landmark}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          label="Active Loans"
          value={String(stats?.activeLoans ?? 0)}
          sub={`${fmt(stats?.totalLoanOutstanding ?? 0)} outstanding`}
          subColor="text-gray-400"
        />
        <StatCard
          icon={ClipboardCheck}
          iconBg="bg-red-50"
          iconColor="text-red-600"
          label="Pending Loans"
          value={String(stats?.pendingLoans ?? 0)}
          sub="Awaiting approval"
          subColor="text-gray-400"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Briefcase}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          label="Total Staff"
          value={String(stats?.totalStaff ?? 0)}
          sub="Active employees"
          subColor="text-gray-400"
        />
        <StatCard
          icon={TrendingUp}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
          label="Loans Disbursed"
          value={fmt(stats?.totalLoanDisbursed ?? 0)}
          sub="Total value"
          subColor="text-gray-400"
        />
        <StatCard
          icon={TrendingDown}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
          label="Repayment Rate"
          value={`${(stats?.repaymentRate ?? 0).toFixed(1)}%`}
          sub={stats?.repaymentRate >= 70 ? "Healthy" : "Needs attention"}
          subColor={stats?.repaymentRate >= 70 ? "text-green-600" : "text-red-500"}
          subIcon={stats?.repaymentRate >= 70 ? "up" : "down"}
        />
        <StatCard
          icon={Users}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
          label="Members by Gender"
          value={`${stats?.maleMembers ?? 0}M / ${stats?.femaleMembers ?? 0}F`}
          sub={`${stats?.externalMembers ?? 0} external`}
          subColor="text-gray-400"
        />
      </div>

      {/* ─── Savings vs Loans Chart ─── */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-navy-900">Savings vs Loans Overview</h2>
          <span className="text-xs text-gray-400">Current Year</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickFormatter={(v) => v >= 1e6 ? `${(v / 1e6).toFixed(0)}M` : v >= 1e3 ? `${(v / 1e3).toFixed(0)}K` : v} />
              <Tooltip formatter={(value: number) => `₦${value.toLocaleString()}`} />
              <Area type="monotone" dataKey="savings" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} strokeWidth={2} />
              <Area type="monotone" dataKey="loans" stackId="2" stroke="#0a1f44" fill="#0a1f44" fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-6 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded bg-green-500" /> Savings</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded bg-navy-900" /> Loans</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ─── Recent Members ─── */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-navy-900">Recent Members</h2>
            <Link to="/members" className="text-xs font-medium text-green-600 hover:text-green-700">View All</Link>
          </div>
          {recentMembers.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No members yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold border-b border-gray-100">
                    <th className="pb-2">Member</th>
                    <th className="pb-2">ID</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentMembers.map((m: any) => (
                    <tr key={m.id} className="hover:bg-gray-50/50">
                      <td className="py-2.5 font-medium text-navy-900">
                        <Link to={`/members/${m.id}`} className="hover:underline">{m.first_name} {m.last_name}</Link>
                      </td>
                      <td className="py-2.5 text-gray-500 text-xs">{m.member_id}</td>
                      <td className="py-2.5">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${m.member_type === "cooperative" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}`}>
                          {m.member_type}
                        </span>
                      </td>
                      <td className="py-2.5 text-gray-500 text-xs">{new Date(m.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ─── Recent Loans ─── */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-navy-900">Recent Loans</h2>
            <Link to="/loans" className="text-xs font-medium text-green-600 hover:text-green-700">View All</Link>
          </div>
          {recentLoans.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No loan applications yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold border-b border-gray-100">
                    <th className="pb-2">Loan ID</th>
                    <th className="pb-2">Member</th>
                    <th className="pb-2">Amount</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentLoans.map((l: any) => (
                    <tr key={l.id} className="hover:bg-gray-50/50">
                      <td className="py-2.5 font-medium text-navy-900 text-xs">{l.loan_id}</td>
                      <td className="py-2.5 text-gray-500">{l.member?.first_name} {l.member?.last_name}</td>
                      <td className="py-2.5 font-semibold text-navy-900">₦{Number(l.amount_approved ?? l.amount_requested).toLocaleString()}</td>
                      <td className="py-2.5">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          l.status === "approved" || l.status === "active" || l.status === "disbursed" ? "bg-green-50 text-green-700" :
                          l.status === "pending" ? "bg-amber-50 text-amber-700" :
                          l.status === "completed" ? "bg-blue-50 text-blue-700" :
                          "bg-red-50 text-red-700"
                        }`}>
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ─── Staff Overview ─── */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-navy-900">Branch Staff ({stats?.totalStaff ?? 0})</h2>
          <Link to="/hr/staff" className="text-xs font-medium text-green-600 hover:text-green-700">View All</Link>
        </div>
        {staff.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No staff assigned to this branch.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold border-b border-gray-100">
                  <th className="pb-3 font-medium">Staff Name</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Assignment</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Phone</th>
                  <th className="pb-3 font-medium text-right">Salary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {staff.map((s: any) => {
                  const assignment = assignments.find((a: any) => a.staff_id === s.id);
                  return (
                  <tr key={s.id} className="hover:bg-gray-50/50">
                    <td className="py-3 font-medium text-navy-900">{s.first_name} {s.last_name}</td>
                    <td className="py-3 text-gray-500 capitalize">{s.job_role?.replace(/_/g, " ")}</td>
                    <td className="py-3">
                      {assignment ? (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          assignment.assignment_type === 'branch_manager' ? 'bg-blue-100 text-blue-700' :
                          assignment.assignment_type === 'secretary' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {assignment.assignment_type.replace('_', ' ')}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3 text-gray-500">{s.email || "—"}</td>
                    <td className="py-3 text-gray-500">{s.phone || "—"}</td>
                    <td className="py-3 text-navy-900 font-semibold text-right">₦{Number(s.basic_salary || 0).toLocaleString()}</td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Activity Log ─── */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-navy-900">Recent Activity</h2>
          <Link to="/security/audit" className="text-xs font-medium text-green-600 hover:text-green-700">View All</Link>
        </div>
        <div className="space-y-3">
          {activityLog.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No recent activity.</p>
          ) : activityLog.map((a: any) => {
            const mins = Math.floor((Date.now() - new Date(a.created_at).getTime()) / 60000);
            const ago = mins < 60 ? `${mins}m ago` : mins < 1440 ? `${Math.floor(mins / 60)}h ago` : `${Math.floor(mins / 1440)}d ago`;
            return (
              <div key={a.id} className="flex gap-3 items-start">
                <span className="mt-1.5 w-2 h-2 rounded-full shrink-0 bg-green-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-navy-900">
                    <span className="font-medium">{a.user?.full_name || "System"}</span>{" "}
                    — {a.action} {a.entity_type}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />{ago}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
