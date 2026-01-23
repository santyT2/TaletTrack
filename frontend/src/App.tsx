import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HRLayout from './modules/hr/HRLayout';
import HRRoutes from './modules/hr/HRRoutes';
import AdminLayout from './modules/admin/AdminLayout';
import AdminRoutes from './modules/admin/AdminRoutes';
import AttendanceLayout from './modules/attendance/AttendanceLayout';
import AttendanceRoutes from './modules/attendance/AttendanceRoutes';

function App() {
  console.log('✅ App component mounted');
  
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="hr/*" element={<HRLayout><HRRoutes /></HRLayout>} />
          <Route path="admin/*" element={<AdminLayout><AdminRoutes /></AdminLayout>} />
          <Route path="attendance/*" element={<AttendanceLayout><AttendanceRoutes /></AttendanceLayout>} />
          <Route index element={<Navigate to="hr/dashboard" replace />} />
          <Route path="/" element={<Navigate to="hr/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
