import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, FileText, Filter, Loader2, XCircle } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import hrService, { type ContractItem } from '../../../core/services/hrService';

type FilterOption = 'todos' | 'vencidos' | 'por_vencer' | 'activos';

export default function ContractsPage() {
    const [filter, setFilter] = useState<FilterOption>('todos');
    const [contracts, setContracts] = useState<ContractItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        void loadContracts();
    }, []);

    const loadContracts = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await hrService.listContracts();
            setContracts(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError('No se pudieron cargar los contratos.');
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() => {
        const today = new Date();
        return contracts.filter((row) => {
            const endDate = row.end_date ? parseISO(String(row.end_date)) : null;
            if (filter === 'activos') return row.is_active;
            if (filter === 'vencidos') return endDate !== null && differenceInDays(endDate, today) < 0;
            if (filter === 'por_vencer') return endDate !== null && differenceInDays(endDate, today) >= 0 && differenceInDays(endDate, today) <= 30;
            return true;
        });
    }, [contracts, filter]);

    const badge = (endDate: string | null) => {
        if (!endDate) return null;
        const days = differenceInDays(parseISO(endDate), new Date());
        if (days < 0) return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-700">Vencido</span>;
        if (days <= 30) return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-700">Vence en {days} días</span>;
        return null;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <p className="text-xs uppercase text-slate-500">Talento · Legal</p>
                    <h1 className="text-2xl font-bold text-slate-900">Contratos y vencimientos</h1>
                    <p className="text-slate-600">Monitor en tiempo real con datos de la base.</p>
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
                    <div className="text-xs text-slate-500 flex items-center gap-3">
                        <span className="hidden sm:inline">{filtered.length} registros</span>
                        <button onClick={() => void loadContracts()} className="text-indigo-600 hover:text-indigo-800 font-semibold">Refrescar</button>
                    </div>
                </div>
                {error && (
                    <div className="px-4 py-2 text-sm text-rose-700 bg-rose-50 border-b border-rose-100 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> {error}
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 text-slate-600">
                            <tr>
                                <th className="px-4 py-3 text-left">Empleado</th>
                                <th className="px-4 py-3 text-left">Puesto</th>
                                <th className="px-4 py-3 text-left">Tipo</th>
                                <th className="px-4 py-3 text-left">Inicio</th>
                                <th className="px-4 py-3 text-left">Fin</th>
                                <th className="px-4 py-3 text-left">Salario</th>
                                <th className="px-4 py-3 text-left">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                                        <Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Cargando contratos...
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                                        <AlertTriangle className="w-5 h-5 inline mr-2 text-amber-500" />
                                        No hay contratos para el filtro seleccionado.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((row) => {
                                    const endDate = row.end_date ? parseISO(String(row.end_date)) : null;
                                    const startDate = format(parseISO(String(row.start_date)), 'dd MMM yyyy', { locale: es });
                                    const endDateLabel = endDate ? format(endDate, 'dd MMM yyyy', { locale: es }) : 'Indefinido';
                                    const isExpired = endDate ? differenceInDays(endDate, new Date()) < 0 : false;
                                    const isExpiringSoon = endDate ? differenceInDays(endDate, new Date()) <= 30 && differenceInDays(endDate, new Date()) >= 0 : false;
                                    const salary = Number(row.salary) || 0;

                                    return (
                                        <tr key={row.id} className={isExpiringSoon ? 'bg-rose-50/80' : ''}>
                                            <td className="px-4 py-3 font-semibold text-slate-900">{row.employee_name}</td>
                                            <td className="px-4 py-3 text-slate-700">{row.position_name || 'Sin puesto'}</td>
                                            <td className="px-4 py-3 capitalize">{row.contract_type.replace('_', ' ').toLowerCase()}</td>
                                            <td className="px-4 py-3">{startDate}</td>
                                            <td className="px-4 py-3 flex items-center gap-2">{endDateLabel} {badge(row.end_date)}</td>
                                            <td className="px-4 py-3">${salary.toLocaleString('es-CL', { minimumFractionDigits: 2 })}</td>
                                            <td className="px-4 py-3">
                                                {!isExpired && row.is_active ? (
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
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
