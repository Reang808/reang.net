from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('me/', views.CurrentUserView.as_view(), name='current_user'),
    path('me/update/', views.UserUpdateView.as_view(), name='user_update'),
    path('me/password/', views.PasswordChangeView.as_view(), name='password_change'),
    path('check/', views.CheckAuthView.as_view(), name='check_auth'),
]