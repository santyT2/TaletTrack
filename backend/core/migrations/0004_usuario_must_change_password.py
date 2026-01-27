from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_alter_usuario_role'),
    ]

    operations = [
        migrations.AddField(
            model_name='usuario',
            name='must_change_password',
            field=models.BooleanField(default=False),
        ),
    ]
