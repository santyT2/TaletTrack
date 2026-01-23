# ✅ VERIFICACIÓN PASO A PASO

## 🎯 Objetivo
Verificar que el proyecto se organizó correctamente y todas las nuevas funcionalidades funcionan.

---

## 📋 Paso 1: Iniciar el Proyecto

### 1.1 Abre una terminal en la carpeta raíz

```bash
# Deberías estar en: c:\Users\toled\OneDrive\Escritorio\Proyecto punto pymes
```

### 1.2 Ejecuta el comando para iniciar

```bash
.\start_project.bat
```

### 1.3 Espera a que ambos servidores estén listos

Deberías ver algo así:

```
✅ Frontend: Listening on http://localhost:5173
✅ Backend: Running on http://localhost:8000
```

---

## 🌐 Paso 2: Verificar Frontend Carga

### 2.1 Abre navegador en: http://localhost:5173

### 2.2 Deberías ver:
- Logo "HRMS" en la esquina superior izquierda
- Dos botones arriba a la derecha: "RRHH" (azul) y "Administración" (azul)
- Estilo moderno con Tailwind CSS

### 2.3 Si no ves nada:
```bash
# Presiona Ctrl+Shift+R para refrescar el caché
# O abre DevTools (F12) y mira la consola para errores
```

---

## 🏢 Paso 3: Probar Módulo RRHH (Existente)

### 3.1 Click en botón "RRHH"

Deberías ver:
- Dashboard con KPIs
- 4 tarjetas de información
- Gráficos de barras

### 3.2 Navega entre las páginas

Click en los links del lado izquierdo:
- ✅ Dashboard - debe mostrar KPIs
- ✅ Organigrama - debe mostrar estructura
- ✅ Permisos - debe mostrar solicitudes
- ✅ Contratos - debe mostrar contratos
- ✅ Onboarding - debe mostrar tareas

### 3.3 Si todo funciona

✅ El módulo HR está ok

---

## 👥 Paso 4: Probar Módulo ADMIN - Empleados (NUEVO!)

### 4.1 Click en botón "Administración"

Deberías ver:
- Navbar oscuro en la parte superior del módulo
- Tres opción en la navbar: "Empleados", "Cargos", "Sucursales"
- Primera opción "Empleados" debe estar activa
- Una tabla mostrando los empleados existentes

### 4.2 Tabla de Empleados

Debe mostrar columnas:
- Nombre
- Email
- Cargo
- Sucursal
- Acciones (botones Editar y Eliminar)

### 4.3 Probar Búsqueda

En el cuadro de texto "Buscar empleado...":
1. Escribe el nombre de un empleado
2. La tabla debe filtrar en tiempo real

Ejemplo: Si escribes "Juan", debe mostrar solo empleados con "Juan" en el nombre

### 4.4 Crear un Nuevo Empleado

1. Click en botón azul "Nuevo Empleado"
2. Aparece modal con formulario
3. Campos:
   - Nombre (requerido)
   - Email (requerido)
   - Cargo (dropdown)
   - Sucursal (dropdown)
   - Contraseña (generada automáticamente)
4. Click "Crear"
5. Deberías ver:
   - Mensaje verde: "Empleado creado correctamente"
   - Nuevo empleado en la tabla

### 4.5 Editar un Empleado

1. En la tabla, click botón "Editar" en algún empleado
2. Modal se abre con datos precargados
3. Modifica algún campo (ej: nombre)
4. Click "Actualizar"
5. Deberías ver:
   - Mensaje verde: "Empleado actualizado correctamente"
   - Tabla actualizada con los cambios

### 4.6 Eliminar un Empleado

1. En la tabla, click botón "Eliminar" en algún empleado
2. Aparece confirmación: "¿Estás seguro?"
3. Click "Sí, eliminar"
4. Deberías ver:
   - Mensaje verde: "Empleado eliminado correctamente"
   - Empleado desaparece de la tabla

---

## 📋 Paso 5: Probar Módulo ADMIN - Cargos (NUEVO!)

### 5.1 Click en "Cargos" en la navbar oscura

Deberías ver:
- Disposición en grid (no tabla, sino tarjetas)
- Tarjetas azules mostrando los cargos existentes

### 5.2 Estructura de cada tarjeta

- Nombre del cargo
- Nivel (Junior, Pleno, Senior, Líder, Gerente)
- Descripción
- Botones: Editar y Eliminar

### 5.3 Probar CRUD

1. **Crear**: Click "Nuevo Cargo"
   - Completa: Nombre, Nivel, Descripción
   - Click "Crear"
   - Nueva tarjeta aparece

2. **Editar**: Click "Editar" en cualquier tarjeta
   - Modifica datos
   - Click "Actualizar"
   - Tarjeta se actualiza

3. **Eliminar**: Click "Eliminar"
   - Confirma eliminación
   - Tarjeta desaparece

---

## 🏪 Paso 6: Probar Módulo ADMIN - Sucursales (NUEVO!)

### 6.1 Click en "Sucursales" en la navbar oscura

Deberías ver:
- Disposición en tarjetas (cards)
- Cada tarjeta con icono de ubicación 📍
- Tarjetas con borde verde

### 6.2 Estructura de cada tarjeta

- Nombre de la sucursal
- Icono de teléfono + número (clickeable)
- Dirección
- Ciudad
- Botones: Editar y Eliminar

