from django.db import models
from django.conf import settings
import os


def receipt_image_path(instance, filename):
    """レシート画像の保存先"""
    return f'expenses/{instance.created_by.id}/receipts/{filename}'


class ExpenseCategory(models.Model):
    """支出カテゴリモデル"""
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='expense_categories',
        verbose_name='作成者'
    )
    name = models.CharField('カテゴリ名', max_length=50)
    icon = models.CharField('アイコン', max_length=10, default='📁')
    color = models.CharField('色', max_length=20, default='gray')
    sort_order = models.IntegerField('表示順', default=0)
    is_active = models.BooleanField('有効', default=True)
    created_at = models.DateTimeField('作成日', auto_now_add=True)
    updated_at = models.DateTimeField('更新日', auto_now=True)

    class Meta:
        verbose_name = '支出カテゴリ'
        verbose_name_plural = '支出カテゴリ'
        ordering = ['sort_order', 'id']

    def __str__(self):
        return f'{self.icon} {self.name}'


class PaymentMethod(models.Model):
    """支払方法モデル"""
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='payment_methods',
        verbose_name='作成者'
    )
    name = models.CharField('支払方法名', max_length=50)
    icon = models.CharField('アイコン', max_length=10, default='💳')
    sort_order = models.IntegerField('表示順', default=0)
    is_active = models.BooleanField('有効', default=True)
    created_at = models.DateTimeField('作成日', auto_now_add=True)
    updated_at = models.DateTimeField('更新日', auto_now=True)

    class Meta:
        verbose_name = '支払方法'
        verbose_name_plural = '支払方法'
        ordering = ['sort_order', 'id']

    def __str__(self):
        return f'{self.icon} {self.name}'


class Expense(models.Model):
    """支出モデル"""
    EXPENSE_TYPE_CHOICES = [
        ('personal', '個人'),
        ('business', '会社'),
    ]

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='expenses',
        verbose_name='作成者'
    )
    
    # 基本情報
    date = models.DateField('日付')
    amount = models.PositiveIntegerField('金額')
    expense_type = models.CharField('区分', max_length=20, choices=EXPENSE_TYPE_CHOICES)
    category = models.ForeignKey(
        ExpenseCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='expenses',
        verbose_name='カテゴリ'
    )
    payment_method = models.ForeignKey(
        PaymentMethod,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='expenses',
        verbose_name='支払方法'
    )
    
    # 詳細
    description = models.CharField('内容', max_length=200)
    memo = models.TextField('メモ', blank=True)
    receipt_image = models.ImageField(
        'レシート画像',
        upload_to=receipt_image_path,
        blank=True,
        null=True
    )
    
    # 固定費から作成されたかどうか
    recurring_expense = models.ForeignKey(
        'RecurringExpense',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='generated_expenses',
        verbose_name='固定費'
    )
    
    # 管理情報
    created_at = models.DateTimeField('作成日', auto_now_add=True)
    updated_at = models.DateTimeField('更新日', auto_now=True)

    class Meta:
        verbose_name = '支出'
        verbose_name_plural = '支出'
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f'{self.date} - {self.description} ({self.amount}円)'


class RecurringExpense(models.Model):
    """固定費モデル"""
    EXPENSE_TYPE_CHOICES = [
        ('personal', '個人'),
        ('business', '会社'),
    ]
    
    FREQUENCY_CHOICES = [
        ('monthly', '毎月'),
        ('yearly', '毎年'),
    ]

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='recurring_expenses',
        verbose_name='作成者'
    )
    
    # 基本情報
    name = models.CharField('名前', max_length=100)
    amount = models.PositiveIntegerField('金額')
    expense_type = models.CharField('区分', max_length=20, choices=EXPENSE_TYPE_CHOICES)
    category = models.ForeignKey(
        ExpenseCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='recurring_expenses',
        verbose_name='カテゴリ'
    )
    payment_method = models.ForeignKey(
        PaymentMethod,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='recurring_expenses',
        verbose_name='支払方法'
    )
    
    # 繰り返し設定
    frequency = models.CharField('頻度', max_length=20, choices=FREQUENCY_CHOICES, default='monthly')
    day_of_month = models.PositiveSmallIntegerField('支払日', default=1)  # 1-31
    
    # ステータス
    is_active = models.BooleanField('有効', default=True)
    last_generated_date = models.DateField('最終生成日', null=True, blank=True)
    
    # 管理情報
    created_at = models.DateTimeField('作成日', auto_now_add=True)
    updated_at = models.DateTimeField('更新日', auto_now=True)

    class Meta:
        verbose_name = '固定費'
        verbose_name_plural = '固定費'
        ordering = ['day_of_month', 'name']

    def __str__(self):
        return f'{self.name} ({self.amount}円/{self.get_frequency_display()})'