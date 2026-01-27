from rest_framework.permissions import BasePermission


class IsAdminOrManager(BasePermission):
    """Permite solo ADMIN/MANAGER (o staff)."""

    def has_permission(self, request, view):
        role = getattr(request.user, "role", None)
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.is_staff or role in {"ADMIN", "MANAGER"})
        )
