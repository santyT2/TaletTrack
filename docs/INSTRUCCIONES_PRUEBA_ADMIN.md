# 🧪 INSTRUCCIONES DE PRUEBA - Núcleo Corporativo

## 📋 CHECKLIST DE VERIFICACIÓN

Sigue estos pasos para verificar que todo funcione correctamente:

---

## PASO 1: Preparar el Entorno

### 1.1 Verificar que las migraciones se aplicaron
```bash
cd backend
python manage.py showmigrations core
```

Deberías ver:
```
core
 [X] 0001_initial
 [X] 0002_...
 [X] 0006_empresa_email_contacto_empresa_logo_and_more  ← NUEVA
```

Si no está aplicada:
```bash
python manage.py migrate core
```

### 1.2 Iniciar el Backend
```bash
cd backend
python manage.py runserver
```

Verifica que no haya errores en la consola.

### 1.3 Iniciar el Frontend
```bash
cd frontend
npm run dev
```

Verifica que compile sin errores.

---

## PASO 2: Pruebas de Backend (Django)

### 2.1 Verificar Admin de Django
1. Abrir: http://localhost:8000/admin/
2. Login con superusuario
3. Buscar "Empresas" y "Usuarios" en el panel
4. ✅ Ambos deben estar visibles

### 2.2 Probar API de Empresa (con Postman o cURL)

#### Login:
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Copiar el `access` token de la respuesta.

#### Ver Empresa:
```bash
curl http://localhost:8000/api/empresa/ \
  -H "Authorization: Bearer <TU_TOKEN_AQUI>"
```

**Resultado esperado:**
- Status 200 si ya existe una empresa
- Status 404 si no hay empresa creada
- Si 404, crear una desde el admin de Django

### 2.3 Probar API de Usuarios

#### Listar Usuarios:
```bash
curl http://localhost:8000/api/usuarios/ \
  -H "Authorization: Bearer <TU_TOKEN_AQUI>"
```

**Resultado esperado:**
- Array con lista de usuarios
- Cada usuario debe tener: id, username, email, role, is_active, empleado_nombre

#### Filtrar por Rol:
```bash
curl http://localhost:8000/api/usuarios/?role=SUPERADMIN \
  -H "Authorization: Bearer <TU_TOKEN_AQUI>"
```

**Resultado esperado:**
- Solo usuarios con rol SUPERADMIN

---

## PASO 3: Pruebas de Frontend (React)

### 3.1 Login
1. Abrir: http://localhost:5173/login
2. Usar credenciales: admin / admin123
3. ✅ Debe redirigir al dashboard o módulo de empleados

### 3.2 Acceder al Módulo de Empresa
1. En la navegación, click en **"Empresa"**
2. URL debería ser: http://localhost:5173/admin/company

**Verificaciones:**
- ✅ Se carga la página sin errores
- ✅ Si hay empresa, se muestra el logo y datos
- ✅ Si no hay empresa, se muestra mensaje de error
- ✅ Botón "Editar Información" visible

### 3.3 Editar Empresa
1. Click en **"Editar Información"**
2. ✅ Formulario debe aparecer con todos los campos
3. Modificar cualquier campo (ej: Nombre Comercial)
4. Subir un logo (opcional)
5. Click en **"Guardar Cambios"**

**Resultado esperado:**
- ✅ Mensaje de éxito en verde
- ✅ Vista vuelve a modo lectura
- ✅ Cambios se reflejan en la vista
- ✅ Si subiste logo, debe verse la imagen

### 3.4 Validaciones de Empresa
1. Editar empresa
2. Borrar el RUC
3. Click en Guardar

**Resultado esperado:**
- ❌ Error: "La Razón Social y el RUC son obligatorios"

4. Poner RUC con solo 5 caracteres
5. Click en Guardar

**Resultado esperado:**
- ❌ Error: "El RUC debe tener al menos 10 caracteres"

### 3.5 Acceder al Módulo de Usuarios
1. En la navegación, click en **"Usuarios"**
2. URL debería ser: http://localhost:5173/admin/users

**Verificaciones:**
- ✅ Se carga tabla con usuarios
- ✅ Cada usuario tiene avatar, email, rol y estado
- ✅ Badges de colores por rol (Rojo, Azul, Verde)
- ✅ Último acceso se muestra correctamente

### 3.6 Buscar Usuarios
1. En la barra de búsqueda, escribir: "admin"
2. ✅ La tabla se filtra en tiempo real
3. Borrar búsqueda
4. ✅ Vuelve a mostrar todos los usuarios

### 3.7 Filtrar por Rol
1. En el dropdown "Todos los Roles", seleccionar "Super Admin"
2. ✅ Solo se muestran usuarios SUPERADMIN
3. Seleccionar "Admin RRHH"
4. ✅ Solo se muestran usuarios ADMIN_RRHH

### 3.8 Filtrar por Estado
1. En el dropdown "Todos los Estados", seleccionar "Activos"
2. ✅ Solo usuarios activos
3. Seleccionar "Bloqueados"
4. ✅ Solo usuarios bloqueados

### 3.9 Editar Usuario
1. Click en el ícono de **lápiz** de cualquier usuario
2. ✅ Modal de edición aparece
3. Cambiar el rol a otro (ej: de EMPLOYEE a MANAGER)
4. Click en **"Guardar Cambios"**

**Resultado esperado:**
- ✅ Modal se cierra
- ✅ Mensaje de éxito
- ✅ Badge de rol se actualiza en la tabla

