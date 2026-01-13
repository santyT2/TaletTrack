import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'talent_track.settings')
django.setup()

from django.contrib.auth.models import User

# Obtener o crear el superusuario
user, created = User.objects.get_or_create(
    username='admin',
    defaults={
        'email': 'admin@talenttrack.local',
        'is_staff': True,
        'is_superuser': True
    }
)

# Establecer la contraseña
user.set_password('1150579686')
user.save()

if created:
    print('✅ Superusuario creado exitosamente')
else:
    print('✅ Superusuario actualizado')

print(f'Usuario: {user.username}')
print(f'Email: {user.email}')
print(f'Es Superusuario: {user.is_superuser}')
