from django.core.management.base import BaseCommand
from courses.models import Course
from accounts.models import User
from django.utils import timezone
import datetime

class Command(BaseCommand):
    help = 'Creates a course for an instructor'

    def add_arguments(self, parser):
        parser.add_argument('instructor_email', type=str, help='Email of the instructor')
        parser.add_argument('course_code', type=str, help='Course code')
        parser.add_argument('course_title', type=str, help='Course title')
        parser.add_argument('course_description', type=str, help='Course description')

    def handle(self, *args, **options):
        try:
            instructor = User.objects.get(email=options['instructor_email'], role='instructor')
            
            # Create course with start date as today and end date as 6 months from now
            start_date = timezone.now().date()
            end_date = start_date + datetime.timedelta(days=180)
            
            course = Course.objects.create(
                title=options['course_title'],
                code=options['course_code'],
                description=options['course_description'],
                instructor=instructor,
                start_date=start_date,
                end_date=end_date,
                is_active=True
            )
            
            self.stdout.write(self.style.SUCCESS(f'Successfully created course: {course.code} - {course.title}'))
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'Instructor with email {options["instructor_email"]} not found'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error creating course: {str(e)}')) 