from django.contrib import admin
from modules.models import Module
from .models import (
    ModuleTemplate, Module, ModuleContent, ModuleNotification,
    NotificationComment, StudentModuleProgress, ModuleTest,
    Quiz, QuizQuestion, QuizChoice, QuizAttempt, QuizAnswer,
    ModuleSection, SectionContent
)

# admin.site.register(Module)  # Removed to avoid duplicate registration
@admin.register(ModuleTemplate)
class ModuleTemplateAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'is_active', 'created_at', 'updated_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('code', 'name', 'description')
    ordering = ('code',)

# Register your models here.
admin.site.register(ModuleSection)
admin.site.register(SectionContent)
