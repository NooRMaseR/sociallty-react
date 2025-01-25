from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.views import APIView
from rest_framework import status

from django.template.loader import render_to_string
from django.shortcuts import get_object_or_404
from django.core.paginator import Paginator
from django.core.mail import send_mail
from django.db.models import Count
from django.db import transaction
from django.contrib import auth


from APIs.serializers import (
    SocialUserSettingsSerializer,
    UserProfileSerializer,
    SocialUserSerializer,
    PostSerializer,
)
from utils.main_utils import generate_verify_code
from .models import SocialUser, UserCode


class UserApi(APIView):
    
    def get(self, request: Request, username: str, id: int) -> Response:
        user = get_object_or_404((
            SocialUser
            .objects
            .prefetch_related("posts", "posts__likes", "posts__media", "posts__comments")
            .annotate(friends_count=Count('friend'))
        ), id=id, username=username)
        
        posts = user.posts.annotate( # type: ignore
            comments_count=Count('comments'),
            likes_count=Count('likes')
        ).order_by("-created_at")
        
        paginator = Paginator(posts, '10')
        post_page = paginator.get_page(request.GET.get('page', 1))
        
        is_friend = user.friend.filter(user=request.user).exists() # type: ignore
        
        user_serializer = UserProfileSerializer(user)
        post_serializer = PostSerializer(post_page, many=True)
        
        return Response({
            "user": user_serializer.data,
            "posts": post_serializer.data,
            "is_friend": is_friend,
            "has_next": post_page.has_next()
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
        return Response({'access': str(refresh_token.access_token), 'refresh': str(refresh_token), 'id': user.pk, "username": user.username})
    
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
            return Response({"verified": False, "details": "user not found"}, status=status.HTTP_404_NOT_FOUND)
        except UserCode.DoesNotExist:
            return Response({"verified": False, "details": "code not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"verified": False, "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    @transaction.atomic
    def put(self, request: Request) -> Response:
        "changing the user password"
        
        password = request.data.get("password")  # type: ignore
        confirm_password = request.data.get("confirm_password")  # type: ignore
        email = request.data.get("email") # type: ignore
        
        if password != confirm_password:
            return Response({"details": "passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user: SocialUser = SocialUser.objects.get(email=email)
            user.set_password(password)
            user.save()
            return Response(status=200)
        except SocialUser.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
