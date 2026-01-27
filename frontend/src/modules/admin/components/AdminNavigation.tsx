import { NavLink } from 'react-router-dom';
import { MapPin, Briefcase, Shield, SettingsIcon, Users } from 'lucide-react';

const navItems = [
    { path: '/admin/company', label: 'Empresa', icon: SettingsIcon },
    { path: '/admin/branches', label: 'Sucursales', icon: MapPin },
    { path: '/admin/positions', label: 'Cargos', icon: Briefcase },
    { path: '/admin/users', label: 'Usuarios', icon: Shield },
    { path: '/admin/employees', label: 'Empleados', icon: Users },
];

export default function AdminNavigation() {
    return (
        <nav className="bg-white border border-slate-200 rounded-xl shadow-sm px-2 py-2">
            <div className="flex flex-wrap gap-2">
                {navItems.map(({ path, label, icon: Icon }) => (
                    <NavLink
                        key={path}
                        to={path}
                        className={({ isActive }) =>
                            `flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg border transition-colors ${
                                isActive
                                    ? 'border-brand-200 bg-brand-50 text-brand-700'
                                    : 'border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50'
                            }`
                        }
                    >
                        <Icon className="w-4 h-4" />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
