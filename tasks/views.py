from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Count, Q
from django.db.models.functions import TruncMonth
from datetime import datetime, timedelta
from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

    def perform_update(self, serializer):
        instance = self.get_object()
        new_status = self.request.data.get('status')
        
        if new_status == 'done' and instance.status != 'done':
            serializer.save(completed_at=timezone.now())
        elif new_status != 'done':
            serializer.save(completed_at=None)
        else:
            serializer.save()

    @action(detail=False, methods=['get'], url_path='stats/monthly')
    def monthly_stats(self, request):
        """月別タスク達成率"""
        year = request.query_params.get('year', timezone.now().year)
        month = request.query_params.get('month', timezone.now().month)
        
        year = int(year)
        month = int(month)
        
        # 指定月のタスクを取得
        tasks = Task.objects.filter(
            created_at__year=year,
            created_at__month=month
        )
        
        total = tasks.count()
        done = tasks.filter(status='done').count()
        in_progress = tasks.filter(status='in_progress').count()
        todo = tasks.filter(status='todo').count()
        
        return Response({
            'year': year,
            'month': month,
            'total': total,
            'done': done,
            'in_progress': in_progress,
            'todo': todo,
            'completion_rate': round((done / total * 100), 1) if total > 0 else 0
        })

    @action(detail=False, methods=['get'], url_path='stats/yearly')
    def yearly_stats(self, request):
        """年別月ごとタスク達成率"""
        year = request.query_params.get('year', timezone.now().year)
        year = int(year)
        
        monthly_data = []
        for month in range(1, 13):
            tasks = Task.objects.filter(
                created_at__year=year,
                created_at__month=month
            )
            total = tasks.count()
            done = tasks.filter(status='done').count()
            
            monthly_data.append({
                'month': month,
                'total': total,
                'done': done,
                'completion_rate': round((done / total * 100), 1) if total > 0 else 0
            })
        
        return Response({
            'year': year,
            'data': monthly_data
        })

    @action(detail=False, methods=['get'], url_path='overdue')
    def overdue_tasks(self, request):
        """期限切れタスク"""
        today = timezone.now().date()
        overdue = Task.objects.filter(
            due_date__lt=today,
            status__in=['todo', 'in_progress']
        ).order_by('due_date')
        
        serializer = self.get_serializer(overdue, many=True)
        return Response(serializer.data)