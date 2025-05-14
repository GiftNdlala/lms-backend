from django.db.models import Q
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import viewsets, permissions, status
from django.shortcuts import get_object_or_404
import logging
from .models import Module, ModuleEnrollment, Instructor
from .serializers import ModuleSerializer, ModuleEnrollmentSerializer

logger = logging.getLogger(__name__)

class IsInstructorOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        logger.debug(f"Checking permission for user: {request.user}")
        return bool(request.user and request.user.is_authenticated and 
                   (request.user.is_staff or hasattr(request.user, 'instructor')))

    def has_object_permission(self, request, view, obj):
        return bool(request.user.is_staff or 
                   (hasattr(request.user, 'instructor') and obj.instructor == request.user.instructor))

class ModuleViewSet(viewsets.ModelViewSet):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [IsInstructorOrAdmin]
    http_method_names = ['get', 'post', 'put', 'patch', 'delete']

    def get_queryset(self):
        logger.debug(f"Getting queryset for user: {self.request.user}")
        if self.request.user.is_staff:
            return Module.objects.all()
        return Module.objects.filter(
            Q(instructor__user=self.request.user) |
            Q(students__user=self.request.user)
        ).distinct()

    def perform_create(self, serializer):
        logger.debug(f"Creating module with data: {serializer.validated_data}")
        instructor = get_object_or_404(Instructor, user=self.request.user)
        serializer.save(instructor=instructor)

    def create(self, request, *args, **kwargs):
        logger.debug(f"Received POST request with data: {request.data}")
        logger.debug(f"Request method: {request.method}")
        logger.debug(f"Request user: {request.user}")
        logger.debug(f"Request auth: {request.auth}")
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        module = self.get_object()
        if not module.instructor.user == request.user and not request.user.is_staff:
            return Response(
                {"detail": "You are not authorized to view this information."},
                status=status.HTTP_403_FORBIDDEN
            )
        enrollments = ModuleEnrollment.objects.filter(module=module)
        serializer = ModuleEnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data) 