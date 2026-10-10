import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";
import RoleDashboardRouter from "./components/RoleDashboardRouter";
import "./App.css";

const LoginPage = lazy(() => import("./components/LoginPage"));
const SignupPage = lazy(() => import("./components/SignupPage"));
const TwoFactorPage = lazy(() => import("./components/TwoFactorPage"));
const ForgotPasswordPage = lazy(() => import("./components/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./components/ResetPasswordPage"));
const AccountLockedPage = lazy(() => import("./components/AccountLockedPage"));
const AccessDeniedPage = lazy(() => import("./components/AccessDeniedPage"));
const BranchesPage = lazy(() => import("./components/BranchesPage"));
const AddBranchPage = lazy(() => import("./components/AddBranchPage"));
const BranchDetailPage = lazy(() => import("./components/BranchDetailPage"));
const BranchReportPage = lazy(() => import("./components/BranchReportPage"));
const MembersPage = lazy(() => import("./components/MembersPage"));
const AddCooperativeMemberPage = lazy(() => import("./components/AddCooperativeMemberPage"));
const AddExternalCustomerPage = lazy(() => import("./components/AddExternalCustomerPage"));
const MemberDetailPage = lazy(() => import("./components/MemberDetailPage"));
const GroupsPage = lazy(() => import("./components/GroupsPage"));
const CreateGroupPage = lazy(() => import("./components/CreateGroupPage"));
const GroupDetailPage = lazy(() => import("./components/GroupDetailPage"));
const SavingsDashboardPage = lazy(() => import("./components/SavingsDashboardPage"));
const RecordDepositPage = lazy(() => import("./components/RecordDepositPage"));
const BulkDepositUploadPage = lazy(() => import("./components/BulkDepositUploadPage"));
const SavingsTransactionsPage = lazy(() => import("./components/SavingsTransactionsPage"));
const SavingsStatementPage = lazy(() => import("./components/SavingsStatementPage"));
const LoanApplicationsPage = lazy(() => import("./components/LoanApplicationsPage"));
const NewLoanApplicationPage = lazy(() => import("./components/NewLoanApplicationPage"));
const LoanApplicationDetailPage = lazy(() => import("./components/LoanApplicationDetailPage"));
const LoanApprovalReviewPage = lazy(() => import("./components/LoanApprovalReviewPage"));
const ActiveLoansPage = lazy(() => import("./components/ActiveLoansPage"));
const OverdueLoansPage = lazy(() => import("./components/OverdueLoansPage"));
const LoanRepaymentSchedulePage = lazy(() => import("./components/LoanRepaymentSchedulePage"));
const AllLoanRepaymentsPage = lazy(() => import("./components/AllLoanRepaymentsPage"));
const CombinedRecordsPage = lazy(() => import("./components/CombinedRecordsPage"));
const StaffSalaryPage = lazy(() => import("./components/StaffSalaryPage"));
const BranchAssignmentsPage = lazy(() => import("./components/BranchAssignmentsPage"));
const AvailableFundsPage = lazy(() => import("./components/AvailableFundsPage"));
const GuarantorRequestsPage = lazy(() => import("./components/GuarantorRequestsPage"));
const FinanceDashboardPage = lazy(() => import("./components/FinanceDashboardPage"));
const AddIncomePage = lazy(() => import("./components/AddIncomePage"));
const AddExpensePage = lazy(() => import("./components/AddExpensePage"));
const FinancialLedgerPage = lazy(() => import("./components/FinancialLedgerPage"));
const BranchFundRequestsPage = lazy(() => import("./components/BranchFundRequestsPage"));
const FundRequestReviewPage = lazy(() => import("./components/FundRequestReviewPage"));
const NewFundRequestPage = lazy(() => import("./components/NewFundRequestPage"));
import HRDashboardPage from "./components/HRDashboardPage";
const StaffListPage = lazy(() => import("./components/StaffListPage"));
const AddStaffPage = lazy(() => import("./components/AddStaffPage"));
const StaffProfilePage = lazy(() => import("./components/StaffProfilePage"));
const LeaveRequestsPage = lazy(() => import("./components/LeaveRequestsPage"));
const SalaryStructurePage = lazy(() => import("./components/SalaryStructurePage"));
const LeaveRequestFormPage = lazy(() => import("./components/LeaveRequestFormPage"));
const AttendanceLogPage = lazy(() => import("./components/AttendanceLogPage"));
const RecordAttendancePage = lazy(() => import("./components/RecordAttendancePage"));
const CooperativeLoanRequestPage = lazy(() => import("./components/CooperativeLoanRequestPage"));
const StaffDocumentsPage = lazy(() => import("./components/StaffDocumentsPage"));
const StaffMyDocumentsPage = lazy(() => import("./components/StaffMyDocumentsPage"));
const MonthlyTrackingPage = lazy(() => import("./components/MonthlyTrackingPage"));
const RecordWithdrawalPage = lazy(() => import("./components/RecordWithdrawalPage"));
const CooperativeDataSheetPage = lazy(() => import("./components/CooperativeDataSheetPage"));
const MessagesPage = lazy(() => import("./components/MessagesPage"));
const BulkSMSPage = lazy(() => import("./components/BulkSMSPage"));
const ReportsPage = lazy(() => import("./components/ReportsPage"));
const AccessControlPage = lazy(() => import("./components/AccessControlPage"));
const UserApprovalPage = lazy(() => import("./components/UserApprovalPage"));
const AuditLogPage = lazy(() => import("./components/AuditLogPage"));
const GeneralSettingsPage = lazy(() => import("./components/GeneralSettingsPage"));
const NotificationSettingsPage = lazy(() => import("./components/NotificationSettingsPage"));
const LoanRulesEditorPage = lazy(() => import("./components/LoanRulesEditorPage"));
const VerifyEmailPage = lazy(() => import("./components/VerifyEmailPage"));
const CheckEmailPage = lazy(() => import("./components/CheckEmailPage"));
const EmailVerificationPage = lazy(() => import("./components/EmailVerificationPage")); // Keep for now if needed elsewhere
const UserProfilePage = lazy(() => import("./components/UserProfilePage"));
const SearchResultsPage = lazy(() => import("./components/SearchResultsPage"));
const CodeOfConductPage = lazy(() => import("./components/CodeOfConductPage"));

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-navy-900 border-t-transparent" />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              background: "#ffffff",
              color: "#0a1f44",
            },
          }}
        />
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
           {/* ── Public routes ── */}
             <Route path="/" element={<LoginPage />} />
