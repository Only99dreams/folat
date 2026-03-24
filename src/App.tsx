import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import TwoFactorPage from "./components/TwoFactorPage";
import ForgotPasswordPage from "./components/ForgotPasswordPage";
import ResetPasswordPage from "./components/ResetPasswordPage";
import AccountLockedPage from "./components/AccountLockedPage";
import AccessDeniedPage from "./components/AccessDeniedPage";
import DashboardLayout from "./components/DashboardLayout";
import RoleDashboardRouter from "./components/RoleDashboardRouter";
import BranchesPage from "./components/BranchesPage";
import AddBranchPage from "./components/AddBranchPage";
import BranchDetailPage from "./components/BranchDetailPage";
import MembersPage from "./components/MembersPage";
import AddCooperativeMemberPage from "./components/AddCooperativeMemberPage";
import AddExternalCustomerPage from "./components/AddExternalCustomerPage";
import MemberDetailPage from "./components/MemberDetailPage";
import GroupsPage from "./components/GroupsPage";
import CreateGroupPage from "./components/CreateGroupPage";
import GroupDetailPage from "./components/GroupDetailPage";
import SavingsDashboardPage from "./components/SavingsDashboardPage";
import RecordDepositPage from "./components/RecordDepositPage";
import BulkDepositUploadPage from "./components/BulkDepositUploadPage";
import SavingsTransactionsPage from "./components/SavingsTransactionsPage";
import SavingsStatementPage from "./components/SavingsStatementPage";
import LoanApplicationsPage from "./components/LoanApplicationsPage";
import NewLoanApplicationPage from "./components/NewLoanApplicationPage";
import LoanApplicationDetailPage from "./components/LoanApplicationDetailPage";
import LoanApprovalReviewPage from "./components/LoanApprovalReviewPage";
import ActiveLoansPage from "./components/ActiveLoansPage";
import OverdueLoansPage from "./components/OverdueLoansPage";
import LoanRepaymentSchedulePage from "./components/LoanRepaymentSchedulePage";
import AllLoanRepaymentsPage from "./components/AllLoanRepaymentsPage";
import RecordLoanRepaymentPage from "./components/RecordLoanRepaymentPage";
import FinanceDashboardPage from "./components/FinanceDashboardPage";
import AddIncomePage from "./components/AddIncomePage";
import AddExpensePage from "./components/AddExpensePage";
import FinancialLedgerPage from "./components/FinancialLedgerPage";
import BranchFundRequestsPage from "./components/BranchFundRequestsPage";
import FundRequestReviewPage from "./components/FundRequestReviewPage";
import NewFundRequestPage from "./components/NewFundRequestPage";
import HRDashboardPage from "./components/HRDashboardPage";
import StaffListPage from "./components/StaffListPage";
import AddStaffPage from "./components/AddStaffPage";
import StaffProfilePage from "./components/StaffProfilePage";
import LeaveRequestsPage from "./components/LeaveRequestsPage";
import SalaryStructurePage from "./components/SalaryStructurePage";
import LeaveRequestFormPage from "./components/LeaveRequestFormPage";
import AttendanceLogPage from "./components/AttendanceLogPage";
import MessagesPage from "./components/MessagesPage";
import BulkSMSPage from "./components/BulkSMSPage";
import ReportsPage from "./components/ReportsPage";
import AccessControlPage from "./components/AccessControlPage";
import AuditLogPage from "./components/AuditLogPage";
import GeneralSettingsPage from "./components/GeneralSettingsPage";
import NotificationSettingsPage from "./components/NotificationSettingsPage";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public routes ── */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/2fa" element={<TwoFactorPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/account-locked" element={<AccountLockedPage />} />
          <Route path="/access-denied" element={<AccessDeniedPage />} />

          {/* ── Protected routes — require authentication ── */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              {/* Dashboard — role-specific */}
              <Route path="/dashboard" element={<RoleDashboardRouter />} />

              {/* Members */}
              <Route path="/members" element={<ProtectedRoute requiredPermissions={["members.view"]}><MembersPage /></ProtectedRoute>} />
              <Route path="/members/add-cooperative" element={<ProtectedRoute requiredPermissions={["members.add"]}><AddCooperativeMemberPage /></ProtectedRoute>} />
              <Route path="/members/add-external" element={<ProtectedRoute requiredPermissions={["members.add"]}><AddExternalCustomerPage /></ProtectedRoute>} />
              <Route path="/members/:id" element={<ProtectedRoute requiredPermissions={["members.view"]}><MemberDetailPage /></ProtectedRoute>} />

              {/* Groups */}
              <Route path="/groups" element={<ProtectedRoute requiredPermissions={["groups.view"]}><GroupsPage /></ProtectedRoute>} />
              <Route path="/groups/add" element={<ProtectedRoute requiredPermissions={["groups.create"]}><CreateGroupPage /></ProtectedRoute>} />
              <Route path="/groups/:id" element={<ProtectedRoute requiredPermissions={["groups.view"]}><GroupDetailPage /></ProtectedRoute>} />

              {/* Savings */}
              <Route path="/savings" element={<ProtectedRoute requiredPermissions={["savings.view"]}><SavingsDashboardPage /></ProtectedRoute>} />
              <Route path="/savings/deposit" element={<ProtectedRoute requiredPermissions={["savings.deposit"]}><RecordDepositPage /></ProtectedRoute>} />
              <Route path="/savings/bulk-upload" element={<ProtectedRoute requiredPermissions={["savings.bulk_upload"]}><BulkDepositUploadPage /></ProtectedRoute>} />
              <Route path="/savings/transactions" element={<ProtectedRoute requiredPermissions={["savings.transactions"]}><SavingsTransactionsPage /></ProtectedRoute>} />
              <Route path="/savings/statement" element={<ProtectedRoute requiredPermissions={["savings.statement"]}><SavingsStatementPage /></ProtectedRoute>} />

              {/* Loans */}
              <Route path="/loans" element={<ProtectedRoute requiredPermissions={["loans.view"]}><LoanApplicationsPage /></ProtectedRoute>} />
              <Route path="/loans/new" element={<ProtectedRoute requiredPermissions={["loans.create"]}><NewLoanApplicationPage /></ProtectedRoute>} />
              <Route path="/loans/:id" element={<ProtectedRoute requiredPermissions={["loans.view"]}><LoanApplicationDetailPage /></ProtectedRoute>} />
              <Route path="/loans/:id/review" element={<ProtectedRoute requiredPermissions={["loans.approve"]}><LoanApprovalReviewPage /></ProtectedRoute>} />
              <Route path="/loans/active" element={<ProtectedRoute requiredPermissions={["loans.view"]}><ActiveLoansPage /></ProtectedRoute>} />
              <Route path="/loans/overdue" element={<ProtectedRoute requiredPermissions={["loans.view"]}><OverdueLoansPage /></ProtectedRoute>} />
              <Route path="/loans/:id/repayment" element={<ProtectedRoute requiredPermissions={["loans.repayments"]}><LoanRepaymentSchedulePage /></ProtectedRoute>} />
              <Route path="/loans/repayments" element={<ProtectedRoute requiredPermissions={["loans.repayments"]}><AllLoanRepaymentsPage /></ProtectedRoute>} />
              <Route path="/loans/record-repayment" element={<ProtectedRoute requiredPermissions={["loans.record_repayment"]}><RecordLoanRepaymentPage /></ProtectedRoute>} />

              {/* Finance */}
              <Route path="/finance" element={<ProtectedRoute requiredPermissions={["finance.view"]}><FinanceDashboardPage /></ProtectedRoute>} />
              <Route path="/finance/add-income" element={<ProtectedRoute requiredPermissions={["finance.add_income"]}><AddIncomePage /></ProtectedRoute>} />
              <Route path="/finance/add-expense" element={<ProtectedRoute requiredPermissions={["finance.add_expense"]}><AddExpensePage /></ProtectedRoute>} />
              <Route path="/finance/ledger" element={<ProtectedRoute requiredPermissions={["finance.ledger"]}><FinancialLedgerPage /></ProtectedRoute>} />
              <Route path="/finance/fund-requests" element={<ProtectedRoute requiredPermissions={["finance.fund_requests"]}><BranchFundRequestsPage /></ProtectedRoute>} />
              <Route path="/finance/fund-requests/new" element={<ProtectedRoute requiredPermissions={["finance.fund_requests"]}><NewFundRequestPage /></ProtectedRoute>} />
              <Route path="/finance/fund-requests/:id/review" element={<ProtectedRoute requiredPermissions={["finance.approve_requests"]}><FundRequestReviewPage /></ProtectedRoute>} />

              {/* HR */}
              <Route path="/hr" element={<ProtectedRoute requiredPermissions={["hr.view"]}><HRDashboardPage /></ProtectedRoute>} />
              <Route path="/hr/staff" element={<ProtectedRoute requiredPermissions={["hr.staff_list"]}><StaffListPage /></ProtectedRoute>} />
              <Route path="/hr/staff/add" element={<ProtectedRoute requiredPermissions={["hr.add_staff"]}><AddStaffPage /></ProtectedRoute>} />
              <Route path="/hr/staff/:id" element={<ProtectedRoute requiredPermissions={["hr.staff_list"]}><StaffProfilePage /></ProtectedRoute>} />
              <Route path="/hr/leave-requests" element={<ProtectedRoute requiredPermissions={["hr.leave_requests"]}><LeaveRequestsPage /></ProtectedRoute>} />
              <Route path="/hr/salary-structure" element={<ProtectedRoute requiredPermissions={["hr.salary_structure"]}><SalaryStructurePage /></ProtectedRoute>} />
              <Route path="/hr/leave-requests/new" element={<ProtectedRoute requiredPermissions={["hr.leave_requests"]}><LeaveRequestFormPage /></ProtectedRoute>} />
              <Route path="/hr/attendance" element={<ProtectedRoute requiredPermissions={["hr.attendance"]}><AttendanceLogPage /></ProtectedRoute>} />

              {/* Branches */}
              <Route path="/branches" element={<ProtectedRoute requiredPermissions={["branches.view"]}><BranchesPage /></ProtectedRoute>} />
              <Route path="/branches/add" element={<ProtectedRoute requiredPermissions={["branches.add"]}><AddBranchPage /></ProtectedRoute>} />
              <Route path="/branches/:id" element={<ProtectedRoute requiredPermissions={["branches.view"]}><BranchDetailPage /></ProtectedRoute>} />

              {/* Communication */}
              <Route path="/communication/messages" element={<ProtectedRoute requiredPermissions={["communication.messages"]}><MessagesPage /></ProtectedRoute>} />
              <Route path="/communication/sms" element={<ProtectedRoute requiredPermissions={["communication.sms"]}><BulkSMSPage /></ProtectedRoute>} />

              {/* Reports */}
              <Route path="/reports" element={<ProtectedRoute requiredPermissions={["reports.view"]}><ReportsPage /></ProtectedRoute>} />

              {/* Security */}
              <Route path="/security/access" element={<ProtectedRoute requiredPermissions={["security.access_control"]}><AccessControlPage /></ProtectedRoute>} />
              <Route path="/security/audit" element={<ProtectedRoute requiredPermissions={["security.audit_log"]}><AuditLogPage /></ProtectedRoute>} />

              {/* Settings */}
              <Route path="/settings/general" element={<ProtectedRoute requiredPermissions={["settings.general"]}><GeneralSettingsPage /></ProtectedRoute>} />
              <Route path="/settings/notifications" element={<ProtectedRoute requiredPermissions={["settings.notifications"]}><NotificationSettingsPage /></ProtectedRoute>} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
