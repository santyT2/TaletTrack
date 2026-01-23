import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Network, 
    Calendar, 
    FileText, 
    ClipboardCheck 
} from 'lucide-react';

export default function HRNavigation() {
    const navItems = [
        { path: '/hr/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/hr/organigram', label: 'Organigrama', icon: Network },
        { path: '/hr/leaves', label: 'Permisos', icon: Calendar },
        { path: '/hr/contracts', label: 'Contratos', icon: FileText },
        { path: '/hr/onboarding', label: 'Onboarding', icon: ClipboardCheck },
    ];

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex space-x-8">
                    {navItems.map(({ path, label, icon: Icon }) => (
                        <NavLink
                            key={path}
                            to={path}
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-3 py-4 border-b-2 transition-colors ${
                                    isActive
                                        ? 'border-indigo-600 text-indigo-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                                }`
                            }
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{label}</span>
                        </NavLink>
                    ))}
                </div>
            </div>
        </nav>
    );
}
