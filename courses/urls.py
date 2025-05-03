from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Main router for courses
router = DefaultRouter()
router.register(r'', views.CourseViewSet, basename='courses')

# Nested routers for course-related resources
module_router = DefaultRouter()
module_router.register(r'modules', views.ModuleViewSet, basename='modules')

lesson_router = DefaultRouter()
lesson_router.register(r'lessons', views.LessonViewSet, basename='lessons')

assignment_router = DefaultRouter()
assignment_router.register(r'assignments', views.AssignmentViewSet, basename='assignments')

# E-Wallet related routers
ewallet_router = DefaultRouter()
ewallet_router.register(r'ewallets', views.EWalletViewSet, basename='ewallets')
ewallet_router.register(r'transactions', views.TransactionViewSet, basename='transactions')
ewallet_router.register(r'withdrawal-requests', views.WithdrawalRequestViewSet, basename='withdrawal-requests')

# Assessment related routers
assessment_router = DefaultRouter()
assessment_router.register(r'assessments', views.AssessmentViewSet, basename='assessments')
assessment_router.register(r'questions', views.QuestionViewSet, basename='questions')
assessment_router.register(r'assignments', views.AssessmentAssignmentViewSet, basename='assessment-assignments')

# Student progress router
progress_router = DefaultRouter()
progress_router.register(r'progress', views.StudentProgressViewSet, basename='progress')

# Enrollment router
enrollment_router = DefaultRouter()
enrollment_router.register(r'enrollments', views.CourseEnrollmentViewSet, basename='enrollments')

urlpatterns = [
    # Course base routes
    path('', include(router.urls)),
    
    # Nested routes for a specific course
    path('<int:course_pk>/', include([
        path('', include(module_router.urls)),
        path('modules/<int:module_pk>/', include([
            path('', include(lesson_router.urls)),
            path('lessons/<int:lesson_pk>/', include([
                path('', include(assignment_router.urls)),
            ])),
        ])),
        path('', include(assessment_router.urls)),
        path('assessments/<int:assessment_pk>/', include([
            path('', include(assessment_router.urls)),
        ])),
        path('', include(progress_router.urls)),
        path('', include(enrollment_router.urls)),
    ])),
    
    # E-Wallet routes
    path('ewallets/', include(ewallet_router.urls)),
] 