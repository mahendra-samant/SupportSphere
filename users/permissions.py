from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """Only Django superusers are SupportSphere administrators."""

    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and request.user.is_superuser
        )


class IsAdminOrAgent(permissions.BasePermission):
    """Authenticated administrators and support agents."""

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and user.is_authenticated and (user.is_superuser or user.is_staff)
        )


def is_admin(user):
    return bool(user and user.is_authenticated and user.is_superuser)


def is_agent(user):
    return bool(
        user and user.is_authenticated and user.is_staff and not user.is_superuser
    )
