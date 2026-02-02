# 🚀 Guía Rápida: Núcleo Corporativo y Control de Accesos

## ⚡ Inicio Rápido

### 1. Iniciar el Backend
```bash
cd backend
python manage.py runserver
```

### 2. Iniciar el Frontend
```bash
cd frontend
npm run dev
```

### 3. Acceder al Sistema
```
URL: http://localhost:5173/login
Usuario: admin
Password: admin123
```

---

## 📋 MÓDULO DE EMPRESA

### Acceso
```
Navegación: Admin → Empresa
URL: http://localhost:5173/admin/company
API: http://localhost:8000/api/empresa/
```

### Funcionalidades Disponibles

#### ✅ Ver Perfil Corporativo
- Logo de la empresa
- Razón Social y Nombre Comercial
- RUC/NIT y Representante Legal
- Dirección Fiscal completa
- Datos de contacto (Teléfono, Email, Web)
- Configuración regional (País, Moneda)

#### ✅ Editar Información
1. Click en **"Editar Información"**
2. Modificar los campos deseados
3. Subir logo (opcional):
   - Formatos: PNG, JPG
   - Tamaño máximo: 2MB
4. Click en **"Guardar Cambios"**

#### 📝 Campos Obligatorios
- ✅ Razón Social
- ✅ RUC/NIT (mínimo 10 caracteres)

#### 🔍 Validaciones
- RUC debe tener al menos 10 caracteres
- Email debe ser válido
- URL de sitio web debe ser válida
- Logo debe ser imagen válida

---

## 👥 MÓDULO DE USUARIOS

### Acceso
```
Navegación: Admin → Usuarios
URL: http://localhost:5173/admin/users
API: http://localhost:8000/api/usuarios/
```

### Funcionalidades Disponibles

#### ✅ Visualizar Usuarios
- Tabla completa de usuarios del sistema
- Avatar generado automáticamente
- Email y empleado vinculado
- Badge de rol con colores:
  - 🔴 Rojo: Super Admin
  - 🔵 Azul: Admin RRHH
  - 🟣 Morado: Manager
  - 🟢 Verde: Empleado
- Estado activo/bloqueado
- Último acceso al sistema

#### ✅ Buscar y Filtrar
1. **Búsqueda por texto:**
   - Busca en: Usuario, Email, Nombre del empleado
   - Búsqueda en tiempo real

2. **Filtro por Rol:**
   - Super Admin
   - Admin RRHH
   - Manager
   - Empleado

3. **Filtro por Estado:**
   - Activos
   - Bloqueados

#### ✅ Editar Usuario
1. Click en el ícono de **lápiz** (Editar)
2. Modificar:
   - Rol del sistema
   - Estado de la cuenta (Activo/Bloqueado)
3. Click en **"Guardar Cambios"**

#### ✅ Activar/Desactivar Usuario
- Click en el badge de **Estado** (Activo/Bloqueado)
- El usuario se activa o desactiva instantáneamente
- Los usuarios bloqueados no pueden acceder al sistema

#### ✅ Resetear Contraseña (Solo SUPERADMIN)
1. Click en el ícono de **llave** (Resetear Contraseña)
2. Ingresar nueva contraseña (mínimo 6 caracteres)
3. Click en **"Resetear Contraseña"**
4. El usuario deberá cambiar la contraseña en el primer login

---

## 🔐 ROLES Y PERMISOS

### SUPERADMIN
- ✅ Acceso completo al sistema
- ✅ Gestionar todos los usuarios (incluidos otros SUPERADMIN)
- ✅ Resetear contraseñas
- ✅ Editar datos de la empresa
- ✅ Gestionar empleados, sucursales y cargos

### ADMIN_RRHH
- ✅ Gestionar empleados y datos de RRHH
- ✅ Gestionar usuarios (excepto SUPERADMIN)
- ✅ Editar datos de la empresa
- ⛔ No puede gestionar otros ADMIN_RRHH
- ⛔ No puede resetear contraseñas

### MANAGER
- ✅ Ver su equipo y subordinados
- ✅ Ver perfil de la empresa (solo lectura)
- ⛔ No puede gestionar usuarios
- ⛔ No puede editar empresa

### EMPLOYEE
- ✅ Ver su propio perfil
- ⛔ No puede ver otros empleados
- ⛔ Sin acceso a administración

---

## 📊 CASOS DE USO COMUNES

### Caso 1: Configurar Empresa por Primera Vez
```
1. Login como SUPERADMIN
2. Ir a Admin → Empresa
3. Click en "Editar Información"
4. Completar todos los campos:
   - Razón Social
   - RUC (mínimo 10 caracteres)
   - Dirección, Teléfono, Email
   - País y Moneda
5. Subir logo corporativo
6. Guardar Cambios
```

