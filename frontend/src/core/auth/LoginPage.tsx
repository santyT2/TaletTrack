import type { FormEvent, ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ShieldCheck, UserRound, ArrowRight, LockKeyhole, IdCard } from 'lucide-react';
import { useAuth } from './AuthContext';
import authService from '../services/authService';
import talentLogo from '../../../media/talentrack_small.svg';

type RoleOption = 'ADMIN' | 'EMPLOYEE' | null;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<RoleOption>(null);
  const [documentNumber, setDocumentNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const roleCopy = useMemo(() => {
    if (selectedRole === 'ADMIN') return { title: 'Administrador / RRHH', hint: 'Autenticación reforzada para gestión de personas y nómina.' };
    if (selectedRole === 'EMPLOYEE') return { title: 'Colaborador', hint: 'Ingresa para ver tu portal, asistencia y solicitudes.' };
    return { title: 'Elige cómo ingresar', hint: 'Selecciona tu rol para continuar con la autenticación.' };
  }, [selectedRole]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedRole) {
      setError('Selecciona cómo deseas ingresar.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const username = documentNumber.trim();
      const resp = await authService.login(username, password);
      const backendRole = (resp.user.role?.toUpperCase?.() || 'EMPLOYEE') as string;
      const isAdminRole = selectedRole === 'ADMIN' || ['SUPERADMIN', 'GERENTE_SUCURSAL', 'RRHH', 'ADMIN'].includes(backendRole);
      const effectiveRole = isAdminRole ? 'ADMIN' : 'EMPLOYEE';
      login({
        id: String(resp.user.id),
        name: resp.user.name || resp.user.username,
        role: effectiveRole,
        mustChangePassword: resp.user.must_change_password,
        accessToken: resp.access,
        refreshToken: resp.refresh,
      });
      const destination = resp.user.must_change_password ? '/auth/setup-password' : effectiveRole === 'EMPLOYEE' ? '/portal' : '/dashboard';
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
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-8 lg:p-10 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src={talentLogo} alt="Talent Track" className="h-12 w-auto drop-shadow" />
                <div className="text-3xl font-black tracking-tight text-red-600">TALENT TRACK</div>
              </div>
              <p className="text-lg text-slate-700 max-w-xl">Siente el poder de tomar el control de tu capital humano.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-10">
              <RoleCard
                active={selectedRole === 'ADMIN'}
                title="Administrador / RRHH"
                description="Control total sobre el talento, nómina y cumplimiento."
                icon={<Building2 className="w-5 h-5" />}
                onSelect={() => setSelectedRole('ADMIN')}
              />
              <RoleCard
                active={selectedRole === 'EMPLOYEE'}
                title="Colaborador"
                description="Portal personal para asistencia, solicitudes y formación."
                icon={<UserRound className="w-5 h-5" />}
                onSelect={() => setSelectedRole('EMPLOYEE')}
              />
            </div>
          </div>

          <div className="lg:col-span-2 bg-white/98 backdrop-blur-md rounded-3xl shadow-2xl border border-white/40 p-8 space-y-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <ShieldCheck className="w-4 h-4" /> Acceso seguro
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-slate-900">{roleCopy.title}</h1>
              <p className="text-sm text-slate-600">{roleCopy.hint}</p>
            </div>

            {error && <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{error}</p>}

            {selectedRole ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Cédula o Documento</label>
                  <div className="relative">
                    <IdCard className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      value={documentNumber}
                      onChange={(e) => setDocumentNumber(e.target.value)}
                      placeholder="Ingresa tu documento"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 transition"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Contraseña</label>
                  <div className="relative">
                    <LockKeyhole className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 transition"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 text-white py-3 font-semibold shadow-lg shadow-red-200 hover:bg-red-700 transition disabled:opacity-60"
                >
                  {loading ? 'Ingresando...' : 'Entrar'} <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <p className="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-3">
                Selecciona tu rol para desbloquear el formulario.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface RoleCardProps {
  active: boolean;
  title: string;
  description: string;
  icon: ReactNode;
  onSelect: () => void;
}

function RoleCard({ active, title, description, icon, onSelect }: RoleCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`text-left rounded-2xl border p-4 transition shadow-sm hover:-translate-y-1 hover:shadow-lg focus:outline-none ${
        active ? 'border-red-500 bg-red-50 shadow-lg shadow-red-100' : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl inline-flex items-center justify-center ${
            active ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {icon}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="text-xs text-slate-600 leading-relaxed">{description}</p>
        </div>
      </div>
    </button>
  );
}
