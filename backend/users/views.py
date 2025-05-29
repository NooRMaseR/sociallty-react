from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny
from adrf.views import APIView as AsyncAPIView
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.views import APIView
from rest_framework import status

from django.template.loader import render_to_string
from django.shortcuts import get_object_or_404
from django.core.paginator import Paginator
from django.core.mail import send_mail
from asgiref.sync import sync_to_async
from django.db.models import Count, Q
from django.db import transaction
from django.contrib import auth


from APIs.serializers import (
    NotificationSerializer,
    SocialUserSettingsSerializer,
    UserProfileSerializer,
    SocialUserSerializer,
    PostSerializer,
)
from .models import FriendRequest, SocialUser, UserCode
from utils.main_utils import generate_verify_code
from asgiref.sync import sync_to_async
from chat.models import Notification
import asyncio


class UserProfileApi(AsyncAPIView):
    
    async def get(self, request: Request, username: str, id: int) -> Response:
        """
        Get the profile of a user

        Args:
            request (Request): The HTTP request object.
            username (str): The username of the user to get the profile of.
            id (int): The id of the user to get the profile of.

        Returns:
            Response: The profile of the user.
        """
        
        user = await sync_to_async(get_object_or_404)(SocialUser.objects.prefetch_related("posts").select_related("settings").annotate(friends_count=Count('friend')), id=id, username=username)
        
        posts = await sync_to_async(lambda: user.posts.prefetch_related("media").select_related("user").annotate( # type: ignore
            comments_count=Count('comments', distinct=True),
            likes_count=Count('likes', distinct=True)
        ).order_by("-created_at"))()
        
        paginator = Paginator(posts, '10')
        post_page = await sync_to_async(paginator.get_page)(request.GET.get('page', 1))
        
        has_next: bool
        is_friend: bool
        has_request: bool
        user_serializer: UserProfileSerializer
        post_serializer: PostSerializer
        
        has_next, is_friend, has_request, user_serializer, post_serializer = await asyncio.gather(
            sync_to_async(post_page.has_next)(),
            user.friend.only("user__id", "friend__id").filter(Q(user=request.user) | Q(friend=request.user)).aexists(), # type: ignore
            FriendRequest.objects.only("user__id", "friend__id").filter(Q(user=request.user) | Q(friend=request.user)).aexists(),
            sync_to_async(lambda: UserProfileSerializer(user).data)(),
            sync_to_async(lambda: PostSerializer(post_page, many=True).data)()
        )
        
        return Response({
            "user": user_serializer,
            "posts": post_serializer,
            "is_friend": is_friend,
            "has_request": has_request,
            "has_next": has_next
        }, status=status.HTTP_200_OK)


