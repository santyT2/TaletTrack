import { createBrowserRouter, Navigate } from 'react-router-dom';

// Importación de Layouts
import Layout from '../modules/core/pages/Layout';

// Importación de Páginas (Lazy loading recomendado para producción, import directo por ahora)
import EmployeeList from '../modules/employees/pages/EmployeeList';
import Dashboard from '../modules/attendance/pages/Dashboard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <div>404 - Página no encontrada</div>,
    children: [
      {
        index: true,
        element: <Navigate to="/attendance" replace />, // Redirigir home a asistencia por defecto
      },
      // Rutas del Módulo Employees
      {
        path: 'employees',
        children: [
          {
            index: true,
            element: <EmployeeList />,
          },
          // Futuro: { path: ':id', element: <EmployeeDetail /> }
        ]
      },
      // Rutas del Módulo Attendance
      {
        path: 'attendance',
        children: [
          {
            index: true,
            element: <Dashboard />,
          },
          // Futuro: { path: 'history', element: <AttendanceHistory /> }
        ]
      }
    ]
  }
]);