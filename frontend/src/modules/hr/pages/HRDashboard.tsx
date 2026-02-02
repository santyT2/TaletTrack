import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Users, UserCheck, Calendar, ClipboardCheck } from 'lucide-react';
import api from '../../../core/api/axiosConfig';

interface KPIData {
    headcount_by_department: { sucursal__nombre: string; count: number }[];
    retention_rate: number;
    pending_leaves_count: number;
    onboarding_progress: number;
}

export default function HRDashboard() {
    const [data, setData] = useState<KPIData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/employees/api/dashboard/kpi/')
            .then((res: any) => setData(res.data))
            .catch((err: any) => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando métricas...</div>;
    if (!data) return <div className="p-8 text-center text-red-500">Error al cargar datos.</div>;

    return (
        <div className="p-6 space-y-6">
            <div>
                <p className="text-xs uppercase text-slate-500 font-semibold">Panel de Control</p>
                <h1 className="text-3xl font-bold text-gray-800">Dashboard de RRHH</h1>
                <p className="text-slate-600 mt-2">Métricas clave de talento y gestión de personal</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card 
                    title="Total Empleados" 
                    value={data.headcount_by_department.reduce((acc, curr) => acc + curr.count, 0)} 
                    icon={<Users className="w-5 h-5" />} 
                    color="bg-blue-100 text-blue-600" 
                />
                <Card 
                    title="Retención" 
                    value={`${data.retention_rate}%`} 
                    icon={<UserCheck className="w-5 h-5" />} 
                    color="bg-green-100 text-green-600" 
                />
                <Card 
                    title="Solicitudes Pendientes" 
                    value={data.pending_leaves_count} 
                    icon={<Calendar className="w-5 h-5" />} 
                    color="bg-yellow-100 text-yellow-600" 
                />
                <Card 
                    title="Progreso Onboarding" 
                    value={`${data.onboarding_progress}%`} 
                    icon={<ClipboardCheck className="w-5 h-5" />} 
                    color="bg-purple-100 text-purple-600" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico de Empleados por Sucursal */}
                <div className="bg-white p-6 rounded-lg shadow border border-slate-200">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Empleados por Sucursal</h2>
                    <div className="h-64" style={{ minWidth: 0, minHeight: 0 }}>
                        {Array.isArray(data.headcount_by_department) && data.headcount_by_department.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <BarChart data={data.headcount_by_department}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="sucursal__nombre" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-gray-400 text-sm">Sin datos para graficar</div>
                        )}
                    </div>
                </div>

                {/* Acciones Rápidas */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800">Acciones Rápidas</h2>
                    
                    <button 
                        onClick={() => window.location.href = '/hr/employees'}
                        className="w-full text-left p-4 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-200">
                                <Users className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-gray-800">Gestionar Empleados</p>
                                <p className="text-xs text-gray-500">Ver y editar datos de personal</p>
                            </div>
                        </div>
                    </button>

                    <button 
                        onClick={() => window.location.href = '/hr/attendance'}
                        className="w-full text-left p-4 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-200">
                                <ClipboardCheck className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-gray-800">Asistencia y Marcajes</p>
                                <p className="text-xs text-gray-500">Revisar registros de asistencia</p>
                            </div>
                        </div>
                    </button>

                    <button 
                        onClick={() => window.location.href = '/hr/leaves'}
                        className="w-full text-left p-4 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600 group-hover:bg-yellow-200">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-gray-800">Permisos y Licencias</p>
                                <p className="text-xs text-gray-500">Aprobar solicitudes de tiempo</p>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}

function Card({ title, value, icon, color }: any) {
    return (
        <div className="bg-white p-6 rounded-lg shadow border border-slate-200 flex items-center space-x-4 hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-lg ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-gray-500 text-sm">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
}
