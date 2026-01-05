from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Q
from .models import Customer, Document
from .serializers import CustomerListSerializer, CustomerDetailSerializer, DocumentSerializer


class CustomerViewSet(viewsets.ModelViewSet):
    """
    顧客のCRUD + 検索機能
    """
    queryset = Customer.objects.all()
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.action == 'list':
            return CustomerListSerializer
        return CustomerDetailSerializer

    def get_queryset(self):
        queryset = Customer.objects.filter(created_by=self.request.user)
        search = self.request.query_params.get('search', None)
        
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(name_kana__icontains=search) |
                Q(company_name__icontains=search) |
                Q(email__icontains=search) |
                Q(phone__icontains=search) |
                Q(mobile__icontains=search)
            )
        
        return queryset

    def perform_create(self, serializer):
        """ 顧客作成時に自動でcreated_byをセット """
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'], url_path='upload-business-card')
    def upload_business_card(self, request, pk=None):
        """名刺画像をアップロード"""
        customer = self.get_object()
        
        if 'front' in request.FILES:
            customer.business_card_front = request.FILES['front']
        if 'back' in request.FILES:
            customer.business_card_back = request.FILES['back']
        
        customer.save()
        serializer = self.get_serializer(customer)
        return Response(serializer.data)


class DocumentViewSet(viewsets.ModelViewSet):
    """
    書類のCRUD
    """
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        # ログインユーザーの顧客に紐づく書類のみ
        queryset = Document.objects.filter(customer__created_by=self.request.user)
        customer_id = self.request.query_params.get('customer', None)
        category = self.request.query_params.get('category', None)
        
        if customer_id:
            queryset = queryset.filter(customer_id=customer_id)
        if category:
            queryset = queryset.filter(category=category)
        
        return queryset