from rest_framework import serializers
from .models import Assignment, AssignmentQuestion, AssignmentSubmission, AssignmentAnswer
from courses.serializers import ModuleSerializer

class AssignmentQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssignmentQuestion
        fields = ['id', 'question_text', 'question_type', 'points', 'order', 
                 'auto_grade', 'expected_answer', 'keywords', 'tolerance']
        read_only_fields = ['id']

class AssignmentAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssignmentAnswer
        fields = ['id', 'answer_text', 'is_correct', 'points_earned', 'feedback']
        read_only_fields = ['id', 'is_correct', 'points_earned']

class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    answers = AssignmentAnswerSerializer(many=True, read_only=True)
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = AssignmentSubmission
        fields = ['id', 'student', 'student_name', 'submitted_file', 'submitted_at',
                 'grade', 'feedback', 'status', 'answers', 'total_marks']
        read_only_fields = ['id', 'submitted_at', 'student']

    def get_student_name(self, obj):
        return f"{obj.student.user.first_name} {obj.student.user.last_name}"

class AssignmentSerializer(serializers.ModelSerializer):
    questions = AssignmentQuestionSerializer(many=True, read_only=True)
    submissions = AssignmentSubmissionSerializer(many=True, read_only=True)
    module_details = ModuleSerializer(source='module', read_only=True)
    instructor_name = serializers.SerializerMethodField()

    class Meta:
        model = Assignment
        fields = ['id', 'title', 'description', 'assignment_type', 'due_date',
                 'total_marks', 'file', 'instructor', 'instructor_name', 'module',
                 'module_details', 'created_at', 'updated_at', 'questions', 'submissions']
        read_only_fields = ['id', 'created_at', 'updated_at', 'instructor']

    def get_instructor_name(self, obj):
        return f"{obj.instructor.user.first_name} {obj.instructor.user.last_name}"

    def create(self, validated_data):
        questions_data = self.context.get('questions', [])
        assignment = Assignment.objects.create(**validated_data)
        
        for order, question_data in enumerate(questions_data):
            AssignmentQuestion.objects.create(
                assignment=assignment,
                order=order,
                **question_data
            )
        
        return assignment

    def update(self, instance, validated_data):
        questions_data = self.context.get('questions', [])
        
        # Update assignment fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update questions
        if questions_data:
            # Delete existing questions
            instance.questions.all().delete()
            # Create new questions
            for order, question_data in enumerate(questions_data):
                AssignmentQuestion.objects.create(
                    assignment=instance,
                    order=order,
                    **question_data
                )
        
        return instance 