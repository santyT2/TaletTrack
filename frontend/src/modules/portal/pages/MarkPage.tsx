import { useEffect, useMemo, useState } from 'react';
import { MapPin, Clock, AlertCircle, CheckCircle, Compass, Loader2, LogIn, LogOut } from 'lucide-react';
import attendanceService, { type AttendanceRecordNew, type AttendanceTodayStatus } from '../../../core/services/attendanceService';

export default function MarkPage() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [status, setStatus] = useState<AttendanceTodayStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [clock, setClock] = useState<Date | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [history, setHistory] = useState<AttendanceRecordNew[]>([]);

  // Cargar estado inicial (server time + status + history)
  useEffect(() => {
    const init = async () => {
      try {
        const st = await attendanceService.todayStatus();
        setStatus(st);
        setClock(new Date(st.server_time));
        const hist = await attendanceService.history();
        setHistory(hist);
      } catch (err) {
        setMessage({ type: 'error', text: 'No se pudo cargar el estado inicial.' });
      }
    };
    init();
  }, []);

  // Reloj local basado en hora de servidor
  useEffect(() => {
    if (!clock) return;
    const interval = setInterval(() => {
      setClock((prev) => (prev ? new Date(prev.getTime() + 1000) : null));
    }, 1000);
    return () => clearInterval(interval);
  }, [clock]);

  const nextAction = useMemo(() => {
    if (!status) return 'CHECK_IN' as const;
    if (status.has_checked_in && !status.has_checked_out) return 'CHECK_OUT' as const;
    return 'CHECK_IN' as const;
  }, [status]);

  const handleGeo = () => {
    if (!('geolocation' in navigator)) {
      setMessage({ type: 'error', text: 'Tu navegador no soporta geolocalización.' });
      return;
    }
    setMessage(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setMessage({ type: 'success', text: 'Ubicación obtenida.' });
      },
      () => setMessage({ type: 'error', text: 'No se pudo obtener tu ubicación.' }),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleMark = async () => {
    if (!coords) {
      setMessage({ type: 'error', text: 'Necesitas compartir tu ubicación para marcar.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const rec = await attendanceService.markNew({ type: nextAction, latitude: coords.lat, longitude: coords.lng });
      setHistory((prev) => [rec, ...prev]);
      const st = await attendanceService.todayStatus();
      setStatus(st);
      setMessage({ type: 'success', text: `Marcación registrada (${nextAction === 'CHECK_IN' ? 'Entrada' : 'Salida'})` });
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Error al marcar asistencia.';
      setMessage({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  const canMark = Boolean(coords) && !loading;
  const actionLabel = nextAction === 'CHECK_IN' ? 'Registrar Entrada' : 'Registrar Salida';
  const actionIcon = nextAction === 'CHECK_IN' ? <LogIn className="w-5 h-5" /> : <LogOut className="w-5 h-5" />;

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs uppercase text-slate-500">Portal · Asistencia</p>
          <h2 className="text-2xl font-bold text-slate-900">Marcación con GPS</h2>
          <p className="text-slate-600">Comparte tu ubicación y marca entrada/salida.</p>
        </div>
        {clock && (
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
            <Clock className="w-5 h-5 text-indigo-600" />
            <span className="font-mono text-lg text-slate-900">{clock.toLocaleTimeString('es-ES')}</span>
          </div>
        )}
      </header>

      {message && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        <button onClick={handleGeo} className="rounded-xl border border-slate-200 px-4 py-3 flex items-center justify-between hover:border-indigo-300">
          <div className="flex items-center gap-3">
            <Compass className="w-5 h-5 text-indigo-600" />
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-900">Ubicación</p>
              <p className="text-xs text-slate-600">Activa GPS antes de marcar</p>
            </div>
          </div>
          <div className="text-xs text-slate-500">{coords ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : 'Sin coordenadas'}</div>
        </button>

        <div className="rounded-xl border border-slate-200 p-3">
          <p className="text-sm font-semibold text-slate-900 mb-2">Mapa</p>
          {coords ? (
            <iframe
              title="ubicacion"
              className="w-full h-40 rounded-lg border"
              src={`https://www.google.com/maps?q=${coords.lat},${coords.lng}&z=16&output=embed`}
              allowFullScreen
            />
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-500 text-sm bg-slate-50 rounded-lg">Comparte tu ubicación para ver el mapa</div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 p-3 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-600" />
            <p className="text-sm font-semibold text-slate-900">Acción</p>
          </div>
          <p className="text-xs text-slate-600">Seleccionada según tu último registro de hoy.</p>
          <button
            onClick={handleMark}
            disabled={!canMark}
            className={`w-full flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-white font-semibold transition-colors disabled:opacity-60 ${nextAction === 'CHECK_IN' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : actionIcon}
            {actionLabel}
          </button>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
        <p className="text-sm font-semibold text-slate-900 mb-3">Últimas marcaciones</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {history.slice(0, 6).map((h) => {
            const date = new Date(h.timestamp);
            return (
              <div key={h.id} className="rounded-lg bg-white border border-slate-200 p-3 shadow-sm">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{date.toLocaleDateString('es-ES')}</span>
                  <span>{date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`px-2 py-1 text-[11px] font-semibold rounded-full ${h.type === 'CHECK_IN' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    {h.type === 'CHECK_IN' ? 'Entrada' : h.type === 'CHECK_OUT' ? 'Salida' : h.type}
                  </span>
                  {h.is_late && <span className="text-[11px] font-semibold text-amber-600">Tarde</span>}
                </div>
                {h.latitude && h.longitude && (
                  <a
                    className="text-xs text-indigo-600 hover:underline"
                    href={`https://maps.google.com/?q=${h.latitude},${h.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ver ubicación
                  </a>
                )}
              </div>
            );
          })}
          {history.length === 0 && <p className="text-sm text-slate-500">Aún no tienes marcaciones.</p>}
        </div>
      </div>
    </section>
  );
}
