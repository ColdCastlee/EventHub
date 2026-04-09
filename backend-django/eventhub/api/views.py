from django.contrib.auth.models import User
from django.utils import timezone

from rest_framework import viewsets, generics, permissions, status
from rest_framework.authentication import SessionAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import Event, Participant, Registration
from .serializers import (
    EventSerializer,
    ParticipantSerializer,
    ParticipantSelfUpdateSerializer,
    RegistrationSerializer,
    UserRegisterSerializer,
    AdminParticipantCreateSerializer,
)


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by("start_time")
    serializer_class = EventSerializer
    authentication_classes = [JWTAuthentication, SessionAuthentication]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        queryset = Event.objects.all().order_by("start_time")
        status_param = self.request.query_params.get("status")
        now = timezone.now()

        if status_param == "coming":
            queryset = queryset.filter(start_time__gt=now)
        elif status_param == "ongoing":
            queryset = queryset.filter(start_time__lte=now, end_time__gte=now)
        elif status_param == "finished":
            queryset = queryset.filter(end_time__lt=now)

        return queryset


class ParticipantViewSet(viewsets.ModelViewSet):
    queryset = Participant.objects.all()
    serializer_class = ParticipantSerializer
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        is_admin = (
            user.is_staff
            or user.is_superuser
            or (
                hasattr(user, "participant")
                and user.participant.role == "admin"
            )
        )

        if is_admin:
            return Participant.objects.all().order_by("id")

        if hasattr(user, "participant"):
            return Participant.objects.filter(user=user)

        return Participant.objects.none()

    def get_serializer_class(self):
        user = self.request.user

        is_admin = (
            user.is_staff
            or user.is_superuser
            or (
                hasattr(user, "participant")
                and user.participant.role == "admin"
            )
        )

        if self.action == "create" and is_admin:
            return AdminParticipantCreateSerializer

        if self.action in ["update", "partial_update", "me"] and not is_admin:
            return ParticipantSelfUpdateSerializer

        return ParticipantSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()

        is_admin = (
            request.user.is_staff
            or request.user.is_superuser
            or (
                hasattr(request.user, "participant")
                and request.user.participant.role == "admin"
            )
        )

        if not is_admin and instance.user != request.user:
            return Response(
                {"detail": "You do not have permission to view this participant."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        is_admin = (
            request.user.is_staff
            or request.user.is_superuser
            or (
                hasattr(request.user, "participant")
                and request.user.participant.role == "admin"
            )
        )

        if not is_admin:
            return Response(
                {"detail": "Only admins can create participants manually."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        participant = serializer.save()

        return Response(
            ParticipantSerializer(participant).data,
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        is_admin = (
            request.user.is_staff
            or request.user.is_superuser
            or (
                hasattr(request.user, "participant")
                and request.user.participant.role == "admin"
            )
        )

        if not is_admin and instance.user != request.user:
            return Response(
                {"detail": "You can only update your own participant profile."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()

        is_admin = (
            request.user.is_staff
            or request.user.is_superuser
            or (
                hasattr(request.user, "participant")
                and request.user.participant.role == "admin"
            )
        )

        if not is_admin and instance.user != request.user:
            return Response(
                {"detail": "You can only update your own participant profile."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        is_admin = (
            request.user.is_staff
            or request.user.is_superuser
            or (
                hasattr(request.user, "participant")
                and request.user.participant.role == "admin"
            )
        )

        if not is_admin:
            return Response(
                {"detail": "Only admins can delete participants."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=["get", "patch"], url_path="me")
    def me(self, request):
        if not hasattr(request.user, "participant"):
            return Response(
                {"detail": "Participant profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        participant = request.user.participant

        if request.method == "GET":
            serializer = ParticipantSerializer(participant)
            return Response(serializer.data)

        serializer = ParticipantSelfUpdateSerializer(
            participant,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(ParticipantSerializer(participant).data)


class RegistrationViewSet(viewsets.ModelViewSet):
    queryset = Registration.objects.all().order_by("-registered_at")
    serializer_class = RegistrationSerializer
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        is_admin = (
            user.is_staff
            or user.is_superuser
            or (
                hasattr(user, "participant")
                and user.participant.role == "admin"
            )
        )

        if is_admin:
            return Registration.objects.all().order_by("-registered_at")

        if hasattr(user, "participant"):
            return Registration.objects.filter(
                participant=user.participant
            ).order_by("-registered_at")

        return Registration.objects.none()


class RegisterUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer


class CurrentUserView(APIView):
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        participant_data = None

        if hasattr(request.user, "participant"):
            participant_data = {
                "participant_id": request.user.participant.id,
                "first_name": request.user.participant.first_name,
                "last_name": request.user.participant.last_name,
                "email": request.user.participant.email,
                "phone": request.user.participant.phone,
                "role": request.user.participant.role,
            }

        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
            "is_staff": request.user.is_staff,
            "is_superuser": request.user.is_superuser,
            "participant": participant_data,
        })