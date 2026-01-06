from rest_framework import serializers
from .models import ExpenseCategory, PaymentMethod, Expense, RecurringExpense


class ExpenseCategorySerializer(serializers.ModelSerializer):
    """支出カテゴリシリアライザー"""
    
    class Meta:
        model = ExpenseCategory
        fields = ['id', 'name', 'icon', 'color', 'sort_order', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class PaymentMethodSerializer(serializers.ModelSerializer):
    """支払方法シリアライザー"""
    
    class Meta:
        model = PaymentMethod
        fields = ['id', 'name', 'icon', 'sort_order', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class ExpenseSerializer(serializers.ModelSerializer):
    """支出シリアライザー"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_icon = serializers.CharField(source='category.icon', read_only=True)
    payment_method_name = serializers.CharField(source='payment_method.name', read_only=True)
    payment_method_icon = serializers.CharField(source='payment_method.icon', read_only=True)
    expense_type_display = serializers.CharField(source='get_expense_type_display', read_only=True)
    receipt_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Expense
        fields = [
            'id', 'date', 'amount', 'expense_type', 'expense_type_display',
            'category', 'category_name', 'category_icon',
            'payment_method', 'payment_method_name', 'payment_method_icon',
            'description', 'memo', 'receipt_image', 'receipt_image_url',
            'recurring_expense', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_receipt_image_url(self, obj):
        if obj.receipt_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.receipt_image.url)
            return obj.receipt_image.url
        return None


class ExpenseCreateUpdateSerializer(serializers.ModelSerializer):
    """支出作成・更新用シリアライザー"""
    
    class Meta:
        model = Expense
        fields = [
            'id', 'date', 'amount', 'expense_type',
            'category', 'payment_method',
            'description', 'memo', 'receipt_image'
        ]
        read_only_fields = ['id']


class RecurringExpenseSerializer(serializers.ModelSerializer):
    """固定費シリアライザー"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_icon = serializers.CharField(source='category.icon', read_only=True)
    payment_method_name = serializers.CharField(source='payment_method.name', read_only=True)
    payment_method_icon = serializers.CharField(source='payment_method.icon', read_only=True)
    expense_type_display = serializers.CharField(source='get_expense_type_display', read_only=True)
    frequency_display = serializers.CharField(source='get_frequency_display', read_only=True)
    
    class Meta:
        model = RecurringExpense
        fields = [
            'id', 'name', 'amount', 'expense_type', 'expense_type_display',
            'category', 'category_name', 'category_icon',
            'payment_method', 'payment_method_name', 'payment_method_icon',
            'frequency', 'frequency_display', 'day_of_month',
            'is_active', 'last_generated_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'last_generated_date', 'created_at', 'updated_at']


class ExpenseSummarySerializer(serializers.Serializer):
    """支出サマリーシリアライザー"""
    total = serializers.IntegerField()
    personal_total = serializers.IntegerField()
    business_total = serializers.IntegerField()
    by_category = serializers.ListField()
    by_payment_method = serializers.ListField()


class MonthlyExpenseSerializer(serializers.Serializer):
    """月別支出シリアライザー"""
    month = serializers.CharField()
    total = serializers.IntegerField()
    personal_total = serializers.IntegerField()
    business_total = serializers.IntegerField()