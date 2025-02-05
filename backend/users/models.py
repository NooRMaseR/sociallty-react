import os
from typing import Any
from django.db import models
from django.dispatch import receiver
from django.db.models import Q, signals
from django.core.validators import MinLengthValidator
from phonenumber_field.modelfields import PhoneNumberField
from django.contrib.auth.models import AbstractBaseUser, UserManager, PermissionsMixin
# Create your models here.


class CustomUserManager(UserManager):
    def create_user(self, username: str, email: str | None = None, password: str | None = None, **extra_fields: Any) -> Any:
        if not email:
            raise ValueError("Email is required")
        if not username:
            raise ValueError("Username is required")

        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, username, email, password=None, **extra_fields) -> Any:
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        # Pass username argument to create_user method
        return self.create_user(username, email, password, **extra_fields)


class SocialUser(AbstractBaseUser, PermissionsMixin):
    """
    the base class for user CustomUserModel
    
    props:
    
        first_name

        last_name

        username

        password

        email

        birth

        bio

        profile_picture

        phone

    """

    first_name = models.CharField(max_length=20)
    last_name = models.CharField(max_length=20)
    username = models.CharField(max_length=150)
    password = models.CharField(max_length=255, validators=[MinLengthValidator(8)])
    email = models.EmailField(unique=True)
    birth = models.DateField(null=True)
    bio = models.TextField(max_length=150, null=True, blank=True)
    profile_picture = models.ImageField(
        upload_to="profile_pictures/",
        default="profile_pictures/unknown.png"
    )
    phone = PhoneNumberField(unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(blank=True, null=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    objects = CustomUserManager()

    def __str__(self) -> str:
        return self.username


class Friend(models.Model):
    user = models.ForeignKey(SocialUser, on_delete=models.CASCADE, related_name="user")
    friend = models.ForeignKey(SocialUser, on_delete=models.CASCADE, related_name="friend")
    friends_since = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.user.username} friend of {self.friend.username}"

class FriendRequest(models.Model):
    user = models.ForeignKey(SocialUser, on_delete=models.CASCADE, related_name="user_request")
    friend = models.ForeignKey(SocialUser, on_delete=models.CASCADE, related_name="friend_request")
    requested_since = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.user.username} friend request to {self.friend.username}"

class UserCode(models.Model):
    user = models.OneToOneField(SocialUser, on_delete=models.CASCADE)
    code = models.SmallIntegerField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.user.username} code is {self.code}"

class SocialUserSettings(models.Model):
    user = models.OneToOneField(SocialUser, on_delete=models.CASCADE, related_name="settings")
    is_private_account = models.BooleanField(default=False)
    
    def __str__(self) -> str:
        return f"{self.user} Settings"
    
@receiver(signals.post_delete, sender=SocialUser)
def auto_delete_profile_pic(sender, instance, **kwargs) -> None:
    "Deletes the user profile picture when the Account is deleted"

    if instance.profile_picture:
        if (os.path.isfile(instance.profile_picture.path) and instance.profile_picture != "profile_pictures/unknown.png"):
            os.remove(instance.profile_picture.path)
    
    Friend.objects.filter(Q(user=instance) | Q(friend=instance)).delete()
    UserCode.objects.filter(user=instance).delete()

@receiver(signals.post_save, sender=SocialUser)
def create_user_settings(sender, instance, created, **kwargs) -> None:
    
    if created:
        SocialUserSettings.objects.create(user=instance)