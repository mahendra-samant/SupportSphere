from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from rest_framework import pagination, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from users.permissions import IsAdmin, is_admin, is_agent

from .models import Category, Comment, Ticket, TicketHistory
from .serializers import (
    CategorySerializer,
    CommentSerializer,
    TicketHistorySerializer,
    TicketSerializer,
)


class TicketPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        user = request.user
        if is_admin(user):
            return True
        if is_agent(user):
            if obj.assigned_to_id != user.id:
                return False
            # Agents can view/comment and update status, but cannot edit ticket details.
            return (
                request.method in permissions.SAFE_METHODS or request.method == "PATCH"
            )
        return (
            obj.created_by_id == user.id and request.method in permissions.SAFE_METHODS
        )


class TicketPagination(pagination.PageNumberPagination):
    page_size = 8
    page_size_query_param = "page_size"
    max_page_size = 50


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]


class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.select_related(
        "category", "created_by", "assigned_to"
    ).all()
    serializer_class = TicketSerializer
    permission_classes = [TicketPermission]
    pagination_class = TicketPagination

    def get_queryset(self):
        queryset = self.queryset
        user = self.request.user
        if is_agent(user):
            queryset = queryset.filter(assigned_to=user)
        elif not is_admin(user):
            queryset = queryset.filter(created_by=user)

        search = self.request.query_params.get("search", "").strip()
        status_filter = self.request.query_params.get("status", "").strip()
        priority = self.request.query_params.get("priority", "").strip()
        category = self.request.query_params.get("category", "").strip()
        ordering = self.request.query_params.get("ordering", "-created_at").strip()
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if priority:
            queryset = queryset.filter(priority=priority)
        if category:
            queryset = queryset.filter(category_id=category)
        if ordering in {"created_at", "-created_at", "updated_at", "-updated_at"}:
            queryset = queryset.order_by(ordering)
        return queryset

    def get_permissions(self):
        if self.action == "destroy":
            return [IsAdmin()]
        return [permission() for permission in self.permission_classes]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["get"])
    def history(self, request, pk=None):
        ticket = self.get_object()
        history = TicketHistory.objects.select_related("actor").filter(ticket=ticket)
        return Response(
            TicketHistorySerializer(history, many=True).data, status=status.HTTP_200_OK
        )

    @action(detail=False, methods=["get"])
    def dashboard(self, request):
        queryset = self.get_queryset()
        by_status = dict(queryset.values_list("status").annotate(total=Count("id")))
        by_priority = dict(queryset.values_list("priority").annotate(total=Count("id")))
        recent = queryset.order_by("-created_at")[:5]
        payload = {
            "total": queryset.count(),
            "open": by_status.get(Ticket.STATUS_OPEN, 0),
            "in_progress": by_status.get(Ticket.STATUS_IN_PROGRESS, 0),
            "resolved": by_status.get(Ticket.STATUS_RESOLVED, 0),
            "closed": by_status.get(Ticket.STATUS_CLOSED, 0),
            "cancelled": by_status.get(Ticket.STATUS_CANCELLED, 0),
            "critical": by_priority.get(Ticket.PRIORITY_CRITICAL, 0),
            "by_status": by_status,
            "by_priority": by_priority,
            "recent": TicketSerializer(
                recent, many=True, context={"request": request}
            ).data,
        }
        return Response(payload, status=status.HTTP_200_OK)


class TicketCommentListCreateView(APIView):
    def get_ticket_for_user(self, request, ticket_id):
        ticket = get_object_or_404(
            Ticket.objects.select_related("created_by", "assigned_to"), id=ticket_id
        )
        user = request.user
        allowed = (
            is_admin(user)
            or ticket.created_by_id == user.id
            or (is_agent(user) and ticket.assigned_to_id == user.id)
        )
        if not allowed:
            return None
        return ticket

    def get(self, request, ticket_id):
        ticket = self.get_ticket_for_user(request, ticket_id)
        if ticket is None:
            return Response(
                {"detail": "You do not have permission to access this ticket."},
                status=status.HTTP_403_FORBIDDEN,
            )
        comments = Comment.objects.select_related("ticket", "author").filter(
            ticket=ticket
        )
        return Response(
            CommentSerializer(comments, many=True).data, status=status.HTTP_200_OK
        )

    def post(self, request, ticket_id):
        ticket = self.get_ticket_for_user(request, ticket_id)
        if ticket is None:
            return Response(
                {"detail": "You do not have permission to access this ticket."},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = CommentSerializer(
            data=request.data, context={"request": request, "ticket": ticket}
        )
        if serializer.is_valid():
            serializer.save(ticket=ticket)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
