import { useEffect, useState } from 'react';
import { CalendarDays, CheckCircle2, XCircle, Clock, User, Loader2 } from 'lucide-react';
import leavesService, { type LeaveRequest } from '../../../services/leavesService';

export default function LeavesPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [pending, setPending] = useState<LeaveRequest[]>([]);
  const [teamOutToday, setTeamOutToday] = useState<LeaveRequest[]>([]);
  const [selected, setSelected] = useState<LeaveRequest | null>(null);
  const [history, setHistory] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [pendingList, outToday] = await Promise.all([
        leavesService.list({ status: 'PENDING' }),
        leavesService.list({ status: 'APPROVED', day: today }),
      ]);
      setPending(pendingList);
      setTeamOutToday(outToday);
      if (selected) {
        const stillExists = pendingList.find((p) => p.id === selected.id);
        setSelected(stillExists ?? null);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (empleadoId: number) => {
    const historyList = await leavesService.list({ empleado: empleadoId });
    setHistory(historyList);
  };

  const onSelect = (req: LeaveRequest) => {
    setSelected(req);
    void loadHistory(req.empleado);
  };

  const approve = async () => {
    if (!selected) return;
    setActionLoading(true);
    setError(null);
    try {
      await leavesService.approve(selected.id);
      await load();
      await loadHistory(selected.empleado);
    } catch (e) {
      setError('No se pudo aprobar. Verifica el saldo del empleado.');
    } finally {
      setActionLoading(false);
    }
  };

  const reject = async () => {
    if (!selected) return;
    const reason = window.prompt('Motivo del rechazo:');
    if (!reason) return;
    setActionLoading(true);
    setError(null);
    try {
      await leavesService.reject(selected.id, reason);
      await load();
      await loadHistory(selected.empleado);
    } catch (e) {
      setError('No se pudo rechazar la solicitud.');
    } finally {
      setActionLoading(false);
    }
  };

  const statusBadge = (status: LeaveRequest['status']) => {
    const map = {
      PENDING: 'bg-amber-100 text-amber-800',
      APPROVED: 'bg-emerald-100 text-emerald-800',
      REJECTED: 'bg-rose-100 text-rose-800',
    } as const;
    const label = {
      PENDING: 'Pendiente',
      APPROVED: 'Aprobada',
      REJECTED: 'Rechazada',
    }[status];
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${map[status]}`}>{label}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase text-slate-500">Permisos y Vacaciones</p>
          <h1 className="text-2xl font-bold text-slate-900">Inbox de aprobaciones</h1>
          <p className="text-slate-600">Aprueba o rechaza solicitudes, revisa historial y saldo.</p>
        </div>
        {loading && <Loader2 className="w-5 h-5 animate-spin text-slate-500" />}
      </div>

      {error && <div className="text-sm text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">Solicitudes pendientes</p>
            <span className="text-xs text-slate-500">{pending.length} tareas</span>
          </div>
          <div className="divide-y divide-slate-100">
            {pending.map((req) => (
              <button
                key={req.id}
                onClick={() => onSelect(req)}
                className={`w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center justify-between ${
                  selected?.id === req.id ? 'bg-blue-50' : ''
                }`}
              >
                <div>
                  <p className="font-semibold text-slate-900">{req.empleado_nombre ?? 'Empleado'}</p>
                  <p className="text-sm text-slate-600">{req.start_date} → {req.end_date}</p>
                  <p className="text-xs text-slate-500">{req.reason || 'Sin motivo'}</p>
                </div>
                <div className="flex items-center gap-2">
                  {statusBadge(req.status)}
                  <Clock className="w-4 h-4 text-slate-400" />
                </div>
              </button>
            ))}
            {!loading && pending.length === 0 && (
              <p className="p-4 text-slate-500">Sin solicitudes pendientes.</p>
            )}
            {loading && <p className="p-4 text-slate-500">Cargando...</p>}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-slate-600" />
            <p className="text-sm font-semibold text-slate-800">Detalle de la solicitud</p>
          </div>
          {!selected && <p className="text-sm text-slate-500">Selecciona una solicitud para verla.</p>}
          {selected && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500" />
                <p className="font-semibold text-slate-900">{selected.empleado_nombre ?? 'Empleado'}</p>
              </div>
              <p className="text-sm text-slate-700">{selected.start_date} → {selected.end_date} ({selected.days} días)</p>
              <p className="text-sm text-slate-600">{selected.reason || 'Sin motivo'}</p>
              <div className="flex items-center gap-2">
                {statusBadge(selected.status)}
                {selected.rejection_reason && (
                  <span className="text-xs text-rose-600">{selected.rejection_reason}</span>
                )}
              </div>
              <div className="flex items-center gap-2 pt-3">
                <button
                  onClick={approve}
                  disabled={actionLoading || selected.status !== 'PENDING'}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold disabled:opacity-60"
                >
                  <CheckCircle2 className="w-4 h-4" /> Aprobar
                </button>
                <button
                  onClick={reject}
                  disabled={actionLoading || selected.status !== 'PENDING'}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-600 text-white text-sm font-semibold disabled:opacity-60"
                >
                  <XCircle className="w-4 h-4" /> Rechazar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <p className="text-sm font-semibold text-slate-800">Historial del empleado</p>
          </div>
          <div className="divide-y divide-slate-100">
            {selected && history.length === 0 && <p className="p-4 text-slate-500">Sin historial aún.</p>}
            {!selected && <p className="p-4 text-slate-500">Selecciona una solicitud para cargar el historial.</p>}
            {history.map((item) => (
              <div key={item.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-800">{item.start_date} → {item.end_date}</p>
                  <p className="text-xs text-slate-500">{item.reason || 'Sin motivo'}</p>
                </div>
                {statusBadge(item.status)}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-slate-500" />
            <p className="text-sm font-semibold text-slate-800">Calendario hoy</p>
          </div>
          <div className="divide-y divide-slate-100">
            {teamOutToday.map((req) => (
              <div key={req.id} className="px-4 py-3">
                <p className="font-semibold text-slate-900">{req.empleado_nombre ?? 'Empleado'}</p>
                <p className="text-sm text-slate-600">Ausente hoy ({req.start_date} → {req.end_date})</p>
              </div>
            ))}
            {teamOutToday.length === 0 && <p className="p-4 text-slate-500">Nadie ausente hoy.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
