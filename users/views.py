from django.contrib.auth import authenticate
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from django.contrib.auth import get_user_model
from django.db.models import Q
from django.shortcuts import get_object_or_404

from .permissions import IsAdmin
from .serializers import CustomerSerializer

from .permissions import IsAdmin
from .serializers import (
    AuthUserSerializer,
    LoginSerializer,
    RegisterSerializer,
    UserSerializer,
)


class RegisterAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # Public sign-up must never be able to create staff or admin accounts.
        payload = request.data.copy()
        payload["role"] = RegisterSerializer.ROLE_CUSTOMER
        serializer = RegisterSerializer(data=payload)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                AuthUserSerializer(user).data, status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        username_or_email = serializer.validated_data["username_or_email"].strip()
        password = serializer.validated_data["password"]
        user = authenticate(
            request=request,
            username=(
                username_or_email.lower()
                if "@" in username_or_email
                else username_or_email
            ),
            password=password,
        )
        if user is None:
            return Response(
                {"detail": "Invalid email or password."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(AuthUserSerializer(user).data, status=status.HTTP_200_OK)


class UserListCreateAPIView(APIView):
    # Only administrators can list users or create agents/admins/customers.
    permission_classes = [IsAdmin]

    def get(self, request):
        users = UserSerializer.Meta.model.objects.order_by("date_joined")
        return Response(
            UserSerializer(users, many=True).data, status=status.HTTP_200_OK
        )

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


User = get_user_model()


class CustomerListCreateAPIView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        customers = User.objects.filter(is_staff=False, is_superuser=False).order_by(
            "-date_joined"
        )

        search = request.query_params.get("search", "").strip()

        if search:
            customers = customers.filter(
                Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(email__icontains=search)
            )

        serializer = CustomerSerializer(customers, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CustomerSerializer(data=request.data)

        if serializer.is_valid():
            customer = serializer.save()
            return Response(
                CustomerSerializer(customer).data, status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomerDetailAPIView(APIView):
    permission_classes = [IsAdmin]

    def get_customer(self, pk):
        return get_object_or_404(User, pk=pk, is_staff=False, is_superuser=False)

    def get(self, request, pk):
        customer = self.get_customer(pk)
        return Response(CustomerSerializer(customer).data)

    def patch(self, request, pk):
        customer = self.get_customer(pk)
        serializer = CustomerSerializer(customer, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
