from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import Comment, Like, Post, PostContent

# Register your models here.


@admin.register(Post)
class PostModel(ModelAdmin):
    list_display = ("user", "description", "visibility", "created_at")
    list_filter = ("visibility", "user", "created_at")
    search_fields = ("user__username", "description")
    search_help_text = "search by post username or description"
    list_per_page = 50


@admin.register(PostContent)
class PostContentModel(ModelAdmin):
    list_display = (
        "post",
        "image",
        "video",
        "content_type",
        "full_content_type",
        "poster",
    )
    list_filter = ("content_type","full_content_type","post",)
    search_fields = ("post__description",)
    search_help_text = "search by post description"
    list_per_page = 50
    
@admin.register(Like)
class LikeModel(ModelAdmin):
    list_display = ("user", "post", "created_at")
    list_filter = ("user", "post")
    list_per_page = 50

@admin.register(Comment)
class CommentModel(ModelAdmin):
    list_display = ("user", "content", "post", "created_at")
    list_filter = ("user", "post")
    list_per_page = 50
