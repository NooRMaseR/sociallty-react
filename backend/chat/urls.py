from django.urls import path
from . import views

urlpatterns = (
    path('<int:user_id>/', views.UserMessagesApi.as_view(), name='user_messages'),
)