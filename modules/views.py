from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.core.exceptions import PermissionDenied
from django.utils import timezone
import modules.views
from djoser.views import UserViewSet

from accounts.models import Student
from .models import (
    Module, ModuleContent, StudentModuleProgress, ModuleNotification,
    NotificationComment, ModuleAssignment, ModuleTest, Quiz, QuizQuestion, QuizChoice, QuizAttempt, QuizAnswer, AssignmentSubmission
)
from .serializers import (
    ModuleSerializer, ModuleContentSerializer, ModuleStudentManagementSerializer,
    StudentSerializer, ModuleNotificationSerializer, NotificationCommentSerializer,
    ModuleAssignmentSerializer, ModuleTestSerializer, AssignmentSubmissionSerializer
)
import mimetypes
from django.contrib.auth.decorators import login_required

# Create your views here.

@method_decorator(csrf_exempt, name='dispatch')
class ModuleViewSet(viewsets.ModelViewSet):
    serializer_class = ModuleSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'put', 'patch', 'delete']

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'instructor'):
            return Module.objects.filter(instructor=user.instructor)
        elif hasattr(user, 'student'):
            return Module.objects.filter(students=user.student)
        return Module.objects.all() # Debugging Step

    def create(self, request, *args, **kwargs):
        if not hasattr(request.user, 'instructor'):
            return Response(
                {"error": "Only instructors can create modules"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, 
            status=status.HTTP_201_CREATED, 
            headers=headers
        )

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user.instructor)

    @action(detail=True, methods=['post'])
    def manage_students(self, request, pk=None):
        module = self.get_object()
        serializer = ModuleStudentManagementSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        student_ids = serializer.validated_data['student_ids']
        action = serializer.validated_data['action']
        
        try:
            students = Student.objects.filter(id__in=student_ids)
            if action == 'add':
                module.students.add(*students)
                message = 'Students added successfully'
            else:
                module.students.remove(*students)
                message = 'Students removed successfully'
            
            return Response({'message': message}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        module = self.get_object()
        students = module.students.all()
        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get', 'post', 'delete'],
            serializer_class=ModuleContentSerializer,
            parser_classes=[MultiPartParser, FormParser])
    def contents(self, request, pk=None):
        module = self.get_object()
        contents = module.contents.all()
        serializer = ModuleContentSerializer(contents, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def notifications(self, request, pk=None):
        module = self.get_object()
        notifications = module.notifications.all()
        serializer = ModuleNotificationSerializer(notifications, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def assignments(self, request, pk=None):
        module = self.get_object()
        assignments = module.assignments.all()
        serializer = ModuleAssignmentSerializer(assignments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def tests(self, request, pk=None):
        module = self.get_object()
        tests = module.tests.all()
        serializer = ModuleTestSerializer(tests, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        module = self.get_object()
        if not module.students.filter(id=request.user.student.id).exists():
            raise PermissionDenied("You are not enrolled in this module")
        
        total_contents = module.contents.count()
        completed_contents = StudentModuleProgress.objects.filter(
            student=request.user.student,
            module=module,
            completed=True
        ).count()
        
        progress_percentage = (completed_contents / total_contents * 100) if total_contents > 0 else 0
        
        return Response({
            'module_id': module.id,
            'total_contents': total_contents,
            'completed_contents': completed_contents,
            'progress_percentage': round(progress_percentage, 2)
        })

@method_decorator(csrf_exempt, name='dispatch')
class StudentModuleViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ModuleSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'patch', 'post']

    def get_queryset(self):
        if not hasattr(self.request.user, 'student'):
            raise PermissionDenied("Only students can access this view")
        return Module.objects.filter(students=self.request.user.student)

    @action(detail=True, methods=['get'])
    def contents(self, request, pk=None):
        module = self.get_object()
        if not module.students.filter(id=request.user.student.id).exists():
            raise PermissionDenied("You are not enrolled in this module")
        
        contents = module.contents.all()
        serializer = ModuleContentSerializer(contents, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def notifications(self, request, pk=None):
        module = self.get_object()
        if not module.students.filter(id=request.user.student.id).exists():
            raise PermissionDenied("You are not enrolled in this module")
        
        notifications = module.notifications.all()
        serializer = ModuleNotificationSerializer(notifications, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        module = self.get_object()
        if not module.students.filter(id=request.user.student.id).exists():
            raise PermissionDenied("You are not enrolled in this module")
        
        notification_id = request.data.get('notification_id')
        text = request.data.get('text')
        
        if not notification_id or not text:
            return Response(
                {'error': 'notification_id and text are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            notification = module.notifications.get(id=notification_id)
            comment = NotificationComment.objects.create(
                notification=notification,
                user=request.user,
                text=text
            )
            serializer = NotificationCommentSerializer(comment)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ModuleNotification.DoesNotExist:
            return Response(
                {'error': 'Notification not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['get'])
    def assignments(self, request, pk=None):
        module = self.get_object()
        if not module.students.filter(id=request.user.student.id).exists():
            raise PermissionDenied("You are not enrolled in this module")
        
        assignments = module.assignments.all()
        serializer = ModuleAssignmentSerializer(assignments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def tests(self, request, pk=None):
        module = self.get_object()
        if not module.students.filter(id=request.user.student.id).exists():
            raise PermissionDenied("You are not enrolled in this module")
        
        tests = module.tests.all()
        serializer = ModuleTestSerializer(tests, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        module = self.get_object()
        if not module.students.filter(id=request.user.student.id).exists():
            raise PermissionDenied("You are not enrolled in this module")
        
        total_contents = module.contents.count()
        completed_contents = StudentModuleProgress.objects.filter(
            student=request.user.student,
            module=module,
            completed=True
        ).count()
        
        progress_percentage = (completed_contents / total_contents * 100) if total_contents > 0 else 0
        
        return Response({
            'module_id': module.id,
            'total_contents': total_contents,
            'completed_contents': completed_contents,
            'progress_percentage': round(progress_percentage, 2)
        })

    @action(detail=True, methods=['patch'])
    def mark_content_complete(self, request, pk=None):
        module = self.get_object()
        content_id = request.data.get('content_id')
        if not content_id:
            return Response(
                {'error': 'content_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            content = module.contents.get(id=content_id)
            progress, created = StudentModuleProgress.objects.get_or_create(
                student=request.user.student,
                module=module,
                content=content,
                defaults={'completed': True, 'completed_at': timezone.now()}
            )
            if not created and not progress.completed:
                progress.completed = True
                progress.completed_at = timezone.now()
                progress.save()
            return Response({
                'message': 'Content marked as completed',
                'progress': {
                    'total_contents': module.contents.count(),
                    'completed_contents': StudentModuleProgress.objects.filter(
                        student=request.user.student,
                        module=module,
                        completed=True
                    ).count()
                }
            })
        except ModuleContent.DoesNotExist:
            return Response(
                {'error': 'Content not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'], url_path='assignments/(?P<assignment_id>[^/.]+)/submit', parser_classes=[MultiPartParser, FormParser])
    def submit_assignment(self, request, pk=None, assignment_id=None):
        module = self.get_object()
        if not module.students.filter(id=request.user.student.id).exists():
            raise PermissionDenied("You are not enrolled in this module")
        try:
            assignment = module.assignments.get(id=assignment_id)
        except ModuleAssignment.DoesNotExist:
            return Response({'error': 'Assignment not found'}, status=status.HTTP_404_NOT_FOUND)
        # Check if already submitted
        if AssignmentSubmission.objects.filter(assignment=assignment, student=request.user.student).exists():
            return Response({'error': 'You have already submitted this assignment'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = AssignmentSubmissionSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(student=request.user.student, assignment=assignment)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def instructor_quizzes(request, module_id):
    module = get_object_or_404(Module, id=module_id)
    quizzes = Quiz.objects.filter(module=module)
    return Response({
        'quizzes': [{
            'id': quiz.id,
            'title': quiz.title,
            'description': quiz.description,
            'time_limit': quiz.time_limit.total_seconds(),
            'total_points': quiz.total_points,
            'is_published': quiz.is_published,
            'created_at': quiz.created_at,
            'updated_at': quiz.updated_at
        } for quiz in quizzes]
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_quiz(request, module_id):
    module = get_object_or_404(Module, id=module_id)
    data = request.data
    
    quiz = Quiz.objects.create(
        module=module,
        title=data['title'],
        description=data['description'],
        time_limit=data['time_limit'],
        total_points=data.get('total_points', 0)
    )
    
    return Response({
        'id': quiz.id,
        'title': quiz.title,
        'description': quiz.description,
        'time_limit': quiz.time_limit.total_seconds(),
        'total_points': quiz.total_points,
        'is_published': quiz.is_published
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_quiz_question(request, quiz_id):
    quiz = get_object_or_404(Quiz, id=quiz_id)
    data = request.data
    
    question = QuizQuestion.objects.create(
        quiz=quiz,
        question_text=data['question_text'],
        question_type=data['question_type'],
        points=data.get('points', 1),
        order=data.get('order', 0)
    )
    
    if data['question_type'] in ['MCQ', 'TF']:
        for choice_data in data['choices']:
            QuizChoice.objects.create(
                question=question,
                choice_text=choice_data['text'],
                is_correct=choice_data['is_correct']
            )
    
    return Response({
        'id': question.id,
        'question_text': question.question_text,
        'question_type': question.question_type,
        'points': question.points,
        'order': question.order
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def publish_quiz(request, quiz_id):
    quiz = get_object_or_404(Quiz, id=quiz_id)
    quiz.is_published = True
    quiz.save()
    return Response({'status': 'success'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_quizzes(request, module_id):
    module = get_object_or_404(Module, id=module_id)
    quizzes = Quiz.objects.filter(module=module, is_published=True)
    return Response({
        'quizzes': [{
            'id': quiz.id,
            'title': quiz.title,
            'description': quiz.description,
            'time_limit': quiz.time_limit.total_seconds(),
            'total_points': quiz.total_points
        } for quiz in quizzes]
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_quiz_attempt(request, quiz_id):
    quiz = get_object_or_404(Quiz, id=quiz_id)
    student = request.user.student
    
    # Check if student has already completed the quiz
    existing_attempt = QuizAttempt.objects.filter(
        student=student,
        quiz=quiz,
        is_completed=True
    ).first()
    
    if existing_attempt:
        return Response({'error': 'You have already completed this quiz'}, status=400)
    
    # Create new attempt
    attempt = QuizAttempt.objects.create(
        student=student,
        quiz=quiz
    )
    
    return Response({
        'attempt_id': attempt.id,
        'started_at': attempt.started_at
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_quiz_attempt(request, attempt_id):
    attempt = get_object_or_404(QuizAttempt, id=attempt_id)
    data = request.data
    
    # Calculate score
    total_score = 0
    for answer_data in data['answers']:
        question = QuizQuestion.objects.get(id=answer_data['question_id'])
        is_correct = False
        points_earned = 0
        
        if question.question_type == 'MCQ':
            selected_choice = QuizChoice.objects.get(
                question=question,
                choice_text=answer_data['answer']
            )
            is_correct = selected_choice.is_correct
            points_earned = question.points if is_correct else 0
        elif question.question_type == 'TF':
            is_correct = (answer_data['answer'].lower() == 'true')
            points_earned = question.points if is_correct else 0
        else:  # Short Answer
            # For short answers, we'll need manual grading
            points_earned = 0
        
        QuizAnswer.objects.create(
            attempt=attempt,
            question=question,
            answer_text=answer_data['answer'],
            is_correct=is_correct,
            points_earned=points_earned
        )
        
        total_score += points_earned
    
    # Update attempt
    attempt.score = total_score
    attempt.is_completed = True
    attempt.completed_at = timezone.now()
    attempt.save()
    
    return Response({
        'score': total_score,
        'completed_at': attempt.completed_at
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_quiz_questions(request, quiz_id):
    quiz = get_object_or_404(Quiz, id=quiz_id)
    questions = QuizQuestion.objects.filter(quiz=quiz).order_by('order')
    
    return Response({
        'questions': [{
            'id': question.id,
            'question_text': question.question_text,
            'question_type': question.question_type,
            'points': question.points,
            'choices': [{
                'id': choice.id,
                'text': choice.choice_text,
                'is_correct': choice.is_correct
            } for choice in question.choices.all()] if question.question_type in ['MCQ', 'TF'] else []
        } for question in questions]
    })

@login_required
def instructor_quiz_page(request, module_id):
    module = get_object_or_404(Module, id=module_id)
    
    # Check if the user is the instructor of this module
    if not hasattr(request.user, 'instructor') or module.instructor != request.user.instructor:
        raise PermissionDenied("You don't have permission to access this page")
    
    return render(request, 'modules/instructor_quiz.html', {
        'module': module
    })

@login_required
def student_quiz_page(request, module_id):
    module = get_object_or_404(Module, id=module_id)
    
    # Check if the user is a student enrolled in this module
    if not hasattr(request.user, 'student') or not module.students.filter(id=request.user.student.id).exists():
        raise PermissionDenied("You don't have permission to access this page")
    
    return render(request, 'modules/student_quiz.html', {
        'module': module
    })
