from locust import HttpUser, task
from dotenv import load_dotenv
import os

load_dotenv()
class HelloWorldUser(HttpUser):
    
    def on_start(self) -> None:
        self.client.headers = {"authorization": f"Bearer {os.getenv("TEST_AUTH")}"}
    
    @task
    def async_user_posts_ninja(self):
        self.client.get(f"/social-users/")

    @task
    def user_main_page_api(self):
        self.client.get(f"/today-posts/")
    
    @task
    def chat_page_api(self):
        self.client.get(f"/chat/68/")
