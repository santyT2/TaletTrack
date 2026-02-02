# 🎯 CREDENCIALES RÁPIDAS - HRMS

## 🔓 Admin Principal

```
┌─────────────────────────────────┐
│   SUPERADMIN / ADMIN_TÉCNICO    │
├─────────────────────────────────┤
│ Usuario:     admin              │
│ Email:       admin@example.com  │
│ Contraseña:  admin1234          │
│ Rol:         SUPERADMIN         │
│ Acceso:      /admin/*           │
└─────────────────────────────────┘
```

---

## 👥 Empleados de Prueba (Usar Cédula como Contraseña)

### Gerente (MANAGER - Acceso HR)
```
Carlos Alberto Rodríguez Pérez
├─ Usuario: 1234567890
├─ Contraseña: 1234567890
├─ Rol: MANAGER
└─ Acceso: /hr/*
```

### RRHH (ADMIN_RRHH - Acceso Admin + HR)
```
Diana Patricia Ramírez Castro
├─ Usuario: 5566778899
├─ Contraseña: 5566778899
├─ Rol: ADMIN_RRHH
└─ Acceso: /admin/* + /hr/*
```

### Empleados (EMPLOYEE - Acceso Portal)
```
Ana María González López
├─ Usuario: 9876543210
├─ Contraseña: 9876543210
├─ Rol: EMPLOYEE
└─ Acceso: /portal/*

Luis Fernando Martínez Silva
├─ Usuario: 1122334455
├─ Contraseña: 1122334455
├─ Rol: EMPLOYEE
└─ Acceso: /portal/*

... más empleados disponibles
```

---

## 🚀 Quick Start

### 1. Iniciar Backend
```bash
cd backend
python manage.py runserver
```

### 2. Iniciar Frontend
```bash
cd frontend
npm run dev
```

### 3. Ir a Login
```
http://localhost:5173/login
```

### 4. Ingresar Credenciales
```
Usuario: admin
Contraseña: admin1234
```

### 5. ¡Listo!
```
✅ Serás redirigido a /admin/dashboard
```

---

## 🔄 Cambio de Rol (Para Testing)

Para probar diferentes roles, usa:

| Rol | Usuario | Contraseña | Destino |
|-----|---------|-----------|---------|
| SUPERADMIN | admin | admin1234 | /admin |
| ADMIN_RRHH | 5566778899 | 5566778899 | /admin |
| MANAGER | 1234567890 | 1234567890 | /hr |
| EMPLOYEE | 9876543210 | 9876543210 | /portal |

---

## ⚠️ IMPORTANTE

- **Las contraseñas por defecto son de PRUEBA**
- En producción, cambiarlas inmediatamente
- Primera vez que ingresas = obligatorio cambiar contraseña
- Los tokens JWT expiran en 24 horas

---

## 🔧 Recrear Datos de Prueba

```bash
# Limpiar todo
python manage.py flush --noinput

# Recrear estructura
python manage.py migrate

# Crear admin
python manage.py createsuperuser

# Crear empleados de prueba
python populate_complete.py
```

---

**¡Listo para usar! 🚀**