<Route path="/signup" element={<SignupPage />} />
              <Route path="/check-email" element={<CheckEmailPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
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
                <Route path="/search" element={<ProtectedRoute><SearchResultsPage /></ProtectedRoute>} />

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
                <Route path="/savings/withdrawal" element={<ProtectedRoute requiredPermissions={["savings.withdrawal"]}><RecordWithdrawalPage /></ProtectedRoute>} />
                <Route path="/savings/data-sheet" element={<ProtectedRoute requiredPermissions={["savings.data_sheet"]}><CooperativeDataSheetPage /></ProtectedRoute>} />

                {/* Loans */}
                <Route path="/loans" element={<ProtectedRoute requiredPermissions={["loans.view"]}><LoanApplicationsPage /></ProtectedRoute>} />
                <Route path="/loans/new" element={<ProtectedRoute requiredPermissions={["loans.create"]}><NewLoanApplicationPage /></ProtectedRoute>} />
                <Route path="/loans/cooperative-request" element={<ProtectedRoute requiredPermissions={["loans.create"]}><CooperativeLoanRequestPage /></ProtectedRoute>} />
                <Route path="/loans/:id" element={<ProtectedRoute requiredPermissions={["loans.view"]}><LoanApplicationDetailPage /></ProtectedRoute>} />
                <Route path="/loans/:id/review" element={<ProtectedRoute requiredPermissions={["loans.approve"]}><LoanApprovalReviewPage /></ProtectedRoute>} />
                <Route path="/loans/active" element={<ProtectedRoute requiredPermissions={["loans.view"]}><ActiveLoansPage /></ProtectedRoute>} />
                <Route path="/loans/overdue" element={<ProtectedRoute requiredPermissions={["loans.view"]}><OverdueLoansPage /></ProtectedRoute>} />
                <Route path="/loans/:id/repayment" element={<ProtectedRoute requiredPermissions={["loans.repayments"]}><LoanRepaymentSchedulePage /></ProtectedRoute>} />
                <Route path="/loans/repayments" element={<ProtectedRoute requiredPermissions={["loans.repayments"]}><AllLoanRepaymentsPage /></ProtectedRoute>} />
                 <Route path="/loans/monthly-tracking" element={<ProtectedRoute requiredPermissions={["loans.monthly_tracking"]}><MonthlyTrackingPage /></ProtectedRoute>} />
                <Route path="/loans/guarantor-requests" element={<ProtectedRoute requiredPermissions={["loans.view"]}><GuarantorRequestsPage /></ProtectedRoute>} />

                {/* Finance */}
                <Route path="/finance" element={<ProtectedRoute requiredPermissions={["finance.view"]}><FinanceDashboardPage /></ProtectedRoute>} />
                <Route path="/finance/add-income" element={<ProtectedRoute requiredPermissions={["finance.add_income"]}><AddIncomePage /></ProtectedRoute>} />
                <Route path="/finance/add-expense" element={<ProtectedRoute requiredPermissions={["finance.add_expense"]}><AddExpensePage /></ProtectedRoute>} />
                <Route path="/finance/ledger" element={<ProtectedRoute requiredPermissions={["finance.ledger"]}><FinancialLedgerPage /></ProtectedRoute>} />
                 <Route path="/finance/fund-requests" element={<ProtectedRoute requiredPermissions={["finance.fund_requests"]}><BranchFundRequestsPage /></ProtectedRoute>} />
                 <Route path="/finance/fund-requests/new" element={<ProtectedRoute requiredPermissions={["finance.fund_requests"]}><NewFundRequestPage /></ProtectedRoute>} />
                 <Route path="/finance/fund-requests/:id/review" element={<ProtectedRoute requiredPermissions={["finance.approve_requests"]}><FundRequestReviewPage /></ProtectedRoute>} />
                 <Route path="/finance/available-funds" element={<ProtectedRoute requiredPermissions={["finance.fund_requests"]}><AvailableFundsPage /></ProtectedRoute>} />

                 {/* HR */}
                 <Route path="/hr" element={<ProtectedRoute requiredPermissions={["hr.view"]}><HRDashboardPage /></ProtectedRoute>} />
                 <Route path="/hr/staff" element={<ProtectedRoute requiredPermissions={["hr.staff_list"]}><StaffListPage /></ProtectedRoute>} />
                 <Route path="/hr/staff/add" element={<ProtectedRoute requiredPermissions={["hr.add_staff"]}><AddStaffPage /></ProtectedRoute>} />
                 <Route path="/hr/staff/:id" element={<ProtectedRoute requiredPermissions={["hr.staff_list"]}><StaffProfilePage /></ProtectedRoute>} />
                 <Route path="/hr/leave-requests" element={<ProtectedRoute requiredPermissions={["hr.leave_requests"]}><LeaveRequestsPage /></ProtectedRoute>} />
                 <Route path="/hr/salary-structure" element={<ProtectedRoute requiredPermissions={["hr.salary_structure"]}><SalaryStructurePage /></ProtectedRoute>} />
                  <Route path="/hr/salary-management" element={<ProtectedRoute requiredPermissions={["hr.salary_structure"]}><StaffSalaryPage /></ProtectedRoute>} />
                  <Route path="/hr/leave-requests/new" element={<ProtectedRoute requiredPermissions={["hr.leave_requests"]}><LeaveRequestFormPage /></ProtectedRoute>} />
                 <Route path="/hr/attendance" element={<ProtectedRoute requiredPermissions={["hr.attendance"]}><AttendanceLogPage /></ProtectedRoute>} />
                 <Route path="/hr/attendance/record" element={<ProtectedRoute requiredPermissions={["hr.attendance"]}><RecordAttendancePage /></ProtectedRoute>} />
                 <Route path="/hr/staff-documents" element={<ProtectedRoute requiredPermissions={["hr.view"]}><StaffDocumentsPage /></ProtectedRoute>} />

                 {/* Branches */}
                 <Route path="/branches" element={<ProtectedRoute requiredPermissions={["branches.view"]}><BranchesPage /></ProtectedRoute>} />
                 <Route path="/branches/add" element={<ProtectedRoute requiredPermissions={["branches.add"]}><AddBranchPage /></ProtectedRoute>} />
                 <Route path="/branches/:id" element={<ProtectedRoute requiredPermissions={["branches.view"]}><BranchDetailPage /></ProtectedRoute>} />
                 <Route path="/branches/:id/report" element={<ProtectedRoute requiredPermissions={["branches.view"]}><BranchReportPage /></ProtectedRoute>} />
                 <Route path="/branches/assignments" element={<ProtectedRoute requiredPermissions={["branches.assign_staff"]}><BranchAssignmentsPage /></ProtectedRoute>} />

                {/* Communication */}
                <Route path="/communication/messages" element={<ProtectedRoute requiredPermissions={["communication.messages"]}><MessagesPage /></ProtectedRoute>} />
                <Route path="/communication/sms" element={<ProtectedRoute requiredPermissions={["communication.sms"]}><BulkSMSPage /></ProtectedRoute>} />

                {/* Reports */}
                <Route path="/reports" element={<ProtectedRoute requiredPermissions={["reports.view"]}><ReportsPage /></ProtectedRoute>} />
                <Route path="/reports/combined-records" element={<ProtectedRoute requiredPermissions={["records.view_combined"]}><CombinedRecordsPage /></ProtectedRoute>} />

                {/* Security */}
                <Route path="/security/access" element={<ProtectedRoute requiredPermissions={["security.access_control"]}><AccessControlPage /></ProtectedRoute>} />
                <Route path="/security/user-approval" element={<ProtectedRoute requiredPermissions={["security.access_control"]}><UserApprovalPage /></ProtectedRoute>} />
                <Route path="/security/audit" element={<ProtectedRoute requiredPermissions={["security.audit_log"]}><AuditLogPage /></ProtectedRoute>} />

                {/* Settings */}
                <Route path="/settings/general" element={<ProtectedRoute requiredPermissions={["settings.general"]}><GeneralSettingsPage /></ProtectedRoute>} />
                <Route path="/settings/notifications" element={<ProtectedRoute requiredPermissions={["settings.notifications"]}><NotificationSettingsPage /></ProtectedRoute>} />
                <Route path="/settings/loan-rules" element={<ProtectedRoute requiredPermissions={["settings.loan_rules"]}><LoanRulesEditorPage /></ProtectedRoute>} />

                 {/* Staff */}
                 <Route path="/my-documents" element={<ProtectedRoute requiredPermissions={["hr.leave_requests"]}><StaffMyDocumentsPage /></ProtectedRoute>} />
                 <Route path="/finance/documents" element={<ProtectedRoute requiredPermissions={["finance.view"]}><StaffMyDocumentsPage /></ProtectedRoute>} />

                {/* Code of Conduct */}
                <Route path="/code-of-conduct" element={<CodeOfConductPage />} />

                {/* User Profile */}
                <Route path="/profile" element={<UserProfilePage />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
