from rest_framework import serializers
from .models import Assignment, AssignmentSubmission
from accounts.models import Student, Instructor
from courses.models import Module

class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_id = serializers.SerializerMethodField()

    class Meta:
        model = AssignmentSubmission
        fields = ['id', 'assignment', 'student', 'student_name', 'student_id', 
                 'submitted_file', 'submitted_at', 'grade', 'feedback', 'status']
        read_only_fields = ['student', 'submitted_at']

    def get_student_name(self, obj):
        return obj.student.user.get_full_name() or obj.student.user.username

    def get_student_id(self, obj):
        return obj.student.student_id

class SimpleModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = ['id', 'title', 'code']

class AssignmentSerializer(serializers.ModelSerializer):
    instructor_name = serializers.SerializerMethodField()
    submissions_count = serializers.SerializerMethodField()
    submissions = AssignmentSubmissionSerializer(many=True, read_only=True)
    module = SimpleModuleSerializer(read_only=True)

    class Meta:
        model = Assignment
        fields = ['id', 'title', 'description', 'due_date', 'total_marks', 
                 'file', 'instructor', 'instructor_name', 'created_at', 
                 'updated_at', 'submissions_count', 'submissions', 'module']
        read_only_fields = ['instructor', 'created_at', 'updated_at']

    def get_instructor_name(self, obj):
        return obj.instructor.user.get_full_name() or obj.instructor.user.username

    def get_submissions_count(self, obj):
        return obj.submissions.count()

    def validate_file(self, value):
        if value:
            # Check file size (10MB max)
            if value.size > 10 * 1024 * 1024:
                raise serializers.ValidationError("File size should be less than 10MB")
            
            # Check file type
            allowed_types = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
            if value.content_type not in allowed_types:
                raise serializers.ValidationError("Only PDF and Word documents are allowed")
        return value

    def create(self, validated_data):
        # Get the instructor from the request user
        instructor = Instructor.objects.get(user=self.context['request'].user)
        validated_data['instructor'] = instructor
        return super().create(validated_data)

class AssignmentSubmissionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssignmentSubmission
        fields = ['assignment', 'submitted_file']
        read_only_fields = ['student']

    def create(self, validated_data):
        # Get the student from the request user
        student = Student.objects.get(user=self.context['request'].user)
        validated_data['student'] = student
        return super().create(validated_data)

    def validate_submitted_file(self, value):
        if value:
            # Check file size (10MB max)
            if value.size > 10 * 1024 * 1024:
                raise serializers.ValidationError("File size should be less than 10MB")
            
            # Check file type
            allowed_types = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
            if value.content_type not in allowed_types:
                raise serializers.ValidationError("Only PDF and Word documents are allowed")
        return value 