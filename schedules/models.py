from django.db import models


class Schedule(models.Model):
    """スケジュールモデル"""
    COLOR_CHOICES = [
        ('blue', '青'),
        ('green', '緑'),
        ('red', '赤'),
        ('yellow', '黄'),
        ('purple', '紫'),
        ('pink', 'ピンク'),
        ('gray', 'グレー'),
    ]

    title = models.CharField('タイトル', max_length=200)
    description = models.TextField('詳細', blank=True)
    date = models.DateField('日付')
    start_time = models.TimeField('開始時刻', null=True, blank=True)
    end_time = models.TimeField('終了時刻', null=True, blank=True)
    is_all_day = models.BooleanField('終日', default=False)
    color = models.CharField('色', max_length=20, choices=COLOR_CHOICES, default='blue')
    location = models.CharField('場所', max_length=200, blank=True)
    
    # 顧客との紐付け（オプション）
    customer = models.ForeignKey(
        'customers.Customer',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='schedules',
        verbose_name='関連顧客'
    )
    
    created_at = models.DateTimeField('作成日', auto_now_add=True)
    updated_at = models.DateTimeField('更新日', auto_now=True)

    class Meta:
        verbose_name = 'スケジュール'
        verbose_name_plural = 'スケジュール'
        ordering = ['date', 'start_time']

    def __str__(self):
        return f'{self.date} - {self.title}'