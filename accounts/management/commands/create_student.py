from django.core.management.base import BaseCommand
from django.utils import timezone
from accounts.models import User, Student

class Command(BaseCommand):
    help = 'Creates a new student account with all necessary details'

    def add_arguments(self, parser):
        parser.add_argument('--first_name', type=str, required=True)
        parser.add_argument('--email', type=str, required=True)
        parser.add_argument('--password', type=str, required=True)
        parser.add_argument('--student_id', type=str, required=True)

    def handle(self, *args, **options):
        email = options['email']
        password = options['password']
        first_name = options['first_name']
        student_id = options['student_id']

        try:
            # Check if user already exists
            if User.objects.filter(email=email).exists():
                self.stdout.write(self.style.WARNING(f'User with email {email} already exists'))
                return

            # Create user
            user = User.objects.create_user(
                username=email,  # Using email as username
                email=email,
                password=password,
                first_name=first_name,
                role='student'
            )

            # Create student profile
            student = Student.objects.create(
                user=user,
                student_id=student_id,
                is_active=True,
                enrollment_status='enrolled'
            )

            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully created student account for {first_name}\n'
                    f'Email: {email}\n'
                    f'Student ID: {student_id}'
                )
            )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating student account: {str(e)}')
            ) 