from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'instructor/modules', views.ModuleViewSet, basename='instructor-module')
router.register(r'student/modules', views.StudentModuleViewSet, basename='student-module')
router.register(r'instructor/sections', views.ModuleSectionViewSet, basename='instructor-section')
router.register(r'instructor/section-contents', views.SectionContentViewSet, basename='instructor-section-content')

urlpatterns = [
    path('', include(router.urls)),
    
    # Student Grades URL
    path('student/grades/', views.student_grades, name='student_grades'),
    
    # Quiz URLs
    path('modules/<int:module_id>/quizzes/', views.instructor_quizzes, name='instructor_quizzes'),
    path('modules/<int:module_id>/quizzes/create/', views.create_quiz, name='create_quiz'),
    path('quizzes/<int:quiz_id>/questions/', views.add_quiz_question, name='add_quiz_question'),
    path('quizzes/<int:quiz_id>/get-questions/', views.get_quiz_questions, name='get_quiz_questions'),
    path('quizzes/<int:quiz_id>/publish/', views.publish_quiz, name='publish_quiz'),
    path('student/modules/<int:module_id>/quizzes/', views.student_quizzes, name='student_quizzes'),
    path('quizzes/<int:quiz_id>/attempt/', views.start_quiz_attempt, name='start_quiz_attempt'),
    path('quiz-attempts/<int:attempt_id>/submit/', views.submit_quiz_attempt, name='submit_quiz_attempt'),
    
    # Quiz Page URLs
    path('instructor/modules/<int:module_id>/quiz/', views.instructor_quiz_page, name='instructor_quiz_page'),
    path('student/modules/<int:module_id>/quiz/', views.student_quiz_page, name='student_quiz_page'),
    path('instructor/quizzes/', views.instructor_all_quizzes, name='instructor_all_quizzes'),
    path('student/quizzes/', views.student_all_quizzes, name='student_all_quizzes'),
    
    # Student Assignment Detail URL
    path('student/assignments/<int:assignment_id>/', views.student_assignment_detail, name='student_assignment_detail'),
    # Student Assignment Submit URL
    path('student/assignments/<int:assignment_id>/submit/', views.student_assignment_submit, name='student_assignment_submit'),
] 