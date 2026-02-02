import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Search, Briefcase, AlertCircle, CheckCircle } from "lucide-react";
import { employeeService, branchService, positionService } from "../../../core/services/adminService";
import type { Employee } from "../../../core/services/adminService";

interface Branch {
  id: number;
  nombre: string;
}

interface Position {
  id: number;
  nombre: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    documento: "",
    email: "",
    telefono: "",
    direccion: "",
    fecha_ingreso: new Date().toISOString().split("T")[0],
    fecha_nacimiento: "",
    cargo: "",
    sucursal: "",
    estado: "activo",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [emps, branchs, posts] = await Promise.all([
        employeeService.getEmployees(),
        branchService.getBranches(),
        positionService.getPositions(),
      ]);
      setEmployees(Array.isArray(emps) ? emps : emps?.results || []);
      setBranches(Array.isArray(branchs) ? branchs : branchs?.results || []);
      setPositions(Array.isArray(posts) ? posts : posts?.results || []);
    } catch (err: any) {
      console.error("Error loading data:", err);
      setError(err?.response?.data?.detail || "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombres || !formData.apellidos || !formData.documento || !formData.email) {
      setError("Por favor completa los campos obligatorios");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const data = {
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        documento: formData.documento,
        email: formData.email,
        telefono: formData.telefono,
        direccion: formData.direccion || undefined,
        fecha_ingreso: formData.fecha_ingreso,
        fecha_nacimiento: formData.fecha_nacimiento || undefined,
        cargo: formData.cargo ? parseInt(formData.cargo) : undefined,
        sucursal: formData.sucursal ? parseInt(formData.sucursal) : undefined,
        estado: formData.estado,
      };

      if (editingId) {
        await employeeService.updateEmployee(editingId, data);
        setSuccess("Empleado actualizado correctamente");
      } else {
        await employeeService.createEmployee(data);
        setSuccess("Empleado creado correctamente");
      }

      setIsModalOpen(false);
      setEditingId(null);
      resetForm();
      loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error("Error saving employee:", err);
      setError(err?.response?.data?.detail || "Error al guardar empleado");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (employee: Employee) => {
    setFormData({
      nombres: employee.nombres,
      apellidos: employee.apellidos,
      documento: employee.documento,
      email: employee.email,
      telefono: employee.telefono,
      direccion: employee.direccion || "",
      fecha_ingreso: employee.fecha_ingreso,
      fecha_nacimiento: employee.fecha_nacimiento || "",
      cargo: employee.cargo?.id?.toString() || "",
      sucursal: employee.sucursal?.id?.toString() || "",
      estado: employee.estado,
    });
    setEditingId(employee.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Estás seguro de eliminar este empleado?")) return;

    try {
      setError(null);
      await employeeService.deleteEmployee(id);
      setSuccess("Empleado eliminado correctamente");
      loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error("Error deleting employee:", err);
      setError(err?.response?.data?.detail || "Error al eliminar empleado");
    }
  };

  const resetForm = () => {
    setFormData({
      nombres: "",
      apellidos: "",
      documento: "",
      email: "",
      telefono: "",
      direccion: "",
      fecha_ingreso: new Date().toISOString().split("T")[0],
      fecha_nacimiento: "",
      cargo: "",
      sucursal: "",
      estado: "activo",
    });
    setEditingId(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.documento.includes(searchTerm) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase text-slate-500 font-semibold">Gestión de Personal</p>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-8 h-8 text-blue-600" />
            Empleados
          </h1>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Nuevo Empleado
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p>{success}</p>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por nombre, documento, email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Employees Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        {filteredEmployees.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No hay empleados registrados
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Nombre</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Documento</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Cargo</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Sucursal</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Estado</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="border-b border-slate-200 hover:bg-slate-50 transition">
                    <td className="px-6 py-4 text-sm">
                      <div className="font-semibold text-slate-900">{emp.nombres} {emp.apellidos}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{emp.documento}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{emp.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{emp.cargo?.nombre || "-"}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{emp.sucursal?.nombre || "-"}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        emp.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {emp.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(emp)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-slate-900">
                {editingId ? "Editar Empleado" : "Nuevo Empleado"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Nombres *</label>
                  <input
                    type="text"
                    name="nombres"
                    value={formData.nombres}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Apellidos *</label>
                  <input
                    type="text"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Documento *</label>
                  <input
                    type="text"
                    name="documento"
                    value={formData.documento}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Dirección</label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Fecha de Ingreso</label>
                  <input
                    type="date"
                    name="fecha_ingreso"
                    value={formData.fecha_ingreso}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    name="fecha_nacimiento"
                    value={formData.fecha_nacimiento}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Cargo</label>
                  <select
                    name="cargo"
                    value={formData.cargo}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar cargo</option>
                    {positions.map((pos) => (
                      <option key={pos.id} value={pos.id}>
                        {pos.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Sucursal</label>
                  <select
                    name="sucursal"
                    value={formData.sucursal}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar sucursal</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Estado</label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="licencia">En Licencia</option>
                  <option value="despedido">Despedido</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
                >
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
