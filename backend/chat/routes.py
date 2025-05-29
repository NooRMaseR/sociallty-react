from django.urls import path
from . import consumers

websocket_urlspattern = (
    path("ws/chat/<str:channel_name>/<int:channel_id>/", consumers.ChatConsumer.as_asgi()),
)


