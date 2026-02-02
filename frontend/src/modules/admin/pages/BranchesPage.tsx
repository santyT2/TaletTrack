import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, MapPin, Phone, Users } from 'lucide-react';
import { branchService, employeeService } from '../../../core/services/adminService';
import type { BranchData, BranchCreateData, Employee } from '../../../core/services/adminService';

export default function BranchesPage() {
    const [branches, setBranches] = useState<BranchData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const [managerOptions, setManagerOptions] = useState<{ id: number; nombre: string }[]>([]);

    const [formData, setFormData] = useState<BranchCreateData>({
        nombre: '',
        direccion: '',
        direccion_exacta: '',
        telefono: '',
        telefono_fijo: '',
        ciudad: '',
        empresa: 1,
        tipo: 'sede',
        capacidad_maxima: '',
        gerente_encargado: null,
    });

    useEffect(() => {
        loadBranches();
        loadManagers();
    }, []);

    const loadManagers = async () => {
        try {
            const response = await employeeService.getEmployees();
            const employees: Employee[] = Array.isArray(response)
                ? response
                : response?.results || [];
            const mapped = employees.map((e) => ({ id: e.id, nombre: `${e.nombres || ''} ${e.apellidos || ''}`.trim() }));
            setManagerOptions(mapped);
        } catch (err) {
            console.error(err);
        }
    };

    const loadBranches = async () => {
        try {
            setLoading(true);
            const data = await branchService.getBranches();
            setError(null);
            setBranches(Array.isArray(data) ? data : data?.results || []);
        } catch (err: any) {
            console.error(err);
            setError(err?.response?.data?.detail || 'Error al cargar sucursales');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.nombre) {
            setError('El nombre de la sucursal es obligatorio');
            return;
        }

        try {
            const payload = { ...formData };
            if (editingId) {
                await branchService.updateBranch(editingId, payload);
                setSuccessMsg('Sucursal actualizada correctamente');
            } else {
                await branchService.createBranch(payload);
                setSuccessMsg('Sucursal creada correctamente');
            }
            
            setIsModalOpen(false);
            setEditingId(null);
            setFormData({ nombre: '', direccion: '', direccion_exacta: '', telefono: '', telefono_fijo: '', ciudad: '', empresa: 1, tipo: 'sede', capacidad_maxima: '', gerente_encargado: null });
            loadBranches();
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error al guardar sucursal');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Estás seguro de eliminar esta sucursal?')) return;

        try {
            await branchService.deleteBranch(id);
            setSuccessMsg('Sucursal eliminada correctamente');
            loadBranches();
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err: any) {
            setError(err?.response?.data?.detail || 'Error al eliminar sucursal');
        }
    };

    const handleEdit = (branch: BranchData) => {
        setFormData({
            nombre: branch.nombre,
            direccion: branch.direccion,
            direccion_exacta: branch.direccion_exacta || '',
            telefono: branch.telefono,
            telefono_fijo: branch.telefono_fijo || '',
            ciudad: branch.ciudad || '',
            empresa: branch.empresa || 1,
            tipo: branch.tipo || 'sede',
            capacidad_maxima: branch.capacidad_maxima ?? '',
            gerente_encargado: branch.gerente_encargado ?? null,
        });
        setEditingId(branch.id);
        setIsModalOpen(true);
    };

    const filteredBranches = branches.filter(branch =>
        branch.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.ciudad?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Gestión de Sucursales</h1>
                    <p className="text-slate-600 mt-1">Total: {branches.length} sucursales</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ nombre: '', direccion: '', direccion_exacta: '', telefono: '', telefono_fijo: '', ciudad: '', empresa: 1, tipo: 'sede', capacidad_maxima: '', gerente_encargado: null });
                        setIsModalOpen(true);
                    }}
                    className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Nueva Sucursal
                </button>
            </div>

            {/* Messages */}
            {error && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}
            {successMsg && (
                <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    {successMsg}
                </div>
            )}

            {/* Search */}
            <div className="mb-6 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar por nombre o ciudad..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredBranches.length > 0 ? (
                        filteredBranches.map((branch) => (
                            <div
                                key={branch.id}
                                className="bg-white rounded-lg shadow-md p-5 border-l-4 border-brand-600/70 hover:shadow-lg transition-shadow"
                            >
                                <h3 className="text-lg font-semibold text-slate-900 mb-3">{branch.nombre}</h3>
                                
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-start gap-2 text-slate-700">
                                        <MapPin className="w-4 h-4 mt-0.5 text-brand-600 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm">{branch.direccion}</p>
                                            {branch.ciudad && (
                                                <p className="text-xs text-slate-500">{branch.ciudad}</p>
                                            )}
                                        </div>
                                    </div>
                                    {branch.telefono && (
                                        <div className="flex items-center gap-2 text-slate-700">
                                            <Phone className="w-4 h-4 text-brand-600" />
                                            <a href={`tel:${branch.telefono}`} className="text-sm hover:underline">
                                                {branch.telefono}
                                            </a>
                                        </div>
                                    )}
                                    {branch.gerente_encargado && (
                                        <div className="flex items-center gap-2 text-slate-700">
                                            <Users className="w-4 h-4 text-brand-600" />
                                            <span className="text-sm">Gerente asignado</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2 justify-end border-t pt-3">
                                    <button
                                        onClick={() => handleEdit(branch)}
                                        className="text-brand-700 hover:text-brand-900 transition-colors p-2 hover:bg-brand-50 rounded"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(branch.id)}
                                        className="text-red-600 hover:text-red-900 transition-colors p-2 hover:bg-red-50 rounded"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-8 text-center text-gray-500">
                            No hay sucursales que coincidan con la búsqueda
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            {editingId ? 'Editar Sucursal' : 'Nueva Sucursal'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Nombre de la Sucursal *"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Dirección"
                                value={formData.direccion}
                                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                            />
                            <input
                                type="text"
                                placeholder="Dirección exacta"
                                value={formData.direccion_exacta}
                                onChange={(e) => setFormData({ ...formData, direccion_exacta: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                            />
                            <input
                                type="text"
                                placeholder="Ciudad"
                                value={formData.ciudad}
                                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                            />
                            <input
                                type="tel"
                                placeholder="Teléfono"
                                value={formData.telefono}
                                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                            />
                            <input
                                type="tel"
                                placeholder="Teléfono fijo"
                                value={formData.telefono_fijo}
                                onChange={(e) => setFormData({ ...formData, telefono_fijo: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                            />
                            <input
                                type="number"
                                min="0"
                                placeholder="Capacidad máxima"
                                value={formData.capacidad_maxima === '' ? '' : formData.capacidad_maxima}
                                onChange={(e) => setFormData({ ...formData, capacidad_maxima: e.target.value === '' ? '' : Number(e.target.value) })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                            />
                            <select
                                value={formData.gerente_encargado ?? ''}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData({ ...formData, gerente_encargado: val ? Number(val) : null });
                                }}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                            >
                                <option value="">Gerente encargado (opcional)</option>
                                {managerOptions.map((m) => (
                                    <option key={m.id} value={m.id}>{m.nombre || `Empleado ${m.id}`}</option>
                                ))}
                            </select>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="number"
                                    placeholder="ID Empresa"
                                    value={formData.empresa}
                                    onChange={(e) => setFormData({ ...formData, empresa: Number(e.target.value) || 0 })}
                                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                                    min="1"
                                />
                                <select
                                    value={formData.tipo}
                                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                                >
                                    <option value="sede">Sede</option>
                                    <option value="area">Área</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                                >
                                    {editingId ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
