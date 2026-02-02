# Proyecto HRMS - Punto Pymes

Sistema de gestión de RRHH construido con Django REST Framework y React + TypeScript. Incluye dashboard analítico, organigrama completo, control de asistencia, contratos, permisos y onboarding, respaldado por documentación extensa en docs/.

## Panorama rápido
- Frontend: React 18 + TypeScript + Tailwind (Vite).
- Backend: Django 6 + DRF sobre MySQL.
- Seguridad: CORS configurado, permisos DRF listos para IsAuthenticated en producción, cookies seguras documentadas (docs/README.md y GUIA_IMPLEMENTACION_HRMS.md).
- Scripts listos para levantar y verificar entorno en Windows (carpeta scripts/ y atajos en raíz).
- Documentación operativa y técnica en docs/ (START_HERE, RESUMEN_EJECUTIVO, ARQUITECTURA_PROFESIONAL, VERIFICACION_PASO_A_PASO, README_HRMS, etc.).

## Estructura
```
Proyecto punto pymes/
├── backend/            # Django REST API (employees, attendance, core)
├── frontend/           # React SPA (módulos hr y admin)
├── docs/               # Guías funcionales y técnicas
├── scripts/            # .bat para setup, start y verificación
└── README.md           # Este archivo
```

## Puesta en marcha (5 minutos)
1) Verificar e instalar dependencias
```
.\verify_installation.bat
.\install_frontend_deps.bat
.\setup_backend_complete.bat
```
2) Crear superusuario (solo la primera vez)
```
cd backend
python manage.py createsuperuser
cd ..
```
3) Iniciar todo
```
.\start_project.bat
```
4) Navegar
- Frontend: http://localhost:5173/hr/dashboard
- Backend admin: http://localhost:8000/admin
- API raíz: http://localhost:8000/employees/api/

## Funcionalidad principal
- Dashboard HR con filtros de rango y sucursal, KPIs, gráficos Recharts y alertas rápidas (frontend/src/modules/hr/pages/DashboardPage.tsx).
- Organigrama con múltiples raíces unificadas bajo nodo virtual para evitar nodos perdidos (frontend/src/modules/hr/pages/OrganigramPage.tsx, employees/api_views.py).
- Control de asistencia con filtros por fechas y sucursal, métricas de puntualidad y series diarias.
- Permisos: flujo de aprobación, conteo de pendientes, alertas visibles en dashboard y badges de estado.
- Contratos: seguimiento y alertas de vencimiento.
- Onboarding: checklist con progreso y alertas de tareas vencidas.
- Admin: CRUD de empleados, cargos y sucursales con búsqueda y modales.

## Seguridad y buenas prácticas
- CORS habilitado para frontend local; producción documentada con DEBUG=False, ALLOWED_HOSTS y cookies seguras.
- Permisos DRF listos para cambiar a IsAuthenticated en despliegue.
- Endpoints sensibles agrupados en employees/api/ con serializadores y validaciones en serializers.py y permissions.py.
- Uso de DecimalField en agregaciones de nómina para evitar errores de tipo y 500 en payroll (employees/services).

## Scripts útiles
```
.\start_project.bat            # Levanta backend y frontend
.\setup_backend_complete.bat   # Instala deps y migra
.\install_frontend_deps.bat    # Instala paquetes React
.\verify_installation.bat      # Chequeo rápido de estructura
.\cleanup_backend.bat          # Limpieza de plantillas viejas
```

## Rutas clave
| Página                  | URL                                   |
|-------------------------|---------------------------------------|
| Dashboard HR            | http://localhost:5173/hr/dashboard    |
| Organigrama             | http://localhost:5173/hr/organigram   |
| Permisos                | http://localhost:5173/hr/leaves       |
| Contratos               | http://localhost:5173/hr/contracts    |
| Onboarding              | http://localhost:5173/hr/onboarding   |
| Admin Empleados         | http://localhost:5173/admin/employees |
| Admin Cargos            | http://localhost:5173/admin/positions |
| Admin Sucursales        | http://localhost:5173/admin/branches  |
| Backend Admin           | http://localhost:8000/admin           |

## Documentación recomendada
- docs/START_HERE.md: visión general en 2 minutos.
- docs/RESUMEN_EJECUTIVO.md: cambios y alcance.
- docs/ARQUITECTURA_PROFESIONAL.md: diseño de capas y decisiones.
- docs/VERIFICACION_PASO_A_PASO.md: lista de validación y troubleshooting.
- docs/README_HRMS.md: detalle técnico y endpoints.

## Checklist de validación rápida
- start_project.bat ejecuta sin errores.
- Frontend responde en http://localhost:5173.
- Backend responde en http://localhost:8000 y /employees/api/.
- CRUD de empleados/cargos/sucursales operativo.
- Dashboard muestra KPIs, gráficos y datos de asistencia con filtros.
- Organigrama carga sin nodos huérfanos (múltiples raíces soportadas).

## Próximos pasos sugeridos
- Activar autenticación JWT y forzar IsAuthenticated en producción.
- Añadir paginación y filtros avanzados en tablas grandes.
- Exportaciones (Excel/PDF) y reportes personalizados.
- Notificaciones en tiempo real para aprobaciones y asistencia.

Última revisión: febrero 2026
