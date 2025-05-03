from django.core.management.base import BaseCommand
from django.utils import timezone
from accounts.models import User, Instructor

class Command(BaseCommand):
    help = 'Creates a test instructor account'

    def add_arguments(self, parser):
        parser.add_argument('employee_id', type=str, help='Employee ID')
        parser.add_argument('email', type=str, help='Instructor email')
        parser.add_argument('--department', type=str, default='Computer Science', help='Department')
        parser.add_argument('--designation', type=str, default='Lecturer', help='Designation')

    def handle(self, *args, **options):
        try:
            # Create user first
            user = User.objects.create(
                username=options['employee_id'],
                email=options['email'],
                first_name='Test',
                last_name='Instructor',
                role='instructor'
            )
            
            # Set a default password
            default_password = f"Test@{options['employee_id']}"
            user.set_password(default_password)
            user.save()

            # Create instructor profile
            instructor = Instructor.objects.create(
                user=user,
                employee_id=options['employee_id'],
                department=options['department'],
                designation=options['designation'],
                qualification='Ph.D.',
                expertise='Teaching and Research'
            )

            self.stdout.write(
                self.style.SUCCESS(
                    f'\nSuccessfully created instructor account:\n'
                    f'Username: {user.username}\n'
                    f'Password: {default_password}\n'
                    f'Email: {user.email}\n'
                    f'Department: {instructor.department}\n'
                    f'Employee ID: {instructor.employee_id}\n'
                )
            )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating instructor: {str(e)}')
            ) 