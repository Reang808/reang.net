from rest_framework import serializers
from .models import Schedule
from customers.serializers import CustomerListSerializer


class ScheduleSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()

    class Meta:
        model = Schedule
        fields = '__all__'

    def get_customer_name(self, obj):
        if obj.customer:
            return obj.customer.name
        return None