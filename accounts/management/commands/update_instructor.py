from django.core.management.base import BaseCommand
from accounts.models import User, Instructor

class Command(BaseCommand):
    help = 'Updates an existing instructor account'

    def add_arguments(self, parser):
        parser.add_argument('employee_id', type=str, help='Employee ID of the instructor to update')
        parser.add_argument('--email', type=str, help='New email address')
        parser.add_argument('--first_name', type=str, help='New first name')
        parser.add_argument('--last_name', type=str, help='New last name')
        parser.add_argument('--department', type=str, help='New department')
        parser.add_argument('--designation', type=str, help='New designation')
        parser.add_argument('--qualification', type=str, help='New qualification')
        parser.add_argument('--expertise', type=str, help='New expertise')
        parser.add_argument('--phone', type=str, help='New phone number')
        parser.add_argument('--password', type=str, help='New password')

    def handle(self, *args, **options):
        try:
            # Find the instructor
            instructor = Instructor.objects.get(employee_id=options['employee_id'])
            user = instructor.user
            updated_fields = []

            # Update User fields
            if options.get('email'):
                user.email = options['email']
                updated_fields.append(f"Email: {user.email}")

            if options.get('first_name'):
                user.first_name = options['first_name']
                updated_fields.append(f"First Name: {user.first_name}")

            if options.get('last_name'):
                user.last_name = options['last_name']
                updated_fields.append(f"Last Name: {user.last_name}")

            if options.get('phone'):
                user.phone_number = options['phone']
                updated_fields.append(f"Phone: {user.phone_number}")

            if options.get('password'):
                user.set_password(options['password'])
                updated_fields.append("Password: [Updated]")

            user.save()

            # Update Instructor fields
            if options.get('department'):
                instructor.department = options['department']
                updated_fields.append(f"Department: {instructor.department}")

            if options.get('designation'):
                instructor.designation = options['designation']
                updated_fields.append(f"Designation: {instructor.designation}")

            if options.get('qualification'):
                instructor.qualification = options['qualification']
                updated_fields.append(f"Qualification: {instructor.qualification}")

            if options.get('expertise'):
                instructor.expertise = options['expertise']
                updated_fields.append(f"Expertise: {instructor.expertise}")

            instructor.save()

            if updated_fields:
                self.stdout.write(
                    self.style.SUCCESS(
                        f'\nSuccessfully updated instructor {instructor.employee_id}:\n' +
                        '\n'.join(updated_fields)
                    )
                )
            else:
                self.stdout.write(
                    self.style.WARNING('No fields were updated.')
                )

        except Instructor.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'Instructor with ID {options["employee_id"]} not found.')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error updating instructor: {str(e)}')
            ) 