### Caso 2: Dar Acceso a un Nuevo Usuario RRHH
```
1. Login como SUPERADMIN
2. Ir a Admin → Usuarios
3. Buscar el usuario creado
4. Click en "Editar"
5. Cambiar Rol a "Admin RRHH"
6. Asegurar que esté "Activo"
7. Guardar Cambios
```

### Caso 3: Bloquear Acceso de un Usuario
```
1. Ir a Admin → Usuarios
2. Buscar el usuario
3. Click en el badge de "Activo"
4. El estado cambia a "Bloqueado"
5. El usuario no podrá acceder al sistema
```

### Caso 4: Resetear Contraseña de Usuario
```
1. Login como SUPERADMIN
2. Ir a Admin → Usuarios
3. Click en el ícono de llave del usuario
4. Ingresar nueva contraseña (ej: Temporal123)
5. Resetear Contraseña
6. Informar al usuario su nueva contraseña temporal
7. El usuario deberá cambiarla al hacer login
```

### Caso 5: Buscar Usuarios por Empleado
```
1. Ir a Admin → Usuarios
2. En la barra de búsqueda, escribir el nombre del empleado
3. La tabla se filtra automáticamente
4. Ver qué cuenta de usuario está vinculada al empleado
```

---

## 🔧 API REST ENDPOINTS

### Empresa

#### Obtener Empresa
```bash
GET /api/empresa/
Authorization: Bearer <token>

Response:
{
  "id": 1,
  "razon_social": "Mi Empresa S.A.",
  "nombre_comercial": "Mi Empresa",
  "ruc": "1234567890001",
  "direccion_fiscal": "Av. Principal 123",
  "telefono_contacto": "+593999999999",
  "email_contacto": "info@miempresa.com",
  "sitio_web": "https://www.miempresa.com",
  "pais": "EC",
  "moneda": "USD",
  "logo": "/media/empresas/logos/logo.png",
  "estado": "activo"
}
```

#### Actualizar Empresa
```bash
PUT /api/empresa/1/
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData:
  razon_social: "Nueva Razón Social"
  ruc: "1234567890001"
  logo: [archivo de imagen]
  ...
```

### Usuarios

#### Listar Usuarios
```bash
GET /api/usuarios/
Authorization: Bearer <token>

# Con filtros:
GET /api/usuarios/?role=SUPERADMIN
GET /api/usuarios/?is_active=true
GET /api/usuarios/?search=juan
```

#### Ver Usuario
```bash
GET /api/usuarios/1/
Authorization: Bearer <token>
```

#### Actualizar Usuario
```bash
PATCH /api/usuarios/1/
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "ADMIN_RRHH",
  "is_active": true
}
```

#### Activar/Desactivar Usuario
```bash
POST /api/usuarios/1/toggle_active/
Authorization: Bearer <token>
```

#### Resetear Contraseña (Solo SUPERADMIN)
```bash
POST /api/usuarios/1/reset_password/
Authorization: Bearer <token>
Content-Type: application/json

{
  "new_password": "Temporal123"
}
```

---

## ⚠️ TROUBLESHOOTING

### Problema: No veo el botón "Editar Información"
**Solución:** Verifica que tu usuario tenga rol SUPERADMIN o ADMIN_RRHH.

### Problema: Error al subir logo
**Solución:** 
- Verifica que el archivo sea PNG o JPG
- Tamaño máximo 2MB
- Verifica que el directorio media/ tenga permisos de escritura

### Problema: No puedo resetear contraseña
**Solución:** Solo usuarios con rol SUPERADMIN pueden resetear contraseñas.

### Problema: Usuario bloqueado no puede desbloquear su cuenta
**Solución:** Solo un SUPERADMIN o ADMIN_RRHH puede reactivar cuentas bloqueadas.

### Problema: Validación de RUC falla
**Solución:** El RUC debe tener mínimo 10 caracteres. Ajusta el formato.

---

## ✅ VERIFICACIÓN DEL SISTEMA

### Script de Verificación Automática
```bash
cd backend
python test_admin_implementation.py
```

Este script verifica:
- ✅ Servidor Django corriendo
- ✅ Autenticación funcional
- ✅ Endpoints de Empresa operativos
- ✅ Endpoints de Usuarios operativos
- ✅ Filtros y búsquedas funcionando

---

## 📚 DOCUMENTACIÓN ADICIONAL

- **Documento Técnico:** `docs/IMPLEMENTACION_ADMIN_CORPORATIVO.md`
- **Modelos Backend:** `backend/core/models.py`
- **APIs:** `backend/core/views.py` y `backend/core/serializers.py`
- **Servicios Frontend:** `frontend/src/core/services/adminService.ts`

---

**¿Necesitas ayuda?** Revisa la documentación técnica completa o contacta al equipo de desarrollo.
