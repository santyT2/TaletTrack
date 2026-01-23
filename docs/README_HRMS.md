# 🚀 HRMS - Sistema de Gestión de Recursos Humanos

Sistema completo de gestión de RRHH construido con **Django** (Backend) y **React + Vite** (Frontend).

## 📋 Características

### Backend (Django REST Framework)
- ✅ API RESTful completa
- ✅ Gestión de empleados, sucursales y cargos
- ✅ Sistema de contratos con alertas de vencimiento
- ✅ Solicitudes de permisos con flujo de aprobación
- ✅ Tareas de onboarding con seguimiento de progreso
- ✅ Dashboard con KPIs y métricas
- ✅ Organigrama jerárquico
- ✅ Autenticación y permisos

### Frontend (React + TypeScript)
- ✅ Dashboard interactivo con gráficos (Recharts)
- ✅ Organigrama visual con estructura jerárquica
- ✅ Gestión de solicitudes de permisos
- ✅ Seguimiento de contratos con alertas
- ✅ Sistema de onboarding con checklist
- ✅ UI profesional con Tailwind CSS
- ✅ Navegación con React Router

## 🏗️ Estructura del Proyecto

```
proyecto-punto-pymes/
├── backend/                    # Django Backend
│   ├── talent_track/          # Configuración principal
│   ├── employees/             # App de empleados
│   │   ├── models.py         # Modelos (Empleado, Contract, LeaveRequest, etc.)
│   │   ├── serializers.py    # Serializadores DRF
│   │   ├── api_views.py      # ViewSets y endpoints especiales
│   │   └── urls.py           # Rutas API
│   ├── attendance/            # Control de asistencia
│   └── core/                  # App central
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── modules/
│   │   │   └── hr/
│   │   │       ├── pages/
│   │   │       │   ├── DashboardPage.tsx      # Dashboard con KPIs
│   │   │       │   ├── OrganigramPage.tsx     # Organigrama
│   │   │       │   ├── LeavesPage.tsx         # Permisos
│   │   │       │   ├── ContractsPage.tsx      # Contratos
│   │   │       │   └── OnboardingPage.tsx     # Onboarding
│   │   │       ├── components/
│   │   │       │   └── HRNavigation.tsx       # Navegación
│   │   │       ├── HRLayout.tsx               # Layout principal
│   │   │       └── HRRoutes.tsx               # Rutas
│   │   └── services/
│   │       └── hrService.ts                    # Cliente API
│   └── package.json
│
├── install_frontend_deps.bat   # Instalar dependencias frontend
├── setup_backend_complete.bat  # Configurar backend completo
├── start_project.bat           # Iniciar todo el proyecto
└── GUIA_IMPLEMENTACION_HRMS.md # Guía detallada
```

## 🚀 Inicio Rápido

### Opción 1: Configuración Automática (Recomendado)

#### 1. Instalar Dependencias Frontend
```bash
.\install_frontend_deps.bat
```

#### 2. Configurar Backend
```bash
.\setup_backend_complete.bat
```

#### 3. Crear Superusuario (Solo primera vez)
```bash
cd backend
python manage.py createsuperuser
```

#### 4. Iniciar Proyecto Completo
```bash
.\start_project.bat
```

### Opción 2: Configuración Manual

#### Backend
```bash
cd backend

# Instalar dependencias
pip install -r requirements.txt
pip install django-cors-headers django-filter

# Migraciones
python manage.py makemigrations
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Iniciar servidor
python manage.py runserver
```

#### Frontend
```bash
cd frontend

# Instalar dependencias
npm install
npm install recharts react-organizational-chart lucide-react date-fns

# Iniciar servidor de desarrollo
npm run dev
```

## 📡 Endpoints Principales

### API Base URL: `http://localhost:8000`

### Empleados
- `GET /employees/api/empleados/` - Lista de empleados
- `GET /employees/api/empleados/{id}/` - Detalle de empleado
- `POST /employees/api/empleados/` - Crear empleado
- `PATCH /employees/api/empleados/{id}/` - Actualizar empleado
- `DELETE /employees/api/empleados/{id}/` - Eliminar empleado

### Contratos
- `GET /employees/api/contratos/` - Lista de contratos
- `GET /employees/api/contratos/expiring_soon/` - Contratos por vencer
- `POST /employees/api/contratos/` - Crear contrato

