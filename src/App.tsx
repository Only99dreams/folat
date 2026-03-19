import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import TwoFactorPage from "./components/TwoFactorPage";
import ForgotPasswordPage from "./components/ForgotPasswordPage";
import ResetPasswordPage from "./components/ResetPasswordPage";
import AccountLockedPage from "./components/AccountLockedPage";
import AccessDeniedPage from "./components/AccessDeniedPage";
import DashboardLayout from "./components/DashboardLayout";
import DashboardPage from "./components/DashboardPage";
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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/2fa" element={<TwoFactorPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/account-locked" element={<AccountLockedPage />} />
        <Route path="/access-denied" element={<AccessDeniedPage />} />

        {/* Dashboard layout with sidebar */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/members/add-cooperative" element={<AddCooperativeMemberPage />} />
          <Route path="/members/add-external" element={<AddExternalCustomerPage />} />
          <Route path="/members/:id" element={<MemberDetailPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/groups/add" element={<CreateGroupPage />} />
          <Route path="/groups/:id" element={<GroupDetailPage />} />
          <Route path="/savings" element={<SavingsDashboardPage />} />
          <Route path="/savings/deposit" element={<RecordDepositPage />} />
          <Route path="/savings/bulk-upload" element={<BulkDepositUploadPage />} />
          <Route path="/savings/transactions" element={<SavingsTransactionsPage />} />
          <Route path="/savings/statement" element={<SavingsStatementPage />} />
          <Route path="/loans" element={<LoanApplicationsPage />} />
          <Route path="/loans/new" element={<NewLoanApplicationPage />} />
          <Route path="/loans/:id" element={<LoanApplicationDetailPage />} />
          <Route path="/loans/:id/review" element={<LoanApprovalReviewPage />} />
          <Route path="/loans/active" element={<ActiveLoansPage />} />
          <Route path="/loans/overdue" element={<OverdueLoansPage />} />
          <Route path="/loans/:id/repayment" element={<LoanRepaymentSchedulePage />} />
          <Route path="/loans/repayments" element={<AllLoanRepaymentsPage />} />
          <Route path="/loans/record-repayment" element={<RecordLoanRepaymentPage />} />
          <Route path="/finance" element={<FinanceDashboardPage />} />
          <Route path="/finance/add-income" element={<AddIncomePage />} />
          <Route path="/finance/add-expense" element={<AddExpensePage />} />
          <Route path="/finance/ledger" element={<FinancialLedgerPage />} />
          <Route path="/finance/fund-requests" element={<BranchFundRequestsPage />} />
          <Route path="/finance/fund-requests/new" element={<NewFundRequestPage />} />
          <Route path="/finance/fund-requests/:id/review" element={<FundRequestReviewPage />} />
          <Route path="/hr" element={<HRDashboardPage />} />
          <Route path="/hr/staff" element={<StaffListPage />} />
          <Route path="/hr/staff/add" element={<AddStaffPage />} />
          <Route path="/hr/staff/:id" element={<StaffProfilePage />} />
          <Route path="/hr/leave-requests" element={<LeaveRequestsPage />} />
          <Route path="/hr/salary-structure" element={<SalaryStructurePage />} />
          <Route path="/hr/leave-requests/new" element={<LeaveRequestFormPage />} />
          <Route path="/hr/attendance" element={<AttendanceLogPage />} />
          <Route path="/branches" element={<BranchesPage />} />
          <Route path="/branches/add" element={<AddBranchPage />} />
          <Route path="/branches/:id" element={<BranchDetailPage />} />
          <Route path="/communication/messages" element={<MessagesPage />} />
          <Route path="/communication/sms" element={<BulkSMSPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/security/access" element={<AccessControlPage />} />
          <Route path="/security/audit" element={<AuditLogPage />} />
          <Route path="/settings/general" element={<GeneralSettingsPage />} />
          <Route path="/settings/notifications" element={<NotificationSettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
