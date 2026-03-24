/* ─── Role Definitions ─── */
export type UserRole =
  | "super_admin"
  | "branch_manager"
  | "finance_officer"
  | "loan_officer"
  | "front_desk"
  | "auditor"
  | "hr_manager";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  branch: string;
  avatar: string;
}

/* ─── Permission Keys ─── */
export type Permission =
  | "members.view" | "members.add" | "members.edit" | "members.delete"
  | "savings.view" | "savings.deposit" | "savings.bulk_upload" | "savings.transactions" | "savings.statement"
  | "loans.view" | "loans.create" | "loans.approve" | "loans.disburse" | "loans.repayments" | "loans.record_repayment"
  | "groups.view" | "groups.create"
  | "finance.view" | "finance.add_income" | "finance.add_expense" | "finance.ledger" | "finance.fund_requests" | "finance.approve_requests"
  | "hr.view" | "hr.staff_list" | "hr.add_staff" | "hr.leave_requests" | "hr.salary_structure" | "hr.attendance"
  | "branches.view" | "branches.add"
  | "communication.messages" | "communication.sms"
  | "reports.view"
  | "security.access_control" | "security.audit_log"
  | "settings.general" | "settings.notifications";

/* ─── Role → Permissions Map ─── */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    "members.view", "members.add", "members.edit", "members.delete",
    "savings.view", "savings.deposit", "savings.bulk_upload", "savings.transactions", "savings.statement",
    "loans.view", "loans.create", "loans.approve", "loans.disburse", "loans.repayments", "loans.record_repayment",
    "groups.view", "groups.create",
    "finance.view", "finance.add_income", "finance.add_expense", "finance.ledger", "finance.fund_requests", "finance.approve_requests",
    "hr.view", "hr.staff_list", "hr.add_staff", "hr.leave_requests", "hr.salary_structure", "hr.attendance",
    "branches.view", "branches.add",
    "communication.messages", "communication.sms",
    "reports.view",
    "security.access_control", "security.audit_log",
    "settings.general", "settings.notifications",
  ],
  branch_manager: [
    "members.view", "members.add", "members.edit",
    "savings.view", "savings.deposit", "savings.bulk_upload", "savings.transactions", "savings.statement",
    "loans.view", "loans.create", "loans.approve", "loans.repayments", "loans.record_repayment",
    "groups.view", "groups.create",
    "finance.view", "finance.ledger", "finance.fund_requests", "finance.approve_requests",
    "hr.view", "hr.staff_list", "hr.leave_requests", "hr.attendance",
    "branches.view",
    "communication.messages",
    "reports.view",
  ],
  finance_officer: [
    "members.view",
    "savings.view", "savings.deposit", "savings.transactions", "savings.statement",
    "loans.view", "loans.disburse", "loans.repayments",
    "finance.view", "finance.add_income", "finance.add_expense", "finance.ledger", "finance.fund_requests",
    "reports.view",
  ],
  loan_officer: [
    "members.view",
    "savings.view", "savings.transactions",
    "loans.view", "loans.create", "loans.repayments", "loans.record_repayment",
    "groups.view",
    "reports.view",
  ],
  front_desk: [
    "members.view", "members.add",
    "savings.view", "savings.deposit",
    "groups.view",
    "communication.messages",
  ],
  auditor: [
    "members.view",
    "savings.view", "savings.transactions", "savings.statement",
    "loans.view", "loans.repayments",
    "finance.view", "finance.ledger",
    "reports.view",
    "security.audit_log",
  ],
  hr_manager: [
    "members.view",
    "hr.view", "hr.staff_list", "hr.add_staff", "hr.leave_requests", "hr.salary_structure", "hr.attendance",
    "reports.view",
    "communication.messages",
  ],
};

/* ─── Demo Users ─── */
export const DEMO_USERS: { email: string; password: string; user: User }[] = [
  {
    email: "admin@folat.com",
    password: "admin123",
    user: { id: "u1", name: "Adebayo Ogunleye", email: "admin@folat.com", role: "super_admin", roleLabel: "Super Admin", branch: "HQ Lagos", avatar: "AO" },
  },
  {
    email: "branch@folat.com",
    password: "branch123",
    user: { id: "u2", name: "Fatima Bello", email: "branch@folat.com", role: "branch_manager", roleLabel: "Branch Manager", branch: "Abuja North", avatar: "FB" },
  },
  {
    email: "finance@folat.com",
    password: "finance123",
    user: { id: "u3", name: "Chinedu Okafor", email: "finance@folat.com", role: "finance_officer", roleLabel: "Finance Officer", branch: "HQ Lagos", avatar: "CO" },
  },
  {
    email: "loans@folat.com",
    password: "loans123",
    user: { id: "u4", name: "Amina Yusuf", email: "loans@folat.com", role: "loan_officer", roleLabel: "Loan Officer", branch: "Ikeja Central", avatar: "AY" },
  },
  {
    email: "frontdesk@folat.com",
    password: "front123",
    user: { id: "u5", name: "Emeka Nwankwo", email: "frontdesk@folat.com", role: "front_desk", roleLabel: "Front Desk", branch: "Port Harcourt", avatar: "EN" },
  },
  {
    email: "auditor@folat.com",
    password: "audit123",
    user: { id: "u6", name: "Grace Oduya", email: "auditor@folat.com", role: "auditor", roleLabel: "Auditor", branch: "HQ Lagos", avatar: "GO" },
  },
  {
    email: "hr@folat.com",
    password: "hr123",
    user: { id: "u7", name: "Ngozi Eze", email: "hr@folat.com", role: "hr_manager", roleLabel: "HR Manager", branch: "HQ Lagos", avatar: "NE" },
  },
];
