from django.urls import path
from . import views

urlpatterns = ( 
    path("post-comment/<int:ID>", views.PostCommentAPI.as_view(), name="post-comment"),
    path("add-comment-like/<int:comment_id>", views.add_comment_like, name="add-commant-like"),
    path("post/", views.PostApi.as_view(), name="post"),
    path("post/<int:postID>", views.PostApi.as_view(), name="post"),
    path("add-post-like/<int:postID>", views.add_like, name="add-post-like"),
    path("remove-user/", views.remove_user, name="remove-user"),
)
