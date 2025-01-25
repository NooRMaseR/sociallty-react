from testable_content import create_user, get_fake_user_data
from rest_framework.response import Response
from rest_framework.test import APIClient
from django.test import TestCase
from django.urls import reverse

# Create your tests here.
class TestUserApis(TestCase):
    
    def setUp(self) -> None:
        self.api = APIClient()
        self.data = get_fake_user_data()
        self.user = create_user(**self.data)
        self.api.force_authenticate(self.user)
        
    def test_create_same_user(self) -> None:
        res: Response = self.api.put(
            reverse('user-auth'),
            self.data
        ) # type: ignore
        self.assertEqual(res.status_code, 400)
        self.assertNotIn('access', res.data) # type: ignore
        self.assertNotIn('refresh', res.data) # type: ignore
        
    def test_bad_login(self) -> None:
        res: Response = self.api.post(reverse('user-auth'), {
            "email": 'ali',
            "password": 'ali',
        }) # type: ignore
        self.assertEqual(res.status_code, 400)
        self.assertDictEqual(res.data, {'error': 'email or password not found'}) # type: ignore
        
    def test_good_login(self) -> None:
        res: Response = self.api.post(reverse('user-auth'), {
            "email": self.data['email'],
            "password": self.data['password'],
        }) # type: ignore
        self.assertEqual(res.status_code, 200)
        self.assertIn('access', res.data) # type: ignore
        self.assertIn('refresh', res.data) # type: ignore
        
    def test_user_settings(self) -> None:
        res: Response = self.api.get(reverse('user-settings')) # type: ignore
        
        self.assertEqual(res.status_code, 200)
        self.assertIn('is_private_account', res.data) # type: ignore
        self.assertDictEqual({'is_private_account': False}, res.data) # type: ignore