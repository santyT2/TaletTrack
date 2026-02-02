
# 📁 NUEVA ESTRUCTURA DE MÓDULOS - GUÍA DE REORGANIZACIÓN

## Estructura Final Propuesta

```
src/modules/
├── admin/                          # Módulo de Administración (Técnica)
│   ├── layouts/
│   │   └── AdminLayout.tsx         # (YA EXISTE) Sidebar: Empresa, Sucursales, Cargos, Usuarios
│   ├── pages/
│   │   ├── AdminDashboard.tsx      # Dashboard administrativo (consolidado)
│   │   ├── CompanyPage.tsx         # (YA EXISTE)
│   │   ├── BranchesPage.tsx        # (YA EXISTE)
│   │   ├── PositionsPage.tsx       # (YA EXISTE)
│   │   └── UsersPage.tsx           # (YA EXISTE)
│   ├── components/                 # (YA EXISTE)
│   └── AdminRoutes.tsx             # (YA EXISTE) - ACTUALIZAR
│
├── hr/                              # Módulo de RRHH (Gestión de Talento)
│   ├── layouts/
│   │   └── HRLayout.tsx            # (YA EXISTE) Sidebar: Empleados, Contratos, Nómina, Reportes
│   ├── pages/
│   │   ├── HRDashboard.tsx         # Dashboard de RRHH (renombrado de DashboardPage.tsx en raíz)
│   │   ├── EmployeesPage.tsx       # (MOVER desde admin/pages) Gestión de empleados
│   │   ├── ContractsPage.tsx       # (YA EXISTE)
│   │   ├── OnboardingPage.tsx      # (YA EXISTE)
│   │   ├── PayrollPage.tsx         # (YA EXISTE)
│   │   ├── ReportsPage.tsx         # (YA EXISTE)
│   │   ├── OrganigramPage.tsx      # (YA EXISTE en raíz)
│   │   ├── LeavesPage.tsx          # (MOVER desde admin/pages - gestión de permisos)
│   │   └── AttendancePage.tsx      # (MOVER desde admin/pages - gestión de asistencia)
│   ├── attendance/                  # SUB-MÓDULO: Gestión de Marcaje
│   │   ├── pages/
│   │   │   ├── MarkPage.tsx        # (MOVER de attendance/pages) Marcar asistencia
│   │   │   ├── DashboardPage.tsx   # (MOVER de attendance/pages) Dashboard de asistencia
│   │   │   └── PrenominaPage.tsx   # (MOVER de attendance/pages)
│   │   └── AttendanceRoutes.tsx    # (YA EXISTE) - ACTUALIZAR
│   ├── components/                  # (YA EXISTE)
│   └── HRRoutes.tsx                # (YA EXISTE) - ACTUALIZAR
│
└── portal/                           # Módulo del Empleado (Portal Personal)
    ├── layouts/
    │   └── PortalLayout.tsx         # (CREAR) Navbar simple sin sidebar
    ├── pages/
    │   ├── PortalDashboard.tsx      # (MOVER desde portal/pages - renombrado)
    │   ├── MyProfilePage.tsx        # (YA EXISTE)
    │   ├── MyRequestsPage.tsx       # (YA EXISTE)
    │   ├── MarkPage.tsx             # (CONSOLIDAR - usar la de attendance si es necesario)
    │   ├── LeavesPage.tsx           # (CONSOLIDAR - solicitar permisos)
    │   └── AttendancePage.tsx       # (CONSOLIDAR - ver mis registros)
    ├── components/                  # (CREAR si no existe)
    └── PortalRoutes.tsx             # (YA EXISTE) - ACTUALIZAR
```

## 📋 Acciones Específicas

### 1. ARCHIVOS A RENOMBRAR
```
admin/pages/DashboardPage.tsx             → admin/pages/AdminDashboard.tsx
hr/DashboardPage.tsx                      → hr/pages/HRDashboard.tsx
portal/pages/PortalDashboardPage.tsx      → portal/pages/PortalDashboard.tsx
```

### 2. ARCHIVOS A MOVER DENTRO DE admin/
✓ Quedan como están (ya correctos):
- CompanyPage.tsx
- BranchesPage.tsx
- PositionsPage.tsx
- UsersPage.tsx

