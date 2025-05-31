from rest_framework import serializers
from accounts.models import Student
from .models import (
    Module, ModuleContent, StudentModuleProgress, ModuleNotification,
    NotificationComment, ModuleTest, Quiz, QuizQuestion, 
    QuizChoice, QuizAttempt, QuizAnswer, ModuleTemplate,
    SectionContent, ModuleSection
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
    module_name = serializers.CharField(source='module.title', read_only=True)

    class Meta:
        model = ModuleNotification
        fields = ['id', 'title', 'content', 'created_at', 'created_by_name', 'comments', 'module_name']
        read_only_fields = ['created_by']

class ModuleTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModuleTest
        fields = ['id', 'title', 'description', 'date', 'duration']

class SectionContentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.username', read_only=True)

    class Meta:
        model = SectionContent
        fields = [
            'id', 'section', 'title', 'file', 'file_type', 'text_content',
            'order', 'uploaded_at', 'uploaded_by', 'uploaded_by_name'
        ]
        read_only_fields = ['uploaded_at', 'uploaded_by', 'uploaded_by_name']

class ModuleSectionSerializer(serializers.ModelSerializer):
    contents = SectionContentSerializer(many=True, read_only=True)

    class Meta:
        model = ModuleSection
        fields = [
            'id', 'module', 'title', 'description', 'order',
            'created_at', 'updated_at', 'contents'
        ]
        read_only_fields = ['created_at', 'updated_at', 'contents']

class ModuleSerializer(serializers.ModelSerializer):
    instructor_name = serializers.SerializerMethodField()
    contents = serializers.SerializerMethodField()
    notifications = serializers.SerializerMethodField()
    tests = serializers.SerializerMethodField()
    students = serializers.PrimaryKeyRelatedField(queryset=Student.objects.all(), many=True, required=False)
    sections = ModuleSectionSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = [
            'id', 'code', 'title', 'description', 'duration', 'credits',
            'instructor', 'instructor_name', 'contents', 'notifications', 
            'tests', 'created_at', 'updated_at', 'students', 'is_active',
            'sections'
        ]
        read_only_fields = ['instructor_name', 'contents', 'notifications', 'tests', 'sections']

    def get_instructor_name(self, obj):
        return obj.instructor.user.get_full_name() if obj.instructor else None

    def get_contents(self, obj):
        return ModuleContentSerializer(obj.contents.all(), many=True).data

    def get_notifications(self, obj):
        return ModuleNotificationSerializer(obj.notifications.all(), many=True).data

    def get_tests(self, obj):
        return ModuleTestSerializer(obj.tests.all(), many=True).data

    def create(self, validated_data):
        students = validated_data.pop('students', [])
        instructor = self.context['request'].user.instructor
        validated_data['instructor'] = instructor
        module = super().create(validated_data)
        if students:
            module.students.set(students)
        return module

    def update(self, instance, validated_data):
        students = validated_data.pop('students', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if students is not None:
            instance.students.set(students)
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

class ModuleTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModuleTemplate
        fields = ['id', 'name', 'code', 'description', 'created_at', 'updated_at', 'is_active'] 