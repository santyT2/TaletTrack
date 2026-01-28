import { useEffect, useMemo, useState } from 'react';
import { Loader2, Pencil } from 'lucide-react';
import hrService, { type EmployeeRow } from '../../../core/services/hrService';
import EmployeeManagerModal from '../components/EmployeeManagerModal';

export default function EmployeesPage() {
  const [rows, setRows] = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<EmployeeRow | null>(null);

  useEffect(() => {
    void loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hrService.listEmployees();
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar la lista de empleados.');
    } finally {
      setLoading(false);
    }
  };

  const data = useMemo(() => rows, [rows]);

  const contractBadge = (emp: EmployeeRow) => {
    const contractType = emp.active_contract?.contract_type;
    if (!contractType) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-700">Sin contrato</span>;
    }
    return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700">{contractType.replace('_', ' ')}</span>;
  };

  const statusBadge = (estado: string) => {
    const map: Record<string, string> = {
      activo: 'bg-emerald-50 text-emerald-700',
      onboarding: 'bg-amber-50 text-amber-700',
      inactivo: 'bg-slate-100 text-slate-700',
    };
    const cls = map[estado] || 'bg-slate-100 text-slate-700';
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${cls}`}>{estado}</span>;
  };

  return (
    <section className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Empleados</h1>
            <p className="text-slate-600">Centro de comando RRHH: perfil, contrato y turno.</p>
          </div>
          <button
            onClick={() => void loadEmployees()}
            className="text-sm font-semibold text-indigo-700 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100 hover:bg-indigo-100"
          >
            Refrescar
          </button>
        </div>

        {error && <div className="text-sm text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2 mb-3">{error}</div>}

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">Colaborador</th>
                <th className="px-4 py-3 text-left">Cargo/Posición</th>
                <th className="px-4 py-3 text-left">Sucursal</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Contrato</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-500"><Loader2 className="inline w-5 h-5 animate-spin mr-2" /> Cargando empleados...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-500">No hay empleados registrados.</td></tr>
              ) : (
                data.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center overflow-hidden">
                          {emp.foto_url ? <img src={emp.foto_url} alt={emp.nombre_completo} className="w-full h-full object-cover" /> : emp.nombre_completo?.charAt(0) || '?'}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">{emp.nombre_completo}</span>
                          <span className="text-xs text-slate-500">{emp.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">{emp.cargo_nombre || 'Sin cargo'}</span></td>
                    <td className="px-4 py-3 text-slate-600">{emp.sucursal_nombre || '—'}</td>
                    <td className="px-4 py-3">{statusBadge(emp.estado)}</td>
                    <td className="px-4 py-3">{contractBadge(emp)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelected(emp)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
                      >
                        <Pencil className="w-4 h-4" /> Gestionar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <EmployeeManagerModal
          employee={selected}
          onClose={() => setSelected(null)}
          onSaved={async () => {
            await loadEmployees();
            setSelected(null);
          }}
        />
      )}
    </section>
  );
}
