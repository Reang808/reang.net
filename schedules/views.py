from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from datetime import datetime, timedelta
from .models import Schedule
from .serializers import ScheduleSerializer
from tasks.models import Task
from tasks.serializers import TaskSerializer


class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer

    def get_queryset(self):
        queryset = Schedule.objects.all()
        
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        return queryset

    @action(detail=False, methods=['get'], url_path='calendar')
    def calendar(self, request):
        """カレンダー表示用"""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if not start_date or not end_date:
            return Response({'error': 'start_date and end_date are required'}, status=400)
        
        schedules = Schedule.objects.filter(
            date__gte=start_date,
            date__lte=end_date
        )
        schedule_data = ScheduleSerializer(schedules, many=True).data
        
        tasks = Task.objects.filter(
            due_date__gte=start_date,
            due_date__lte=end_date
        )
        task_data = TaskSerializer(tasks, many=True).data
        
        return Response({
            'schedules': schedule_data,
            'tasks': task_data
        })

    @action(detail=False, methods=['get'], url_path='daily')
    def daily(self, request):
        """指定日のスケジュールとタスク"""
        date = request.query_params.get('date')
        
        if not date:
            return Response({'error': 'date is required'}, status=400)
        
        schedules = Schedule.objects.filter(date=date).order_by('start_time')
        schedule_data = ScheduleSerializer(schedules, many=True).data
        
        tasks = Task.objects.filter(due_date=date)
        task_data = TaskSerializer(tasks, many=True).data
        
        return Response({
            'date': date,
            'schedules': schedule_data,
            'tasks': task_data
        })