from django.contrib.auth.models import User
from django.utils import timezone

from rest_framework import viewsets, generics, permissions
from rest_framework.authentication import SessionAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Event, Participant, Registration
from .serializers import (
    EventSerializer,
    ParticipantSerializer,
    RegistrationSerializer,
    UserRegisterSerializer,
)
from .permissions import IsAdminOrReadOnly


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by("start_time")
    serializer_class = EventSerializer
    authentication_classes = [JWTAuthentication, SessionAuthentication]

    def get_permissions(self):
        # 游客可以看活动列表和详情
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        # 创建/修改/删除活动只能管理员
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
    permission_classes = [permissions.IsAdminUser]


class RegistrationViewSet(viewsets.ModelViewSet):
    queryset = Registration.objects.all()
    serializer_class = RegistrationSerializer
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]


class RegisterUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer


class CurrentUserView(APIView):
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
            "is_staff": request.user.is_staff,
            "is_superuser": request.user.is_superuser,
        })