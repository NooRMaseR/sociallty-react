from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import SocialUser, Friend, SocialUserSettings
from django.contrib.auth.models import Group
from django.contrib.auth.admin import GroupAdmin as BaseGroupAdmin

# Register your models here.
admin.site.unregister(Group)

@admin.register(Group)
class GroupAdmin(BaseGroupAdmin, ModelAdmin):
    pass


@admin.register(SocialUser)
class UserClass(ModelAdmin):
    search_fields = ("email", "username")
    search_help_text = "search by email or username"
    list_filter = (
        "is_active",
        "is_staff",
        "is_superuser",
        "last_login",
    )
    list_display = (
        "username",
        "email",
        "first_name",
        "last_name",
        "is_staff",
        "is_active",
    )
    
    list_per_page = 20

    actions = ("deactivate_account", "activate_account")

    @admin.action(description="Deactivate Selected Accounts")
    def deactivate_account(self, _, queryset) -> None:
        queryset.update(is_active=False)

    @admin.action(description="Activate Selected Accounts")
    def activate_account(self, _, queryset) -> None:
        queryset.update(is_active=True)



@admin.register(Friend)
class FriendClass(ModelAdmin):
    list_display = (
        "user",
        "friend",
        "friends_since",
    )
    search_fields = ("user__username",)
    search_help_text = "search by username"
    list_filter = (
        "friends_since",
        "user",
    )

    list_per_page = 20
    
@admin.register(SocialUserSettings)
class SocialUserSettingsClass(ModelAdmin):
    search_fields = ('user__username',)
    search_fields_help_text = "search by username"
    list_filter = ("is_private_account",)
    list_per_page = 20
    