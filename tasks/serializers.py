from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.id')

    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ('owner', 'created_at', 'updated_at', 'completed_at')
        extra_kwargs = {
            'title': {'required': True},
            'status': {'required': True},
            'priority': {'required': True},
        }
