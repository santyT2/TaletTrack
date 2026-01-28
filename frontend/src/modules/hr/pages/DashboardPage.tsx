import { useEffect, useState } from 'react';
import hrService, { type KPIResponse } from '../../../core/services/hrService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import { Users, UserCheck, Calendar, ClipboardCheck, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
    const [data, setData] = useState<KPIResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const kpiData = await hrService.getDashboardKPIs();
                setData(kpiData);
            } catch (err) {
                setError('No se pudieron cargar los datos del dashboard.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

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

    if (error || !data) {
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
            <header>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard General</h1>
                <p className="text-gray-500 mt-1">Vista general de métricas clave de Recursos Humanos</p>
            </header>
            
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard 
                    title="Total Empleados" 
                    value={data.headcount_by_department.reduce((acc, curr) => acc + curr.count, 0)} 
                    icon={<Users className="h-6 w-6" />} 
                    trend="+2.5% vs mes anterior"
                    trendUp={true}
                    color="blue"
                />
                <KPICard 
                    title="Tasa de Retención" 
                    value={`${data.retention_rate}%`} 
                    icon={<UserCheck className="h-6 w-6" />} 
                    trend="-0.4% vs mes anterior"
                    trendUp={false}
                    color="green"
                />
                <KPICard 
                    title="Solicitudes Pendientes" 
                    value={data.pending_leaves_count} 
                    icon={<Calendar className="h-6 w-6" />} 
                    trend="Requiere atención"
                    trendUp={data.pending_leaves_count === 0}
                    color="yellow"
                />
                <KPICard 
                    title="Progreso Onboarding" 
                    value={`${data.onboarding_progress}%`} 
                    icon={<ClipboardCheck className="h-6 w-6" />} 
                    trend="En tiempo"
                    trendUp={true}
                    color="purple"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-800">Distribución por Sucursal</h2>
                    </div>
                    <div className="h-80" style={{ minWidth: 0, minHeight: 0 }}>
                        {Array.isArray(data.headcount_by_branch) && data.headcount_by_branch.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <BarChart data={data.headcount_by_branch} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis 
                                        dataKey="branch" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#6b7280', fontSize: 12 }} 
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#6b7280', fontSize: 12 }} 
                                    />
                                    <Tooltip 
                                        cursor={{ fill: '#f9fafb' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                                        {data.headcount_by_branch.map((_, index) => (
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

                {/* Quick Actions / Mini List */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Accesos Rápidos</h2>
                    <div className="space-y-3">
                        <QuickAction 
                            label="Aprobar Solicitudes" 
                            count={data.pending_leaves_count} 
                            color="bg-yellow-50 text-yellow-700" 
                        />
                        <QuickAction 
                            label="Revisar Contratos por Vencer" 
                            count={2} 
                            color="bg-red-50 text-red-700" 
                        />
                        <QuickAction 
                            label="Tareas de Onboarding" 
                            count={5} 
                            color="bg-blue-50 text-blue-700" 
                        />
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Próximos Cumpleaños</h3>
                        <div className="space-y-4">
                            {/* Mock Data for birthdays */}
                            <div className="flex items-center space-x-3">
                                <div className="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 text-xs font-bold">AL</div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Ana López</p>
                                    <p className="text-xs text-gray-500">Mañana</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs font-bold">CR</div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Carlos Ruiz</p>
                                    <p className="text-xs text-gray-500">25 Ene</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Sub-components for cleaner code

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

function QuickAction({ label, count, color }: any) {
    return (
        <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200 group">
            <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">{label}</span>
            {count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${color}`}>
                    {count}
                </span>
            )}
        </button>
    );
}
