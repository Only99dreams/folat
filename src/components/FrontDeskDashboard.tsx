import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import {
  UserPlus,
  Users,
  PiggyBank,
  Search,
  Clock,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { fetchDashboardStats, fetchRecentTransactions, fetchMembers } from "../lib/db";

/* ─── Quick Actions (static links) ─── */
const quickActions = [
  { icon: UserPlus, label: "Register New Member", desc: "Add cooperative or external member", to: "/members/add-cooperative", color: "bg-green-600" },
  { icon: PiggyBank, label: "Record Deposit", desc: "Record savings deposit for member", to: "/savings/deposit", color: "bg-blue-600" },
  { icon: Search, label: "Find Member", desc: "Search member records", to: "/members", color: "bg-purple-600" },
  { icon: MessageSquare, label: "Messages", desc: "View & send messages", to: "/communication/messages", color: "bg-amber-600" },
];

export default function FrontDeskDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalMembers: 0, totalSavings: 0 });
  const [recentRegistrations, setRecentRegistrations] = useState<any[]>([]);
  const [recentDeposits, setRecentDeposits] = useState<any[]>([]);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    (async () => {
      try {
        const [dashStats, deposits, members] = await Promise.all([
          fetchDashboardStats(),
          fetchRecentTransactions(5),
          fetchMembers({ page: 1, pageSize: 5 }),
        ]);
        setStats(dashStats as any);
        setRecentDeposits(deposits.filter((d: any) => d.type === "deposit").slice(0, 3));
        setRecentRegistrations(members.data.slice(0, 4));
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const todayStats = [
    { label: "Total Members", value: String(stats.totalMembers), icon: UserPlus, color: "text-green-600", bg: "bg-green-50" },
    { label: "Recent Deposits", value: String(recentDeposits.length), icon: PiggyBank, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Recent Registrations", value: String(recentRegistrations.length), icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Pending Tasks", value: "—", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Front Desk</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome, {user?.name} — {user?.branch}</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((a) => (
          <Link key={a.label} to={a.to} className="bg-white rounded-xl border border-gray-100 p-5 hover:border-green-200 hover:shadow-sm transition-all">
            <div className={`w-10 h-10 rounded-xl ${a.color} flex items-center justify-center mb-3`}>
              <a.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-bold text-navy-900">{a.label}</p>
            <p className="text-xs text-gray-400 mt-1">{a.desc}</p>
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-4 flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-green-600" /></div>
        ) : todayStats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-navy-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-navy-900">Recent Registrations</h2>
            <Link to="/members" className="text-sm font-medium text-green-600 hover:text-green-700">View All</Link>
          </div>
          <div className="space-y-3">
            {recentRegistrations.length === 0 ? (
              <p className="text-sm text-gray-400">No recent registrations.</p>
            ) : recentRegistrations.map((r: any) => {
              const name = `${r.first_name} ${r.last_name}`;
              const mins = Math.floor((now - new Date(r.created_at).getTime()) / 60000);
              const ago = mins < 60 ? `${mins} mins ago` : mins < 1440 ? `${Math.floor(mins / 60)} hours ago` : `${Math.floor(mins / 1440)} days ago`;
              return (
              <div key={r.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50">
                <div className="w-10 h-10 rounded-full bg-navy-900 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {r.first_name?.[0]}{r.last_name?.[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-navy-900">{name}</p>
                  <p className="text-xs text-gray-400">{r.member_type || "Member"} — {r.branch?.name || "—"}</p>
                </div>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />{ago}
                </span>
              </div>
              );
            })}
          </div>
        </div>

        {/* Recent Deposits */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-navy-900">Recent Deposits</h2>
            <Link to="/savings" className="text-sm font-medium text-green-600 hover:text-green-700">View All</Link>
          </div>
          <div className="space-y-3">
            {recentDeposits.length === 0 ? (
              <p className="text-sm text-gray-400">No recent deposits.</p>
            ) : recentDeposits.map((d: any) => {
              const memberName = d.member ? `${d.member.first_name} ${d.member.last_name}` : "—";
              const mins = Math.floor((now - new Date(d.created_at).getTime()) / 60000);
              const ago = mins < 60 ? `${mins}m ago` : mins < 1440 ? `${Math.floor(mins / 60)}h ago` : `${Math.floor(mins / 1440)}d ago`;
              return (
              <div key={d.id} className="flex items-center justify-between p-4 rounded-xl bg-green-50 border border-green-100">
                <div className="flex items-center gap-3">
                  <PiggyBank className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-navy-900">{memberName}</p>
                    <p className="text-xs text-gray-500">{ago}</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-green-700">₦ {Number(d.amount).toLocaleString()}</p>
              </div>
              );
            })}
          </div>
          <Link to="/savings/deposit" className="mt-4 w-full flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50">
            <PiggyBank className="w-4 h-4" /> Record New Deposit
          </Link>
        </div>
      </div>
    </div>
  );
}
