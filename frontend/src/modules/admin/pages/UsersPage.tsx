import { useState, useEffect } from 'react';
import { userService, type UserData, type UserRoleUpdate } from '../../../core/services/adminService';
import { 
  Users as UsersIcon, 
  Shield, 
  ShieldCheck, 
  UserCog, 
  User as UserIcon, 
  Search, 
  Edit, 
  Key, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Filter
} from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // Modal
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  
  // Form data
  const [editFormData, setEditFormData] = useState<UserRoleUpdate>({});
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err: any) {
      console.error('Error loading users:', err);
      setError(err?.response?.data?.detail || 'Error al cargar usuarios.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: UserData) => {
    setEditingUser(user);
    setEditFormData({
      role: user.role,
      is_active: user.is_active,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    
    try {
      setSaving(true);
      setError(null);
      await userService.updateUser(editingUser.id, editFormData);
      setSuccess(`Usuario ${editingUser.username} actualizado correctamente.`);
      setShowEditModal(false);
      loadUsers();
    } catch (err: any) {
      console.error('Error updating user:', err);
      setError(err?.response?.data?.detail || 'Error al actualizar usuario.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (user: UserData) => {
    try {
      setError(null);
      await userService.toggleActive(user.id);
      setSuccess(`Usuario ${user.username} ${user.is_active ? 'desactivado' : 'activado'} correctamente.`);
      loadUsers();
    } catch (err: any) {
      console.error('Error toggling user:', err);
      setError(err?.response?.data?.detail || 'Error al cambiar estado del usuario.');
    }
  };

  const handleResetPassword = (user: UserData) => {
    setSelectedUser(user);
    setNewPassword('');
    setShowPasswordModal(true);
  };

  const handleSavePassword = async () => {
    if (!selectedUser || !newPassword) {
      setError('Debe ingresar una contraseña válida.');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      await userService.resetPassword(selectedUser.id, { new_password: newPassword });
      setSuccess(`Contraseña reseteada para ${selectedUser.username}. Debe cambiarla en el primer login.`);
      setShowPasswordModal(false);
      setNewPassword('');
    } catch (err: any) {
      console.error('Error resetting password:', err);
      setError(err?.response?.data?.detail || 'Error al resetear contraseña.');
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPERADMIN':
        return {
          icon: Shield,
          color: 'bg-red-100 text-red-800 border-red-200',
          label: 'Super Admin'
        };
      case 'ADMIN_RRHH':
        return {
          icon: ShieldCheck,
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          label: 'Admin RRHH'
        };
      case 'MANAGER':
        return {
          icon: UserCog,
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          label: 'Manager'
        };
      default:
        return {
          icon: UserIcon,
          color: 'bg-green-100 text-green-800 border-green-200',
          label: 'Empleado'
        };
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.first_name + ' ' + user.last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.empleado_nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || user.is_active.toString() === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs uppercase text-slate-500 font-semibold">Seguridad y Control de Accesos</p>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <UsersIcon className="w-8 h-8 text-blue-600" />
          Gestión de Usuarios
        </h1>
        <p className="text-slate-600 mt-1">Administra cuentas de acceso, roles y permisos del sistema.</p>
      </div>

      {/* Alertas */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-green-900">Éxito</h3>
            <p className="text-sm text-green-700">{success}</p>
          </div>
          <button onClick={() => setSuccess(null)} className="text-green-600 hover:text-green-800">
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por usuario, email o empleado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtro por Rol */}
          <div className="w-full md:w-48">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los Roles</option>
              <option value="SUPERADMIN">Super Admin</option>
              <option value="ADMIN_RRHH">Admin RRHH</option>
              <option value="MANAGER">Manager</option>
              <option value="EMPLOYEE">Empleado</option>
            </select>
          </div>

          {/* Filtro por Estado */}
          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los Estados</option>
              <option value="true">Activos</option>
              <option value="false">Bloqueados</option>
            </select>
          </div>
        </div>

        {/* Resumen */}
        <div className="mt-4 flex items-center gap-4 text-sm text-slate-600">
          <span className="flex items-center gap-1">
            <Filter className="w-4 h-4" />
            {filteredUsers.length} de {users.length} usuarios
          </span>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Empleado Vinculado
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Último Acceso
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <UsersIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="font-medium">No se encontraron usuarios</p>
                    <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const roleBadge = getRoleBadge(user.role);
                  const RoleIcon = roleBadge.icon;
                  
                  return (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      {/* Usuario */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{user.username}</p>
                            <p className="text-sm text-slate-600">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Empleado Vinculado */}
                      <td className="px-6 py-4">
                        {user.empleado_nombre ? (
                          <p className="text-slate-900">{user.empleado_nombre}</p>
                        ) : (
                          <span className="text-slate-400 text-sm italic">Sin vincular</span>
                        )}
                      </td>

                      {/* Rol */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${roleBadge.color}`}>
                          <RoleIcon className="w-3.5 h-3.5" />
                          {roleBadge.label}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleActive(user)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                            user.is_active
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {user.is_active ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" />
                              Activo
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              Bloqueado
                            </>
                          )}
                        </button>
                      </td>

                      {/* Último Acceso */}
                      <td className="px-6 py-4 text-center text-sm text-slate-600">
                        {user.last_login ? (
                          new Date(user.last_login).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        ) : (
                          <span className="text-slate-400 italic">Nunca</span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar Rol"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleResetPassword(user)}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Resetear Contraseña"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Edición */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-600" />
                Editar Usuario
              </h2>
              <p className="text-sm text-slate-600 mt-1">Modificar rol y permisos de {editingUser.username}</p>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Usuario Info */}
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-600">Usuario</p>
                <p className="font-semibold text-slate-900">{editingUser.username}</p>
                <p className="text-sm text-slate-600 mt-1">{editingUser.email}</p>
              </div>

              {/* Rol */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Rol del Sistema</label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as any })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="SUPERADMIN">Super Admin</option>
                  <option value="ADMIN_RRHH">Admin RRHH</option>
                  <option value="MANAGER">Manager</option>
                  <option value="EMPLOYEE">Empleado</option>
                </select>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Estado de la Cuenta</label>
                <select
                  value={editFormData.is_active ? 'true' : 'false'}
                  onChange={(e) => setEditFormData({ ...editFormData, is_active: e.target.value === 'true' })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="true">Activo</option>
                  <option value="false">Bloqueado</option>
                </select>
              </div>

              {/* Empleado Vinculado */}
              {editingUser.empleado_nombre && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-700">Empleado Vinculado</p>
                  <p className="font-semibold text-blue-900">{editingUser.empleado_nombre}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Reseteo de Contraseña */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-orange-600" />
                Resetear Contraseña
              </h2>
              <p className="text-sm text-slate-600 mt-1">Establecer nueva contraseña para {selectedUser.username}</p>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Usuario Info */}
              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-sm text-orange-700">Usuario</p>
                <p className="font-semibold text-orange-900">{selectedUser.username}</p>
                <p className="text-sm text-orange-700 mt-2">⚠️ El usuario deberá cambiar esta contraseña en el primer inicio de sesión.</p>
              </div>

              {/* Nueva Contraseña */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nueva Contraseña <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  minLength={6}
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setNewPassword('');
                }}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePassword}
                disabled={saving || !newPassword || newPassword.length < 6}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Reseteando...' : 'Resetear Contraseña'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

