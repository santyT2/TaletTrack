# 🔐 Credenciales por Defecto - HRMS Sistema

## Usuarios de Administración

### 1. SUPERADMIN (Administrador Técnico del Sistema)

```
Usuario: admin
Email: admin@example.com
Contraseña: admin1234
Rol: SUPERADMIN
```

**Acceso a:** 
- `/admin/dashboard` - Panel de control técnico
- Gestión de empresa
- Gestión de usuarios
- Control de accesos
- Configuración técnica

**Crear con:**
```bash
python setup_project.py
# O manualmente:
python manage.py createsuperuser
```

---

## Usuarios de Prueba del Sistema

Si ejecutas `populate_complete.py`, se crean automáticamente 10 empleados con los siguientes datos:

### Empleados de Prueba

| Nombres | Apellidos | Cédula | Email | Cargo | Rol | Contraseña |
|---------|-----------|--------|-------|-------|-----|-----------|
| Carlos Alberto | Rodríguez Pérez | 1234567890 | carlos.rodriguez@empresa.com | Gerente | MANAGER | *1234567890* |
| Ana María | González López | 9876543210 | ana.gonzalez@empresa.com | Desarrollador Senior | EMPLOYEE | *9876543210* |
| Luis Fernando | Martínez Silva | 1122334455 | luis.martinez@empresa.com | Analista de Sistemas | EMPLOYEE | *1122334455* |
| Diana Patricia | Ramírez Castro | 5566778899 | diana.ramirez@empresa.com | Analista RRHH | ADMIN_RRHH | *5566778899* |
| Roberto | Díaz Morales | 6677889900 | roberto.diaz@empresa.com | Contador | EMPLOYEE | *6677889900* |
| Sofía | Hernández Vargas | 7788990011 | sofia.hernandez@empresa.com | Asistente Admin | EMPLOYEE | *7788990011* |
| Miguel Ángel | Torres Ruiz | 8899001122 | miguel.torres@empresa.com | Vendedor | EMPLOYEE | *8899001122* |
| Laura | Jiménez Ortiz | 9900112233 | laura.jimenez@empresa.com | Soporte Técnico | EMPLOYEE | *9900112233* |
| Andrés | Moreno Cruz | 1010101010 | andres.moreno@empresa.com | Vendedor | EMPLOYEE | *1010101010* |
| Valentina | Sánchez Rojas | 2020202020 | valentina.sanchez@empresa.com | Asistente Admin | EMPLOYEE | *2020202020* |

*La contraseña por defecto es la cédula del empleado (documento)*

### Roles del Sistema

```
┌────────────────┬────────────────────────────────────┐
│     ROL        │          ACCESO A                  │
├────────────────┼────────────────────────────────────┤
│ SUPERADMIN     │ /admin/* (Todo)                    │
│ ADMIN_RRHH     │ /admin/* + /hr/*                   │
│ MANAGER        │ /hr/*                              │
│ EMPLOYEE       │ /portal/*                          │
└────────────────┴────────────────────────────────────┘
```

---

## 🔓 Cómo Usar las Credenciales

### 1. Login en la Aplicación Web

```
URL: http://localhost:5173/login

Usuario: admin
Contraseña: admin1234
```

**O usar un empleado:**

```
Usuario: 1234567890
Contraseña: 1234567890
```

### 2. Cambiar Contraseña

Después del primer login, se solicita cambiar la contraseña.

```
Contraseña actual: 1234567890
Nueva contraseña: micontraseña123
Confirmar: micontraseña123
```

---

## 🛠️ Crear Nuevos Usuarios

### Opción 1: Desde Admin Django

```bash
python manage.py createsuperuser
# O para usuario normal:
python manage.py shell
```

### Opción 2: Script de Setup

```bash
python setup_project.py
# Selecciona "s" cuando pregunte por superusuario
```

### Opción 3: Desde API REST

```bash
curl -X POST http://localhost:8000/api/usuarios/ \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@example.com",
    "role": "EMPLOYEE"
  }'
```

---

## 📝 Estructura de Usuario en Base de Datos

### Tabla: `auth_user` (Django)

