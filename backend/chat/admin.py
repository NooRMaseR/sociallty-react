from .models import Message, Notification, OnlineUser
from unfold.admin import ModelAdmin
from django.contrib import admin
# Register your models here.

@admin.register(Message)
class MessageAdmin(ModelAdmin):
    list_display = ("id", "from_user", "to_user", "message", "sent_at")
    list_filter = ("sent_at",)
    search_fields = ("from_user__username", "to_user__username")
    search_help_text = "search by username"
    list_per_page = 20

@admin.register(Notification)
class NotificationAdmin(ModelAdmin):
    list_display = ("id", "to_user", "content", "created_at")
    list_filter = ("created_at",)
    search_fields = ("to_user__username",)
    search_help_text = "search by username"
    list_per_page = 20

@admin.register(OnlineUser)
class UserChannelAdmin(ModelAdmin):
    list_display = ("id", "user", "channel_name")
    list_filter = ("channel_name",)
    search_fields = ("user__username",)
    search_help_text = "search by username"
    list_per_page = 20
