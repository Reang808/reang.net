from rest_framework import serializers
from .models import Customer, Document


class DocumentSerializer(serializers.ModelSerializer):
    filename = serializers.ReadOnlyField()
    file_size = serializers.ReadOnlyField()
    file_url = serializers.SerializerMethodField()
    customer = serializers.PrimaryKeyRelatedField(queryset=Customer.objects.none())

    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None

    def __init__(self, *args, **kwargs):
        # Restrict customer choices to those owned by the requesting user
        request = kwargs.get('context', {}).get('request')
        super().__init__(*args, **kwargs)
        if request:
            self.fields['customer'].queryset = Customer.objects.filter(created_by=request.user)


class CustomerListSerializer(serializers.ModelSerializer):
    """一覧用（軽量）"""
    document_count = serializers.SerializerMethodField()
    created_by = serializers.ReadOnlyField(source='created_by.id')

    class Meta:
        model = Customer
        fields = [
            'id', 'company_name', 'name', 'department', 'position',
            'email', 'phone', 'created_at', 'document_count', 'created_by'
        ]
        read_only_fields = ('created_at', 'updated_at')

    def get_document_count(self, obj):
        return obj.documents.count()


class CustomerDetailSerializer(serializers.ModelSerializer):
    """詳細用（書類含む）"""
    documents = DocumentSerializer(many=True, read_only=True)
    business_card_front_url = serializers.SerializerMethodField()
    business_card_back_url = serializers.SerializerMethodField()
    created_by = serializers.ReadOnlyField(source='created_by.id')

    class Meta:
        model = Customer
        fields = '__all__'
        read_only_fields = ('created_by', 'created_at', 'updated_at')

    def get_business_card_front_url(self, obj):
        request = self.context.get('request')
        if obj.business_card_front and request:
            return request.build_absolute_uri(obj.business_card_front.url)
        return None

    def get_business_card_back_url(self, obj):
        request = self.context.get('request')
        if obj.business_card_back and request:
            return request.build_absolute_uri(obj.business_card_back.url)
        return None