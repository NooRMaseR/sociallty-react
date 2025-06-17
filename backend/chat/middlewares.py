from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async

class AccessTokenAuthMiddleware:
    """
    Custom middleware that authenticate the user by access token from the query string.
    """

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        try:
            if not (scope.get('user') and scope['user'].is_authenticated):
                    
                protocols: list = scope.get("subprotocols", [])
                if len(protocols) > 0:
                    token = protocols[0]
                    scope['org_subprotocols'] = token
                    token = token.removesuffix(token[0:5])
                    
                    scope['user'] = await get_user(token.encode())
        except Exception as e:
            print("token middleware => ", repr(e))
            scope['user'] = AnonymousUser()
            
        return await self.app(scope, receive, send)


@database_sync_to_async
def get_user(token: bytes):
    return auth_jwt_token(token)

def auth_jwt_token(token: bytes):
    auth = JWTAuthentication()
    access = auth.get_validated_token(token)
    return auth.get_user(access)