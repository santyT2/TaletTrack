import { useEffect, useState } from 'react';
import { CalendarRange, MapPin, Image as ImageIcon, Edit3, ShieldAlert } from 'lucide-react';
import attendanceService, { type RegistroAsistencia } from '../../../core/services/attendanceService';

interface Filters {
  fecha_inicio: string;
  fecha_fin: string;
}

export default function AttendancePage() {
  const hoy = new Date().toISOString().slice(0, 10);
  const [filters, setFilters] = useState<Filters>({ fecha_inicio: hoy, fecha_fin: hoy });
  const [rows, setRows] = useState<RegistroAsistencia[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await attendanceService.listar(filters);
      setRows(data);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof Filters, value: string) => {
    setFilters((f) => ({ ...f, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase text-slate-500">Asistencia</p>
          <h1 className="text-2xl font-bold text-slate-900">Supervisión y corrección</h1>
          <p className="text-slate-600">Filtra, revisa y corrige marcas.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <CalendarRange className="w-4 h-4" />
            <input
              type="date"
              value={filters.fecha_inicio}
              onChange={(e) => handleChange('fecha_inicio', e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2"
            />
          </label>
          <span className="text-slate-400">–</span>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <CalendarRange className="w-4 h-4" />
            <input
              type="date"
              value={filters.fecha_fin}
              onChange={(e) => handleChange('fecha_fin', e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2"
            />
          </label>
          <button
            onClick={load}
            disabled={loading}
            className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Cargando...' : 'Aplicar'}
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-800">Registros</p>
          <p className="text-xs text-slate-500">{rows.length} filas</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">Empleado</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Hora</th>
                <th className="px-4 py-3 text-left">Geo</th>
                <th className="px-4 py-3 text-left">Foto</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => {
                const fecha = new Date(row.fecha_hora);
                const hora = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                const estado = row.es_tardanza ? 'Tardanza' : 'OK';
                return (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-900 font-medium">
                      {row.empleado_nombre ?? 'Empleado'}
                      <p className="text-xs text-slate-500">{row.cargo ?? ''}</p>
                    </td>
                    <td className="px-4 py-3">{row.tipo}</td>
                    <td className="px-4 py-3 text-slate-700">{hora}</td>
                    <td className="px-4 py-3">
                      {row.latitud && row.longitud ? (
                        <a
                          href={`https://www.google.com/maps?q=${row.latitud},${row.longitud}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          <MapPin className="w-4 h-4" /> Ver mapa
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      <div className="inline-flex items-center gap-1 text-slate-500">
                        <ImageIcon className="w-4 h-4" />
                        N/A
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${estado === 'OK' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 space-x-2">
                      <button className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200">
                        <ShieldAlert className="w-4 h-4" /> Justificar
                      </button>
                      <button className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200">
                        <Edit3 className="w-4 h-4" /> Editar
                      </button>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">Sin registros</td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">Cargando...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
