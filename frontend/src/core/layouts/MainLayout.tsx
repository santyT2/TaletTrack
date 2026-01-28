import { Outlet, Link, useLocation } from 'react-router-dom';
import { Settings, Home, Clock } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import logo from '../../../media/talentrack_small.svg';

export default function MainLayout() {
    const location = useLocation();

    const title = useMemo(() => {
        if (location.pathname.startsWith('/portal')) return 'Talent Track - Portal Empleado';
        return 'Talent Track - Administración';
    }, [location.pathname]);

    useEffect(() => {
        document.title = title;
    }, [title]);

    const isActive = (path: string) => location.pathname.startsWith(path);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Navigation */}
            <nav className="bg-white shadow-sm border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-3 font-black text-lg text-slate-900 hover:text-brand-700 transition-colors">
                            <img src={logo} alt="Talent Track" className="h-9 w-auto" />
                            <span className="tracking-tight">TALENT TRACK</span>
                        </Link>
                        
                        <div className="flex gap-1">
                            <Link
                                to="/hr/dashboard"
                                className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                                    isActive('/hr')
                                        ? 'bg-brand-50 text-brand-700 border border-brand-100'
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                <Home className="w-5 h-5" />
                                RRHH
                            </Link>
                            <Link
                                to="/admin/employees"
                                className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                                    isActive('/admin')
                                        ? 'bg-brand-50 text-brand-700 border border-brand-100'
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                <Settings className="w-5 h-5" />
                                Administración
                            </Link>
                            <Link
                                to="/attendance/dashboard"
                                className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                                    isActive('/attendance')
                                        ? 'bg-brand-50 text-brand-700 border border-brand-100'
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                <Clock className="w-5 h-5" />
                                Asistencia
                            </Link>
                        </div>
                    </div>

                    {/* Right side info */}
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-slate-600">
                            <p className="font-semibold">Talent Track</p>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="py-6">
                <Outlet />
            </main>
        </div>
    );
}
