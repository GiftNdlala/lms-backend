from django.core.management.base import BaseCommand
from accounts.services import register_student

class Command(BaseCommand):
    help = 'Creates a test student account'

    def add_arguments(self, parser):
        parser.add_argument('student_id', type=str, help='Student ID')
        parser.add_argument('email', type=str, help='Student email')
        parser.add_argument('--batch', type=str, help='Student batch')
        parser.add_argument('--program', type=str, help='Student program')

    def handle(self, *args, **options):
        student_data = {
            'student_id': options['student_id'],
            'email': options['email'],
            'first_name': 'Test',
            'last_name': 'Student',
            'batch': options.get('batch'),
            'program': options.get('program')
        }

        try:
            student = register_student(student_data)
            self.stdout.write(self.style.SUCCESS(
                f'Successfully created student with ID: {student.student_id}\n'
                f'Username: {student.user.username}\n'
                f'Check console for the welcome email with login credentials.'
            ))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error creating student: {str(e)}')) 