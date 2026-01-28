# 🚀 INICIO RÁPIDO - TALENT TRACK API HEADLESS

## ⚡ Instalación Express (5 minutos)

### **Requisitos Previos**
- ✅ Python 3.11+ instalado
- ✅ MySQL 8.0+ corriendo en localhost
- ✅ Node.js 18+ (para frontend)

---

## 🎯 SETUP AUTOMATIZADO (OPCIÓN 1 - RECOMENDADA)

### **Paso 1: Instalar Dependencias Python**

```powershell
cd backend
pip install -r requirements.txt
```

### **Paso 2: Ejecutar Script de Setup**

```powershell
python setup_project.py
```

El script te pedirá:
1. Credenciales MySQL (usuario/contraseña)
2. Si deseas crear superusuario (recomendado: SÍ)
3. Si deseas poblar datos de prueba (recomendado: SÍ)

**Automáticamente hará:**
- ✅ Crear base de datos `talent_track_db`
- ✅ Ejecutar migraciones Django
- ✅ Configurar archivo `.env`
- ✅ Crear superusuario (opcional)
- ✅ Poblar 14 empleados + 100+ registros (opcional)

### **Paso 3: Iniciar Servidor Django**

```powershell
python manage.py runserver
```

✅ API disponible en: `http://localhost:8000/api/`

### **Paso 4: Iniciar Frontend React (Nueva terminal)**

```powershell
cd ../frontend
npm install
npm run dev
```

✅ Frontend disponible en: `http://localhost:5173/`

---

## 🛠️ SETUP MANUAL (OPCIÓN 2)

Si prefieres control total:

```powershell
# 1. Crear base de datos MySQL
mysql -u root -p
CREATE DATABASE talent_track_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# 2. Crear archivo .env en backend/
# (copiar contenido de .env.example)

# 3. Instalar dependencias
cd backend
pip install -r requirements.txt

# 4. Ejecutar migraciones
python manage.py makemigrations
python manage.py migrate

# 5. Crear superusuario
python manage.py createsuperuser

# 6. Poblar datos de prueba
python populate_data.py

# 7. Iniciar servidor
python manage.py runserver
```

---

## 🔍 VERIFICAR INSTALACIÓN

### **1. Probar API REST**

Abre tu navegador y verifica estos endpoints:

| Endpoint | Descripción | Status Esperado |
|----------|-------------|-----------------|
| http://localhost:8000/api/employees/api/empleados/ | Lista de empleados | ✅ 200 OK |
| http://localhost:8000/api/attendance/marcar/ | Endpoint de marcación | ⚠️ 405 (POST only) |
| http://localhost:8000/admin/ | Panel admin Django | ✅ Login page |

### **2. Probar con cURL**

```powershell
# Listar empleados
curl http://localhost:8000/api/employees/api/empleados/

# Marcar asistencia (POST)
curl -X POST http://localhost:8000/api/attendance/marcar/ `
  -H "Content-Type: application/json" `
  -d "{\"tipo\":\"ENTRADA\",\"latitud\":4.6097,\"longitud\":-74.0817,\"empleado_id\":1}"
```

### **3. Acceder al Panel Admin**

1. Ir a: http://localhost:8000/admin/
2. Login con credenciales de superusuario
3. Verificar que existan:
   - ✅ Empleados
   - ✅ Cargos
   - ✅ Sucursales
   - ✅ Registros de Asistencia

### **4. Probar Frontend React**

1. Abrir: http://localhost:5173/
2. Navegar a "Asistencia" en el menú
3. Probar "Marcar Asistencia"
4. Verificar que se guarde en la base de datos

---

## 📊 DATOS DE PRUEBA POBLADOS

Si ejecutaste `populate_data.py`, tendrás:

### **Empleados (14)**
```
✓ 4 Desarrolladores (Junior, Mid, Senior, Lead)
✓ 2 Diseñadores (UX, UI)
✓ 2 Marketing (Manager, Coordinator)
✓ 2 Ventas (Sales Manager, Executive)
✓ 2 RRHH (HR Manager, Recruiter)
✓ 2 Finanzas (Financial Analyst, Accountant)
```

### **Sucursales (3)**
```
✓ Quito - Matriz
✓ Guayaquil - Sucursal
✓ Cuenca - Regional
```

### **Registros de Asistencia (100+)**
- Últimos 30 días
- Entradas y salidas
- Algunos con tardanzas
- Coordenadas GPS simuladas

