import { type ReactElement } from 'react';
import { Building2, Lock, Users, BarChart3 } from 'lucide-react';

interface AdminMetric {
  title: string;
  value: string | number;
  description: string;
  icon: ReactElement;
  color: 'blue' | 'purple' | 'orange' | 'red';
}

export default function AdminDashboard() {

  const metrics: AdminMetric[] = [
    {
      title: 'Empresas Activas',
      value: 1,
      description: 'Configuradas en el sistema',
      icon: <Building2 className="w-5 h-5" />,
      color: 'blue',
    },
    {
      title: 'Usuarios del Sistema',
      value: '5+',
      description: 'Con control de acceso',
      icon: <Users className="w-5 h-5" />,
      color: 'purple',
    },
    {
      title: 'Sucursales',
      value: '2',
      description: 'Unidades organizativas',
      icon: <Building2 className="w-5 h-5" />,
      color: 'orange',
    },
    {
      title: 'Roles Configurados',
      value: 4,
      description: 'SUPERADMIN, ADMIN_RRHH, MANAGER, EMPLOYEE',
      icon: <Lock className="w-5 h-5" />,
      color: 'red',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs uppercase text-slate-500 font-semibold">Panel de Control</p>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          Dashboard Administrativo
        </h1>
        <p className="text-slate-600 mt-2">Resumen de la configuración técnica del sistema.</p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <MetricCard key={idx} metric={metric} />
        ))}
      </div>

      {/* Secciones de Configuración */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gestión de Datos Corporativos */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Identidad Corporativa</h2>
              <p className="text-sm text-slate-500">Datos fiscales y branding</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-slate-600">
              ✓ Razón social y datos fiscales<br />
              ✓ Logo corporativo<br />
              ✓ Configuración de moneda y país<br />
              ✓ Información de contacto
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/admin/company'}
            className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
          >
            Configurar Empresa
          </button>
        </div>

        {/* Gestión de Usuarios y Roles */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Control de Accesos</h2>
              <p className="text-sm text-slate-500">Usuarios y permisos</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-slate-600">
              ✓ Gestión de cuentas de usuario<br />
              ✓ Asignación de roles<br />
              ✓ Activación/Desactivación<br />
              ✓ Reseteo de contraseñas
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/admin/users'}
            className="mt-4 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold"
          >
            Gestionar Usuarios
          </button>
        </div>

        {/* Estructura Organizativa */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Sucursales</h2>
              <p className="text-sm text-slate-500">Unidades organizativas</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-slate-600">
              ✓ Crear nuevas sucursales<br />
              ✓ Gestionar ubicaciones<br />
              ✓ Asignar gerentes<br />
              ✓ Definir capacidades
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/admin/branches'}
            className="mt-4 w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-semibold"
          >
            Administrar Sucursales
          </button>
        </div>

        {/* Cargos y Posiciones */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Cargos y Posiciones</h2>
              <p className="text-sm text-slate-500">Catálogo de puestos</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-slate-600">
              ✓ Crear cargos laborales<br />
              ✓ Definir niveles<br />
              ✓ Establecer salarios<br />
              ✓ Asignar responsabilidades
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/admin/positions'}
            className="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
          >
            Gestionar Cargos
          </button>
        </div>
      </div>

      {/* Info sobre el Sistema */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-slate-900 mb-2">ℹ️ Bienvenido al Panel de Administración</h3>
        <p className="text-sm text-slate-600">
          Este módulo te permite configurar la identidad corporativa, gestionar usuarios con control de acceso granular, 
          y administrar la estructura organizativa. Todos los datos aquí configurados son críticos para el funcionamiento 
          del sistema HRMS.
        </p>
      </div>
    </div>
  );
}

function MetricCard({ metric }: { metric: AdminMetric }) {
  const colorMap = {
    blue: 'bg-blue-50 border-blue-100 text-blue-900',
    purple: 'bg-purple-50 border-purple-100 text-purple-900',
    orange: 'bg-orange-50 border-orange-100 text-orange-900',
    red: 'bg-red-50 border-red-100 text-red-900',
  };

  const iconColorMap = {
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
  };

  return (
    <div className={`rounded-xl border shadow-sm p-4 ${colorMap[metric.color]}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg bg-white/70 flex items-center justify-center ${iconColorMap[metric.color]}`}>
          {metric.icon}
        </div>
      </div>
      <p className="text-sm font-semibold opacity-80">{metric.title}</p>
      <p className="text-3xl font-bold mt-2">{metric.value}</p>
      <p className="text-xs mt-2 opacity-70">{metric.description}</p>
    </div>
  );
}
