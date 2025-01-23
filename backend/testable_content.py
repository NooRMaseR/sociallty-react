from users.models import SocialUser
from faker import Faker


def get_fake_user_data() -> dict[str, str]:
    return {
        "first_name": "ali",
        "last_name": "james",
        "username": "ali james",
        "email": "ali@gmail.com",
        "password": "ali111213",
        "birth": "2005-2-13",
        "phone": "+211033337509",
    }


def get_random_fake_user_data(password_length: int = 8) -> dict[str, str]:
    fake_data = Faker()
    first_name: str = fake_data.first_name()
    last_name: str = fake_data.last_name()
    return {
        "first_name": first_name,
        "last_name": last_name,
        "username": f"{first_name} {last_name}",
        "email": fake_data.email(),
        "password": fake_data.password(password_length),
        "birth": str(fake_data.date_of_birth()),
        "phone": fake_data.phone_number(),
    }


def create_user(**user_data) -> SocialUser:
    return SocialUser.objects.create(**user_data)

