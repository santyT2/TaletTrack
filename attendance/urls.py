from django.urls import path
from .views import MarcarAsistenciaView, ExportarAsistenciaExcelView

app_name = 'attendance'

urlpatterns = [
    path('marcar/', MarcarAsistenciaView.as_view(), name='marcar-asistencia'),
    path('exportar-excel/', ExportarAsistenciaExcelView.as_view(), name='exportar-asistencia-excel'),
]