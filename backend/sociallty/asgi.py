"""
ASGI config for sociallty project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sociallty.settings')
django.setup()

from channels.security.websocket import AllowedHostsOriginValidator
from channels.routing import ProtocolTypeRouter, URLRouter
from chat.middlewares import AccessTokenAuthMiddleware
from django.core.asgi import get_asgi_application
from channels.auth import AuthMiddlewareStack
from chat.routes import websocket_urlspattern

asgi_application = get_asgi_application()

application = ProtocolTypeRouter({
    "http": asgi_application,
    "websocket": AllowedHostsOriginValidator(
        AccessTokenAuthMiddleware(
            AuthMiddlewareStack(
                URLRouter(websocket_urlspattern)
            )
        )
    )
})