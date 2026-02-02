from dataclasses import dataclass
from datetime import date
from typing import List, Dict, Any

from django.db.models import Sum, DecimalField, Value
from django.db.models.functions import Coalesce

from attendance.models import AttendanceRecord
from employees.models import Empleado
from leaves.models import LeaveRequest as HRLeaveRequest


@dataclass
class PayrollIssue:
    employee_id: int
    employee_name: str
    level: str  # 'error' | 'warning'
    message: str


class PayrollCalculator:
    """Valida y calcula montos base de nómina devolviendo errores detallados en vez de fallar."""

    def __init__(self, start: date, end: date):
        self.start = start
        self.end = end

    def calculate(self) -> Dict[str, Any]:
        employees = (
            Empleado.objects.filter(estado="activo")
            .select_related("contract", "sucursal", "cargo")
            .all()
        )

        results: List[Dict[str, Any]] = []
        issues: List[PayrollIssue] = []

        for emp in employees:
            contract = getattr(emp, "contract", None)
            if not contract or not contract.is_active:
                issues.append(
                    PayrollIssue(
                        employee_id=emp.id,
                        employee_name=emp.nombre_completo,
                        level="error",
                        message=f"{emp.nombre_completo} no tiene contrato configurado",
                    )
                )
                continue

            salary = contract.salary
            if salary is None:
                issues.append(
                    PayrollIssue(
                        employee_id=emp.id,
                        employee_name=emp.nombre_completo,
                        level="error",
                        message=f"Salario no definido para {emp.nombre_completo}",
                    )
                )
                continue

            has_attendance = AttendanceRecord.objects.filter(
                employee=emp,
                timestamp__date__gte=self.start,
                timestamp__date__lte=self.end,
            ).exists()
            if not has_attendance:
                issues.append(
                    PayrollIssue(
                        employee_id=emp.id,
                        employee_name=emp.nombre_completo,
                        level="warning",
                        message="Sin asistencia registrada en el periodo (se calcula pago base)",
                    )
                )

            unexcused_days = (
                HRLeaveRequest.objects.filter(
                    empleado=emp,
                    status="REJECTED",
                    start_date__lte=self.end,
                    end_date__gte=self.start,
                )
                .aggregate(
                    total=Coalesce(
                        Sum("days", output_field=DecimalField(max_digits=7, decimal_places=2)),
                        Value(0, output_field=DecimalField(max_digits=7, decimal_places=2)),
                    )
                )
                .get("total")
            ) or 0

            days_worked = max(0, 30 - float(unexcused_days))
            base_salary = float(salary)
            estimated_payment = round((base_salary / 30) * days_worked, 2)

            results.append(
                {
                    "employee_id": emp.id,
                    "employee_name": emp.nombre_completo,
                    "branch": emp.sucursal.nombre if emp.sucursal else None,
                    "position": emp.cargo.nombre if emp.cargo else None,
                    "base_salary": base_salary,
                    "unexcused_days": float(unexcused_days),
                    "days_worked": days_worked,
                    "estimated_payment": estimated_payment,
                    "contract_id": contract.id,
                    "end_date": contract.end_date,
                }
            )

        return {
            "results": results,
            "issues": [issue.__dict__ for issue in issues],
        }
