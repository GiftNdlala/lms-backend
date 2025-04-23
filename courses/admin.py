from django.contrib import admin
from .models import Course, Module, Lesson, Assignment, Submission, Announcement, Discussion, Comment, Enrollment, CourseProgress

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('course_code', 'title', 'instructor', 'start_date', 'end_date', 'is_active')
    list_filter = ('is_active', 'start_date', 'end_date')
    search_fields = ('title', 'course_code', 'description')

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'enrollment_date', 'status', 'final_grade', 'attendance_percentage')
    list_filter = ('status', 'enrollment_date', 'course')
    search_fields = ('student__user__username', 'course__title', 'course__course_code')
    readonly_fields = ('enrollment_date', 'last_accessed')

@admin.register(CourseProgress)
class CourseProgressAdmin(admin.ModelAdmin):
    list_display = ('enrollment', 'current_module', 'last_activity')
    list_filter = ('enrollment__course', 'enrollment__status')
    search_fields = ('enrollment__student__user__username', 'enrollment__course__title')
    filter_horizontal = ('completed_modules', 'completed_assignments')

@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order')
    list_filter = ('course',)
    search_fields = ('title', 'description')

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'module', 'order')
    list_filter = ('module__course', 'module')
    search_fields = ('title', 'content')

@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'due_date', 'total_points')
    list_filter = ('course', 'due_date')
    search_fields = ('title', 'description')

@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ('assignment', 'student', 'submitted_at', 'grade')
    list_filter = ('assignment__course', 'student', 'submitted_at')
    search_fields = ('content', 'feedback')

@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'created_by', 'created_at')
    list_filter = ('course', 'created_at')
    search_fields = ('title', 'content')

@admin.register(Discussion)
class DiscussionAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'created_by', 'created_at')
    list_filter = ('course', 'created_at')
    search_fields = ('title', 'content')

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('discussion', 'created_by', 'created_at')
    list_filter = ('discussion__course', 'created_at')
    search_fields = ('content',) 