import { useEffect, useMemo, useState, type ReactNode } from 'react';
import hrService, { type KPIResponse } from '../../../core/services/hrService';
import attendanceService, { type AttendanceRecordNew } from '../../../core/services/attendanceService';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    Cell,
    AreaChart,
    Area,
    PieChart,
    Pie,
} from 'recharts';
import { Users, UserCheck, Calendar, AlertCircle, Clock, MapPin } from 'lucide-react';

type RangeOption = '7d' | '30d' | 'custom';

type AttendanceSummary = {
    total: number;
    tardy: number;
    ontime: number;
    byDay: { date: string; total: number; tardy: number }[];
};

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function DashboardPage() {
    const [kpi, setKpi] = useState<KPIResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [range, setRange] = useState<RangeOption>('7d');
    const [startDate, setStartDate] = useState<string>(todayIso());
    const [endDate, setEndDate] = useState<string>(todayIso());
    const [branchFilter, setBranchFilter] = useState<string>('');

    const [records, setRecords] = useState<AttendanceRecordNew[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const kpiData = await hrService.getDashboardKPIs();
                setKpi(kpiData);
            } catch (err) {
                setError('No se pudieron cargar los datos del dashboard.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    useEffect(() => {
        const today = todayIso();
        if (range === '7d') {
            const start = new Date();
            start.setDate(start.getDate() - 6);
            setStartDate(start.toISOString().slice(0, 10));
            setEndDate(today);
        } else if (range === '30d') {
            const start = new Date();
            start.setDate(start.getDate() - 29);
            setStartDate(start.toISOString().slice(0, 10));
            setEndDate(today);
        }
    }, [range]);

    useEffect(() => {
        const loadAttendance = async () => {
            try {
                const params: Record<string, string> = {};
                if (startDate) params.start_date = startDate;
                if (endDate) params.end_date = endDate;
                if (branchFilter) params.sucursal = branchFilter;
                const data = await attendanceService.listRecords(params);
                setRecords(data);
            } catch (err) {
                console.error('Error al cargar asistencia', err);
            }
        };
        loadAttendance();
    }, [startDate, endDate, branchFilter]);

    const attendanceSummary: AttendanceSummary = useMemo(() => {
        if (!records.length) return { total: 0, tardy: 0, ontime: 0, byDay: [] };
        const dailyMap = new Map<string, { total: number; tardy: number }>();
        let tardy = 0;
        records.forEach((r) => {
            const day = r.timestamp.slice(0, 10);
            const entry = dailyMap.get(day) || { total: 0, tardy: 0 };
            entry.total += 1;
            if (r.is_late) {
                entry.tardy += 1;
                tardy += 1;
            }
            dailyMap.set(day, entry);
        });

        const byDay = Array.from(dailyMap.entries())
            .map(([date, val]) => ({ date, total: val.total, tardy: val.tardy }))
            .sort((a, b) => a.date.localeCompare(b.date));

        return {
            total: records.length,
            tardy,
            ontime: records.length - tardy,
            byDay,
        };
    }, [records]);

    const branchOptions = useMemo(() => {
        const opts = new Map<string, string>();
        records.forEach((r) => {
            if (r.sucursal_id && r.sucursal_nombre) {
                opts.set(String(r.sucursal_id), r.sucursal_nombre);
            }
        });
        if (kpi?.headcount_by_branch) {
            kpi.headcount_by_branch.forEach((b: any) => opts.set(String(b.id || b.branch || b.sucursal_id || b.sucursal), b.branch || b.sucursal || b.name || b.nombre || 'Sucursal'));
        }
        return Array.from(opts.entries()).map(([id, label]) => ({ id, label }));
    }, [records, kpi]);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center p-8">
                <div className="flex flex-col items-center space-y-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                    <p className="text-gray-500 font-medium">Cargando métricas...</p>
                </div>
            </div>
        );
    }

    if (error || !kpi) {
        return (
            <div className="flex h-full items-center justify-center p-8">
                <div className="text-center space-y-4 max-w-md mx-auto p-6 bg-red-50 rounded-xl border border-red-100">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                    <h3 className="text-lg font-medium text-red-800">Error de conexión</h3>
                    <p className="text-red-600">{error || 'No hay datos disponibles'}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex flex-wrap justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard HR</h1>
                    <p className="text-gray-500 mt-1">Métricas clave con filtros dinámicos</p>
                </div>
                <div className="flex flex-wrap gap-3 items-center text-sm">
                    <select
                        value={range}
                        onChange={(e) => setRange(e.target.value as RangeOption)}
                        className="border border-slate-200 rounded-lg px-3 py-2 bg-white shadow-sm"
                    >
                        <option value="7d">Últimos 7 días</option>
                        <option value="30d">Últimos 30 días</option>
                        <option value="custom">Rango personalizado</option>
                    </select>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border border-slate-200 rounded-lg px-2 py-2 bg-white shadow-sm"
                        disabled={range !== 'custom'}
                    />
                    <input
                        type="date"
                        value={endDate}
                        min={startDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border border-slate-200 rounded-lg px-2 py-2 bg-white shadow-sm"
                        disabled={range !== 'custom'}
                    />
                    <select
                        value={branchFilter}
                        onChange={(e) => setBranchFilter(e.target.value)}
                        className="border border-slate-200 rounded-lg px-3 py-2 bg-white shadow-sm"
                    >
                        <option value="">Todas las sucursales</option>
                        {branchOptions.map((b) => (
                            <option key={b.id} value={b.id}>{b.label}</option>
                        ))}
                    </select>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Total Empleados"
                    value={kpi.headcount_by_department.reduce((acc, curr) => acc + curr.count, 0)}
                    icon={<Users className="h-6 w-6" />}
                    trend={kpi.employees_by_status?.find((s: any) => s.status === 'activo')?.count || undefined}
                    trendUp={true}
                    color="blue"
                />
                <KPICard
                    title="Tasa de Retención"
                    value={`${kpi.retention_rate}%`}
                    icon={<UserCheck className="h-6 w-6" />}
                    trend="Periodo seleccionado"
                    trendUp={true}
                    color="green"
                />
                <KPICard
                    title="Solicitudes Pendientes"
                    value={kpi.pending_leaves_count}
                    icon={<Calendar className="h-6 w-6" />}
                    trend="Revisar permisos"
                    trendUp={kpi.pending_leaves_count === 0}
                    color="yellow"
                />
                <KPICard
                    title="Asistencia (puntual)"
                    value={`${attendanceSummary.total ? Math.round((attendanceSummary.ontime / attendanceSummary.total) * 100) : 0}%`}
                    icon={<Clock className="h-6 w-6" />}
                    trend={`${attendanceSummary.total} marcas`}
                    trendUp={attendanceSummary.tardy === 0}
                    color="purple"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">Marcas de asistencia</h2>
                            <p className="text-sm text-gray-500">Distribución diaria: total vs tardanzas</p>
                        </div>
                    </div>
                    <div className="h-80" style={{ minWidth: 0, minHeight: 0 }}>
                        {attendanceSummary.byDay.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <AreaChart data={attendanceSummary.byDay} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.35} />
                                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorTardy" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.35} />
                                            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                    <Area type="monotone" dataKey="total" stroke="#4F46E5" fill="url(#colorTotal)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="tardy" stroke="#F59E0B" fill="url(#colorTardy)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-gray-400 text-sm">Sin marcas en el rango</div>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">Headcount por sucursal</h2>
                    </div>
                    <div className="h-80" style={{ minWidth: 0, minHeight: 0 }}>
                        {Array.isArray(kpi.headcount_by_branch) && kpi.headcount_by_branch.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <BarChart data={kpi.headcount_by_branch} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="branch" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                    <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                    <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                                        {kpi.headcount_by_branch.map((_: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={['#4F46E5', '#8B5CF6', '#EC4899', '#10B981'][index % 4]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-gray-400 text-sm">Sin datos para graficar</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">Puntualidad</h2>
                            <p className="text-sm text-gray-500">Ontime vs tardanza</p>
                        </div>
                    </div>
                    <div className="h-64" style={{ minWidth: 0, minHeight: 0 }}>
                        {attendanceSummary.total > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'A tiempo', value: attendanceSummary.ontime },
                                            { name: 'Tarde', value: attendanceSummary.tardy },
                                        ]}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={70}
                                        paddingAngle={4}
                                        cornerRadius={6}
                                    >
                                        <Cell fill="#10B981" />
                                        <Cell fill="#F59E0B" />
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-gray-400 text-sm">Sin marcas en el rango</div>
                        )}
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                            <p className="text-emerald-700 font-semibold">A tiempo</p>
                            <p className="text-2xl font-bold text-emerald-800">{attendanceSummary.ontime}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                            <p className="text-amber-700 font-semibold">Tarde</p>
                            <p className="text-2xl font-bold text-amber-800">{attendanceSummary.tardy}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">Alertas rápidas</h2>
                            <p className="text-sm text-gray-500">Permisos pendientes, contratos y geoubicación</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <QuickBadge label="Permisos pendientes" value={kpi.pending_leaves_count} color="bg-amber-50 text-amber-800" icon={<Calendar className="w-4 h-4" />} />
                        <QuickBadge label="Sucursales activas" value={branchOptions.length || kpi.headcount_by_branch?.length || 0} color="bg-blue-50 text-blue-800" icon={<MapPin className="w-4 h-4" />} />
                        <QuickBadge label="Marcas en rango" value={attendanceSummary.total} color="bg-emerald-50 text-emerald-800" icon={<Clock className="w-4 h-4" />} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function KPICard({ title, value, icon, trend, trendUp, color }: any) {
    const colorClasses: any = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        yellow: 'bg-yellow-50 text-yellow-600',
        purple: 'bg-purple-50 text-purple-600',
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
                    {icon}
                </div>
                {trend && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <p className="text-gray-500 text-sm font-medium">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
            </div>
        </div>
    );
}

function QuickBadge({ label, value, color, icon }: { label: string; value: number | string; color: string; icon: ReactNode }) {
    return (
        <div className={`flex items-center gap-3 p-3 rounded-xl border border-gray-100 ${color}`}>
            <div className="h-9 w-9 rounded-lg bg-white/70 flex items-center justify-center shadow-sm border border-white">
                {icon}
            </div>
            <div>
                <p className="text-xs font-semibold text-gray-500">{label}</p>
                <p className="text-lg font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
}
