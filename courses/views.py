from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q
from .models import (
    Course, Module, Lesson, Assignment, AssignmentSubmission,
    StudentProgress, CourseEnrollment,
    EWallet, Transaction, WithdrawalRequest,
    Assessment, Question, AssessmentAssignment,
    StudentAnswer, AssessmentGrade
)
from .serializers import (
    CourseDetailSerializer, CourseListSerializer, ModuleSerializer,
    LessonSerializer, AssignmentSerializer, AssignmentSubmissionSerializer,
    StudentProgressSerializer, CourseEnrollmentSerializer,
    EWalletSerializer, TransactionSerializer, WithdrawalRequestSerializer,
    AssessmentSerializer, QuestionSerializer, AssessmentAssignmentSerializer,
    StudentAnswerSerializer, AssessmentGradeSerializer
)
from django.db.models import Sum
from decimal import Decimal

class StudentCourseViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.action == 'list':
            # Show only enrolled courses for list view
            return Course.objects.filter(
                course_enrollments__student__user=self.request.user,
                course_enrollments__status='enrolled',
                is_active=True
            )
        # For detail view, show any course the student is enrolled in
        return Course.objects.filter(
            course_enrollments__student__user=self.request.user,
            is_active=True
        )
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CourseDetailSerializer
        return CourseListSerializer

    @action(detail=True)
    def progress(self, request, pk=None):
        course = self.get_object()
        progress = StudentProgress.objects.filter(
            student__user=request.user,
            course=course
        )
        serializer = StudentProgressSerializer(progress, many=True)
        return Response(serializer.data)

class StudentModuleViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ModuleSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Module.objects.filter(
            course__enrollments__student__user=self.request.user,
            course__enrollments__status='enrolled',
            is_active=True
        )

class StudentLessonViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Lesson.objects.filter(
            module__course__enrollments__student__user=self.request.user,
            module__course__enrollments__status='enrolled',
            is_active=True
        )

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        lesson = self.get_object()
        progress, created = StudentProgress.objects.get_or_create(
            student=request.user.student,
            course=lesson.module.course,
            module=lesson.module,
            lesson=lesson,
            defaults={'completed': True}
        )
        if not created:
            progress.completed = True
            progress.save()
        
        return Response({'status': 'lesson marked as completed'})

class StudentAssignmentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Assignment.objects.filter(
            module__course__enrollments__student__user=self.request.user,
            module__course__enrollments__status='enrolled',
            is_active=True
        )

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        assignment = self.get_object()
        
        if assignment.due_date < timezone.now():
            return Response(
                {'error': 'Assignment submission deadline has passed'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        submission = AssignmentSubmission.objects.create(
            assignment=assignment,
            student=request.user.student,
            submission_file=request.data.get('file'),
            comments=request.data.get('comments', ''),
            status='submitted'
        )
        
        serializer = AssignmentSubmissionSerializer(submission)
        return Response(serializer.data)

    @action(detail=True)
    def my_submission(self, request, pk=None):
        assignment = self.get_object()
        submission = get_object_or_404(
            AssignmentSubmission,
            assignment=assignment,
            student__user=request.user
        )
        serializer = AssignmentSubmissionSerializer(submission)
        return Response(serializer.data)

class EWalletViewSet(viewsets.ModelViewSet):
    serializer_class = EWalletSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = EWallet.objects.all()

    def get_queryset(self):
        if self.request.user.role == 'student':
            return EWallet.objects.filter(student__user=self.request.user)
        return EWallet.objects.all()

    @action(detail=True, methods=['get'])
    def transactions(self, request, pk=None):
        ewallet = self.get_object()
        transactions = Transaction.objects.filter(ewallet=ewallet)
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def withdrawal_requests(self, request, pk=None):
        ewallet = self.get_object()
        requests = WithdrawalRequest.objects.filter(ewallet=ewallet)
        serializer = WithdrawalRequestSerializer(requests, many=True)
        return Response(serializer.data)

class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Transaction.objects.all()

    def get_queryset(self):
        if self.request.user.role == 'student':
            return Transaction.objects.filter(ewallet__student__user=self.request.user)
        return Transaction.objects.all()

class WithdrawalRequestViewSet(viewsets.ModelViewSet):
    serializer_class = WithdrawalRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = WithdrawalRequest.objects.all()

    def get_queryset(self):
        if self.request.user.role == 'student':
            return WithdrawalRequest.objects.filter(ewallet__student__user=self.request.user)
        return WithdrawalRequest.objects.all()

    def perform_create(self, serializer):
        ewallet = serializer.validated_data['ewallet']
        if not ewallet.can_withdraw():
            return Response(
                {"error": "Minimum balance of 500 required for withdrawal"},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer.save()

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        withdrawal_request = self.get_object()
        if withdrawal_request.status != 'pending':
            return Response(
                {"error": "Request has already been processed"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        ewallet = withdrawal_request.ewallet
        if ewallet.balance < withdrawal_request.amount:
            return Response(
                {"error": "Insufficient balance"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create transaction for withdrawal
        Transaction.objects.create(
            ewallet=ewallet,
            amount=-withdrawal_request.amount,
            transaction_type='withdrawal_approved',
            description=f"Withdrawal of {withdrawal_request.amount}",
            status='completed',
            processed_by=request.user
        )

        # Update withdrawal request
        withdrawal_request.status = 'approved'
        withdrawal_request.processed_by = request.user
        withdrawal_request.processed_date = timezone.now()
        withdrawal_request.save()

        # Update e-wallet balance
        ewallet.balance -= withdrawal_request.amount
        ewallet.save()

        return Response({"status": "Withdrawal approved"})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        withdrawal_request = self.get_object()
        if withdrawal_request.status != 'pending':
            return Response(
                {"error": "Request has already been processed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        withdrawal_request.status = 'rejected'
        withdrawal_request.processed_by = request.user
        withdrawal_request.processed_date = timezone.now()
        withdrawal_request.rejection_reason = request.data.get('reason', '')
        withdrawal_request.save()

        return Response({"status": "Withdrawal rejected"})

class AssessmentViewSet(viewsets.ModelViewSet):
    serializer_class = AssessmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Assessment.objects.all()

    def get_queryset(self):
        if self.request.user.role == 'instructor':
            return Assessment.objects.filter(instructor=self.request.user)
        return Assessment.objects.filter(
            assessmentassignment__student__user=self.request.user
        )

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)

class QuestionViewSet(viewsets.ModelViewSet):
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Question.objects.all()

    def get_queryset(self):
        assessment_id = self.kwargs.get('assessment_pk')
        return Question.objects.filter(assessment_id=assessment_id)

    def perform_create(self, serializer):
        assessment_id = self.kwargs.get('assessment_pk')
        assessment = get_object_or_404(Assessment, id=assessment_id)
        serializer.save(assessment=assessment)

class AssessmentAssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = AssessmentAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = AssessmentAssignment.objects.all()

    def get_queryset(self):
        if self.request.user.role == 'instructor':
            return AssessmentAssignment.objects.filter(assigned_by=self.request.user)
        return AssessmentAssignment.objects.filter(student__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(assigned_by=self.request.user)

class StudentAnswerViewSet(viewsets.ModelViewSet):
    serializer_class = StudentAnswerSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = StudentAnswer.objects.all()

    def get_queryset(self):
        assignment_id = self.kwargs.get('assignment_pk')
        return StudentAnswer.objects.filter(assessment_assignment_id=assignment_id)

    def perform_create(self, serializer):
        assignment_id = self.kwargs.get('assignment_pk')
        assignment = get_object_or_404(AssessmentAssignment, id=assignment_id)
        serializer.save(assessment_assignment=assignment)

class AssessmentGradeViewSet(viewsets.ModelViewSet):
    serializer_class = AssessmentGradeSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = AssessmentGrade.objects.all()

    def get_queryset(self):
        assignment_id = self.kwargs.get('assignment_pk')
        return AssessmentGrade.objects.filter(assessment_assignment_id=assignment_id)

    def perform_create(self, serializer):
        assignment_id = self.kwargs.get('assignment_pk')
        assignment = get_object_or_404(AssessmentAssignment, id=assignment_id)
        
        # Calculate total marks from all answers
        total_marks = StudentAnswer.objects.filter(
            assessment_assignment=assignment
        ).aggregate(total=Sum('marks_obtained'))['total'] or 0

        # Create grade
        grade = serializer.save(
            assessment_assignment=assignment,
            total_marks_obtained=total_marks,
            graded_by=self.request.user
        )

        # Process reward if passing grade
        if total_marks >= assignment.assessment.passing_marks and not assignment.reward_claimed:
            ewallet, _ = EWallet.objects.get_or_create(student=assignment.student)
            Transaction.objects.create(
                ewallet=ewallet,
                amount=assignment.assessment.reward_amount,
                transaction_type='assessment_reward',
                description=f"Reward for completing {assignment.assessment.title}",
                status='completed',
                processed_by=self.request.user
            )
            ewallet.balance += assignment.assessment.reward_amount
            ewallet.save()
            assignment.reward_claimed = True
            assignment.save()

        return grade

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Course.objects.all()
        return Course.objects.filter(
            Q(instructor=self.request.user) |
            Q(course_enrollments__student__user=self.request.user)
        ).distinct()

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)

    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        course = self.get_object()
        if not course.instructor == request.user and not request.user.is_staff:
            return Response(
                {"detail": "You are not authorized to view this information."},
                status=status.HTTP_403_FORBIDDEN
            )
        enrollments = CourseEnrollment.objects.filter(course=course)
        serializer = CourseEnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        course = self.get_object()
        if not course.instructor == request.user and not request.user.is_staff:
            return Response(
                {"detail": "You are not authorized to view this information."},
                status=status.HTTP_403_FORBIDDEN
            )
        progress = StudentProgress.objects.filter(
            student__course_enrollments__course=course
        )
        serializer = StudentProgressSerializer(progress, many=True)
        return Response(serializer.data)

class ModuleViewSet(viewsets.ModelViewSet):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Module.objects.all()
        return Module.objects.filter(
            Q(course__instructor=self.request.user) |
            Q(course__course_enrollments__student__user=self.request.user)
        ).distinct()

    def perform_create(self, serializer):
        course = serializer.validated_data['course']
        if not course.instructor == self.request.user and not self.request.user.is_staff:
            raise permissions.PermissionDenied(
                "You are not authorized to create modules for this course."
            )
        serializer.save()

    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        module = self.get_object()
        if not module.course.instructor == request.user and not request.user.is_staff:
            return Response(
                {"detail": "You are not authorized to view this information."},
                status=status.HTTP_403_FORBIDDEN
            )
        enrollments = CourseEnrollment.objects.filter(
            course=module.course,
            status='enrolled'
        )
        serializer = CourseEnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data)

class LessonViewSet(viewsets.ModelViewSet):
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Lesson.objects.all()
    
    def get_queryset(self):
        if self.request.user.role == 'instructor':
            return Lesson.objects.filter(module__course__instructor=self.request.user)
        return Lesson.objects.filter(module__course__is_active=True)

class AssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Assignment.objects.all()
    
    def get_queryset(self):
        if self.request.user.role == 'instructor':
            return Assignment.objects.filter(module__course__instructor=self.request.user)
        return Assignment.objects.filter(module__course__is_active=True)

class AssignmentSubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = AssignmentSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = AssignmentSubmission.objects.all()
    
    def get_queryset(self):
        if self.request.user.role == 'instructor':
            return AssignmentSubmission.objects.filter(assignment__module__course__instructor=self.request.user)
        return AssignmentSubmission.objects.filter(student__user=self.request.user)

class StudentProgressViewSet(viewsets.ModelViewSet):
    serializer_class = StudentProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = StudentProgress.objects.all()
    
    def get_queryset(self):
        if self.request.user.role == 'instructor':
            return StudentProgress.objects.filter(course__instructor=self.request.user)
        return StudentProgress.objects.filter(student__user=self.request.user)

class CourseEnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = CourseEnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = CourseEnrollment.objects.all()
    
    def get_queryset(self):
        if self.request.user.role == 'instructor':
            return CourseEnrollment.objects.filter(course__instructor=self.request.user)
        return CourseEnrollment.objects.filter(student__user=self.request.user) 