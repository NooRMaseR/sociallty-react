from django.urls import path
from . import views


urlpatterns = (
    path("today-posts/", views.PostsApi.as_view()),
    path("edit-profile/", views.edit_user_profile_page, name="edit-profile"),
    path("see-user-friends/", views.SeeUserFirendsApi.as_view(), name="see-user-friends"),
    path("social-users/", views.SocialUsersApi.as_view(), name="social-friends"),
    path("post/<int:postID>/", views.PostApi.as_view()),
    path("post-edit/<int:postID>/", views.EditPostAPI.as_view()),
    path('user/<str:username>/<int:id>/', views.UserApi.as_view()),
    path("get-support/", views.support_view, name="AI-view"),
    path("settings/", views.settings, name="settings"),
)
