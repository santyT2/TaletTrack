import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavigation from './components/AdminNavigation';
import { useAuth } from '../../core/auth/AuthContext';

export default function AdminLayout({ children }: { children?: ReactNode }) {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col">
            <header className="bg-white border-b border-slate-200 shadow-sm">
                <div className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">Administración</p>
                        <h1 className="text-xl font-semibold text-slate-900">Control centralizado</h1>
                        <p className="text-xs text-slate-500">Sesión: {user?.name ?? 'Usuario'}</p>
                    </div>
                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <div className="flex-1 lg:flex-none">
                            <AdminNavigation />
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-sm font-semibold"
                        >
                            Cerrar sesión
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 px-4 py-6 lg:px-8">
                <div className="max-w-6xl mx-auto">{children}</div>
            </main>
        </div>
    );
}
