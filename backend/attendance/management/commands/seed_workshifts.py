from django.core.management.base import BaseCommand
from django.db import transaction
from attendance.models import WorkShift
from core.models import Empresa

DEFAULT_SHIFTS = [
    {
        "name": "Turno Administrativo (L-V 09:00 - 18:00)",
        "start_time": "09:00",
        "end_time": "18:00",
        "days": [0, 1, 2, 3, 4],
    },
    {
        "name": "Turno Operativo Mañana (L-S 07:00 - 15:00)",
        "start_time": "07:00",
        "end_time": "15:00",
        "days": [0, 1, 2, 3, 4, 5],
    },
    {
        "name": "Turno Operativo Tarde (L-S 14:00 - 22:00)",
        "start_time": "14:00",
        "end_time": "22:00",
        "days": [0, 1, 2, 3, 4, 5],
    },
]


class Command(BaseCommand):
    help = "Crea turnos WorkShift por defecto si no existen"

    def handle(self, *args, **options):
        empresas = Empresa.objects.all()
        if not empresas.exists():
            self.stdout.write(self.style.WARNING("No hay empresas registradas; no se crearon turnos."))
            return

        created_total = 0
        with transaction.atomic():
            for empresa in empresas:
                for shift in DEFAULT_SHIFTS:
                    obj, created = WorkShift.objects.get_or_create(
                        empresa=empresa,
                        name=shift["name"],
                        defaults={
                            "start_time": shift["start_time"],
                            "end_time": shift["end_time"],
                            "days": shift["days"],
                        },
                    )
                    if created:
                        created_total += 1
        if created_total:
            self.stdout.write(self.style.SUCCESS(f"Turnos creados: {created_total}"))
        else:
            self.stdout.write("Ya existían los turnos por defecto.")
