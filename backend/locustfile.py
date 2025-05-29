from locust import HttpUser, task

class HelloWorldUser(HttpUser):
    target = "NooR%20MaseR/64/"
    
    def on_start(self) -> None:
        self.client.headers = {"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQ4NjM5NjgxLCJpYXQiOjE3NDg2MTgwODEsImp0aSI6IjNhMzRiNGQyNWUzZDRhZmViODhlYWI0ZmQ3OWM3NmNjIiwidXNlcl9pZCI6NjR9.zA-DUZ6jAyO-GzspczvOKllop4IO-GzrF2z6xdBWp7M"}
    
    @task
    def async_user_profile_api(self):
        self.client.get(f"/user/{self.target}")
        
    @task
    def user_main_page_api(self):
        self.client.get(f"/today-posts/")
