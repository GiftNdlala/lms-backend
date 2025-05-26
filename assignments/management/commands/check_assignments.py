from django.core.management.base import BaseCommand
from assignments.models import Assignment
from accounts.models import Instructor

class Command(BaseCommand):
    help = 'Check all assignments in the system'

    def handle(self, *args, **options):
        # Get all instructors
        instructors = Instructor.objects.all()
        self.stdout.write("\n=== Instructors ===")
        
        if not instructors.exists():
            self.stdout.write(self.style.WARNING("No instructors found in the database"))
            return

        for instructor in instructors:
            self.stdout.write(f"\nInstructor: {instructor.user.username}")
            # Get assignments for this instructor
            assignments = Assignment.objects.filter(instructor=instructor)
            self.stdout.write(f"Number of assignments: {assignments.count()}")
            
            if assignments.exists():
                for assignment in assignments:
                    self.stdout.write(f"- {assignment.title} (Due: {assignment.due_date})")
            else:
                self.stdout.write(self.style.WARNING("No assignments found for this instructor")) 