# 📚 ÍNDICE DE DOCUMENTACIÓN - SISTEMA HRMS

Bienvenido al Sistema de Gestión de Recursos Humanos. Esta es tu guía completa.

---

## 🚀 PRIMEROS PASOS

**¿Nuevo en el proyecto? Empieza aquí:**

1. 📄 **[INSTRUCCIONES_RAPIDAS.md](INSTRUCCIONES_RAPIDAS.md)**
   - Inicio rápido en 3 minutos
   - Comandos esenciales
   - Acceso al sistema
   - Crear datos de prueba

2. ✅ **[RESUMEN_IMPLEMENTACION.md](RESUMEN_IMPLEMENTACION.md)**
   - Archivos creados/actualizados
   - Funcionalidades implementadas
   - Endpoints disponibles
   - Checklist final

3. 📖 **[GUIA_IMPLEMENTACION_HRMS.md](GUIA_IMPLEMENTACION_HRMS.md)**
   - Guía completa paso a paso
   - Configuración detallada
   - Troubleshooting
   - Próximos pasos

4. 📘 **[README_HRMS.md](README_HRMS.md)**
   - Documentación técnica completa
   - Estructura del proyecto
   - Tecnologías utilizadas
   - API Reference

---

## 🛠️ SCRIPTS DISPONIBLES

### Windows Batch Scripts

| Script | Descripción | Cuándo usar |
|--------|-------------|-------------|
| `verify_installation.bat` | Verifica que todos los archivos estén en su lugar | Antes de comenzar |
| `install_frontend_deps.bat` | Instala dependencias del frontend | Primera vez o después de actualizar |
| `setup_backend_complete.bat` | Configura el backend completo | Primera vez o después de cambios en modelos |
| `start_project.bat` | Inicia backend y frontend simultáneamente | Para ejecutar el sistema |
| `setup_initial.bat` | Script inicial del proyecto (legacy) | No usar, reemplazado |
| `setup_backend.bat` | Solo migraciones (legacy) | No usar, usar `setup_backend_complete.bat` |

### Orden Recomendado

```bash
1. .\verify_installation.bat      # Verificar
2. .\install_frontend_deps.bat    # Frontend
3. .\setup_backend_complete.bat   # Backend
4. cd backend && python manage.py createsuperuser  # Crear admin
5. .\start_project.bat            # Iniciar
```

---

## 📁 ESTRUCTURA DEL PROYECTO

```
proyecto-punto-pymes/
│
├── 📄 Documentación
│   ├── INSTRUCCIONES_RAPIDAS.md          ⭐ Empieza aquí
│   ├── RESUMEN_IMPLEMENTACION.md         ✅ Qué se implementó
│   ├── GUIA_IMPLEMENTACION_HRMS.md       📖 Guía completa
│   ├── README_HRMS.md                    📘 Documentación técnica
│   └── INDICE_DOCUMENTACION.md           📚 Este archivo
│
├── 🔧 Scripts
│   ├── verify_installation.bat           ✓ Verificar instalación
│   ├── install_frontend_deps.bat         📦 Instalar frontend
│   ├── setup_backend_complete.bat        ⚙️ Configurar backend
│   └── start_project.bat                 🚀 Iniciar proyecto
│
├── 🐍 Backend (Django)
│   ├── talent_track/                     # Configuración
│   │   ├── settings.py                   # Settings principal
│   │   └── urls.py                       # URLs raíz
│   │
│   ├── employees/                        # App principal
│   │   ├── models.py                     # Modelos de datos
│   │   ├── serializers.py                # Serializadores DRF
│   │   ├── api_views.py                  # ViewSets y endpoints
│   │   ├── views.py                      # Vistas Django tradicionales
│   │   └── urls.py                       # URLs de la app
│   │
│   ├── attendance/                       # Control de asistencia
│   └── core/                             # App central
│
└── ⚛️ Frontend (React)
    ├── src/
    │   ├── modules/hr/
    │   │   ├── pages/
    │   │   │   ├── DashboardPage.tsx     # 📊 Dashboard
    │   │   │   ├── OrganigramPage.tsx    # 🌳 Organigrama
    │   │   │   ├── LeavesPage.tsx        # 📅 Permisos
    │   │   │   ├── ContractsPage.tsx     # 📄 Contratos
    │   │   │   └── OnboardingPage.tsx    # ✅ Onboarding
    │   │   │
    │   │   ├── components/
    │   │   │   └── HRNavigation.tsx      # Navegación
    │   │   │
    │   │   ├── HRLayout.tsx              # Layout
    │   │   └── HRRoutes.tsx              # Rutas
    │   │
    │   └── services/
    │       └── hrService.ts              # Cliente API
    │
    ├── App.example.tsx                   # Ejemplo de App.tsx
    └── package.json
```

---

## 🎯 FLUJOS DE TRABAJO

### Desarrollo Diario

```bash
# 1. Actualizar código (si usas git)
git pull

# 2. Instalar nuevas dependencias (si hay)
cd frontend && npm install
cd ../backend && pip install -r requirements.txt

# 3. Aplicar migraciones (si hay)
cd backend
python manage.py migrate

# 4. Iniciar proyecto
cd ..
.\start_project.bat
```