### 6.3 Probar CRUD

1. **Crear**: Click "Nueva Sucursal"
   - Completa: Nombre, Dirección, Ciudad, Teléfono
   - Click "Crear"
   - Nueva tarjeta aparece

2. **Editar**: Click "Editar" en cualquier tarjeta
   - Modifica datos
   - Click "Actualizar"
   - Tarjeta se actualiza

3. **Eliminar**: Click "Eliminar"
   - Confirma eliminación
   - Tarjeta desaparece

---

## 🔄 Paso 7: Navegar entre Módulos

### 7.1 Desde Admin, vuelve a RRHH

Click en botón "RRHH" en la navbar superior

Deberías ver:
- Dashboard del módulo HR
- Navbar izquierda con las 5 páginas

### 7.2 Desde RRHH, vuelve a Admin

Click en botón "Administración" en la navbar superior

Deberías ver:
- Navbar oscura del módulo Admin
- Página de Empleados

### 7.3 Deberías poder navegar entre módulos sin errores

✅ Si funciona = arquitectura Ok

---

## 🐛 Paso 8: Verificar que no hay Errores

### 8.1 Abre las DevTools

Presiona **F12** en el navegador

### 8.2 Ve a la pestaña "Console"

Deberías ver:
- Posibles warnings (amarillo)
- Pero **NO** errores rojos

### 8.3 Si hay errores rojos:

Toma nota del mensaje exacto y reporta

---

## 📊 Paso 9: Verificar Backend (Opcional)

### 9.1 Abre: http://localhost:8000/admin

Ingresa credenciales (superusuario)

### 9.2 Verifica que ves:

- Employees
- Cargos
- Sucursales

Esto confirma que backend está funcionando

### 9.3 Prueba en la API

Abre: http://localhost:8000/employees/api/empleados/

Deberías ver JSON con lista de empleados

---

## 🎯 Paso 10: Resumen de Verificación

### Lo que debería funcionar:

| Componente | Estado | Acción |
|-----------|--------|--------|
| Frontend carga | ✅ | Si ves logo y botones |
| Módulo RRHH | ✅ | Si ves dashboard y navega |
| Admin Empleados | ✅ | Si tabla carga y CRUD funciona |
| Admin Cargos | ✅ | Si grid carga y CRUD funciona |
| Admin Sucursales | ✅ | Si tarjetas carga y CRUD funciona |
| Navegación | ✅ | Si puedes ir entre módulos |
| Búsqueda | ✅ | Si filtra en tiempo real |
| Mensajes | ✅ | Si ves alertas de éxito/error |
| Console | ✅ | Si no hay errores rojos |
| Backend API | ✅ | Si endpoints responden |

---

## 🆘 Solución de Problemas

### Problema: Frontend no carga

**Solución:**
```bash
# Terminal en frontend/
npm install
npm run dev
```

### Problema: Backend no conecta

**Solución:**
```bash
# Verifica MySQL está corriendo
# Terminal en backend/
python manage.py runserver
```

### Problema: Tabla está vacía

**Solución:**
```bash
# Crea algunos datos de prueba
cd backend
python populate_data.py
cd ..
```

### Problema: Error "CORS"

**Solución:**
- Es normal si backend y frontend en puertos diferentes
- Verifica que `CORS_ALLOWED_ORIGINS` en settings.py incluye `http://localhost:5173`

### Problema: "Module not found"

**Solución:**
```bash
# Reinstala dependencias
npm install  # En frontend
pip install -r requirements.txt  # En backend
```

---

## ✅ Checklist Final

Marca estos ítems como verificados:

- [ ] Frontend carga en http://localhost:5173
- [ ] Veo botones "RRHH" y "Administración"
- [ ] Módulo RRHH funciona (dashboard visible)
- [ ] Módulo Admin carga (Empleados visible)
- [ ] Puedo crear un empleado
- [ ] Puedo editar un empleado
- [ ] Puedo eliminar un empleado
- [ ] Búsqueda filtra empleados
- [ ] Admin Cargos muestra tarjetas
- [ ] Puedo hacer CRUD en Cargos
- [ ] Admin Sucursales muestra tarjetas
- [ ] Puedo hacer CRUD en Sucursales
- [ ] Navego sin errores entre módulos
- [ ] Console no muestra errores rojos
- [ ] Backend admin (localhost:8000/admin) funciona

---

## 🎊 ¡Si todo funciona!

**¡Felicidades!** Tu proyecto está:
- ✅ Correctamente organizado
- ✅ Funcionando como sistema profesional
- ✅ Listo para agregar más características
- ✅ Con arquitectura senior level

---

## 📚 Próximos Pasos

1. **Revisa la documentación:**
   - [ARQUITECTURA_PROFESIONAL.md](ARQUITECTURA_PROFESIONAL.md)
   - [GUIA_JUNIOR_A_SENIOR.md](GUIA_JUNIOR_A_SENIOR.md)

2. **Expande las funcionalidades:**
   - Agregar más módulos
   - Mejorar autenticación
   - Exportar reportes
   - Notificaciones en tiempo real

3. **Cleanup (opcional):**
   - Si todo funciona, ejecuta: `.\cleanup_backend.bat`
   - Esto elimina las viejas templates de Django

---

<div align="center">

**🚀 ¡Tu proyecto ahora es profesional!**

</div>
