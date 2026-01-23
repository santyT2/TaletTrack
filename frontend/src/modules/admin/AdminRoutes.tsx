import { Routes, Route, Navigate } from 'react-router-dom';
import EmployeesPage from './pages/EmployeesPage';
import PositionsPage from './pages/PositionsPage';
import BranchesPage from './pages/BranchesPage';

export default function AdminRoutes() {
    return (
        <Routes>
            <Route index element={<Navigate to="employees" replace />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="positions" element={<PositionsPage />} />
            <Route path="branches" element={<BranchesPage />} />
        </Routes>
    );
}
