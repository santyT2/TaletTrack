import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Lazy load pages para mejor performance
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const CompanyPage = lazy(() => import('./pages/CompanyPage'));
const BranchesPage = lazy(() => import('./pages/BranchesPage'));
const PositionsPage = lazy(() => import('./pages/PositionsPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const EmployeesPage = lazy(() => import('./pages/EmployeesPage'));

// Loading fallback
const LoadingFallback = () => (
    <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
);

export default function AdminRoutes() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <Routes>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="company" element={<CompanyPage />} />
                <Route path="branches" element={<BranchesPage />} />
                <Route path="positions" element={<PositionsPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="employees" element={<EmployeesPage />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
        </Suspense>
    );
}

