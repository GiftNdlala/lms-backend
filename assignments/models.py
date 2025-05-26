from django.db import models
from django.contrib.auth import get_user_model
from accounts.models import Instructor, Student

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

    class Meta:
        unique_together = ['assignment', 'student']
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.student.user.username} - {self.assignment.title}" 