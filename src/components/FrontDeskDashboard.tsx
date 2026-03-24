import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  UserPlus,
  Users,
  PiggyBank,
  Search,
  Clock,
  MessageSquare,
} from "lucide-react";

/* ─── Mock Data ─── */
const quickActions = [
  { icon: UserPlus, label: "Register New Member", desc: "Add cooperative or external member", to: "/members/add-cooperative", color: "bg-green-600" },
  { icon: PiggyBank, label: "Record Deposit", desc: "Record savings deposit for member", to: "/savings/deposit", color: "bg-blue-600" },
  { icon: Search, label: "Find Member", desc: "Search member records", to: "/members", color: "bg-purple-600" },
  { icon: MessageSquare, label: "Messages", desc: "View & send messages", to: "/communication/messages", color: "bg-amber-600" },
];

const todayStats = [
  { label: "Members Registered Today", value: "4", icon: UserPlus, color: "text-green-600", bg: "bg-green-50" },
  { label: "Deposits Recorded", value: "11", icon: PiggyBank, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Walk-in Enquiries", value: "8", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
  { label: "Pending Verifications", value: "3", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
];

const recentRegistrations = [
  { name: "Fatima Hassan", type: "Cooperative", branch: "Port Harcourt", time: "30 mins ago" },
  { name: "David Okafor", type: "External", branch: "Port Harcourt", time: "1 hour ago" },
  { name: "Amina Bello", type: "Cooperative", branch: "Port Harcourt", time: "2 hours ago" },
  { name: "Samuel Efio", type: "Cooperative", branch: "Port Harcourt", time: "3 hours ago" },
];

const recentDeposits = [
  { member: "Grace Ibe", amount: "₦ 50,000", time: "15 mins ago" },
  { member: "John Obi", amount: "₦ 120,000", time: "40 mins ago" },
  { member: "Aisha Musa", amount: "₦ 25,000", time: "1 hour ago" },
];

export default function FrontDeskDashboard() {
  const { user } = useAuth();

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
        {todayStats.map((s) => (
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
            {recentRegistrations.map((r, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50">
                <div className="w-10 h-10 rounded-full bg-navy-900 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {r.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-navy-900">{r.name}</p>
                  <p className="text-xs text-gray-400">{r.type} Member — {r.branch}</p>
                </div>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />{r.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Deposits */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-navy-900">Recent Deposits</h2>
            <Link to="/savings" className="text-sm font-medium text-green-600 hover:text-green-700">View All</Link>
          </div>
          <div className="space-y-3">
            {recentDeposits.map((d, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-green-50 border border-green-100">
                <div className="flex items-center gap-3">
                  <PiggyBank className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-navy-900">{d.member}</p>
                    <p className="text-xs text-gray-500">{d.time}</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-green-700">{d.amount}</p>
              </div>
            ))}
          </div>
          <Link to="/savings/deposit" className="mt-4 w-full flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50">
            <PiggyBank className="w-4 h-4" /> Record New Deposit
          </Link>
        </div>
      </div>
    </div>
  );
}
