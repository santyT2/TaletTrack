import { Outlet, Link, useLocation } from 'react-router-dom';
import { BarChart3, Settings, Home, Clock } from 'lucide-react';

export default function MainLayout() {
    const location = useLocation();

    const isActive = (path: string) => location.pathname.startsWith(path);

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Top Navigation */}
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-gray-900 hover:text-blue-600 transition-colors">
                            <BarChart3 className="w-6 h-6 text-blue-600" />
                            HRMS
                        </Link>
                        
                        <div className="flex gap-1">
                            <Link
                                to="/hr/dashboard"
                                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                                    isActive('/hr')
                                        ? 'bg-blue-100 text-blue-600'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <Home className="w-5 h-5" />
                                RRHH
                            </Link>
                            <Link
                                to="/admin/employees"
                                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                                    isActive('/admin')
                                        ? 'bg-blue-100 text-blue-600'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <Settings className="w-5 h-5" />
                                Administración
                            </Link>
                            <Link
                                to="/attendance/dashboard"
                                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                                    isActive('/attendance')
                                        ? 'bg-blue-100 text-blue-600'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <Clock className="w-5 h-5" />
                                Asistencia
                            </Link>
                        </div>
                    </div>

                    {/* Right side info */}
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-600">
                            <p className="font-medium">HRMS v1.0</p>
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
