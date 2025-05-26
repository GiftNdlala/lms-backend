from django.contrib import admin
from .models import (
    Course, Module, Lesson,
    Announcement, Discussion, Comment, Enrollment, CourseProgress,
    Assessment, Question, AssessmentAssignment, StudentAnswer, AssessmentGrade,
    EWallet, Transaction, WithdrawalRequest
)

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('code', 'title', 'instructor', 'start_date', 'end_date', 'is_active')
    list_filter = ('is_active', 'start_date', 'end_date')
    search_fields = ('title', 'code', 'description')

@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ('title', 'instructor', 'is_active')
    list_filter = ('is_active', 'instructor')
    search_fields = ('title', 'description')

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'module', 'order')
    list_filter = ('module',)
    search_fields = ('title', 'content')

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'enrollment_date', 'status', 'final_grade')
    list_filter = ('status', 'enrollment_date', 'course')
    search_fields = ('student__user__username', 'course__title', 'course__code')

@admin.register(CourseProgress)
class CourseProgressAdmin(admin.ModelAdmin):
    list_display = ('enrollment', 'current_module', 'last_activity')
    list_filter = ('enrollment__course', 'enrollment__status')
    filter_horizontal = ('completed_modules', 'completed_assignments')

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

@admin.register(Assessment)
class AssessmentAdmin(admin.ModelAdmin):
    list_display = ('title', 'assessment_type', 'instructor', 'module', 'total_marks', 'is_active')
    list_filter = ('assessment_type', 'is_active', 'instructor')
    search_fields = ('title', 'description')

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('assessment', 'question_type', 'marks', 'order', 'is_active')
    list_filter = ('assessment', 'question_type', 'is_active')
    search_fields = ('question_text',)

@admin.register(EWallet)
class EWalletAdmin(admin.ModelAdmin):
    list_display = ('student', 'balance', 'last_updated', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('student__user__username',)

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('ewallet', 'amount', 'transaction_type', 'status', 'created_at')
    list_filter = ('transaction_type', 'status')
    search_fields = ('description', 'ewallet__student__user__username')

@admin.register(WithdrawalRequest)
class WithdrawalRequestAdmin(admin.ModelAdmin):
    list_display = ('ewallet', 'amount', 'status', 'request_date', 'processed_date')
    list_filter = ('status',)
    search_fields = ('ewallet__student__user__username',) 