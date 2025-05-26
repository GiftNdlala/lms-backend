from django.contrib import admin
from .models import (
    ModuleTemplate, Module, ModuleContent, ModuleNotification,
    NotificationComment, StudentModuleProgress, ModuleTest,
    Quiz, QuizQuestion, QuizChoice, QuizAttempt, QuizAnswer
)

@admin.register(ModuleTemplate)
class ModuleTemplateAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'is_active', 'created_at', 'updated_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('code', 'name', 'description')
    ordering = ('code',)

# Register your models here.
