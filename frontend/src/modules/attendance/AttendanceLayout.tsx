import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Clock, MapPin, FileText, DollarSign } from 'lucide-react';

interface AttendanceLayoutProps {
  children?: ReactNode;
}

export default function AttendanceLayout({ children }: AttendanceLayoutProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };

  const navItems = [
    { path: '/attendance/dashboard', label: 'Dashboard', icon: Clock },
    { path: '/attendance/mark', label: 'Marcar', icon: MapPin },
    { path: '/attendance/reports', label: 'Reportes', icon: FileText },
    { path: '/attendance/prenomina', label: 'Pre-nómina', icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar del módulo de Asistencia */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 h-16">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex items-center px-4 border-b-2 text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Contenido del módulo */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
