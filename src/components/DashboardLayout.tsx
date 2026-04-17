import { useState, useEffect, useCallback, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Bell, Mail, Menu, Search, LogOut, Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../auth/useAuth";
import { fetchNotifications, fetchUnreadNotificationCount, markNotificationRead, markAllNotificationsRead } from "../lib/db";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Notification state
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  const loadNotifications = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [notifs, count] = await Promise.all([
        fetchNotifications(user.id),
        fetchUnreadNotificationCount(user.id),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch {}
  }, [user?.id]);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  // Poll every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    loadNotifications();
  };

  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    await markAllNotificationsRead(user.id);
    loadNotifications();
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Unassigned users get a clean full-page layout (no sidebar/header)
  if (user?.role === "unassigned") {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main area */}
      <div className="lg:ml-56 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-100">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3">
            {/* Hamburger + Search */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5 text-navy-900" />
              </button>
              <div className="relative w-full max-w-md hidden sm:block">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search members, loans, staff..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 sm:gap-4 ml-2">
              {/* Mobile search toggle */}
              <button className="sm:hidden p-2 text-gray-400 hover:text-navy-900 transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <div ref={notifRef} className="relative">
                <button
                  onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) loadNotifications(); }}
                  className="relative p-2 text-gray-400 hover:text-navy-900 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification dropdown */}
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <h3 className="text-sm font-bold text-navy-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] font-medium text-green-600 hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                          <p className="text-sm text-gray-400">No notifications yet.</p>
                        </div>
                      ) : notifications.slice(0, 20).map((n) => (
                        <div
                          key={n.id}
                          className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${!n.is_read ? "bg-blue-50/40" : ""}`}
                          onClick={() => {
                            if (!n.is_read) handleMarkRead(n.id);
                            if (n.link) { navigate(n.link); setNotifOpen(false); }
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                              n.type === "success" ? "bg-green-500" :
                              n.type === "warning" ? "bg-amber-500" :
                              n.type === "error" ? "bg-red-500" :
                              "bg-blue-500"
                            }`} />
                            <div className="min-w-0 flex-1">
                              <p className={`text-sm ${!n.is_read ? "font-semibold text-navy-900" : "text-gray-700"}`}>
                                {n.title}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{n.body}</p>
                              <p className="text-[10px] text-gray-300 mt-1">
                                {new Date(n.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {notifications.length > 0 && (
                      <div className="border-t border-gray-100 px-4 py-2.5 text-center">
                        <Link
                          to="/settings/notifications"
                          onClick={() => setNotifOpen(false)}
                          className="text-xs font-medium text-navy-900 hover:underline"
                        >
                          Notification Settings
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button className="relative p-2 text-gray-400 hover:text-navy-900 transition-colors hidden sm:block">
                <Mail className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-gray-200">
                <Link to="/profile" className="text-right hidden sm:block hover:opacity-80 transition-opacity">
                  <p className="text-sm font-semibold text-navy-900">{user?.name ?? "User"}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                    {user?.roleLabel ?? "—"}
                  </p>
                </Link>
                <Link to="/profile" className="w-9 h-9 rounded-full bg-navy-900 flex items-center justify-center text-white text-sm font-bold shrink-0 hover:ring-2 hover:ring-green-500 transition-all">
                  {user?.avatar?.[0] ?? "U"}
                </Link>
                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>

        {/* Status bar */}
        <footer className="bg-navy-900 text-gray-400 text-[10px] tracking-wide px-4 sm:px-6 py-2 flex items-center gap-4 sm:gap-6 overflow-x-auto">
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Main Database: Optimal
          </span>
          <span className="flex items-center gap-1.5 whitespace-nowrap hidden sm:flex">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            API Service: 14ms Latency
          </span>
          <span className="flex items-center gap-1.5 whitespace-nowrap hidden md:flex">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            SMS Gateway: Active
          </span>
          <span className="ml-auto text-gray-500 whitespace-nowrap hidden sm:block">
            © 2025 FOLAT Cooperative Management System v2.1
          </span>
        </footer>
      </div>
    </div>
  );
}
