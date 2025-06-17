from locust import HttpUser, task

class HelloWorldUser(HttpUser):
    # target = "NooR%20MaseR/64/"
    
    def on_start(self) -> None:
        self.client.headers = {"authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUwMTI2MDMwLCJpYXQiOjE3NTAxMDQ0MzAsImp0aSI6ImY0NzI5ZDg4NzUxMDQxOTk5YmExYzBlMTZjOGZhZmNhIiwidXNlcl9pZCI6NjR9.DtNzn_1ynYDXXA8AFQN8BTL67XWC4FVQ1QHhegcSiL4"}
    
    @task
    def async_user_posts_ninja(self):
        self.client.get(f"/ninja/main/today-posts")

    @task
    def user_main_page_api(self):
        self.client.get(f"/today-posts/")
