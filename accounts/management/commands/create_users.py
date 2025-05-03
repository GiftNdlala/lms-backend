from django.core.management.base import BaseCommand
from accounts.models import User, Student, Instructor
from django.utils import timezone
from django.db import IntegrityError

class Command(BaseCommand):
    help = 'Creates initial users for the system'

    def handle(self, *args, **kwargs):
        # Create Student
        try:
            student_user = User.objects.create_user(
                username='2211@GAS.education',
                email='2211@GAS.education',
                password='Gift2003!',
                first_name='Gift',
                last_name='Ndlala',
                role='student'
            )
            
            student = Student.objects.create(
                user=student_user,
                student_id='2211',
                enrolled_date=timezone.now()
            )
            
            self.stdout.write(self.style.SUCCESS(f'Created student: {student_user.get_full_name()}'))
        except IntegrityError:
            self.stdout.write(self.style.WARNING('Student user already exists'))

        # Create Instructor
        try:
            instructor_user = User.objects.create_user(
                username='Tevin@graceartisansschool.com',
                email='Tevin@graceartisansschool.com',
                password='Tevin2024!',
                first_name='Tevin',
                last_name='Memla',
                role='instructor'
            )
            
            instructor = Instructor.objects.create(
                user=instructor_user,
                employee_id='INS002',
                joining_date=timezone.now()
            )
            
            self.stdout.write(self.style.SUCCESS(f'Created instructor: {instructor_user.get_full_name()}'))
        except IntegrityError:
            self.stdout.write(self.style.WARNING('Instructor user already exists')) 