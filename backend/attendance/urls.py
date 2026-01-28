# attendance/urls.py - CONFIGURACIÓN API REST (HEADLESS)
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
    MarcarAsistenciaView,
    AsistenciaHoyView,
    ExportarAsistenciaExcelView,
    RegistroAsistenciaViewSet,
    TurnoViewSet,
    WorkShiftViewSet,
    GeocercaViewSet,
    ReglaAsistenciaViewSet,
    EventoAsistenciaViewSet,
    JornadaCalculadaViewSet,
)

app_name = 'attendance'

# Configurar Router DRF para ViewSets
router = DefaultRouter()
router.register(r'registros', RegistroAsistenciaViewSet, basename='api-registros')
router.register(r'turnos', TurnoViewSet, basename='api-turnos')
router.register(r'workshifts', WorkShiftViewSet, basename='api-workshifts')
router.register(r'geocercas', GeocercaViewSet, basename='api-geocercas')
router.register(r'reglas', ReglaAsistenciaViewSet, basename='api-reglas-asistencia')
router.register(r'eventos', EventoAsistenciaViewSet, basename='api-eventos-asistencia')
router.register(r'jornadas', JornadaCalculadaViewSet, basename='api-jornadas-calculadas')

# ========================================================
# ROUTES - API REST
# ========================================================

urlpatterns = [
    # Endpoints de marcación
    path('marcar/', MarcarAsistenciaView.as_view(), name='marcar-asistencia'),
    path('today/', AsistenciaHoyView.as_view(), name='asistencia-hoy'),
    path('exportar-excel/', ExportarAsistenciaExcelView.as_view(), name='exportar-asistencia-excel'),
    
    # Router DRF (ViewSet de Registros)
    path('', include(router.urls)),
]

# ========================================================
# ENDPOINTS DISPONIBLES:
# ========================================================
# 
# MARCACIÓN:
#   - POST   /api/attendance/marcar/         → Marcar entrada/salida
#   - GET    /api/attendance/today/          → Registros de hoy con coords
#   - GET    /api/attendance/exportar-excel/ → Descargar pre-nómina Excel
# 
# REGISTROS (CRUD):     /api/attendance/registros/
# TURNOS:               /api/attendance/turnos/
# GEOCERCAS:            /api/attendance/geocercas/
# REGLAS:               /api/attendance/reglas/
# EVENTOS:              /api/attendance/eventos/
# JORNADAS:             /api/attendance/jornadas/
# ========================================================