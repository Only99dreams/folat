import { useState } from "react";
import {
  Search,
  Plus,
  Inbox,
  Send,
  Archive,
  Star,
  Paperclip,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* ─── Message Data ─── */
interface Message {
  id: string;
  senderInitials: string;
  senderBg: string;
  senderName: string;
  subject: string;
  preview: string;
  date: string;
  time: string;
  read: boolean;
  starred: boolean;
  hasAttachment: boolean;
}

const messages: Message[] = [
  {
    id: "MSG-001",
    senderInitials: "AO",
    senderBg: "bg-navy-900",
    senderName: "Adebayo Ogundimu",
    subject: "Q4 Branch Performance Report",
    preview: "Please find attached the quarterly performance report for Lagos Central branch...",
    date: "Oct 24",
    time: "09:15 AM",
    read: false,
    starred: true,
    hasAttachment: true,
  },
  {
    id: "MSG-002",
    senderInitials: "SJ",
    senderBg: "bg-green-600",
    senderName: "Sarah Jenkins",
    subject: "Leave Request Approval",
    preview: "Your annual leave request for November 5-9 has been approved by the HR department...",
    date: "Oct 23",
    time: "04:30 PM",
    read: true,
    starred: false,
    hasAttachment: false,
  },
  {
    id: "MSG-003",
    senderInitials: "FD",
    senderBg: "bg-blue-600",
    senderName: "Finance Department",
    subject: "Monthly Salary Statement - October 2023",
    preview: "Your October 2023 salary statement is now available. Please review the breakdown...",
    date: "Oct 22",
    time: "11:00 AM",
    read: true,
    starred: false,
    hasAttachment: true,
  },
  {
    id: "MSG-004",
    senderInitials: "IT",
    senderBg: "bg-amber-500",
    senderName: "IT Support",
    subject: "System Maintenance Scheduled",
    preview: "Please be informed that the system will undergo maintenance on Sunday Oct 29...",
    date: "Oct 21",
    time: "02:45 PM",
    read: true,
    starred: false,
    hasAttachment: false,
  },
  {
    id: "MSG-005",
    senderInitials: "MA",
    senderBg: "bg-purple-600",
    senderName: "Management",
    subject: "New Policy Update - Loan Disbursement",
    preview: "Effective November 1st, all loan disbursements above ₦500,000 will require...",
    date: "Oct 20",
    time: "10:30 AM",
    read: false,
    starred: true,
    hasAttachment: true,
  },
];

const folders = [
  { icon: Inbox, label: "Inbox", count: 12, active: true },
  { icon: Send, label: "Sent", count: 0, active: false },
  { icon: Star, label: "Starred", count: 3, active: false },
  { icon: Archive, label: "Archived", count: 0, active: false },
];

export default function MessagesPage() {
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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
        <button className="flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition-colors">
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
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    folder.active
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
                      folder.active ? "bg-green-600 text-white" : "bg-gray-100 text-gray-500"
                    }`}>
                      {folder.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Storage */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs font-semibold text-navy-900 mb-2">Storage Used</p>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-1.5">
              <div className="w-1/3 h-full bg-green-500 rounded-full" />
            </div>
            <p className="text-[10px] text-gray-400">1.2 GB of 5 GB used</p>
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
            {messages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => setSelectedMessage(msg.id)}
                className={`w-full flex items-start gap-4 px-6 py-4 text-left hover:bg-gray-50/50 transition-colors ${
                  !msg.read ? "bg-green-50/30" : ""
                } ${selectedMessage === msg.id ? "bg-green-50" : ""}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${msg.senderBg}`}>
                  {msg.senderInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className={`text-sm ${!msg.read ? "font-bold text-navy-900" : "font-medium text-gray-700"}`}>
                      {msg.senderName}
                    </p>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-3">{msg.date}</span>
                  </div>
                  <p className={`text-sm truncate ${!msg.read ? "font-semibold text-navy-900" : "text-gray-600"}`}>
                    {msg.subject}
                  </p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{msg.preview}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                  {msg.starred && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                  {msg.hasAttachment && <Paperclip className="w-3.5 h-3.5 text-gray-400" />}
                  {!msg.read && <span className="w-2 h-2 rounded-full bg-green-500" />}
                </div>
              </button>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing <span className="font-semibold text-navy-900">1 to 5</span> of{" "}
              <span className="font-semibold text-navy-900">12</span> messages
            </p>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-navy-900 text-white text-sm font-semibold">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">3</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
