import { Routes, Route, Navigate } from 'react-router-dom';
import MyProfilePage from './pages/MyProfilePage';
import LeavesPage from './pages/LeavesPage';
import AttendancePage from './pages/AttendancePage';
import PortalDashboardPage from './pages/PortalDashboardPage';

export default function PortalRoutes() {
  return (
    <Routes>
      <Route index element={<PortalDashboardPage />} />
      <Route path="dashboard" element={<PortalDashboardPage />} />
      <Route path="perfil" element={<MyProfilePage />} />
      <Route path="solicitudes" element={<LeavesPage />} />
      <Route path="leaves" element={<LeavesPage />} />
      <Route path="attendance" element={<AttendancePage />} />
    </Routes>
  );
}
