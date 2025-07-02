from main_page.tasks import delete_unused_media
from django.db.models import Q, signals
from django.dispatch import receiver
from django.conf import settings
from . import models
import os

@receiver(signals.post_delete, sender=models.SocialUser)
def auto_delete_profile_pic(sender, instance, **kwargs) -> None:
    "Deletes the user profile picture when the Account is deleted"

    if instance.profile_picture:
        if settings.DEBUG:
            if (os.path.isfile(instance.profile_picture.path) and instance.profile_picture != "profile_pictures/unknown.png"):
                os.remove(instance.profile_picture.path)
        else:
            delete_unused_media.delay() # type: ignore
    
    models.Friend.objects.filter(Q(user=instance) | Q(friend=instance)).delete()
    models.UserCode.objects.filter(user=instance).delete()


@receiver(signals.post_save, sender=models.SocialUser)
def create_user_settings(sender, instance, created, **kwargs) -> None:
    
    if created:
        models.SocialUserSettings.objects.create(user=instance)