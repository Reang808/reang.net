from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model

User = get_user_model()


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'department', 'position', 'is_staff']
    list_filter = ['is_staff', 'is_superuser', 'is_active', 'department']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'department']
    ordering = ['-date_joined']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('追加情報', {'fields': ('department', 'position', 'phone', 'avatar')}),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('追加情報', {'fields': ('email', 'first_name', 'last_name', 'department', 'position', 'phone')}),
    )