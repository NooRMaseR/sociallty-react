from django.db.models import Q, Count, Subquery, OuterRef
from django.shortcuts import get_object_or_404
from django.core.paginator import Paginator
from django.db import transaction

from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.views import APIView
from rest_framework import status

from APIs.serializers import PostSerializer, SocialUserOnlySerializer
from users.models import SocialUser, Friend, FriendRequest
from chat.models import Message
from .models import Post

# Create your views here.

class PostsApi(APIView):
    "`restAPi` used for home page (getting the posts)"
    
    def get(self, request: Request) -> Response:
        # getting all user friends ids
        friends_ids = (
            Friend.objects
            .select_related("friend")
            .only('id', 'friend__id', "friend__id", "user__id")
            .filter(Q(user=request.user) | Q(friend=request.user))
            .values_list("friend__id", flat=True)
            .iterator(10)
        )

        # getting the posts of the user, the posts must be public or friends only
        posts = Post.objects.select_related("user").prefetch_related("media").filter(
            Q(visibility=Post.PostVisibility.PUBLIC)  # get all posts with visibillty public or
            | Q(user=request.user)  # get the user itself posts or
            | (Q(user__id__in=friends_ids) & Q(visibility=Post.PostVisibility.FRIENDS_ONLY)), # get the friends posts and check if the visibility is friends only, the public posts is already defined
            
            ready=True # only get the posts that are ready
        ).annotate(
            comments_count=Count('comments', distinct=True),
            likes_count=Count('likes', distinct=True)
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
        POST: Post = get_object_or_404(Post.objects.select_related("user").prefetch_related("media"), id=postID)
        post_serializer = PostSerializer(POST)
        
        return Response(post_serializer.data)
    
    
class EditPostAPI(APIView):
    "`restApi` used for editing a post (get the post and then edit it in another request)"
    
    def get(self, request: Request, postID: int) -> Response:
        POST: Post = get_object_or_404(Post.objects.select_related("user").prefetch_related("media"), id=postID)
        
        if POST.user.pk != request.user.pk:
            return Response(status=status.HTTP_403_FORBIDDEN)
        
        post_serializer = PostSerializer(POST)
        return Response(post_serializer.data)
    

class SeeUserFirendsApi(APIView):
    "`restApi` used for getting the user friends"
    
    def get(self, request: Request) -> Response:
        
        friends_ids = (
            Friend.objects
            .select_related("friend")
            .only("id", "friend__id")
            .filter(user=request.user)
            .values_list("friend__id", flat=True)
        )
        if request.GET.get("request-type") == "with-message":
            last_message_subquery = (
                Message.objects
                .only("id", "message", "from_user")
                .filter(
                    Q(from_user_id=OuterRef("id"), to_user=request.user)
                    | Q(to_user_id=OuterRef("id"), from_user=request.user)
                )
                .order_by("-sent_at")
            )
            
            friends = (
                SocialUser.objects
                .filter(id__in=friends_ids)
                .annotate(
                    last_message=Subquery(last_message_subquery.values("message")[:1]),
                    last_message_from_id=Subquery(last_message_subquery.values("from_user_id")[:1])
                )
            )
        else:
            friends = SocialUser.objects.filter(id__in=friends_ids)
            
        paginator = Paginator(friends, 10)
        friends_page = paginator.get_page(request.GET.get('list', 1))
        friends_serializer = SocialUserOnlySerializer(friends_page, many=True)
        return Response({"users": friends_serializer.data, "has_next": friends_page.has_next()}, status=status.HTTP_200_OK)
    
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
        """
        friendID = request.data.get('friendID') # type: ignore

        if not friendID:
            return Response({"details": "friend ID was not provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        friend = get_object_or_404(SocialUser.objects.only('id'), id=friendID)
        Friend.objects.filter(Q(user=request.user, friend=friend) | Q(user=friend, friend=request.user)).delete()
        return Response(status=200)
    

class SeeFirendsRequestsApi(APIView):
    "`restApi` used for getting the user friends requests"
    
    def get(self, request: Request) -> Response:
        friends_requests = (
            FriendRequest.objects
            .select_related("friend")
            .filter(
                Q(friend__in = request.user.friend_request.all().values_list('friend', flat=True))
            )
        )
        friends = (
            SocialUser
            .objects
            .filter(user_request__in=friends_requests)
            .exclude(id=request.user.id)
        )
        paginator = Paginator(friends, 10)
        friends_page = paginator.get_page(request.GET.get('list', 1))
        friends_serializer = SocialUserOnlySerializer(friends_page, many=True)
        return Response({"users": friends_serializer.data, "has_next": friends_page.has_next()}, status=status.HTTP_200_OK)
    
    @transaction.atomic
    def delete(self, request: Request) -> Response:
        "`(API)` for removing a friend request"
        
        friendID = request.data.get('friendID') # type: ignore

        if not friendID:
            return Response({"details": "friend ID was not provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        friend = get_object_or_404(SocialUser.objects.only('id'), id=friendID)
        FriendRequest.objects.filter(Q(user=request.user, friend=friend) | Q(user=friend, friend=request.user)).delete()
        return Response(status=200)
    
    @transaction.atomic
    def put(self, request: Request) -> Response:
        "`(API)` to confirm the accepted friend request"
        
        friendID = request.data.get('friendID') # type: ignore

        if not friendID:
            return Response({"details": "friend ID was not provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        friend = get_object_or_404(SocialUser.objects.only('id'), id=friendID)
        
        friends: tuple[Friend, Friend] = (Friend(user=request.user, friend=friend), Friend(user=friend, friend=request.user))
        Friend.objects.bulk_create(friends, ignore_conflicts=True)
        get_object_or_404(FriendRequest, user=friend, friend=request.user).delete()
        
        return Response(status=status.HTTP_202_ACCEPTED)
    
    @transaction.atomic
    def post(self, request: Request) -> Response:
        """
        `(API)` for adding a friend
        """
        friendID = request.data.get('friendID') # type: ignore
        
        if not friendID:
            return Response({"details": "friend ID was not provided"}, status=status.HTTP_400_BAD_REQUEST)

        friend = get_object_or_404(SocialUser.objects.only('id'), id=friendID)
        if FriendRequest.objects.filter(Q(user=request.user, friend=friend) | Q(user=friend, friend=request.user)).exists():
            return Response(status=status.HTTP_406_NOT_ACCEPTABLE)
        
        FriendRequest.objects.create(user=request.user, friend=friend)
        return Response(status=status.HTTP_201_CREATED)
    

class SocialUsersApi(APIView):
    "`restApi` used for getting the social users"
    
    def get(self, request: Request) -> Response:
        user_friends = (
            Friend.objects
            .select_related("friend")
            .only('id', "friend__id")
            .filter(user=request.user)
            .values_list("friend__id", flat=True)
        )
        users = SocialUser.objects.exclude(
            Q(is_staff=True)
            | Q(id__in=user_friends)
            | Q(id=request.user.id)  # type: ignore
            | Q(friend_request__in = request.user.user_request.all())
            | Q(user_request__in = request.user.friend_request.all())
        )
        
        paginator = Paginator(users, 10)
        users_page = paginator.get_page(request.GET.get('list', 1))
        
        users_serializer = SocialUserOnlySerializer(users_page, many=True)
        return Response({"users": users_serializer.data, "has_next": users_page.has_next()}, status=status.HTTP_200_OK)
    
    @transaction.atomic
    def post(self, request: Request) -> Response:
        "`(API)` for adding a friend request"
        
        friendID = request.data.get('friendID') # type: ignore
        
        if not friendID:
            return Response({"details": "friend ID was not provided"}, status=status.HTTP_400_BAD_REQUEST)

        friend = get_object_or_404(SocialUser.objects.only('id'), id=friendID)
        if not FriendRequest.objects.filter(user=request.user, friend=friend).exists():
            FriendRequest.objects.create(user=request.user, friend=friend)
            return Response(status=status.HTTP_201_CREATED)
        
        return Response({'details': 'friend request already sent'}, status=status.HTTP_400_BAD_REQUEST)
