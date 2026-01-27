import { useEffect, useState } from 'react';
import hrService, { type SolicitudAusencia } from '../../../services/hrService';
import { AlertCircle, CheckCircle, Clock, X } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

export default function LeavesPage() {
    const [leaves, setLeaves] = useState<SolicitudAusencia[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        void loadLeaves();
    }, []);

    const loadLeaves = async () => {
        try {
            setLoading(true);
            const data = await hrService.getLeaves();
            setLeaves(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError('Error al cargar las solicitudes.');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: number, action: 'approve' | 'reject') => {
        // TODO: conectar con endpoint real de aprobación/rechazo
        alert(`${action === 'approve' ? 'Aprobado' : 'Rechazado'} solicitud ${id}`);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'aprobado':
                return (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex items-center w-fit gap-1">
                        <CheckCircle size={12} /> Aprobado
                    </span>
                );
            case 'rechazado':
                return (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 flex items-center w-fit gap-1">
                        <X size={12} /> Rechazado
                    </span>
                );
            default:
                return (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 flex items-center w-fit gap-1">
                        <Clock size={12} /> Pendiente
                    </span>
                );
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Bandeja de permisos</h1>
                    <p className="text-gray-500">Supervisa y aprueba solicitudes. Sin creación desde RRHH.</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-center gap-2 animate-fade-in">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleado</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fechas</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duración</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Cargando solicitudes...</td>
                                </tr>
                            ) : leaves.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No hay solicitudes registradas.</td>
                                </tr>
                            ) : (
                                leaves.map((leave) => (
                                    <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{leave.empleado_nombre ?? 'Empleado'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {leave.tipo_ausencia_nombre || String(leave.tipo_ausencia)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 flex flex-col">
                                                <span className="font-medium">{format(new Date(leave.fecha_inicio), 'dd MMM yyyy', { locale: es })}</span>
                                                <span className="text-gray-500 text-xs">hasta {format(new Date(leave.fecha_fin), 'dd MMM yyyy', { locale: es })}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {differenceInDays(new Date(leave.fecha_fin), new Date(leave.fecha_inicio)) + 1} días
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(String(leave.estado || 'pendiente'))}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap space-x-2 text-sm">
                                            <button
                                                onClick={() => handleAction(leave.id!, 'approve')}
                                                className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 font-semibold hover:bg-emerald-100"
                                            >
                                                Aprobar
                                            </button>
                                            <button
                                                onClick={() => handleAction(leave.id!, 'reject')}
                                                className="px-3 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-100 font-semibold hover:bg-rose-100"
                                            >
                                                Rechazar
                                            </button>
                                        </td>
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