### Solicitudes de Permisos
- `GET /employees/api/solicitudes/` - Lista de solicitudes
- `POST /employees/api/solicitudes/` - Crear solicitud
- `POST /employees/api/solicitudes/{id}/approve/` - Aprobar solicitud
- `POST /employees/api/solicitudes/{id}/reject/` - Rechazar solicitud
- `GET /employees/api/solicitudes/pending/` - Solicitudes pendientes

### Onboarding
- `GET /employees/api/onboarding/` - Lista de tareas
- `POST /employees/api/onboarding/` - Crear tarea
- `POST /employees/api/onboarding/{id}/toggle_complete/` - Completar/Descompletar

### Especiales
- `GET /employees/api/dashboard/kpi/` - KPIs del dashboard
- `GET /employees/api/organigram/` - Estructura organizacional

## 🖥️ Páginas Frontend

### Dashboard (`/hr/dashboard`)
- Tarjetas con KPIs principales
- Gráfico de empleados por departamento
- Gráfico de solicitudes de permisos
- Lista de cumpleaños del mes
- Alertas de contratos por vencer

### Organigrama (`/hr/organigram`)
- Visualización jerárquica de la estructura
- Árbol interactivo con empleados
- Zoom y navegación

### Permisos (`/hr/leaves`)
- Dos pestañas: "Mis Solicitudes" y "Aprobaciones"
- Formulario para crear solicitudes
- Gestión de aprobaciones/rechazos
- Badges de estado con colores

### Contratos (`/hr/contracts`)
- Tabla histórica de contratos
- Alertas de vencimiento (< 30 días)
- Gestión de documentos PDF
- Estados visuales

### Onboarding (`/hr/onboarding`)
- Kanban de tareas pendientes/completadas
- Barra de progreso general
- Alertas de tareas vencidas
- Toggle de completado

## 🛠️ Tecnologías

### Backend
- Python 3.14+
- Django 6.0.1
- Django REST Framework
- MySQL
- django-cors-headers

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Recharts (gráficos)
- React Router
- Lucide React (iconos)
- date-fns

## 📊 KPIs Disponibles

El endpoint `/employees/api/dashboard/kpi/` retorna:
- Total de empleados (`total_headcount`)
- Empleados por departamento (`headcount_by_department`)
- Tasa de retención (`retention_rate`)
- Solicitudes pendientes (`pending_leaves_count`)
- Solicitudes aprobadas (`approved_leaves_count`)
- Solicitudes rechazadas (`rejected_leaves_count`)
- Progreso de onboarding (`onboarding_progress`)
- Contratos por vencer (`contracts_expiring_soon`)
- Cumpleaños del mes (`upcoming_birthdays`)

## 🔐 Autenticación

Por defecto, la API está configurada con `AllowAny` para desarrollo.

Para producción, cambiar en `settings.py`:
```python
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}
```

## 🧪 Testing

### Backend
```bash
cd backend
python manage.py test
```

### Probar endpoints con curl
```bash
# KPIs
curl http://localhost:8000/employees/api/dashboard/kpi/

# Organigrama
curl http://localhost:8000/employees/api/organigram/

# Empleados
curl http://localhost:8000/employees/api/empleados/
```

## 📝 Próximas Mejoras

- [ ] Autenticación JWT
- [ ] Paginación en tablas
- [ ] Búsqueda y filtros avanzados
- [ ] Notificaciones en tiempo real
- [ ] Exportación a Excel/PDF
- [ ] Gráficos adicionales
- [ ] Dashboard de administrador
- [ ] Sistema de permisos granulares
- [ ] Tests unitarios y de integración
- [ ] Documentación API con Swagger

## 🐛 Troubleshooting

### Error CORS
Asegúrate de tener `django-cors-headers` instalado y configurado en `settings.py`.

### Error 404 en endpoints
Verifica que las URLs estén correctamente configuradas en `backend/employees/urls.py`.

### Frontend no conecta con Backend
Verifica que la URL del API en `.env` sea correcta:
```
VITE_API_URL=http://localhost:8000
```

### Migraciones no se aplican
```bash
cd backend
python manage.py makemigrations --empty employees
python manage.py migrate --fake
```

## 📄 Licencia

Este proyecto es privado y propietario.

## 👥 Equipo

Desarrollado para Proyecto Punto Pymes.

---

**¿Necesitas ayuda?** Consulta la [Guía de Implementación Completa](GUIA_IMPLEMENTACION_HRMS.md)
