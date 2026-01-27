from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('employees', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='LeaveRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Última actualización')),
                ('start_date', models.DateField()),
                ('end_date', models.DateField()),
                ('days', models.DecimalField(decimal_places=2, max_digits=5)),
                ('reason', models.TextField(blank=True)),
                ('status', models.CharField(choices=[('PENDING', 'Pendiente'), ('APPROVED', 'Aprobado'), ('REJECTED', 'Rechazado')], default='PENDING', max_length=20)),
                ('rejection_reason', models.TextField(blank=True, null=True)),
                ('approved_at', models.DateTimeField(blank=True, null=True)),
                ('approved_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='approved_leaves', to=settings.AUTH_USER_MODEL)),
                ('empleado', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='leave_requests', to='employees.empleado')),
            ],
            options={
                'verbose_name': 'Solicitud de Permiso',
                'verbose_name_plural': 'Solicitudes de Permiso',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='leaverequest',
            index=models.Index(fields=['empleado', 'status'], name='leaves_leave_emplead_5605b1_idx'),
        ),
        migrations.AddIndex(
            model_name='leaverequest',
            index=models.Index(fields=['start_date', 'end_date'], name='leaves_leave_start_d_c07e7d_idx'),
        ),
    ]
