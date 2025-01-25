import testable_content as Test
from django.urls import reverse
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework.response import Response

from users.models import SocialUser
from main_page.models import Post

# Create your tests here.

class MyTest(TestCase):

    def setUp(self) -> None:
        self.client = APIClient()
        self.user_data: dict[str, str] = Test.get_random_fake_user_data()
        self.user: SocialUser = Test.create_user(**self.user_data)
        self.client.force_authenticate(user=self.user)
        
        posts: list[Post] = []
        for i in range(30):
            posts.append(Post(user=self.user, description=f"test post number {i}"))
            
        Post.objects.bulk_create(posts)

    def test_get_post_page(self) -> None:
        response: Response = self.client.get(reverse("post", args=["1"])) # type: ignore
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "test post number 0")
        self.assertContains(response, "public")

    def test_bad_get_post_page(self) -> None:
        response: Response = self.client.get(reverse("post", args=["70"])) # type: ignore
        self.assertEqual(response.status_code, 404)
        
    
    def test_bad_post(self) -> None:
        response: Response = self.client.post( # type: ignore
            reverse('post'),
            {"desc": "this is a testable post number 2", "visibility": "nothing"}
        )
        self.assertEqual(response.status_code, 400)

    def test_good_post(self) -> None:
        response: Response = self.client.post( # type: ignore
            reverse('post'),
            {"desc": "this is a testable post number 3", "visibility": "friends only"}
        )
        self.assertEqual(response.status_code, 201)

    def test_get(self) -> None:
        response: Response = self.client.get(reverse('post', args="1")) # type: ignore
        self.assertEqual(response.status_code, 200)
        
    def test_get_not_authed(self) -> None:
        self.client.logout()
        response: Response = self.client.get(reverse('post', args="1")) # type: ignore
        self.assertEqual(response.status_code, 401)

    def test_put(self) -> None:
        response: Response = self.client.put( # type: ignore
            reverse('post'),
            {
                "postID": 1,
                "desc": "edited text",
                "visibility": "private"
            },
        )
        self.assertEqual(response.status_code, 200)
    
    def test_bad_put(self) -> None:
        response: Response = self.client.put( # type: ignore
            reverse('post'),
            {
                "postID": 1,
                "desc": "edited text",
                "visibility": "pu"
            },
        )
        self.assertEqual(response.status_code, 400)

    def test_delete(self) -> None:
        response: Response = self.client.delete(reverse('post'), {"postID": 1}) # type: ignore
        self.assertEqual(response.status_code, 200)
