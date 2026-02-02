import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../core/auth/AuthContext';
import LoginPage from '../core/auth/LoginPage';
import SetupPasswordPage from '../core/auth/SetupPasswordPage';
import AdminLayout from './admin/AdminLayout';
import HRLayout from './hr/HRLayout';
import PortalLayout from './portal/layouts/PortalLayout';

// Lazy load route modules
const AdminRoutes = lazy(() => import('./admin/AdminRoutes'));
const HRRoutes = lazy(() => import('./hr/HRRoutes'));
const PortalRoutes = lazy(() => import('./portal/PortalRoutes'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-slate-600 font-semibold">Cargando módulo...</p>
    </div>
  </div>
);

/**
 * Componente que actúa como Guardia de Rutas protegidas
 * Verifica que el usuario tenga los roles requeridos para acceder
 */
function RequireRole({ 
  allowedRoles, 
  children 
}: { 
  allowedRoles: string[]; 
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Usuario sin permiso: lo redirigimos a su módulo destino según rol
    return <Navigate to={getRoleDestination(user.role)} replace />;
  }

  return <>{children}</>;
}

/**
 * Determina el destino de redirección basado en el rol del usuario
 * Esta es la "inteligencia" del enrutamiento
 */
function getRoleDestination(role: string): string {
  switch (role) {
    case 'SUPERADMIN':
      return '/admin';
    case 'ADMIN_RRHH':
    case 'MANAGER':
      return '/hr';
    case 'EMPLOYEE':
      return '/portal';
    default:
      return '/login';
  }
}

/**
 * Redirecciona el root (/) basado en el rol del usuario
 */
function RootRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getRoleDestination(user.role)} replace />;
}

/**
 * AppRoutes es el router principal del sistema.
 * Configura las rutas públicas y privadas con lazy loading.
 * 
 * Estructura:
 * - /login (pública)
 * - /auth/setup-password (semi-pública, requiere token)
 * - /admin/* (solo SUPERADMIN, ADMIN_RRHH)
 * - /hr/* (SUPERADMIN, ADMIN_RRHH, MANAGER)
 * - /portal/* (EMPLOYEE)
 * - / (redirección inteligente basada en rol)
 * - * (404 fallback)
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/setup-password" element={<SetupPasswordPage />} />

      {/* Rutas Privadas - Módulo Admin */}
      <Route
        path="/admin/*"
        element={
          <RequireRole allowedRoles={['SUPERADMIN', 'ADMIN_RRHH']}>
            <AdminLayout>
              <Suspense fallback={<LoadingFallback />}>
                <AdminRoutes />
              </Suspense>
            </AdminLayout>
          </RequireRole>
        }
      />

      {/* Rutas Privadas - Módulo HR */}
      <Route
        path="/hr/*"
        element={
          <RequireRole allowedRoles={['SUPERADMIN', 'ADMIN_RRHH', 'MANAGER']}>
            <HRLayout>
              <Suspense fallback={<LoadingFallback />}>
                <HRRoutes />
              </Suspense>
            </HRLayout>
          </RequireRole>
        }
      />

      {/* Rutas Privadas - Módulo Portal */}
      <Route
        path="/portal/*"
        element={
          <RequireRole allowedRoles={['SUPERADMIN', 'ADMIN_RRHH', 'MANAGER', 'EMPLOYEE']}>
            <PortalLayout>
              <Suspense fallback={<LoadingFallback />}>
                <PortalRoutes />
              </Suspense>
            </PortalLayout>
          </RequireRole>
        }
      />

      {/* Redirección Raíz con Inteligencia de Rol */}
      <Route path="/" element={<RootRedirect />} />

      {/* Fallback 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export { getRoleDestination };
