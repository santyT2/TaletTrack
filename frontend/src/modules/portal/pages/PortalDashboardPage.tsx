import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock3, LogOut, Rocket, CalendarClock, MapPin, CheckCircle2, AlertTriangle, User, TrendingUp, Shield, ListCheck } from 'lucide-react';
import { useAuth } from '../../../auth/AuthContext';
import portalService, { type PortalProfile, type PortalStats } from '../../../services/portalService';
import hrService, { type OnboardingTask } from '../../../services/hrService';

export default function PortalDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PortalProfile | null>(null);
  const [stats, setStats] = useState<PortalStats | null>(null);
  const [tasks, setTasks] = useState<OnboardingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        const [p, s] = await Promise.all([portalService.getProfile(), portalService.getDashboardStats()]);
        setProfile(p);
        setStats(s);
        if (p?.id) {
          const onboarding = await hrService.getOnboardingTasks(p.id);
          setTasks(onboarding);
        }
      } catch (e) {
        setError('No pudimos cargar tu portal. Intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const onboardingProgress = useMemo(() => {
    const total = tasks.length || (stats ? stats.onboarding_pendientes : 0) || 0;
    if (total === 0) return { completed: 0, total: 0, percent: 0 };
    const completed = tasks.filter((t) => t.is_completed).length;
    const percent = Math.round((completed / total) * 100);
    return { completed, total, percent };
  }, [tasks, stats]);

  const turnoLabel = useMemo(() => {
    if (!profile?.turno) return 'Sin turno asignado';
    return `${profile.turno.hora_inicio} - ${profile.turno.hora_fin}`;
  }, [profile]);

  const diasVacaciones = stats?.vacaciones_disponibles ?? 0;

  const pendingTasks = useMemo(() => {
    if (tasks.length > 0) return tasks.filter((t) => !t.is_completed);
    if (stats?.pending_tasks) return stats.pending_tasks.map((t) => ({ id: t.id, title: t.description, is_completed: false, due_date: t.due_date } as any));
    return [];
  }, [tasks, stats]);

  const quickStatus = useMemo(() => {
    const asistencia = stats?.asistencia_mes_pct ?? 0;
    const onboarding = stats?.onboarding_pendientes ?? pendingTasks.length;
    return {
      asistenciaLabel: `${asistencia}% de asistencia este mes`,
      onboardingLabel: onboarding > 0 ? `${onboarding} tareas de RRHH pendientes` : 'Onboarding al día',
      vacacionesLabel: `${diasVacaciones} días de vacaciones`,
    };
  }, [stats, pendingTasks, diasVacaciones]);

  if (loading) {
    return <p className="p-6 text-slate-600">Cargando tu portal...</p>;
  }

  if (error) {
    return <p className="p-6 text-rose-600">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-md p-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase text-blue-100">Portal operativo</p>
          <h1 className="text-2xl font-bold">Hola, {profile?.nombre || user?.name || 'Empleado'}</h1>
          <p className="text-sm text-blue-100">Documento {profile?.documento || user?.id || '—'}</p>
          <div className="flex flex-wrap gap-2 pt-2">
            <HeroPill icon={<Clock3 className="w-4 h-4" />} text={turnoLabel} />
            <HeroPill icon={<Shield className="w-4 h-4" />} text={quickStatus.onboardingLabel} />
            <HeroPill icon={<TrendingUp className="w-4 h-4" />} text={quickStatus.asistenciaLabel} />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/portal/attendance')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 border border-white/30 text-white font-semibold hover:bg-white/20"
          >
            <MapPin className="w-4 h-4" /> Marcar asistencia
          </button>
          <button
            onClick={() => navigate('/portal/leaves')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-blue-700 font-semibold hover:bg-blue-50"
          >
            <CalendarClock className="w-4 h-4" /> Solicitar permiso
          </button>
          <button
            onClick={() => {
              logout();
              navigate('/login', { replace: true });
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/50 text-white hover:bg-white/10"
          >
            <LogOut className="w-4 h-4" /> Cerrar sesión
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Widget
          title="Mi turno"
          value={turnoLabel}
          subtitle={profile?.turno ? 'En turno' : 'Asignar turno'}
          icon={<Clock3 className="w-5 h-5 text-blue-600" />}
        />
        <Widget
          title="Progreso Onboarding"
          value={`${onboardingProgress.completed}/${onboardingProgress.total || '—'}`}
          subtitle={`${onboardingProgress.percent}% completado`}
          icon={<Rocket className="w-5 h-5 text-emerald-600" />}
        />
        <Widget
          title="Vacaciones"
          value={`${diasVacaciones} días`}
          subtitle="Disponibles"
          icon={<CalendarClock className="w-5 h-5 text-amber-600" />}
        />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ActionCard
          title="Marcar asistencia"
          description="Abre el mapa/cámara para registrar tu entrada o salida."
          actionLabel="Ir a Marcar"
          onAction={() => navigate('/portal/attendance')}
          icon={<MapPin className="w-5 h-5 text-blue-700" />}
        />
        <ActionCard
          title="Solicitar permiso"
          description="Crea una nueva solicitud de vacaciones o permiso."
          actionLabel="Nueva solicitud"
          onAction={() => navigate('/portal/leaves')}
          icon={<CalendarClock className="w-5 h-5 text-emerald-700" />}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Asignaciones RRHH</h2>
            </div>
            {pendingTasks.length === 0 && <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full">Al día</span>}
          </div>
          {pendingTasks.length === 0 ? (
            <p className="text-sm text-slate-600">No tienes tareas de onboarding pendientes.</p>
          ) : (
            <ul className="space-y-2">
              {pendingTasks.map((task) => (
                <li key={task.id} className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <ListCheck className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-slate-900">{task.title}</span>
                  {task.due_date ? <span className="text-xs text-slate-500">Vence {task.due_date}</span> : null}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">Asistencia y puntualidad</h2>
          </div>
          <div className="w-full bg-slate-100 rounded-xl h-3 overflow-hidden">
            <div
              className="h-3 bg-blue-600"
              style={{ width: `${Math.min(stats?.attendance_score ?? 0, 100)}%` }}
            />
          </div>
          <p className="text-sm text-slate-600 mt-2">Puntualidad: {stats?.attendance_score ?? 0}% • Presencia: {stats?.asistencia_mes_pct ?? 0}%</p>
          <div className="mt-3 text-xs text-slate-500">Vacaciones: {diasVacaciones} días · Turno: {turnoLabel} {stats?.next_shift ? `(mañana ${stats.next_shift.hora_inicio})` : ''}</div>
        </div>
      </section>
    </div>
  );
}

function Widget({ title, value, subtitle, icon }: { title: string; value: string; subtitle?: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-3">
      <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center">{icon}</div>
      <div>
        <p className="text-xs uppercase text-slate-500">{title}</p>
        <p className="text-xl font-bold text-slate-900">{value}</p>
        {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
      </div>
    </div>
  );
}

function ActionCard({ title, description, actionLabel, onAction, icon }: { title: string; description: string; actionLabel: string; onAction: () => void; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">{icon}</div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
      </div>
      <button
        onClick={onAction}
        className="self-start inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
      >
        {actionLabel}
      </button>
    </div>
  );
}

function HeroPill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-sm font-semibold border border-white/20">
      {icon}
      {text}
    </span>
  );
}
