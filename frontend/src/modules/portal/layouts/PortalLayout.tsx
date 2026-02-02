import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, User, FileText, Clock, LogOut } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import logo from '../../../../media/talentrack_small.svg';

export default function PortalLayout({ children }: { children?: ReactNode }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, user } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    const navItems = [
        { path: '/portal', label: 'Inicio', icon: Home },
        { path: '/portal/profile', label: 'Mi Perfil', icon: User },
        { path: '/portal/mark', label: 'Marcar Asistencia', icon: Clock },
        { path: '/portal/attendance', label: 'Mis Registros', icon: FileText },
        { path: '/portal/leaves', label: 'Solicitar Permisos', icon: FileText },
        { path: '/portal/requests', label: 'Mis Solicitudes', icon: FileText },
    ];

    const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
                <div className="px-6 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="Talent Track" className="h-10 w-auto" />
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-900">{user?.name || 'Empleado'}</p>
                                <p className="text-xs text-slate-500">Mi Portal</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors text-sm font-semibold"
                    >
                        <LogOut className="w-4 h-4" />
                        Cerrar sesión
                    </button>
                </div>
            </header>

            {/* Navigation Tabs */}
            <nav className="bg-white border-b border-slate-200">
                <div className="px-6 py-3 flex items-center gap-1 overflow-x-auto">
                    {navItems.map(({ path, label, icon: Icon }) => (
                        <button
                            key={path}
                            onClick={() => navigate(path)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                                isActive(path)
                                    ? 'bg-blue-100 text-blue-700 font-semibold'
                                    : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="text-sm">{label}</span>
                        </button>
                    ))}
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 px-4 py-6 lg:px-8">
                <div className="max-w-4xl mx-auto">{children}</div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 mt-8">
                <div className="px-6 py-4 text-center text-sm text-slate-600">
                    <p>© 2026 Talent Track HRMS. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
}
