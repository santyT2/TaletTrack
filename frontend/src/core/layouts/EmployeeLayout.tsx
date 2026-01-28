import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, ClipboardList, Clock, Menu, Home, LogOut } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export default function EmployeeLayout({ children }: { children?: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/portal') {
      return location.pathname === '/portal' || location.pathname === '/portal/' || location.pathname === '/portal/dashboard';
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Portal Empleado</p>
            <p className="text-lg font-semibold text-slate-900">Mi espacio</p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => navigate('/portal/attendance')}
              className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Marcar
            </button>
            <button
              onClick={() => {
                logout();
                navigate('/login', { replace: true });
              }}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50"
            >
              <LogOut className="w-4 h-4" /> Cerrar sesión
            </button>
          </div>
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-700 md:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
          <nav className="hidden md:flex items-center gap-3">
            <NavLink to="/portal" active={isActive('/portal')} label="Inicio" icon={<Home className="w-4 h-4" />} />
            <NavLink to="/portal/perfil" active={isActive('/portal/perfil')} label="Mi Perfil" icon={<User className="w-4 h-4" />} />
            <NavLink to="/portal/leaves" active={isActive('/portal/leaves')} label="Vacaciones" icon={<ClipboardList className="w-4 h-4" />} />
            <NavLink to="/portal/attendance" active={isActive('/portal/attendance')} label="Marcar" icon={<Clock className="w-4 h-4" />} />
          </nav>
        </div>
        {open && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pb-3 space-y-2">
            <MobileLink to="/portal" active={isActive('/portal')} label="Inicio" />
            <MobileLink to="/portal/perfil" active={isActive('/portal/perfil')} label="Mi Perfil" />
            <MobileLink to="/portal/leaves" active={isActive('/portal/leaves')} label="Vacaciones" />
            <MobileLink to="/portal/attendance" active={isActive('/portal/attendance')} label="Marcar" />
            <button
              onClick={() => {
                logout();
                navigate('/login', { replace: true });
              }}
              className="w-full text-left px-2 py-2 rounded-lg text-sm font-semibold text-rose-600 border border-rose-100"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">{children}</main>

      <footer className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 shadow-sm">
        <div className="grid grid-cols-3 text-center text-xs font-medium text-slate-600">
          <FooterLink to="/portal" active={isActive('/portal')} label="Inicio" icon={<Home className="w-4 h-4 mx-auto" />} />
          <FooterLink to="/portal/perfil" active={isActive('/portal/perfil')} label="Perfil" icon={<User className="w-4 h-4 mx-auto" />} />
          <FooterLink to="/portal/leaves" active={isActive('/portal/leaves')} label="Vacaciones" icon={<ClipboardList className="w-4 h-4 mx-auto" />} />
          <FooterLink to="/portal/attendance" active={isActive('/portal/attendance')} label="Marcar" icon={<Clock className="w-4 h-4 mx-auto" />} />
        </div>
      </footer>
    </div>
  );
}

function NavLink({ to, active, label, icon }: { to: string; active: boolean; label: string; icon: ReactNode }) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${
        active ? 'bg-blue-100 text-blue-700' : 'text-slate-700 hover:bg-slate-100'
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

function MobileLink({ to, active, label }: { to: string; active: boolean; label: string }) {
  return (
    <Link
      to={to}
      className={`block px-2 py-2 rounded-lg text-sm ${active ? 'text-blue-700 font-semibold' : 'text-slate-700'}`}
    >
      {label}
    </Link>
  );
}

function FooterLink({ to, active, label, icon }: { to: string; active: boolean; label: string; icon: ReactNode }) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center py-3 ${active ? 'text-blue-700' : 'text-slate-600'}`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