```
username: admin
email: admin@example.com
first_name: (vacío)
last_name: (vacío)
password: (hash bcrypt)
is_staff: true
is_superuser: true
is_active: true
```

### Tabla: `core_usuario` (Customizada)

```
id: 1
user_id: 1 (FK a auth_user)
role: SUPERADMIN
must_change_password: false
is_active: true
created_at: 2024-01-01
updated_at: 2024-01-29
```

---

## 🔐 Seguridad

### Contraseñas Almacenadas

Las contraseñas se almacenan con hash **bcrypt** en la base de datos:

```python
# En código
from django.contrib.auth.hashers import make_password

hashed = make_password('admin1234')
# Almacenado en DB como: $2b$12$...
```

### Autenticación JWT

Después de login, se genera un JWT token:

```
Header: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

El token incluye:
- `user_id`
- `username`
- `role`
- `email`
- `exp` (expiración: 24 horas por defecto)

---

## 🚨 Cambios de Contraseña Obligatorios

### Primer Login

Si `must_change_password = True`, se redirige a:
```
/auth/setup-password
```

**Debe llenar:**
- Contraseña actual
- Nueva contraseña
- Confirmar nueva contraseña

### Desde Panel Admin

Para forzar cambio de contraseña a un usuario:

```python
from core.models import Usuario

usuario = Usuario.objects.get(id=2)
usuario.must_change_password = True
usuario.save()
```

---

## 🔍 Verificación de Credenciales

### Verificar que admin existe

```bash
python manage.py shell
```

```python
from django.contrib.auth.models import User
from core.models import Usuario

admin = User.objects.get(username='admin')
print(f"Username: {admin.username}")
print(f"Email: {admin.email}")
print(f"Is Superuser: {admin.is_superuser}")

# Ver extensión customizada
usuario = admin.usuario
print(f"Role: {usuario.role}")
print(f"Must Change Password: {usuario.must_change_password}")
```

### Verificar que empleados existen

```python
from employees.models import Empleado

empleados = Empleado.objects.all()
for emp in empleados:
    print(f"{emp.nombres} {emp.apellidos} - {emp.cedula}")
    if emp.user:
        print(f"  Usuario: {emp.user.username}, Rol: {emp.user.usuario.role}")
```

---

## 🔑 Resets de Contraseña

### Script para Resetear Todo

```bash
# Backend
python manage.py flush --noinput
python setup_project.py
# Y selecciona las opciones para crear datos
```

### Reset Individual

```python
from django.contrib.auth.models import User

user = User.objects.get(username='admin')
user.set_password('newpassword123')
user.save()

# Forzar cambio en próximo login
from core.models import Usuario
usuario = user.usuario
usuario.must_change_password = True
usuario.save()
```

---

## 📋 Checklist de Verificación

- [x] Admin creado con `admin@example.com`
- [x] 10 empleados de prueba creados
- [x] Roles asignados correctamente (SUPERADMIN, ADMIN_RRHH, MANAGER, EMPLOYEE)
- [x] JWT tokens funcionando
- [x] Contraseñas hasheadas con bcrypt
- [x] Cambio de contraseña obligatorio en primer login
- [x] API de usuarios operativa

---

## 🆘 Troubleshooting

### Error: "Usuario no encontrado"

**Solución:** Ejecutar `populate_complete.py`

```bash
python populate_complete.py
```

### Error: "Contraseña incorrecta"

**Solución:** Resetear contraseña

```bash
python manage.py changepassword admin
```

### Error: "Rol no asignado"

**Solución:** Verificar en Django shell

```python
from core.models import Usuario
usuario = Usuario.objects.get(user__username='admin')
print(usuario.role)
```

### Token expirado

**Solución:** Login nuevamente para obtener nuevo token

---

## 📞 Soporte

Para problemas con credenciales:

1. Verificar que MySQL está corriendo
2. Verificar que migraciones se aplicaron: `python manage.py migrate`
3. Verificar que datos existen: `python manage.py shell`
4. Recrear todo si es necesario: `python setup_project.py`

---

**Última actualización:** 29/01/2024
**Versión:** 1.0
