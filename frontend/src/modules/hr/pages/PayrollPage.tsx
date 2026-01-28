import { useEffect, useMemo, useState } from 'react';
import { Download, Loader2, RefreshCw } from 'lucide-react';
import hrService, { type PayrollPreviewRow } from '../../../core/services/hrService';

export default function PayrollPage() {
  const today = new Date();
  const [month, setMonth] = useState<number>(today.getMonth() + 1);
  const [year, setYear] = useState<number>(today.getFullYear());
  const [rows, setRows] = useState<PayrollPreviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadPreview();
  }, [month, year]);

  const loadPreview = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hrService.getPayrollPreview({ month, year });
      setRows(data.results || []);
    } catch (err) {
      console.error(err);
      setError('No se pudo calcular la pre-nómina.');
    } finally {
      setLoading(false);
    }
  };

  const csvData = useMemo(() => {
    if (!rows.length) return '';
    const header = 'Empleado,Sueldo Base,Dias Trabajados,Total a Pagar';
    const body = rows
      .map((r) => `${r.employee_name},${r.base_salary},${r.days_worked},${r.estimated_payment}`)
      .join('\n');
    return `${header}\n${body}`;
  }, [rows]);

  const handleExport = () => {
    if (!csvData) return;
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payroll-preview-${year}-${month}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs uppercase text-slate-500">Finanzas · HR</p>
          <h1 className="text-2xl font-bold text-slate-900">Pre-Nómina</h1>
          <p className="text-slate-600">Calcula automáticamente con contratos y ausencias rechazadas.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white shadow-sm"
          >
            {monthNames.map((m, idx) => (
              <option key={m} value={idx + 1}>{m}</option>
            ))}
          </select>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-24 bg-white shadow-sm"
          />
          <button onClick={() => void loadPreview()} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-700">
            <RefreshCw className="w-4 h-4" /> Recalcular
          </button>
          <button
            onClick={handleExport}
            disabled={!rows.length}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60"
          >
            <Download className="w-4 h-4" /> Exportar Excel
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-700 border border-rose-100 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">Empleado</th>
                <th className="px-4 py-3 text-left">Sueldo Base</th>
                <th className="px-4 py-3 text-left">Días trabajados</th>
                <th className="px-4 py-3 text-left">Total a pagar (estimado)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Calculando pre-nómina...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-slate-500">Sin datos de empleados activos.</td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.contract_id}>
                    <td className="px-4 py-3 font-semibold text-slate-900">{row.employee_name}</td>
                    <td className="px-4 py-3">${row.base_salary.toLocaleString('es-CL', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3">{row.days_worked}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-700">${row.estimated_payment.toLocaleString('es-CL', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
