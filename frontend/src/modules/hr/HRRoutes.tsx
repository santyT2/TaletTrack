import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import OrganigramPage from './pages/OrganigramPage';
import LeavesPage from './pages/LeavesPage';
import ContractsPage from './pages/ContractsPage';
import OnboardingPage from './pages/OnboardingPage';

export default function HRRoutes() {
    return (
        <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="organigram" element={<OrganigramPage />} />
            <Route path="leaves" element={<LeavesPage />} />
            <Route path="contracts" element={<ContractsPage />} />
            <Route path="onboarding" element={<OnboardingPage />} />
        </Routes>
    );
}
