import { useState } from 'react';
import { BarChart3, Calendar, Download, FileSpreadsheet, FileText } from 'lucide-react';

export default function ReportsPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const handleExport = (type: 'asistencia' | 'nomina' | 'movimientos') => {
    const range = from && to ? ` (${from} a ${to})` : '';
    // TODO: reemplazar con llamada a API (axios/fetch) y descarga blob
    alert(`Generando reporte de ${type}${range}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs uppercase text-slate-500">Analitica · Reportes</p>
          <h1 className="text-2xl font-bold text-slate-900">Centro de reportes</h1>
          <p className="text-slate-600">Descarga asistencia, pre-nomina y movimientos de personal.</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm text-sm text-slate-700">
          <Calendar className="w-4 h-4 text-slate-500" />
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <span className="text-slate-400">-</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-700">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Asistencia</h3>
              <p className="text-sm text-slate-500">Entradas, salidas, tardanzas y horas trabajadas.</p>
            </div>
          </div>
          <button
            onClick={() => handleExport('asistencia')}
            className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800"
          >
            <Download className="w-4 h-4" /> Exportar Excel
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Pre-nomina</h3>
              <p className="text-sm text-slate-500">Horas extra, ausencias y resumen de pagos.</p>
            </div>
          </div>
          <button
            onClick={() => handleExport('nomina')}
            className="w-full inline-flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-800 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50"
          >
            <Download className="w-4 h-4" /> Descargar resumen
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-100 text-purple-700">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Movimientos</h3>
              <p className="text-sm text-slate-500">Altas, bajas y renovaciones de contrato.</p>
            </div>
          </div>
          <button
            onClick={() => handleExport('movimientos')}
            className="w-full inline-flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-800 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50"
          >
            <Download className="w-4 h-4" /> Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
}
