import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lms.settings')
django.setup()

from assignments.models import Assignment
from accounts.models import Instructor

def check_assignments():
    # Get all instructors
    instructors = Instructor.objects.all()
    print("\n=== Instructors ===")
    for instructor in instructors:
        print(f"Instructor: {instructor.user.username}")
        # Get assignments for this instructor
        assignments = Assignment.objects.filter(instructor=instructor)
        print(f"Number of assignments: {assignments.count()}")
        for assignment in assignments:
            print(f"- {assignment.title} (Due: {assignment.due_date})")
        print()

if __name__ == "__main__":
    check_assignments() 