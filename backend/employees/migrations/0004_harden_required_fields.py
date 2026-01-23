from __future__ import annotations

import uuid
from django.db import migrations, models
from django.db.models import Q


def assign_defaults(apps, schema_editor):
    Empresa = apps.get_model('core', 'Empresa')
    Sucursal = apps.get_model('employees', 'Sucursal')
    Puesto = apps.get_model('employees', 'Puesto')
    Empleado = apps.get_model('employees', 'Empleado')

    empresa_default, _ = Empresa.objects.get_or_create(
        ruc_nit='9999999999',
        defaults={
            'razon_social': 'Demo Corp',
            'nombre_comercial': 'Demo Corp',
            'pais': 'EC',
            'moneda': 'USD',
            'estado': 'activo',
        },
    )

    sucursal_default, _ = Sucursal.objects.get_or_create(
        empresa=empresa_default,
        nombre='Sede Central',
        defaults={
            'tipo': 'sede',
            'ciudad': 'Quito',
            'direccion': 'Av. Principal 123',
            'estado': 'activo',
        },
    )

    puesto_default, _ = Puesto.objects.get_or_create(
        empresa=empresa_default,
        nombre='Puesto General',
        unidad=sucursal_default,
        defaults={
            'nivel': 'junior',
            'salario_referencial': 0,
        },
    )

    # Sucursales sin empresa
    Sucursal.objects.filter(empresa__isnull=True).update(empresa=empresa_default)

    # Puestos sin empresa o unidad
    Puesto.objects.filter(empresa__isnull=True).update(empresa=empresa_default)
    Puesto.objects.filter(unidad__isnull=True).update(unidad=sucursal_default)

    # Empleados sin llaves foráneas o documento
    empleados = Empleado.objects.filter(
        Q(empresa__isnull=True) | Q(sucursal__isnull=True) | Q(puesto__isnull=True) | Q(documento__isnull=True) | Q(documento='')
    )

    for emp in empleados:
        if emp.empresa_id is None:
            emp.empresa = empresa_default
        if emp.sucursal_id is None:
            emp.sucursal = sucursal_default
        if emp.puesto_id is None:
            emp.puesto = puesto_default
        if not emp.documento:
            # Garantizar unicidad temporal
            emp.documento = f"DOC-AUTO-{uuid.uuid4().hex[:10]}"
        emp.save(update_fields=['empresa', 'sucursal', 'puesto', 'documento'])


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
        ('employees', '0003_contrato_documentoempleado_kpi_puesto_resultadokpi_and_more'),
    ]

    operations = [
        migrations.RunPython(assign_defaults, noop_reverse),
        migrations.AlterField(
            model_name='empleado',
            name='empresa',
            field=models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='empleados', to='core.empresa'),
        ),
        migrations.AlterField(
            model_name='empleado',
            name='documento',
            field=models.CharField(max_length=30, unique=True),
        ),
        migrations.AlterField(
            model_name='empleado',
            name='puesto',
            field=models.ForeignKey(on_delete=models.deletion.PROTECT, related_name='empleados', to='employees.puesto'),
        ),
        migrations.AlterField(
            model_name='empleado',
            name='sucursal',
            field=models.ForeignKey(on_delete=models.deletion.PROTECT, related_name='empleados', to='employees.sucursal'),
        ),
        migrations.AlterField(
            model_name='puesto',
            name='empresa',
            field=models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='puestos', to='core.empresa'),
        ),
        migrations.AlterField(
            model_name='puesto',
            name='unidad',
            field=models.ForeignKey(on_delete=models.deletion.PROTECT, related_name='puestos', to='employees.sucursal'),
        ),
        migrations.AlterField(
            model_name='sucursal',
            name='empresa',
            field=models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='sucursales', to='core.empresa'),
        ),
    ]