### Agregar una Nueva Feature

1. **Backend:**
   - Modificar `models.py` si necesitas nuevos campos
   - Crear/actualizar `serializers.py`
   - Agregar ViewSet en `api_views.py`
   - Registrar ruta en `urls.py`
   - Ejecutar migraciones

2. **Frontend:**
   - Agregar tipos TypeScript en `hrService.ts`
   - Crear funciones API en `hrService.ts`
   - Crear componente/página React
   - Agregar ruta en `HRRoutes.tsx`

3. **Testing:**
   - Probar endpoints con curl/Postman
   - Probar UI en el navegador
   - Verificar errores en consola

### Desplegar a Producción

1. **Preparación:**
   - Cambiar `DEBUG = False`
   - Configurar `ALLOWED_HOSTS`
   - Usar variables de entorno
   - Configurar HTTPS

2. **Backend:**
   ```bash
   python manage.py collectstatic
   python manage.py check --deploy
   ```

3. **Frontend:**
   ```bash
   npm run build
   ```

4. **Deploy:**
   - Subir código a servidor
   - Configurar Nginx/Apache
   - Usar Gunicorn para Django
   - Configurar SSL

---

## 📊 FUNCIONALIDADES POR PÁGINA

### 📊 Dashboard (`/hr/dashboard`)
- **KPIs:** Total empleados, retención, solicitudes pendientes
- **Gráficos:** Bar chart (empleados por depto), Pie chart (solicitudes)
- **Alertas:** Cumpleaños, contratos por vencer
- **Archivos:** [DashboardPage.tsx](frontend/src/modules/hr/pages/DashboardPage.tsx)
- **API:** `/employees/api/dashboard/kpi/`

### 🌳 Organigrama (`/hr/organigram`)
- **Vista:** Árbol jerárquico
- **Features:** Zoom, búsqueda, navegación
- **Datos:** Estructura reports_to
- **Archivos:** [OrganigramPage.tsx](frontend/src/modules/hr/pages/OrganigramPage.tsx)
- **API:** `/employees/api/organigram/`

### 📅 Permisos (`/hr/leaves`)
- **Pestañas:** Mis solicitudes, Aprobaciones
- **Acciones:** Crear, aprobar, rechazar
- **Estados:** Pendiente, Aprobado, Rechazado
- **Archivos:** [LeavesPage.tsx](frontend/src/modules/hr/pages/LeavesPage.tsx)
- **API:** `/employees/api/solicitudes/`

### 📄 Contratos (`/hr/contracts`)
- **Lista:** Histórico de contratos
- **Alertas:** Vencimiento < 30 días
- **Gestión:** Documentos PDF
- **Archivos:** [ContractsPage.tsx](frontend/src/modules/hr/pages/ContractsPage.tsx)
- **API:** `/employees/api/contratos/`

### ✅ Onboarding (`/hr/onboarding`)
- **Kanban:** Pendientes vs Completadas
- **Progreso:** Barra de %
- **Alertas:** Vencidas, urgentes
- **Archivos:** [OnboardingPage.tsx](frontend/src/modules/hr/pages/OnboardingPage.tsx)
- **API:** `/employees/api/onboarding/`

---

## 🔌 API ENDPOINTS COMPLETA

### Base URL: `http://localhost:8000`

#### Empleados
```
GET    /employees/api/empleados/           # Lista
GET    /employees/api/empleados/{id}/      # Detalle
POST   /employees/api/empleados/           # Crear
PATCH  /employees/api/empleados/{id}/      # Actualizar
DELETE /employees/api/empleados/{id}/      # Eliminar
```

#### Sucursales
```
GET    /employees/api/sucursales/
GET    /employees/api/sucursales/{id}/
POST   /employees/api/sucursales/
PATCH  /employees/api/sucursales/{id}/
DELETE /employees/api/sucursales/{id}/
```

#### Cargos
```
GET    /employees/api/cargos/
GET    /employees/api/cargos/{id}/
POST   /employees/api/cargos/
PATCH  /employees/api/cargos/{id}/
DELETE /employees/api/cargos/{id}/
```

#### Contratos
```
GET    /employees/api/contratos/
GET    /employees/api/contratos/{id}/
GET    /employees/api/contratos/expiring_soon/
POST   /employees/api/contratos/
PATCH  /employees/api/contratos/{id}/
DELETE /employees/api/contratos/{id}/
```

#### Solicitudes
```
GET    /employees/api/solicitudes/
GET    /employees/api/solicitudes/{id}/
GET    /employees/api/solicitudes/pending/
POST   /employees/api/solicitudes/
POST   /employees/api/solicitudes/{id}/approve/
POST   /employees/api/solicitudes/{id}/reject/
PATCH  /employees/api/solicitudes/{id}/
DELETE /employees/api/solicitudes/{id}/
```

#### Onboarding
```
GET    /employees/api/onboarding/
GET    /employees/api/onboarding/{id}/
POST   /employees/api/onboarding/
POST   /employees/api/onboarding/{id}/toggle_complete/
PATCH  /employees/api/onboarding/{id}/
DELETE /employees/api/onboarding/{id}/
```

