from django.db.models.signals import post_delete, pre_delete
from .tasks import delete_unused_media
from django.dispatch import receiver
from django.conf import settings
from . import models
import os


if not settings.DEBUG:
    @receiver(post_delete, sender=models.Post)
    @receiver(post_delete, sender=models.PostContent)
    def auto_delete_post_files(sender, instance, **kwargs):
        """
        Deletes associated files when a post is deleted.
        """
        delete_unused_media.delay() # type: ignore
        
else:
    @receiver(post_delete, sender=models.Post)
    def auto_delete_post_files(sender, instance: models.Post, **kwargs):
        """
        Deletes associated files when a post is deleted.
        """

        for post in instance.media.all(): # type: ignore
            if post.content and os.path.isfile(post.content.path):
                os.remove(post.content.path)
                
            if post.poster and os.path.isfile(post.poster.path):
                os.remove(post.poster.path)


    @receiver(pre_delete, sender=models.PostContent)
    def auto_delete_post_content_files(sender, instance: models.PostContent, **kwargs):
        """
        Deletes associated content when the media is deleted.
        """
        if instance.image and os.path.isfile(instance.image.path):
            os.remove(instance.image.path)
        
        if instance.video and os.path.isfile(instance.video.path):
            os.remove(instance.video.path)
            
