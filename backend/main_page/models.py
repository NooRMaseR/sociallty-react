from APIs.models import get_media_type
from django.dispatch import receiver
from users.models import SocialUser
from PIL import Image as pilImage
from django.db import models
from io import BytesIO
import os

# Create your models here.


class Post(models.Model):
    "Post Module for storing user post"
    class PostVisibility(models.TextChoices):
        PUBLIC = "public"
        PRIVATE =  "private"
        FRIENDS_ONLY = "friends only"
    user = models.ForeignKey(SocialUser, on_delete=models.CASCADE, related_name="posts")
    description = models.TextField(null=True, blank=True)
    visibility = models.CharField(max_length=13, choices=PostVisibility, default=PostVisibility.PUBLIC)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.description}"


class Like(models.Model):
    "Like Module for storing user Post Like"

    user = models.ForeignKey(SocialUser, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likes")
    created_at = models.DateTimeField(auto_now_add=True)


class Comment(models.Model):
    "Comment Module for storing user Post Comment"

    user = models.ForeignKey(SocialUser, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    content = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.user.username}: {self.content}"


class Comment_Like(models.Model):
    "Comment like Module for storing user Post Comment like"

    user = models.ForeignKey(SocialUser, on_delete=models.CASCADE)
    comment = models.ForeignKey(
        Comment, on_delete=models.CASCADE, related_name="comment_likes"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.user.username}: {self.comment}"


class PostContent(models.Model):
    "Post Content Module for storing user Post media Content includes (`images` and `videos`) if there are media in the post"
    
    class MediaType(models.TextChoices):
        IMAGE = "image"
        VIDEO = "video"

    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="media")
    content = models.FileField(upload_to="posts_media/", blank=True, null=True)
    content_type = models.CharField(max_length=6, choices=MediaType, null=True)
    full_content_type = models.CharField(max_length=14, null=True)
    poster = models.ImageField(upload_to="posters/", blank=True, null=True)

    def save(self, *args, **kwargs) -> None:
        media_type = get_media_type(self.content.path)
        if self.content and media_type[0] == "image":
            converted_img = pilImage.open(self.content)
            pic_in_memory = BytesIO()

            converted_img.save(pic_in_memory, "WebP")
            pic_in_memory.seek(0)

            self.imge = self.generate_webp_filename(self.content.name)
            self.content.save(self.imge, pic_in_memory, False)  # type: ignore
            self.full_content_type = media_type[1]

        return super().save(*args, **kwargs)

    def generate_webp_filename(self, img: str) -> str:
        "changing the extention of the photo for for saving some space"

        file, _ = os.path.splitext(img)
        return f"{file}.WebP"

    def __str__(self) -> str:
        return f"content description - {self.post}"


@receiver(models.signals.pre_delete, sender=Post)
def auto_delete_post_files(sender, instance, **kwargs):
    """
    Deletes associated files when a post is deleted.
    """
    for post in instance.media.all():
        if post.content and os.path.isfile(post.content.path):
            os.remove(post.content.path)
            
        if post.poster and os.path.isfile(post.poster.path):
            os.remove(post.poster.path)


@receiver(models.signals.pre_delete, sender=PostContent)
def auto_delete_post_content_files(sender, instance: PostContent, **kwargs):
    """
    Deletes associated content when the media is deleted.
    """
    if instance.content and os.path.isfile(instance.content.path):
        os.remove(instance.content.path)
        
    if instance.poster and os.path.isfile(instance.poster.path):
        os.remove(instance.poster.path)
