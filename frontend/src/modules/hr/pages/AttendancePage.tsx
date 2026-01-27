type Marca = {
  empleado: string;
  tipo: 'Entrada' | 'Salida';
  hora: string;
  estado: 'OK' | 'Tardanza' | 'Falta';
};

const MARCAS: Marca[] = [
  { empleado: 'María Gómez', tipo: 'Entrada', hora: '08:12', estado: 'Tardanza' },
  { empleado: 'Luis Pérez', tipo: 'Entrada', hora: '07:58', estado: 'OK' },
  { empleado: 'Ana Ruiz', tipo: 'Entrada', hora: '—', estado: 'Falta' },
];

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs uppercase text-slate-500">Supervisión · Asistencia</p>
          <h1 className="text-2xl font-bold text-slate-900">Reporte y control</h1>
          <p className="text-slate-600">Tabla de marcas, faltas y correcciones. Sin acciones de marcado.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">OK</span>
          <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">Tardanza</span>
          <span className="px-2 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100">Falta</span>
        </div>
      </header>

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-800">Marcas del día</p>
          <p className="text-xs text-slate-500">Vista solo lectura</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">Empleado</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Hora</th>
                <th className="px-4 py-3 text-left">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MARCAS.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{m.empleado}</td>
                  <td className="px-4 py-3 text-slate-700">{m.tipo}</td>
                  <td className="px-4 py-3 text-slate-700">{m.hora}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full border ${
                        m.estado === 'OK'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : m.estado === 'Tardanza'
                          ? 'bg-amber-50 text-amber-700 border-amber-100'
                          : 'bg-rose-50 text-rose-700 border-rose-100'
                      }`}
                    >
                      {m.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-800">Correcciones pendientes</p>
          <p className="text-xs text-slate-500">Para aprobar/editar en otro flujo</p>
        </div>
        <div className="p-4 text-sm text-slate-600">Integra aquí la bandeja de ajustes de horario (sin botón de marcar).</div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-800">Faltas y alertas</p>
          <p className="text-xs text-slate-500">Resumen diario</p>
        </div>
        <div className="p-4 text-sm text-slate-600">Muestra aquí la lista de ausencias y tardanzas críticas.</div>
      </section>
    </div>
  );
}
