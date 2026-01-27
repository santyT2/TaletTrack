import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import OrganigramPage from './pages/OrganigramPage';
import LeavesPage from './pages/LeavesPage';
import ContractsPage from './pages/ContractsPage';
import OnboardingPage from './pages/OnboardingPage';
import EmployeesPage from './pages/EmployeesPage';
import AttendancePage from './pages/AttendancePage';
import PayrollPage from './pages/PayrollPage';
import ReportsPage from './pages/ReportsPage';

export default function HRRoutes() {
    return (
        <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="organigram" element={<OrganigramPage />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="contracts" element={<ContractsPage />} />
            <Route path="onboarding" element={<OnboardingPage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="leaves" element={<LeavesPage />} />
            <Route path="payroll" element={<PayrollPage />} />
            <Route path="reports" element={<ReportsPage />} />
        </Routes>
    );
}
