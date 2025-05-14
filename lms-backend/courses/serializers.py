from rest_framework import serializers
from .models import Module, ModuleEnrollment, Lesson, Assignment

class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    assignments = AssignmentSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = ['id', 'title', 'code', 'description', 'credits', 'instructor',
                 'students', 'created_at', 'updated_at', 'is_active',
                 'lessons', 'assignments']
        read_only_fields = ['instructor', 'created_at', 'updated_at']
        extra_kwargs = {
            'code': {'required': False},
            'credits': {'required': False}
        }

class ModuleEnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = ModuleEnrollment
        fields = ['id', 'student', 'student_name', 'enrolled_at', 'completed', 'completion_date']

    def get_student_name(self, obj):
        return f"{obj.student.user.first_name} {obj.student.user.last_name}" 