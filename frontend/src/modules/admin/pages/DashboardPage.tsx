import { useEffect, useMemo, useState, type ReactElement } from 'react';
import { Activity, Users, AlertTriangle, Clock, CheckCircle2, MapPin } from 'lucide-react';
import leavesService, { type LeaveRequest } from '../../../core/services/leavesService';
import attendanceService, { type RegistroAsistencia } from '../../../core/services/attendanceService';

interface ContractAlert {
  empleado: string;
  vence_el: string;
  dias_restantes: number;
}

export default function DashboardPage() {
  const [absences, setAbsences] = useState<LeaveRequest[]>([]);
  const [workingNow, setWorkingNow] = useState<RegistroAsistencia[]>([]);
  const [contractAlerts, setContractAlerts] = useState<ContractAlert[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const [approvedToday, registrosHoy] = await Promise.all([
        leavesService.list({ status: 'APPROVED', day: today }),
        attendanceService.listar({ fecha_inicio: today, fecha_fin: today }),
      ]);
      setAbsences(approvedToday);
      // Consider ENTRADA as "working now"; last entrada without salida.
      const entradas = registrosHoy.filter((r) => r.tipo === 'ENTRADA');
      setWorkingNow(entradas.slice(0, 10));

      // Mock contract alerts (no API yet)
      setContractAlerts([
        { empleado: 'María Gómez', vence_el: addDays(today, 25), dias_restantes: 25 },
        { empleado: 'Luis Pérez', vence_el: addDays(today, 40), dias_restantes: 40 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const metrics = useMemo(() => {
    const totalAbs = absences.length;
    const tardanzas = workingNow.filter((r) => r.es_tardanza).length;
    const working = workingNow.length;
    return { totalAbs, tardanzas, working };
  }, [absences, workingNow]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase text-slate-500">Dashboard Gerencial</p>
          <h1 className="text-2xl font-bold text-slate-900">Visión global</h1>
          <p className="text-slate-600">Ausentismo, actividad en vivo y alertas críticas.</p>
        </div>
        {loading && <span className="text-sm text-slate-500">Actualizando...</span>}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          icon={<Activity className="w-5 h-5 text-emerald-600" />}
          title="Ausentismo hoy"
          value={`${metrics.totalAbs} ausentes`}
          hint="Solicitudes aprobadas en la fecha"
          tone="emerald"
        />
        <MetricCard
          icon={<Users className="w-5 h-5 text-blue-600" />}
          title="En jornada"
          value={`${metrics.working} conectados`}
          hint="Últimas entradas registradas"
          tone="blue"
        />
        <MetricCard
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          title="Tardanzas"
          value={`${metrics.tardanzas} hoy`}
          hint="Marcas de entrada fuera de hora"
          tone="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <header className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
              <Activity className="w-4 h-4 text-emerald-600" /> Ausentismo global
            </div>
            <span className="text-xs text-slate-500">Hoy</span>
          </header>
          <div className="p-4 space-y-3">
            {absences.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <div>
                  <p className="font-semibold text-emerald-900">{item.empleado_nombre ?? 'Empleado'}</p>
                  <p className="text-sm text-emerald-800">Ausente {item.start_date} → {item.end_date}</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
            ))}
            {absences.length === 0 && <p className="text-slate-500 text-sm">Sin ausencias aprobadas hoy.</p>}
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <header className="px-4 py-3 border-b border-slate-200 flex items-center gap-2 text-slate-800 font-semibold text-sm">
            <Users className="w-4 h-4 text-blue-600" /> Quién está trabajando ahora
          </header>
          <div className="divide-y divide-slate-100">
            {workingNow.map((reg) => (
              <div key={reg.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{reg.empleado_nombre ?? 'Empleado'}</p>
                  <p className="text-xs text-slate-500">Entrada: {new Date(reg.fecha_hora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {reg.latitud && reg.longitud ? 'Geo OK' : 'Sin geo'}
                </div>
              </div>
            ))}
            {workingNow.length === 0 && <p className="p-4 text-slate-500 text-sm">Sin registros de entrada hoy.</p>}
          </div>
        </section>
      </div>

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <header className="px-4 py-3 border-b border-slate-200 flex items-center gap-2 text-slate-800 font-semibold text-sm">
          <AlertTriangle className="w-4 h-4 text-rose-600" /> Contratos por vencer
        </header>
        <div className="divide-y divide-slate-100">
          {contractAlerts.map((alert, idx) => (
            <div key={idx} className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">{alert.empleado}</p>
                <p className="text-sm text-slate-600">Vence el {alert.vence_el}</p>
              </div>
              <span className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full">
                {alert.dias_restantes} días
              </span>
            </div>
          ))}
          {contractAlerts.length === 0 && <p className="p-4 text-slate-500 text-sm">Sin contratos próximos a vencer.</p>}
        </div>
      </section>
    </div>
  );
}

function MetricCard({ icon, title, value, hint, tone }: { icon: ReactElement; title: string; value: string; hint: string; tone: 'emerald' | 'blue' | 'amber' }) {
  const toneMap = {
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-900',
    blue: 'bg-blue-50 border-blue-100 text-blue-900',
    amber: 'bg-amber-50 border-amber-100 text-amber-900',
  } as const;

  return (
    <div className={`rounded-2xl border shadow-sm p-4 flex items-center justify-between ${toneMap[tone]}`}>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        <p className="text-xs mt-1 opacity-80">{hint}</p>
      </div>
      <div className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center shadow-inner">{icon}</div>
    </div>
  );
}

function addDays(dateISO: string, days: number) {
  const d = new Date(dateISO);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
