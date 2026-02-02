import { useEffect, useMemo, useState } from 'react';
import attendanceService, { type AttendanceRecordNew } from '../../../core/services/attendanceService';

type Estado = 'OK' | 'Tardanza';
type RangeType = 'today' | 'week' | 'custom';

const todayStr = () => new Date().toISOString().slice(0, 10);
const formatDate = (value: string) => new Date(value).toLocaleDateString('es-ES');
const formatTime = (value: string) => new Date(value).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

export default function AttendancePage() {
  const [registros, setRegistros] = useState<AttendanceRecordNew[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<RangeType>('today');
  const [startDate, setStartDate] = useState<string>(todayStr());
  const [endDate, setEndDate] = useState<string>(todayStr());
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [search, setSearch] = useState('');
  const [sucursal, setSucursal] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const params: Record<string, string> = {};
        if (range === 'today') {
          params.date = startDate;
        } else {
          if (startDate) params.start_date = startDate;
          if (endDate) params.end_date = endDate;
        }
        if (startTime) params.start_time = startTime;
        if (endTime) params.end_time = endTime;
        if (search.trim()) params.search = search.trim();
        if (sucursal) params.sucursal = sucursal;

        const data = await attendanceService.listRecords(params);
        setRegistros(data);
      } catch (err) {
        setError('No se pudieron cargar las marcas.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [range, startDate, endDate, startTime, endTime, search, sucursal]);

  useEffect(() => {
    const today = todayStr();
    if (range === 'today') {
      setStartDate(today);
      setEndDate(today);
    }
    if (range === 'week') {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 6);
      setStartDate(weekStart.toISOString().slice(0, 10));
      setEndDate(today);
    }
  }, [range]);

  const badgeClass = useMemo(
    () => ({
      OK: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      Tardanza: 'bg-amber-50 text-amber-700 border-amber-100',
    }),
    []
  );

  const resumen = useMemo(() => {
    const total = registros.length;
    const tardanzas = registros.filter((r) => r.is_late).length;
    return { total, tardanzas, ok: total - tardanzas };
  }, [registros]);

  const estadoDe = (r: AttendanceRecordNew): Estado => (r.is_late ? 'Tardanza' : 'OK');

  const sucursalOptions = useMemo(() => {
    const pairs = registros
      .filter((r) => r.sucursal_id && r.sucursal_nombre)
      .map((r) => ({ id: r.sucursal_id as number, nombre: r.sucursal_nombre as string }));
    const unique = new Map<number, string>();
    pairs.forEach((p) => unique.set(p.id, p.nombre));
    return Array.from(unique.entries()).map(([id, nombre]) => ({ id, nombre }));
  }, [registros]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs uppercase text-slate-500">Supervisión · Asistencia</p>
          <h1 className="text-2xl font-bold text-slate-900">Reporte y control</h1>
          <p className="text-slate-600">Tabla de marcas filtrable por fecha, rango horario, empleado y sucursal.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">OK</span>
          <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">Tardanza</span>
        </div>
      </header>

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm font-semibold text-slate-800">Marcas</p>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            {loading ? <span>Cargando...</span> : <span>{resumen.total} registros</span>}
          </div>
        </div>
        {error && <div className="px-4 py-3 text-sm text-rose-700 bg-rose-50 border-b border-rose-100">{error}</div>}

        <div className="px-4 py-3 grid grid-cols-1 lg:grid-cols-4 gap-3 border-b border-slate-200 bg-slate-50/60">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-600">Rango</label>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value as RangeType)}
              className="border border-slate-200 rounded-lg px-2 py-2 text-sm bg-white"
            >
              <option value="today">Hoy (filtrar por horas)</option>
              <option value="week">Últimos 7 días</option>
              <option value="custom">Entre dos fechas</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-600">Desde</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-slate-200 rounded-lg px-2 py-2 text-sm w-full"
                disabled={range === 'today'}
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-600">Hasta</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-slate-200 rounded-lg px-2 py-2 text-sm w-full"
                disabled={range === 'today' && startDate === endDate}
                min={startDate}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-600">Hora desde</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="border border-slate-200 rounded-lg px-2 py-2 text-sm w-full"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-600">Hora hasta</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="border border-slate-200 rounded-lg px-2 py-2 text-sm w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-600">Buscar empleado</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nombre, correo o cargo"
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-full"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-600">Sucursal</label>
              <select
                value={sucursal}
                onChange={(e) => setSucursal(e.target.value)}
                className="border border-slate-200 rounded-lg px-2 py-2 text-sm w-full bg-white"
              >
                <option value="">Todas</option>
                {sucursalOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">Empleado</th>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Hora</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Ubicación</th>
                <th className="px-4 py-3 text-left">Sucursal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {registros.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                    Sin marcas registradas para los filtros seleccionados.
                  </td>
                </tr>
              )}
              {registros.map((r) => {
                const estado = estadoDe(r);
                const link = r.latitude && r.longitude ? `https://www.google.com/maps?q=${r.latitude},${r.longitude}` : null;
                return (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{r.employee_name || r.employee}</td>
                    <td className="px-4 py-3 text-slate-700">{formatDate(r.timestamp)}</td>
                    <td className="px-4 py-3 text-slate-700">{r.type}</td>
                    <td className="px-4 py-3 text-slate-700">{formatTime(r.timestamp)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${badgeClass[estado]}`}>{estado}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {link ? (
                        <a className="text-blue-600 hover:underline" href={link} target="_blank" rel="noreferrer">
                          Ver mapa
                        </a>
                      ) : (
                        <span className="text-slate-400">Sin coordenadas</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{r.sucursal_nombre || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
        <div className="p-4">
          <p className="text-xs uppercase text-slate-500">Total marcas</p>
          <p className="text-2xl font-semibold text-slate-900">{resumen.total}</p>
        </div>
        <div className="p-4">
          <p className="text-xs uppercase text-slate-500">Puntuales</p>
          <p className="text-2xl font-semibold text-emerald-700">{resumen.ok}</p>
        </div>
        <div className="p-4">
          <p className="text-xs uppercase text-slate-500">Tardanzas</p>
          <p className="text-2xl font-semibold text-amber-700">{resumen.tardanzas}</p>
        </div>
      </section>
    </div>
  );
}
