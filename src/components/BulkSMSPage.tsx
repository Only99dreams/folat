import { useState } from "react";
import {
  Send,
  Upload,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* ─── SMS History Data ─── */
interface SMSRecord {
  id: string;
  date: string;
  recipients: string;
  recipientCount: number;
  message: string;
  status: "Delivered" | "Pending" | "Failed";
  sentBy: string;
}

const smsHistory: SMSRecord[] = [
  {
    id: "SMS-001",
    date: "Oct 24, 2023",
    recipients: "All Members",
    recipientCount: 12845,
    message: "Reminder: Monthly savings deposit deadline is October 31st...",
    status: "Delivered",
    sentBy: "Admin",
  },
  {
    id: "SMS-002",
    date: "Oct 22, 2023",
    recipients: "Lagos Branch",
    recipientCount: 3210,
    message: "Meeting scheduled for Oct 25 at 10:00 AM at the Lagos branch...",
    status: "Delivered",
    sentBy: "Branch Manager",
  },
  {
    id: "SMS-003",
    date: "Oct 20, 2023",
    recipients: "Overdue Members",
    recipientCount: 145,
    message: "Your loan repayment is overdue. Please visit your nearest branch...",
    status: "Pending",
    sentBy: "Finance Dept",
  },
  {
    id: "SMS-004",
    date: "Oct 18, 2023",
    recipients: "All Staff",
    recipientCount: 85,
    message: "Staff meeting rescheduled to Friday Oct 20 at 2:00 PM...",
    status: "Failed",
    sentBy: "HR Dept",
  },
];

const statusBadge = (status: SMSRecord["status"]) => {
  const styles: Record<string, { bg: string; icon: React.ElementType }> = {
    Delivered: { bg: "bg-green-100 text-green-700", icon: CheckCircle2 },
    Pending: { bg: "bg-amber-100 text-amber-700", icon: Clock },
    Failed: { bg: "bg-red-100 text-red-600", icon: XCircle },
  };
  const s = styles[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold tracking-wider ${s.bg}`}>
      <s.icon className="w-3 h-3" />
      {status}
    </span>
  );
};

export default function BulkSMSPage() {
  const [form, setForm] = useState({
    recipientGroup: "",
    branch: "",
    message: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Bulk SMS</h1>
        <p className="text-sm text-gray-500 mt-1">
          Send SMS notifications to members, staff, or specific groups across
          branches.
        </p>
      </div>

      {/* ─── Stat Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Send className="w-4 h-4 text-green-600" />
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Total Sent</p>
          </div>
          <p className="text-2xl font-bold text-navy-900">24,580</p>
          <p className="text-xs text-green-600 font-medium mt-1">This Month</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Delivered</p>
          </div>
          <p className="text-2xl font-bold text-navy-900">23,940</p>
          <p className="text-xs text-green-600 font-medium mt-1">97.4% Rate</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Pending</p>
          </div>
          <p className="text-2xl font-bold text-navy-900">340</p>
          <p className="text-xs text-amber-500 font-medium mt-1">In Queue</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-600" />
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">SMS Credits</p>
          </div>
          <p className="text-2xl font-bold text-navy-900">15,420</p>
          <p className="text-xs text-gray-400 font-medium mt-1">Remaining</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Compose SMS ─── */}
        <div className="col-span-1 bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-[11px] tracking-[0.12em] uppercase font-bold text-navy-900">
              Compose New SMS
            </h2>
          </div>

          <div className="p-6 space-y-5">
            {/* Recipient Group */}
            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-2">
                Recipient Group
              </label>
              <select
                value={form.recipientGroup}
                onChange={(e) => update("recipientGroup", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
              >
                <option value="">Select group...</option>
                <option>All Members</option>
                <option>All Staff</option>
                <option>Overdue Members</option>
                <option>Active Savers</option>
                <option>Branch Managers</option>
                <option>Custom List</option>
              </select>
            </div>

            {/* Branch */}
            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-2">
                Branch Filter
              </label>
              <select
                value={form.branch}
                onChange={(e) => update("branch", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
              >
                <option value="">All Branches</option>
                <option>Lagos Central</option>
                <option>Abuja Branch</option>
                <option>Port Harcourt</option>
                <option>Kano North</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-2">
                Message
              </label>
              <textarea
                rows={5}
                placeholder="Type your SMS message here..."
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <div className="flex items-center justify-between mt-1.5">
                <p className="text-[10px] text-gray-400">{form.message.length}/160 characters</p>
                <p className="text-[10px] text-gray-400">{Math.ceil((form.message.length || 1) / 160)} SMS</p>
              </div>
            </div>

            {/* Upload */}
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-green-300 transition-colors cursor-pointer">
              <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1.5" />
              <p className="text-xs text-gray-500">Upload CSV of phone numbers</p>
              <p className="text-[10px] text-gray-400 mt-0.5">CSV, XLS (Max 5MB)</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors">
                <Send className="w-4 h-4" />
                Send SMS
              </button>
              <button className="px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
                Preview
              </button>
            </div>
          </div>
        </div>

        {/* ─── SMS History ─── */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-[11px] tracking-[0.12em] uppercase font-bold text-navy-900">
              SMS History
            </h2>
            <button className="flex items-center gap-2 text-sm text-navy-900 font-medium hover:text-green-600 transition-colors">
              <FileText className="w-4 h-4" />
              Export Log
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Date</th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Recipients</th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Message</th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Status</th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Sent By</th>
                </tr>
              </thead>
              <tbody>
                {smsHistory.map((sms, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{sms.date}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-navy-900">{sms.recipients}</p>
                      <p className="text-xs text-gray-400">{sms.recipientCount.toLocaleString()} recipients</p>
                    </td>
                    <td className="px-4 py-4 max-w-[250px]">
                      <p className="text-sm text-gray-600 truncate">{sms.message}</p>
                    </td>
                    <td className="px-4 py-4">{statusBadge(sms.status)}</td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600">{sms.sentBy}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing <span className="font-semibold text-navy-900">1 to 4</span> of{" "}
              <span className="font-semibold text-navy-900">28</span> records
            </p>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400"><ChevronLeft className="w-4 h-4" /></button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-navy-900 text-white text-sm font-semibold">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 text-sm">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
