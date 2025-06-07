from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from channels.testing import WebsocketCommunicator
from .consumers import ChatConsumer

# Create your tests here.
class Test(TestCase):
    def setUp(self) -> None:
        self.api = APIClient()
        self.respone = self.api.put(reverse("user-auth"), {"username":"testuser", "password":"testpassword", "email":"testuser@test.com", "first_name":"test", "last_name":"user", "phone":"+201234567890"})
        self.data = self.respone.json() # type: ignore
        return super().setUp()
    
    async def test_chat_connect(self):
        communicator = WebsocketCommunicator(
            application=ChatConsumer.as_asgi(),
            path=f"/ws/chat?id={self.data['id']}&username={self.data['username']}&token={self.data['access']}/",
        )
        connected, _ = await communicator.connect()
        self.assertTrue(connected)
        await communicator.disconnect()
