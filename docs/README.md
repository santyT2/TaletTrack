# 🚀 Sistema de Gestión de Recursos Humanos (HRMS)

<div align="center">

![Django](https://img.shields.io/badge/Django-6.0.1-green)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Python](https://img.shields.io/badge/Python-3.14+-yellow)

**Sistema completo de gestión de RRHH con Django REST Framework + React + TypeScript**

[🚀 Inicio Rápido](#-inicio-rápido) • [📚 Documentación](#-documentación) • [🎯 Características](#-características) • [🛠️ Scripts](#️-scripts)

</div>

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Inicio Rápido](#-inicio-rápido)
- [Documentación](#-documentación)
- [Tecnologías](#-tecnologías)
- [Scripts Disponibles](#️-scripts-disponibles)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [URLs Principales](#-urls-principales)
- [Screenshots](#-screenshots)

---

## 🎯 Características

### 📊 Dashboard Interactivo
- ✅ KPIs en tiempo real (empleados, retención, solicitudes)
- ✅ Gráficos dinámicos con Recharts
- ✅ Alertas de cumpleaños y contratos por vencer
- ✅ Métricas de onboarding

### 🌳 Organigrama Jerárquico
- ✅ Visualización de estructura organizacional
- ✅ Árbol interactivo con empleados
- ✅ Navegación y zoom

### 📅 Gestión de Permisos
- ✅ Solicitudes de vacaciones/permisos
- ✅ Flujo de aprobación (Pendiente/Aprobado/Rechazado)
- ✅ Cálculo automático de días
- ✅ Notificaciones visuales

### 📄 Control de Contratos
- ✅ Historial de contratos por empleado
- ✅ Alertas de vencimiento (< 30 días)
- ✅ Gestión de documentos PDF
- ✅ Estados visuales

### ✅ Sistema de Onboarding
- ✅ Checklist de tareas para nuevos empleados
- ✅ Barra de progreso
- ✅ Alertas de tareas vencidas/urgentes
- ✅ Toggle de completado

### 🔌 API RESTful Completa
- ✅ CRUD para todas las entidades
- ✅ Endpoints especiales (KPIs, Organigrama)
- ✅ Filtros y búsqueda
- ✅ Paginación
- ✅ CORS configurado

---

## 🚀 Inicio Rápido

### ⚡ En 4 Pasos (5 minutos)

```bash
# 1. Verificar instalación
.\verify_installation.bat

# 2. Instalar dependencias frontend
.\install_frontend_deps.bat

# 3. Configurar backend
.\setup_backend_complete.bat

# 4. Crear superusuario y iniciar
cd backend
python manage.py createsuperuser
cd ..
.\start_project.bat
```

### 🌐 Acceder al Sistema

Una vez iniciado:

- **Frontend (Usuario):** http://localhost:5173/hr/dashboard
- **Backend (Admin):** http://localhost:8000/admin
- **API REST:** http://localhost:8000/employees/api/

---

## 📚 Documentación

| Documento | Descripción | Para quién |
|-----------|-------------|-----------|
| **[📚 INDICE_DOCUMENTACION.md](INDICE_DOCUMENTACION.md)** | Índice completo de toda la documentación | Todos |
| **[⚡ INSTRUCCIONES_RAPIDAS.md](INSTRUCCIONES_RAPIDAS.md)** | Guía rápida de inicio y uso diario | Nuevos usuarios |
| **[✅ RESUMEN_IMPLEMENTACION.md](RESUMEN_IMPLEMENTACION.md)** | Archivos creados y funcionalidades | Desarrolladores |
| **[📖 GUIA_IMPLEMENTACION_HRMS.md](GUIA_IMPLEMENTACION_HRMS.md)** | Guía detallada de configuración | DevOps |
| **[📘 README_HRMS.md](README_HRMS.md)** | Documentación técnica completa | Desarrolladores |

### 🎓 Primeros Pasos Recomendados

1. **Nuevo en el proyecto:** Lee [INSTRUCCIONES_RAPIDAS.md](INSTRUCCIONES_RAPIDAS.md)
2. **Desarrollador:** Consulta [RESUMEN_IMPLEMENTACION.md](RESUMEN_IMPLEMENTACION.md)
3. **Problemas:** Revisa [GUIA_IMPLEMENTACION_HRMS.md - Troubleshooting](GUIA_IMPLEMENTACION_HRMS.md#-troubleshooting)
4. **API Reference:** Ver [README_HRMS.md - Endpoints](README_HRMS.md#-endpoints-disponibles)

---

## 🛠️ Tecnologías

### Backend
- **Python 3.14+** - Lenguaje
- **Django 6.0.1** - Framework web
- **Django REST Framework** - API REST
- **MySQL** - Base de datos
- **django-cors-headers** - CORS
- **Pillow** - Imágenes

### Frontend
- **React 18** - UI Library
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **Tailwind CSS** - Estilos
- **React Router** - Navegación
- **Recharts** - Gráficos
- **Lucide React** - Iconos
- **date-fns** - Manejo de fechas
- **Axios** - HTTP Client

---

## 🗂️ Scripts Disponibles

### Verificación
```bash
.\verify_installation.bat
```
Verifica que todos los archivos necesarios estén presentes.

### Instalación Frontend
```bash
.\install_frontend_deps.bat
```
Instala: recharts, react-organizational-chart, lucide-react, date-fns

### Configuración Backend
```bash
.\setup_backend_complete.bat
```
Instala dependencias, crea y aplica migraciones.

### Iniciar Proyecto
```bash
.\start_project.bat
```
Inicia Django (puerto 8000) y React (puerto 5173) simultáneamente.

### Manual

**Backend:**
```bash
cd backend
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm run dev
```

---

## 📁 Estructura del Proyecto

```
proyecto-punto-pymes/
│
├── 📄 Documentación
│   ├── README.md                         # Este archivo
│   ├── INDICE_DOCUMENTACION.md           # Índice completo
│   ├── INSTRUCCIONES_RAPIDAS.md          # Inicio rápido
│   ├── RESUMEN_IMPLEMENTACION.md         # Resumen técnico
│   ├── GUIA_IMPLEMENTACION_HRMS.md       # Guía detallada
│   └── README_HRMS.md                    # Documentación completa
│
├── 🔧 Scripts
│   ├── verify_installation.bat
│   ├── install_frontend_deps.bat
│   ├── setup_backend_complete.bat
│   └── start_project.bat
│
├── 🐍 Backend (Django)
│   ├── talent_track/                     # Configuración
│   ├── employees/                        # App principal HRMS
│   ├── attendance/                       # Control de asistencia
│   └── core/                             # Módulo central
│
└── ⚛️ Frontend (React)
    └── src/
        ├── modules/hr/
        │   ├── pages/                    # 5 páginas principales
        │   ├── components/               # Componentes compartidos
        │   ├── HRLayout.tsx              # Layout
        │   └── HRRoutes.tsx              # Rutas
        └── services/
            └── hrService.ts              # Cliente API
```

Ver estructura completa en [README_HRMS.md](README_HRMS.md#️-estructura-del-proyecto)

---

## 🌐 URLs Principales

### Frontend
- **Dashboard:** http://localhost:5173/hr/dashboard
- **Organigrama:** http://localhost:5173/hr/organigram
- **Permisos:** http://localhost:5173/hr/leaves
- **Contratos:** http://localhost:5173/hr/contracts
- **Onboarding:** http://localhost:5173/hr/onboarding

### Backend
- **Admin:** http://localhost:8000/admin
- **API Root:** http://localhost:8000/employees/api/

### API Endpoints Principales
```
GET /employees/api/empleados/           # Lista de empleados
GET /employees/api/contratos/           # Contratos
GET /employees/api/solicitudes/         # Solicitudes de permisos
GET /employees/api/onboarding/          # Tareas de onboarding
GET /employees/api/dashboard/kpi/       # KPIs
GET /employees/api/organigram/          # Estructura organizacional
```

Ver todos los endpoints en [README_HRMS.md - API](README_HRMS.md#-endpoints-principales)

---

## 📊 Screenshots

### Dashboard
- KPI Cards con métricas principales
- Gráfico de empleados por departamento
- Estado de solicitudes de permisos
- Alertas de cumpleaños y contratos

### Organigrama
- Visualización jerárquica
- Estructura de árbol recursiva
- Información de cargos

### Permisos
- Pestañas: Mis Solicitudes / Aprobaciones
- Formulario modal de creación
- Badges de estado (Pendiente/Aprobado/Rechazado)

### Contratos
- Tabla de contratos históricos
- Alertas visuales de vencimiento
- Gestión de documentos

### Onboarding
- Kanban: Pendientes vs Completadas
- Barra de progreso general
- Alertas de tareas vencidas

---

## 🔐 Seguridad

### Desarrollo
- CORS habilitado para `localhost:5173`
- `AllowAny` para facilitar desarrollo
- Session authentication

### Producción
Cambiar en `settings.py`:
```python
DEBUG = False
ALLOWED_HOSTS = ['tudominio.com']

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
```

---

## 🧪 Testing

### Backend
```bash
cd backend
python manage.py test
```

### Endpoints (curl)
```bash
curl http://localhost:8000/employees/api/dashboard/kpi/
curl http://localhost:8000/employees/api/organigram/
```

### Frontend
```bash
cd frontend
npm run build     # Build de producción
npm run preview   # Preview del build
```

---

## 🐛 Troubleshooting

### Problema: Puerto en uso
```bash
# Cambiar puerto en Django
python manage.py runserver 8001

# Cambiar puerto en Vite
# Editar vite.config.ts: server: { port: 3000 }
```

### Problema: CORS Error
Verificar en `settings.py`:
```python
INSTALLED_APPS = [..., 'corsheaders']
MIDDLEWARE = ['corsheaders.middleware.CorsMiddleware', ...]
CORS_ALLOWED_ORIGINS = ["http://localhost:5173"]
```

### Problema: Dependencias
```bash
# Frontend
cd frontend
npm install

# Backend
cd backend
pip install -r requirements.txt
```

Ver más en [GUIA_IMPLEMENTACION_HRMS.md - Troubleshooting](GUIA_IMPLEMENTACION_HRMS.md#-troubleshooting)

---

## 📈 Roadmap

### v1.1 (Próximo)
- [ ] Autenticación JWT
- [ ] Paginación en tablas
- [ ] Filtros avanzados
- [ ] Exportación a Excel/PDF

### v1.2 (Futuro)
- [ ] Notificaciones en tiempo real
- [ ] Dashboard administrativo
- [ ] Sistema de permisos granulares
- [ ] Tests unitarios e integración

### v2.0 (Largo plazo)
- [ ] Móvil (React Native)
- [ ] Modo oscuro
- [ ] Multi-idioma
- [ ] Reportes avanzados

---

## 👥 Equipo

Desarrollado para **Proyecto Punto Pymes**

---

## 📄 Licencia

Este proyecto es privado y propietario.

---

## 📞 Soporte

¿Necesitas ayuda?

1. ✅ Ejecuta `.\verify_installation.bat`
2. 📚 Consulta el [INDICE_DOCUMENTACION.md](INDICE_DOCUMENTACION.md)
3. 📖 Lee las [INSTRUCCIONES_RAPIDAS.md](INSTRUCCIONES_RAPIDAS.md)
4. 🔍 Revisa [GUIA_IMPLEMENTACION_HRMS.md](GUIA_IMPLEMENTACION_HRMS.md)

---

## ✅ Checklist de Inicio

Antes de usar el sistema:

- [ ] MySQL corriendo en puerto 3307
- [ ] Python 3.14+ instalado
- [ ] Node.js + npm instalados
- [ ] Ejecutado `verify_installation.bat` ✓
- [ ] Ejecutado `install_frontend_deps.bat` ✓
- [ ] Ejecutado `setup_backend_complete.bat` ✓
- [ ] Superusuario creado ✓
- [ ] `.\start_project.bat` ejecutado ✓

---

<div align="center">

**🎉 ¡Sistema listo para usar!**

```bash
.\start_project.bat
```

[Dashboard](http://localhost:5173/hr/dashboard) • [Admin](http://localhost:8000/admin) • [API](http://localhost:8000/employees/api/)

---

**Última actualización:** 21 de enero de 2026 | **Versión:** 1.0.0

</div>
