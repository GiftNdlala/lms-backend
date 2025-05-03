from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from accounts.models import Instructor
from django.utils import timezone

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates a new instructor account'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str)
        parser.add_argument('email', type=str)
        parser.add_argument('password', type=str)
        parser.add_argument('first_name', type=str)
        parser.add_argument('last_name', type=str)
        parser.add_argument('employee_id', type=str)
        parser.add_argument('department', type=str)
        parser.add_argument('designation', type=str)
        parser.add_argument('qualification', type=str)

    def handle(self, *args, **options):
        try:
            # Create user account
            user = User.objects.create_user(
                username=options['username'],
                email=options['email'],
                password=options['password'],
                first_name=options['first_name'],
                last_name=options['last_name'],
                role='instructor'
            )
            
            # Create instructor profile
            instructor = Instructor.objects.create(
                user=user,
                employee_id=options['employee_id'],
                department=options['department'],
                designation=options['designation'],
                qualification=options['qualification'],
                joining_date=timezone.now().date(),
                is_active=True
            )
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully created instructor account for {user.get_full_name()} (Employee ID: {instructor.employee_id})'
                )
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(
                    f'Error creating instructor account: {str(e)}'
                )
            ) 