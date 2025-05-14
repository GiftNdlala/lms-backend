from django.db import models
from accounts.models import User, Student, Instructor
from django.utils import timezone
from decimal import Decimal

class Module(models.Model):
    title = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True, help_text="Unique module code (e.g., MOD101)", null=True, blank=True)
    description = models.TextField()
    credits = models.PositiveIntegerField(default=0, help_text="Number of credits for this module", null=True, blank=True)
    instructor = models.ForeignKey(Instructor, on_delete=models.SET_NULL, related_name='created_modules', null=True, blank=True)
    students = models.ManyToManyField(Student, through='ModuleEnrollment', related_name='course_module_enrollments')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.code} - {self.title}" if self.code else self.title

class ModuleEnrollment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    module = models.ForeignKey(Module, on_delete=models.CASCADE)
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed = models.BooleanField(default=False)
    completion_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ['student', 'module']

    def complete_module(self):
        self.completed = True
        self.completion_date = timezone.now()
        self.save()

class Lesson(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=200)
    content = models.TextField()
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.module.title} - {self.title}"

class Assignment(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='assignments')
    title = models.CharField(max_length=200)
    description = models.TextField()
    due_date = models.DateTimeField()
    points = models.IntegerField(default=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.module.title} - {self.title}"

class AssignmentSubmission(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    content = models.TextField()
    submitted_at = models.DateTimeField(auto_now_add=True)
    grade = models.IntegerField(null=True, blank=True)
    feedback = models.TextField(blank=True)
    graded_at = models.DateTimeField(null=True, blank=True)
    graded_by = models.ForeignKey(Instructor, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        unique_together = ['assignment', 'student']

    def __str__(self):
        return f"{self.student.user.get_full_name()} - {self.assignment.title}"

class StudentProgress(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    module = models.ForeignKey(Module, on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)
    last_accessed = models.DateTimeField(auto_now=True)
    completion_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ['student', 'lesson']

    def mark_complete(self):
        self.completed = True
        self.completion_date = timezone.now()
        self.save()

class Course(models.Model):
    title = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField()
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='courses_taught')
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.code} - {self.title}"

class CourseEnrollment(models.Model):
    STATUS_CHOICES = (
        ('enrolled', 'Enrolled'),
        ('completed', 'Completed'),
        ('dropped', 'Dropped'),
        ('failed', 'Failed'),
    )

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='course_enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='course_enrollments')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='enrolled')
    enrollment_date = models.DateTimeField(auto_now_add=True)
    completion_date = models.DateTimeField(null=True, blank=True)
    final_grade = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    class Meta:
        unique_together = ['student', 'course']

    def __str__(self):
        return f"{self.student.student_id} - {self.course.code}"

class Enrollment(models.Model):
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('dropped', 'Dropped'),
        ('failed', 'Failed'),
    )
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='legacy_enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='legacy_enrollments')
    enrollment_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    final_grade = models.CharField(max_length=2, blank=True, null=True)
    grade_points = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True)
    attendance_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    last_accessed = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['student', 'course']
        ordering = ['-enrollment_date']

    def __str__(self):
        return f"{self.student.user.username} - {self.course.code}"

class CourseProgress(models.Model):
    enrollment = models.OneToOneField(Enrollment, on_delete=models.CASCADE, related_name='progress')
    completed_modules = models.ManyToManyField('Module', blank=True, related_name='completed_by')
    completed_assignments = models.ManyToManyField('Assignment', blank=True, related_name='completed_by')
    current_module = models.ForeignKey('Module', on_delete=models.SET_NULL, null=True, blank=True, related_name='current_for')
    last_activity = models.DateTimeField(auto_now=True)
    total_time_spent = models.DurationField(default=timezone.timedelta())

    def __str__(self):
        return f"Progress for {self.enrollment.student.user.username} in {self.enrollment.course.code}"

class Announcement(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='announcements')
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.course.code} - {self.title}"

class Discussion(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='discussions')
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.course.code} - {self.title}"

class Comment(models.Model):
    discussion = models.ForeignKey(Discussion, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Comment by {self.created_by.username} on {self.discussion.title}"

class EWallet(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='ewallet')
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    last_updated = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.student.user.username}'s E-Wallet"

    def can_withdraw(self):
        return self.balance >= Decimal('500.00')

class Transaction(models.Model):
    TRANSACTION_TYPES = (
        ('assessment_reward', 'Assessment Reward'),
        ('withdrawal_request', 'Withdrawal Request'),
        ('withdrawal_approved', 'Withdrawal Approved'),
        ('withdrawal_rejected', 'Withdrawal Rejected'),
    )
    
    ewallet = models.ForeignKey(EWallet, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    description = models.TextField()
    status = models.CharField(max_length=20, default='pending', choices=[
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('rejected', 'Rejected')
    ])
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    processed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.ewallet.student.user.username} - {self.transaction_type} - {self.amount}"

class WithdrawalRequest(models.Model):
    ewallet = models.ForeignKey(EWallet, on_delete=models.CASCADE, related_name='withdrawal_requests')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected')
    ], default='pending')
    request_date = models.DateTimeField(auto_now_add=True)
    processed_date = models.DateTimeField(null=True, blank=True)
    processed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    bank_details = models.JSONField()  # Store bank account details securely

    def __str__(self):
        return f"Withdrawal Request - {self.ewallet.student.user.username} - {self.amount}"

class Assessment(models.Model):
    ASSESSMENT_TYPES = (
        ('quiz', 'Quiz'),
        ('assignment', 'Assignment'),
        ('project', 'Project'),
        ('exam', 'Exam'),
    )
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    assessment_type = models.CharField(max_length=20, choices=ASSESSMENT_TYPES)
    instructor = models.ForeignKey(User, on_delete=models.CASCADE)
    module = models.ForeignKey(Module, on_delete=models.CASCADE, null=True, blank=True)
    total_marks = models.PositiveIntegerField()
    passing_marks = models.PositiveIntegerField()
    reward_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.assessment_type}"

class Question(models.Model):
    QUESTION_TYPES = (
        ('true_false', 'True/False'),
        ('short_answer', 'Short Answer'),
        ('essay', 'Essay'),
    )
    
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES)
    correct_answer = models.TextField(blank=True, null=True)  # For True/False questions
    marks = models.PositiveIntegerField()
    order = models.PositiveIntegerField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Q{self.order}: {self.question_text[:50]}..."

class AssessmentAssignment(models.Model):
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    assigned_by = models.ForeignKey(User, on_delete=models.CASCADE)
    assigned_date = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=[
        ('assigned', 'Assigned'),
        ('in_progress', 'In Progress'),
        ('submitted', 'Submitted'),
        ('graded', 'Graded')
    ])
    reward_claimed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.student.user.username} - {self.assessment.title}"

class StudentAnswer(models.Model):
    assessment_assignment = models.ForeignKey(AssessmentAssignment, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    answer_text = models.TextField()
    marks_obtained = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    feedback = models.TextField(blank=True)
    graded_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    graded_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Answer by {self.assessment_assignment.student.user.username} for Q{self.question.order}"

class AssessmentGrade(models.Model):
    assessment_assignment = models.ForeignKey(AssessmentAssignment, on_delete=models.CASCADE)
    total_marks_obtained = models.DecimalField(max_digits=5, decimal_places=2)
    grade = models.CharField(max_length=2)
    feedback = models.TextField(blank=True)
    graded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    graded_at = models.DateTimeField(auto_now_add=True)
    reward_processed = models.BooleanField(default=False)

    def __str__(self):
        return f"Grade for {self.assessment_assignment.student.user.username} - {self.assessment_assignment.assessment.title}" 