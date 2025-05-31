from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from django.core.exceptions import ValidationError
from .models import Assignment
from courses.models import Module
from .serializers import AssignmentSerializer
import logging
from modules.models import QuizAnswer, QuizAttempt


logger = logging.getLogger(__name__)

class AssignmentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = AssignmentSerializer

    def get_queryset(self):
        logger.debug(f"get_queryset called for user: {self.request.user}")
        user = self.request.user
        # Only instructors can access
        if not hasattr(user, 'instructor'):
            logger.debug("User is not an instructor")
            return Assignment.objects.none()
        # Filter assignments by instructor directly
        queryset = Assignment.objects.filter(instructor=user.instructor)
        logger.debug(f"Returning {queryset.count()} assignments")
        return queryset

    def list(self, request, *args, **kwargs):
        logger.debug("AssignmentViewSet.list CALLED")
        logger.debug(f"Request path: {request.path}")
        logger.debug(f"Request method: {request.method}")
        logger.debug(f"Request user: {request.user}")
        user = request.user
        if not hasattr(user, 'instructor'):
            logger.debug("User is not an instructor")
            return Response({"detail": "Only instructors can access this view"}, status=status.HTTP_403_FORBIDDEN)
        return super().list(request, *args, **kwargs)

    def perform_create(self, serializer):
        module_id = self.request.data.get('module')
        module = None
        if module_id:
            try:
                module = Module.objects.get(pk=module_id)
            except Module.DoesNotExist:
                module = None
        serializer.save(instructor=self.request.user.instructor, module=module)

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except ValidationError as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def list_assignments(self, request):
        """Custom action to list assignments"""
        assignments = self.get_queryset()
        serializer = self.get_serializer(assignments, many=True)
        return Response(serializer.data) 