#### Especiales
```
GET    /employees/api/dashboard/kpi/       # KPIs
GET    /employees/api/organigram/          # Estructura
```

---

## 🔧 CONFIGURACIÓN

### Variables de Entorno

**Frontend** (`.env`):
```env
VITE_API_URL=http://localhost:8000
```

**Backend** (`.env` o decouple):
```env
SECRET_KEY=tu-secret-key-aqui
DEBUG=True
DB_ENGINE=django.db.backends.mysql
DB_NAME=talent_track_db
DB_USER=root
DB_PASSWORD=tu-password
DB_HOST=localhost
DB_PORT=3307
```

### Archivos de Configuración Principales

| Archivo | Propósito |
|---------|-----------|
| `backend/talent_track/settings.py` | Django settings |
| `frontend/vite.config.ts` | Vite config |
| `frontend/tailwind.config.js` | Tailwind CSS |
| `frontend/tsconfig.json` | TypeScript |
| `backend/requirements.txt` | Dependencias Python |
| `frontend/package.json` | Dependencias npm |

---

## 🐛 TROUBLESHOOTING

### Problemas Comunes

| Problema | Solución | Documento |
|----------|----------|-----------|
| Dependencias no instaladas | `install_frontend_deps.bat` | [INSTRUCCIONES_RAPIDAS.md](INSTRUCCIONES_RAPIDAS.md#paso-2-instalar-dependencias-del-frontend) |
| Error CORS | Verificar `settings.py` | [GUIA_IMPLEMENTACION_HRMS.md](GUIA_IMPLEMENTACION_HRMS.md#3-actualizar-settingspy-para-cors) |
| Migraciones fallan | `python manage.py migrate --fake` | [README_HRMS.md](README_HRMS.md#migraciones-no-se-aplican) |
| Puerto en uso | Cambiar puerto o matar proceso | [INSTRUCCIONES_RAPIDAS.md](INSTRUCCIONES_RAPIDAS.md#-problemas-comunes) |
| Frontend no conecta | Verificar `VITE_API_URL` | [GUIA_IMPLEMENTACION_HRMS.md](GUIA_IMPLEMENTACION_HRMS.md#3-crear-archivo-env) |

### Recursos de Ayuda

1. ✅ [Checklist de Verificación](RESUMEN_IMPLEMENTACION.md#-checklist-final)
2. 🔍 [Troubleshooting Completo](GUIA_IMPLEMENTACION_HRMS.md#-troubleshooting)
3. 📞 [Soporte](RESUMEN_IMPLEMENTACION.md#-soporte)

---

## 📈 PRÓXIMOS PASOS

### Features Sugeridas

1. **Autenticación JWT**
   - Documentación: [README_HRMS.md - Próximas Mejoras](README_HRMS.md#-próximas-mejoras)
   
2. **Paginación**
   - Ya configurada en `settings.py` (PAGE_SIZE=100)
   - Implementar en frontend

3. **Exportación**
   - Ejemplo: [INSTRUCCIONES_RAPIDAS.md - Reportes](INSTRUCCIONES_RAPIDAS.md#-reportes-y-exportación)

4. **Notificaciones**
   - WebSocket o Polling
   - Toast notifications

5. **Tests**
   - Unitarios: Django TestCase
   - Integración: pytest
   - E2E: Cypress/Playwright

---

## 🎓 RECURSOS DE APRENDIZAJE

### Django
- [Django Docs](https://docs.djangoproject.com/)
- [DRF Docs](https://www.django-rest-framework.org/)

### React
- [React Docs](https://react.dev/)
- [React Router](https://reactrouter.com/)
- [Recharts](https://recharts.org/)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Tailwind CSS
- [Tailwind Docs](https://tailwindcss.com/docs)

---

## ✅ CHECKLIST RÁPIDA

Antes de usar el sistema:

- [ ] MySQL corriendo en puerto 3307
- [ ] Python 3.14+ instalado
- [ ] Node.js instalado
- [ ] Ejecutado `verify_installation.bat`
- [ ] Ejecutado `install_frontend_deps.bat`
- [ ] Ejecutado `setup_backend_complete.bat`
- [ ] Superusuario creado
- [ ] Backend en http://localhost:8000
- [ ] Frontend en http://localhost:5173

---

## 📞 CONTACTO Y SOPORTE

Para problemas o consultas:

1. **Verificación:** `.\verify_installation.bat`
2. **Documentación:** Consulta este índice
3. **Logs:** Revisa la consola del servidor
4. **DevTools:** F12 en el navegador

---

## 🎊 ¡LISTO PARA COMENZAR!

**Comando para iniciar:**
```bash
.\start_project.bat
```

**Acceso rápido:**
- 🌐 Frontend: http://localhost:5173/hr/dashboard
- ⚙️ Admin: http://localhost:8000/admin
- 🔌 API: http://localhost:8000/employees/api/

---

**Última actualización:** 21 de enero de 2026  
**Versión:** 1.0.0
