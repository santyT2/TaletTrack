# 🚀 Backend - HRMS Talent Track

## ✅ Estado de la Base de Datos

La base de datos está **completamente configurada y funcional** con los siguientes datos:

### 📊 Datos Actuales

- **Usuarios del sistema**: 2 (admin, testuser)
- **Sucursales**: 6
- **Cargos**: 9
- **Empleados**: 14 (13 activos, 1 inactivo)
- **Registros de Asistencia**: 101+ registros

### 🔧 Configuración

**Base de Datos**: MySQL 8.0.41
- **Host**: localhost
- **Puerto**: 3306
- **Nombre**: talent_track_db
- **Usuario**: root

### 🎯 Endpoints de la API

#### **Employees API**
- `GET /api/employees/api/empleados/` - Listar todos los empleados
- `POST /api/employees/api/empleados/` - Crear empleado
- `GET /api/employees/api/empleados/{id}/` - Obtener empleado
- `PUT /api/employees/api/empleados/{id}/` - Actualizar empleado
- `DELETE /api/employees/api/empleados/{id}/` - Eliminar empleado

- `GET /api/employees/api/sucursales/` - Listar sucursales
- `GET /api/employees/api/cargos/` - Listar cargos
- `GET /api/employees/api/contratos/` - Listar contratos
- `GET /api/employees/api/solicitudes/` - Listar solicitudes de permiso
- `GET /api/employees/api/onboarding/` - Tareas de onboarding

**Endpoints Especiales**:
- `GET /api/employees/api/dashboard/kpi/` - KPIs del dashboard
- `GET /api/employees/api/organigram/` - Organigrama de la empresa

#### **Attendance API**
- `POST /api/attendance/marcar/` - Marcar asistencia (entrada/salida)
- `GET /api/attendance/today/` - Asistencia del día actual
- `GET /api/attendance/exportar-excel/` - Exportar pre-nómina en Excel

### 🚀 Cómo Iniciar el Backend

#### Opción 1: Script Automatizado
```bash
cd backend
start_backend.bat
```

#### Opción 2: Manual
```bash
cd backend
python manage.py runserver
```

El servidor estará disponible en: **http://127.0.0.1:8000**

### 👤 Acceso al Panel de Administración

URL: **http://127.0.0.1:8000/admin**

**Credenciales**:
- Usuario: `admin`
- Contraseña: `admin123`

Desde el panel admin puedes:
- Gestionar empleados, cargos y sucursales
- Ver y editar registros de asistencia
- Administrar usuarios del sistema
- Ver contratos y solicitudes de permiso

### 📝 Scripts Útiles

#### Ver estado de la base de datos
```bash
python check_database.py
```

#### Poblar datos de prueba
```bash
python populate_complete.py
```

#### Crear superusuario
```bash
python create_superuser.py
```

### 🔄 Migraciones

Las migraciones ya están aplicadas. Si necesitas aplicarlas nuevamente:

```bash
python manage.py makemigrations
python manage.py migrate
```

### ⚙️ Configuración CORS

El backend está configurado para aceptar peticiones desde:
- `http://localhost:5173` (Vite dev server)
- `http://127.0.0.1:5173`

### 📦 Modelos de Datos

#### **Empleado**
- Nombres, apellidos, cédula
- Email, teléfono
- Cargo, sucursal
- Fecha de ingreso, fecha de nacimiento
- Estado (activo/inactivo/licencia/despedido)
- Foto de perfil (opcional)
- Reporta a (jerarquía)

#### **Sucursal**
- Nombre, dirección, ciudad
- Teléfono

#### **Cargo**
- Nombre, descripción
- Salario base
- Nivel requerido (junior/semior/senior/líder)

#### **RegistroAsistencia**
- Empleado
- Fecha y hora
- Tipo (entrada/salida)
- Latitud, longitud (geolocalización)
- Es tardanza (booleano)
- Minutos de atraso

#### **Contract**
- Empleado
- Tipo de contrato
- Fechas inicio/fin
- Salario
- Documento

#### **LeaveRequest**
- Empleado
- Tipo de permiso
- Fechas
- Razón, estado
- Adjunto

#### **OnboardingTask**
- Empleado
- Título de la tarea
- Completada (booleano)
- Fecha límite

### 🛠️ Troubleshooting

#### Si el servidor no inicia:
1. Verificar que MySQL esté corriendo
2. Verificar credenciales en `.env`
3. Ejecutar `python test_connection.py`

#### Si las APIs devuelven 404:
1. Verificar que el servidor esté corriendo
2. Verificar las URLs en `talent_track/urls.py`
3. Probar con: `curl http://127.0.0.1:8000/api/employees/api/empleados/`

#### Si falta algún paquete:
```bash
pip install -r requirements.txt
```

### ✅ Sistema Listo para Usar

El backend está **completamente funcional** y listo para ser usado por el frontend React. Todas las APIs están disponibles y probadas.
