from django.contrib import admin

from .models import LeaveRequest


@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ("empleado", "start_date", "end_date", "status", "days")
    list_filter = ("status", "start_date")
    search_fields = ("empleado__nombres", "empleado__apellidos", "empleado__email")
