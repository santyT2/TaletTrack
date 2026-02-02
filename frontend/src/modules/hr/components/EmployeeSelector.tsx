import { useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import hrService, { type EmployeeRow } from '../../../core/services/hrService';

export interface EmployeeSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (employee: EmployeeRow) => void;
  initialId?: number | null;
}

export default function EmployeeSelector({ open, onClose, onSelect, initialId }: EmployeeSelectorProps) {
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [branch, setBranch] = useState<string>('');
  const [cargo, setCargo] = useState<string>('');

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await hrService.listEmployees();
        setEmployees(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar empleados.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open]);

  const branches = useMemo(() => Array.from(new Set(employees.map((e) => e.sucursal_nombre).filter(Boolean))) as string[], [employees]);
  const cargos = useMemo(() => Array.from(new Set(employees.map((e) => e.cargo_nombre).filter(Boolean))) as string[], [employees]);

  const filtered = useMemo(() => {
    return employees.filter((e) => {
      const matchSearch = `${e.nombre_completo} ${e.email || ''}`.toLowerCase().includes(search.toLowerCase());
      const matchBranch = branch ? e.sucursal_nombre === branch : true;
      const matchCargo = cargo ? e.cargo_nombre === cargo : true;
      return matchSearch && matchBranch && matchCargo;
    });
  }, [employees, search, branch, cargo]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl border border-slate-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <p className="text-xs uppercase text-slate-500">Seleccionar colaborador</p>
            <h3 className="text-lg font-semibold text-slate-900">Onboarding</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700"><X className="w-5 h-5" /></button>
        </div>

        <div className="px-6 py-4 space-y-3 border-b border-slate-200">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o correo"
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select value={branch} onChange={(e) => setBranch(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm">
              <option value="">Todas las sucursales</option>
              {branches.map((b) => (<option key={b} value={b}>{b}</option>))}
            </select>
            <select value={cargo} onChange={(e) => setCargo(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm">
              <option value="">Todos los cargos</option>
              {cargos.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <p className="p-6 text-sm text-slate-500">Cargando empleados...</p>
          ) : error ? (
            <p className="p-6 text-sm text-rose-600">{error}</p>
          ) : filtered.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">Sin resultados con los filtros actuales.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filtered.map((emp) => (
                <li
                  key={emp.id}
                  className={`flex items-center gap-3 px-6 py-3 hover:bg-slate-50 cursor-pointer ${emp.id === initialId ? 'bg-indigo-50' : ''}`}
                  onClick={() => onSelect(emp)}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-indigo-50 text-indigo-700 font-semibold flex items-center justify-center">
                    {emp.foto_url ? <img src={emp.foto_url} alt={emp.nombre_completo} className="w-full h-full object-cover" /> : (emp.nombre_completo || '?')[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">{emp.nombre_completo}</p>
                    <p className="text-xs text-slate-500">{emp.cargo_nombre || 'Sin cargo'} · {emp.sucursal_nombre || 'Sin sucursal'}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
