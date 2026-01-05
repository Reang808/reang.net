from rest_framework import serializers
from .models import Schedule
from customers.serializers import CustomerListSerializer


class ScheduleSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()
    owner = serializers.ReadOnlyField(source='owner.id')

    class Meta:
        model = Schedule
        fields = '__all__'
        read_only_fields = ('owner', 'created_at', 'updated_at')
        extra_kwargs = {
            'title': {'required': True},
            'date': {'required': True},
        }

    def get_customer_name(self, obj):
        if obj.customer:
            return obj.customer.name
        return None