import os
import django
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lms.settings')
django.setup()

from assignments.models import Assignment
from accounts.models import Instructor
from courses.models import Module

def create_test_assignment():
    # Get the first instructor
    instructor = Instructor.objects.first()
    if not instructor:
        print("No instructor found in the database")
        return

    # Get the first module
    module = Module.objects.first()
    if not module:
        print("No module found in the database")
        return

    # Create a test assignment
    assignment = Assignment.objects.create(
        title="Test Assignment",
        description="This is a test assignment created for testing purposes.",
        assignment_type="module",
        due_date=datetime.now() + timedelta(days=7),  # Due in 7 days
        total_marks=100,
        instructor=instructor,
        module=module
    )
    print(f"Created test assignment: {assignment.title}")

if __name__ == "__main__":
    create_test_assignment() 