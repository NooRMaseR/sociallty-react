from main_page.models import Comment, Post, PostContent
from rest_framework import serializers
from users.models import SocialUser
from django.db.models import Count


class SocialUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialUser
        fields = "__all__"


class SocialUserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialUser
        fields = (
            "id",
            "first_name",
            "last_name",
            "username",
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
    class Meta:
        model = SocialUser
        fields = (
            "id",
            "first_name",
            "last_name",
            "username",
            "profile_picture"
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
    class Meta:
        model = SocialUser
        fields = (
            "id",
            "first_name",
            "last_name",
            "username",
            "bio",
            "birth",
            "profile_picture",
            "phone",
            'friends_count',
        )