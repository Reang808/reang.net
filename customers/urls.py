from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomerViewSet, DocumentViewSet

router = DefaultRouter()
router.register(r'customers', CustomerViewSet, basename='customer')
router.register(r'documents', DocumentViewSet, basename='document')

urlpatterns = [
    path('', include(router.urls)),
]