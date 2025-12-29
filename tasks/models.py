from django.db import models

class Task(models.Model):
    STATUS_CHOICES = [
        ('todo', '未着手'),
        ('in_progress', '進行中'),
        ('done', '完了'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', '低'),
        ('medium', '中'),
        ('high', '高'),
    ]

    title = models.CharField('タイトル', max_length=200)
    description = models.TextField('詳細', blank=True)
    status = models.CharField('ステータス', max_length=20, choices=STATUS_CHOICES, default='todo')
    priority = models.CharField('優先度', max_length=20, choices=PRIORITY_CHOICES, default='medium')
    due_date = models.DateField('期限', null=True, blank=True)
    completed_at = models.DateTimeField('完了日時', null=True, blank=True)  # 追加
    created_at = models.DateTimeField('作成日', auto_now_add=True)
    updated_at = models.DateTimeField('更新日', auto_now=True)

    class Meta:
        verbose_name = 'タスク'
        verbose_name_plural = 'タスク'
        ordering = ['-created_at']

    def __str__(self):
        return self.title