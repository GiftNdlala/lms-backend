from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
from django.utils import timezone

class User(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('instructor', 'Instructor'),
        ('funder', 'Funder'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    must_change_password = models.BooleanField(default=True)
    last_password_change = models.DateTimeField(null=True, blank=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    date_of_birth = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.username} ({self.role})"

    def set_password(self, raw_password):
        super().set_password(raw_password)
        if raw_password is not None:
            self.last_password_change = timezone.now()
            self.must_change_password = False

class Student(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    student_id = models.CharField(max_length=20, unique=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    enrolled_date = models.DateField(auto_now_add=True)
    batch = models.CharField(max_length=50, blank=True, null=True)
    program = models.CharField(max_length=100, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    last_login_at = models.DateTimeField(null=True, blank=True)
    assigned_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='instructor_assigned_students', null=True)
    enrollment_status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('enrolled', 'Enrolled'),
            ('completed', 'Completed'),
            ('suspended', 'Suspended')
        ],
        default='pending'
    )

    def __str__(self):
        return f"{self.user.username} - {self.student_id}"

    def generate_default_password(self):
        # Generate a default password based on student ID and some random characters
        import random
        import string
        random_suffix = ''.join(random.choices(string.ascii_letters + string.digits, k=4))
        return f"{self.student_id}_{random_suffix}"

    def enroll_in_course(self, course):
        from courses.models import Enrollment
        enrollment, created = Enrollment.objects.get_or_create(
            student=self,
            course=course,
            defaults={'status': 'active'}
        )
        return enrollment

    def get_available_courses(self):
        from courses.models import Course
        return Course.objects.filter(
            is_active=True,
            start_date__lte=timezone.now(),
            end_date__gte=timezone.now()
        )

class Instructor(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    employee_id = models.CharField(max_length=20, unique=True)
    department = models.CharField(max_length=100)
    designation = models.CharField(max_length=100)
    joining_date = models.DateField(auto_now_add=True)
    expertise = models.TextField(blank=True)
    qualification = models.CharField(max_length=200)
    is_active = models.BooleanField(default=True)
    last_login_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Instructor: {self.user.first_name} {self.user.last_name} | Email: {self.user.email} | Department: {self.department}"


    def get_active_courses(self):
        from courses.models import Course
        return Course.objects.filter(
            instructor=self.user,
            is_active=True
        )

    def get_student_count(self):
        from courses.models import CourseEnrollment
        return CourseEnrollment.objects.filter(
            course__instructor=self.user,
            status='enrolled'
        ).count()

    def generate_default_password(self):
        import random
        import string
        random_suffix = ''.join(random.choices(string.ascii_letters + string.digits, k=4))
        return f"{self.employee_id}_{random_suffix}"

class EWallet(models.Model):
    student = models.OneToOneField(Student, on_delete=models.CASCADE, related_name='account_ewallet')
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.student.user.username}'s E-Wallet"

    def add_funds(self, amount, reason):
        self.balance += amount
        self.save()
        EWalletTransaction.objects.create(
            ewallet=self,
            amount=amount,
            transaction_type='credit',
            reason=reason
        )

    def deduct_funds(self, amount, reason):
        if self.balance >= amount:
            self.balance -= amount
            self.save()
            EWalletTransaction.objects.create(
                ewallet=self,
                amount=amount,
                transaction_type='debit',
                reason=reason
            )
            return True
        return False

class EWalletTransaction(models.Model):
    ewallet = models.ForeignKey(EWallet, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=10, choices=[('credit', 'Credit'), ('debit', 'Debit')])
    reason = models.CharField(max_length=200)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.transaction_type} of {self.amount} - {self.reason}"

class Achievement(models.Model):
    ACHIEVEMENT_TYPES = [
        ('quiz', 'Quiz Achievement'),
        ('module', 'Module Achievement'),
        ('streak', 'Learning Streak'),
        ('grade', 'Grade Achievement'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='achievements')
    type = models.CharField(max_length=20, choices=ACHIEVEMENT_TYPES)
    title = models.CharField(max_length=100)
    description = models.TextField()
    points = models.PositiveIntegerField(default=0)
    earned_at = models.DateTimeField(auto_now_add=True)
    related_quiz = models.ForeignKey('modules.Quiz', on_delete=models.SET_NULL, null=True, blank=True)
    related_module = models.ForeignKey('courses.Module', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.student.user.username} - {self.title}"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        # If this is a new achievement, add points to e-wallet
        if is_new and self.points > 0:
            ewallet, created = EWallet.objects.get_or_create(student=self.student)
            ewallet.add_funds(self.points, f"Achievement: {self.title}")
