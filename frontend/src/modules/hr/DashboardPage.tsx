import { useEffect, useState } from 'react';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Users, UserCheck, Calendar, ClipboardCheck } from 'lucide-react';

interface KPIData {
    headcount_by_department: { sucursal__nombre: string; count: number }[];
    retention_rate: number;
    pending_leaves_count: number;
    onboarding_progress: number;
}

export default function DashboardPage() {
    const [data, setData] = useState<KPIData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/dashboard/kpi/')
            .then(res => setData(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando métricas...</div>;
    if (!data) return <div className="p-8 text-center text-red-500">Error al cargar datos.</div>;

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard de RRHH</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card title="Total Empleados" value={data.headcount_by_department.reduce((acc, curr) => acc + curr.count, 0)} icon={<Users />} color="bg-blue-100 text-blue-600" />
                <Card title="Retención" value={`${data.retention_rate}%`} icon={<UserCheck />} color="bg-green-100 text-green-600" />
                <Card title="Solicitudes Pendientes" value={data.pending_leaves_count} icon={<Calendar />} color="bg-yellow-100 text-yellow-600" />
                <Card title="Progreso Onboarding" value={`${data.onboarding_progress}%`} icon={<ClipboardCheck />} color="bg-purple-100 text-purple-600" />
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Empleados por Sucursal</h2>
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
        </div>
    );
}

function Card({ title, value, icon, color }: any) {
    return (
        <div className="bg-white p-6 rounded-lg shadow flex items-center space-x-4">
            <div className={`p-3 rounded-full ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-gray-500 text-sm">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
        </div>
    );
}
