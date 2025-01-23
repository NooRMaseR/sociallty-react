from django.urls import path
from . import views

urlpatterns = (
    path("user/", views.UserAuthAPI.as_view(), name="user-op"), 
    path("post-comment/<int:ID>", views.PostCommentAPI.as_view(), name="post-comment"),
    path("add-comment-like/<int:comment_id>", views.add_comment_like, name="add-commant-like"),
    path("post/", views.PostApi.as_view(), name="post"),
    path("post/<int:postID>", views.PostApi.as_view(), name="post"),
    path("change-user-profile/", views.edit_user_profile, name="change-user-profile"),
    path("add-post-like/<int:postID>", views.add_like, name="add-post-like"),
    path("remove-user/", views.remove_user, name="remove-user"),
    path("get-basic-user/", views.get_basic_user_data, name="get-basic-user"),
    path("get-full-user/", views.get_full_user_data, name="get-full-user"),
    path("set-new-password/", views.set_new_user_password, name="set-new-password"),
)
