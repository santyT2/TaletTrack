# 🚀 GUÍA DE CONFIGURACIÓN COMPLETA - HRMS

## 📋 PARTE 1: BACKEND (Django)

### 1. Activar el entorno virtual y navegar al backend
```bash
cd backend
# Activar venv si no está activo
# Windows: venv\Scripts\activate
# Linux/Mac: source venv/bin/activate
```

### 2. Instalar dependencias adicionales (si es necesario)
```bash
pip install djangorestframework
pip install django-filter
pip install django-cors-headers
pip install pillow
```

### 3. Actualizar settings.py para CORS

Agregar en `backend/talent_track/settings.py`:

```python
INSTALLED_APPS = [
    # ...
    'corsheaders',
    'rest_framework',
    # ...
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Agregar al inicio
    'django.middleware.security.SecurityMiddleware',
    # ...
]

# CORS settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",  # Vite default
]

CORS_ALLOW_CREDENTIALS = True

# DRF Settings
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
    ],
}
```

### 4. Crear y aplicar migraciones
```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Verificar que todo esté bien
```bash
python manage.py check
```

### 6. Crear datos de prueba (opcional)
```bash
python manage.py shell
```

Luego ejecutar:
```python
from employees.models import *
from datetime import date, timedelta
from django.utils import timezone

# Crear tareas de onboarding de ejemplo
emp = Empleado.objects.first()
if emp:
    OnboardingTask.objects.create(
        employee=emp,
        title="Completar formularios de RRHH",
        due_date=timezone.now().date() + timedelta(days=7)
    )
    OnboardingTask.objects.create(
        employee=emp,
        title="Configurar correo corporativo",
        due_date=timezone.now().date() + timedelta(days=3)
    )
```

### 7. Iniciar el servidor Django
```bash
python manage.py runserver
```

---

## 📋 PARTE 2: FRONTEND (React + Vite)

### 1. Navegar al directorio frontend
```bash
cd ../frontend
```

### 2. Instalar dependencias necesarias

```bash
npm install axios
npm install recharts
npm install react-router-dom
npm install @tanstack/react-query
npm install lucide-react
npm install date-fns
npm install react-organizational-chart
```

### 3. Crear archivo .env

Crear `frontend/.env`:
```
VITE_API_URL=http://localhost:8000
```

### 4. Estructura de archivos creada

Ya hemos creado:
- ✅ `src/services/hrService.ts` - Servicio API
- ✅ `src/modules/hr/pages/` - Carpeta para las páginas

Ahora crearemos las páginas pendientes.

### 5. Iniciar el servidor de desarrollo
```bash
npm run dev
```

---

## 📋 PARTE 3: RUTAS Y NAVEGACIÓN

### Actualizar App.tsx o crear Router

El sistema tendrá las siguientes rutas:

```
/hr/dashboard - Dashboard con KPIs
/hr/organigram - Organigrama
/hr/leaves - Solicitudes de permisos
/hr/contracts - Gestión de contratos
/hr/onboarding - Tareas de onboarding
```

---

## 📋 PARTE 4: TESTING

### Backend
```bash
cd backend
python manage.py test
```

### Probar endpoints manualmente:
```bash
# KPIs
curl http://localhost:8000/employees/api/dashboard/kpi/

# Organigrama
curl http://localhost:8000/employees/api/organigram/

# Empleados
curl http://localhost:8000/employees/api/empleados/
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

---

## 🎯 ENDPOINTS DISPONIBLES

### API REST (DRF)
- `GET /employees/api/empleados/` - Lista de empleados
- `GET /employees/api/empleados/{id}/` - Detalle de empleado
- `POST /employees/api/empleados/` - Crear empleado
- `PATCH /employees/api/empleados/{id}/` - Actualizar empleado
- `DELETE /employees/api/empleados/{id}/` - Eliminar empleado

### Contratos
- `GET /employees/api/contratos/` - Lista de contratos
- `GET /employees/api/contratos/expiring_soon/` - Contratos por vencer
- `POST /employees/api/contratos/` - Crear contrato

### Solicitudes
- `GET /employees/api/solicitudes/` - Lista de solicitudes
- `POST /employees/api/solicitudes/` - Crear solicitud
- `POST /employees/api/solicitudes/{id}/approve/` - Aprobar
- `POST /employees/api/solicitudes/{id}/reject/` - Rechazar
- `GET /employees/api/solicitudes/pending/` - Pendientes

### Onboarding
- `GET /employees/api/onboarding/` - Lista de tareas
- `POST /employees/api/onboarding/` - Crear tarea
- `POST /employees/api/onboarding/{id}/toggle_complete/` - Completar/Descompletar

### Especiales
- `GET /employees/api/dashboard/kpi/` - KPIs del dashboard
- `GET /employees/api/organigram/` - Estructura organizacional

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Backend
- [x] Modelos creados (Employee, Contract, LeaveRequest, OnboardingTask)
- [x] Serializers con campos calculados
- [x] ViewSets con acciones personalizadas
- [x] Endpoints especiales (KPI, Organigram)
- [x] URLs configuradas
- [ ] CORS habilitado
- [ ] Migraciones aplicadas
- [ ] Datos de prueba creados

### Frontend
- [x] Servicio API configurado
- [x] Interfaces TypeScript definidas
- [ ] DashboardPage implementada
- [ ] OrganigramPage implementada
- [ ] LeavesPage implementada
- [ ] ContractsPage implementada
- [ ] OnboardingPage implementada
- [ ] Rutas configuradas
- [ ] Navegación implementada

---

## 🐛 TROUBLESHOOTING

### Error: CORS
Asegúrate de tener `django-cors-headers` instalado y configurado en settings.py

### Error: 404 en endpoints
Verifica que las URLs estén correctamente configuradas en `urls.py`

### Error: No module named 'rest_framework'
```bash
pip install djangorestframework
```

### Error: ModuleNotFoundError en frontend
```bash
npm install
```

---

## 📚 PRÓXIMOS PASOS

1. Implementar autenticación JWT
2. Agregar paginación en tablas
3. Implementar búsqueda y filtros avanzados
4. Agregar notificaciones en tiempo real
5. Implementar exportación a Excel/PDF
6. Agregar gráficos adicionales
7. Implementar dashboard de administrador
8. Agregar sistema de permisos granulares

