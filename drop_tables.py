import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lms_backend.settings')
django.setup()

from django.db import connection

TABLES = [
    "modules_moduletest",
    "modules_module",
    "modules_modulecontent",
    "modules_modulenotification",
    "modules_notificationcomment",
    "modules_studentmoduleprogress",
    "modules_quiz",
    "modules_quizattempt",
    "modules_quizquestion",
    "modules_quizchoice",
    "modules_quizanswer",
    "modules_moduletemplate",
    "assignments_assignment",
    "assignments_assignmentsubmission",
]

with connection.cursor() as cursor:
    for table in TABLES:
        try:
            print(f"Dropping table {table} ...")
            cursor.execute(f'DROP TABLE IF EXISTS "{table}" CASCADE;')
        except Exception as e:
            print(f"Error dropping {table}: {e}")

print("Done. Now you can run makemigrations and migrate.")