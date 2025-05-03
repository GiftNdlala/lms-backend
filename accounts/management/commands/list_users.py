from django.core.management.base import BaseCommand
from accounts.models import User, Student, Instructor

class Command(BaseCommand):
    help = 'Lists all users in the system with detailed information'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('\n=== All Users (Detailed) ==='))
        for user in User.objects.all():
            self.stdout.write(self.style.SUCCESS(f'\nUser Details:'))
            self.stdout.write(f'ID: {user.id}')
            self.stdout.write(f'Username (exact): "{user.username}"')
            self.stdout.write(f'Email (exact): "{user.email}"')
            self.stdout.write(f'Name: {user.get_full_name()}')
            self.stdout.write(f'Role: {user.role}')
            self.stdout.write(f'Is Active: {user.is_active}')
            self.stdout.write('---')

        # List students
        self.stdout.write(self.style.SUCCESS('\n=== Students ==='))
        for student in Student.objects.all():
            self.stdout.write(f'Student ID: {student.student_id}')
            self.stdout.write(f'User: {student.user.username}')
            self.stdout.write(f'Name: {student.user.get_full_name()}')
            self.stdout.write('---')

        # List instructors
        self.stdout.write(self.style.SUCCESS('\n=== Instructors ==='))
        for instructor in Instructor.objects.all():
            self.stdout.write(f'Employee ID: {instructor.employee_id}')
            self.stdout.write(f'User: {instructor.user.username}')
            self.stdout.write(f'Name: {instructor.user.get_full_name()}')
            self.stdout.write('---') 