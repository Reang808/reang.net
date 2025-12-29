from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomerViewSet, DocumentViewSet

router = DefaultRouter()
router.register(r'customers', CustomerViewSet)
router.register(r'documents', DocumentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]