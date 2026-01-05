from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout, get_user_model
from .serializers import (
    UserSerializer, 
    UserUpdateSerializer,
    PasswordChangeSerializer,
    LoginSerializer,
    RegisterSerializer
)

User = get_user_model()


class LoginView(APIView):
    """ログインAPI"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        login(request, user)
        
        # トークン取得または作成
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data,
            'message': 'ログインしました'
        })


class LogoutView(APIView):
    """ログアウトAPI"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # トークン削除
        try:
            request.user.auth_token.delete()
        except:
            pass
        
        logout(request)
        
        return Response({
            'message': 'ログアウトしました'
        })


class RegisterView(generics.CreateAPIView):
    """ユーザー登録API"""
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # トークン作成
        token = Token.objects.create(user=user)
        
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data,
            'message': 'ユーザー登録が完了しました'
        }, status=status.HTTP_201_CREATED)


class CurrentUserView(APIView):
    """現在のユーザー情報取得API"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class UserUpdateView(APIView):
    """ユーザー情報更新API"""
    permission_classes = [IsAuthenticated]
    
    def put(self, request):
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'user': UserSerializer(request.user).data,
            'message': 'ユーザー情報を更新しました'
        })
    
    def patch(self, request):
        return self.put(request)


class PasswordChangeView(APIView):
    """パスワード変更API"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        
        # 新しいトークンを発行
        request.user.auth_token.delete()
        token = Token.objects.create(user=request.user)
        
        return Response({
            'token': token.key,
            'message': 'パスワードを変更しました'
        })


class CheckAuthView(APIView):
    """認証状態確認API"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        if request.user.is_authenticated:
            return Response({
                'is_authenticated': True,
                'user': UserSerializer(request.user).data
            })
        return Response({
            'is_authenticated': False,
            'user': None
        })