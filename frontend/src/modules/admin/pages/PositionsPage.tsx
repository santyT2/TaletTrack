import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, ListChecks } from 'lucide-react';
import { positionService } from '../../../core/services/adminService';
import type { PositionData, PositionCreateData, PositionUpdateData } from '../../../core/services/adminService';

export default function PositionsPage() {
    const [positions, setPositions] = useState<PositionData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        nivel_requerido: 'junior',
        salario_base: '0',
        salario_minimo: '0',
        salario_maximo: '0',
        departamento: 'RRHH',
        responsabilidades: '',
        beneficios: '',
    });

    useEffect(() => {
        loadPositions();
    }, []);

    const loadPositions = async () => {
        try {
            setLoading(true);
            const data = await positionService.getPositions();
            setError(null);
            const list = Array.isArray(data) ? data : data?.results || [];
            setPositions(list as PositionData[]);
        } catch (err: any) {
            console.error(err);
            setError(err?.response?.data?.detail || 'Error al cargar cargos');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.nombre || !formData.salario_base) {
            setError('El nombre y salario del cargo son obligatorios');
            return;
        }

        try {
            let beneficiosParsed: any = null;
            if (formData.beneficios) {
                try {
                    beneficiosParsed = JSON.parse(formData.beneficios);
                } catch (err) {
                    setError('El campo beneficios debe ser JSON válido');
                    return;
                }
            }
            const payload: PositionCreateData | PositionUpdateData = {
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                nivel: formData.nivel_requerido,
                salario_base: Number(formData.salario_base) || 0,
                // Campos opcionales se agregan abajo
            } as any;

            (payload as any).salario_minimo = formData.salario_minimo ? Number(formData.salario_minimo) : undefined;
            (payload as any).salario_maximo = formData.salario_maximo ? Number(formData.salario_maximo) : undefined;
            (payload as any).departamento = formData.departamento || undefined;
            (payload as any).responsabilidades = formData.responsabilidades || undefined;
            (payload as any).beneficios = beneficiosParsed;

            if (editingId) {
                await positionService.updatePosition(editingId, payload as PositionUpdateData);
                setSuccessMsg('Cargo actualizado correctamente');
            } else {
                await positionService.createPosition(payload as PositionCreateData);
                setSuccessMsg('Cargo creado correctamente');
            }
            
            setIsModalOpen(false);
            setEditingId(null);
            setFormData({ nombre: '', descripcion: '', nivel_requerido: 'junior', salario_base: '0', salario_minimo: '0', salario_maximo: '0', departamento: 'RRHH', responsabilidades: '', beneficios: '' });
            loadPositions();
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error al guardar cargo');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Estás seguro de eliminar este cargo?')) return;

        try {
            await positionService.deletePosition(id);
            setSuccessMsg('Cargo eliminado correctamente');
            loadPositions();
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err: any) {
            setError(err?.response?.data?.detail || 'Error al eliminar cargo');
        }
    };

    const handleEdit = (position: PositionData) => {
        let beneficiosValue = '';
        if (typeof position.beneficios === 'string') {
            beneficiosValue = position.beneficios;
        } else if (position.beneficios) {
            try {
                beneficiosValue = JSON.stringify(position.beneficios);
            } catch (err) {
                console.error('No se pudo serializar beneficios', err);
            }
        }

        setFormData({
            nombre: position.nombre,
            descripcion: position.descripcion || '',
            nivel_requerido: position.nivel || 'junior',
            salario_base: position.salario_base?.toString() || '0',
            salario_minimo: position.salario_minimo?.toString() || '0',
            salario_maximo: position.salario_maximo?.toString() || '0',
            departamento: position.departamento || 'RRHH',
            responsabilidades: position.responsabilidades || '',
            beneficios: beneficiosValue,
        });
        setEditingId(position.id);
        setIsModalOpen(true);
    };

    const filteredPositions = positions.filter(pos =>
        pos.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Gestión de Cargos</h1>
                    <p className="text-slate-600 mt-1">Total: {positions.length} cargos</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ nombre: '', descripcion: '', nivel_requerido: 'junior', salario_base: '0', salario_minimo: '0', salario_maximo: '0', departamento: 'RRHH', responsabilidades: '', beneficios: '' });
                        setIsModalOpen(true);
                    }}
                    className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Cargo
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
                    placeholder="Buscar cargos..."
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
                    {filteredPositions.length > 0 ? (
                        filteredPositions.map((position) => (
                            <div
                                key={position.id}
                                className="bg-white rounded-lg shadow-md p-4 border-l-4 border-brand-600/70 hover:shadow-lg transition-shadow"
                            >
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">{position.nombre}</h3>
                                <p className="text-slate-600 text-sm mb-3 line-clamp-2">{position.descripcion}</p>
                                {position.nivel && (
                                    <div className="mb-3">
                                        <span className="inline-block bg-brand-50 text-brand-800 text-xs px-2 py-1 rounded">
                                            {position.nivel}
                                        </span>
                                    </div>
                                )}
                                <div className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                                    <ListChecks className="w-4 h-4 text-brand-600" />
                                    {position.departamento || '—'} | Rango: {position.salario_minimo || '0'} - {position.salario_maximo || '0'}
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <button
                                        onClick={() => handleEdit(position)}
                                        className="text-brand-700 hover:text-brand-900 transition-colors p-2 hover:bg-brand-50 rounded"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(position.id)}
                                        className="text-red-600 hover:text-red-900 transition-colors p-2 hover:bg-red-50 rounded"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-8 text-center text-gray-500">
                            No hay cargos que coincidan con la búsqueda
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            {editingId ? 'Editar Cargo' : 'Nuevo Cargo'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Nombre del Cargo *"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                                required
                            />
                            <textarea
                                placeholder="Descripción"
                                value={formData.descripcion}
                                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 resize-none"
                                rows={3}
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="number"
                                    placeholder="Salario mínimo *"
                                    value={formData.salario_minimo}
                                    onChange={(e) => setFormData({ ...formData, salario_minimo: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Salario máximo *"
                                    value={formData.salario_maximo}
                                    onChange={(e) => setFormData({ ...formData, salario_maximo: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>
                            <input
                                type="number"
                                placeholder="Salario base *"
                                value={formData.salario_base}
                                onChange={(e) => setFormData({ ...formData, salario_base: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                                min="0"
                                step="0.01"
                                required
                            />
                            <select
                                value={formData.departamento}
                                onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                            >
                                <option value="Ventas">Ventas</option>
                                <option value="IT">IT</option>
                                <option value="RRHH">RRHH</option>
                                <option value="Operaciones">Operaciones</option>
                                <option value="Finanzas">Finanzas</option>
                            </select>
                            <select
                                value={formData.nivel_requerido}
                                onChange={(e) => setFormData({ ...formData, nivel_requerido: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                            >
                                <option value="junior">Junior</option>
                                <option value="semior">Semi-Senior</option>
                                <option value="senior">Senior</option>
                                <option value="lider">Líder</option>
                            </select>
                            <textarea
                                placeholder="Responsabilidades principales"
                                value={formData.responsabilidades}
                                onChange={(e) => setFormData({ ...formData, responsabilidades: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 resize-none"
                                rows={3}
                            />
                            <textarea
                                placeholder='Beneficios en JSON, ej: {"seguro": true, "gym": true}'
                                value={formData.beneficios}
                                onChange={(e) => setFormData({ ...formData, beneficios: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 font-mono text-sm"
                                rows={2}
                            />

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
