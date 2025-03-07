from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import Post, PostContent

# Register your models here.


@admin.register(Post)
class PostModel(ModelAdmin):
    list_display = ("user", "description", "visibility", "created_at")
    list_filter = ("visibility", "user", "created_at")
    search_fields = ("user__username", "description")
    search_help_text = "search by post username or description"


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
