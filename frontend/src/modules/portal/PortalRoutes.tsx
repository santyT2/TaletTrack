import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Lazy load Portal pages
const PortalDashboard = lazy(() => import('./pages/PortalDashboard'));
const MyProfilePage = lazy(() => import('./pages/MyProfilePage'));
const MyRequestsPage = lazy(() => import('./pages/MyRequestsPage'));
const MarkPage = lazy(() => import('./pages/MarkPage'));
const LeavesPage = lazy(() => import('./pages/LeavesPage'));
const AttendancePage = lazy(() => import('./pages/AttendancePage'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-96">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

export default function PortalRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<PortalDashboard />} />
        <Route path="home" element={<PortalDashboard />} />
        <Route path="perfil" element={<MyProfilePage />} />
        <Route path="profile" element={<MyProfilePage />} />
        <Route path="mark" element={<MarkPage />} />
        <Route path="solicitudes" element={<MyRequestsPage />} />
        <Route path="requests" element={<MyRequestsPage />} />
        <Route path="leaves" element={<LeavesPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
