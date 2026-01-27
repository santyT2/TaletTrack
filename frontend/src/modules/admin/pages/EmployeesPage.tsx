import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Search, MapPin, Briefcase, Upload } from "lucide-react";
import api from "../../../services/api";

interface Employee {
    id: number;
    nombres: string;
    apellidos: string;
    email: string;
    telefono: string;
    fecha_ingreso: string;
    cargo?: { id: number; nombre: string };
    sucursal?: { id: number; nombre: string };
}

interface OptionItem {
    id: number;
    nombre: string;
    empresa?: number;
}

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const [sucursales, setSucursales] = useState<OptionItem[]>([]);
    const [cargos, setCargos] = useState<OptionItem[]>([]);
    const [fotoFile, setFotoFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        nombres: "",
        apellidos: "",
        email: "",
        telefono: "",
        documento: "",
        fecha_ingreso: new Date().toISOString().split("T")[0],
        cargo: "",
        sucursal: "",
    });

    useEffect(() => {
        loadEmployees();
        loadSucursales();
        loadCargos();
    }, []);

    const loadSucursales = async () => {
        try {
            const response = await api.get("/sucursales/");
            const raw = Array.isArray(response.data?.results)
                ? response.data.results
                : Array.isArray(response.data)
                ? response.data
                : [];
            const opts = raw.map((s: any) => ({ id: s.id, nombre: s.nombre, empresa: s.empresa }));
            setSucursales(opts);
        } catch (err) {
            console.error(err);
        }
    };

    const loadCargos = async () => {
        try {
            const response = await api.get("/cargos/");
            const raw = Array.isArray(response.data?.results)
                ? response.data.results
                : Array.isArray(response.data)
                ? response.data
                : [];
            const opts = raw.map((c: any) => ({ id: c.id, nombre: c.nombre, empresa: c.empresa }));
            setCargos(opts);
        } catch (err) {
            console.error(err);
        }
    };

    const loadEmployees = async () => {
        try {
            setLoading(true);
            const response = await api.get("/empleados/");
            const raw = Array.isArray(response.data?.results)
                ? response.data.results
                : Array.isArray(response.data)
                ? response.data
                : [];
            if (!Array.isArray(response.data?.results) && !Array.isArray(response.data)) {
                setError("Respuesta inesperada al listar empleados");
            }
            const mapped: Employee[] = raw.map((item: any) => ({
                id: item.id,
                nombres: item.nombres || "",
                apellidos: item.apellidos || "",
                email: item.email || "",
                telefono: item.telefono || "",
                fecha_ingreso: item.fecha_ingreso || "",
                cargo:
                    typeof item.cargo === "object"
                        ? item.cargo
                        : item.cargo
                        ? { id: item.cargo, nombre: "Cargo" }
                        : undefined,
                sucursal:
                    typeof item.sucursal === "object"
                        ? item.sucursal
                        : item.sucursal
                        ? { id: item.sucursal, nombre: "Sucursal" }
                        : undefined,
            }));
            setEmployees(mapped);
            if (Array.isArray(response.data)) setError(null);
        } catch (err) {
            console.error(err);
            setError("Error al cargar empleados");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.nombres || !formData.apellidos || !formData.email || !formData.sucursal || !formData.cargo || !formData.telefono) {
            setError("Por favor completa los campos obligatorios");
            return;
        }

        try {
            const suc = sucursales.find((s) => s.id.toString() === formData.sucursal);
            const fd = new FormData();
            fd.append("nombres", formData.nombres);
            fd.append("apellidos", formData.apellidos);
            fd.append("email", formData.email);
            fd.append("telefono", formData.telefono);
            if (formData.documento) fd.append("documento", formData.documento);
            fd.append("fecha_ingreso", formData.fecha_ingreso);
            fd.append("cargo", formData.cargo);
            fd.append("sucursal", formData.sucursal);
            if (suc?.empresa) fd.append("empresa", String(suc.empresa));
            if (fotoFile) fd.append("foto_url", fotoFile);
            if (editingId) {
                await api.patch(`/empleados/${editingId}/`, fd, { headers: { "Content-Type": "multipart/form-data" } });
                setSuccessMsg("Empleado actualizado correctamente");
            } else {
                await api.post("/empleados/", fd, { headers: { "Content-Type": "multipart/form-data" } });
                setSuccessMsg("Empleado creado correctamente");
            }

            setIsModalOpen(false);
            setEditingId(null);
            setFormData({
                nombres: "",
                apellidos: "",
                email: "",
                telefono: "",
                documento: "",
                fecha_ingreso: new Date().toISOString().split("T")[0],
                cargo: "",
                sucursal: "",
            });
            setFotoFile(null);
            loadEmployees();
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Error al guardar empleado");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("¿Estás seguro de eliminar este empleado?")) return;

        try {
            await api.delete(`/empleados/${id}/`);
            setSuccessMsg("Empleado eliminado correctamente");
            loadEmployees();
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err) {
            setError("Error al eliminar empleado");
        }
    };

    const handleEdit = (employee: Employee) => {
        setFormData({
            nombres: employee.nombres,
            apellidos: employee.apellidos,
            email: employee.email,
            telefono: employee.telefono,
            documento: "",
            fecha_ingreso: employee.fecha_ingreso,
            cargo: employee.cargo?.id?.toString() || "",
            sucursal: employee.sucursal?.id?.toString() || "",
        });
        setEditingId(employee.id);
        setIsModalOpen(true);
    };

    const filteredEmployees = employees.filter((emp) =>
        (emp.nombres || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.apellidos || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gestión de Empleados</h1>
                    <p className="text-gray-600 mt-1">Total: {employees.length} empleados</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({
                            nombres: "",
                            apellidos: "",
                            email: "",
                            telefono: "",
                            documento: "",
                            fecha_ingreso: new Date().toISOString().split("T")[0],
                            cargo: "",
                            sucursal: "",
                        });
                        setIsModalOpen(true);
                    }}
                    className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Empleado
                </button>
            </div>

            {error && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center gap-2">
                    {error}
                </div>
            )}
            {successMsg && (
                <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center gap-2">
                    {successMsg}
                </div>
            )}

            <div className="mb-6 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar por nombre, apellido o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nombre Completo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Cargo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Sucursal
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredEmployees.length > 0 ? (
                                filteredEmployees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {emp.nombres} {emp.apellidos}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600">{emp.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {emp.cargo ? (
                                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                                    <Briefcase className="w-4 h-4" />
                                                    {emp.cargo.nombre}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">Sin cargo</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {emp.sucursal ? (
                                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                                    <MapPin className="w-4 h-4" />
                                                    {emp.sucursal.nombre}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">Sin sucursal</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(emp)}
                                                    className="text-brand-700 hover:text-brand-900 transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(emp.id)}
                                                    className="text-red-600 hover:text-red-900 transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No hay empleados que coincidan con la búsqueda
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            {editingId ? "Editar Empleado" : "Nuevo Empleado"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Nombre *"
                                    value={formData.nombres}
                                    onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Apellido *"
                                    value={formData.apellidos}
                                    onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                                    required
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="Documento (opcional)"
                                value={formData.documento}
                                onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                            />
                            <input
                                type="email"
                                placeholder="Email *"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                                required
                            />
                            <input
                                type="tel"
                                placeholder="Teléfono *"
                                value={formData.telefono}
                                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                                required
                            />
                            <input
                                type="date"
                                value={formData.fecha_ingreso}
                                onChange={(e) => setFormData({ ...formData, fecha_ingreso: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <select
                                    value={formData.sucursal}
                                    onChange={(e) => setFormData({ ...formData, sucursal: e.target.value })}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                                    required
                                >
                                    <option value="">Selecciona sucursal</option>
                                    {sucursales.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.nombre}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={formData.cargo}
                                    onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                                    required
                                >
                                    <option value="">Selecciona cargo</option>
                                    {cargos.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm text-gray-700">
                                    <Upload className="w-4 h-4" />
                                    <span>{fotoFile ? fotoFile.name : "Subir foto (opcional)"}</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const f = e.target.files?.[0];
                                            setFotoFile(f || null);
                                        }}
                                    />
                                </label>
                                {fotoFile && (
                                    <button
                                        type="button"
                                        onClick={() => setFotoFile(null)}
                                        className="text-sm text-red-600 hover:underline"
                                    >
                                        Quitar
                                    </button>
                                )}
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
                                    {editingId ? "Actualizar" : "Crear"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
