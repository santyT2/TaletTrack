from django.shortcuts import render
from django.utils import timezone
from datetime import date
from employees.models import Empleado, Sucursal
from attendance.models import RegistroAsistencia

def home(request):
    # Datos para las tarjetas de resumen
    total_empleados = Empleado.objects.filter(estado='activo').count()
    total_sucursales = Sucursal.objects.count()

    # Asistencia de hoy
    hoy = timezone.now().date()
    registros_hoy = RegistroAsistencia.objects.filter(fecha_hora__date=hoy)

    asistencia_hoy = registros_hoy.filter(tipo='ENTRADA').count()
    atrasos_hoy = registros_hoy.filter(tipo='ENTRADA', es_tardanza=True).count()
    faltas_hoy = total_empleados - asistencia_hoy

    # Solicitudes pendientes (por ahora simulado)
    solicitudes_pendientes = 0  # TODO: implementar cuando haya sistema de solicitudes

    # Actividad reciente (simulada por ahora)
    actividades_recientes = [
        {
            'titulo': 'Nuevo empleado registrado',
            'descripcion': 'Juan Pérez se unió al equipo',
            'fecha': 'Hace 2 horas',
            'color': 'success'
        },
        {
            'titulo': 'Reporte de asistencia generado',
            'descripcion': 'Nómina del mes generada',
            'fecha': 'Hace 4 horas',
            'color': 'info'
        },
        {
            'titulo': 'Actualización de datos',
            'descripcion': 'Información de empleados actualizada',
            'fecha': 'Hace 1 día',
            'color': 'warning'
        }
    ]

    context = {
        'total_empleados': total_empleados,
        'total_sucursales': total_sucursales,
        'asistencia_hoy': asistencia_hoy,
        'atrasos_hoy': atrasos_hoy,
        'faltas_hoy': faltas_hoy,
        'solicitudes_pendientes': solicitudes_pendientes,
        'actividades_recientes': actividades_recientes,
    }

    return render(request, 'core/dashboard.html', context)