### **Credenciales de Prueba**

| Usuario | Email | Contraseña |
|---------|-------|------------|
| Superusuario | (tu email) | (tu password) |
| Empleado 1 | juan.perez@company.com | - |
| Empleado 2 | maria.gonzalez@company.com | - |

---

## 🐛 TROUBLESHOOTING

### **Error: "Access denied for user 'root'@'localhost'"**

**Solución:**
```powershell
# Verificar que MySQL está corriendo
mysql --version

# Probar conexión
mysql -u root -p

# Si falla, revisar credenciales en .env
```

### **Error: "No module named 'rest_framework'"**

**Solución:**
```powershell
pip install djangorestframework djangorestframework-simplejwt
```

### **Error: "Port 8000 is already in use"**

**Solución:**
```powershell
# Verificar procesos en puerto 8000
netstat -ano | findstr :8000

# Matar proceso (reemplazar PID)
taskkill /PID <PID> /F

# O usar otro puerto
python manage.py runserver 8001
```

### **Error: "CORS policy blocked"**

**Verificar en `backend/talent_track/settings.py`:**
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # ← Debe estar configurado
    "http://127.0.0.1:5173",
]
```

### **Error: "django_filters not found"**

**Solución:**
```powershell
pip install django-filter
```

### **Frontend no conecta con Backend**

**Verificar en `frontend/src/services/api.ts`:**
```typescript
const api = axios.create({
  baseURL: 'http://localhost:8000/api',  // ← URL correcta
});
```

---

## 📚 DOCUMENTACIÓN COMPLETA

Para arquitectura detallada, endpoints y configuraciones avanzadas:

➡️ Ver: `ARQUITECTURA_HEADLESS.md`

---

## 🎨 ESTRUCTURA DE CARPETAS

```
Proyecto punto pymes/
├── backend/                     # Django API
│   ├── talent_track/            # Configuración
│   │   └── settings.py          # ✅ MySQL + CORS + DRF
│   ├── employees/               # App Empleados
│   │   ├── views.py             # ✅ ViewSets (API pura)
│   │   ├── serializers.py       # JSON serializers
│   │   └── urls.py              # Rutas API
│   ├── attendance/              # App Asistencia
│   │   ├── views.py             # ✅ APIView + ViewSets
│   │   └── urls.py              # Rutas API
│   ├── manage.py
│   ├── setup_project.py         # ✅ Script automatizado
│   └── populate_data.py         # Datos de prueba
│
├── frontend/                    # React + TypeScript
│   ├── src/
│   │   ├── pages/
│   │   │   ├── employees/       # Gestión empleados
│   │   │   └── attendance/      # ✅ Asistencia
│   │   ├── services/
│   │   │   ├── api.ts           # Cliente Axios
│   │   │   ├── employeeService.ts
│   │   │   └── attendanceService.ts  # ✅ API Asistencia
│   │   └── types/
│   └── package.json
│
└── README.md                    # Este archivo
```

---

## ✅ CHECKLIST DE VERIFICACIÓN

Después de la instalación, verifica:

- [ ] MySQL corriendo y base de datos creada
- [ ] Backend Django iniciado sin errores
- [ ] Frontend React iniciado sin errores
- [ ] API responde en http://localhost:8000/api/
- [ ] Panel admin accesible en http://localhost:8000/admin/
- [ ] Frontend carga en http://localhost:5173/
- [ ] CORS configurado correctamente (sin errores en consola)
- [ ] Datos de prueba poblados (14 empleados visible)
- [ ] Marcación de asistencia funciona desde frontend
- [ ] Excel de pre-nómina se descarga correctamente

---

## 🚀 PRÓXIMOS PASOS

Una vez verificado que todo funciona:

1. **Explorar API:** Revisar todos los endpoints en `ARQUITECTURA_HEADLESS.md`
2. **Personalizar Datos:** Crear tus propios empleados, sucursales y cargos
3. **Configurar Autenticación:** Implementar JWT (ver documentación)
4. **Deploy:** Preparar para producción (HTTPS, variables de entorno seguras)

---

## 📞 AYUDA

**Errores comunes y soluciones:** Ver sección TROUBLESHOOTING arriba

**Documentación adicional:**
- Django REST Framework: https://www.django-rest-framework.org/
- React: https://react.dev/
- MySQL: https://dev.mysql.com/doc/

---

**✅ ¡LISTO! Tu API Headless está funcionando.**

*Última actualización: Enero 2024*
