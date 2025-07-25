from chat.models import Message, MessageReact, Notification
from main_page.models import Comment, Post, PostContent
from users.models import SocialUser, SocialUserSettings
from rest_framework import serializers


class SocialUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialUser
        fields = "__all__"
        
        
class SocialUserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialUserSettings
        fields = (
            "is_private_account",
        )


class SocialUserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialUser
        fields = (
            "id",
            "first_name",
            "last_name",
            "username",
            "gender",
            "bio",
            "birth",
            "profile_picture",
            "is_active",
            "last_login",
        )
        extra_kwargs = {"password": {'write_only': True}}
        

class SocialUserLoginSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialUser
        fields = ('id', 'username', 'password')
        extra_kwargs = {"password": {'write_only': True}}

class PostContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostContent
        fields = "__all__"
        
class SocialUserOnlySerializer(serializers.ModelSerializer):
    last_message = serializers.CharField(read_only=True, default=None)
    last_message_from_id = serializers.IntegerField(read_only=True, default=None)
    reported = serializers.BooleanField(default=False)
    class Meta:
        model = SocialUser
        fields = (
            "id",
            "first_name",
            "last_name",
            "username",
            "gender",
            "profile_picture",
            "last_message",
            "last_message_from_id",
            "reported",
        )

class CommentSerializer(serializers.ModelSerializer):
    user = SocialUserOnlySerializer(read_only=True)
    comment_likes = serializers.IntegerField(source='comment_likes_count', read_only=True)

    class Meta:
        model = Comment
        fields = (
            "id",
            "content",
            "created_at",
            "user",
            "user_id",
            "comment_likes"
        )
        
class PostSerializer(serializers.ModelSerializer):
    media = PostContentSerializer(read_only=True, many=True)
    user = SocialUserBasicSerializer(read_only=True)
    comments_count = serializers.IntegerField(read_only=True)
    likes_count = serializers.IntegerField(read_only=True)
    class Meta:
        model = Post
        fields = "__all__"


class UserProfileSerializer(serializers.ModelSerializer):
    friends_count = serializers.IntegerField(read_only=True)
    settings = SocialUserSettingsSerializer()
    class Meta:
        model = SocialUser
        fields = (
            "id",
            "first_name",
            "last_name",
            "username",
            "gender",
            "bio",
            "birth",
            "profile_picture",
            "phone",
            'friends_count',
            'settings',
        )
        
class MessageReactSerializer(serializers.ModelSerializer):
    from_user = SocialUserOnlySerializer(read_only=True)
    class Meta:
        model = MessageReact
        fields = "__all__"

class ReplySerializer(serializers.ModelSerializer):
    from_user = SocialUserOnlySerializer(read_only=True)
    to_user = SocialUserOnlySerializer(read_only=True)
    class Meta:
        model = Message
        exclude = ("replied_to", )

class MessageSerializer(serializers.ModelSerializer):
    from_user = SocialUserOnlySerializer(read_only=True)
    to_user = SocialUserOnlySerializer(read_only=True)
    reactions = MessageReactSerializer(read_only=True, many=True)
    replied_to = ReplySerializer(read_only=True)
    class Meta:
        model = Message
        fields = "__all__"

class NotificationSerializer(serializers.ModelSerializer):
    to_user = SocialUserOnlySerializer(read_only=True)
    from_user = SocialUserOnlySerializer(read_only=True)
    content = serializers.CharField(read_only=True)
    class Meta:
        model = Notification
        fields = "__all__"
