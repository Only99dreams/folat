import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
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
} from "lucide-react";

type NavItem = {
  label: string;
  icon: React.ElementType;
  path?: string;
  children?: { label: string; path: string }[];
};

const mainMenu: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
];

const operations: NavItem[] = [
  {
    label: "Members",
    icon: Users,
    children: [
      { label: "All Members", path: "/members" },
      { label: "Add Cooperative", path: "/members/add-cooperative" },
      { label: "Add External", path: "/members/add-external" },
    ],
  },
  {
    label: "Savings",
    icon: PiggyBank,
    children: [
      { label: "Dashboard", path: "/savings" },
      { label: "Record Deposit", path: "/savings/deposit" },
      { label: "Bulk Upload", path: "/savings/bulk-upload" },
      { label: "Transactions", path: "/savings/transactions" },
      { label: "Statement", path: "/savings/statement" },
    ],
  },
  {
    label: "Loans",
    icon: Landmark,
    children: [
      { label: "Applications", path: "/loans" },
      { label: "New Application", path: "/loans/new" },
      { label: "Active Loans", path: "/loans/active" },
      { label: "Overdue Loans", path: "/loans/overdue" },
      { label: "Repayments", path: "/loans/repayments" },
      { label: "Record Repayment", path: "/loans/record-repayment" },
    ],
  },
  {
    label: "Groups",
    icon: UsersRound,
    children: [
      { label: "All Groups", path: "/groups" },
      { label: "Create Group", path: "/groups/add" },
    ],
  },
];

const management: NavItem[] = [
  {
    label: "HR",
    icon: UserCog,
    children: [
      { label: "Dashboard", path: "/hr" },
      { label: "Staff List", path: "/hr/staff" },
      { label: "Add Staff", path: "/hr/staff/add" },
      { label: "Leave Requests", path: "/hr/leave-requests" },
      { label: "Salary Structure", path: "/hr/salary-structure" },
      { label: "Attendance Log", path: "/hr/attendance" },
    ],
  },
  {
    label: "Finance",
    icon: DollarSign,
    children: [
      { label: "Dashboard", path: "/finance" },
      { label: "Add Income", path: "/finance/add-income" },
      { label: "Add Expense", path: "/finance/add-expense" },
      { label: "Ledger", path: "/finance/ledger" },
      { label: "Fund Requests", path: "/finance/fund-requests" },
    ],
  },
  {
    label: "Branches",
    icon: GitBranch,
    children: [
      { label: "All Branches", path: "/branches" },
      { label: "Add Branch", path: "/branches/add" },
    ],
  },
  {
    label: "Communication",
    icon: MessageSquare,
    children: [
      { label: "Messages", path: "/communication/messages" },
      { label: "Bulk SMS", path: "/communication/sms" },
    ],
  },
  { label: "Reports", icon: FileText, path: "/reports" },
];

const system: NavItem[] = [
  {
    label: "Security",
    icon: ShieldCheck,
    children: [
      { label: "Access Control", path: "/security/access" },
      { label: "Audit Log", path: "/security/audit" },
    ],
  },
  {
    label: "Settings",
    icon: Settings,
    children: [
      { label: "General", path: "/settings/general" },
      { label: "Notifications", path: "/settings/notifications" },
    ],
  },
];

function SidebarSection({
  title,
  items,
  onNavigate,
}: {
  title: string;
  items: NavItem[];
  onNavigate?: () => void;
}) {
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

  // Close sidebar on route change (mobile)
  useEffect(() => {
    onClose();
  }, [location.pathname]);

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

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
          <SidebarSection title="Main Menu" items={mainMenu} onNavigate={onClose} />
          <SidebarSection title="Operations" items={operations} onNavigate={onClose} />
          <SidebarSection title="Management" items={management} onNavigate={onClose} />
          <SidebarSection title="System" items={system} onNavigate={onClose} />
        </nav>
      </aside>
    </>
  );
}
