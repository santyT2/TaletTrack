from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html
from .models import Sucursal, Cargo, Empleado


@admin.register(Sucursal)
class SucursalAdmin(admin.ModelAdmin):
    """
    Configuración de la interfaz del admin para Sucursal.
    """
    list_display = ('nombre', 'ciudad', 'telefono', 'created_at')
    list_filter = ('ciudad', 'created_at')
    search_fields = ('nombre', 'direccion', 'ciudad')
    ordering = ['nombre']
    
    fieldsets = (
        ('Información General', {
            'fields': ('nombre', 'ciudad')
        }),
        ('Contacto', {
            'fields': ('direccion', 'telefono')
        }),
        ('Auditoría', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Cargo)
class CargoAdmin(admin.ModelAdmin):
    """
    Configuración de la interfaz del admin para Cargo.
    """
    list_display = ('nombre', 'nivel', 'salario_base', 'created_at')
    list_filter = ('nivel', 'created_at')
    search_fields = ('nombre', 'descripcion')
    ordering = ['nombre']
    
    fieldsets = (
        ('Información del Cargo', {
            'fields': ('nombre', 'descripcion')
        }),
        ('Compensación y Nivel', {
            'fields': ('salario_base', 'nivel_requerido')
        }),
        ('Auditoría', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Empleado)
class EmpleadoAdmin(admin.ModelAdmin):
    """
    Configuración de la interfaz del admin para Empleado.
    """
    list_display = (
        'nombre_completo',
        'documento',
        'empresa',
        'cargo',
        'sucursal',
        'estado',
        'fecha_ingreso',
        'delete_link'
    )
    list_filter = (
        'estado',
        'empresa',
        'cargo',
        'sucursal',
        'fecha_ingreso',
        'created_at'
    )
    search_fields = (
        'nombres',
        'apellidos',
        'documento',
        'email',
        'telefono'
    )
    ordering = ['apellidos', 'nombres']
    
    fieldsets = (
        ('Información Personal', {
            'fields': ('nombres', 'apellidos', 'documento', 'fecha_nacimiento', 'foto_url')
        }),
        ('Contacto', {
            'fields': ('email', 'telefono')
        }),
        ('Información Laboral', {
            'fields': ('empresa', 'cargo', 'sucursal', 'manager', 'fecha_ingreso', 'estado')
        }),
        ('Auditoría', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')
    
    def delete_link(self, obj):
        url = reverse('admin:employees_empleado_delete', args=[obj.pk])
        return format_html('<a href="{}" class="btn btn-danger btn-sm" onclick="return confirm(\'¿Eliminar a {} {}\')">Eliminar</a>', url, obj.nombres, obj.apellidos)
    
    delete_link.short_description = 'Acciones'
    
    # Mostrar cantidad de empleados por cargo
    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        extra_context['total_empleados'] = Empleado.objects.count()
        return super().changelist_view(request, extra_context)
