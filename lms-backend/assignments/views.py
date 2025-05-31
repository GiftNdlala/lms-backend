from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Assignment, AssignmentQuestion, AssignmentSubmission, AssignmentAnswer
from .serializers import (
    AssignmentSerializer, AssignmentQuestionSerializer,
    AssignmentSubmissionSerializer, AssignmentAnswerSerializer
)
from accounts.models import Instructor, Student
import logging
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

logger = logging.getLogger(__name__)

class IsInstructorOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and 
                   (request.user.is_staff or hasattr(request.user, 'instructor')))

    def has_object_permission(self, request, view, obj):
        return bool(request.user.is_staff or 
                   (hasattr(request.user, 'instructor') and obj.instructor == request.user.instructor))

class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [IsInstructorOrAdmin]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Assignment.objects.all()
        return Assignment.objects.filter(
            instructor__user=self.request.user
        )

    def perform_create(self, serializer):
        instructor = get_object_or_404(Instructor, user=self.request.user)
        serializer.save(instructor=instructor)

    def create(self, request, *args, **kwargs):
        questions_data = request.data.pop('questions', [])
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Create questions
        assignment = serializer.instance
        for order, question_data in enumerate(questions_data):
            question_data['order'] = order
            question_serializer = AssignmentQuestionSerializer(data=question_data)
            if question_serializer.is_valid():
                question_serializer.save(assignment=assignment)
            else:
                return Response(
                    {'questions': question_serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        questions_data = request.data.pop('questions', [])
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Update questions
        if questions_data:
            instance.questions.all().delete()
            for order, question_data in enumerate(questions_data):
                question_data['order'] = order
                question_serializer = AssignmentQuestionSerializer(data=question_data)
                if question_serializer.is_valid():
                    question_serializer.save(assignment=instance)
                else:
                    return Response(
                        {'questions': question_serializer.errors},
                        status=status.HTTP_400_BAD_REQUEST
                    )
        
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        assignment = self.get_object()
        student = get_object_or_404(Student, user=request.user)
        
        # Create or get submission
        submission, created = AssignmentSubmission.objects.get_or_create(
            assignment=assignment,
            student=student,
            defaults={'status': 'submitted'}
        )
        
        if not created and submission.status == 'graded':
            return Response(
                {'detail': 'This assignment has already been graded.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Process answers
        answers_data = request.data.get('answers', [])
        total_points = 0
        
        for answer_data in answers_data:
            question = get_object_or_404(AssignmentQuestion, 
                                       id=answer_data['question_id'],
                                       assignment=assignment)
            
            answer, _ = AssignmentAnswer.objects.get_or_create(
                submission=submission,
                question=question
            )
            
            answer.answer_text = answer_data['answer_text']
            
            # Auto-grade if enabled
            if question.auto_grade:
                if question.question_type == 'text':
                    # Check for keywords in answer
                    keywords_found = sum(1 for keyword in question.keywords 
                                      if keyword.lower() in answer.answer_text.lower())
                    if keywords_found > 0:
                        answer.is_correct = True
                        answer.points_earned = question.points * (keywords_found / len(question.keywords))
                elif question.question_type == 'number':
                    try:
                        student_answer = float(answer.answer_text)
                        expected_answer = float(question.expected_answer)
                        if abs(student_answer - expected_answer) <= question.tolerance:
                            answer.is_correct = True
                            answer.points_earned = question.points
                    except ValueError:
                        pass
            
            answer.save()
            total_points += answer.points_earned
        
        # Update submission
        submission.grade = total_points
        submission.status = 'submitted'
        submission.save()
        
        return Response(AssignmentSubmissionSerializer(submission).data)

    @action(detail=True, methods=['post'])
    def grade(self, request, pk=None):
        assignment = self.get_object()
        submission_id = request.data.get('submission_id')
        submission = get_object_or_404(AssignmentSubmission, 
                                     id=submission_id,
                                     assignment=assignment)
        
        # Update answers with feedback and manual grading
        for answer_data in request.data.get('answers', []):
            answer = get_object_or_404(AssignmentAnswer,
                                     id=answer_data['answer_id'],
                                     submission=submission)
            
            answer.feedback = answer_data.get('feedback', '')
            answer.points_earned = answer_data.get('points_earned', 0)
            answer.is_correct = answer.points_earned > 0
            answer.save()
        
        # Update submission
        total_points = sum(answer.points_earned for answer in submission.answers.all())
        submission.grade = total_points
        submission.status = 'graded'
        submission.feedback = request.data.get('feedback', '')
        submission.save()
        
        return Response(AssignmentSubmissionSerializer(submission).data)

class AssignmentSubmissionUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsInstructorOrAdmin]

    def patch(self, request, pk):
        submission = get_object_or_404(AssignmentSubmission, pk=pk)
        data = request.data
        # Only allow updating grade, feedback, and total_marks
        allowed_fields = {'grade', 'feedback', 'total_marks'}
        update_data = {k: v for k, v in data.items() if k in allowed_fields}
        serializer = AssignmentSubmissionSerializer(submission, data=update_data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data) 