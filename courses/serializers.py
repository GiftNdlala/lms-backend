from rest_framework import serializers
from assignments.models import Assignment, AssignmentSubmission
from .models import (
    Course, Module, Lesson,
    StudentProgress, CourseEnrollment,
    EWallet, Transaction, WithdrawalRequest,
    Assessment, Question, AssessmentAssignment,
    StudentAnswer, AssessmentGrade, Announcement
)
from accounts.models import Student

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'content', 'order', 'video_url', 
                 'presentation', 'additional_resources', 'estimated_time']

class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = ['id', 'title', 'description', 'due_date', 
                 'total_marks', 'weight', 'is_active']

class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    assignments = AssignmentSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = ['id', 'title', 'description', 'order', 'is_active',
                 'start_date', 'end_date', 'lessons', 'assignments']

class CourseDetailSerializer(serializers.ModelSerializer):
    modules = ModuleSerializer(many=True, read_only=True)
    
    class Meta:
        model = Course
        fields = ['id', 'code', 'title', 'description', 'instructor',
                 'start_date', 'end_date', 'is_active', 'modules']

class CourseListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'code', 'title', 'description', 'start_date', 'end_date']

class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssignmentSubmission
        fields = ['id', 'assignment', 'submission_file', 'comments', 
                 'status', 'marks_obtained', 'feedback', 'submitted_at']
        read_only_fields = ['status', 'marks_obtained', 'feedback']

class StudentProgressSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    
    class Meta:
        model = StudentProgress
        fields = ['id', 'lesson_title', 'completed', 'last_accessed', 
                 'time_spent', 'notes']

class CourseEnrollmentSerializer(serializers.ModelSerializer):
    course = CourseListSerializer(read_only=True)
    
    class Meta:
        model = CourseEnrollment
        fields = ['id', 'course', 'status', 'enrollment_date', 
                 'completion_date', 'final_grade']

class EWalletSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    student_id = serializers.CharField(source='student.student_id', read_only=True)
    
    class Meta:
        model = EWallet
        fields = ['id', 'student', 'student_name', 'student_id', 'balance', 'last_updated', 'is_active']
        read_only_fields = ['balance', 'last_updated']

class TransactionSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='ewallet.student.user.get_full_name', read_only=True)
    
    class Meta:
        model = Transaction
        fields = ['id', 'ewallet', 'student_name', 'amount', 'transaction_type', 
                 'description', 'status', 'created_at', 'processed_at', 'processed_by']
        read_only_fields = ['created_at', 'processed_at', 'processed_by']

class WithdrawalRequestSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='ewallet.student.user.get_full_name', read_only=True)
    current_balance = serializers.DecimalField(source='ewallet.balance', read_only=True, max_digits=10, decimal_places=2)
    
    class Meta:
        model = WithdrawalRequest
        fields = ['id', 'ewallet', 'student_name', 'amount', 'status', 'request_date',
                 'processed_date', 'processed_by', 'rejection_reason', 'bank_details', 'current_balance']
        read_only_fields = ['request_date', 'processed_date', 'processed_by']

    def validate_amount(self, value):
        ewallet = self.context['ewallet']
        if value > ewallet.balance:
            raise serializers.ValidationError("Withdrawal amount cannot exceed current balance")
        if value < 500:
            raise serializers.ValidationError("Minimum withdrawal amount is 500")
        return value

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'assessment', 'question_text', 'question_type', 
                 'correct_answer', 'marks', 'order', 'is_active']

class AssessmentSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    instructor_name = serializers.CharField(source='instructor.get_full_name', read_only=True)
    
    class Meta:
        model = Assessment
        fields = ['id', 'title', 'description', 'assessment_type', 'instructor',
                 'instructor_name', 'module', 'total_marks', 'passing_marks',
                 'reward_amount', 'is_active', 'created_at', 'questions']

class AssessmentAssignmentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    assessment_title = serializers.CharField(source='assessment.title', read_only=True)
    
    class Meta:
        model = AssessmentAssignment
        fields = ['id', 'assessment', 'assessment_title', 'student', 'student_name',
                 'assigned_by', 'assigned_date', 'due_date', 'status', 'reward_claimed']

class StudentAnswerSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.question_text', read_only=True)
    question_type = serializers.CharField(source='question.question_type', read_only=True)
    max_marks = serializers.IntegerField(source='question.marks', read_only=True)
    
    class Meta:
        model = StudentAnswer
        fields = ['id', 'assessment_assignment', 'question', 'question_text',
                 'question_type', 'answer_text', 'marks_obtained', 'feedback',
                 'graded_by', 'graded_at', 'max_marks']

class AssessmentGradeSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='assessment_assignment.student.user.get_full_name', read_only=True)
    assessment_title = serializers.CharField(source='assessment_assignment.assessment.title', read_only=True)
    
    class Meta:
        model = AssessmentGrade
        fields = ['id', 'assessment_assignment', 'student_name', 'assessment_title',
                 'total_marks_obtained', 'grade', 'feedback', 'graded_by',
                 'graded_at', 'reward_processed']

class StudentSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    ewallet = EWalletSerializer(read_only=True)

    class Meta:
        model = Student
        fields = ['id', 'user', 'ewallet']

    def get_user(self, obj):
        return {
            'id': obj.user.id,
            'first_name': obj.user.first_name,
            'last_name': obj.user.last_name,
            'email': obj.user.email
        }

class AnnouncementSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = Announcement
        fields = ['id', 'course', 'course_title', 'title', 'content', 'created_by', 'created_by_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_by', 'created_by_name', 'created_at', 'updated_at', 'course_title'] 