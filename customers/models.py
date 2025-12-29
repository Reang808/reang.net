from django.db import models
import os

def customer_directory_path(instance, filename):
    """顧客ごとのフォルダにファイルを保存"""
    return f'customers/{instance.customer.id}/{filename}'

def business_card_path(instance, filename):
    """名刺画像の保存先"""
    return f'customers/{instance.id}/business_card/{filename}'


class Customer(models.Model):
    """顧客モデル"""
    # 基本情報
    company_name = models.CharField('会社名', max_length=200, blank=True)
    department = models.CharField('部署', max_length=100, blank=True)
    position = models.CharField('役職', max_length=100, blank=True)
    name = models.CharField('氏名', max_length=100)
    name_kana = models.CharField('氏名（カナ）', max_length=100, blank=True)
    
    # 連絡先
    email = models.EmailField('メールアドレス', blank=True)
    phone = models.CharField('電話番号', max_length=20, blank=True)
    mobile = models.CharField('携帯番号', max_length=20, blank=True)
    fax = models.CharField('FAX', max_length=20, blank=True)
    
    # 住所
    postal_code = models.CharField('郵便番号', max_length=10, blank=True)
    address = models.TextField('住所', blank=True)
    
    # Web
    website = models.URLField('Webサイト', blank=True)
    
    # 名刺画像
    business_card_front = models.ImageField('名刺（表）', upload_to=business_card_path, blank=True, null=True)
    business_card_back = models.ImageField('名刺（裏）', upload_to=business_card_path, blank=True, null=True)
    
    # メモ
    notes = models.TextField('メモ', blank=True)
    
    # 管理情報
    created_at = models.DateTimeField('登録日', auto_now_add=True)
    updated_at = models.DateTimeField('更新日', auto_now=True)

    class Meta:
        verbose_name = '顧客'
        verbose_name_plural = '顧客'
        ordering = ['-created_at']

    def __str__(self):
        if self.company_name:
            return f'{self.company_name} - {self.name}'
        return self.name


class Document(models.Model):
    """顧客に紐づく書類モデル"""
    CATEGORY_CHOICES = [
        ('estimate', '見積書'),
        ('proposal', '提案書'),
        ('invoice', '請求書'),
        ('contract', '契約書'),
        ('web_data', 'Webサイトデータ'),
        ('photo', '写真'),
        ('other', 'その他'),
    ]

    customer = models.ForeignKey(
        Customer, 
        on_delete=models.CASCADE, 
        related_name='documents',
        verbose_name='顧客'
    )
    category = models.CharField('カテゴリ', max_length=20, choices=CATEGORY_CHOICES, default='other')
    title = models.CharField('タイトル', max_length=200)
    file = models.FileField('ファイル', upload_to=customer_directory_path)
    description = models.TextField('説明', blank=True)
    created_at = models.DateTimeField('登録日', auto_now_add=True)
    updated_at = models.DateTimeField('更新日', auto_now=True)

    class Meta:
        verbose_name = '書類'
        verbose_name_plural = '書類'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.customer.name} - {self.title}'
    
    @property
    def filename(self):
        return os.path.basename(self.file.name)
    
    @property
    def file_size(self):
        try:
            return self.file.size
        except:
            return 0