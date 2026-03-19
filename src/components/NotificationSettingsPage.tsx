import { useState } from "react";
import {
  Save,
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Volume2,
  AlertTriangle,
  CreditCard,
  Users,
  TrendingUp,
  Shield,
  Calendar,
} from "lucide-react";

/* ─── Notification categories ─── */
interface NotificationCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  channels: { email: boolean; sms: boolean; push: boolean };
}

const initialCategories: NotificationCategory[] = [
  { id: "1", name: "Loan Alerts", description: "Loan applications, approvals, disbursements, and repayment reminders", icon: CreditCard, channels: { email: true, sms: true, push: true } },
  { id: "2", name: "Savings Alerts", description: "Deposit confirmations, withdrawal requests, and balance updates", icon: TrendingUp, channels: { email: true, sms: true, push: false } },
  { id: "3", name: "Member Updates", description: "New registrations, profile changes, and membership renewals", icon: Users, channels: { email: true, sms: false, push: true } },
  { id: "4", name: "Payment Reminders", description: "Upcoming due dates, overdue notices, and penalty alerts", icon: AlertTriangle, channels: { email: true, sms: true, push: true } },
  { id: "5", name: "Security Alerts", description: "Login attempts, password changes, and suspicious activities", icon: Shield, channels: { email: true, sms: true, push: true } },
  { id: "6", name: "System Updates", description: "Maintenance schedules, feature updates, and system announcements", icon: Bell, channels: { email: true, sms: false, push: false } },
  { id: "7", name: "Meeting Reminders", description: "Scheduled meetings, AGM notices, and event notifications", icon: Calendar, channels: { email: true, sms: true, push: true } },
  { id: "8", name: "Report Ready", description: "Notifications when scheduled reports are generated and ready", icon: Mail, channels: { email: true, sms: false, push: true } },
];

export default function NotificationSettingsPage() {
  const [categories, setCategories] = useState(initialCategories);
  const [globalEmail, setGlobalEmail] = useState(true);
  const [globalSMS, setGlobalSMS] = useState(true);
  const [globalPush, setGlobalPush] = useState(true);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(true);
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("07:00");

  const toggleChannel = (categoryId: string, channel: "email" | "sms" | "push") => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? { ...cat, channels: { ...cat.channels, [channel]: !cat.channels[channel] } }
          : cat
      )
    );
  };

  const ToggleSwitch = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        enabled ? "bg-green-600" : "bg-gray-300"
      }`}
    >
      <div
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          enabled ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Notification Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure how and when you receive notifications across all channels.
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors">
          <Save className="w-4 h-4" />
          Save Preferences
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Notification Categories (2 cols) ─── */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          {/* Global Toggles */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-[11px] tracking-[0.12em] uppercase font-bold text-navy-900">
                Global Channels
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-navy-900">Email</p>
                      <p className="text-xs text-gray-400">All email alerts</p>
                    </div>
                  </div>
                  <ToggleSwitch enabled={globalEmail} onToggle={() => setGlobalEmail(!globalEmail)} />
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-navy-900">SMS</p>
                      <p className="text-xs text-gray-400">Text messages</p>
                    </div>
                  </div>
                  <ToggleSwitch enabled={globalSMS} onToggle={() => setGlobalSMS(!globalSMS)} />
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                      <Smartphone className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-navy-900">Push</p>
                      <p className="text-xs text-gray-400">In-app alerts</p>
                    </div>
                  </div>
                  <ToggleSwitch enabled={globalPush} onToggle={() => setGlobalPush(!globalPush)} />
                </div>
              </div>
            </div>
          </div>

          {/* Category-level toggles */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-[11px] tracking-[0.12em] uppercase font-bold text-navy-900">
                Notification Categories
              </h2>
            </div>

            <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Category</th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">Email</th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">SMS</th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">Push</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                          <cat.icon className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-navy-900">{cat.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{cat.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <ToggleSwitch enabled={cat.channels.email} onToggle={() => toggleChannel(cat.id, "email")} />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <ToggleSwitch enabled={cat.channels.sms} onToggle={() => toggleChannel(cat.id, "sms")} />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <ToggleSwitch enabled={cat.channels.push} onToggle={() => toggleChannel(cat.id, "push")} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>

        {/* ─── Right Column ─── */}
        <div className="col-span-1 space-y-6">
          {/* Quiet Hours */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-green-600" />
                <h2 className="text-[11px] tracking-[0.12em] uppercase font-bold text-navy-900">
                  Quiet Hours
                </h2>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-navy-900">Enable Quiet Hours</p>
                  <p className="text-xs text-gray-400 mt-0.5">Mute non-critical notifications</p>
                </div>
                <ToggleSwitch enabled={quietHoursEnabled} onToggle={() => setQuietHoursEnabled(!quietHoursEnabled)} />
              </div>
              {quietHoursEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-navy-900 mb-2">Start</label>
                    <input type="time" value={quietStart} onChange={(e) => setQuietStart(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy-900 mb-2">End</label>
                    <input type="time" value={quietEnd} onChange={(e) => setQuietEnd(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-400 leading-relaxed">
                Security alerts will still be delivered during quiet hours.
              </p>
            </div>
          </div>

          {/* Email Digest */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-green-600" />
                <h2 className="text-[11px] tracking-[0.12em] uppercase font-bold text-navy-900">
                  Email Digest
                </h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">Digest Frequency</label>
                <select className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none">
                  <option>Daily Summary</option>
                  <option>Weekly Summary</option>
                  <option>Instant (No Digest)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">Delivery Time</label>
                <select className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none">
                  <option>8:00 AM</option>
                  <option>9:00 AM</option>
                  <option>12:00 PM</option>
                  <option>6:00 PM</option>
                </select>
              </div>
            </div>
          </div>

          {/* SMS Settings */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-green-600" />
                <h2 className="text-[11px] tracking-[0.12em] uppercase font-bold text-navy-900">
                  SMS Provider
                </h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">Provider</label>
                <select className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none">
                  <option>Africa's Talking</option>
                  <option>Twilio</option>
                  <option>Termii</option>
                  <option>Vonage</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">Sender ID</label>
                <input type="text" defaultValue="FOLAT" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <p className="text-xs text-green-700 font-medium">✓ SMS Provider Connected</p>
                <p className="text-[10px] text-green-600 mt-0.5">Credits: 15,420 remaining</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
