from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AssignmentViewSet, AssignmentSubmissionUpdateView

router = DefaultRouter()
router.register(r'assignments', AssignmentViewSet, basename='assignment')

urlpatterns = [
    path('', include(router.urls)),
    path('submissions/<int:pk>/', AssignmentSubmissionUpdateView.as_view(), name='assignment_submission_update'),
] 