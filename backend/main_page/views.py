from django.shortcuts import get_object_or_404
from django.core.paginator import Paginator
from django.db.models import Q, Count
from django.db import transaction

from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.views import APIView
from rest_framework import status

from APIs.serializers import PostSerializer, SocialUserOnlySerializer
from users.models import SocialUser, Friend
from .models import Post

# from icecream import ic #! for debugging

# * Todo: let the user be able to edit his profile ✔
# * Todo: display in the social user profile add friend button if he is not friends, otherwise add remove friend ✔
# * Todo: display in the user profile how many friends ✔
# * Todo: add some animations to the comments and likes ✔
# * Todo: add some icons instead of text when you renew your internet ✔
# * Todo: add darkmode ✔
# * Todo: add Restfull API to control the api ✔
# * Todo: add video support ✔
# * Todo: change the login algorithm ✔
# * Todo: change the signup algorithm ✔
# Todo: send a code via gmail to verify if the user is realy want's to change his password
# ? Todo: send a code via gmail to verify if the user is realy want's to remove his account
# Todo: let the users see the likers
# Todo last: boost the performance by lower the files per request and lower the reslution of the images and videos to save some space and lower the request internet


# Create your views here.

class PostsApi(APIView):
    "`restAPi` used for home page to paginate the posts"
    
    def get(self, request: Request) -> Response:
        # getting all user friends usernames
        friends_usernames = (
            Friend.objects
            .select_related("friend")
            .only('friend__username')
            .filter(Q(user=request.user) | Q(friend=request.user))
            .values_list("friend__username", flat=True)
            .iterator(10)
        )

        # getting the posts of the user, the posts must be public or friends only
        posts = Post.objects.select_related("user").prefetch_related("likes", "media", "comments").filter(
            Q(visibility="public")  # get all posts with visibillty public or
            | Q(user=request.user)  # get the user itself posts or
            | (Q(user__username__in=friends_usernames) & Q(visibility=Post.PostVisibility.FRIENDS_ONLY))  # get the friends posts and check if the visibility is friends only, the public posts is already defined
        ).annotate(
            comments_count=Count('comments'),
            likes_count=Count('likes')
        ).order_by(
            "-created_at"
        )  # order by created_at desc
        
        pagenator = Paginator(posts, 10)
        pagenator_data = pagenator.get_page(request.GET.get('page', 1))
        
        post_serialiizer = PostSerializer(pagenator_data, many=True)
        return Response({"has_next": pagenator_data.has_next(), "posts": post_serialiizer.data})


class PostApi(APIView):
    "`restApi` used for grtting one post only"
    
    def get(self, _: Request, postID: int) -> Response:
        POST: Post = get_object_or_404(Post.objects.select_related("user").prefetch_related("media", "likes", "comments"), id=postID)
        post_serializer = PostSerializer(POST)
        
        return Response(post_serializer.data)
    
    
class EditPostAPI(APIView):
    
    def get(self, request: Request, postID: int) -> Response:
        POST: Post = get_object_or_404(Post.objects.select_related("user").prefetch_related("media", "likes", "comments"), id=postID)
        
        if POST.user.pk != request.user.pk:
            return Response(status=status.HTTP_403_FORBIDDEN)
        
        post_serializer = PostSerializer(POST)
        return Response(post_serializer.data)
    

class SeeUserFirendsApi(APIView):
    
    def get(self, request: Request) -> Response:
        friends_usernames = (
            Friend.objects
            .select_related("friend")
            .only("friend__username")
            .filter(user=request.user)
            .values_list("friend__username", flat=True)
        )

        friends = SocialUser.objects.filter(username__in=friends_usernames)
        
        paginator = Paginator(friends, 10)
        friends_page = paginator.get_page(request.GET.get('list', 1))
        friends_serializer = SocialUserOnlySerializer(friends_page, many=True)
        return Response({"users": friends_serializer.data, "has_next": friends_page.has_next()}, status=status.HTTP_200_OK)
    

class SocialUsersApi(APIView):
    
    def get(self, request: Request) -> Response:
        user_friends = (
            Friend.objects
            .select_related("friend")
            .only("friend__username")
            .filter(user=request.user)
            .values_list("friend__username", flat=True)
        )
        users = SocialUser.objects.exclude(
            Q(is_staff=True)
            | Q(username__in=user_friends)
            | Q(id=request.user.id)  # type: ignore
        )
        
        paginator = Paginator(users, 10)
        users_page = paginator.get_page(request.GET.get('list', 1))
        
        users_serializer = SocialUserOnlySerializer(users_page, many=True)
        return Response({"users": users_serializer.data, "has_next": users_page.has_next()}, status=status.HTTP_200_OK)
    
    @transaction.atomic
    def post(self, request: Request) -> Response:
        """
        `(API)` for adding a friend
        """
        friendID = request.data.get('friendID') # type: ignore
        
        if not friendID:
            return Response({"details": "friend ID was not provided"}, status=status.HTTP_400_BAD_REQUEST)

        friend = get_object_or_404(SocialUser.objects.only('id'), id=friendID)
        friends: tuple[Friend, Friend] = (Friend(user=request.user, friend=friend), Friend(user=friend, friend=request.user))
        
        Friend.objects.bulk_create(friends, ignore_conflicts=True)
        return Response(status=status.HTTP_201_CREATED)
    
    @transaction.atomic
    def delete(self, request: Request) -> Response:
        """
        `(API)` for removing a friend

        Args:
            friend: the friend username followed by id
        """
        friendID = request.data.get('friendID') # type: ignore

        if not friendID:
            return Response({"details": "friend ID was not provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        friend = get_object_or_404(SocialUser.objects.only('id'), id=friendID)
        Friend.objects.filter(Q(user=request.user, friend=friend) | Q(user=friend, friend=request.user)).delete()
        return Response(status=200)
