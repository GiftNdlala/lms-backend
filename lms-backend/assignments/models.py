from django.db import models
from django.contrib.auth import get_user_model
from accounts.models import Instructor, Student
from assessments.models import Assessment

User = get_user_model()

class Assignment(models.Model):
    ASSIGNMENT_TYPES = [
        ('standalone', 'Standalone Assignment'),
        ('module', 'Module Assignment')
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    assignment_type = models.CharField(max_length=20, choices=ASSIGNMENT_TYPES, default='standalone')
    due_date = models.DateTimeField()
    total_marks = models.IntegerField()
    file = models.FileField(upload_to='assignments/', null=True, blank=True)
    instructor = models.ForeignKey(Instructor, on_delete=models.CASCADE, related_name='created_assignments')
    students = models.ManyToManyField(Student, through='AssignmentSubmission', related_name='enrolled_assignments')
    module = models.ForeignKey('courses.Module', on_delete=models.SET_NULL, null=True, blank=True, related_name='assignments')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']

class AssignmentQuestion(models.Model):
    QUESTION_TYPES = [
        ('text', 'Text Answer'),
        ('number', 'Numerical Answer'),
        ('code', 'Code Answer'),
    ]

    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=10, choices=QUESTION_TYPES)
    points = models.PositiveIntegerField(default=1)
    order = models.PositiveIntegerField(default=0)
    auto_grade = models.BooleanField(default=False)
    expected_answer = models.TextField(blank=True, null=True)
    keywords = models.JSONField(default=list, blank=True)  # For text answers
    tolerance = models.DecimalField(max_digits=5, decimal_places=2, default=0)  # For numerical answers
    dummy_field = models.BooleanField(default=False)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Question {self.order} - {self.assignment.title}"

class AssignmentSubmission(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions', null=True, blank=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='assignment_submissions', null=True, blank=True)
    submitted_file = models.FileField(upload_to='assignment_submissions/', null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    grade = models.PositiveIntegerField(null=True, blank=True)
    feedback = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('submitted', 'Submitted'),
            ('graded', 'Graded'),
            ('late', 'Late')
        ],
        default='pending'
    )
    total_marks = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        unique_together = ['assignment', 'student']
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.student.user.username} - {self.assignment.title}"

class AssignmentAnswer(models.Model):
    submission = models.ForeignKey(AssignmentSubmission, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(AssignmentQuestion, on_delete=models.CASCADE)
    answer_text = models.TextField()
    is_correct = models.BooleanField(default=False)
    points_earned = models.PositiveIntegerField(default=0)
    feedback = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ['submission', 'question']

    def __str__(self):
        return f"Answer for {self.question.question_text[:50]}"

# Signal to automatically create an Assessment when an Assignment is created
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=Assignment)
def create_assessment_for_assignment(sender, instance, created, **kwargs):
    if created:
        Assessment.objects.create(
            title=instance.title,
            description=instance.description,
            module=instance.module,
            assessment_type='assignment',
            total_marks=instance.total_marks,
            passing_marks=instance.total_marks * 0.6,  # Example: 60% passing
            due_date=instance.due_date,
            status='published'
        ) 