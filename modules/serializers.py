from rest_framework import serializers
from accounts.models import Student
from .models import (
    Module, ModuleContent, StudentModuleProgress, ModuleNotification,
    NotificationComment, ModuleAssignment, ModuleTest, Assignment, Question, AssignmentSubmission, ModuleTemplate
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
        return Module.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.code = validated_data.get('code', instance.code)
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.duration = validated_data.get('duration', instance.duration)
        instance.credits = validated_data.get('credits', instance.credits)
        instance.save()
        return instance

class ModuleStudentManagementSerializer(serializers.Serializer):
    student_ids = serializers.ListField(child=serializers.IntegerField())
    action = serializers.ChoiceField(choices=['add', 'remove'])

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'text', 'type', 'answer']

class AssignmentSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    pdf_file_url = serializers.SerializerMethodField()

    class Meta:
        model = Assignment
        fields = ['id', 'title', 'description', 'pdf_file', 'pdf_file_url', 'due_date', 'questions', 'created_at']

    def get_pdf_file_url(self, obj):
        if obj.pdf_file:
            return self.context['request'].build_absolute_uri(obj.pdf_file.url)
        return None

class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    pdf_file_url = serializers.SerializerMethodField()

    class Meta:
        model = AssignmentSubmission
        fields = ['id', 'assignment', 'student', 'student_name', 'pdf_file', 'pdf_file_url', 
                 'answers', 'score', 'status', 'submitted_at', 'graded_at']

    def get_pdf_file_url(self, obj):
        if obj.pdf_file:
            return self.context['request'].build_absolute_uri(obj.pdf_file.url)
        return None

class ModuleTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModuleTemplate
        fields = ['id', 'name', 'code', 'description', 'created_at', 'updated_at', 'is_active'] 