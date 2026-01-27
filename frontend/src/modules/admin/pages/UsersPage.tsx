export default function UsersPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase text-slate-500">Seguridad</p>
        <h1 className="text-2xl font-bold text-slate-900">Usuarios y Roles</h1>
        <p className="text-slate-600">Gestiona accesos, roles y permisos del sistema.</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 text-slate-600">
        <p className="text-sm">Aquí irá la tabla de usuarios, asignación de roles y restablecimiento de credenciales.</p>
      </div>
    </div>
  );
}
