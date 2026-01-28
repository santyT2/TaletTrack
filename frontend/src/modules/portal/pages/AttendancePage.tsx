import { useEffect, useState } from 'react';
import { Camera, Navigation, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import attendanceService, { type RegistroAsistencia } from '../../../core/services/attendanceService';

export default function AttendancePage() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);
  const [timeline, setTimeline] = useState<RegistroAsistencia[]>([]);

  useEffect(() => {
    cargarHoy();
  }, []);

  const cargarHoy = async () => {
    const data = await attendanceService.listarHoy();
    setTimeline(data);
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const getLocation = () => {
    if (!('geolocation' in navigator)) {
      setMensaje({ tipo: 'error', texto: 'Tu navegador no soporta geolocalización' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setMensaje({ tipo: 'success', texto: 'Ubicación obtenida' });
      },
      () => setMensaje({ tipo: 'error', texto: 'No se pudo obtener ubicación' }),
      { enableHighAccuracy: true }
    );
  };

  const marcar = async () => {
    setLoading(true);
    setMensaje(null);
    try {
      await attendanceService.marcar({
        tipo: 'ENTRADA',
        latitud: coords?.lat,
        longitud: coords?.lng,
      });
      setMensaje({ tipo: 'success', texto: 'Marcado exitoso' });
      await cargarHoy();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Error al marcar';
      setMensaje({ tipo: 'error', texto: msg });
    } finally {
      setLoading(false);
    }
  };

  const timelineHoy = timeline.filter((r) => r.fecha_hora.startsWith(new Date().toISOString().slice(0, 10)));

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs uppercase text-slate-500">Mi asistencia</p>
        <h1 className="text-2xl font-bold text-slate-900">Marcar</h1>
        <p className="text-slate-600">Botón grande, rápido y claro.</p>
      </header>

      {mensaje && (
        <div className={`rounded-lg p-4 ${mensaje.tipo === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
          <div className="flex items-center gap-2">
            {mensaje.tipo === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{mensaje.texto}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Listo para marcar</p>
            <p className="text-lg font-semibold text-slate-900">Entrada / Salida</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={getLocation}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 hover:border-blue-400"
          >
            <Navigation className="w-5 h-5 text-blue-600" />
            {coords ? `Lat ${coords.lat.toFixed(4)}, Lng ${coords.lng.toFixed(4)}` : 'Obtener ubicación'}
          </button>

          <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-3 cursor-pointer hover:border-blue-400">
            <Camera className="w-5 h-5 text-slate-600" />
            <span>{photo ? 'Foto lista' : 'Selfie opcional'}</span>
            <input type="file" accept="image/*" capture="user" className="hidden" onChange={handlePhoto} />
          </label>

          <button
            onClick={marcar}
            disabled={loading}
            className="rounded-xl bg-blue-600 text-white px-4 py-3 font-semibold text-lg hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Marcando...' : 'MARCAR'}
          </button>
        </div>
      </div>

      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Hoy</h3>
        <div className="space-y-3">
          {timelineHoy.length === 0 && <p className="text-slate-500 text-sm">Aún no has marcado hoy.</p>}
          {timelineHoy.map((r) => {
            const fecha = new Date(r.fecha_hora);
            const hora = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            return (
              <div key={r.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className={`w-2 h-12 rounded-full ${r.es_tardanza ? 'bg-amber-500' : 'bg-green-500'}`} />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{r.tipo}</p>
                  <p className="text-xs text-slate-600">{hora}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
