import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './core/auth/AuthContext';
import AppRoutes from './modules/AppRoutes';

/**
 * App es el componente raíz de la aplicación.
 * 
 * Estructura:
 * 1. Router: Proveedor de React Router
 * 2. AuthProvider: Contexto de autenticación global
 * 3. AppRoutes: Sistema de enrutamiento con 3 módulos (admin, hr, portal)
 * 
 * La lógica de redirección inteligente se encuentra en AppRoutes,
 * que dirige a los usuarios al módulo correcto basado en su rol.
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
