from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Sum, Q
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import datetime, date
from dateutil.relativedelta import relativedelta
from .models import ExpenseCategory, PaymentMethod, Expense, RecurringExpense
from .serializers import (
    ExpenseCategorySerializer, PaymentMethodSerializer,
    ExpenseSerializer, ExpenseCreateUpdateSerializer,
    RecurringExpenseSerializer
)


class ExpenseCategoryViewSet(viewsets.ModelViewSet):
    """支出カテゴリViewSet"""
    serializer_class = ExpenseCategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ExpenseCategory.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class PaymentMethodViewSet(viewsets.ModelViewSet):
    """支払方法ViewSet"""
    serializer_class = PaymentMethodSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PaymentMethod.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ExpenseViewSet(viewsets.ModelViewSet):
    """支出ViewSet"""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ExpenseCreateUpdateSerializer
        return ExpenseSerializer

    def get_queryset(self):
        queryset = Expense.objects.filter(created_by=self.request.user)
        
        # フィルター
        expense_type = self.request.query_params.get('expense_type')
        category = self.request.query_params.get('category')
        payment_method = self.request.query_params.get('payment_method')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        year = self.request.query_params.get('year')
        month = self.request.query_params.get('month')
        
        if expense_type:
            queryset = queryset.filter(expense_type=expense_type)
        if category:
            queryset = queryset.filter(category_id=category)
        if payment_method:
            queryset = queryset.filter(payment_method_id=payment_method)
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        if year and month:
            queryset = queryset.filter(date__year=year, date__month=month)
        elif year:
            queryset = queryset.filter(date__year=year)
        
        return queryset.select_related('category', 'payment_method')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """月別サマリーを取得"""
        year = request.query_params.get('year', timezone.now().year)
        month = request.query_params.get('month', timezone.now().month)
        
        queryset = self.get_queryset().filter(date__year=year, date__month=month)
        
        # 合計
        totals = queryset.aggregate(
            total=Sum('amount'),
            personal_total=Sum('amount', filter=Q(expense_type='personal')),
            business_total=Sum('amount', filter=Q(expense_type='business'))
        )
        
        # カテゴリ別
        by_category = queryset.values(
            'category__id', 'category__name', 'category__icon', 'category__color'
        ).annotate(
            total=Sum('amount')
        ).order_by('-total')
        
        # 支払方法別
        by_payment_method = queryset.values(
            'payment_method__id', 'payment_method__name', 'payment_method__icon'
        ).annotate(
            total=Sum('amount')
        ).order_by('-total')
        
        return Response({
            'year': int(year),
            'month': int(month),
            'total': totals['total'] or 0,
            'personal_total': totals['personal_total'] or 0,
            'business_total': totals['business_total'] or 0,
            'by_category': [
                {
                    'id': item['category__id'],
                    'name': item['category__name'] or '未分類',
                    'icon': item['category__icon'] or '📁',
                    'color': item['category__color'] or 'gray',
                    'total': item['total']
                }
                for item in by_category
            ],
            'by_payment_method': [
                {
                    'id': item['payment_method__id'],
                    'name': item['payment_method__name'] or '未設定',
                    'icon': item['payment_method__icon'] or '💳',
                    'total': item['total']
                }
                for item in by_payment_method
            ]
        })

    @action(detail=False, methods=['get'])
    def yearly_summary(self, request):
        """年間サマリーを取得（月別推移）"""
        year = request.query_params.get('year', timezone.now().year)
        
        queryset = self.get_queryset().filter(date__year=year)
        
        # 月別集計
        monthly_data = queryset.annotate(
            month=TruncMonth('date')
        ).values('month').annotate(
            total=Sum('amount'),
            personal_total=Sum('amount', filter=Q(expense_type='personal')),
            business_total=Sum('amount', filter=Q(expense_type='business'))
        ).order_by('month')
        
        # 12ヶ月分のデータを作成
        result = []
        for m in range(1, 13):
            month_date = date(int(year), m, 1)
            month_data = next(
                (item for item in monthly_data if item['month'] and item['month'].month == m),
                None
            )
            result.append({
                'month': m,
                'month_label': f'{m}月',
                'total': month_data['total'] if month_data else 0,
                'personal_total': month_data['personal_total'] if month_data else 0,
                'business_total': month_data['business_total'] if month_data else 0,
            })
        
        # 年間合計
        year_totals = queryset.aggregate(
            total=Sum('amount'),
            personal_total=Sum('amount', filter=Q(expense_type='personal')),
            business_total=Sum('amount', filter=Q(expense_type='business'))
        )
        
        return Response({
            'year': int(year),
            'monthly_data': result,
            'year_total': year_totals['total'] or 0,
            'year_personal_total': year_totals['personal_total'] or 0,
            'year_business_total': year_totals['business_total'] or 0,
        })

    @action(detail=False, methods=['get'])
    def export(self, request):
        """CSV出力用データを取得"""
        queryset = self.get_queryset()
        serializer = ExpenseSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)


class RecurringExpenseViewSet(viewsets.ModelViewSet):
    """固定費ViewSet"""
    serializer_class = RecurringExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return RecurringExpense.objects.filter(
            created_by=self.request.user
        ).select_related('category', 'payment_method')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['post'])
    def generate(self, request):
        """固定費から支出を生成"""
        today = timezone.now().date()
        year = request.data.get('year', today.year)
        month = request.data.get('month', today.month)
        
        recurring_expenses = self.get_queryset().filter(is_active=True)
        created_expenses = []
        
        for recurring in recurring_expenses:
            # 対象月の日付を計算
            try:
                expense_date = date(int(year), int(month), min(recurring.day_of_month, 28))
            except ValueError:
                expense_date = date(int(year), int(month), 28)
            
            # 既に生成済みかチェック
            existing = Expense.objects.filter(
                created_by=request.user,
                recurring_expense=recurring,
                date__year=year,
                date__month=month
            ).exists()
            
            if not existing:
                expense = Expense.objects.create(
                    created_by=request.user,
                    date=expense_date,
                    amount=recurring.amount,
                    expense_type=recurring.expense_type,
                    category=recurring.category,
                    payment_method=recurring.payment_method,
                    description=recurring.name,
                    recurring_expense=recurring
                )
                created_expenses.append(expense)
                
                # 最終生成日を更新
                recurring.last_generated_date = expense_date
                recurring.save()
        
        serializer = ExpenseSerializer(created_expenses, many=True, context={'request': request})
        return Response({
            'message': f'{len(created_expenses)}件の支出を生成しました',
            'created': serializer.data
        })