### 3.10 Activar/Desactivar Usuario
1. Click en el badge de estado (Activo/Bloqueado) de un usuario
2. ✅ Estado cambia inmediatamente
3. ✅ Mensaje de éxito aparece
4. Click nuevamente
5. ✅ Vuelve al estado anterior

### 3.11 Resetear Contraseña (Solo SUPERADMIN)
1. Asegúrate de estar logueado como SUPERADMIN
2. Click en el ícono de **llave** de un usuario
3. ✅ Modal de reseteo aparece
4. Ingresar nueva contraseña: "Test123"
5. Click en **"Resetear Contraseña"**

**Resultado esperado:**
- ✅ Mensaje de éxito
- ✅ Modal se cierra
- ✅ La contraseña del usuario fue cambiada

**Prueba adicional:**
- Cerrar sesión
- Intentar login con ese usuario y la nueva contraseña
- ✅ Debe pedir cambio de contraseña

---

## PASO 4: Pruebas de Permisos

### 4.1 Crear Usuario de Prueba (EMPLOYEE)
1. Desde admin de Django, crear usuario: `empleado_test` / `Pass123`
2. Asignar rol: EMPLOYEE
3. No vincular a ningún empleado

### 4.2 Login como EMPLOYEE
1. Cerrar sesión del admin
2. Login con: empleado_test / Pass123
3. Intentar acceder a: http://localhost:5173/admin/users

**Resultado esperado:**
- ✅ Solo debe ver su propio perfil en la lista
- ✅ No debe ver otros usuarios

### 4.3 Intentar Editar (como EMPLOYEE)
1. Como empleado_test
2. Ir a Admin → Empresa
3. ✅ NO debe ver botón "Editar Información"
4. Ir a Admin → Usuarios
5. ✅ Solo debe verse a sí mismo

### 4.4 Login como ADMIN_RRHH
1. Crear usuario RRHH: `rrhh_test` / `Pass123`
2. Asignar rol: ADMIN_RRHH
3. Login con ese usuario

**Verificaciones:**
- ✅ Puede editar empresa
- ✅ Puede ver todos los usuarios excepto SUPERADMIN
- ✅ Puede editar usuarios EMPLOYEE y MANAGER
- ❌ NO puede editar usuarios SUPERADMIN
- ❌ NO aparece el ícono de llave (resetear password)

---

## PASO 5: Pruebas de Integración

### 5.1 Flujo Completo: Nuevo Empleado con Usuario
1. Como SUPERADMIN, ir a Empleados
2. Crear nuevo empleado: "Juan Pérez"
3. Ir a Usuarios
4. Buscar si existe usuario para ese empleado
5. Si no existe, ir al admin de Django y crear usuario
6. Vincular usuario con el empleado
7. Volver a Usuarios en frontend
8. ✅ Debe aparecer "Juan Pérez" en la columna "Empleado Vinculado"

### 5.2 Logo en Contratos
1. Subir logo de empresa
2. Ir a módulo de Empleados
3. Generar un contrato
4. ✅ El logo debe aparecer en el contrato generado

---

## PASO 6: Verificación Automática

### Script de Verificación
```bash
cd backend
python test_admin_implementation.py
```

**Resultado esperado:**
```
✅ Servidor Django respondiendo
✅ Login y obtención de token
✅ GET /api/empresa/ - Obtener datos de empresa
✅ PATCH /api/empresa/1/ - Actualización parcial
✅ GET /api/usuarios/ - Listar usuarios (X encontrados)
✅ GET /api/usuarios/?role=SUPERADMIN - Filtro por rol
✅ GET /api/usuarios/{id}/ - Detalle de usuario

🎉 ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!
```

---

## ❌ PROBLEMAS COMUNES

### Error: "No hay empresa configurada"
**Solución:**
```bash
cd backend
python manage.py shell
```

```python
from core.models import Empresa
e = Empresa.objects.create(
    razon_social="Mi Empresa S.A.",
    ruc="1234567890001",
    pais="EC",
    moneda="USD"
)
```

### Error: CORS en API
**Solución:** Verificar que en `settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]
```

### Error: Token inválido
**Solución:** Verificar que el token JWT esté configurado correctamente.

### Error: Permiso denegado
**Solución:** Verificar que el usuario tenga el rol correcto.

---

## ✅ CHECKLIST FINAL

- [ ] Migraciones aplicadas correctamente
- [ ] Backend corriendo sin errores
- [ ] Frontend compilando sin errores
- [ ] Empresa se puede ver y editar
- [ ] Logo se puede subir y visualizar
- [ ] Usuarios se pueden listar
- [ ] Búsqueda de usuarios funciona
- [ ] Filtros por rol y estado funcionan
- [ ] Edición de roles funciona
- [ ] Activar/Desactivar funciona
- [ ] Reseteo de contraseña funciona (SUPERADMIN)
- [ ] Permisos según roles funcionan
- [ ] Script de verificación pasa todas las pruebas

---

## 🎉 ¡TODO LISTO!

Si todas las pruebas pasan, la implementación está completa y funcional.

**Próximos pasos:**
1. Configurar empresa con datos reales
2. Asignar roles correctos a usuarios existentes
3. Vincular usuarios con empleados
4. Capacitar a usuarios sobre el nuevo módulo

---

**Documentación:**
- Técnica: `docs/IMPLEMENTACION_ADMIN_CORPORATIVO.md`
- Guía de Usuario: `docs/GUIA_RAPIDA_ADMIN.md`
