import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import HRNavigation from './components/HRNavigation';
import { useAuth } from '../../core/auth/AuthContext';
import logo from '../../../media/talentrack_small.svg';

export default function HRLayout({ children }: { children?: ReactNode }) {
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
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="Talent Track" className="h-10 w-auto" />
                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">Gestión de Talento</p>
                            <h1 className="text-xl font-semibold text-slate-900">Capital Humano</h1>
                            <p className="text-xs text-slate-500">Sesión: {user?.name ?? 'Usuario'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <div className="flex-1 lg:flex-none">
                            <HRNavigation />
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
