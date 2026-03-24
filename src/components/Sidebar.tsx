import { useState, useEffect, useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Landmark,
  PiggyBank,
  UsersRound,
  UserCog,
  DollarSign,
  MessageSquare,
  FileText,
  GitBranch,
  ShieldCheck,
  Settings,
  ChevronDown,
  ChevronRight,
  X,
  LogOut,
} from "lucide-react";
import { useAuth, type Permission } from "../auth/AuthContext";

type NavChild = { label: string; path: string; permission?: Permission };

type NavItem = {
  label: string;
  icon: React.ElementType;
  path?: string;
  permission?: Permission;
  children?: NavChild[];
};

const mainMenu: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
];

const operations: NavItem[] = [
  {
    label: "Members",
    icon: Users,
    permission: "members.view",
    children: [
      { label: "All Members", path: "/members", permission: "members.view" },
      { label: "Add Cooperative", path: "/members/add-cooperative", permission: "members.add" },
      { label: "Add External", path: "/members/add-external", permission: "members.add" },
    ],
  },
  {
    label: "Savings",
    icon: PiggyBank,
    permission: "savings.view",
    children: [
      { label: "Dashboard", path: "/savings", permission: "savings.view" },
      { label: "Record Deposit", path: "/savings/deposit", permission: "savings.deposit" },
      { label: "Bulk Upload", path: "/savings/bulk-upload", permission: "savings.bulk_upload" },
      { label: "Transactions", path: "/savings/transactions", permission: "savings.transactions" },
      { label: "Statement", path: "/savings/statement", permission: "savings.statement" },
    ],
  },
  {
    label: "Loans",
    icon: Landmark,
    permission: "loans.view",
    children: [
      { label: "Applications", path: "/loans", permission: "loans.view" },
      { label: "New Application", path: "/loans/new", permission: "loans.create" },
      { label: "Active Loans", path: "/loans/active", permission: "loans.view" },
      { label: "Overdue Loans", path: "/loans/overdue", permission: "loans.view" },
      { label: "Repayments", path: "/loans/repayments", permission: "loans.repayments" },
      { label: "Record Repayment", path: "/loans/record-repayment", permission: "loans.record_repayment" },
    ],
  },
  {
    label: "Groups",
    icon: UsersRound,
    permission: "groups.view",
    children: [
      { label: "All Groups", path: "/groups", permission: "groups.view" },
      { label: "Create Group", path: "/groups/add", permission: "groups.create" },
    ],
  },
];

const management: NavItem[] = [
  {
    label: "HR",
    icon: UserCog,
    permission: "hr.view",
    children: [
      { label: "Dashboard", path: "/hr", permission: "hr.view" },
      { label: "Staff List", path: "/hr/staff", permission: "hr.staff_list" },
      { label: "Add Staff", path: "/hr/staff/add", permission: "hr.add_staff" },
      { label: "Leave Requests", path: "/hr/leave-requests", permission: "hr.leave_requests" },
      { label: "Salary Structure", path: "/hr/salary-structure", permission: "hr.salary_structure" },
      { label: "Attendance Log", path: "/hr/attendance", permission: "hr.attendance" },
    ],
  },
  {
    label: "Finance",
    icon: DollarSign,
    permission: "finance.view",
    children: [
      { label: "Dashboard", path: "/finance", permission: "finance.view" },
      { label: "Add Income", path: "/finance/add-income", permission: "finance.add_income" },
      { label: "Add Expense", path: "/finance/add-expense", permission: "finance.add_expense" },
      { label: "Ledger", path: "/finance/ledger", permission: "finance.ledger" },
      { label: "Fund Requests", path: "/finance/fund-requests", permission: "finance.fund_requests" },
    ],
  },
  {
    label: "Branches",
    icon: GitBranch,
    permission: "branches.view",
    children: [
      { label: "All Branches", path: "/branches", permission: "branches.view" },
      { label: "Add Branch", path: "/branches/add", permission: "branches.add" },
    ],
  },
  {
    label: "Communication",
    icon: MessageSquare,
    permission: "communication.messages",
    children: [
      { label: "Messages", path: "/communication/messages", permission: "communication.messages" },
      { label: "Bulk SMS", path: "/communication/sms", permission: "communication.sms" },
    ],
  },
  { label: "Reports", icon: FileText, path: "/reports", permission: "reports.view" },
];

