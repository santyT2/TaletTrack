# 🎯 INSTRUCCIONES RÁPIDAS - SISTEMA HRMS

## ⚡ INICIO RÁPIDO (3 minutos)

### Paso 1: Verificar la Instalación
```bash
.\verify_installation.bat
```
Este script verificará que todos los archivos estén en su lugar.

### Paso 2: Instalar Dependencias del Frontend
```bash
.\install_frontend_deps.bat
```
Instalará: recharts, lucide-react, date-fns, react-organizational-chart

### Paso 3: Configurar el Backend
```bash
.\setup_backend_complete.bat
```
Instalará dependencias, creará migraciones y las aplicará.

### Paso 4: Crear un Superusuario (Solo primera vez)
```bash
cd backend
python manage.py createsuperuser
```
Sigue las instrucciones en pantalla.

### Paso 5: Iniciar el Proyecto Completo
```bash
.\start_project.bat
```
Se abrirán dos ventanas:
- **Backend Django:** http://localhost:8000
- **Frontend React:** http://localhost:5173

---

## 🌐 ACCESO AL SISTEMA

Una vez iniciado el proyecto:

### Frontend (Usuario)
```
http://localhost:5173/hr/dashboard
```

**Páginas disponibles:**
- `/hr/dashboard` - Dashboard con KPIs
- `/hr/organigram` - Organigrama
- `/hr/leaves` - Solicitudes de permisos
- `/hr/contracts` - Contratos
- `/hr/onboarding` - Tareas de onboarding

### Backend (Admin)
```
http://localhost:8000/admin
```
Usa el usuario y contraseña del superusuario creado.

### API REST
```
http://localhost:8000/employees/api/
```

**Endpoints principales:**
- `/employees/api/empleados/` - Empleados
- `/employees/api/contratos/` - Contratos
- `/employees/api/solicitudes/` - Solicitudes de permisos
- `/employees/api/onboarding/` - Tareas de onboarding
- `/employees/api/dashboard/kpi/` - KPIs del dashboard
- `/employees/api/organigram/` - Estructura organizacional

---

## 📝 CREAR DATOS DE PRUEBA

### Desde el Admin de Django

1. Ve a http://localhost:8000/admin
2. Inicia sesión con el superusuario
3. Crea:
   - **Sucursales** (ej: "Oficina Central", "Sucursal Norte")
   - **Cargos** (ej: "Gerente General", "Desarrollador", "RRHH")
   - **Empleados** (asigna cargo y sucursal)
   - **Contratos** (vincula a empleados)
   - **Solicitudes de Permisos** (crea algunas pendientes)
   - **Tareas de Onboarding** (para nuevos empleados)

### Desde el Shell de Django

```bash
cd backend
python manage.py shell
```

```python
from employees.models import *
from datetime import date, timedelta
from django.utils import timezone

# Crear una sucursal
sucursal = Sucursal.objects.create(
    nombre="Oficina Central",
    direccion="Av. Principal 123",
    telefono="+1234567890"
)

# Crear un cargo
cargo = Cargo.objects.create(
    nombre="Desarrollador Senior",
    descripcion="Desarrollo de software"
)

# Crear un empleado
empleado = Empleado.objects.create(
    nombre="Juan",
    apellido="Pérez",
    email="juan.perez@empresa.com",
    telefono="+1234567890",
    fecha_contratacion=date.today(),
    cargo=cargo,
    sucursal=sucursal
)

# Crear una tarea de onboarding
OnboardingTask.objects.create(
    employee=empleado,
    title="Completar formularios de RRHH",
    due_date=timezone.now().date() + timedelta(days=7)
)

# Crear un contrato
Contract.objects.create(
    employee=empleado,
    contract_type="indefinido",
    start_date=date.today(),
    salary=50000.00,
    is_active=True
)

# Crear una solicitud de permiso
LeaveRequest.objects.create(
    employee=empleado,
    leave_type="vacaciones",
    start_date=date.today() + timedelta(days=30),
    end_date=date.today() + timedelta(days=37),
    reason="Vacaciones de verano",
    status="pending"
)

print("✅ Datos de prueba creados correctamente")
```

---

## 🔄 FLUJO DE TRABAJO TÍPICO

### 1. Dashboard
El gerente/RRHH revisa el dashboard para ver:
- Total de empleados
- Tasa de retención
- Solicitudes pendientes
- Contratos por vencer
- Cumpleaños del mes

### 2. Aprobación de Permisos
1. Empleado crea solicitud en la pestaña "Mis Solicitudes"
2. Manager/RRHH ve la solicitud en "Aprobaciones"
3. Aprueba o rechaza la solicitud
4. El estado se actualiza automáticamente

### 3. Gestión de Contratos
1. RRHH ve alertas de contratos por vencer (< 30 días)
2. Crea un nuevo contrato antes del vencimiento
3. El sistema marca automáticamente si está por vencer

