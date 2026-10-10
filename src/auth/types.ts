/* ─── Role Definitions ─── */
export type UserRole =
  | "super_admin"
  | "branch_manager"
  | "finance_officer"
  | "loan_officer"
  | "staff_member"
  | "front_desk"
  | "auditor"
  | "hr_manager"
  | "secretary"
  | "officer"
  | "unassigned";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  branch: string;
  avatar: string;
  avatarUrl?: string;
  cocAccepted?: boolean;
}

/* ─── Permission Keys ─── */
export type Permission =
  | "members.view" | "members.add" | "members.edit" | "members.delete"
  | "savings.view" | "savings.deposit" | "savings.bulk_upload" | "savings.transactions" | "savings.statement" | "savings.withdrawal" | "savings.data_sheet"
    | "loans.view" | "loans.create" | "loans.approve" | "loans.disburse" | "loans.repayments" | "loans.record_repayment" | "loans.weekly_tracking" | "loans.monthly_tracking"
  | "groups.view" | "groups.create"
  | "finance.view" | "finance.add_income" | "finance.add_expense" | "finance.ledger" | "finance.fund_requests" | "finance.approve_requests"
  | "hr.view" | "hr.staff_list" | "hr.add_staff" | "hr.leave_requests" | "hr.salary_structure" | "hr.attendance"
  | "branches.view" | "branches.add" | "branches.assign_staff"
  | "communication.messages" | "communication.sms"
  | "reports.view"
  | "security.access_control" | "security.audit_log"
  | "settings.general" | "settings.notifications" | "settings.loan_rules"
  | "records.view_combined";

/* ─── Role → Permissions Map ─── */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    "members.view", "members.add", "members.edit", "members.delete",
    "savings.view", "savings.deposit", "savings.bulk_upload", "savings.transactions", "savings.statement", "savings.withdrawal", "savings.data_sheet",
    "loans.view", "loans.create", "loans.approve", "loans.disburse", "loans.repayments", "loans.record_repayment", "loans.weekly_tracking", "loans.monthly_tracking",
    "groups.view", "groups.create",
     "finance.view", "finance.add_income", "finance.add_expense", "finance.ledger", "finance.fund_requests", "finance.approve_requests",
     "hr.view", "hr.staff_list", "hr.add_staff", "hr.leave_requests", "hr.salary_structure", "hr.attendance",
     "branches.view", "branches.add", "branches.assign_staff",
    "communication.messages", "communication.sms",
    "reports.view",
    "security.access_control", "security.audit_log",
    "settings.general", "settings.notifications", "settings.loan_rules",
    "records.view_combined",
  ],
  branch_manager: [
    "members.view", "members.add", "members.edit",
    "savings.view", "savings.deposit", "savings.bulk_upload", "savings.transactions", "savings.statement", "savings.withdrawal", "savings.data_sheet",
    "loans.view", "loans.create", "loans.repayments", "loans.record_repayment", "loans.weekly_tracking",
    "groups.view", "groups.create",
     "finance.view", "finance.ledger", "finance.fund_requests", "finance.approve_requests",
     "hr.view", "hr.staff_list", "hr.leave_requests", "hr.attendance",
     "branches.view", "branches.assign_staff",
    "communication.messages",
    "reports.view",
    "records.view_combined",
  ],
  secretary: [
    "members.view", "members.add", "members.edit",
    "savings.view", "savings.deposit", "savings.bulk_upload", "savings.transactions", "savings.statement", "savings.withdrawal", "savings.data_sheet",
    "loans.view", "loans.create", "loans.repayments", "loans.record_repayment", "loans.weekly_tracking",
    "groups.view", "groups.create",
     "finance.view", "finance.ledger", "finance.fund_requests", "finance.approve_requests",
     "hr.view", "hr.staff_list", "hr.leave_requests", "hr.attendance",
     "branches.view", "branches.assign_staff",
    "communication.messages",
    "reports.view",
    "records.view_combined",
  ],
  officer: [
    "members.view", "members.add", "members.edit",
    "savings.view", "savings.deposit", "savings.bulk_upload", "savings.transactions", "savings.statement", "savings.withdrawal", "savings.data_sheet",
    "loans.view", "loans.create", "loans.repayments", "loans.record_repayment", "loans.weekly_tracking",
    "groups.view", "groups.create",
     "finance.view", "finance.ledger", "finance.fund_requests", "finance.approve_requests",
     "hr.view", "hr.staff_list", "hr.leave_requests", "hr.attendance",
     "branches.view", "branches.assign_staff",
    "communication.messages",
    "reports.view",
    "records.view_combined",
  ],
  finance_officer: [
    "members.view",
    "savings.view", "savings.deposit", "savings.transactions", "savings.statement", "savings.withdrawal", "savings.data_sheet",
    "loans.view", "loans.create", "loans.approve", "loans.disburse", "loans.repayments", "loans.record_repayment", "loans.weekly_tracking",
    "finance.view", "finance.add_income", "finance.add_expense", "finance.ledger", "finance.fund_requests",
    "communication.messages",
    "reports.view",
    "branches.assign_staff",
  ],
  loan_officer: [
    "savings.view", "savings.transactions",
    "loans.view", "loans.create", "loans.repayments", "loans.record_repayment", "loans.weekly_tracking",
    "groups.view",
    "finance.view", "finance.ledger",
    "communication.messages",
    "reports.view",
  ],
  staff_member: [
    "loans.view", "loans.create",
    "communication.messages",
    "hr.leave_requests",
  ],
  front_desk: [
    "members.view", "members.add",
    "savings.view", "savings.deposit",
    "groups.view",
    "communication.messages",
    "records.view_combined",
  ],
  auditor: [
    "members.view",
    "savings.view", "savings.transactions", "savings.statement",
    "loans.view", "loans.repayments",
    "finance.view", "finance.ledger",
    "communication.messages",
    "reports.view",
    "security.audit_log",
  ],
  hr_manager: [
    "members.view",
    "hr.view", "hr.staff_list", "hr.add_staff", "hr.leave_requests", "hr.salary_structure", "hr.attendance",
    "reports.view",
    "communication.messages",
    "records.view_combined",
  ],
  unassigned: [],
};

/* ─── Role label helper ─── */
export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  branch_manager: "Branch Manager",
  finance_officer: "Finance Officer",
  loan_officer: "Loan Officer",
  staff_member: "Staff Member",
  front_desk: "Front Desk",
  auditor: "Auditor",
  hr_manager: "HR Manager",
  secretary: "Secretary",
  officer: "Officer",
  unassigned: "Pending Assignment",
};