const system: NavItem[] = [
  {
    label: "Security",
    icon: ShieldCheck,
    permission: "security.access_control",
    children: [
      { label: "Access Control", path: "/security/access", permission: "security.access_control" },
      { label: "Audit Log", path: "/security/audit", permission: "security.audit_log" },
    ],
  },
  {
    label: "Settings",
    icon: Settings,
    permission: "settings.general",
    children: [
      { label: "General", path: "/settings/general", permission: "settings.general" },
      { label: "Notifications", path: "/settings/notifications", permission: "settings.notifications" },
    ],
  },
];

/** Filter a NavItem (and its children) based on what the user can see */
function filterByPermission(items: NavItem[], hasPermission: (p: Permission) => boolean): NavItem[] {
  return items
    .filter((item) => {
      if (!item.permission) return true;
      // For parent items with children, keep if user has the parent permission OR any child permission
      if (item.children) {
        return hasPermission(item.permission) || item.children.some((c) => c.permission && hasPermission(c.permission));
      }
      return hasPermission(item.permission);
    })
    .map((item) => {
      if (!item.children) return item;
      return {
        ...item,
        children: item.children.filter((c) => !c.permission || hasPermission(c.permission)),
      };
    })
    .filter((item) => !item.children || item.children.length > 0);
}

function SidebarSection({
  title,
  items,
  onNavigate,
}: {
  title: string;
  items: NavItem[];
  onNavigate?: () => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="mb-4">
      <p className="px-4 text-[10px] tracking-[0.12em] uppercase text-gray-400 font-semibold mb-2">
        {title}
      </p>
      <div className="space-y-0.5">
        {items.map((item) => (
          <SidebarItem key={item.label} item={item} onNavigate={onNavigate} />
        ))}
      </div>
    </div>
  );
}

function SidebarItem({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isActive =
    item.path === location.pathname ||
    item.children?.some((c) => location.pathname.startsWith(c.path));

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={`w-full flex items-center justify-between px-4 py-2.5 text-sm rounded-lg transition-colors ${
            isActive
              ? "text-navy-900 font-semibold bg-gray-100"
              : "text-gray-500 hover:text-navy-900 hover:bg-gray-50"
          }`}
        >
          <span className="flex items-center gap-3">
            <item.icon className="w-[18px] h-[18px]" />
            {item.label}
          </span>
          {open ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        {open && (
          <div className="ml-10 mt-1 space-y-0.5">
            {item.children.map((child) => (
              <NavLink
                key={child.path}
                to={child.path}
                onClick={onNavigate}
                className={({ isActive: a }) =>
                  `block px-3 py-2 text-sm rounded-lg transition-colors ${
                    a
                      ? "text-green-600 font-medium"
                      : "text-gray-400 hover:text-navy-900"
                  }`
                }
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.path!}
      onClick={onNavigate}
      className={({ isActive: a }) =>
        `flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition-colors ${
          a
            ? "text-white bg-green-600 font-semibold shadow-sm"
            : "text-gray-500 hover:text-navy-900 hover:bg-gray-50"
        }`
      }
    >
      <item.icon className="w-[18px] h-[18px]" />
      {item.label}
    </NavLink>
  );
}

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasPermission } = useAuth();

  // Filter nav items by current user's permissions
  const filteredOps = useMemo(() => filterByPermission(operations, hasPermission), [hasPermission]);
  const filteredMgmt = useMemo(() => filterByPermission(management, hasPermission), [hasPermission]);
  const filteredSys = useMemo(() => filterByPermission(system, hasPermission), [hasPermission]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    onClose();
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      {/* Backdrop (mobile only) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-100 flex flex-col z-50 w-64 lg:w-56 transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo + close button */}
        <div className="px-4 py-5 border-b border-gray-100 flex items-center justify-between">
          <img
            src="/logo.png"
            alt="FOLAT Multipurpose Investment"
            className="h-9"
          />
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* User badge */}
        {user && (
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-navy-900 truncate">{user.name}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">{user.roleLabel}</p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
          <SidebarSection title="Main Menu" items={mainMenu} onNavigate={onClose} />
          {filteredOps.length > 0 && <SidebarSection title="Operations" items={filteredOps} onNavigate={onClose} />}
          {filteredMgmt.length > 0 && <SidebarSection title="Management" items={filteredMgmt} onNavigate={onClose} />}
          {filteredSys.length > 0 && <SidebarSection title="System" items={filteredSys} onNavigate={onClose} />}
        </nav>

        {/* Logout */}
        <div className="px-3 py-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 rounded-lg hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
}
