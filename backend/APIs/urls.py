from django.urls import path
from . import views

urlpatterns = ( 
    path("post-comment/<int:ID>", views.PostCommentAPI.as_view(), name="post-comment"),
    path("add-comment-like/<int:comment_id>", views.CommentLikeAPI.as_view(), name="add-commant-like"),
    path("post/", views.PostApi.as_view(), name="post-get"),
    path("post/<int:postID>", views.PostApi.as_view(), name="post"),
    path("add-post-like/<int:postID>", views.PostLikeAPI.as_view(), name="add-post-like"),
    path("remove-user/", views.RemoveUserAPI.as_view(), name="remove-user"),
)
