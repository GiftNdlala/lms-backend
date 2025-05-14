from rest_framework import serializers
from accounts.models import Student
from .models import (
    Module, ModuleContent, StudentModuleProgress, ModuleNotification,
    NotificationComment, ModuleAssignment, ModuleTest, Quiz, QuizQuestion, 
    QuizChoice, QuizAttempt, QuizAnswer, ModuleTemplate, AssignmentSubmission
)

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['id', 'user', 'registration_number']
        depth = 1

class ModuleContentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = ModuleContent
        fields = ['id', 'title', 'file_type', 'file_url', 'uploaded_at']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and hasattr(request, 'build_absolute_uri'):
            return request.build_absolute_uri(obj.file.url)
        return None

class NotificationCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = NotificationComment
        fields = ['id', 'text', 'user_name', 'created_at']
        read_only_fields = ['user']

class ModuleNotificationSerializer(serializers.ModelSerializer):
    comments = NotificationCommentSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = ModuleNotification
        fields = ['id', 'title', 'content', 'created_at', 'created_by_name', 'comments']
        read_only_fields = ['created_by']

class ModuleAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModuleAssignment
        fields = ['id', 'title', 'description', 'due_date', 'points']

class ModuleTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModuleTest
        fields = ['id', 'title', 'description', 'date', 'duration']

class ModuleSerializer(serializers.ModelSerializer):
    contents = ModuleContentSerializer(many=True, read_only=True)
    notifications = ModuleNotificationSerializer(many=True, read_only=True)
    assignments = ModuleAssignmentSerializer(many=True, read_only=True)
    tests = ModuleTestSerializer(many=True, read_only=True)
    instructor_name = serializers.CharField(source='instructor.user.username', read_only=True)

    class Meta:
        model = Module
        fields = [
            'id', 'code', 'title', 'description', 'duration', 'credits',
            'instructor', 'instructor_name', 'contents', 'notifications', 'assignments',
            'tests', 'created_at', 'updated_at'
        ]
        read_only_fields = ['instructor_name', 'contents', 'notifications', 'assignments', 'tests']

    def create(self, validated_data):
        module = Module.objects.create(**validated_data)
        return module

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class ModuleStudentManagementSerializer(serializers.Serializer):
    student_ids = serializers.ListField(child=serializers.IntegerField())
    action = serializers.ChoiceField(choices=['add', 'remove'])

class QuizChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizChoice
        fields = ['id', 'choice_text', 'is_correct']

class QuizQuestionSerializer(serializers.ModelSerializer):
    choices = QuizChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = QuizQuestion
        fields = ['id', 'question_text', 'question_type', 'points', 'order', 'choices']

class QuizSerializer(serializers.ModelSerializer):
    questions = QuizQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'time_limit', 'total_points', 
                 'is_published', 'questions', 'created_at', 'updated_at']

class QuizAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAnswer
        fields = ['id', 'question', 'answer_text', 'is_correct', 'points_earned']

class QuizAttemptSerializer(serializers.ModelSerializer):
    answers = QuizAnswerSerializer(many=True, read_only=True)
    student_name = serializers.CharField(source='student.user.username', read_only=True)

    class Meta:
        model = QuizAttempt
        fields = ['id', 'quiz', 'student', 'student_name', 'started_at', 
                 'completed_at', 'score', 'is_completed', 'answers']

class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.username', read_only=True)
    pdf_file_url = serializers.SerializerMethodField()

    class Meta:
        model = AssignmentSubmission
        fields = ['id', 'assignment', 'student', 'student_name', 'pdf_file', 'pdf_file_url', 
                 'submitted_at', 'grade', 'feedback']
        read_only_fields = ['submitted_at']

    def get_pdf_file_url(self, obj):
        request = self.context.get('request')
        if obj.pdf_file and hasattr(request, 'build_absolute_uri'):
            return request.build_absolute_uri(obj.pdf_file.url)
        return None

class ModuleTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModuleTemplate
        fields = ['id', 'name', 'code', 'description', 'created_at', 'updated_at', 'is_active'] 