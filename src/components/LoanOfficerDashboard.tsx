import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";

/* ─── Mock Data ─── */
const stats = [
  { label: "My Active Applications", value: "12", change: "+3 this week", icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Pending Review", value: "5", change: "Awaiting approval", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Approved This Month", value: "18", change: "+22%", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
  { label: "Overdue Loans", value: "3", change: "Follow up needed", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
];

const recentApplications = [
  { id: "L2045", member: "Aisha Bello", amount: "₦ 500,000", type: "Business Loan", status: "Under Review", statusColor: "bg-yellow-100 text-yellow-700", date: "Today" },
  { id: "L2044", member: "Emeka Obi", amount: "₦ 250,000", type: "Personal Loan", status: "Approved", statusColor: "bg-green-100 text-green-700", date: "Yesterday" },
  { id: "L2043", member: "Fatima Yusuf", amount: "₦ 1,200,000", type: "Agriculture Loan", status: "Documents Pending", statusColor: "bg-purple-100 text-purple-700", date: "2 days ago" },
  { id: "L2042", member: "David Nwankwo", amount: "₦ 350,000", type: "Emergency Loan", status: "Disbursed", statusColor: "bg-blue-100 text-blue-700", date: "3 days ago" },
  { id: "L2041", member: "Grace Oduya", amount: "₦ 800,000", type: "Business Loan", status: "Rejected", statusColor: "bg-red-100 text-red-700", date: "4 days ago" },
];

const overdueAlerts = [
  { member: "Samuel Efio", loanId: "L1989", amount: "₦ 42,000", days: 14 },
  { member: "Grace Odu", loanId: "L1972", amount: "₦ 15,500", days: 18 },
  { member: "Tunde Bakare", loanId: "L1955", amount: "₦ 88,000", days: 7 },
];

const todayTasks = [
  { task: "Follow up on loan #L2043 documents", priority: "High" },
  { task: "Schedule interview for #L2045 application", priority: "Medium" },
  { task: "Call overdue borrowers for payment", priority: "High" },
  { task: "Submit weekly loan report", priority: "Low" },
];

export default function LoanOfficerDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Loan Officer Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome, {user?.name} — {user?.branch}</p>
        </div>
        <Link to="/loans/new" className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700">
          <FileText className="w-4 h-4" /> New Application
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-navy-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            <p className="text-xs text-gray-400">{s.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-navy-900">Recent Applications</h2>
            <Link to="/loans" className="text-sm font-medium text-green-600 hover:text-green-700">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                  <th className="pb-3 font-medium">Loan ID</th>
                  <th className="pb-3 font-medium">Member</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentApplications.map((l) => (
                  <tr key={l.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 font-mono text-navy-900 font-medium">{l.id}</td>
                    <td className="py-3 text-navy-900">{l.member}</td>
                    <td className="py-3 font-bold text-navy-900">{l.amount}</td>
                    <td className="py-3"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${l.statusColor}`}>{l.status}</span></td>
                    <td className="py-3 text-gray-400">{l.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Overdue Alerts */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" /> Overdue Alerts
            </h2>
            <div className="space-y-3">
              {overdueAlerts.map((o, i) => (
                <div key={i} className="p-3 rounded-xl bg-red-50 border border-red-100">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-navy-900">{o.member}</p>
                    <p className="text-xs font-bold text-red-600">{o.days} days</p>
                  </div>
                  <p className="text-xs text-gray-500">{o.loanId} — {o.amount} due</p>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Tasks */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-navy-900 mb-4">Today's Tasks</h2>
            <div className="space-y-3">
              {todayTasks.map((t, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50">
                  <ClipboardList className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-navy-900">{t.task}</p>
                    <span className={`text-[10px] font-semibold uppercase tracking-wide ${
                      t.priority === "High" ? "text-red-500" :
                      t.priority === "Medium" ? "text-amber-500" : "text-gray-400"
                    }`}>{t.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
