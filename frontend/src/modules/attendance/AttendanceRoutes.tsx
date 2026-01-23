import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import MarkPage from './pages/MarkPage';
import ReportsPage from './pages/ReportsPage';
import PrenominaPage from './pages/PrenominaPage';

export default function AttendanceRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="mark" element={<MarkPage />} />
      <Route path="reports" element={<ReportsPage />} />
      <Route path="prenomina" element={<PrenominaPage />} />
    </Routes>
  );
}
