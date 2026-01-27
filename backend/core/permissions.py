from rest_framework.permissions import BasePermission


class IsAdminUser(BasePermission):
    """Permite solo a usuarios con rol ADMIN."""

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and getattr(user, "role", None) == "ADMIN")


class IsManagerUser(BasePermission):
    """Compatibilidad: ahora solo ADMIN (rol manager ya no existe)."""

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and getattr(user, "role", None) == "ADMIN"
        )


class IsOwner(BasePermission):
    """Un empleado solo puede ver/editar sus propios datos."""

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        # Admin tiene acceso completo
        if getattr(user, "role", None) == "ADMIN":
            return True

        # Caso empleado: validar propiedad
        candidate = getattr(obj, "user", None) or getattr(obj, "empleado", None)
        if candidate is not None:
            if hasattr(candidate, "pk"):
                return candidate.pk == user.pk
            candidate_id = getattr(candidate, "id", None)
            return candidate_id == user.pk

        # Fallback: si el objeto es el propio usuario
        if hasattr(obj, "pk"):
            return obj.pk == user.pk

        return False
