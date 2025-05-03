from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from .models import User, Student

def register_student(student_data):
    """
    Register a new student with default password
    """
    # Create user first
    user = User.objects.create(
        username=student_data['student_id'],
        email=student_data['email'],
        first_name=student_data['first_name'],
        last_name=student_data['last_name'],
        role='student'
    )
    
    # Create student profile
    student = Student.objects.create(
        user=user,
        student_id=student_data['student_id'],
        batch=student_data.get('batch'),
        program=student_data.get('program')
    )
    
    # Generate and set default password
    default_password = student.generate_default_password()
    user.set_password(default_password)
    user.save()
    
    # Send welcome email with credentials
    send_welcome_email(student, default_password)
    
    return student

def send_welcome_email(student, password):
    """
    Send welcome email to student with their credentials
    """
    subject = 'Welcome to LMS - Your Login Credentials'
    message = f'''
    Welcome to the Learning Management System!
    
    Your login credentials are:
    Username: {student.user.username}
    Password: {password}
    
    Please change your password when you first log in.
    
    Access the system at: {settings.LMS_URL}
    '''
    
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [student.user.email],
        fail_silently=False,
    )

def change_student_password(student, new_password):
    """
    Change student password and update relevant fields
    """
    user = student.user
    user.set_password(new_password)
    user.must_change_password = False
    user.save()
    
    return True 