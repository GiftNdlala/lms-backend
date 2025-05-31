from django.db import models
from django.conf import settings
from accounts.models import Instructor, Student
from courses.models import Module
from assessments.models import Assessment

class ModuleTemplate(models.Model):
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.code} - {self.name}"

    class Meta:
        ordering = ['code']
        verbose_name = 'Module Template'
        verbose_name_plural = 'Module Templates'

class ModuleContent(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='contents')
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to='module_contents/')
    file_type = models.CharField(max_length=50)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.title} - {self.module.title}"

    class Meta:
        ordering = ['-uploaded_at']

class ModuleNotification(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.title} - {self.module.code}"

    class Meta:
        ordering = ['-created_at']

class NotificationComment(models.Model):
    notification = models.ForeignKey(ModuleNotification, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Comment by {self.user.username} on {self.notification.title}"

    class Meta:
        ordering = ['-created_at']

class StudentModuleProgress(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='module_progress')
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='student_progress')
    content = models.ForeignKey(ModuleContent, on_delete=models.CASCADE, related_name='student_progress')
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    last_accessed = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['student', 'module', 'content']
        ordering = ['-last_accessed']

    def __str__(self):
        return f"{self.student.user.username} - {self.module.title} - {self.content.title}"

class ModuleTest(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='tests')
    title = models.CharField(max_length=200)
    description = models.TextField()
    date = models.DateTimeField()
    duration = models.DurationField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.module.code}"

    class Meta:
        ordering = ['-date']

class Quiz(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='quizzes')
    title = models.CharField(max_length=200)
    description = models.TextField()
    time_limit = models.DurationField(help_text="Time limit for the quiz")
    total_points = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.module.code}"

    class Meta:
        ordering = ['-created_at']

class QuizQuestion(models.Model):
    QUESTION_TYPES = [
        ('MCQ', 'Multiple Choice Question'),
        ('TF', 'True/False'),
        ('SA', 'Short Answer'),
    ]

    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=3, choices=QUESTION_TYPES)
    points = models.PositiveIntegerField(default=1)
    order = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"Question {self.order} - {self.quiz.title}"

    class Meta:
        ordering = ['order']

class QuizChoice(models.Model):
    question = models.ForeignKey(QuizQuestion, on_delete=models.CASCADE, related_name='choices')
    choice_text = models.CharField(max_length=200)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.choice_text} - {self.question.question_text[:50]}"

class QuizAttempt(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='quiz_attempts')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    score = models.PositiveIntegerField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.student.user.username} - {self.quiz.title}"

    class Meta:
        ordering = ['-started_at']

class QuizAnswer(models.Model):
    attempt = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(QuizQuestion, on_delete=models.CASCADE)
    answer_text = models.TextField()
    is_correct = models.BooleanField(default=False)
    points_earned = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"Answer for {self.question.question_text[:50]}"

class ModuleSection(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='sections')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.module.title} - {self.title}"

class SectionContent(models.Model):
    section = models.ForeignKey(ModuleSection, on_delete=models.CASCADE, related_name='contents')
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to='section_contents/', blank=True, null=True)
    file_type = models.CharField(max_length=50, blank=True)
    text_content = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.section.title} - {self.title}"

# Signal to automatically create an Assessment when a Quiz is created
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=Quiz)
def create_assessment_for_quiz(sender, instance, created, **kwargs):
    if created:
        Assessment.objects.create(
            title=instance.title,
            description=instance.description,
            module=instance.module,
            assessment_type='quiz',
            total_marks=instance.total_points,
            passing_marks=instance.total_points * 0.6,  # Example: 60% passing
            due_date=instance.created_at,  # You might want to adjust this
            status='published' if instance.is_published else 'draft'
        ) 