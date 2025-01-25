from django.urls import path
from . import views


urlpatterns = (
    path("today-posts/", views.PostsApi.as_view(), name='get-posts'),
    path("post/<int:postID>/", views.PostApi.as_view(), name='post-info'),
    path("post-edit/<int:postID>/", views.EditPostAPI.as_view()),
    path("see-user-friends/", views.SeeUserFirendsApi.as_view()),
    path("social-users/", views.SocialUsersApi.as_view()),
)
