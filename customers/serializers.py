from rest_framework import serializers
from .models import Customer, Document


class DocumentSerializer(serializers.ModelSerializer):
    filename = serializers.ReadOnlyField()
    file_size = serializers.ReadOnlyField()
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = '__all__'

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None


class CustomerListSerializer(serializers.ModelSerializer):
    """一覧用（軽量）"""
    document_count = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = [
            'id', 'company_name', 'name', 'department', 'position',
            'email', 'phone', 'created_at', 'document_count'
        ]

    def get_document_count(self, obj):
        return obj.documents.count()


class CustomerDetailSerializer(serializers.ModelSerializer):
    """詳細用（書類含む）"""
    documents = DocumentSerializer(many=True, read_only=True)
    business_card_front_url = serializers.SerializerMethodField()
    business_card_back_url = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = '__all__'

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