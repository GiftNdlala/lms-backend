from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, StudentViewSet, InstructorViewSet, 
    login, CreateStudentView, InstructorStudentViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'students', StudentViewSet, basename='student')
router.register(r'instructors', InstructorViewSet, basename='instructor')

# Create a separate router for instructor-specific endpoints
instructor_router = DefaultRouter()
instructor_router.register(r'students', InstructorStudentViewSet, basename='instructor-student')

urlpatterns = [
    path('login/', login, name='login'),
    path('instructors/', include(instructor_router.urls)),
    path('', include(router.urls)),
] 