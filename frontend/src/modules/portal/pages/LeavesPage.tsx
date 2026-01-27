import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { CalendarDays, Plus, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import leavesService, { type LeaveRequest } from '../../../services/leavesService';

interface FormState {
  start_date: string;
  end_date: string;
  reason: string;
}

export default function LeavesPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>({ start_date: today, end_date: today, reason: '' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await leavesService.list();
      setRequests(data);
    } finally {
      setLoading(false);
    }
  };

  const counts = useMemo(() => {
    const pending = requests.filter((r) => r.status === 'PENDING').length;
    const approved = requests.filter((r) => r.status === 'APPROVED').length;
    return { pending, approved };
  }, [requests]);

  const handleSubmit = async (evt: React.FormEvent) => {
    evt.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await leavesService.create(form);
      await load();
      setModalOpen(false);
      setForm({ start_date: today, end_date: today, reason: '' });
    } catch (e) {
      setError('No pudimos enviar tu solicitud. Revisa las fechas o intenta de nuevo.');
    } finally {
      setSaving(false);
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
      APPROVED: 'Aprobado',
      REJECTED: 'Rechazado',
    }[status];
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${map[status]}`}>{label}</span>;
  };

  return (
    <section className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase text-slate-500">Permisos y Vacaciones</p>
          <h1 className="text-2xl font-bold text-slate-900">Mis solicitudes</h1>
          <p className="text-slate-600">Revisa el estado y crea nuevas solicitudes.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Nueva solicitud
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title="Pendientes"
          value={counts.pending}
          accent="bg-amber-50 text-amber-800 border-amber-200"
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          description="Esperando aprobación"
        />
        <StatCard
          title="Aprobadas"
          value={counts.approved}
          accent="bg-emerald-50 text-emerald-800 border-emerald-200"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          description="Listas para usar"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-3">
          <CalendarDays className="w-4 h-4 text-slate-500" />
          <p className="text-sm font-semibold text-slate-800">Historial de solicitudes</p>
          <span className="text-xs text-slate-500">{requests.length} registros</span>
        </div>
        <div className="divide-y divide-slate-100">
          {loading && <p className="p-4 text-slate-500">Cargando...</p>}
          {!loading && requests.length === 0 && (
            <p className="p-4 text-slate-500">Aún no tienes solicitudes. Crea la primera.</p>
          )}
          {!loading &&
            requests.map((req) => (
              <article key={req.id} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">
                    {req.start_date} → {req.end_date}
                  </p>
                  <p className="text-sm text-slate-600">{req.reason || 'Sin motivo registrado'}</p>
                  <p className="text-xs text-slate-500">{req.days} días</p>
                </div>
                <div className="flex items-center gap-2">
                  {statusBadge(req.status)}
                  {req.status === 'REJECTED' && req.rejection_reason ? (
                    <span className="text-xs text-rose-600">{req.rejection_reason}</span>
                  ) : null}
                </div>
              </article>
            ))}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase text-slate-500">Nueva solicitud</p>
                <h2 className="text-xl font-bold text-slate-900">Permiso o vacaciones</h2>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-500 hover:text-slate-700">✕</button>
            </div>
            {error && (
              <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">{error}</p>
            )}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex flex-col text-sm text-slate-700">
                  Inicio
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                    className="mt-1 border border-slate-300 rounded-lg px-3 py-2"
                    required
                  />
                </label>
                <label className="flex flex-col text-sm text-slate-700">
                  Fin
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                    className="mt-1 border border-slate-300 rounded-lg px-3 py-2"
                    required
                  />
                </label>
              </div>
              <label className="flex flex-col text-sm text-slate-700">
                Motivo
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                  className="mt-1 border border-slate-300 rounded-lg px-3 py-2"
                  placeholder="Ej. Vacaciones, cita médica, trámite personal"
                  rows={3}
                />
              </label>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white border border-amber-200 text-amber-800 rounded-xl px-4 py-3 flex items-start gap-2">
        <AlertTriangle className="w-5 h-5 mt-0.5" />
        <p className="text-sm">Recibirás una notificación cuando RRHH procese tu solicitud.</p>
      </div>
    </section>
  );
}

function StatCard({ title, value, accent, icon, description }: { title: string; value: number; accent: string; icon: ReactNode; description: string }) {
  return (
    <div className={`rounded-2xl border p-4 shadow-sm flex items-center justify-between ${accent}`}>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
        <p className="text-xs mt-1 opacity-80">{description}</p>
      </div>
      <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center shadow-inner">{icon}</div>
    </div>
  );
}
