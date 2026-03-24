import { useAuth } from "../auth/AuthContext";
import DashboardPage from "./DashboardPage";
import BranchManagerDashboard from "./BranchManagerDashboard";
import FinanceOfficerDashboard from "./FinanceOfficerDashboard";
import LoanOfficerDashboard from "./LoanOfficerDashboard";
import FrontDeskDashboard from "./FrontDeskDashboard";
import AuditorDashboard from "./AuditorDashboard";
import HRDashboardPage from "./HRDashboardPage";

export default function RoleDashboardRouter() {
  const { user } = useAuth();

  switch (user?.role) {
    case "super_admin":
      return <DashboardPage />;
    case "branch_manager":
      return <BranchManagerDashboard />;
    case "finance_officer":
      return <FinanceOfficerDashboard />;
    case "loan_officer":
      return <LoanOfficerDashboard />;
    case "front_desk":
      return <FrontDeskDashboard />;
    case "auditor":
      return <AuditorDashboard />;
    case "hr_manager":
      return <HRDashboardPage />;
    default:
      return <DashboardPage />;
  }
}
