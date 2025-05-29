from drf_yasg import openapi
from django.db.models import Q
from asgiref.sync import sync_to_async
from rest_framework.request import Request
from django.core.paginator import Paginator
from rest_framework.response import Response
from adrf.views import APIView as AsyncAPIView
from drf_yasg.utils import swagger_auto_schema
from django.shortcuts import get_object_or_404

from APIs.serializers import MessageSerializer, SocialUserOnlySerializer
from users.models import SocialUser
from .models import Message
import asyncio

# Create your views here.

class UserMessagesApi(AsyncAPIView):
    
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                "user_id",
                openapi.IN_PATH,
                type=openapi.TYPE_INTEGER,
                description="The ID of the user to chat with",
            ),
            openapi.Parameter(
                "page",
                openapi.IN_QUERY,
                type=openapi.TYPE_INTEGER,
                description="The page number to get (paginator)",
                default=1
            )
        ],
        responses={
            200: "Success",
            404: "Somthing Not Found"
        },
    )
    async def get(self, request: Request, user_id: int) -> Response:
        """
        Get messages between the current user and the user with the given ID.
        
        Args:
            request (Request): The HTTP request object.
            user_id (int): The ID of the user to chat with.
            
        Returns:
            A response object containing the messages and the user to chat with.
        """

        user_to_chat, page_num = await asyncio.gather(
            sync_to_async(lambda: get_object_or_404(SocialUser.objects.only("id", "username", "first_name", "last_name", "profile_picture"), id=user_id))(),
            sync_to_async(lambda: request.GET.get("page", 1))()
        )
        
        messages = await sync_to_async(lambda: (
            Message.objects
            .select_related("from_user", "to_user")
            .prefetch_related("reactions")
            .filter(Q(from_user__id=user_id, to_user=request.user) | Q(from_user=request.user, to_user__id=user_id))
            .order_by('-sent_at')
            )
        )()
        pg = Paginator(messages, 10)
        msgs_paginator = await sync_to_async(pg.get_page)(page_num)
        
        messages_serializer, user_serializer, has_more = await asyncio.gather(
            sync_to_async(lambda: MessageSerializer(msgs_paginator, many=True).data)(),
            sync_to_async(lambda: SocialUserOnlySerializer(user_to_chat).data)(),
            sync_to_async(msgs_paginator.has_next)()
        )
        return Response({"messages": messages_serializer, "user_to_chat": user_serializer, "has_more": has_more})
