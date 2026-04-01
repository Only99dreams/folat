import { useState, useEffect } from "react";
import {
  Send,
  Upload,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  FileText,
  Loader2,
} from "lucide-react";
import { sendSMS, fetchSMSLog, fetchSMSStats, fetchBranches } from "../lib/db";
import { useAuth } from "../auth/useAuth";

const statusBadge = (status: string) => {
  const styles: Record<string, { bg: string; icon: React.ElementType }> = {
    delivered: { bg: "bg-green-100 text-green-700", icon: CheckCircle2 },
    pending: { bg: "bg-amber-100 text-amber-700", icon: Clock },
    failed: { bg: "bg-red-100 text-red-600", icon: XCircle },
  };
  const s = styles[status] || styles.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold tracking-wider ${s.bg}`}>
      <s.icon className="w-3 h-3" />
      {status.toUpperCase()}
    </span>
  );
};

export default function BulkSMSPage() {
  const { user } = useAuth();
  const [branches, setBranches] = useState<any[]>([]);
  const [smsHistory, setSmsHistory] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalSent: 0, delivered: 0, pending: 0, failed: 0 });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [csvPhones, setCsvPhones] = useState<string[]>([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [form, setForm] = useState({
    recipientGroup: "",
    branch: "",
    message: "",
  });

  const loadData = () => {
    Promise.all([fetchBranches(), fetchSMSLog(), fetchSMSStats()])
      .then(([b, s, st]) => { setBranches(b); setSmsHistory(s); setStats(st); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => { loadData(); }, []);

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("CSV file must be under 5 MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const phones = text.split(/[\n,;]+/).map(p => p.replace(/[^\d+]/g, "").trim()).filter(p => p.length >= 7);
      if (phones.length === 0) { setError("No valid phone numbers found in CSV"); return; }
      setCsvPhones(phones);
      setCsvFileName(file.name);
      setError("");
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const exportLog = () => {
    if (smsHistory.length === 0) return;
    const header = "Date,Recipients,Message,Status,Recipient Count";
    const rows = smsHistory.map(s =>
      `"${s.created_at ? new Date(s.created_at).toLocaleDateString() : ""}","${s.recipients}","${(s.message || "").replace(/"/g, "'")}","${s.status}","${s.recipient_count || 0}"`
    );
    const blob = new Blob([header + "\n" + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "sms_log.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSend = async () => {
    if (!form.message.trim()) { setError("Enter a message"); return; }
    if (!form.recipientGroup && csvPhones.length === 0) { setError("Select a recipient group or upload a CSV of phone numbers"); return; }
    setError(""); setSuccess(""); setSending(true);
    try {
      const recipients = csvPhones.length > 0
        ? csvPhones
        : [form.recipientGroup + (form.branch ? ` (${form.branch})` : "")];
      await sendSMS({
        sent_by: user?.id || "",
        recipients,
        message: form.message,
      });
      setSuccess(`SMS sent to ${recipients.length.toLocaleString()} recipient(s)`);
      setForm({ recipientGroup: "", branch: "", message: "" });
      setCsvPhones([]); setCsvFileName("");
      loadData();
    } catch (e: any) { setError(e.message || "Failed to send SMS"); }
    setSending(false);
  };

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
          <p className="text-2xl font-bold text-navy-900">{stats.totalSent.toLocaleString()}</p>
          <p className="text-xs text-green-600 font-medium mt-1">All Time</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Delivered</p>
          </div>
          <p className="text-2xl font-bold text-navy-900">{stats.delivered.toLocaleString()}</p>
          <p className="text-xs text-green-600 font-medium mt-1">{stats.totalSent > 0 ? ((stats.delivered / stats.totalSent) * 100).toFixed(1) + '% Rate' : '—'}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Pending</p>
          </div>
          <p className="text-2xl font-bold text-navy-900">{stats.pending.toLocaleString()}</p>
          <p className="text-xs text-amber-500 font-medium mt-1">In Queue</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Failed</p>
          </div>
          <p className="text-2xl font-bold text-navy-900">{stats.failed.toLocaleString()}</p>
          <p className="text-xs text-red-500 font-medium mt-1">Delivery Failed</p>
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
              {branches.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
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
            {csvPhones.length > 0 ? (
              <div className="border border-green-200 bg-green-50 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-green-800">{csvFileName}</p>
                  <p className="text-xs text-green-600">{csvPhones.length.toLocaleString()} phone numbers loaded</p>
                </div>
                <button onClick={() => { setCsvPhones([]); setCsvFileName(""); }} className="text-red-400 hover:text-red-600"><XCircle className="w-4 h-4" /></button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-green-300 transition-colors cursor-pointer block">
                <input type="file" className="hidden" accept=".csv,.txt" onChange={handleCsvUpload} />
                <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1.5" />
                <p className="text-xs text-gray-500">Upload CSV of phone numbers</p>
                <p className="text-[10px] text-gray-400 mt-0.5">CSV, TXT (Max 5MB)</p>
              </label>
            )}

            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
            {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">{success}</div>}

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button onClick={handleSend} disabled={sending} className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send SMS
              </button>
              <button onClick={() => { if (!form.message.trim()) { setError("Enter a message to preview"); return; } setShowPreview(true); }} className="px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
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
            <button onClick={exportLog} className="flex items-center gap-2 text-sm text-navy-900 font-medium hover:text-green-600 transition-colors">
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
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin text-navy-900 mx-auto" /></td></tr>
                ) : smsHistory.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-gray-400 text-sm">No SMS history</td></tr>
                ) : smsHistory.map((sms: any, i: number) => (
                  <tr key={sms.id || i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{sms.created_at ? new Date(sms.created_at).toLocaleDateString("en-NG",{year:"numeric",month:"short",day:"numeric"}) : "—"}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-navy-900">{sms.recipients}</p>
                      <p className="text-xs text-gray-400">{(sms.recipient_count || 0).toLocaleString()} recipients</p>
                    </td>
                    <td className="px-4 py-4 max-w-[250px]">
                      <p className="text-sm text-gray-600 truncate">{sms.message}</p>
                    </td>
                    <td className="px-4 py-4">{statusBadge(sms.status || "pending")}</td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600">{sms.sender?.full_name || (sms.sent_by ? sms.sent_by.slice(0,8) : "—")}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing <span className="font-semibold text-navy-900">{smsHistory.length}</span> records
            </p>
          </div>
        </div>
      </div>
      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6 space-y-4">
            <h3 className="text-lg font-bold text-navy-900">SMS Preview</h3>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-500 mb-1">Recipients</p>
              <p className="text-sm text-navy-900">{csvPhones.length > 0 ? `${csvPhones.length} numbers from CSV` : form.recipientGroup || '—'}{form.branch ? ` • ${form.branch}` : ''}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-500 mb-1">Message ({form.message.length} chars / {Math.ceil((form.message.length || 1) / 160)} SMS)</p>
              <p className="text-sm text-navy-900 whitespace-pre-wrap">{form.message}</p>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowPreview(false)} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50">Close</button>
              <button onClick={() => { setShowPreview(false); handleSend(); }} className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 flex items-center gap-2"><Send className="w-4 h-4" />Send Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
