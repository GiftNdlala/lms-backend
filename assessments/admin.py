from django.contrib import admin
from .models import (
    Assessment, Question, QuestionOption, Submission,
    Answer, Grade, EWallet, Transaction
)

@admin.register(Assessment)
class AssessmentAdmin(admin.ModelAdmin):
    list_display = ['title', 'module', 'assessment_type', 'total_marks', 'due_date', 'status', 'is_active']
    list_filter = ['assessment_type', 'status', 'is_active', 'module']
    search_fields = ['title', 'description', 'module__title']
    date_hierarchy = 'due_date'

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['question_text', 'assessment', 'question_type', 'marks', 'order', 'is_required']
    list_filter = ['question_type', 'is_required', 'assessment']
    search_fields = ['question_text', 'assessment__title']
    ordering = ['assessment', 'order']

@admin.register(QuestionOption)
class QuestionOptionAdmin(admin.ModelAdmin):
    list_display = ['option_text', 'question', 'is_correct', 'order']
    list_filter = ['is_correct', 'question__assessment']
    search_fields = ['option_text', 'question__question_text']
    ordering = ['question', 'order']

@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ['student', 'assessment', 'status', 'submitted_at', 'marks_obtained', 'graded_at']
    list_filter = ['status', 'assessment', 'submitted_at']
    search_fields = ['student__username', 'assessment__title', 'feedback']
    date_hierarchy = 'submitted_at'

@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ['submission', 'question', 'marks_awarded']
    list_filter = ['question__assessment', 'submission__status']
    search_fields = ['answer_text', 'submission__student__username', 'question__question_text']

@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ['student', 'module', 'assessment', 'marks_obtained', 'percentage', 'grade_letter', 'graded_at']
    list_filter = ['module', 'assessment', 'grade_letter']
    search_fields = ['student__username', 'assessment__title', 'remarks']
    date_hierarchy = 'graded_at'

@admin.register(EWallet)
class EWalletAdmin(admin.ModelAdmin):
    list_display = ['student', 'balance', 'last_updated']
    search_fields = ['student__username']
    date_hierarchy = 'last_updated'

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['ewallet', 'amount', 'transaction_type', 'status', 'reference_number', 'created_at']
    list_filter = ['transaction_type', 'status', 'created_at']
    search_fields = ['reference_number', 'description', 'ewallet__student__username']
    date_hierarchy = 'created_at'
