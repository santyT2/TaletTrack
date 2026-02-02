import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Lazy load HR pages
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const EmployeesPage = lazy(() => import('./pages/EmployeesPage'));
const ContractsPage = lazy(() => import('./pages/ContractsPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const PayrollPage = lazy(() => import('./pages/PayrollPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const OrganigramPage = lazy(() => import('./pages/OrganigramPage'));
const LeavesPage = lazy(() => import('./pages/LeavesPage'));
const AttendancePage = lazy(() => import('./pages/AttendancePage'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-96">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

export default function HRRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="contracts" element={<ContractsPage />} />
        <Route path="onboarding" element={<OnboardingPage />} />
        <Route path="payroll" element={<PayrollPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="organigram" element={<OrganigramPage />} />
        <Route path="leaves" element={<LeavesPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
