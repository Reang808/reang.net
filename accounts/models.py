from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """カスタムユーザーモデル"""
    
    # 追加フィールド
    department = models.CharField('部署', max_length=100, blank=True)
    position = models.CharField('役職', max_length=100, blank=True)
    phone = models.CharField('電話番号', max_length=20, blank=True)
    avatar = models.ImageField('プロフィール画像', upload_to='avatars/', blank=True, null=True)
    
    created_at = models.DateTimeField('作成日', auto_now_add=True)
    updated_at = models.DateTimeField('更新日', auto_now=True)

    class Meta:
        verbose_name = 'ユーザー'
        verbose_name_plural = 'ユーザー'

    def __str__(self):
        return self.get_full_name() or self.username