from django.urls import path
from . import views

urlpatterns = (
    path("", views.UserAuthAPI.as_view(), name='user-auth'), 
    path('<str:username>/<int:id>/', views.UserProfileApi.as_view(), name='user-api'),
    path("settings/", views.UserSettingsApi.as_view(), name='user-settings'),
    path("edit-user/", views.EditUserApi.as_view(), name='user-edit'),
    path("forget-password/", views.UserForgotPasswordApi.as_view(), name='user-forget-password'),
)
