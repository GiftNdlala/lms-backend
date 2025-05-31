from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, StudentViewSet, InstructorViewSet, 
    login, CustomTokenRefreshView
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'students', StudentViewSet, basename='student')
router.register(r'instructors', InstructorViewSet, basename='instructor')

urlpatterns = [
    path('login/', login, name='login'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('', include(router.urls)),
    path('student/profile/', StudentViewSet.as_view({'get': 'profile'}), name='student-profile'),
    path('instructor/profile/', InstructorViewSet.as_view({'get': 'profile'}), name='instructor-profile'),
] 