❌ ELIMINAR de admin/pages (mover a hr/):
- EmployeesPage.tsx
- AttendancePage.tsx
- LeavesPage.tsx

### 3. ARCHIVOS A MOVER DE admin/ → hr/pages/
```
admin/pages/EmployeesPage.tsx  →  hr/pages/EmployeesPage.tsx
admin/pages/AttendancePage.tsx →  hr/pages/AttendancePage.tsx (Gestión de asistencia)
admin/pages/LeavesPage.tsx     →  hr/pages/LeavesPage.tsx (Gestión de permisos)
```

### 4. ARCHIVOS A MOVER DE hr/ → hr/attendance/ (submódulo)
```
attendance/pages/MarkPage.tsx       →  hr/attendance/pages/MarkPage.tsx
attendance/pages/DashboardPage.tsx  →  hr/attendance/pages/DashboardPage.tsx
attendance/pages/PrenominaPage.tsx  →  hr/attendance/pages/PrenominaPage.tsx
attendance/AttendanceLayout.tsx     →  hr/attendance/AttendanceLayout.tsx
attendance/AttendanceRoutes.tsx     →  hr/attendance/AttendanceRoutes.tsx
```

### 5. ARCHIVOS A MOVER DE portal/pages (consolidar nombres)
```
portal/pages/PortalDashboardPage.tsx  →  portal/pages/PortalDashboard.tsx (RENOMBRAR)
portal/pages/MyProfilePage.tsx        →  Se queda igual
portal/pages/MyRequestsPage.tsx       →  Se queda igual
portal/pages/MarkPage.tsx             →  Usar versión simplificada
portal/pages/LeavesPage.tsx           →  Usar versión simplificada (solicitudes)
portal/pages/AttendancePage.tsx       →  Usar versión simplificada (mis registros)
```

## 🔗 MÓDULOS QUE SE CREAN/ACTUALIZAN

### Portal Layout (NUEVO)
```tsx
// src/modules/portal/layouts/PortalLayout.tsx
// Navbar simple sin sidebar (solo header con info del usuario)
```

### RUTAS (ACTUALIZAR)
- `admin/AdminRoutes.tsx` - Eliminar EmployeesPage, AttendancePage, LeavesPage
- `hr/HRRoutes.tsx` - Agregar EmployeesPage, AttendancePage, LeavesPage
- `hr/attendance/AttendanceRoutes.tsx` - Mantener pero reorganizar
- `portal/PortalRoutes.tsx` - Actualizar con nuevos nombres
- `src/App.tsx` → AppRoutes.tsx - Lazy loading de módulos

## ⚡ RESULTADOS ESPERADOS

✅ **Módulo Admin** (Gestión Técnica)
- Company: Datos corporativos
- Branches: Sucursales
- Positions: Cargos
- Users: Control de acceso

✅ **Módulo HR** (Gestión de Talento)
- Employees: Nómina de empleados
- Contracts: Contratos laborales
- Onboarding: Incorporación de nuevos empleados
- Payroll: Procesamiento de nómina
- Reports: Reportes RRHH
- Organigram: Estructura organizacional
- Leaves: Gestión de permisos y licencias
- Attendance: Gestión centralizada de asistencia
  - Attendance.MarkPage: Marcar asistencia en tiempo real
  - Attendance.Dashboard: Dashboard de asistencia

✅ **Módulo Portal** (Autoservicio del Empleado)
- Dashboard: Resumen personal
- My Profile: Mi información
- My Requests: Mis solicitudes
- Mark: Marcar mi asistencia (interfaz simplificada)
- Leaves: Solicitar permisos
- Attendance: Ver mis registros

## 🔐 SEGURIDAD POR ROLES

```
SUPERADMIN    → /admin  (Acceso a todo)
ADMIN_RRHH    → /hr     (Gestión de RRHH)
MANAGER       → /hr     (Gestión limitada)
EMPLOYEE      → /portal (Solo su información)
```

---

**SIGUIENTE PASO:** Ejecutar las migraciones de archivos (comandos en la siguiente sección)
