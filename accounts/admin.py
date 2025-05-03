from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Student, Instructor

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'role', 'is_staff']
    list_filter = ['role', 'is_staff', 'is_superuser']
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email', 'role')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['user', 'student_id', 'enrolled_date']
    search_fields = ['user__username', 'student_id']
    list_filter = ['enrolled_date']

@admin.register(Instructor)
class InstructorAdmin(admin.ModelAdmin):
    list_display = ['user', 'employee_id', 'department', 'designation', 'is_active']
    list_filter = ['department', 'is_active', 'joining_date']
    search_fields = ['user__username', 'user__email', 'employee_id']
    readonly_fields = ['joining_date']
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'employee_id', 'department', 'designation')
        }),
        ('Additional Information', {
            'fields': ('expertise', 'qualification', 'is_active')
        }),
        ('Dates', {
            'fields': ('joining_date',)
        }),
    )
