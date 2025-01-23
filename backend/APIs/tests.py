import testable_content as Test
from django.test import TestCase
from django.http import HttpResponse
from rest_framework.test import APIClient

from users.models import SocialUser

# Create your tests here.

class MyTest(TestCase):

    def setUp(self) -> None:
        self.client = APIClient()
        self.user_data: dict[str, str] = Test.get_random_fake_user_data()
        self.user: SocialUser = Test.create_user(**self.user_data)
        self.client.force_authenticate(user=self.user)
        self.url = "/api/post/"
        self.client.post(
            self.url,
            {"desc": "this is a testable post", "visibility": "public"},
            "multipart",
        )

    def test_bad_post(self) -> None:
        response: HttpResponse = self.client.post(
            self.url,
            {"desc": "this is a testable post number 2", "visibility": "nothing"},
            "multipart",
        )
        self.assertEqual(response.status_code, 400)

    def test_good_post(self) -> None:
        response: HttpResponse = self.client.post(
            self.url,
            {"desc": "this is a testable post number 3", "visibility": "friends only"},
            "multipart",
        )
        self.assertEqual(response.status_code, 201)

    def test_get(self) -> None:
        response: HttpResponse = self.client.get(f"{self.url}1")
        self.assertEqual(response.status_code, 200)
        
    def test_get_not_authed(self) -> None:
        self.client.logout()
        response: HttpResponse = self.client.get(f"{self.url}1")
        self.assertEqual(response.status_code, 403)

    def test_put(self) -> None:
        response: HttpResponse = self.client.put(
            self.url,
            {
                "postID": 1,
                "desc": "edited text",
                "visibility": "public"
            },
        )
        self.assertEqual(response.status_code, 200)
    
    def test_bad_put(self) -> None:
        response: HttpResponse = self.client.put(
            self.url,
            {
                "postID": 1,
                "desc": "edited text",
                "visibility": "pu"
            },
        )
        self.assertEqual(response.status_code, 400)

    def test_delete(self) -> None:
        response: HttpResponse = self.client.delete(self.url, {"postID": 1})
        self.assertEqual(response.status_code, 200)
