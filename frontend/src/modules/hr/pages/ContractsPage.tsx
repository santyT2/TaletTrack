import { useMemo, useState } from 'react';
import { AlertTriangle, Calendar, CheckCircle2, FileText, Filter, XCircle } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

type Row = {
    id: number;
    empleado: string;
    tipo: string;
    inicio: string;
    fin: string | null;
    salario: number;
    estado: 'activo' | 'inactivo';
};

const MOCK_ROWS: Row[] = [
    { id: 1, empleado: 'María Gómez', tipo: 'Indefinido', inicio: '2024-06-01', fin: '2025-05-31', salario: 1500, estado: 'activo' },
    { id: 2, empleado: 'Luis Pérez', tipo: 'Plazo fijo', inicio: '2024-11-01', fin: '2025-02-15', salario: 1200, estado: 'activo' },
    { id: 3, empleado: 'Ana Ruiz', tipo: 'Indefinido', inicio: '2023-01-10', fin: null, salario: 1800, estado: 'activo' },
];

type FilterOption = 'todos' | 'vencidos' | 'por_vencer' | 'activos';

export default function ContractsPage() {
    const [filter, setFilter] = useState<FilterOption>('todos');

    const filtered = useMemo(() => {
        const today = new Date();
        return MOCK_ROWS.filter((row) => {
            if (filter === 'activos') return row.estado === 'activo';
            if (filter === 'vencidos') return row.fin !== null && differenceInDays(parseISO(row.fin), today) < 0;
            if (filter === 'por_vencer') return row.fin !== null && differenceInDays(parseISO(row.fin), today) >= 0 && differenceInDays(parseISO(row.fin), today) <= 30;
            return true;
        });
    }, [filter]);

    const badge = (fin: string | null) => {
        if (!fin) return null;
        const days = differenceInDays(parseISO(fin), new Date());
        if (days < 0) return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-700">Vencido</span>;
        if (days <= 30) return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">Vence pronto</span>;
        return null;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <p className="text-xs uppercase text-slate-500">Talento · Legal</p>
                    <h1 className="text-2xl font-bold text-slate-900">Contratos y vencimientos</h1>
                    <p className="text-slate-600">Monitor de riesgos y documentación laboral.</p>
                </div>
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
                    <Filter className="w-4 h-4 text-slate-500" />
                    {(['todos', 'por_vencer', 'vencidos', 'activos'] as FilterOption[]).map((opt) => (
                        <button
                            key={opt}
                            onClick={() => setFilter(opt)}
                            className={`text-sm font-semibold px-2 py-1 rounded ${filter === opt ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600'}`}
                        >
                            {opt === 'todos' && 'Todos'}
                            {opt === 'por_vencer' && 'Por vencer'}
                            {opt === 'vencidos' && 'Vencidos'}
                            {opt === 'activos' && 'Activos'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
                        <FileText className="w-4 h-4" /> Vista global de contratos
                    </div>
                    <p className="text-xs text-slate-500">{filtered.length} registros</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 text-slate-600">
                            <tr>
                                <th className="px-4 py-3 text-left">Empleado</th>
                                <th className="px-4 py-3 text-left">Tipo</th>
                                <th className="px-4 py-3 text-left">Inicio</th>
                                <th className="px-4 py-3 text-left">Fin</th>
                                <th className="px-4 py-3 text-left">Salario</th>
                                <th className="px-4 py-3 text-left">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map((row) => {
                                const fin = row.fin ? format(parseISO(row.fin), 'dd MMM yyyy', { locale: es }) : 'Indefinido';
                                const inicio = format(parseISO(row.inicio), 'dd MMM yyyy', { locale: es });
                                const isExpired = row.fin ? differenceInDays(parseISO(row.fin), new Date()) < 0 : false;
                                return (
                                    <tr key={row.id} className={row.fin && differenceInDays(parseISO(row.fin), new Date()) <= 30 ? 'bg-amber-50/60' : ''}>
                                        <td className="px-4 py-3 font-semibold text-slate-900">{row.empleado}</td>
                                        <td className="px-4 py-3 capitalize">{row.tipo}</td>
                                        <td className="px-4 py-3">{inicio}</td>
                                        <td className="px-4 py-3 flex items-center gap-2">{fin} {badge(row.fin)}</td>
                                        <td className="px-4 py-3">${row.salario.toLocaleString('es-CL')}</td>
                                        <td className="px-4 py-3">
                                            {row.estado === 'activo' && !isExpired ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                                                    <CheckCircle2 className="w-4 h-4" /> Activo
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                                                    <XCircle className="w-4 h-4" /> Inactivo
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                                        <AlertTriangle className="w-5 h-5 inline mr-2 text-amber-500" />
                                        No hay contratos para el filtro seleccionado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
