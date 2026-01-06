from django.contrib import admin
from .models import ExpenseCategory, PaymentMethod, Expense, RecurringExpense


@admin.register(ExpenseCategory)
class ExpenseCategoryAdmin(admin.ModelAdmin):
    list_display = ['icon', 'name', 'color', 'sort_order', 'is_active', 'created_by']
    list_filter = ['is_active', 'created_by']
    search_fields = ['name']
    ordering = ['sort_order', 'id']


@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ['icon', 'name', 'sort_order', 'is_active', 'created_by']
    list_filter = ['is_active', 'created_by']
    search_fields = ['name']
    ordering = ['sort_order', 'id']


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ['date', 'description', 'amount', 'expense_type', 'category', 'payment_method', 'created_by']
    list_filter = ['expense_type', 'category', 'payment_method', 'date', 'created_by']
    search_fields = ['description', 'memo']
    date_hierarchy = 'date'
    ordering = ['-date', '-created_at']


@admin.register(RecurringExpense)
class RecurringExpenseAdmin(admin.ModelAdmin):
    list_display = ['name', 'amount', 'expense_type', 'frequency', 'day_of_month', 'is_active', 'created_by']
    list_filter = ['expense_type', 'frequency', 'is_active', 'created_by']
    search_fields = ['name']
    ordering = ['day_of_month', 'name']