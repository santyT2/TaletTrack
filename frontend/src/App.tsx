import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './core/layouts/MainLayout';
import EmployeeLayout from './core/layouts/EmployeeLayout';
import HRLayout from './modules/hr/HRLayout';
import HRRoutes from './modules/hr/HRRoutes';
import AdminLayout from './modules/admin/AdminLayout';
import AdminRoutes from './modules/admin/AdminRoutes';
import AttendanceLayout from './modules/attendance/AttendanceLayout';
import AttendanceRoutes from './modules/attendance/AttendanceRoutes';
import PortalRoutes from './modules/portal/PortalRoutes';
import { AuthProvider, useAuth } from './core/auth/AuthContext';
import RequireRole from './core/auth/RequireRole';
import LoginPage from './core/auth/LoginPage';
import SetupPasswordPage from './core/auth/SetupPasswordPage';

function AppRoutes() {
  const { user } = useAuth();
  const needsSetup = Boolean(user?.mustChangePassword);
  const redirectBase = needsSetup ? '/auth/setup-password' : user?.role === 'EMPLOYEE' ? '/portal' : '/dashboard';

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/setup-password" element={<SetupPasswordPage />} />
      <Route element={<MainLayout />}>
        <Route index element={<Navigate to={redirectBase} replace />} />
        <Route path="/" element={<Navigate to={redirectBase} replace />} />
        <Route path="/dashboard" element={<Navigate to="/hr/dashboard" replace />} />

        <Route element={<RequireRole allowed={["ADMIN", "MANAGER"]} />}>          
          <Route
            path="hr/*"
            element={needsSetup ? <Navigate to="/auth/setup-password" replace /> : <HRLayout><HRRoutes /></HRLayout>}
          />
          <Route
            path="attendance/*"
            element={needsSetup ? <Navigate to="/auth/setup-password" replace /> : <AttendanceLayout><AttendanceRoutes /></AttendanceLayout>}
          />
          <Route
            path="admin/*"
            element={needsSetup ? <Navigate to="/auth/setup-password" replace /> : <AdminLayout><AdminRoutes /></AdminLayout>}
          />
        </Route>

        <Route element={<RequireRole allowed={["EMPLOYEE"]} />}>          
          <Route
            path="portal/*"
            element={needsSetup ? <Navigate to="/auth/setup-password" replace /> : <EmployeeLayout><PortalRoutes /></EmployeeLayout>}
          />
        </Route>
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
