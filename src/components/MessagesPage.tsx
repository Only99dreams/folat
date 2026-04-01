import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Inbox,
  Send,
  Loader2,
} from "lucide-react";
import { fetchMessages, markMessageRead, sendMessage, fetchAllProfiles } from "../lib/db";
import { useAuth } from "../auth/useAuth";

const avatarColors = ["bg-navy-900","bg-green-600","bg-blue-600","bg-amber-500","bg-purple-600","bg-pink-600","bg-teal-600"];

export default function MessagesPage() {
  const { user } = useAuth();
  const [msgs, setMsgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFolder, setActiveFolder] = useState("inbox");
  const [showCompose, setShowCompose] = useState(false);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [composeSending, setComposeSending] = useState(false);
  const [composeForm, setComposeForm] = useState({ recipient_id: "", subject: "", body: "" });

  const loadMessages = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await fetchMessages(user.id, activeFolder === "inbox" ? undefined : activeFolder);
      setMsgs(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadMessages(); }, [user?.id, activeFolder]);

  const openCompose = () => {
    if (profiles.length === 0) {
      fetchAllProfiles().then(setProfiles).catch(() => {});
    }
    setComposeForm({ recipient_id: "", subject: "", body: "" });
    setShowCompose(true);
  };

  const handleComposeSend = async () => {
    if (!composeForm.recipient_id || !composeForm.subject.trim() || !composeForm.body.trim()) return;
    setComposeSending(true);
    try {
      await sendMessage({
        sender_id: user!.id,
        recipient_id: composeForm.recipient_id,
        subject: composeForm.subject,
        body: composeForm.body,
      });
      setShowCompose(false);
      loadMessages();
    } catch {}
    setComposeSending(false);
  };

  const handleSelect = async (id: string) => {
    setSelectedMessage(id);
    const msg = msgs.find(m => m.id === id);
    if (msg && !msg.is_read) {
      await markMessageRead(id);
      setMsgs(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
    }
  };

  const filtered = msgs.filter(m => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (m.subject || "").toLowerCase().includes(q) ||
      (m.body || "").toLowerCase().includes(q) ||
      (m.sender?.full_name || "").toLowerCase().includes(q);
  });

  const unreadCount = msgs.filter(m => !m.is_read).length;

  const folders = [
    { icon: Inbox, label: "Inbox", key: "inbox", count: unreadCount },
    { icon: Send, label: "Sent", key: "sent", count: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Messages</h1>
          <p className="text-sm text-gray-500 mt-1">
            Internal communication hub for staff and branch coordination.
          </p>
        </div>
        <button onClick={openCompose} className="flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition-colors">
          <Plus className="w-4 h-4" />
          Compose Message
        </button>
      </div>

      {/* ─── Main Content ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Folders */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="space-y-1">
              {folders.map((folder, i) => (
                <button
                  key={i}
                  onClick={() => setActiveFolder(folder.key)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    activeFolder === folder.key
                      ? "bg-green-50 text-green-700 font-semibold"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <folder.icon className="w-4 h-4" />
                    {folder.label}
                  </div>
                  {folder.count > 0 && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      activeFolder === folder.key ? "bg-green-600 text-white" : "bg-gray-100 text-gray-500"
                    }`}>
                      {folder.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs font-semibold text-navy-900 mb-2">Quick Stats</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Total Messages</span>
                <span className="font-semibold text-navy-900">{msgs.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Unread</span>
                <span className="font-semibold text-green-600">{unreadCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Message List */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-3 bg-white rounded-xl border border-gray-100 overflow-hidden">
          {/* Search */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Messages */}
          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-navy-900" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">No messages</div>
            ) : filtered.map((msg: any, i: number) => {
              const senderName = msg.sender?.full_name || "Unknown";
              const initials = msg.sender?.avatar_initials || senderName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0,2);
              const bgColor = avatarColors[i % avatarColors.length];
              const dateStr = msg.created_at ? new Date(msg.created_at).toLocaleDateString("en-NG",{month:"short",day:"numeric"}) : "";
              return (
              <button
                key={msg.id}
                onClick={() => handleSelect(msg.id)}
                className={`w-full flex items-start gap-4 px-6 py-4 text-left hover:bg-gray-50/50 transition-colors ${
                  !msg.is_read ? "bg-green-50/30" : ""
                } ${selectedMessage === msg.id ? "bg-green-50" : ""}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${bgColor}`}>
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className={`text-sm ${!msg.is_read ? "font-bold text-navy-900" : "font-medium text-gray-700"}`}>
                      {senderName}
                    </p>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-3">{dateStr}</span>
                  </div>
                  <p className={`text-sm truncate ${!msg.is_read ? "font-semibold text-navy-900" : "text-gray-600"}`}>
                    {msg.subject}
                  </p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{(msg.body || "").slice(0,80)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                  {!msg.is_read && <span className="w-2 h-2 rounded-full bg-green-500" />}
                </div>
              </button>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing <span className="font-semibold text-navy-900">1 to {filtered.length}</span> of{" "}
              <span className="font-semibold text-navy-900">{msgs.length}</span> messages
            </p>
          </div>
        </div>
      </div>

      {/* ─── Message Detail Panel ─── */}
      {selectedMessage && (() => {
        const msg = msgs.find(m => m.id === selectedMessage);
        if (!msg) return null;
        const senderName = msg.sender?.full_name || "Unknown";
        const recipientName = msg.recipient?.full_name || "";
        return (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-navy-900">{msg.subject}</h2>
              <button onClick={() => setSelectedMessage(null)} className="text-gray-400 hover:text-gray-600 text-sm font-medium">Close</button>
            </div>
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-navy-900">{senderName}</p>
                {recipientName && <p className="text-xs text-gray-400">To: {recipientName}</p>}
              </div>
              <p className="text-xs text-gray-400">{msg.created_at ? new Date(msg.created_at).toLocaleString("en-NG") : ""}</p>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{msg.body}</p>
            </div>
          </div>
        );
      })()}

      {/* ─── Compose Message Modal ─── */}
      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-navy-900">Compose Message</h3>
              <button onClick={() => setShowCompose(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-1.5">To</label>
                <select
                  value={composeForm.recipient_id}
                  onChange={(e) => setComposeForm(prev => ({ ...prev, recipient_id: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                >
                  <option value="">Select recipient...</option>
                  {profiles.filter(p => p.id !== user?.id).map(p => (
                    <option key={p.id} value={p.id}>{p.full_name} ({p.role || "staff"})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-1.5">Subject</label>
                <input
                  type="text"
                  placeholder="Message subject"
                  value={composeForm.subject}
                  onChange={(e) => setComposeForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-1.5">Message</label>
                <textarea
                  rows={6}
                  placeholder="Type your message..."
                  value={composeForm.body}
                  onChange={(e) => setComposeForm(prev => ({ ...prev, body: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowCompose(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50">Cancel</button>
              <button
                onClick={handleComposeSend}
                disabled={composeSending || !composeForm.recipient_id || !composeForm.subject.trim() || !composeForm.body.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 disabled:opacity-50"
              >
                {composeSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
