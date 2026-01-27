import { Routes, Route, Navigate } from 'react-router-dom';
import CompanyPage from './pages/CompanyPage';
import BranchesPage from './pages/BranchesPage';
import PositionsPage from './pages/PositionsPage';
import UsersPage from './pages/UsersPage';
import EmployeesPage from './pages/EmployeesPage';

export default function AdminRoutes() {
    return (
        <Routes>
            <Route index element={<Navigate to="company" replace />} />
            <Route path="branches" element={<BranchesPage />} />
            <Route path="company" element={<CompanyPage />} />
            <Route path="positions" element={<PositionsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="employees" element={<EmployeesPage />} />
        </Routes>
    );
}
