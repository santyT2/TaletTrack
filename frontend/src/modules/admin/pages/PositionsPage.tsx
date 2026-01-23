import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import api from '../../../services/api';

interface Position {
    id: number;
    nombre: string;
    descripcion: string;
    nivel_requerido?: string;
    salario_base: string;
}

export default function PositionsPage() {
    const [positions, setPositions] = useState<Position[]>([]);
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
    });

    useEffect(() => {
        loadPositions();
    }, []);

    const loadPositions = async () => {
        try {
            setLoading(true);
            const response = await api.get('/cargos/');
            const raw = Array.isArray(response.data?.results)
                ? response.data.results
                : Array.isArray(response.data)
                ? response.data
                : [];
            if (!Array.isArray(response.data?.results) && !Array.isArray(response.data)) {
                setError('Respuesta inesperada al listar cargos');
            } else {
                setError(null);
            }
            setPositions(raw);
        } catch (err) {
            console.error(err);
            setError('Error al cargar cargos');
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
            const payload = {
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                nivel_requerido: formData.nivel_requerido,
                salario_base: formData.salario_base,
            };
            if (editingId) {
                await api.patch(`/cargos/${editingId}/`, payload);
                setSuccessMsg('Cargo actualizado correctamente');
            } else {
                await api.post('/cargos/', payload);
                setSuccessMsg('Cargo creado correctamente');
            }
            
            setIsModalOpen(false);
            setEditingId(null);
            setFormData({ nombre: '', descripcion: '', nivel_requerido: 'junior', salario_base: '0' });
            loadPositions();
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error al guardar cargo');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Estás seguro de eliminar este cargo?')) return;

        try {
            await api.delete(`/cargos/${id}/`);
            setSuccessMsg('Cargo eliminado correctamente');
            loadPositions();
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err) {
            setError('Error al eliminar cargo');
        }
    };

    const handleEdit = (position: Position) => {
        setFormData({
            nombre: position.nombre,
            descripcion: position.descripcion,
            nivel_requerido: position.nivel_requerido || 'junior',
            salario_base: position.salario_base?.toString() || '0',
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
                    <h1 className="text-3xl font-bold text-gray-900">Gestión de Cargos</h1>
                    <p className="text-gray-600 mt-1">Total: {positions.length} cargos</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ nombre: '', descripcion: '', nivel: 'junior' });
                        setIsModalOpen(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-colors"
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
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPositions.length > 0 ? (
                        filteredPositions.map((position) => (
                            <div
                                key={position.id}
                                className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500 hover:shadow-lg transition-shadow"
                            >
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{position.nombre}</h3>
                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{position.descripcion}</p>
                                {position.nivel_requerido && (
                                    <div className="mb-3">
                                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                            {position.nivel_requerido}
                                        </span>
                                    </div>
                                )}
                                <div className="flex gap-2 justify-end">
                                    <button
                                        onClick={() => handleEdit(position)}
                                        className="text-blue-600 hover:text-blue-900 transition-colors p-2 hover:bg-blue-50 rounded"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <textarea
                                placeholder="Descripción"
                                value={formData.descripcion}
                                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                                rows={3}
                            />
                            <input
                                type="number"
                                placeholder="Salario base *"
                                value={formData.salario_base}
                                onChange={(e) => setFormData({ ...formData, salario_base: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                min="0"
                                step="0.01"
                                required
                            />
                            <select
                                value={formData.nivel_requerido}
                                onChange={(e) => setFormData({ ...formData, nivel_requerido: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="junior">Junior</option>
                                <option value="semior">Semi-Senior</option>
                                <option value="senior">Senior</option>
                                <option value="lider">Líder</option>
                            </select>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
