/* ─── Role Definitions ─── */
export type UserRole =
  | "super_admin"
  | "branch_manager"
  | "finance_officer"
  | "loan_officer"
  | "front_desk"
  | "auditor"
  | "hr_manager"
  | "unassigned";

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
  unassigned: [],
};

/* ─── Role label helper ─── */
export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  branch_manager: "Branch Manager",
  finance_officer: "Finance Officer",
  loan_officer: "Loan Officer",
  front_desk: "Front Desk",
  auditor: "Auditor",
  hr_manager: "HR Manager",
  unassigned: "Pending Assignment",
};
