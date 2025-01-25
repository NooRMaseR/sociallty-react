from rest_framework.response import Response
from rest_framework.test import APIClient
from django.test import TestCase
from django.urls import reverse

import testable_content as Test


# Create your tests here.
class test(TestCase):

    def setUp(self) -> None:
        self.client = APIClient()
        self.user_data: dict[str, str] = Test.get_fake_user_data()
        self.user: Test.SocialUser = Test.create_user(**self.user_data)
        self.client.force_authenticate(self.user)
        
    def test_get_posts(self) -> None:
        response: Response = self.client.get(reverse('get-posts')) # type: ignore
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'has_next')
        self.assertLessEqual(len(response.data['posts']), 10) # type: ignore

