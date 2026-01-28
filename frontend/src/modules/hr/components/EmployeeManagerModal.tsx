import { useEffect, useState } from 'react';
import { X, Save, Clock3 } from 'lucide-react';
import hrService, { type EmployeeRow, type ContractPayload, type WorkShift } from '../../../core/services/hrService';

interface Props {
  employee: EmployeeRow;
  onClose: () => void;
  onSaved: () => void;
}

type TabKey = 'perfil' | 'contrato' | 'turno';

const CONTRACT_OPTIONS: ContractPayload['contract_type'][] = ['INDEFINIDO', 'PLAZO_FIJO', 'SERVICIOS_PRO'];

export default function EmployeeManagerModal({ employee, onClose, onSaved }: Props) {
  const [tab, setTab] = useState<TabKey>('perfil');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workShifts, setWorkShifts] = useState<WorkShift[]>([]);

  const [contractForm, setContractForm] = useState({
    contract_type: (employee.active_contract?.contract_type as ContractPayload['contract_type']) || 'INDEFINIDO',
    start_date: employee.active_contract?.start_date || '',
    end_date: employee.active_contract?.end_date || '',
    salary: Number(employee.active_contract?.salary || 0),
    schedule_description: employee.active_contract?.schedule_description || 'L-V 9-18',
  });

  const [shiftId, setShiftId] = useState<number | null>(employee.current_shift ?? null);

  useEffect(() => {
    void loadShifts();
  }, []);

  const loadShifts = async () => {
    try {
      const data = await hrService.listWorkShifts();
      setWorkShifts(data);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los turnos.');
    }
  };

  const minSalary = employee.position_details ? Number(employee.position_details.min_salary) : NaN;
  const maxSalary = employee.position_details ? Number(employee.position_details.max_salary) : NaN;
  const salaryWarning = Number.isFinite(minSalary) && Number.isFinite(maxSalary) && (contractForm.salary < minSalary || contractForm.salary > maxSalary)
    ? `El salario para ${employee.position_details?.name} debe estar entre $${minSalary} y $${maxSalary}`
    : '';

  const saveContract = async () => {
    try {
      setSaving(true);
      setError(null);
      const payload: ContractPayload = {
        employee: employee.id,
        contract_type: contractForm.contract_type,
        start_date: contractForm.start_date,
        end_date: contractForm.end_date || null,
        salary: Number(contractForm.salary || 0),
        schedule_description: contractForm.schedule_description,
        is_active: true,
      };
      await hrService.saveContract(payload);
      await onSaved();
    } catch (err) {
      console.error(err);
      setError('No se pudo guardar el contrato.');
    } finally {
      setSaving(false);
    }
  };

  const saveShift = async () => {
    try {
      if (shiftId === undefined) return;
      setSaving(true);
      setError(null);
      await hrService.assignShift(employee.id, shiftId);
      await onSaved();
    } catch (err) {
      console.error(err);
      setError('No se pudo asignar el turno.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <p className="text-xs uppercase text-slate-500">Gestionar colaborador</p>
            <h2 className="text-xl font-bold text-slate-900">{employee.nombre_completo}</h2>
            <p className="text-sm text-slate-500">{employee.email}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700"><X className="w-5 h-5" /></button>
        </div>

        <div className="px-6 pt-4">
          <div className="flex gap-2 mb-4">
            {['perfil', 'contrato', 'turno'].map((key) => (
              <button
                key={key}
                onClick={() => setTab(key as TabKey)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold border ${tab === key ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200'}`}
              >
                {key === 'perfil' && 'Perfil'}
                {key === 'contrato' && 'Contrato'}
                {key === 'turno' && 'Horario/Turno'}
              </button>
            ))}
          </div>

          {error && <div className="text-sm text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2 mb-3">{error}</div>}
        </div>

        {tab === 'perfil' && (
          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Info label="Teléfono" value={employee.telefono || '—'} />
              <Info label="Dirección" value={employee.direccion || '—'} />
              <Info label="Sucursal" value={employee.sucursal_nombre || '—'} />
              <Info label="Cargo" value={employee.cargo_nombre || '—'} />
            </div>
            <p className="text-xs text-slate-500 mt-4">Este perfil es de solo lectura. La edición completa se gestiona en el módulo de empleados.</p>
          </div>
        )}

        {tab === 'contrato' && (
          <div className="px-6 pb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">Tipo de contrato</label>
                <select
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  value={contractForm.contract_type}
                  onChange={(e) => setContractForm({ ...contractForm, contract_type: e.target.value as ContractPayload['contract_type'] })}
                >
                  {CONTRACT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Salario base</label>
                <div className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm flex items-center gap-2">
                  <span className="text-slate-500">$</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    className="w-full outline-none bg-transparent"
                    value={contractForm.salary}
                    onChange={(e) => setContractForm({ ...contractForm, salary: Number(e.target.value) })}
                    placeholder="1500.00"
                  />
                </div>
                {salaryWarning && (
                  <p className="text-xs text-rose-600 mt-1">{salaryWarning}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Fecha inicio</label>
                <input
                  type="date"
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  value={contractForm.start_date}
                  onChange={(e) => setContractForm({ ...contractForm, start_date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Fecha fin</label>
                <input
                  type="date"
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  value={contractForm.end_date || ''}
                  onChange={(e) => setContractForm({ ...contractForm, end_date: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Descripción de horario</label>
                <input
                  type="text"
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  value={contractForm.schedule_description}
                  onChange={(e) => setContractForm({ ...contractForm, schedule_description: e.target.value })}
                  placeholder="L-V 9-18"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => void saveContract()}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60"
              >
                <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar / Renovar contrato'}
              </button>
            </div>
          </div>
        )}

        {tab === 'turno' && (
          <div className="px-6 pb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">Seleccionar turno</label>
                <select
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  value={shiftId ?? ''}
                  onChange={(e) => setShiftId(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">Sin turno</option>
                  {workShifts.map((shift) => (
                    <option key={shift.id} value={shift.id}>{`${shift.name} (${shift.start_time} - ${shift.end_time})`}</option>
                  ))}
                </select>
              </div>
              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                <p className="text-xs uppercase text-slate-500 mb-1">Detalle turno</p>
                {shiftId ? (
                  <ShiftDetails shift={workShifts.find((s) => s.id === shiftId) || null} />
                ) : (
                  <p className="text-sm text-slate-500">Ningún turno asignado.</p>
                )}
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => void saveShift()}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-60"
              >
                <Clock3 className="w-4 h-4" /> {saving ? 'Guardando...' : 'Asignar turno'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-slate-200 rounded-lg p-3 bg-white">
      <p className="text-xs uppercase text-slate-500 mb-1">{label}</p>
      <p className="text-sm text-slate-800">{value}</p>
    </div>
  );
}

function ShiftDetails({ shift }: { shift: WorkShift | null }) {
  if (!shift) return <p className="text-sm text-slate-500">Selecciona un turno para ver detalles.</p>;
  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const days = Array.isArray(shift.days) ? shift.days.map((d) => dayNames[d] ?? d).join(', ') : '—';
  return (
    <div className="space-y-1 text-sm text-slate-700">
      <p className="font-semibold">{shift.name}</p>
      <p>Horario: {shift.start_time} - {shift.end_time}</p>
      <p>Días: {days}</p>
    </div>
  );
}
