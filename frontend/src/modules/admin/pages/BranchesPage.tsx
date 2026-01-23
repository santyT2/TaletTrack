import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, MapPin, Phone } from 'lucide-react';
import api from '../../../services/api';

interface Branch {
    id: number;
    nombre: string;
    direccion: string;
    telefono: string;
    ciudad?: string;
    empresa?: number;
    tipo?: string;
}

export default function BranchesPage() {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        nombre: '',
        direccion: '',
        telefono: '',
        ciudad: '',
        empresa: '1',
        tipo: 'sede',
    });

    useEffect(() => {
        loadBranches();
    }, []);

    const loadBranches = async () => {
        try {
            setLoading(true);
            const response = await api.get('/sucursales/');
            const raw = Array.isArray(response.data?.results)
                ? response.data.results
                : Array.isArray(response.data)
                ? response.data
                : [];
            if (!Array.isArray(response.data?.results) && !Array.isArray(response.data)) {
                setError('Respuesta inesperada al listar sucursales');
            } else {
                setError(null);
            }
            setBranches(raw);
        } catch (err) {
            console.error(err);
            setError('Error al cargar sucursales');
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
                await api.patch(`/sucursales/${editingId}/`, payload);
                setSuccessMsg('Sucursal actualizada correctamente');
            } else {
                await api.post('/sucursales/', payload);
                setSuccessMsg('Sucursal creada correctamente');
            }
            
            setIsModalOpen(false);
            setEditingId(null);
            setFormData({ nombre: '', direccion: '', telefono: '', ciudad: '', empresa: '1', tipo: 'sede' });
            loadBranches();
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error al guardar sucursal');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Estás seguro de eliminar esta sucursal?')) return;

        try {
            await api.delete(`/sucursales/${id}/`);
            setSuccessMsg('Sucursal eliminada correctamente');
            loadBranches();
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err) {
            setError('Error al eliminar sucursal');
        }
    };

    const handleEdit = (branch: Branch) => {
        setFormData({
            nombre: branch.nombre,
            direccion: branch.direccion,
            telefono: branch.telefono,
            ciudad: branch.ciudad || '',
            empresa: branch.empresa?.toString() || '1',
            tipo: branch.tipo || 'sede',
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
                    <h1 className="text-3xl font-bold text-gray-900">Gestión de Sucursales</h1>
                    <p className="text-gray-600 mt-1">Total: {branches.length} sucursales</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ nombre: '', direccion: '', telefono: '', ciudad: '' });
                        setIsModalOpen(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-colors"
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
                    {filteredBranches.length > 0 ? (
                        filteredBranches.map((branch) => (
                            <div
                                key={branch.id}
                                className="bg-white rounded-lg shadow-md p-5 border-l-4 border-green-500 hover:shadow-lg transition-shadow"
                            >
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">{branch.nombre}</h3>
                                
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-start gap-2 text-gray-700">
                                        <MapPin className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm">{branch.direccion}</p>
                                            {branch.ciudad && (
                                                <p className="text-xs text-gray-500">{branch.ciudad}</p>
                                            )}
                                        </div>
                                    </div>
                                    {branch.telefono && (
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Phone className="w-4 h-4 text-green-600" />
                                            <a href={`tel:${branch.telefono}`} className="text-sm hover:underline">
                                                {branch.telefono}
                                            </a>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2 justify-end border-t pt-3">
                                    <button
                                        onClick={() => handleEdit(branch)}
                                        className="text-blue-600 hover:text-blue-900 transition-colors p-2 hover:bg-blue-50 rounded"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Dirección"
                                value={formData.direccion}
                                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="text"
                                placeholder="Ciudad"
                                value={formData.ciudad}
                                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="tel"
                                placeholder="Teléfono"
                                value={formData.telefono}
                                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="number"
                                    placeholder="ID Empresa"
                                    value={formData.empresa}
                                    onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    min="1"
                                />
                                <select
                                    value={formData.tipo}
                                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="sede">Sede</option>
                                    <option value="area">Área</option>
                                </select>
                            </div>

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
