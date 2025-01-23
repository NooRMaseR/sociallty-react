from django.test import TestCase, Client
from django.http import HttpResponse
from django.urls import reverse

import testable_content as Test
from main_page.models import Post


# Create your tests here.
class test(TestCase):

    def setUp(self) -> None:
        self.client = Client()
        self.user_data: dict[str, str] = Test.get_fake_user_data()
        self.user: Test.SocialUser = Test.create_user(**self.user_data)
        Post.objects.create(user=self.user, description="test post")

    def test_get_home(self) -> None:
        response: HttpResponse = self.client.get("/")
        self.assertEqual(response.status_code, 302)  # redirect

    def test_get_post_page(self) -> None:
        url: str = reverse("post", args=["1"])
        response: HttpResponse = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "test post")
        self.assertContains(response, "public")

    def test_bad_get_post_page(self) -> None:
        url: str = reverse("post", args=["3"])
        response: HttpResponse = self.client.get(url)
        self.assertEqual(response.status_code, 404)
