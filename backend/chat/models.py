import annotated_types
from django.db import models
from typing import Annotated, Literal
from main_page.models import SocialUser
from pydantic import BaseModel, PositiveInt

# Create your models here.
class OnlineUser(models.Model):
    user = models.ForeignKey(SocialUser, on_delete=models.CASCADE)
    channel_name = models.CharField(max_length=255)
    
class Message(models.Model):
    from_user = models.ForeignKey(SocialUser, on_delete=models.CASCADE, related_name="from_user")
    to_user = models.ForeignKey(SocialUser, on_delete=models.CASCADE, related_name="to_user")
    replied_to = models.ForeignKey("self", on_delete=models.CASCADE, null=True, blank=True, related_name="reply")
    message = models.TextField(max_length=3000)
    sent_at = models.DateTimeField(auto_now_add=True)
    
class Reactions(models.TextChoices):
    LIKE = "like"
    DISLIKE = "dislike"
    LOVE = "love"
    HAHA = "haha"
    WOW = "wow"
    SAD = "sad"
    ANGRY = "angry"
    COOL = "cool"
    
class MessageReact(models.Model):
    from_user = models.ForeignKey(SocialUser, on_delete=models.CASCADE, related_name="reactions")
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name="reactions")
    reaction = models.CharField(max_length=10, choices=Reactions.choices)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('from_user', 'message')

class Notification(models.Model):
    to_user = models.ForeignKey(SocialUser, on_delete=models.CASCADE, related_name="notifications")
    from_user = models.ForeignKey(SocialUser, on_delete=models.CASCADE, related_name="notifications_from_user")
    content = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    
    
# ========== validations ==========
class BaseMessageRecive(BaseModel):
    to_user: PositiveInt
    from_user: PositiveInt

class MessageReceiveForSend(BaseMessageRecive):
    event_type: Literal['send']
    message: str
    replying_to: Annotated[int, annotated_types.Ge(0)] = 0
    
class MessageReciveForDelete(BaseMessageRecive):
    event_type: Literal['delete']
    id: PositiveInt
    
class MessageReactReceive(BaseModel):
    event_type: Literal['react']
    message_id: PositiveInt
    reaction: Reactions
