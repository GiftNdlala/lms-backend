from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from courses.models import Module

class Assessment(models.Model):
    ASSESSMENT_TYPES = (
        ('quiz', 'Quiz'),
        ('assignment', 'Assignment'),
        ('exam', 'Exam'),
        ('project', 'Project'),
    )

    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('graded', 'Graded'),
        ('archived', 'Archived'),
    )

    title = models.CharField(max_length=200)
    description = models.TextField()
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='assessments')
    assessment_type = models.CharField(max_length=20, choices=ASSESSMENT_TYPES)
    total_marks = models.DecimalField(max_digits=5, decimal_places=2)
    passing_marks = models.DecimalField(max_digits=5, decimal_places=2)
    due_date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    instructions = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-due_date']

    def __str__(self):
        return f"{self.title} - {self.module.title}"

class Question(models.Model):
    QUESTION_TYPES = (
        ('multiple_choice', 'Multiple Choice'),
        ('true_false', 'True/False'),
        ('short_answer', 'Short Answer'),
        ('essay', 'Essay'),
    )

    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES)
    marks = models.DecimalField(max_digits=5, decimal_places=2)
    order = models.PositiveIntegerField(default=0)
    is_required = models.BooleanField(default=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Question {self.order} - {self.assessment.title}"

class QuestionOption(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    option_text = models.TextField()
    is_correct = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Option {self.order} - {self.question.question_text[:50]}"

class Submission(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('late', 'Late'),
        ('graded', 'Graded'),
    )

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='submissions')
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='submissions')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    submitted_at = models.DateTimeField(null=True, blank=True)
    marks_obtained = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    feedback = models.TextField(blank=True, null=True)
    graded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='graded_submissions'
    )
    graded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ['student', 'assessment']
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.student.username} - {self.assessment.title}"

class Answer(models.Model):
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    answer_text = models.TextField()
    selected_options = models.ManyToManyField(QuestionOption, blank=True)
    marks_awarded = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    feedback = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ['submission', 'question']

    def __str__(self):
        return f"Answer for {self.question.question_text[:50]}"

class Grade(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='grades')
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='grades')
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='grades')
    marks_obtained = models.DecimalField(max_digits=5, decimal_places=2)
    percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    grade_letter = models.CharField(max_length=2)
    remarks = models.TextField(blank=True, null=True)
    graded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='grades_given'
    )
    graded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['student', 'assessment']
        ordering = ['-graded_at']

    def __str__(self):
        return f"{self.student.username} - {self.assessment.title} - {self.grade_letter}"

class EWallet(models.Model):
    student = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ewallet')
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.student.username}'s Wallet - ${self.balance}"

class Transaction(models.Model):
    TRANSACTION_TYPES = (
        ('credit', 'Credit'),
        ('debit', 'Debit'),
    )

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )

    ewallet = models.ForeignKey(EWallet, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    description = models.TextField()
    reference_number = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.transaction_type} - {self.amount} - {self.reference_number}"
