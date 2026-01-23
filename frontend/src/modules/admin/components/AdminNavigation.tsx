import { NavLink } from 'react-router-dom';
import { Users, Briefcase, MapPin, SettingsIcon } from 'lucide-react';

export default function AdminNavigation() {
    const navItems = [
        { path: '/admin/employees', label: 'Empleados', icon: Users },
        { path: '/admin/positions', label: 'Cargos', icon: Briefcase },
        { path: '/admin/branches', label: 'Sucursales', icon: MapPin },
    ];

    return (
        <nav className="bg-gradient-to-r from-slate-800 to-slate-900 shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 py-4">
                        <SettingsIcon className="w-6 h-6 text-blue-400" />
                        <h1 className="text-xl font-bold text-white">Administración</h1>
                    </div>
                    <div className="flex space-x-8">
                        {navItems.map(({ path, label, icon: Icon }) => (
                            <NavLink
                                key={path}
                                to={path}
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-3 py-4 border-b-2 transition-colors ${
                                        isActive
                                            ? 'border-blue-500 text-blue-400'
                                            : 'border-transparent text-gray-300 hover:text-white hover:border-gray-500'
                                    }`
                                }
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{label}</span>
                            </NavLink>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
}
