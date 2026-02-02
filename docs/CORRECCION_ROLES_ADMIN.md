# 🔧 CORRECCIÓN: Roles y Rutas del Sistema

## ❌ PROBLEMAS IDENTIFICADOS

1. **Incompatibilidad de Roles**: El frontend usaba roles antiguos (`ADMIN`, `MANAGER`) mientras el backend usa roles nuevos (`SUPERADMIN`, `ADMIN_RRHH`, `MANAGER`, `EMPLOYEE`)

2. **BaseURL Incorrecto**: El servicio `adminService.ts` usaba la instancia `api.ts` con baseURL `/api/employees/api`, pero los endpoints de admin están en `/api/empresa/` y `/api/usuarios/`

3. **Restricción de Acceso**: Las rutas de admin solo permitían roles `ADMIN` y `MANAGER`, bloqueando a `SUPERADMIN` y `ADMIN_RRHH`

---

## ✅ CORRECCIONES APLICADAS

### 1. AuthContext.tsx
**Cambio**: Actualizar tipos de roles
```typescript
// ANTES:
export type UserRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

// DESPUÉS:
export type UserRole = 'SUPERADMIN' | 'ADMIN_RRHH' | 'MANAGER' | 'EMPLOYEE';
```

### 2. App.tsx
**Cambio**: Actualizar roles permitidos para acceso a admin
```typescript
// ANTES:
<Route element={<RequireRole allowed={["ADMIN", "MANAGER"]} />}>

// DESPUÉS:
<Route element={<RequireRole allowed={["SUPERADMIN", "ADMIN_RRHH", "MANAGER"]} />}>
```

### 3. LoginPage.tsx
**Cambio**: Mapeo correcto de roles del backend
```typescript
// ANTES: Lógica simple que mapeaba a ADMIN o EMPLOYEE
const isAdminRole = selectedRole === 'ADMIN' || ['SUPERADMIN', 'GERENTE_SUCURSAL', 'RRHH', 'ADMIN'].includes(backendRole);
const effectiveRole = isAdminRole ? 'ADMIN' : 'EMPLOYEE';

// DESPUÉS: Mapeo específico para cada rol
let effectiveRole: 'SUPERADMIN' | 'ADMIN_RRHH' | 'MANAGER' | 'EMPLOYEE';

if (['SUPERADMIN'].includes(backendRole)) {
  effectiveRole = 'SUPERADMIN';
} else if (['ADMIN_RRHH', 'RRHH'].includes(backendRole)) {
  effectiveRole = 'ADMIN_RRHH';
} else if (['MANAGER', 'GERENTE_SUCURSAL'].includes(backendRole)) {
  effectiveRole = 'MANAGER';
} else {
  effectiveRole = 'EMPLOYEE';
}
```

### 4. adminService.ts
**Cambio**: Crear instancia de axios independiente con baseURL correcto
```typescript
// ANTES:
import api from './api'; // Usaba baseURL incorrecto

// DESPUÉS:
const adminApi = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Y actualizar todas las llamadas a usar adminApi en lugar de api
```

---

## 🧪 CÓMO PROBAR LOS CAMBIOS

### 1. Cerrar sesión si estás logueado
```
localStorage.clear()
```
En la consola del navegador, o simplemente cerrar sesión.

### 2. Reiniciar el frontend
```bash
# Detener el servidor (Ctrl+C)
# Volver a iniciar
npm run dev
```

### 3. Login con usuario SUPERADMIN
```
Usuario: admin
Password: admin123
```

### 4. Verificar acceso a módulos de admin
- ✅ Deberías poder acceder a: http://localhost:5173/admin/company
- ✅ Deberías poder acceder a: http://localhost:5173/admin/users
- ✅ Las páginas deben cargar datos correctamente

### 5. Verificar carga de datos
**En /admin/company:**
- Debe mostrar datos de la empresa o mensaje "No hay empresa configurada"
- No debe haber errores de red 404

**En /admin/users:**
- Debe mostrar tabla con usuarios
- No debe haber errores de red 404

---

## 🔍 VERIFICACIÓN DE ERRORES

### Si aún no carga:

1. **Revisar consola del navegador** (F12)
   - Buscar errores de red (Network tab)
   - Verificar que las llamadas vayan a:
     - `http://localhost:8000/api/empresa/`
     - `http://localhost:8000/api/usuarios/`

2. **Verificar token de autenticación**
   ```javascript
   // En la consola del navegador:
   localStorage.getItem('access_token')
   ```
   - Debe devolver un token JWT válido
   - Si es null, hacer logout y login nuevamente

3. **Verificar backend corriendo**
   ```bash
   # En la terminal del backend:
   python manage.py runserver
   ```
   - Debe estar corriendo sin errores
   - Acceder a: http://localhost:8000/admin/

4. **Verificar CORS**
   - El backend debe tener CORS configurado para `http://localhost:5173`
   - Revisar en `backend/talent_track/settings.py`:
   ```python
   CORS_ALLOWED_ORIGINS = [
       "http://localhost:5173",
   ]
   ```

---

## 📊 MAPEO COMPLETO DE ROLES

| Backend (Django) | Frontend (React) | Acceso a Admin |
|------------------|------------------|----------------|
| SUPERADMIN       | SUPERADMIN       | ✅ Completo     |
| ADMIN_RRHH       | ADMIN_RRHH       | ✅ Completo     |
| RRHH             | ADMIN_RRHH       | ✅ Completo     |
| MANAGER          | MANAGER          | ✅ Lectura      |
| GERENTE_SUCURSAL | MANAGER          | ✅ Lectura      |
| EMPLOYEE         | EMPLOYEE         | ⛔ Sin acceso   |

---

## ✅ ARCHIVOS MODIFICADOS

```
✓ frontend/src/core/auth/AuthContext.tsx       (Tipos de roles actualizados)
✓ frontend/src/App.tsx                         (Permisos de rutas actualizados)
✓ frontend/src/core/auth/LoginPage.tsx         (Mapeo de roles corregido)
✓ frontend/src/core/services/adminService.ts   (BaseURL e instancia corregidos)
```

---

## 🎯 RESULTADO ESPERADO

Después de aplicar estos cambios:

1. ✅ Los usuarios con rol SUPERADMIN pueden acceder a /admin/company y /admin/users
2. ✅ Los usuarios con rol ADMIN_RRHH pueden acceder a /admin/company y /admin/users
3. ✅ Los usuarios con rol MANAGER pueden acceder (con permisos de lectura)
4. ✅ Los endpoints se llaman correctamente (sin 404)
5. ✅ Los datos se cargan y muestran correctamente

---

**ESTADO: ✅ CORRECCIONES APLICADAS**

Reinicia el frontend y prueba el acceso a las páginas de admin. Deben cargarse correctamente ahora.
