import type { FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, LockKeyhole, IdCard } from 'lucide-react';
import { useAuth } from './AuthContext';
import authService from '../services/authService';
import talentLogo from '../../../media/talentrack_small.svg';
import { getRoleDestination } from '../../modules/AppRoutes';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [documentNumber, setDocumentNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const username = documentNumber.trim();
      const resp = await authService.login(username, password);
      const backendRole = (resp.user.role?.toUpperCase?.() || 'EMPLOYEE') as string;
      
      // Mapeo de roles del backend a los roles del frontend
      let effectiveRole: 'SUPERADMIN' | 'ADMIN_RRHH' | 'MANAGER' | 'EMPLOYEE';
      
      if (['SUPERADMIN'].includes(backendRole)) {
        effectiveRole = 'SUPERADMIN';
      } else if (['ADMIN_RRHH', 'RRHH'].includes(backendRole)) {
        effectiveRole = 'ADMIN_RRHH';
      } else if (['MANAGER', 'GERENTE_SUCURSAL'].includes(backendRole)) {
        effectiveRole = 'MANAGER';
      } else {
        effectiveRole = 'EMPLOYEE';
      }
      
      login({
        id: String(resp.user.id),
        name: resp.user.name || resp.user.username,
        role: effectiveRole,
        mustChangePassword: resp.user.must_change_password,
        accessToken: resp.access,
        refreshToken: resp.refresh,
      });
      const destination = resp.user.must_change_password
        ? '/auth/setup-password'
        : getRoleDestination(effectiveRole);
      navigate(destination, { replace: true });
    } catch (err: any) {
      const detail = err?.response?.data?.detail || 'Credenciales inválidas';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  const backgroundUrl =
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80&sat=-10&blend=111827&sat=20';

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0">
        <img src={backgroundUrl} alt="Skyline corporativo" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-black/60" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
        <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-slate-700/60 p-8 space-y-6 text-slate-100">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={talentLogo} alt="Talent Track" className="h-12 w-auto drop-shadow" />
              <div className="text-3xl font-black tracking-tight text-red-600">TALENT TRACK</div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-200">
              <ShieldCheck className="w-4 h-4" /> Acceso seguro
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-white">Inicia Sesión</h1>
              <p className="text-sm text-slate-200">Accede a tu cuenta con tu documento y contraseña</p>
            </div>
          </div>

          {/* Error Message */}
          {error && <p className="text-sm text-rose-100 bg-rose-900/60 border border-rose-700/60 rounded-xl px-3 py-2">{error}</p>}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-100">Cédula o Documento</label>
              <div className="relative">
                <IdCard className="w-4 h-4 text-slate-300 absolute left-3 top-3" />
                <input
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="Ingresa tu documento"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-400 focus:bg-slate-900 focus:border-red-500 focus:ring-2 focus:ring-red-900/40 transition"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-100">Contraseña</label>
              <div className="relative">
                <LockKeyhole className="w-4 h-4 text-slate-300 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-400 focus:bg-slate-900 focus:border-red-500 focus:ring-2 focus:ring-red-900/40 transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 text-white py-3 font-semibold shadow-lg shadow-red-200 hover:bg-red-700 transition disabled:opacity-60"
            >
              {loading ? 'Ingresando...' : 'Ingresar'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer Help */}
          <p className="text-xs text-slate-400 text-center border-t border-slate-700/50 pt-4">
            ¿Problemas para ingresar? Contacta al administrador
          </p>
        </div>
      </div>
    </div>
  );
}
