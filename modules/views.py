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
from datetime import timedelta

from accounts.models import Student
from .models import (
    Module, ModuleContent, StudentModuleProgress, ModuleNotification,
    NotificationComment, ModuleTest, Quiz, QuizQuestion, QuizChoice, QuizAttempt,
    ModuleSection, SectionContent, QuizAnswer
)
from .serializers import (
    ModuleSerializer, ModuleContentSerializer, ModuleStudentManagementSerializer,
    StudentSerializer, ModuleNotificationSerializer, NotificationCommentSerializer,
    ModuleTestSerializer, ModuleSectionSerializer, SectionContentSerializer
)
import mimetypes
from django.contrib.auth.decorators import login_required
from rest_framework import permissions
from assignments.models import Assignment, AssignmentSubmission  # adjust import as needed

# Create your views here.

@method_decorator(csrf_exempt, name='dispatch')
class ModuleViewSet(viewsets.ModelViewSet):
    serializer_class = ModuleSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'put', 'patch', 'delete']

    def get_queryset(self):
        if hasattr(self.request.user, 'instructor'):
            return Module.objects.filter(instructor=self.request.user.instructor)
        return Module.objects.none()

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

    @action(detail=True, methods=['get', 'post', 'delete'],
            serializer_class=ModuleContentSerializer,
            parser_classes=[MultiPartParser, FormParser])
    def contents(self, request, pk=None):
        module = self.get_object()
        contents = module.contents.all()
        serializer = ModuleContentSerializer(contents, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get', 'post', 'put', 'delete'])
    def notifications(self, request, pk=None):
        module = self.get_object()
        
        if request.method == 'GET':
            notifications = module.notifications.all()
            serializer = ModuleNotificationSerializer(notifications, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            if not hasattr(request.user, 'instructor'):
                return Response(
                    {"error": "Only instructors can create notifications"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            if module.instructor != request.user.instructor:
                return Response(
                    {"error": "You can only create notifications for your own modules"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            serializer = ModuleNotificationSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(
                    module=module,
                    created_by=request.user
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        elif request.method in ['PUT', 'DELETE']:
            notification_id = request.data.get('id') if request.method == 'PUT' else request.query_params.get('id')
            if not notification_id:
                return Response(
                    {"error": "Notification ID is required"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                notification = module.notifications.get(id=notification_id)
            except ModuleNotification.DoesNotExist:
                return Response(
                    {"error": "Notification not found"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            if not hasattr(request.user, 'instructor') or module.instructor != request.user.instructor:
                return Response(
                    {"error": "You can only modify notifications for your own modules"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            if request.method == 'PUT':
                serializer = ModuleNotificationSerializer(notification, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            elif request.method == 'DELETE':
                notification.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)

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

    @action(detail=True, methods=['get'])
    def assignments(self, request, pk=None):
        module = self.get_object()
        # Only allow instructors who own the module
        if not hasattr(request.user, 'instructor') or module.instructor != request.user.instructor:
            return Response({"detail": "Only the module's instructor can view assignments."}, status=403)
        assignments = module.assignments.all()
        from assignments.serializers import AssignmentSerializer
        serializer = AssignmentSerializer(assignments, many=True)
        return Response(serializer.data)

@method_decorator(csrf_exempt, name='dispatch')
class StudentModuleViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ModuleSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'patch', 'post']

    def get_queryset(self):
        if not hasattr(self.request.user, 'student'):
            raise PermissionDenied("Only students can access this view")
        return Module.objects.filter(
            students=self.request.user.student,
            is_active=True
        )

    @action(detail=False, methods=['get'])
    def notifications(self, request):
        if not hasattr(request.user, 'student'):
            raise PermissionDenied("Only students can access this view")
        
        # Get all modules the student is enrolled in
        enrolled_modules = Module.objects.filter(
            students=request.user.student,
            is_active=True
        )
        
        # Get all notifications from these modules
        notifications = ModuleNotification.objects.filter(
            module__in=enrolled_modules
        ).order_by('-created_at')
        
        serializer = ModuleNotificationSerializer(notifications, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def contents(self, request, pk=None):
        module = self.get_object()
        if not module.students.filter(id=request.user.student.id).exists():
            raise PermissionDenied("You are not enrolled in this module")
        
        contents = module.contents.all()
        serializer = ModuleContentSerializer(contents, many=True)
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

    @action(detail=True, methods=['get'])
    def assignments(self, request, pk=None):
        module = self.get_object()
        # Only allow students enrolled in the module
        if not module.students.filter(id=request.user.student.id).exists():
            return Response({"detail": "You are not enrolled in this module."}, status=403)
        assignments = module.assignments.all()
        from assignments.serializers import AssignmentSerializer
        serializer = AssignmentSerializer(assignments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='notifications/(?P<pk>[^/.]+)')
    def notification_detail(self, request, pk=None):
        if not hasattr(request.user, 'student'):
            raise PermissionDenied("Only students can access this view")
        try:
            notification = ModuleNotification.objects.get(pk=pk)
            # Ensure the student is assigned to the module
            if not notification.module.students.filter(id=request.user.student.id).exists():
                return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
            serializer = ModuleNotificationSerializer(notification)
            return Response(serializer.data)
        except ModuleNotification.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'], url_path='sections')
    def sections(self, request, pk=None):
        module = self.get_object()
        # Ensure the student is enrolled in the module
        if not module.students.filter(id=request.user.student.id).exists():
            raise PermissionDenied("You are not enrolled in this module")
        sections = module.sections.all().order_by('order')
        serializer = ModuleSectionSerializer(sections, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def announcements(self, request, pk=None):
        module = self.get_object()
        if not module.students.filter(id=request.user.student.id).exists():
            raise PermissionDenied("You are not enrolled in this module")
        announcements = module.notifications.all().order_by('-created_at')
        serializer = ModuleNotificationSerializer(announcements, many=True)
        return Response(serializer.data)

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
        time_limit=timedelta(seconds=data['time_limit']),
        total_points=data.get('total_points', 0),
        passing_score=data.get('passing_score', 60),
        reward_points=data.get('reward_points', 0)
    )
    
    return Response({
        'id': quiz.id,
        'title': quiz.title,
        'description': quiz.description,
        'time_limit': quiz.time_limit.total_seconds(),
        'total_points': quiz.total_points,
        'passing_score': quiz.passing_score,
        'reward_points': quiz.reward_points,
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
    
    choices = []
    if data['question_type'] in ['MCQ', 'TF']:
        for choice_data in data['choices']:
            choice = QuizChoice.objects.create(
                question=question,
                choice_text=choice_data['text'],
                is_correct=choice_data['is_correct']
            )
            choices.append({
                'id': choice.id,
                'text': choice.choice_text,
                'is_correct': choice.is_correct
            })
    
    return Response({
        'id': question.id,
        'question_text': question.question_text,
        'question_type': question.question_type,
        'points': question.points,
        'order': question.order,
        'choices': choices
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
    max_possible_score = 0
    
    for answer_data in data['answers']:
        question = QuizQuestion.objects.get(id=answer_data['question_id'])
        points_earned = 0
        
        max_possible_score += question.points
        
        if question.question_type == 'MCQ':
            # For MCQ, check each selected answer
            selected_choices = answer_data.get('answers', [])  # Now expects an array of answers
            correct_choices = question.choices.filter(is_correct=True).count()
            correct_selections = 0
            
            for choice_text in selected_choices:
                selected_choice = QuizChoice.objects.get(
                    question=question,
                    choice_text=choice_text
                )
                if selected_choice.is_correct:
                    correct_selections += 1
            
            # Calculate points based on correct selections
            if correct_choices > 0:
                points_per_correct = question.points / correct_choices
                points_earned = correct_selections * points_per_correct
            
        elif question.question_type == 'TF':
            selected_choice = QuizChoice.objects.get(
                question=question,
                choice_text=answer_data['answer']
            )
            points_earned = question.points if selected_choice.is_correct else 0
        else:  # Short Answer
            # For short answers, we'll need manual grading
            points_earned = 0
        
        QuizAnswer.objects.create(
            attempt=attempt,
            question=question,
            answer_text=str(answer_data.get('answers', answer_data.get('answer', ''))),  # Handle both single and multiple answers safely
            is_correct=(points_earned > 0),
            points_earned=points_earned
        )
        
        total_score += points_earned
    
    # Calculate score percentage
    score_percentage = (total_score / max_possible_score * 100) if max_possible_score > 0 else 0
    
    # Update attempt
    attempt.score = total_score
    attempt.is_completed = True
    attempt.completed_at = timezone.now()
    attempt.save()
    
    # Award achievement and points if passed
    achievement = attempt.quiz.award_achievement(attempt.student, score_percentage)

    # If achievement was awarded, return wallet info
    wallet_info = None
    if achievement:
        from accounts.models import EWallet, EWalletTransaction
        ewallet, _ = EWallet.objects.get_or_create(student=attempt.student)
        transactions = EWalletTransaction.objects.filter(ewallet=ewallet).order_by('-timestamp')[:10]
        wallet_info = {
            'balance': str(ewallet.balance),
            'transactions': [
                {
                    'date': t.timestamp,
                    'type': t.transaction_type,
                    'amount': str(t.amount),
                    'description': t.reason
                } for t in transactions
            ]
        }

    response_data = {
        'score': total_score,
        'max_score': max_possible_score,
        'score_percentage': score_percentage,
        'completed_at': attempt.completed_at,
        'achievement': {
            'title': achievement.title,
            'description': achievement.description,
            'points': achievement.points
        } if achievement else None,
        'wallet': wallet_info
    }
    
    return Response(response_data)

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

class IsInstructor(permissions.BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'instructor')

class ModuleSectionViewSet(viewsets.ModelViewSet):
    queryset = ModuleSection.objects.all()
    serializer_class = ModuleSectionSerializer
    permission_classes = [permissions.IsAuthenticated, IsInstructor]

    def get_queryset(self):
        return ModuleSection.objects.filter(module__instructor=self.request.user.instructor)

class SectionContentViewSet(viewsets.ModelViewSet):
    queryset = SectionContent.objects.all()
    serializer_class = SectionContentSerializer
    permission_classes = [permissions.IsAuthenticated, IsInstructor]

    def get_queryset(self):
        return SectionContent.objects.filter(section__module__instructor=self.request.user.instructor)

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(uploaded_by=self.request.user)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def instructor_all_quizzes(request):
    if not hasattr(request.user, 'instructor'):
        return Response({"error": "Only instructors can access this view"}, status=403)
    
    quizzes = Quiz.objects.filter(module__instructor=request.user.instructor)
    return Response({
        'quizzes': [{
            'id': quiz.id,
            'title': quiz.title,
            'description': quiz.description,
            'time_limit': quiz.time_limit.total_seconds() / 60,  # Convert to minutes
            'total_points': quiz.total_points,
            'is_published': quiz.is_published,
            'module': {
                'id': quiz.module.id,
                'title': quiz.module.title
            } if quiz.module else None,
            'created_at': quiz.created_at,
            'updated_at': quiz.updated_at
        } for quiz in quizzes]
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_all_quizzes(request):
    if not hasattr(request.user, 'student'):
        return Response({"error": "Only students can access this view"}, status=403)
    
    # Get all modules the student is enrolled in
    enrolled_modules = Module.objects.filter(students=request.user.student)
    
    # Get all published quizzes from these modules
    quizzes = Quiz.objects.filter(
        module__in=enrolled_modules,
        is_published=True
    ).select_related('module')
    
    return Response({
        'quizzes': [{
            'id': quiz.id,
            'title': quiz.title,
            'description': quiz.description,
            'time_limit': quiz.time_limit.total_seconds() / 60,  # Convert to minutes
            'total_points': quiz.total_points,
            'module': {
                'id': quiz.module.id,
                'title': quiz.module.title
            } if quiz.module else None,
            'created_at': quiz.created_at,
            'updated_at': quiz.updated_at
        } for quiz in quizzes]
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_grades(request):
    if not hasattr(request.user, 'student'):
        return Response(
            {"error": "Only students can access grades"}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get all modules the student is enrolled in
    enrolled_modules = Module.objects.filter(
        students=request.user.student,
        is_active=True
    )
    
    grades_data = []
    
    for module in enrolled_modules:
        module_data = {
            'module_id': module.id,
            'module_name': module.title,
            'assignments': [],
            'quizzes': []
        }
        
        # Get assignment grades
        assignments = module.assignments.all()
        for assignment in assignments:
            submission = assignment.submissions.filter(student=request.user.student).first()
            if submission:
                module_data['assignments'].append({
                    'id': assignment.id,
                    'title': assignment.title,
                    'grade': submission.grade,
                    'max_grade': assignment.total_marks,
                    'submitted_at': submission.submitted_at
                })
        
        # Get quiz grades
        quizzes = module.quizzes.all()
        for quiz in quizzes:
            attempt = quiz.attempts.filter(student=request.user.student).first()
            if attempt and attempt.is_completed:
                module_data['quizzes'].append({
                    'id': quiz.id,
                    'title': quiz.title,
                    'score': attempt.score,
                    'max_score': quiz.total_points,
                    'attempted_at': attempt.completed_at
                })
        
        grades_data.append(module_data)
    
    return Response(grades_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_assignment_detail(request, assignment_id):
    if not hasattr(request.user, 'student'):
        return Response({"error": "Only students can access assignments"}, status=403)
    try:
        assignment = Assignment.objects.get(id=assignment_id)
        # Check if the student is enrolled in the module
        if not assignment.module.students.filter(id=request.user.student.id).exists():
            return Response({"error": "You are not enrolled in this module"}, status=403)
        # Optionally, include student's submission
        submission = assignment.submissions.filter(student=request.user.student).first()
        from assignments.serializers import AssignmentSerializer
        data = AssignmentSerializer(assignment).data
        data['submissions'] = []
        if submission:
            data['submissions'].append({
                "file": submission.submitted_file.url if submission.submitted_file else None,
                "grade": submission.grade,
            })
        return Response(data)
    except Assignment.DoesNotExist:
        return Response({"error": "Assignment not found"}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def student_assignment_submit(request, assignment_id):
    if not hasattr(request.user, 'student'):
        return Response({"error": "Only students can submit assignments"}, status=403)
    try:
        assignment = Assignment.objects.get(id=assignment_id)
        # Check if the student is enrolled in the module
        if not assignment.module.students.filter(id=request.user.student.id).exists():
            return Response({"error": "You are not enrolled in this module"}, status=403)
        # Check if already submitted
        if assignment.submissions.filter(student=request.user.student).exists():
            return Response({"error": "You have already submitted this assignment"}, status=400)
        # Handle file only
        file = request.FILES.get('file')
        if not file:
            return Response({"error": "No file uploaded."}, status=400)
        submission = AssignmentSubmission.objects.create(
            assignment=assignment,
            student=request.user.student,
            submitted_file=file
        )
        return Response({"success": "Assignment submitted successfully"})
    except Assignment.DoesNotExist:
        return Response({"error": "Assignment not found"}, status=404)
