from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ExpenseCategoryViewSet,
    PaymentMethodViewSet,
    ExpenseViewSet,
    RecurringExpenseViewSet
)

router = DefaultRouter()
router.register(r'categories', ExpenseCategoryViewSet, basename='expense-category')
router.register(r'payment-methods', PaymentMethodViewSet, basename='payment-method')
router.register(r'expenses', ExpenseViewSet, basename='expense')
router.register(r'recurring', RecurringExpenseViewSet, basename='recurring-expense')

urlpatterns = [
    path('', include(router.urls)),
]