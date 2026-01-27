# employees/urls.py - CONFIGURACIÓN API REST (HEADLESS)
# ========================================================
# SOLO rutas API - No HTML rendering
# ========================================================

from django.urls import path, include
from rest_framework.routers import DefaultRouter
import rest_framework.routers as drf_routers

# Parche: evitar ValueError por registro duplicado de drf_format_suffix con múltiples routers
_original_format_suffix = drf_routers.format_suffix_patterns


def _safe_format_suffix(urlpatterns):
    try:
        return _original_format_suffix(urlpatterns)
    except ValueError:
        return urlpatterns


drf_routers.format_suffix_patterns = _safe_format_suffix
from .views import (
    EmpresaViewSet,
    EmpleadoViewSet,
    SucursalViewSet,
    PuestoViewSet,
    ContratoViewSet,
    DocumentoEmpleadoViewSet,
    TipoAusenciaViewSet,
    SolicitudAusenciaViewSet,
    SaldoVacacionesViewSet,
    KPIViewSet,
    ResultadoKPIViewSet,
    EmployeePortalViewSet,
    # Legacy
    CargoViewSet,
    ContractViewSet,
    LeaveRequestViewSet,
    OnboardingTaskViewSet,
)
# Importar funciones API adicionales desde api_views.py si existen
try:
    from .api_views import kpi_dashboard, organigram
    HAS_EXTRA_API = True
except ImportError:
    HAS_EXTRA_API = False

app_name = 'employees'

# Configurar Router DRF para ViewSets
router = DefaultRouter()
router.register(r'empresas', EmpresaViewSet, basename='api-empresas')
router.register(r'empleados', EmpleadoViewSet, basename='api-empleados')
router.register(r'sucursales', SucursalViewSet, basename='api-sucursales')
router.register(r'puestos', PuestoViewSet, basename='api-puestos')
router.register(r'contratos', ContratoViewSet, basename='api-contratos')
router.register(r'documentos', DocumentoEmpleadoViewSet, basename='api-documentos-empleado')
router.register(r'tipos-ausencia', TipoAusenciaViewSet, basename='api-tipos-ausencia')
router.register(r'solicitudes-ausencia', SolicitudAusenciaViewSet, basename='api-solicitudes-ausencia')
router.register(r'saldos-vacaciones', SaldoVacacionesViewSet, basename='api-saldos-vacaciones')
router.register(r'kpis', KPIViewSet, basename='api-kpis')
router.register(r'resultados-kpi', ResultadoKPIViewSet, basename='api-resultados-kpi')
router.register(r'portal', EmployeePortalViewSet, basename='api-portal')

# Legacy endpoints
router.register(r'cargos', CargoViewSet, basename='api-cargos')
router.register(r'contratos-legado', ContractViewSet, basename='api-contratos-legado')
router.register(r'solicitudes-legado', LeaveRequestViewSet, basename='api-solicitudes-legado')
router.register(r'onboarding', OnboardingTaskViewSet, basename='api-onboarding')

# ========================================================
# ROUTES - SOLO API REST
# ========================================================

urlpatterns = [
    # Router DRF (API REST)
    path('api/', include(router.urls)),
]

# Agregar endpoints adicionales si existen en api_views.py
if HAS_EXTRA_API:
    urlpatterns += [
        path('api/dashboard/kpi/', kpi_dashboard, name='api-kpi-dashboard'),
        path('api/organigram/', organigram, name='api-organigram'),
    ]

# ========================================================
# ENDPOINTS CLAVE (AUTO-GENERADOS POR DRF ROUTER):
# ========================================================
# Empresas:              /api/employees/api/empresas/
# Empleados:             /api/employees/api/empleados/
# Sucursales:            /api/employees/api/sucursales/
# Puestos:               /api/employees/api/puestos/
# Contratos:             /api/employees/api/contratos/
# Documentos:            /api/employees/api/documentos/
# Tipos Ausencia:        /api/employees/api/tipos-ausencia/
# Solicitudes Ausencia:  /api/employees/api/solicitudes-ausencia/
# Saldos Vacaciones:     /api/employees/api/saldos-vacaciones/
# KPIs:                  /api/employees/api/kpis/
# Resultados KPI:        /api/employees/api/resultados-kpi/
# Legacy cargos:         /api/employees/api/cargos/
# Legacy contratos:      /api/employees/api/contratos-legado/
# Legacy solicitudes:    /api/employees/api/solicitudes-legado/
# Onboarding:            /api/employees/api/onboarding/
# ========================================================
