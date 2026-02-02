import { useEffect, useMemo, useState } from 'react';
import attendanceService, { type AttendanceRecordNew } from '../../../core/services/attendanceService';

type Row = {
  fecha: string;
  entrada?: string | null;
  salida?: string | null;
  estado: 'Puntual' | 'Atraso' | 'Pendiente';
};

export default function AttendancePage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await attendanceService.history();
        const grouped = buildRows(data);
        setRows(grouped);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const buildRows = (records: AttendanceRecordNew[]): Row[] => {
    const byDate: Record<string, AttendanceRecordNew[]> = {};
    records.forEach((r) => {
      const dateKey = r.timestamp.slice(0, 10);
      byDate[dateKey] = byDate[dateKey] || [];
      byDate[dateKey].push(r);
    });
    return Object.entries(byDate)
      .map(([fecha, recs]) => {
        const entrada = recs.find((r) => r.type === 'CHECK_IN');
        const salida = recs.find((r) => r.type === 'CHECK_OUT');
        const estado = entrada ? (entrada.is_late ? 'Atraso' : 'Puntual') : 'Pendiente';
        const format = (r?: AttendanceRecordNew) => (r ? new Date(r.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : null);
        return { fecha, entrada: format(entrada), salida: format(salida), estado };
      })
      .sort((a, b) => (a.fecha > b.fecha ? -1 : 1));
  };

  const badgeClass = useMemo(
    () => ({
      Puntual: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      Atraso: 'bg-amber-50 text-amber-700 border-amber-100',
      Pendiente: 'bg-slate-50 text-slate-700 border-slate-200',
    }),
    []
  );

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs uppercase text-slate-500">Portal · Historial</p>
        <h1 className="text-2xl font-bold text-slate-900">Mis marcaciones</h1>
        <p className="text-slate-600">Entrada, salida y estado (puntual/atraso).</p>
      </header>

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-800">Historial</p>
          {loading && <span className="text-xs text-slate-500">Cargando...</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Entrada</th>
                <th className="px-4 py-3 text-left">Salida</th>
                <th className="px-4 py-3 text-left">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                    No tienes marcaciones registradas.
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.fecha} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{row.fecha}</td>
                  <td className="px-4 py-3 text-slate-700">{row.entrada || '—'}</td>
                  <td className="px-4 py-3 text-slate-700">{row.salida || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${badgeClass[row.estado]}`}>
                      {row.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