### 4. Onboarding
1. RRHH crea tareas para un nuevo empleado
2. El empleado va completando las tareas
3. La barra de progreso se actualiza automáticamente
4. Se marcan tareas vencidas/urgentes con colores

---

## 🛠️ PERSONALIZACIÓN

### Cambiar colores del tema

Edita `frontend/tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',    // Indigo
        secondary: '#8B5CF6',  // Purple
        success: '#10B981',    // Green
        warning: '#F59E0B',    // Amber
        danger: '#EF4444',     // Red
      }
    }
  }
}
```

### Agregar nuevos tipos de permiso

Edita `backend/employees/models.py`:

```python
class LeaveRequest(TimeStampedModel):
    LEAVE_TYPES = [
        ('vacaciones', 'Vacaciones'),
        ('enfermedad', 'Enfermedad'),
        ('personal', 'Asunto Personal'),
        ('paternidad', 'Paternidad/Maternidad'),
        ('capacitacion', 'Capacitación'),  # NUEVO
        ('compensatorio', 'Día Compensatorio'),  # NUEVO
    ]
```

Luego ejecuta:
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

### Modificar KPIs del Dashboard

Edita `backend/employees/api_views.py` en la función `kpi_dashboard()`:

```python
@api_view(['GET'])
def kpi_dashboard(request):
    # Agregar nuevos KPIs aquí
    kpi_data = {
        # ... KPIs existentes ...
        'nuevo_kpi': calculo_personalizado(),
    }
    return Response(kpi_data)
```

---

## 🔒 PRODUCCIÓN

Para usar en producción:

### 1. Cambiar DEBUG a False

`backend/talent_track/settings.py`:
```python
DEBUG = False
ALLOWED_HOSTS = ['tudominio.com', 'www.tudominio.com']
```

### 2. Configurar permisos de API

```python
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}
```

### 3. Usar variables de entorno

Nunca hardcodees contraseñas. Usa `python-decouple`:

```python
from decouple import config

SECRET_KEY = config('SECRET_KEY')
DATABASE_PASSWORD = config('DB_PASSWORD')
```

### 4. HTTPS

Asegúrate de usar HTTPS en producción:
```python
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
```

### 5. Build del Frontend

```bash
cd frontend
npm run build
```

Los archivos estáticos estarán en `frontend/dist/`.

---

## 📊 REPORTES Y EXPORTACIÓN

Para agregar exportación a Excel/PDF, instala:

```bash
pip install openpyxl reportlab
```

Ejemplo de endpoint para exportar:

```python
from django.http import HttpResponse
import openpyxl

@api_view(['GET'])
def export_employees_excel(request):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Empleados"
    
    # Headers
    ws.append(['ID', 'Nombre', 'Email', 'Cargo', 'Sucursal'])
    
    # Data
    for emp in Empleado.objects.all():
        ws.append([
            emp.id,
            emp.get_nombre_completo(),
            emp.email,
            emp.cargo.nombre,
            emp.sucursal.nombre
        ])
    
    response = HttpResponse(
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = 'attachment; filename=empleados.xlsx'
    wb.save(response)
    return response
```

---

## 🚨 PROBLEMAS COMUNES

### Error: "Port 8000 is already in use"
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# O cambia el puerto
python manage.py runserver 8001
```

### Error: "Port 5173 is already in use"
Edita `frontend/vite.config.ts`:
```ts
export default defineConfig({
  server: {
    port: 3000  // Cambiar a otro puerto
  }
})
```

### Error: "Cannot find module 'recharts'"
```bash
cd frontend
npm install recharts react-organizational-chart lucide-react date-fns
```

### Error: CORS
Asegúrate de que `corsheaders` esté instalado y configurado en `settings.py`.

### Base de datos no conecta
Verifica que MySQL esté corriendo:
```bash
# Windows
net start MySQL
```

---

## 📞 AYUDA ADICIONAL

Si tienes problemas:

1. ✅ Ejecuta `.\verify_installation.bat`
2. 📖 Lee [GUIA_IMPLEMENTACION_HRMS.md](GUIA_IMPLEMENTACION_HRMS.md)
3. 📄 Consulta [README_HRMS.md](README_HRMS.md)
4. 🔍 Revisa los logs del servidor
5. 🌐 Usa DevTools del navegador (F12)

---

## ✅ ¡TODO LISTO!

Tu sistema HRMS está completamente configurado y listo para usar.

**Comandos principales:**
```bash
# Verificar instalación
.\verify_installation.bat

# Instalar dependencias
.\install_frontend_deps.bat
.\setup_backend_complete.bat

# Iniciar proyecto
.\start_project.bat
```

**URLs importantes:**
- Frontend: http://localhost:5173/hr/dashboard
- Backend Admin: http://localhost:8000/admin
- API: http://localhost:8000/employees/api/

---

**¡Disfruta tu nuevo sistema HRMS! 🎉**
