from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """ユーザー情報シリアライザー"""
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'department', 'position', 'phone', 'avatar',
            'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'username', 'date_joined', 'last_login']
    
    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class UserUpdateSerializer(serializers.ModelSerializer):
    """ユーザー情報更新シリアライザー"""
    
    class Meta:
        model = User
        fields = [
            'email', 'first_name', 'last_name',
            'department', 'position', 'phone', 'avatar'
        ]


class PasswordChangeSerializer(serializers.Serializer):
    """パスワード変更シリアライザー"""
    current_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)
    
    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('現在のパスワードが正しくありません')
        return value
    
    def validate_new_password(self, value):
        validate_password(value)
        return value


class LoginSerializer(serializers.Serializer):
    """ログインシリアライザー"""
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        user = authenticate(username=username, password=password)
        
        if not user:
            raise serializers.ValidationError('ユーザー名またはパスワードが正しくありません')
        
        if not user.is_active:
            raise serializers.ValidationError('このアカウントは無効です')
        
        attrs['user'] = user
        return attrs


class RegisterSerializer(serializers.ModelSerializer):
    """ユーザー登録シリアライザー"""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'パスワードが一致しません'})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            **validated_data,
            is_staff=False  # 一般ユーザーは admin 画面にログイン不可
        )
        return user