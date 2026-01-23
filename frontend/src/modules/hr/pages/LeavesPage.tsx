import { useState, useEffect } from 'react';
import hrService, { type SolicitudAusencia, type TipoAusenciaItem, type EmpleadoLite } from '../../../services/hrService';
import { Plus, X, AlertCircle, CheckCircle, Clock, FileText, Calendar } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

export default function LeavesPage() {
    const [leaves, setLeaves] = useState<SolicitudAusencia[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const [formData, setFormData] = useState<Partial<SolicitudAusencia>>({
        tipo_ausencia: '',
        fecha_inicio: '',
        fecha_fin: '',
        motivo: '',
        empleado: '',
    });

    const [tiposAusencia, setTiposAusencia] = useState<TipoAusenciaItem[]>([]);
    const [empleados, setEmpleados] = useState<EmpleadoLite[]>([]);

    useEffect(() => {
        loadLeaves();
        loadTipos();
        loadEmpleados();
    }, []);

    const loadTipos = async () => {
        try {
            const tipos = await hrService.getLeaveTypes();
            setTiposAusencia(tipos);
            if (!formData.tipo_ausencia && tipos.length > 0) {
                setFormData((prev) => ({ ...prev, tipo_ausencia: tipos[0].id }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const loadEmpleados = async () => {
        try {
            const empleadosList = await hrService.getEmployeesLite();
            setEmpleados(empleadosList);
            if (!formData.empleado && empleadosList.length > 0) {
                setFormData((prev) => ({ ...prev, empleado: empleadosList[0].id }));
            }
        } catch (err) {
            console.error(err);
        }
    };

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);

        if (!formData.fecha_inicio || !formData.fecha_fin || !formData.motivo || !formData.tipo_ausencia || !formData.empleado) {
            setError('Por favor completa todos los campos obligatorios.');
            return;
        }

        try {
            const payload: SolicitudAusencia = {
                empleado: Number(formData.empleado),
                tipo_ausencia: Number(formData.tipo_ausencia),
                fecha_inicio: formData.fecha_inicio,
                fecha_fin: formData.fecha_fin,
                motivo: formData.motivo || '',
            };
            await hrService.createLeave(payload);
            setSuccessMsg('Solicitud creada exitosamente.');
            setIsModalOpen(false);
            setFormData({ ...formData, fecha_inicio: '', fecha_fin: '', motivo: '' });
            loadLeaves(); // Refresh table
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err) {
            console.error(err);
            setError('Error al crear la solicitud. Verifica los datos e intenta nuevamente.');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'aprobado':
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex items-center w-fit gap-1"><CheckCircle size={12}/> Aprobado</span>;
            case 'rechazado':
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 flex items-center w-fit gap-1"><X size={12}/> Rechazado</span>;
            default:
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 flex items-center w-fit gap-1"><Clock size={12}/> Pendiente</span>;
        }
    };

    const getLeaveTypeLabel = (type: string) => {
        const types:Record<string, string> = {
            'vacaciones': 'Vacaciones',
            'medica': 'Licencia Médica',
            'personal': 'Permiso Personal',
            'luto': 'Luto'
        };
        return types[type] || type;
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Solicitudes y Permisos</h1>
                    <p className="text-gray-500">Gestiona tus vacaciones y licencias.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    Nueva Solicitud
                </button>
            </div>

            {/* Alerts */}
            {successMsg && (
                <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200 flex items-center gap-2 animate-fade-in">
                    <CheckCircle size={20} />
                    {successMsg}
                </div>
            )}
            {error && !isModalOpen && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-center gap-2 animate-fade-in">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fechas</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duración</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">Cargando solicitudes...</td>
                                </tr>
                            ) : leaves.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No hay solicitudes registradas.</td>
                                </tr>
                            ) : (
                                leaves.map((leave) => (
                                    <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                    <FileText size={16} />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{leave.tipo_ausencia_nombre || getLeaveTypeLabel(String(leave.tipo_ausencia))}</div>
                                                </div>
                                            </div>
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
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 max-w-xs truncate" title={leave.motivo}>
                                                {leave.motivo}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(leave.estado || 'pendiente')}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-900">Nueva Solicitud</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && (
                                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Solicitud</label>
                                <select 
                                    className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    value={formData.tipo_ausencia as any}
                                    onChange={(e) => setFormData({...formData, tipo_ausencia: Number(e.target.value) })}
                                >
                                    {tiposAusencia.map((tipo) => (
                                        <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Empleado</label>
                                <select
                                    className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    value={formData.empleado as any}
                                    onChange={(e) => setFormData({ ...formData, empleado: Number(e.target.value) })}
                                >
                                    {empleados.map((emp) => (
                                        <option key={emp.id} value={emp.id}>{emp.nombre_completo || `Empleado ${emp.id}`}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Calendar size={16} className="text-gray-400" />
                                        </div>
                                        <input 
                                            type="date" 
                                            className="w-full pl-10 rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                            value={formData.fecha_inicio}
                                            onChange={(e) => setFormData({...formData, fecha_inicio: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Calendar size={16} className="text-gray-400" />
                                        </div>
                                        <input 
                                            type="date" 
                                            className="w-full pl-10 rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                            value={formData.fecha_fin}
                                            onChange={(e) => setFormData({...formData, fecha_fin: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo / Justificación</label>
                                <textarea 
                                    className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all h-24 resize-none"
                                    placeholder="Describe brevemente el motivo..."
                                    value={formData.motivo}
                                    onChange={(e) => setFormData({...formData, motivo: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                                >
                                    Enviar Solicitud
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