class UserSettingsApi(APIView):
    
    def get(self, request: Request) -> Response:
        settings_serializer = SocialUserSettingsSerializer(request.user.settings)
        return Response(settings_serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request: Request) -> Response:
        settings_serializer = SocialUserSettingsSerializer(request.user.settings, data=request.data)
        if settings_serializer.is_valid():
            settings_serializer.save()
            return Response(status=status.HTTP_200_OK)
        
        return Response(settings_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserAuthAPI(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    
    @transaction.atomic
    def post(self, request: Request) -> Response:
        "`Restful API` for loging in"
        email = request.data.get("email")  # type: ignore
        password = request.data.get("password")  # type: ignore

        # autinticating the user
        user = auth.authenticate(request._request, email=email, password=password)
        if user is None:
            return Response({"error": "email or password not found"}, status=status.HTTP_400_BAD_REQUEST)
        
        if not user.is_active:
            return Response({"error": "This account is not Active, please contact us if you think this is a mistake"}, status=status.HTTP_403_FORBIDDEN)
        
        refresh_token = RefreshToken.for_user(user)
        auth.login(request._request, user)
        return Response(
            {
                'access': str(refresh_token.access_token), 
                'refresh': str(refresh_token), 
                'id': user.pk, 
                "username": user.username,
                "profile_picture": user.profile_picture.url # type: ignore
            }
        )
    
    @transaction.atomic
    def put(self, request: Request) -> Response:
        "`restful API` for creating a new account"

        serializer = SocialUserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            userOBJ: SocialUser = SocialUser.objects.get(email=request.data.get("email"))  # type: ignore
            userOBJ.set_password(request.data.get("password"))  # type: ignore
            userOBJ.is_active = True
            userOBJ.save()

            tokens = RefreshToken.for_user(userOBJ)
            data = serializer.data
            data['refresh'] = str(tokens) # type: ignore
            data['access'] = str(tokens.access_token) # type: ignore
            
            return Response(data, status=200)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EditUserApi(APIView):
    
    def get(self, request: Request) -> Response:
        user: SocialUser = get_object_or_404(SocialUser, id=request.user.id)
        serializer = SocialUserSerializer(user)

        return Response(serializer.data, status=200)
    
    @transaction.atomic
    def put(self, request: Request) -> Response:
        user: SocialUser = get_object_or_404(SocialUser, id=request.user.id)
        
        if not user.check_password(request.data.get("password")):  # type: ignore
            return Response({'deails': 'password incorrect'}, status=status.HTTP_400_BAD_REQUEST)
        
        user_serializer = SocialUserSerializer(user, data=request.data)
        if user_serializer.is_valid():
            user_serializer.validated_data['is_active'] = True # type: ignore
            user_serializer.validated_data.pop('password') # type: ignore
            user_serializer.save()
            refresh_token = RefreshToken.for_user(user)
            return Response({'access': str(refresh_token.access_token), 'refresh': str(refresh_token), "username": user.username})
        else:
            return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @transaction.atomic
    def delete(self, request: Request) -> Response:
        if request.user.check_password(request.data.get('password')): # type: ignore
            request.user.delete()
            return Response(status=status.HTTP_200_OK)
        
        return Response({'details': 'Wrong Password'}, status=status.HTTP_400_BAD_REQUEST)

class UserForgotPasswordApi(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    
    @transaction.atomic
    def post(self, request: Request) -> Response:
        "getting the code to verify the user email"
        
        user: SocialUser = get_object_or_404(SocialUser.objects.only('id', 'email', 'username'), email=request.data.get("email")) # type: ignore
        code: int | None = generate_verify_code()
        
        if code is None:
            return Response({"details": "could not generate code, please try again"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        UserCode.objects.update_or_create(user=user, defaults={"code": code})
            
        try:
            send_mail(
                "Password Reset",
                f"Reset your password",
                from_email=None,
                recipient_list=[user.email],
                html_message=render_to_string('forget-password-mail.html', {"user": user, "code": code}),
                fail_silently=False
            )
            return Response({"code": code}, status=200)
        except Exception as e:
            print(repr(e))
            return Response({"details": 'could not send email'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @transaction.atomic
    def delete(self, request: Request) -> Response:
        "verifying the user code"
        
        code = request.data.get("code")  # type: ignore
        email = request.data.get("email")  # type: ignore
        
        try:
            user: SocialUser = SocialUser.objects.get(email=email)
            user_code: UserCode = UserCode.objects.get(user=user, code=code)
            user_code.delete()
            return Response({"verified": True}, status=200)
        except SocialUser.DoesNotExist:
            return Response({"verified": False, "detail": "user not found"}, status=status.HTTP_404_NOT_FOUND)
        except UserCode.DoesNotExist:
            return Response({"verified": False, "code": "Invalid Code"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"verified": False, "detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    @transaction.atomic
    def put(self, request: Request) -> Response:
        "changing the user password"
        
        password = request.data.get("password")  # type: ignore
        confirm_password = request.data.get("confirm_password")  # type: ignore
        email = request.data.get("email") # type: ignore
        
        if password != confirm_password:
            return Response({"passwordError": "passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)
        
        user: SocialUser = get_object_or_404(SocialUser, email=email)
        user.set_password(password)
        user.save()
        return Response(status=200)


class GetUserNotification(AsyncAPIView):

    async def get(self, request: Request) -> Response:
        friends_requests_count, notifications = await asyncio.gather(
            FriendRequest.objects.filter(friend=request.user).acount(),
            sync_to_async(lambda: Notification.objects.filter(to_user=request.user).order_by('-created_at'))()
        )
        notifications_data = await sync_to_async(lambda: NotificationSerializer(notifications, many=True).data)()
        return Response({"friends_requests_count": friends_requests_count, "notifications": notifications_data})
    
    async def delete(self, request: Request) -> Response:
        id = request.data.get("id") # type: ignore
        if not id:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        try:
            await Notification.objects.filter(id=id).adelete()
            return Response(status=status.HTTP_200_OK)
        except Notification.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        